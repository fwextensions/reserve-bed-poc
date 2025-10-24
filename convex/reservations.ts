import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Query to get all active reservations for a site
 * Includes case worker name via join
 * POC: No auth checks
 * Requirements: 9.1, 9.2
 */
export const getReservations = query({
	args: {
		siteId: v.id("sites"),
	},
	handler: async (ctx, args) => {
		// get all reservations for this site
		const reservations = await ctx.db
			.query("reservations")
			.withIndex("by_site", (q) => q.eq("siteId", args.siteId))
			.collect();

		// join with users table to get case worker names
		const reservationsWithCaseWorker = await Promise.all(
			reservations.map(async (reservation) => {
				const caseWorker = await ctx.db.get(reservation.caseWorkerId);
				return {
					...reservation,
					caseWorkerName: caseWorker?.name || "Unknown",
				};
			})
		);

		return reservationsWithCaseWorker;
	},
});

/**
 * Mutation to create a reservation
 * POC: Requires userId, siteId, and bedType parameters instead of auth
 * Hold is optional - if present, it will be released. If not, checks availability.
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */
export const createReservation = mutation({
	args: {
		userId: v.id("users"),
		siteId: v.id("sites"),
		bedType: v.union(
			v.literal("apple"),
			v.literal("orange"),
			v.literal("lemon"),
			v.literal("grape")
		),
		clientName: v.string(),
		notes: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		// validate clientName is provided
		if (!args.clientName || args.clientName.trim() === "") {
			return {
				success: false,
				error: "Client name is required",
				code: "validation_error" as const,
			};
		}

		const now = Date.now();

		// check if user has an active hold for this site/bed type
		const holds = await ctx.db
			.query("holds")
			.withIndex("by_case_worker", (q) => q.eq("caseWorkerId", args.userId))
			.collect();

		const activeHold = holds.find(
			(hold) =>
				hold.expiresAt > now &&
				hold.siteId === args.siteId &&
				hold.bedType === args.bedType
		);

		// if no active hold, check if bed is available
		if (!activeHold) {
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
		}

		// create reservation record
		const reservationId = await ctx.db.insert("reservations", {
			siteId: args.siteId,
			bedType: args.bedType,
			caseWorkerId: args.userId,
			clientName: args.clientName.trim(),
			notes: args.notes?.trim() || undefined,
			createdAt: now,
		});

		// if there was an active hold, delete it
		if (activeHold) {
			await ctx.db.delete(activeHold._id);
		}

		return {
			success: true,
			data: reservationId,
		};
	},
});

/**
 * Mutation to release a reservation
 * POC: No auth checks
 * Requirements: 9.3, 9.4, 9.5
 */
export const releaseReservation = mutation({
	args: {
		reservationId: v.id("reservations"),
	},
	handler: async (ctx, args) => {
		// get the reservation
		const reservation = await ctx.db.get(args.reservationId);

		if (!reservation) {
			return {
				success: false,
				error: "Reservation not found",
				code: "not_found" as const,
			};
		}

		// delete reservation record
		await ctx.db.delete(args.reservationId);

		return {
			success: true,
		};
	},
});
