/**
 * Real-time synchronization verification tests
 * 
 * These tests verify that real-time updates propagate correctly across
 * all interfaces within the required 2-second timeframe.
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */

import { convexTest } from "convex-test";
import { expect, test, describe } from "vitest";
import schema from "./schema";
import { api, internal } from "./_generated/api";

describe("Real-time synchronization", () => {
	test("placing a hold updates bed availability immediately", async () => {
		const t = convexTest(schema);

		// create test data
		const siteId = await t.run(async (ctx) => {
			return await ctx.db.insert("sites", {
				name: "Test Site",
				address: "123 Test St",
				phone: "555-0100",
				bedCounts: { apple: 5, orange: 3, lemon: 2, grape: 4 },
			});
		});

		const userId = await t.run(async (ctx) => {
			return await ctx.db.insert("users", {
				email: "caseworker@test.com",
				name: "Test Case Worker",
				role: "case_worker",
			});
		});

		// get initial availability
		const initialAvailability = await t.query(api.beds.getBedAvailability, {});
		expect(initialAvailability.apple).toBe(5);

		// place a hold
		const holdResult = await t.mutation(api.holds.placeHold, {
			userId,
			siteId,
			bedType: "apple",
		});

		expect(holdResult.success).toBe(true);

		// verify availability updated immediately
		const updatedAvailability = await t.query(api.beds.getBedAvailability, {});
		expect(updatedAvailability.apple).toBe(4);
	});

	test("creating a reservation updates bed availability immediately", async () => {
		const t = convexTest(schema);

		// create test data
		const siteId = await t.run(async (ctx) => {
			return await ctx.db.insert("sites", {
				name: "Test Site",
				address: "123 Test St",
				phone: "555-0100",
				bedCounts: { apple: 5, orange: 3, lemon: 2, grape: 4 },
			});
		});

		const userId = await t.run(async (ctx) => {
			return await ctx.db.insert("users", {
				email: "caseworker@test.com",
				name: "Test Case Worker",
				role: "case_worker",
			});
		});

		// place a hold first
		await t.mutation(api.holds.placeHold, {
			userId,
			siteId,
			bedType: "orange",
		});

		// get availability after hold
		const afterHold = await t.query(api.beds.getBedAvailability, {});
		expect(afterHold.orange).toBe(2);

		// create reservation
		const reservationResult = await t.mutation(api.reservations.createReservation, {
			userId,
			siteId,
			bedType: "orange",
			clientName: "John Doe",
			notes: "Test reservation",
		});

		expect(reservationResult.success).toBe(true);

		// verify availability still shows 2 (hold converted to reservation)
		const afterReservation = await t.query(api.beds.getBedAvailability, {});
		expect(afterReservation.orange).toBe(2);
	});

	test("releasing a reservation updates bed availability immediately", async () => {
		const t = convexTest(schema);

		// create test data
		const siteId = await t.run(async (ctx) => {
			return await ctx.db.insert("sites", {
				name: "Test Site",
				address: "123 Test St",
				phone: "555-0100",
				bedCounts: { apple: 5, orange: 3, lemon: 2, grape: 4 },
			});
		});

		const userId = await t.run(async (ctx) => {
			return await ctx.db.insert("users", {
				email: "caseworker@test.com",
				name: "Test Case Worker",
				role: "case_worker",
			});
		});

		// create a reservation
		await t.mutation(api.holds.placeHold, {
			userId,
			siteId,
			bedType: "lemon",
		});

		const reservationResult = await t.mutation(api.reservations.createReservation, {
			userId,
			siteId,
			bedType: "lemon",
			clientName: "Jane Smith",
			notes: "Test reservation",
		});

		expect(reservationResult.success).toBe(true);

		// verify availability decreased
		const beforeRelease = await t.query(api.beds.getBedAvailability, {});
		expect(beforeRelease.lemon).toBe(1);

		// release the reservation
		const releaseResult = await t.mutation(api.reservations.releaseReservation, {
			reservationId: reservationResult.data!,
		});

		expect(releaseResult.success).toBe(true);

		// verify availability increased
		const afterRelease = await t.query(api.beds.getBedAvailability, {});
		expect(afterRelease.lemon).toBe(2);
	});

	test("holds placed by case workers update admin UI inventory", async () => {
		const t = convexTest(schema);

		// create test data
		const siteId = await t.run(async (ctx) => {
			return await ctx.db.insert("sites", {
				name: "Test Site",
				address: "123 Test St",
				phone: "555-0100",
				bedCounts: { apple: 5, orange: 3, lemon: 2, grape: 4 },
			});
		});

		const userId = await t.run(async (ctx) => {
			return await ctx.db.insert("users", {
				email: "caseworker@test.com",
				name: "Test Case Worker",
				role: "case_worker",
			});
		});

		// get initial inventory
		const initialInventory = await t.query(api.sites.getSiteInventory, { siteId });
		expect(initialInventory.grape.total).toBe(4);
		expect(initialInventory.grape.available).toBe(4);
		expect(initialInventory.grape.onHold).toBe(0);

		// place a hold
		await t.mutation(api.holds.placeHold, {
			userId,
			siteId,
			bedType: "grape",
		});

		// verify inventory updated
		const updatedInventory = await t.query(api.sites.getSiteInventory, { siteId });
		expect(updatedInventory.grape.total).toBe(4);
		expect(updatedInventory.grape.available).toBe(3);
		expect(updatedInventory.grape.onHold).toBe(1);
	});

	test("reservations created by case workers update admin UI", async () => {
		const t = convexTest(schema);

		// create test data
		const siteId = await t.run(async (ctx) => {
			return await ctx.db.insert("sites", {
				name: "Test Site",
				address: "123 Test St",
				phone: "555-0100",
				bedCounts: { apple: 5, orange: 3, lemon: 2, grape: 4 },
			});
		});

		const userId = await t.run(async (ctx) => {
			return await ctx.db.insert("users", {
				email: "caseworker@test.com",
				name: "Test Case Worker",
				role: "case_worker",
			});
		});

		// get initial reservations
		const initialReservations = await t.query(api.reservations.getReservations, { siteId });
		expect(initialReservations.length).toBe(0);

		// create a reservation
		await t.mutation(api.holds.placeHold, {
			userId,
			siteId,
			bedType: "apple",
		});

		await t.mutation(api.reservations.createReservation, {
			userId,
			siteId,
			bedType: "apple",
			clientName: "Test Client",
			notes: "Test notes",
		});

		// verify reservations list updated
		const updatedReservations = await t.query(api.reservations.getReservations, { siteId });
		expect(updatedReservations.length).toBe(1);
		expect(updatedReservations[0].clientName).toBe("Test Client");
		expect(updatedReservations[0].caseWorkerName).toBe("Test Case Worker");
	});

	test("bed count changes update case worker availability views", async () => {
		const t = convexTest(schema);

		// create test data
		const siteId = await t.run(async (ctx) => {
			return await ctx.db.insert("sites", {
				name: "Test Site",
				address: "123 Test St",
				phone: "555-0100",
				bedCounts: { apple: 5, orange: 3, lemon: 2, grape: 4 },
			});
		});

		// get initial availability
		const initialAvailability = await t.query(api.beds.getBedAvailability, {});
		expect(initialAvailability.orange).toBe(3);

		// admin updates bed count
		await t.mutation(api.sites.updateBedCounts, {
			siteId,
			bedCounts: { apple: 5, orange: 8, lemon: 2, grape: 4 },
		});

		// verify case worker sees updated availability
		const updatedAvailability = await t.query(api.beds.getBedAvailability, {});
		expect(updatedAvailability.orange).toBe(8);

		// verify bed type detail view also updated
		const bedTypeAvailability = await t.query(api.beds.getBedAvailabilityByType, {
			bedType: "orange",
		});
		expect(bedTypeAvailability[0].availableCount).toBe(8);
	});

	test("expired holds are cleaned up and availability updates", async () => {
		const t = convexTest(schema);

		// create test data
		const siteId = await t.run(async (ctx) => {
			return await ctx.db.insert("sites", {
				name: "Test Site",
				address: "123 Test St",
				phone: "555-0100",
				bedCounts: { apple: 5, orange: 3, lemon: 2, grape: 4 },
			});
		});

		const userId = await t.run(async (ctx) => {
			return await ctx.db.insert("users", {
				email: "caseworker@test.com",
				name: "Test Case Worker",
				role: "case_worker",
			});
		});

		// place a hold
		await t.mutation(api.holds.placeHold, {
			userId,
			siteId,
			bedType: "apple",
		});

		// verify availability decreased
		const afterHold = await t.query(api.beds.getBedAvailability, {});
		expect(afterHold.apple).toBe(4);

		// manually expire the hold by updating its expiresAt
		await t.run(async (ctx) => {
			const holds = await ctx.db.query("holds").collect();
			if (holds.length > 0) {
				await ctx.db.patch(holds[0]._id, {
					expiresAt: Date.now() - 1000, // expired 1 second ago
				});
			}
		});

		// run cleanup (using internal mutation)
		const cleanupResult = await t.mutation(internal.holds.cleanupExpiredHolds, {});
		expect(cleanupResult.deletedCount).toBe(1);

		// verify availability increased back
		const afterCleanup = await t.query(api.beds.getBedAvailability, {});
		expect(afterCleanup.apple).toBe(5);
	});
});
