import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { BedType } from "@/types";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// date formatting utilities
export function formatTimestamp(timestamp: number): string {
	const date = new Date(timestamp);
	return date.toLocaleString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit",
		hour12: true,
	});
}

export function formatTimeAgo(timestamp: number): string {
	const now = Date.now();
	const diff = now - timestamp;
	const seconds = Math.floor(diff / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);

	if (days > 0) return `${days}d ago`;
	if (hours > 0) return `${hours}h ago`;
	if (minutes > 0) return `${minutes}m ago`;
	return `${seconds}s ago`;
}

export function formatCountdown(expiresAt: number): string {
	const now = Date.now();
	const remaining = Math.max(0, expiresAt - now);
	const seconds = Math.ceil(remaining / 1000);
	return `${seconds}s`;
}

export function getRemainingSeconds(expiresAt: number): number {
	const now = Date.now();
	const remaining = Math.max(0, expiresAt - now);
	return Math.ceil(remaining / 1000);
}

// bed type display utilities
export function getBedTypeLabel(bedType: BedType): string {
	const labels: Record<BedType, string> = {
		apple: "Apple",
		orange: "Orange",
		lemon: "Lemon",
		grape: "Grape",
	};
	return labels[bedType];
}

export function getBedTypeIcon(bedType: BedType): string {
	const icons: Record<BedType, string> = {
		apple: "🍎",
		orange: "🍊",
		lemon: "🍋",
		grape: "🍇",
	};
	return icons[bedType];
}

export function getBedTypeColor(bedType: BedType): string {
	const colors: Record<BedType, string> = {
		apple: "bg-red-100 text-red-800 border-red-200",
		orange: "bg-orange-100 text-orange-800 border-orange-200",
		lemon: "bg-yellow-100 text-yellow-800 border-yellow-200",
		grape: "bg-purple-100 text-purple-800 border-purple-200",
	};
	return colors[bedType];
}
