"use client";

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

	return (
		<Card
			className={cn(
				"cursor-pointer transition-all duration-100 min-h-[44px]",
				config.color
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
						<div className="text-3xl font-bold">{availableCount}</div>
						<p className="text-sm text-muted-foreground">Available</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
