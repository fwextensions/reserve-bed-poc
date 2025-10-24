import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";

const HOLD_DURATION_MS = 30 * 1000; // 30 seconds

/**
 * Query to get active hold for a user
 * POC: Requires userId parameter
 * Requirements: 4.1
 */
export const getActiveHold = query({
	args: {
		userId: v.id("users"),
	},
	handler: async (ctx, args) => {
		const now = Date.now();

		// get holds for this case worker
		const holds = await ctx.db
			.query("holds")
			.withIndex("by_case_worker", (q) => q.eq("caseWorkerId", args.userId))
			.collect();

		// find active (non-expired) hold
		const activeHold = holds.find((hold) => hold.expiresAt > now);

		return activeHold || null;
	},
});

/**
 * Mutation to place a hold on a bed
 * POC: Requires userId parameter
 * Requirements: 4.1, 4.2, 4.3
 */
export const placeHold = mutation({
	args: {
		userId: v.id("users"),
		siteId: v.id("sites"),
		bedType: v.union(
			v.literal("apple"),
			v.literal("orange"),
			v.literal("lemon"),
			v.literal("grape")
		),
	},
	handler: async (ctx, args) => {
		const now = Date.now();

		// check if user already has an active hold
		const existingHolds = await ctx.db
			.query("holds")
			.withIndex("by_case_worker", (q) => q.eq("caseWorkerId", args.userId))
			.collect();

		const activeHold = existingHolds.find((hold) => hold.expiresAt > now);

		if (activeHold) {
			return {
				success: false,
				error: "You already have an active hold",
				code: "conflict" as const,
			};
		}

		// check bed availability
		const site = await ctx.db.get(args.siteId);
		if (!site) {
			return {
				success: false,
				error: "Site not found",
				code: "not_found" as const,
			};
		}

		const totalBeds = site.bedCounts[args.bedType];

		// count active holds for this bed type at this site
		const allHolds = await ctx.db.query("holds").collect();
		const activeHoldsForBed = allHolds.filter(
			(hold) =>
				hold.siteId === args.siteId &&
				hold.bedType === args.bedType &&
				hold.expiresAt > now
		);

		// count reservations for this bed type at this site
		const reservations = await ctx.db
			.query("reservations")
			.withIndex("by_site", (q) => q.eq("siteId", args.siteId))
			.collect();

		const reservationsForBed = reservations.filter(
			(r) => r.bedType === args.bedType
		);

		const availableBeds =
			totalBeds - activeHoldsForBed.length - reservationsForBed.length;

		if (availableBeds <= 0) {
			return {
				success: false,
				error: "No beds available",
				code: "conflict" as const,
			};
		}

		// create hold
		const holdId = await ctx.db.insert("holds", {
			siteId: args.siteId,
			bedType: args.bedType,
			caseWorkerId: args.userId,
			expiresAt: now + HOLD_DURATION_MS,
			createdAt: now,
		});

		return {
			success: true,
			data: holdId,
		};
	},
});

/**
 * Mutation to refresh an active hold
 * POC: Requires userId parameter
 * Requirements: 5.2
 */
export const refreshHold = mutation({
	args: {
		userId: v.id("users"),
	},
	handler: async (ctx, args) => {
		const now = Date.now();

		// get holds for this case worker (including recently expired ones)
		const holds = await ctx.db
			.query("holds")
			.withIndex("by_case_worker", (q) => q.eq("caseWorkerId", args.userId))
			.collect();

		// find the most recent hold (active or recently expired)
		const recentHold = holds.sort((a, b) => b.expiresAt - a.expiresAt)[0];

		if (!recentHold) {
			return {
				success: false,
				error: "No hold found",
				code: "not_found" as const,
			};
		}

		// check if hold is still active or recently expired (within grace period)
		const isActive = recentHold.expiresAt > now;
		const isRecentlyExpired = now - recentHold.expiresAt < 10000; // 10 second grace period

		if (!isActive && !isRecentlyExpired) {
			return {
				success: false,
				error: "Hold has expired and cannot be refreshed",
				code: "expired" as const,
			};
		}

		// if recently expired, check if bed is still available
		if (!isActive) {
			const site = await ctx.db.get(recentHold.siteId);
			if (!site) {
				return {
					success: false,
					error: "Site not found",
					code: "not_found" as const,
				};
			}

			const totalBeds = site.bedCounts[recentHold.bedType];

			// count other active holds for this bed type at this site
			const allHolds = await ctx.db.query("holds").collect();
			const otherActiveHolds = allHolds.filter(
				(hold) =>
					hold._id !== recentHold._id &&
					hold.siteId === recentHold.siteId &&
					hold.bedType === recentHold.bedType &&
					hold.expiresAt > now
			);

			// count reservations for this bed type at this site
			const reservations = await ctx.db
				.query("reservations")
				.withIndex("by_site", (q) => q.eq("siteId", recentHold.siteId))
				.collect();

			const reservationsForBed = reservations.filter(
				(r) => r.bedType === recentHold.bedType
			);

			const availableBeds =
				totalBeds - otherActiveHolds.length - reservationsForBed.length;

			if (availableBeds <= 0) {
				return {
					success: false,
					error: "No beds available",
					code: "conflict" as const,
				};
			}
		}

		// extend expiration
		await ctx.db.patch(recentHold._id, {
			expiresAt: now + HOLD_DURATION_MS,
		});

		return {
			success: true,
		};
	},
});

/**
 * Mutation to release a hold
 * POC: Requires userId parameter
 * Requirements: 5.3
 */
export const releaseHold = mutation({
	args: {
		userId: v.id("users"),
	},
	handler: async (ctx, args) => {
		const now = Date.now();

		// get active hold
		const holds = await ctx.db
			.query("holds")
			.withIndex("by_case_worker", (q) => q.eq("caseWorkerId", args.userId))
			.collect();

		const activeHold = holds.find((hold) => hold.expiresAt > now);

		if (!activeHold) {
			return {
				success: false,
				error: "No active hold found",
				code: "not_found" as const,
			};
		}

		// delete hold
		await ctx.db.delete(activeHold._id);

		return {
			success: true,
		};
	},
});

/**
 * Internal mutation to cleanup expired holds
 * Called by scheduled cron job every 5 seconds
 * Requirements: 4.4
 */
export const cleanupExpiredHolds = internalMutation({
	args: {},
	handler: async (ctx) => {
		const now = Date.now();

		// get all holds
		const holds = await ctx.db.query("holds").collect();

		// find and delete expired holds
		const expiredHolds = holds.filter((hold) => hold.expiresAt <= now);

		for (const hold of expiredHolds) {
			await ctx.db.delete(hold._id);
		}

		return {
			deletedCount: expiredHolds.length,
		};
	},
});
