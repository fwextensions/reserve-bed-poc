import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		environment: "node",
		include: ["convex/**/*.test.ts"],
		globals: true,
	},
});
