"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";
import {
	Alert,
	AlertDescription,
	AlertTitle,
} from "@/components/ui/alert";

interface HoldTimerProps {
	holdExpiresAt: number;
	onRefresh: () => void;
	onExpire: () => void;
	isRefreshing?: boolean;
}

export function HoldTimer({
	holdExpiresAt,
	onRefresh,
	onExpire,
	isRefreshing = false,
}: HoldTimerProps) {
	const [timeRemaining, setTimeRemaining] = useState(0);
	const [hasExpired, setHasExpired] = useState(false);

	useEffect(() => {
		const updateTimer = () => {
			const now = Date.now();
			const remaining = Math.max(0, holdExpiresAt - now);
			setTimeRemaining(remaining);

			if (remaining === 0 && !hasExpired) {
				setHasExpired(true);
				onExpire();
			}
		};

		// update immediately
		updateTimer();

		// update every 100ms for smooth countdown
		const interval = setInterval(updateTimer, 100);

		return () => clearInterval(interval);
	}, [holdExpiresAt, hasExpired, onExpire]);

	const seconds = Math.ceil(timeRemaining / 1000);
	const isLowTime = seconds <= 10 && seconds > 0;

	if (hasExpired) {
		return (
			<Alert variant="destructive">
				<AlertCircle className="h-4 w-4" />
				<AlertTitle>Hold Expired</AlertTitle>
				<AlertDescription className="space-y-3">
					<p>Your hold has expired. You can try to refresh it if beds are still available.</p>
					<Button
						onClick={onRefresh}
						disabled={isRefreshing}
						variant="outline"
						size="sm"
						className="w-full min-h-[44px]"
					>
						{isRefreshing ? (
							<>
								<RefreshCw className="mr-2 h-4 w-4 animate-spin" />
								Refreshing...
							</>
						) : (
							<>
								<RefreshCw className="mr-2 h-4 w-4" />
								Refresh Hold
							</>
						)}
					</Button>
				</AlertDescription>
			</Alert>
		);
	}

	return (
		<div
			className={`p-4 rounded-lg border-2 ${
				isLowTime
					? "bg-red-50 border-red-300"
					: "bg-blue-50 border-blue-300"
			}`}
		>
			<div className="flex items-center justify-between">
				<div>
					<p className="text-sm font-medium">Hold Active</p>
					<p className="text-xs text-muted-foreground">
						Complete reservation before time expires
					</p>
				</div>
				<div className="text-right">
					<p
						className={`text-3xl font-bold ${
							isLowTime ? "text-red-600" : "text-blue-600"
						}`}
					>
						{seconds}
					</p>
					<p className="text-xs text-muted-foreground">seconds</p>
				</div>
			</div>
		</div>
	);
}
