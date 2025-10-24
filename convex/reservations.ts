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
 * Mutation to create a reservation from an active hold
 * POC: Requires userId parameter instead of auth
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */
export const createReservation = mutation({
	args: {
		userId: v.id("users"),
		clientName: v.string(),
		notes: v.string(),
	},
	handler: async (ctx, args) => {
		// validate clientName and notes are provided
		if (!args.clientName || args.clientName.trim() === "") {
			return {
				success: false,
				error: "Client name is required",
				code: "validation_error" as const,
			};
		}

		if (!args.notes || args.notes.trim() === "") {
			return {
				success: false,
				error: "Notes are required",
				code: "validation_error" as const,
			};
		}

		const now = Date.now();

		// verify user has active non-expired hold
		const holds = await ctx.db
			.query("holds")
			.withIndex("by_case_worker", (q) => q.eq("caseWorkerId", args.userId))
			.collect();

		const activeHold = holds.find((hold) => hold.expiresAt > now);

		if (!activeHold) {
			return {
				success: false,
				error: "No active hold found. Please start a new reservation.",
				code: "expired" as const,
			};
		}

		// create reservation record with hold details and client info
		const reservationId = await ctx.db.insert("reservations", {
			siteId: activeHold.siteId,
			bedType: activeHold.bedType,
			caseWorkerId: args.userId,
			clientName: args.clientName.trim(),
			notes: args.notes.trim(),
			createdAt: now,
		});

		// delete the hold record
		await ctx.db.delete(activeHold._id);

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
