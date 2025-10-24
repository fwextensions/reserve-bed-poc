import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BedType } from "@/types";

interface InventorySummaryCardProps {
	bedType: BedType;
	total: number;
	available: number;
	onHold: number;
	reserved: number;
}

const BED_TYPE_ICONS: Record<BedType, string> = {
	apple: "🍎",
	orange: "🍊",
	lemon: "🍋",
	grape: "🍇",
};

const BED_TYPE_LABELS: Record<BedType, string> = {
	apple: "Apple",
	orange: "Orange",
	lemon: "Lemon",
	grape: "Grape",
};

export function InventorySummaryCard({
	bedType,
	total,
	available,
	onHold,
	reserved,
}: InventorySummaryCardProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<span className="text-3xl">{BED_TYPE_ICONS[bedType]}</span>
					<span className="text-xl">{BED_TYPE_LABELS[bedType]}</span>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-3">
					<div className="flex justify-between items-center">
						<span className="text-sm font-medium text-gray-600">Total Beds:</span>
						<span className="text-lg font-semibold">{total}</span>
					</div>
					<div className="flex justify-between items-center">
						<span className="text-sm font-medium text-green-600">Available:</span>
						<span className="text-lg font-semibold text-green-600">{available}</span>
					</div>
					<div className="flex justify-between items-center">
						<span className="text-sm font-medium text-yellow-600">On Hold:</span>
						<span className="text-lg font-semibold text-yellow-600">{onHold}</span>
					</div>
					<div className="flex justify-between items-center">
						<span className="text-sm font-medium text-red-600">Reserved:</span>
						<span className="text-lg font-semibold text-red-600">{reserved}</span>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
