"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Site } from "@/types";
import { MapPin, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

interface SiteCardProps {
	site: Site;
	availableCount: number;
	onClick: () => void;
}

export function SiteCard({ site, availableCount, onClick }: SiteCardProps) {
	const [hasChanged, setHasChanged] = useState(false);
	const previousCount = useRef<number | undefined>(undefined);

	// detect real-time changes and show visual indicator
	useEffect(() => {
		if (previousCount.current !== undefined && previousCount.current !== availableCount) {
			setHasChanged(true);
			// clear the indicator after 2 seconds
			const timeout = setTimeout(() => {
				setHasChanged(false);
			}, 2000);
			return () => clearTimeout(timeout);
		}
		previousCount.current = availableCount;
	}, [availableCount]);

	return (
		<Card
			className={cn(
				"cursor-pointer transition-all duration-300 min-h-[44px] border-2 hover:shadow-md active:scale-[0.98]",
				hasChanged && "ring-2 ring-primary shadow-lg"
			)}
			style={{
				borderColor: "hsl(var(--border))",
			}}
			onMouseEnter={(e) => {
				e.currentTarget.style.borderColor = "hsl(var(--primary))";
			}}
			onMouseLeave={(e) => {
				e.currentTarget.style.borderColor = "hsl(var(--border))";
			}}
			onClick={onClick}
		>
			<CardContent className="p-6">
				<div className="space-y-4">
					{/* site name and available count */}
					<div className="flex items-start justify-between gap-4">
						<div className="flex-1">
							<h3 className="text-lg font-semibold leading-tight">{site.name}</h3>
						</div>
						<div className="text-right flex-shrink-0">
							<div className="flex items-center gap-2">
								<div className="text-3xl font-bold text-primary">
									{availableCount}
								</div>
								{hasChanged && (
									<span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full animate-pulse">
										Updated
									</span>
								)}
							</div>
							<p className="text-sm text-muted-foreground">Available</p>
						</div>
					</div>

					{/* site address */}
					<div className="flex items-start gap-2 text-sm text-muted-foreground">
						<MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
						<span className="leading-relaxed">{site.address}</span>
					</div>

					{/* site phone */}
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<Phone className="h-4 w-4 flex-shrink-0" />
						<span>{site.phone}</span>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
