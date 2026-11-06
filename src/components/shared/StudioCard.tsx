"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, MapPin, ArrowRight, Sparkles } from "lucide-react";
import type { Studio, StudioCategory } from "@/types/studio";
import { cn } from "@/lib/utils";

interface StudioCardProps {
  studio: Studio;
}

const CATEGORY_LABELS: Record<StudioCategory, string> = {
  photo: "Photography",
  video: "Film & Video",
  lounge: "Podcast Lounge",
  music: "Music Suite",
  workshop: "Art Workshop",
};

export function StudioCard({ studio }: StudioCardProps) {
  const [imgError, setImgError] = useState(false);
  const studioId = studio._id || "";
  const firstImage =
    studio.images && studio.images.length > 0 ? studio.images[0] : "";
  const categoryLabel =
    CATEGORY_LABELS[studio.category] || studio.category || "Studio";

  return (
    <article
      className={cn(
        "group h-full flex flex-col rounded-2xl border border-border bg-card",
        "shadow-xs hover:shadow-md hover:border-accent/40",
        "transition-all duration-300 overflow-hidden",
      )}
    >
      {/* ================= Gradual Shadowed Photo Header ================= */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-secondary">
        {firstImage && !imgError ? (
          <Image
            src={firstImage}
            alt={studio.title || "Studio photo"}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            onError={() => setImgError(true)}
            unoptimized
          />
        ) : (
          <div className="size-full flex flex-col items-center justify-center text-muted-foreground bg-secondary/80 gap-2">
            <Sparkles className="size-8 text-accent/60" />
            <span className="text-xs font-sans">StudioSpace</span>
          </div>
        )}

        {/* Gradual Shadow Overlay for rich depth & contrast */}
        <div
          className="absolute inset-0 bg-linear-to-t from-black/85 via-black/30 to-transparent pointer-events-none"
          aria-hidden="true"
        />

        {/* Overlaid Badges (Top Row) */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none z-10">
          {/* Category Badge */}
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-background/90 text-foreground backdrop-blur-md border border-border/60 shadow-xs">
            {categoryLabel}
          </span>

          {/* Rating */}
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-background/90 text-foreground backdrop-blur-md border border-border/60 shadow-xs">
            <Star className="size-3.5 fill-[#C9A44C] text-[#C9A44C]" />
            <span>{studio.rating ? studio.rating.toFixed(1) : "0.0"}</span>
          </span>
        </div>

        {/* Overlaid Price (Bottom Row) */}
        <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-end justify-between pointer-events-none z-10 text-white">
          <div className="flex items-baseline gap-1 drop-shadow-sm">
            <span className="text-2xl font-heading font-bold text-white tracking-tight">
              ${studio.hourlyRate}
            </span>
            <span className="text-xs text-white/80 font-sans font-medium">
              / hr
            </span>
          </div>

          {typeof studio.capacity === "number" && (
            <span className="text-xs text-white/80 font-sans font-medium drop-shadow-sm">
              Up to {studio.capacity} guests
            </span>
          )}
        </div>
      </div>

      {/* ================= Card Body ================= */}
      <div className="p-5 sm:p-6 flex flex-col justify-between flex-1 gap-4">
        <div className="space-y-2">
          {/* Title */}
          <h3 className="font-heading font-semibold text-lg sm:text-xl text-foreground line-clamp-1 group-hover:text-accent transition-colors">
            {studio.title}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-sans line-clamp-1">
            <MapPin className="size-3.5 shrink-0 text-accent" />
            <span className="truncate">
              {studio.address || "Location available on request"}
            </span>
          </div>

          {/* Amenities snippet if available */}
          {studio.amenities && studio.amenities.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {studio.amenities.slice(0, 3).map((amenity) => (
                <span
                  key={amenity}
                  className="px-2 py-0.5 rounded-md bg-secondary text-[11px] text-muted-foreground font-sans"
                >
                  {amenity}
                </span>
              ))}
              {studio.amenities.length > 3 && (
                <span className="px-1.5 py-0.5 text-[11px] text-muted-foreground font-sans">
                  +{studio.amenities.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* View Details Button */}
        <Link
          href={`/studios/${studioId}`}
          className={cn(
            "w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-full",
            "border border-border bg-background hover:bg-primary hover:text-primary-foreground hover:border-transparent",
            "text-foreground text-sm font-medium transition-all duration-200 shadow-2xs group/btn",
          )}
        >
          <span>View Details</span>
          <ArrowRight className="size-3.5 transition-transform duration-200 group-hover/btn:translate-x-1" />
        </Link>
      </div>
    </article>
  );
}
