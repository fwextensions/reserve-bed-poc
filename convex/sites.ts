import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Query to get site details
 * POC: No auth checks
 */
export const getSite = query({
	args: {
		siteId: v.id("sites"),
	},
	handler: async (ctx, args) => {
		// get the site
		const site = await ctx.db.get(args.siteId);
		if (!site) {
			throw new Error("Site not found");
		}

		return site;
	},
});

/**
 * Query to get site inventory with detailed bed counts
 * POC: No auth checks
 * Requirements: 8.1, 8.4, 8.5
 */
export const getSiteInventory = query({
	args: {
		siteId: v.id("sites"),
	},
	handler: async (ctx, args) => {
		const now = Date.now();

		// get the site
		const site = await ctx.db.get(args.siteId);
		if (!site) {
			throw new Error("Site not found");
		}

		// get all active holds (not expired) for this site
		const holds = await ctx.db
			.query("holds")
			.withIndex("by_site", (q) => q.eq("siteId", args.siteId))
			.collect();
		const activeHolds = holds.filter((hold) => hold.expiresAt > now);

		// get all reservations for this site
		const reservations = await ctx.db
			.query("reservations")
			.withIndex("by_site", (q) => q.eq("siteId", args.siteId))
			.collect();

		// calculate inventory for each bed type
		const bedTypes = ["apple", "orange", "lemon", "grape"] as const;
		const inventory: Record<
			string,
			{ total: number; available: number; onHold: number; reserved: number }
		> = {};

		for (const bedType of bedTypes) {
			const total = site.bedCounts[bedType];

			// count holds for this bed type
			const onHold = activeHolds.filter(
				(hold) => hold.bedType === bedType
			).length;

			// count reservations for this bed type
			const reserved = reservations.filter(
				(reservation) => reservation.bedType === bedType
			).length;

			// calculate available
			const available = total - onHold - reserved;

			inventory[bedType] = {
				total,
				available,
				onHold,
				reserved,
			};
		}

		return inventory;
	},
});

/**
 * Mutation to update bed counts for a site
 * POC: No auth checks
 * Requirements: 8.2, 8.3
 */
export const updateBedCounts = mutation({
	args: {
		siteId: v.id("sites"),
		bedCounts: v.object({
			apple: v.number(),
			orange: v.number(),
			lemon: v.number(),
			grape: v.number(),
		}),
	},
	handler: async (ctx, args) => {
		// verify counts are non-negative integers
		const bedTypes = ["apple", "orange", "lemon", "grape"] as const;
		for (const bedType of bedTypes) {
			const count = args.bedCounts[bedType];
			if (!Number.isInteger(count) || count < 0) {
				return {
					success: false,
					error: `Bed count for ${bedType} must be a non-negative integer`,
					code: "validation_error" as const,
				};
			}
		}

		const now = Date.now();

		// get all active holds (not expired) for this site
		const holds = await ctx.db
			.query("holds")
			.withIndex("by_site", (q) => q.eq("siteId", args.siteId))
			.collect();
		const activeHolds = holds.filter((hold) => hold.expiresAt > now);

		// get all reservations for this site
		const reservations = await ctx.db
			.query("reservations")
			.withIndex("by_site", (q) => q.eq("siteId", args.siteId))
			.collect();

		// validate new counts >= (holds + reservations) for each type
		for (const bedType of bedTypes) {
			const newCount = args.bedCounts[bedType];

			// count holds for this bed type
			const holdsCount = activeHolds.filter(
				(hold) => hold.bedType === bedType
			).length;

			// count reservations for this bed type
			const reservationsCount = reservations.filter(
				(reservation) => reservation.bedType === bedType
			).length;

			const minimumRequired = holdsCount + reservationsCount;

			if (newCount < minimumRequired) {
				return {
					success: false,
					error: `Cannot set ${bedType} bed count to ${newCount}. Minimum required is ${minimumRequired} (${holdsCount} holds + ${reservationsCount} reservations)`,
					code: "validation_error" as const,
				};
			}
		}

		// update site bedCounts
		await ctx.db.patch(args.siteId, {
			bedCounts: args.bedCounts,
		});

		return {
			success: true,
		};
	},
});

/**
 * Mutation to update site information (name, address, phone)
 * POC: No auth checks
 * Requirements: 10.2, 10.3, 10.4
 */
export const updateSiteInfo = mutation({
	args: {
		siteId: v.id("sites"),
		name: v.string(),
		address: v.string(),
		phone: v.string(),
	},
	handler: async (ctx, args) => {
		// update site record
		await ctx.db.patch(args.siteId, {
			name: args.name,
			address: args.address,
			phone: args.phone,
		});

		return {
			success: true,
		};
	},
});
