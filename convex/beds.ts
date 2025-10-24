import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Query to get total available beds by type across all sites
 * Returns object with available count per bed type
 * Requirements: 2.1, 2.4
 */
export const getBedAvailability = query({
	args: {},
	handler: async (ctx) => {
		const now = Date.now();

		// get all sites
		const sites = await ctx.db.query("sites").collect();

		// get all active holds (not expired)
		const holds = await ctx.db.query("holds").collect();
		const activeHolds = holds.filter((hold) => hold.expiresAt > now);

		// get all reservations
		const reservations = await ctx.db.query("reservations").collect();

		// calculate totals by bed type
		const bedTypes = ["apple", "orange", "lemon", "grape"] as const;
		const availability: Record<string, number> = {};

		for (const bedType of bedTypes) {
			// sum total beds of this type across all sites
			const total = sites.reduce(
				(sum, site) => sum + site.bedCounts[bedType],
				0
			);

			// count active holds for this bed type
			const holdsCount = activeHolds.filter(
				(hold) => hold.bedType === bedType
			).length;

			// count reservations for this bed type
			const reservationsCount = reservations.filter(
				(reservation) => reservation.bedType === bedType
			).length;

			// calculate available
			availability[bedType] = total - holdsCount - reservationsCount;
		}

		return availability;
	},
});

/**
 * Query to get bed availability by type with site breakdown
 * Returns array of site info with availability for the specified bed type
 * Requirements: 2.3, 2.5
 */
export const getBedAvailabilityByType = query({
	args: {
		bedType: v.union(
			v.literal("apple"),
			v.literal("orange"),
			v.literal("lemon"),
			v.literal("grape")
		),
	},
	handler: async (ctx, args) => {
		const now = Date.now();

		// get all sites
		const sites = await ctx.db.query("sites").collect();

		// get all active holds (not expired) for this bed type
		const holds = await ctx.db.query("holds").collect();
		const activeHolds = holds.filter(
			(hold) => hold.expiresAt > now && hold.bedType === args.bedType
		);

		// get all reservations for this bed type
		const reservations = await ctx.db.query("reservations").collect();
		const typeReservations = reservations.filter(
			(reservation) => reservation.bedType === args.bedType
		);

		// calculate availability per site
		const siteAvailability = sites
			.map((site) => {
				const total = site.bedCounts[args.bedType];

				// count holds at this site
				const holdsCount = activeHolds.filter(
					(hold) => hold.siteId === site._id
				).length;

				// count reservations at this site
				const reservationsCount = typeReservations.filter(
					(reservation) => reservation.siteId === site._id
				).length;

				// calculate available
				const availableCount = total - holdsCount - reservationsCount;

				return {
					site: {
						_id: site._id,
						name: site.name,
						address: site.address,
						phone: site.phone,
						bedCounts: site.bedCounts,
						_creationTime: site._creationTime,
					},
					availableCount,
				};
			})
			.filter((item) => item.site.bedCounts[args.bedType] > 0); // only include sites that have this bed type

		return siteAvailability;
	},
});
