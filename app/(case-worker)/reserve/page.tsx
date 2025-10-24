"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { BedType } from "@/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import { HoldTimer } from "@/components/case-worker/HoldTimer";

// reservation flow steps
type ReservationStep = "bedType" | "site" | "clientInfo";

// bed type display configuration
const BED_TYPE_CONFIG: Record<BedType, { name: string; icon: string }> = {
	apple: { name: "Apple", icon: "🍎" },
	orange: { name: "Orange", icon: "🍊" },
	lemon: { name: "Lemon", icon: "🍋" },
	grape: { name: "Grape", icon: "🍇" },
};

export default function ReservationFlowPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const user = useQuery(api.users.getCurrentUserWithRole);

	// get pre-selected values from URL params
	const preselectedBedType = searchParams.get("bedType") as BedType | null;
	const preselectedSiteId = searchParams.get("siteId");

	// local state for form
	const [currentStep, setCurrentStep] = useState<ReservationStep>("bedType");
	const [selectedBedType, setSelectedBedType] = useState<BedType | null>(
		preselectedBedType
	);
	const [selectedSiteId, setSelectedSiteId] = useState<string | null>(
		preselectedSiteId
	);
	const [holdExpiresAt, setHoldExpiresAt] = useState<number | null>(null);
	const [clientName, setClientName] = useState("");
	const [notes, setNotes] = useState("");
	const [isPlacingHold, setIsPlacingHold] = useState(false);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// queries
	const bedAvailability = useQuery(api.beds.getBedAvailability);
	const siteAvailability = useQuery(
		api.beds.getBedAvailabilityByType,
		selectedBedType ? { bedType: selectedBedType } : "skip"
	);
	const activeHold = useQuery(
		api.holds.getActiveHold,
		user ? { userId: user._id as Id<"users"> } : "skip"
	);

	// mutations
	const placeHold = useMutation(api.holds.placeHold);
	const refreshHold = useMutation(api.holds.refreshHold);
	const createReservation = useMutation(api.reservations.createReservation);
	const releaseHold = useMutation(api.holds.releaseHold);

	// sync local hold state with backend hold
	useEffect(() => {
		if (activeHold && currentStep === "clientInfo") {
			setHoldExpiresAt(activeHold.expiresAt);
			setSelectedSiteId(activeHold.siteId);
			setSelectedBedType(activeHold.bedType);
		}
	}, [activeHold, currentStep]);

	// determine initial step based on pre-selected values and place hold if needed
	// this effect should only run once on mount to set up the initial state
	useEffect(() => {
		if (!user) return;

		// check if we already have an active hold - if so, use it
		if (activeHold) {
			setCurrentStep("clientInfo");
			setHoldExpiresAt(activeHold.expiresAt);
			setSelectedSiteId(activeHold.siteId);
			setSelectedBedType(activeHold.bedType);
			return;
		}

		// only place a new hold if we don't have one and haven't started placing one
		if (preselectedBedType && preselectedSiteId && !isPlacingHold) {
			// both pre-selected, place hold immediately
			setCurrentStep("clientInfo");
			handlePlaceHold(preselectedBedType, preselectedSiteId);
		} else if (preselectedBedType && !preselectedSiteId) {
			// only bed type pre-selected, go to site selection
			setCurrentStep("site");
		} else if (!preselectedBedType && !preselectedSiteId) {
			// nothing pre-selected, start at bed type
			setCurrentStep("bedType");
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user]); // only run when user loads, not when activeHold changes

	const handlePlaceHold = async (bedType: BedType, siteId: string) => {
		if (!user) return;

		setIsPlacingHold(true);
		try {
			const result = await placeHold({
				userId: user._id as Id<"users">,
				siteId: siteId as Id<"sites">,
				bedType,
			});

			if (result.success) {
				setSelectedSiteId(siteId);
				setHoldExpiresAt(Date.now() + 30000); // 30 seconds from now
				setCurrentStep("clientInfo");
			} else {
				toast.error("Unable to place hold", {
					description: result.error,
				});
				// reset selection if hold fails
				if (!preselectedBedType) {
					setSelectedBedType(null);
					setCurrentStep("bedType");
				} else if (!preselectedSiteId) {
					setCurrentStep("site");
				}
			}
		} catch (error) {
			toast.error("Error", {
				description: "Failed to place hold. Please try again.",
			});
		} finally {
			setIsPlacingHold(false);
		}
	};

	const handleBedTypeSelect = (bedType: BedType) => {
		setSelectedBedType(bedType);
		setCurrentStep("site");
	};

	const handleSiteSelect = async (siteId: string) => {
		if (!selectedBedType) return;

		await handlePlaceHold(selectedBedType, siteId);
	};

	const handleRefreshHold = async () => {
		if (!user || !selectedBedType || !selectedSiteId) return;

		setIsRefreshing(true);
		try {
			// try to place a new hold (this will work whether the old one exists or not)
			const result = await placeHold({
				userId: user._id as Id<"users">,
				siteId: selectedSiteId as Id<"sites">,
				bedType: selectedBedType,
			});

			if (result.success) {
				setHoldExpiresAt(Date.now() + 30000); // 30 seconds from now
				toast.success("Hold refreshed", {
					description: "You have another 30 seconds to complete the reservation.",
				});
			} else {
				toast.error("Unable to refresh hold", {
					description: result.error,
				});
				// navigate back if refresh fails
				router.push("/");
			}
		} catch (error) {
			toast.error("Error", {
				description: "Failed to refresh hold. Please try again.",
			});
		} finally {
			setIsRefreshing(false);
		}
	};

	const handleHoldExpire = () => {
		toast.error("Hold expired", {
			description: "Your hold has expired. Please refresh to continue.",
		});
	};

	const handleSubmitReservation = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!user || !selectedBedType || !selectedSiteId) return;

		// validate inputs
		if (!clientName.trim()) {
			toast.error("Validation error", {
				description: "Client name is required",
			});
			return;
		}

		setIsSubmitting(true);
		try {
			const result = await createReservation({
				userId: user._id as Id<"users">,
				siteId: selectedSiteId as Id<"sites">,
				bedType: selectedBedType,
				clientName: clientName.trim(),
				notes: notes.trim() || undefined,
			});

			if (result.success) {
				toast.success("Reservation confirmed", {
					description: "The bed has been successfully reserved for your client.",
				});
				// navigate back to dashboard
				router.push("/");
			} else {
				toast.error("Unable to create reservation", {
					description: result.error,
				});
			}
		} catch (error) {
			toast.error("Error", {
				description: "Failed to create reservation. Please try again.",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleCancel = async () => {
		// if there's an active hold, release it
		if (activeHold && user) {
			try {
				await releaseHold({
					userId: user._id as Id<"users">,
				});
			} catch (error) {
				// silently fail - user is canceling anyway
				console.error("Failed to release hold:", error);
			}
		}

		router.back();
	};

	// loading state
	if (user === undefined) {
		return (
			<div className="space-y-4">
				<p className="text-muted-foreground">Loading...</p>
			</div>
		);
	}

	if (!user) {
		return null;
	}

	return (
		<div className="space-y-6">
			{/* header with back button */}
			<div className="flex items-center justify-between">
				<Button
					variant="ghost"
					onClick={handleCancel}
					className="min-h-[44px] -ml-2"
				>
					<ArrowLeft className="mr-2 h-4 w-4" />
					Cancel
				</Button>
			</div>

			{/* step indicator */}
			<div className="flex flex-col gap-2">
				<h1 className="text-2xl font-bold">Reserve a Bed</h1>
				<p className="text-sm text-muted-foreground">
					{currentStep === "bedType" && "Step 1: Select bed type"}
					{currentStep === "site" && "Step 2: Select site"}
					{currentStep === "clientInfo" && "Step 3: Enter client information"}
				</p>
			</div>

			{/* step content */}
			<div className="space-y-4">
				{/* bed type selection */}
				{currentStep === "bedType" && (
					<div className="space-y-4">
						<p className="text-sm text-muted-foreground">
							Select the type of bed you need for your client
						</p>

						{bedAvailability === undefined ? (
							<div className="space-y-3">
								{[1, 2, 3, 4].map((i) => (
									<div
										key={i}
										className="h-[80px] bg-muted/50 rounded-xl animate-pulse"
									/>
								))}
							</div>
						) : (
							<div className="flex flex-col gap-3">
								{(["apple", "orange", "lemon", "grape"] as BedType[]).map(
									(bedType) => {
										const config = BED_TYPE_CONFIG[bedType];
										const available = bedAvailability[bedType] || 0;

										return (
											<button
												key={bedType}
												onClick={() => handleBedTypeSelect(bedType)}
												disabled={available === 0}
												className="flex items-center justify-between p-4 bg-white border-2 border-gray-200 rounded-xl min-h-[80px] hover:border-primary hover:shadow-md active:bg-blue-50 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
											>
												<div className="flex items-center gap-3">
													<span className="text-3xl" role="img" aria-label={config.name}>
														{config.icon}
													</span>
													<div className="text-left">
														<p className="font-semibold text-lg">{config.name}</p>
														<p className="text-sm text-muted-foreground">
															{available} available
														</p>
													</div>
												</div>
											</button>
										);
									}
								)}
							</div>
						)}
					</div>
				)}

				{/* site selection */}
				{currentStep === "site" && selectedBedType && (
					<div className="space-y-4">
						<p className="text-sm text-muted-foreground">
							Select a site with available {BED_TYPE_CONFIG[selectedBedType].name.toLowerCase()} beds
						</p>

						{siteAvailability === undefined ? (
							<div className="space-y-3">
								{[1, 2, 3].map((i) => (
									<div
										key={i}
										className="h-[120px] bg-muted/50 rounded-xl animate-pulse"
									/>
								))}
							</div>
						) : isPlacingHold ? (
							<div className="text-center py-12">
								<p className="text-lg text-muted-foreground">Placing hold...</p>
							</div>
						) : (
							<div className="flex flex-col gap-3">
								{siteAvailability
									.filter((item) => item.availableCount > 0)
									.map((item) => (
										<button
											key={item.site._id}
											onClick={() => handleSiteSelect(item.site._id)}
											className="flex flex-col gap-2 p-4 bg-white border-2 border-gray-200 rounded-xl min-h-[120px] hover:border-primary hover:shadow-md active:bg-blue-50 active:scale-[0.98] transition-all text-left"
										>
											<div className="flex items-start justify-between">
												<div className="flex-1">
													<p className="font-semibold text-lg">{item.site.name}</p>
													<p className="text-sm text-muted-foreground mt-1">
														{item.site.address}
													</p>
													<p className="text-sm text-muted-foreground">
														{item.site.phone}
													</p>
												</div>
												<div className="text-right">
													<p className="text-2xl font-bold text-blue-600">
														{item.availableCount}
													</p>
													<p className="text-xs text-muted-foreground">available</p>
												</div>
											</div>
										</button>
									))}
							</div>
						)}
					</div>
				)}

				{/* client info */}
				{currentStep === "clientInfo" && holdExpiresAt && (
					<div className="space-y-6">
						{/* hold timer */}
						<HoldTimer
							holdExpiresAt={holdExpiresAt}
							onRefresh={handleRefreshHold}
							onExpire={handleHoldExpire}
							isRefreshing={isRefreshing}
						/>

						{/* client information form */}
						<form onSubmit={handleSubmitReservation} className="space-y-4">
							<div className="space-y-2">
								<label
									htmlFor="clientName"
									className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
								>
									Client Name <span className="text-red-500">*</span>
								</label>
								<input
									id="clientName"
									type="text"
									value={clientName}
									onChange={(e) => setClientName(e.target.value)}
									placeholder="Enter client's full name"
									disabled={isSubmitting}
									className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
									required
								/>
							</div>

							<div className="space-y-2">
								<label
									htmlFor="notes"
									className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
								>
									Notes
								</label>
								<textarea
									id="notes"
									value={notes}
									onChange={(e) => setNotes(e.target.value)}
									placeholder="Enter any special needs or notes about the client (optional)"
									disabled={isSubmitting}
									rows={4}
									className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
								/>
							</div>

							<Button
								type="submit"
								disabled={isSubmitting}
								className="w-full min-h-[44px]"
								size="lg"
							>
								{isSubmitting ? "Confirming..." : "Confirm Reservation"}
							</Button>
						</form>
					</div>
				)}
			</div>
		</div>
	);
}
