import { query } from "./_generated/server";

/**
 * Get the current authenticated user with their role
 * POC: Returns a mock case worker user
 */
export const getCurrentUserWithRole = query({
	args: {},
	handler: async (ctx) => {
		// POC: Return mock case worker
		// In production, this would check actual authentication
		const users = await ctx.db.query("users").collect();
		const caseWorker = users.find((u) => u.role === "case_worker");

		if (!caseWorker) {
			return null;
		}

		return {
			_id: caseWorker._id,
			email: caseWorker.email,
			name: caseWorker.name,
			role: caseWorker.role,
			siteId: caseWorker.siteId,
		};
	},
});

/**
 * Get a site admin user for POC
 * POC: Returns the first site admin user
 */
export const getSiteAdminUser = query({
	args: {},
	handler: async (ctx) => {
		// POC: Return first site admin
		// In production, this would check actual authentication
		const users = await ctx.db.query("users").collect();
		const siteAdmin = users.find((u) => u.role === "site_admin");

		if (!siteAdmin) {
			return null;
		}

		return {
			_id: siteAdmin._id,
			email: siteAdmin.email,
			name: siteAdmin.name,
			role: siteAdmin.role,
			siteId: siteAdmin.siteId,
		};
	},
});
