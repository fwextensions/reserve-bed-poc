"use client";

import { ConvexReactClient } from "convex/react";

// constants
export const HOLD_DURATION_MS = 30000; // 30 seconds
export const HOLD_DURATION_SECONDS = 30; // 30 seconds
export const REAL_TIME_UPDATE_THRESHOLD_MS = 2000; // 2 seconds
export const CLEANUP_INTERVAL_SECONDS = 5; // 5 seconds for hold cleanup cron

// convex client setup
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!convexUrl) {
	throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");
}

export const convex = new ConvexReactClient(convexUrl);
