import { cronJobs } from "convex/server";

const crons = cronJobs();

// POC: Cron disabled - call cleanupExpiredHolds mutation manually if needed
// run cleanup every 5 seconds
// crons.interval(
// 	"cleanup expired holds",
// 	{ seconds: 5 },
// 	internal.holds.cleanupExpiredHolds
// );

export default crons;
