"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { InventorySummaryCard } from "@/components/admin/InventorySummaryCard";
import { BedType } from "@/types";

export default function AdminDashboard() {
	const user = useQuery(api.users.getSiteAdminUser);
	const site = user?.siteId ? useQuery(api.sites.getSite, { siteId: user.siteId }) : undefined;
	const inventory = user?.siteId ? useQuery(api.sites.getSiteInventory, { siteId: user.siteId }) : undefined;

	// show loading state
	if (user === undefined || site === undefined || inventory === undefined) {
		return (
			<div className="flex items-center justify-center py-12">
				<p className="text-lg text-gray-600">Loading...</p>
			</div>
		);
	}

	// handle error states
	if (!user || !user.siteId) {
		return (
			<div className="flex items-center justify-center py-12">
				<p className="text-lg text-red-600">Error: No site assigned to your account</p>
			</div>
		);
	}

	if (!site) {
		return (
			<div className="flex items-center justify-center py-12">
				<p className="text-lg text-red-600">Error: Site not found</p>
			</div>
		);
	}

	if (!inventory) {
		return (
			<div className="flex items-center justify-center py-12">
				<p className="text-lg text-red-600">Error: Unable to load inventory</p>
			</div>
		);
	}

	const bedTypes: BedType[] = ["apple", "orange", "lemon", "grape"];

	return (
		<div>
			<div className="mb-8">
				<h2 className="text-3xl font-bold mb-2">{site.name}</h2>
				<div className="text-gray-600 space-y-1">
					<p>{site.address}</p>
					<p>{site.phone}</p>
				</div>
			</div>

			<div className="mb-6">
				<h3 className="text-xl font-semibold mb-4">Bed Inventory</h3>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					{bedTypes.map((bedType) => (
						<InventorySummaryCard
							key={bedType}
							bedType={bedType}
							total={inventory[bedType].total}
							available={inventory[bedType].available}
							onHold={inventory[bedType].onHold}
							reserved={inventory[bedType].reserved}
						/>
					))}
				</div>
			</div>

			<div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
				<p className="text-sm text-blue-800">
					Additional management features (bed count updates, reservation management, site info editing) coming soon.
				</p>
			</div>
		</div>
	);
}
