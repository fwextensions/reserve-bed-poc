"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BedType } from "@/types";
import { cn } from "@/lib/utils";

interface BedTypeCardProps {
	bedType: BedType;
	availableCount: number;
	onClick: () => void;
}

// bed type display configuration
const BED_TYPE_CONFIG: Record<
	BedType,
	{ name: string; icon: string; color: string }
> = {
	apple: {
		name: "Apple",
		icon: "🍎",
		color: "bg-red-50 border-red-200 hover:bg-red-100 active:bg-red-200",
	},
	orange: {
		name: "Orange",
		icon: "🍊",
		color: "bg-orange-50 border-orange-200 hover:bg-orange-100 active:bg-orange-200",
	},
	lemon: {
		name: "Lemon",
		icon: "🍋",
		color: "bg-yellow-50 border-yellow-200 hover:bg-yellow-100 active:bg-yellow-200",
	},
	grape: {
		name: "Grape",
		icon: "🍇",
		color: "bg-purple-50 border-purple-200 hover:bg-purple-100 active:bg-purple-200",
	},
};

export function BedTypeCard({
	bedType,
	availableCount,
	onClick,
}: BedTypeCardProps) {
	const config = BED_TYPE_CONFIG[bedType];
	const [hasChanged, setHasChanged] = useState(false);
	const previousCount = useRef<number | undefined>(undefined);

	// detect real-time changes and show visual indicator
	useEffect(() => {
		if (previousCount.current !== undefined && previousCount.current !== availableCount) {
			setHasChanged(true);
			// clear the indicator after 2 seconds
			const timeout = setTimeout(() => {
				setHasChanged(false);
			}, 2000);
			return () => clearTimeout(timeout);
		}
		previousCount.current = availableCount;
	}, [availableCount]);

	return (
		<Card
			className={cn(
				"cursor-pointer transition-all duration-300 min-h-[44px]",
				config.color,
				hasChanged && "ring-2 ring-blue-500 shadow-lg"
			)}
			onClick={onClick}
		>
			<CardContent className="p-6">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<span className="text-4xl" role="img" aria-label={config.name}>
							{config.icon}
						</span>
						<div>
							<h3 className="text-lg font-semibold">{config.name}</h3>
							<p className="text-sm text-muted-foreground">Bed Type</p>
						</div>
					</div>
					<div className="text-right">
						<div className="flex items-center gap-2">
							<div className="text-3xl font-bold">{availableCount}</div>
							{hasChanged && (
								<span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full animate-pulse">
									Updated
								</span>
							)}
						</div>
						<p className="text-sm text-muted-foreground">Available</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
