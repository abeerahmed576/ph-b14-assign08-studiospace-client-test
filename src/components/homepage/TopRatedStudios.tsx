"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, RefreshCw, Star } from "lucide-react";
import { fetchTopRatedStudios } from "@/lib/api/studios";
import { StudioCard } from "@/components/shared/StudioCard";
import { StudioGridSkeleton } from "@/components/shared/StudioSkeleton";
import type { Studio } from "@/types/studio";
import { cn } from "@/lib/utils";

export function TopRatedStudios() {
  const [studios, setStudios] = useState<Studio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isCurrent = true;

    const load = async () => {
      try {
        const data = await fetchTopRatedStudios();
        if (isCurrent) {
          setStudios(data);
          setError(null);
          setIsLoading(false);
        }
      } catch (err: unknown) {
        if (isCurrent) {
          setError(
            err instanceof Error
              ? err.message
              : "An unexpected error occurred while loading top-rated studios.",
          );
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      isCurrent = false;
    };
  }, [retryCount]);

  return (
    <section
      aria-labelledby="top-rated-heading"
      className="bg-background-alt py-16 md:py-24"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ================= Section heading ================= */}
        <div className="flex flex-wrap items-end justify-between gap-6 mb-8 md:mb-12">
          <div className="space-y-3">
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              • Timely Bookings
            </span>
            <h2
              id="top-rated-heading"
              className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground"
            >
              Our <span className="text-accent italic font-bold">Top Rated</span>{" "}
              Studios
            </h2>
            <p className="text-base text-muted-foreground font-sans max-w-xl">
              Hand-picked spaces that creators keep coming back to — vetted for
              quality, booked with confidence.
            </p>
          </div>

          <Link
            href="/studios"
            className={cn(
              "inline-flex items-center gap-2 px-6 py-3 rounded-full",
              "border border-border bg-background text-foreground font-medium text-sm",
              "hover:bg-secondary transition-colors group shrink-0",
            )}
          >
            <span>View All Studios</span>
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* ================= States ================= */}
        {isLoading ? (
          <StudioGridSkeleton count={6} />
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <span className="size-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
              <RefreshCw className="size-6" aria-hidden="true" />
            </span>
            <p className="text-sm text-muted-foreground max-w-sm font-sans">
              {error}
            </p>
            <button
              type="button"
              onClick={() => setRetryCount((prev) => prev + 1)}
              className={cn(
                "inline-flex items-center gap-2 px-5 py-2.5 rounded-full",
                "border border-border bg-background text-foreground text-sm font-medium",
                "hover:bg-secondary transition-colors cursor-pointer",
                "outline-none focus-visible:ring-2 focus-visible:ring-ring",
              )}
            >
              <RefreshCw className="size-4" aria-hidden="true" />
              <span>Try Again</span>
            </button>
          </div>
        ) : studios.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <span className="size-12 rounded-full bg-secondary text-muted-foreground flex items-center justify-center">
              <Star className="size-6" aria-hidden="true" />
            </span>
            <p className="text-sm text-muted-foreground max-w-sm font-sans">
              No studios have been rated yet. Be the first to book and review a
              space.
            </p>
          </div>
        ) : (
          /* ================= Studio grid ================= */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {studios.map((studio) => (
              <StudioCard key={studio._id} studio={studio} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
