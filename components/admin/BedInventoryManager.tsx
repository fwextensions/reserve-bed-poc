"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { BedType } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface BedInventoryManagerProps {
	siteId: Id<"sites">;
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

export function BedInventoryManager({ siteId }: BedInventoryManagerProps) {
	const inventory = useQuery(api.sites.getSiteInventory, { siteId });
	const site = useQuery(api.sites.getSite, { siteId });
	const updateBedCounts = useMutation(api.sites.updateBedCounts);

	const [editedCounts, setEditedCounts] = useState<Record<BedType, string>>({
		apple: "",
		orange: "",
		lemon: "",
		grape: "",
	});

	const [savingBedType, setSavingBedType] = useState<BedType | null>(null);
	const [changedBedTypes, setChangedBedTypes] = useState<Set<BedType>>(new Set());
	const previousInventory = useRef<typeof inventory>(undefined);

	// initialize edited counts when inventory loads
	if (inventory && editedCounts.apple === "" && editedCounts.orange === "" && editedCounts.lemon === "" && editedCounts.grape === "") {
		setEditedCounts({
			apple: inventory.apple.total.toString(),
			orange: inventory.orange.total.toString(),
			lemon: inventory.lemon.total.toString(),
			grape: inventory.grape.total.toString(),
		});
	}

	// detect real-time changes and show visual indicator
	useEffect(() => {
		if (!inventory || !previousInventory.current) {
			previousInventory.current = inventory;
			return;
		}

		const bedTypes: BedType[] = ["apple", "orange", "lemon", "grape"];
		const changed = new Set<BedType>();

		for (const bedType of bedTypes) {
			const prev = previousInventory.current[bedType];
			const curr = inventory[bedType];

			// check if any values changed
			if (
				prev.total !== curr.total ||
				prev.available !== curr.available ||
				prev.onHold !== curr.onHold ||
				prev.reserved !== curr.reserved
			) {
				changed.add(bedType);
			}
		}

		if (changed.size > 0) {
			setChangedBedTypes(changed);
			// clear the indicator after 2 seconds
			setTimeout(() => {
				setChangedBedTypes(new Set());
			}, 2000);
		}

		previousInventory.current = inventory;
	}, [inventory]);

	if (!inventory || !site) {
		return (
			<div className="flex items-center justify-center py-8">
				<p className="text-gray-600">Loading inventory...</p>
			</div>
		);
	}

	const bedTypes: BedType[] = ["apple", "orange", "lemon", "grape"];

	const handleCountChange = (bedType: BedType, value: string) => {
		setEditedCounts((prev) => ({
			...prev,
			[bedType]: value,
		}));
	};

	const handleSave = async (bedType: BedType) => {
		const newCount = parseInt(editedCounts[bedType], 10);

		// validate input
		if (isNaN(newCount) || newCount < 0) {
			toast.error("Please enter a valid non-negative number");
			return;
		}

		setSavingBedType(bedType);

		try {
			// prepare bed counts object with current values
			const bedCounts = {
				apple: inventory.apple.total,
				orange: inventory.orange.total,
				lemon: inventory.lemon.total,
				grape: inventory.grape.total,
				[bedType]: newCount,
			};

			const result = await updateBedCounts({
				siteId,
				bedCounts,
			});

			if (result.success) {
				toast.success(`${BED_TYPE_LABELS[bedType]} bed count updated successfully`);
			} else {
				toast.error(result.error || "Failed to update bed count");
				// reset to current value on error
				setEditedCounts((prev) => ({
					...prev,
					[bedType]: inventory[bedType].total.toString(),
				}));
			}
		} catch (error) {
			toast.error("An error occurred while updating bed count");
			// reset to current value on error
			setEditedCounts((prev) => ({
				...prev,
				[bedType]: inventory[bedType].total.toString(),
			}));
		} finally {
			setSavingBedType(null);
		}
	};

	return (
		<div className="space-y-4">
			<h3 className="text-xl font-semibold">Manage Bed Inventory</h3>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{bedTypes.map((bedType) => {
					const data = inventory[bedType];
					const isEdited = editedCounts[bedType] !== data.total.toString();
					const isSaving = savingBedType === bedType;
					const hasChanged = changedBedTypes.has(bedType);

					return (
						<Card 
							key={bedType}
							className={hasChanged ? "ring-2 ring-blue-500 transition-all duration-300" : ""}
						>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<span className="text-3xl">{BED_TYPE_ICONS[bedType]}</span>
									<span className="text-xl">{BED_TYPE_LABELS[bedType]}</span>
									{hasChanged && (
										<span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
											Updated
										</span>
									)}
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div>
									<Label htmlFor={`${bedType}-total`}>Total Beds</Label>
									<div className="flex gap-2 mt-1">
										<Input
											id={`${bedType}-total`}
											type="number"
											min="0"
											value={editedCounts[bedType]}
											onChange={(e) => handleCountChange(bedType, e.target.value)}
											disabled={isSaving}
											className="flex-1"
										/>
										<Button
											onClick={() => handleSave(bedType)}
											disabled={!isEdited || isSaving}
											className="min-w-[80px]"
										>
											{isSaving ? "Saving..." : "Save"}
										</Button>
									</div>
								</div>

								<div className="space-y-2 pt-2 border-t">
									<div className="flex justify-between text-sm">
										<span className="text-gray-600">On Hold:</span>
										<span className="font-medium text-yellow-600">{data.onHold}</span>
									</div>
									<div className="flex justify-between text-sm">
										<span className="text-gray-600">Reserved:</span>
										<span className="font-medium text-red-600">{data.reserved}</span>
									</div>
									<div className="flex justify-between text-sm font-semibold pt-2 border-t">
										<span className="text-green-600">Available:</span>
										<span className="text-green-600">{data.available}</span>
									</div>
								</div>
							</CardContent>
						</Card>
					);
				})}
			</div>
		</div>
	);
}
