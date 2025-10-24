"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { BedTypeCard } from "./BedTypeCard";
import { Button } from "@/components/ui/button";
import { BedType } from "@/types";
import { useRouter } from "next/navigation";

export function AvailabilityDashboard() {
	const router = useRouter();
	const availability = useQuery(api.beds.getBedAvailability);

	// loading state
	if (availability === undefined) {
		return (
			<div className="space-y-4">
				<div className="flex flex-col gap-4">
					<h1 className="text-2xl font-bold">Bed Availability</h1>
					<p className="text-muted-foreground">Loading availability...</p>
				</div>
				<div className="space-y-3">
					{["apple", "orange", "lemon", "grape"].map((type) => (
						<div
							key={type}
							className="h-[120px] bg-muted/50 rounded-xl animate-pulse"
						/>
					))}
				</div>
			</div>
		);
	}

	const bedTypes: BedType[] = ["apple", "orange", "lemon", "grape"];

	const handleBedTypeClick = (bedType: BedType) => {
		router.push(`/bed-type/${bedType}`);
	};

	const handleReserveBed = () => {
		router.push("/reserve");
	};

	return (
		<div className="space-y-6">
			{/* header section */}
			<div className="flex flex-col gap-4">
				<h1 className="text-2xl font-bold">Bed Availability</h1>
				<p className="text-muted-foreground">
					View real-time bed availability across all sites
				</p>
			</div>

			{/* reserve bed button */}
			<Button
				onClick={handleReserveBed}
				size="lg"
				className="w-full min-h-[44px]"
			>
				Reserve Bed
			</Button>

			{/* bed type cards - single column layout for mobile */}
			<div className="flex flex-col gap-3">
				{bedTypes.map((bedType) => (
					<BedTypeCard
						key={bedType}
						bedType={bedType}
						availableCount={availability[bedType] || 0}
						onClick={() => handleBedTypeClick(bedType)}
					/>
				))}
			</div>
		</div>
	);
}
