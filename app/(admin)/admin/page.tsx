"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { InventorySummaryCard } from "@/components/admin/InventorySummaryCard";
import { BedInventoryManager } from "@/components/admin/BedInventoryManager";
import { ReservationList } from "@/components/admin/ReservationList";
import { SiteInfoEditor } from "@/components/admin/SiteInfoEditor";
import { BedType } from "@/types";

export default function AdminDashboard() {
	const user = useQuery(api.users.getSiteAdminUser);
	const site = useQuery(api.sites.getSite, user?.siteId ? { siteId: user.siteId } : "skip");
	const inventory = useQuery(api.sites.getSiteInventory, user?.siteId ? { siteId: user.siteId } : "skip");

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
				<h3 className="text-xl font-semibold mb-4">Bed Inventory Overview</h3>
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

			<div className="mt-8">
				<BedInventoryManager siteId={user.siteId} />
			</div>

			<div className="mt-8">
				<ReservationList siteId={user.siteId} />
			</div>

			<div className="mt-8">
				<SiteInfoEditor siteId={user.siteId} />
			</div>
		</div>
	);
}
