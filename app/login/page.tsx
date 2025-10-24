"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
	const router = useRouter();

	useEffect(() => {
		// redirect to home page since we don't have auth in POC
		router.push("/");
	}, [router]);

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
			<p className="text-lg text-gray-600">Redirecting...</p>
		</div>
	);
}
