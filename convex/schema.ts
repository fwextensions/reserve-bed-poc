import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// placeholder schema - will be implemented in task 2
export default defineSchema({
	users: defineTable({
		email: v.string(),
		role: v.union(v.literal("case_worker"), v.literal("site_admin")),
		siteId: v.optional(v.id("sites")),
		name: v.string(),
	}).index("by_email", ["email"]),
	sites: defineTable({
		name: v.string(),
		address: v.string(),
		phone: v.string(),
		bedCounts: v.object({
			apple: v.number(),
			orange: v.number(),
			lemon: v.number(),
			grape: v.number(),
		}),
	}),
	holds: defineTable({
		siteId: v.id("sites"),
		bedType: v.union(
			v.literal("apple"),
			v.literal("orange"),
			v.literal("lemon"),
			v.literal("grape")
		),
		caseWorkerId: v.id("users"),
		expiresAt: v.number(),
		createdAt: v.number(),
	})
		.index("by_case_worker", ["caseWorkerId"])
		.index("by_site", ["siteId"])
		.index("by_expires_at", ["expiresAt"]),
	reservations: defineTable({
		siteId: v.id("sites"),
		bedType: v.union(
			v.literal("apple"),
			v.literal("orange"),
			v.literal("lemon"),
			v.literal("grape")
		),
		caseWorkerId: v.id("users"),
		clientName: v.string(),
		notes: v.string(),
		createdAt: v.number(),
	})
		.index("by_site", ["siteId"])
		.index("by_case_worker", ["caseWorkerId"]),
});
