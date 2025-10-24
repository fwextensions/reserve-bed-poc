"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface SiteInfoEditorProps {
	siteId: Id<"sites">;
}

export function SiteInfoEditor({ siteId }: SiteInfoEditorProps) {
	const site = useQuery(api.sites.getSite, { siteId });
	const updateSiteInfo = useMutation(api.sites.updateSiteInfo);

	const [name, setName] = useState("");
	const [address, setAddress] = useState("");
	const [phone, setPhone] = useState("");
	const [isSaving, setIsSaving] = useState(false);
	const [hasChanged, setHasChanged] = useState(false);
	const previousSite = useRef<typeof site>(undefined);

	// initialize form fields when site data loads
	useEffect(() => {
		if (site && !name && !address && !phone) {
			setName(site.name);
			setAddress(site.address);
			setPhone(site.phone);
		}
	}, [site, name, address, phone]);

	// detect real-time changes from other admins
	useEffect(() => {
		if (!site || !previousSite.current) {
			previousSite.current = site;
			return;
		}

		const prev = previousSite.current;
		const curr = site;

		// check if any values changed
		if (
			prev.name !== curr.name ||
			prev.address !== curr.address ||
			prev.phone !== curr.phone
		) {
			// update form fields with new values
			setName(curr.name);
			setAddress(curr.address);
			setPhone(curr.phone);

			// show visual indicator
			setHasChanged(true);
			setTimeout(() => {
				setHasChanged(false);
			}, 2000);
		}

		previousSite.current = site;
	}, [site]);

	if (!site) {
		return (
			<div className="flex items-center justify-center py-8">
				<p className="text-gray-600">Loading site information...</p>
			</div>
		);
	}

	const isEdited = 
		name !== site.name ||
		address !== site.address ||
		phone !== site.phone;

	const handleSave = async () => {
		// validate inputs
		if (!name.trim()) {
			toast.error("Site name is required");
			return;
		}

		if (!address.trim()) {
			toast.error("Address is required");
			return;
		}

		if (!phone.trim()) {
			toast.error("Phone number is required");
			return;
		}

		setIsSaving(true);

		try {
			const result = await updateSiteInfo({
				siteId,
				name: name.trim(),
				address: address.trim(),
				phone: phone.trim(),
			});

			if (result.success) {
				toast.success("Site information updated successfully");
			} else {
				toast.error("Failed to update site information");
			}
		} catch (error) {
			toast.error("An error occurred while updating site information");
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div className="space-y-4">
			<h3 className="text-xl font-semibold">Site Information</h3>
			<Card className={hasChanged ? "ring-2 ring-blue-500 transition-all duration-300" : ""}>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<span>Edit Site Details</span>
						{hasChanged && (
							<span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
								Updated
							</span>
						)}
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div>
						<Label htmlFor="site-name">Site Name</Label>
						<Input
							id="site-name"
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							disabled={isSaving}
							placeholder="Enter site name"
							className="mt-1"
						/>
					</div>

					<div>
						<Label htmlFor="site-address">Address</Label>
						<Input
							id="site-address"
							type="text"
							value={address}
							onChange={(e) => setAddress(e.target.value)}
							disabled={isSaving}
							placeholder="Enter site address"
							className="mt-1"
						/>
					</div>

					<div>
						<Label htmlFor="site-phone">Phone Number</Label>
						<Input
							id="site-phone"
							type="tel"
							value={phone}
							onChange={(e) => setPhone(e.target.value)}
							disabled={isSaving}
							placeholder="Enter phone number"
							className="mt-1"
						/>
					</div>

					<div className="pt-4">
						<Button
							onClick={handleSave}
							disabled={!isEdited || isSaving}
							className="w-full md:w-auto"
						>
							{isSaving ? "Saving..." : "Save Changes"}
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
