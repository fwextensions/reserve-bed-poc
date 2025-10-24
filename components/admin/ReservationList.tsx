"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { BedType } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface ReservationListProps {
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

export function ReservationList({ siteId }: ReservationListProps) {
	const reservations = useQuery(api.reservations.getReservations, { siteId });
	const releaseReservation = useMutation(api.reservations.releaseReservation);

	const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
	const [selectedReservationId, setSelectedReservationId] = useState<Id<"reservations"> | null>(null);
	const [releasing, setReleasing] = useState(false);
	const [newReservationIds, setNewReservationIds] = useState<Set<Id<"reservations">>>(new Set());
	const previousReservations = useRef<typeof reservations>(undefined);

	// detect new reservations for visual indicator
	useEffect(() => {
		if (!reservations || !previousReservations.current) {
			previousReservations.current = reservations;
			return;
		}

		const prevIds = new Set(previousReservations.current.map((r) => r._id));
		const newIds = new Set<Id<"reservations">>();

		for (const reservation of reservations) {
			if (!prevIds.has(reservation._id)) {
				newIds.add(reservation._id);
			}
		}

		if (newIds.size > 0) {
			setNewReservationIds(newIds);
			// clear the indicator after 3 seconds
			setTimeout(() => {
				setNewReservationIds(new Set());
			}, 3000);
		}

		previousReservations.current = reservations;
	}, [reservations]);

	if (reservations === undefined) {
		return (
			<div className="flex items-center justify-center py-8">
				<p className="text-gray-600">Loading reservations...</p>
			</div>
		);
	}

	const handleReleaseClick = (reservationId: Id<"reservations">) => {
		setSelectedReservationId(reservationId);
		setConfirmDialogOpen(true);
	};

	const handleConfirmRelease = async () => {
		if (!selectedReservationId) return;

		setReleasing(true);

		try {
			const result = await releaseReservation({
				reservationId: selectedReservationId,
			});

			if (result.success) {
				toast.success("Reservation released successfully");
				setConfirmDialogOpen(false);
				setSelectedReservationId(null);
			} else {
				toast.error(result.error || "Failed to release reservation");
			}
		} catch (error) {
			toast.error("An error occurred while releasing the reservation");
		} finally {
			setReleasing(false);
		}
	};

	const handleCancelRelease = () => {
		setConfirmDialogOpen(false);
		setSelectedReservationId(null);
	};

	const formatTimestamp = (timestamp: number) => {
		const date = new Date(timestamp);
		return date.toLocaleString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
			hour: "numeric",
			minute: "2-digit",
			hour12: true,
		});
	};

	return (
		<div className="space-y-4">
			<h3 className="text-xl font-semibold">Active Reservations</h3>

			{reservations.length === 0 ? (
				<Card>
					<CardContent className="py-12">
						<div className="text-center text-gray-500">
							<p className="text-lg">No active reservations</p>
							<p className="text-sm mt-2">Reservations will appear here when case workers complete bookings</p>
						</div>
					</CardContent>
				</Card>
			) : (
				<div className="overflow-x-auto">
					<table className="w-full border-collapse">
						<thead>
							<tr className="border-b bg-gray-50">
								<th className="text-left p-3 font-semibold">Bed Type</th>
								<th className="text-left p-3 font-semibold">Client Name</th>
								<th className="text-left p-3 font-semibold">Notes</th>
								<th className="text-left p-3 font-semibold">Case Worker</th>
								<th className="text-left p-3 font-semibold">Reserved At</th>
								<th className="text-left p-3 font-semibold">Actions</th>
							</tr>
						</thead>
						<tbody>
							{reservations.map((reservation) => {
								const isNew = newReservationIds.has(reservation._id);
								return (
									<tr
										key={reservation._id}
										className={`border-b hover:bg-gray-50 transition-colors ${
											isNew ? "bg-blue-50 animate-pulse" : ""
										}`}
									>
										<td className="p-3">
											<div className="flex items-center gap-2">
												<span className="text-2xl">{BED_TYPE_ICONS[reservation.bedType]}</span>
												<span>{BED_TYPE_LABELS[reservation.bedType]}</span>
												{isNew && (
													<span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
														New
													</span>
												)}
											</div>
										</td>
										<td className="p-3 font-medium">{reservation.clientName}</td>
										<td className="p-3 max-w-xs truncate" title={reservation.notes}>
											{reservation.notes}
										</td>
										<td className="p-3">{reservation.caseWorkerName}</td>
										<td className="p-3 text-sm text-gray-600">
											{formatTimestamp(reservation.createdAt)}
										</td>
										<td className="p-3">
											<Button
												variant="destructive"
												size="sm"
												onClick={() => handleReleaseClick(reservation._id)}
											>
												Release
											</Button>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			)}

			<Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Confirm Release</DialogTitle>
						<DialogDescription>
							Are you sure you want to release this reservation? This will make the bed available for other
							case workers to reserve.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={handleCancelRelease} disabled={releasing}>
							Cancel
						</Button>
						<Button variant="destructive" onClick={handleConfirmRelease} disabled={releasing}>
							{releasing ? "Releasing..." : "Release Reservation"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
