import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Seed the database with sample sites and users for development and testing
 * This mutation can be called from the Convex dashboard or via a script
 */
export const seedDatabase = mutation({
  args: {},
  handler: async (ctx) => {
    // check if database is already seeded
    const existingSites = await ctx.db.query("sites").collect();
    if (existingSites.length > 0) {
      return {
        success: false,
        message: "Database already contains sites. Clear the database before seeding.",
      };
    }

    // create sample sites with bed inventory
    // site with only apple beds - tests single bed type availability
    const site1Id = await ctx.db.insert("sites", {
      name: "Hope Haven Shelter",
      address: "123 Market Street, San Francisco, CA 94102",
      phone: "(415) 555-0100",
      bedCounts: {
        apple: 20,
        orange: 0,
        lemon: 0,
        grape: 0,
      },
    });

    // site with only orange and lemon beds - tests partial availability
    const site2Id = await ctx.db.insert("sites", {
      name: "Safe Harbor Center",
      address: "456 Mission Street, San Francisco, CA 94103",
      phone: "(415) 555-0200",
      bedCounts: {
        apple: 0,
        orange: 15,
        lemon: 12,
        grape: 0,
      },
    });

    // site with all bed types - tests full availability
    const site3Id = await ctx.db.insert("sites", {
      name: "Community Care House",
      address: "789 Valencia Street, San Francisco, CA 94110",
      phone: "(415) 555-0300",
      bedCounts: {
        apple: 6,
        orange: 12,
        lemon: 10,
        grape: 8,
      },
    });

    // site with varied inventory - tests mixed availability
    const site4Id = await ctx.db.insert("sites", {
      name: "Riverside Refuge",
      address: "321 Embarcadero, San Francisco, CA 94111",
      phone: "(415) 555-0400",
      bedCounts: {
        apple: 8,
        orange: 6,
        lemon: 15,
        grape: 10,
      },
    });

    // create sample case workers
    const caseWorker1Id = await ctx.db.insert("users", {
      email: "sarah.johnson@example.com",
      name: "Sarah Johnson",
      role: "case_worker",
    });

    const caseWorker2Id = await ctx.db.insert("users", {
      email: "michael.chen@example.com",
      name: "Michael Chen",
      role: "case_worker",
    });

    const caseWorker3Id = await ctx.db.insert("users", {
      email: "emily.rodriguez@example.com",
      name: "Emily Rodriguez",
      role: "case_worker",
    });

    const caseWorker4Id = await ctx.db.insert("users", {
      email: "david.williams@example.com",
      name: "David Williams",
      role: "case_worker",
    });

    // create sample site admins (one per site)
    const admin1Id = await ctx.db.insert("users", {
      email: "admin.hopehaven@example.com",
      name: "Jennifer Martinez",
      role: "site_admin",
      siteId: site1Id,
    });

    const admin2Id = await ctx.db.insert("users", {
      email: "admin.safeharbor@example.com",
      name: "Robert Thompson",
      role: "site_admin",
      siteId: site2Id,
    });

    const admin3Id = await ctx.db.insert("users", {
      email: "admin.communitycare@example.com",
      name: "Lisa Anderson",
      role: "site_admin",
      siteId: site3Id,
    });

    const admin4Id = await ctx.db.insert("users", {
      email: "admin.riverside@example.com",
      name: "James Wilson",
      role: "site_admin",
      siteId: site4Id,
    });

    return {
      success: true,
      message: "Database seeded successfully",
      data: {
        sites: {
          site1: site1Id,
          site2: site2Id,
          site3: site3Id,
          site4: site4Id,
        },
        caseWorkers: {
          caseWorker1: caseWorker1Id,
          caseWorker2: caseWorker2Id,
          caseWorker3: caseWorker3Id,
          caseWorker4: caseWorker4Id,
        },
        siteAdmins: {
          admin1: admin1Id,
          admin2: admin2Id,
          admin3: admin3Id,
          admin4: admin4Id,
        },
      },
    };
  },
});

/**
 * Clear all data from the database
 * Use with caution - this will delete all sites, users, holds, and reservations
 */
export const clearDatabase = mutation({
  args: {},
  handler: async (ctx) => {
    // delete all holds
    const holds = await ctx.db.query("holds").collect();
    for (const hold of holds) {
      await ctx.db.delete(hold._id);
    }

    // delete all reservations
    const reservations = await ctx.db.query("reservations").collect();
    for (const reservation of reservations) {
      await ctx.db.delete(reservation._id);
    }

    // delete all users
    const users = await ctx.db.query("users").collect();
    for (const user of users) {
      await ctx.db.delete(user._id);
    }

    // delete all sites
    const sites = await ctx.db.query("sites").collect();
    for (const site of sites) {
      await ctx.db.delete(site._id);
    }

    return {
      success: true,
      message: "Database cleared successfully",
      data: {
        deletedHolds: holds.length,
        deletedReservations: reservations.length,
        deletedUsers: users.length,
        deletedSites: sites.length,
      },
    };
  },
});
