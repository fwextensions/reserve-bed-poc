"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SiteCard } from "@/components/case-worker/SiteCard";
import { BedType } from "@/types";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

// bed type display configuration
const BED_TYPE_CONFIG: Record<
  BedType,
  { name: string; icon: string }
> = {
  apple: { name: "Apple", icon: "🍎" },
  orange: { name: "Orange", icon: "🍊" },
  lemon: { name: "Lemon", icon: "🍋" },
  grape: { name: "Grape", icon: "🍇" },
};

interface BedTypeDetailPageProps {
  params: Promise<{
    type: string;
  }>;
}

export default function BedTypeDetailPage({ params }: BedTypeDetailPageProps) {
  const router = useRouter();
  const { type } = React.use(params);
  const bedType = type as BedType;
  const config = BED_TYPE_CONFIG[bedType];

  // subscribe to bed availability by type
  const siteAvailability = useQuery(api.beds.getBedAvailabilityByType, {
    bedType,
  });

  // loading state
  if (siteAvailability === undefined) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="min-h-[44px] -ml-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="flex items-center gap-3 mb-6">
          <span className="text-4xl" role="img" aria-label={config.name}>
            {config.icon}
          </span>
          <h1 className="text-2xl font-bold">{config.name} Beds</h1>
        </div>
        <p className="text-muted-foreground">Loading availability...</p>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-[140px] bg-muted/50 rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  // filter sites with available beds
  const sitesWithBeds = siteAvailability.filter(
    (item: { site: any; availableCount: number }) => item.availableCount > 0
  );

  const handleSiteClick = (siteId: string) => {
    // navigate to reservation flow with pre-selected bed type and site
    router.push(`/reserve?bedType=${bedType}&siteId=${siteId}`);
  };

  return (
    <div className="space-y-6">
      {/* back button */}
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="min-h-[44px] -ml-2"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      {/* header section */}
      <div className="flex items-center gap-3">
        <span className="text-4xl" role="img" aria-label={config.name}>
          {config.icon}
        </span>
        <div>
          <h1 className="text-2xl font-bold">{config.name} Beds</h1>
          <p className="text-sm text-muted-foreground">
            {sitesWithBeds.length} {sitesWithBeds.length === 1 ? "site" : "sites"} available
          </p>
        </div>
      </div>

      {/* site cards - single column layout for mobile */}
      {sitesWithBeds.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">
            No {config.name.toLowerCase()} beds are currently available at any site.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Please check back later or try a different bed type.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sitesWithBeds.map((item: { site: any; availableCount: number }) => (
            <SiteCard
              key={item.site._id}
              site={item.site}
              availableCount={item.availableCount}
              onClick={() => handleSiteClick(item.site._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
