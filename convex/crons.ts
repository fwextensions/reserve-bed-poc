import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// run cleanup every 5 seconds to remove expired holds
crons.interval(
	"cleanup expired holds",
	{ seconds: 5 },
	internal.holds.cleanupExpiredHolds
);

export default crons;
