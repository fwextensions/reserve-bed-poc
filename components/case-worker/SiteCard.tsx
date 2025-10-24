"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Site } from "@/types";
import { MapPin, Phone } from "lucide-react";

interface SiteCardProps {
	site: Site;
	availableCount: number;
	onClick: () => void;
}

export function SiteCard({ site, availableCount, onClick }: SiteCardProps) {
	return (
		<Card
			className="cursor-pointer transition-all duration-100 min-h-[44px] hover:bg-accent active:bg-accent/80 border-2"
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
							<div className="text-3xl font-bold text-primary">
								{availableCount}
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
