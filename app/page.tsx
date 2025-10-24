"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle className="text-2xl">Bed Reservation System</CardTitle>
					<CardDescription>POC Mode - Choose your interface</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<Link href="/case-worker" className="block">
						<Button className="w-full" size="lg">
							Case Worker Interface
						</Button>
					</Link>
					<Link href="/admin" className="block">
						<Button className="w-full" variant="outline" size="lg">
							Site Admin Interface
						</Button>
					</Link>
					<div className="text-xs text-gray-500 text-center pt-4">
						This is a POC with no authentication required
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
