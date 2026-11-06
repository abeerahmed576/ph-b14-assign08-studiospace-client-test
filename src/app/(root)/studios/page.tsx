"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, SlidersHorizontal, AlertCircle, RefreshCw, Sparkles } from "lucide-react";
import { fetchStudios } from "@/lib/api/studios";
import { StudioCard } from "@/components/shared/StudioCard";
import { StudioGridSkeleton } from "@/components/shared/StudioSkeleton";
import type { Studio } from "@/types/studio";

const CATEGORY_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All Spaces" },
  { value: "photo", label: "Photography" },
  { value: "video", label: "Film & Video" },
  { value: "lounge", label: "Podcast Lounge" },
  { value: "music", label: "Music Suite" },
  { value: "workshop", label: "Art Workshop" },
];

function StudiosListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get("category") || "";

  const [studios, setStudios] = useState<Studio[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);

  useEffect(() => {
    let isCurrent = true;
    // Asynchronous fetch callback prevents synchronous setState in effect
    const executeFetch = async () => {
      try {
        const data = await fetchStudios(selectedCategory || undefined);
        if (isCurrent) {
          setStudios(data);
          setError(null);
          setIsLoading(false);
        }
      } catch (err: unknown) {
        if (isCurrent) {
          const message =
            err instanceof Error
              ? err.message
              : "An unexpected error occurred while loading studios.";
          setError(message);
          setIsLoading(false);
        }
      }
    };

    executeFetch();

    return () => {
      isCurrent = false;
    };
  }, [selectedCategory, retryCount]);

  const handleCategoryChange = (newCat: string) => {
    setIsLoading(true);
    if (newCat) {
      router.replace(`/studios?category=${encodeURIComponent(newCat)}`, { scroll: false });
    } else {
      router.replace("/studios", { scroll: false });
    }
  };

  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    setRetryCount((prev) => prev + 1);
  };

  const handleResetFilter = () => {
    handleCategoryChange("");
  };

  return (
    <div className="space-y-8">
      {/* ================= Filter Controls & Count Bar ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        {/* Left: Results Count */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground font-sans">
          <Sparkles className="size-4 text-accent shrink-0" />
          <span>
            {isLoading ? (
              "Discovering creative spaces..."
            ) : error ? (
              "Error loading spaces"
            ) : (
              <>
                Showing{" "}
                <span className="font-semibold text-foreground">
                  {studios.length}
                </span>{" "}
                {studios.length === 1 ? "creative space" : "creative spaces"}
                {selectedCategory && (
                  <span className="ml-1 text-xs text-accent">
                    (in {CATEGORY_OPTIONS.find((c) => c.value === selectedCategory)?.label || selectedCategory})
                  </span>
                )}
              </>
            )}
          </span>
        </div>

        {/* Right: Category Filter Select Input */}
        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          <label
            htmlFor="category-select"
            className="text-xs uppercase tracking-wider font-semibold text-muted-foreground whitespace-nowrap flex items-center gap-1.5"
          >
            <SlidersHorizontal className="size-3.5 text-accent" />
            <span>Category:</span>
          </label>
          <div className="relative">
            <select
              id="category-select"
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="appearance-none pl-3.5 pr-9 py-2 rounded-xl border border-border bg-card text-foreground text-sm font-medium shadow-2xs hover:border-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors cursor-pointer"
              aria-label="Filter studios by category"
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-card text-foreground">
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown
              className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>

      {/* ================= Main Content States ================= */}
      {/* 1. Loading State */}
      {isLoading && <StudioGridSkeleton count={6} />}

      {/* 2. Error State */}
      {!isLoading && error && (
        <div className="p-8 md:p-12 rounded-2xl border border-destructive/20 bg-destructive/5 text-center max-w-xl mx-auto space-y-4">
          <div className="size-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
            <AlertCircle className="size-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-heading font-semibold text-lg text-foreground">
              Unable to Load Studios
            </h3>
            <p className="text-sm text-muted-foreground font-sans max-w-md mx-auto">
              {error}
            </p>
          </div>
          <button
            type="button"
            onClick={handleRetry}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity shadow-xs cursor-pointer"
          >
            <RefreshCw className="size-4" />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {/* 3. Empty State */}
      {!isLoading && !error && studios.length === 0 && (
        <div className="p-12 md:p-16 rounded-2xl border border-border bg-card text-center max-w-xl mx-auto space-y-4 shadow-xs">
          <div className="size-12 rounded-full bg-secondary text-muted-foreground flex items-center justify-center mx-auto">
            <SlidersHorizontal className="size-6 text-accent" />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-heading font-semibold text-lg text-foreground">
              No Studios Found
            </h3>
            <p className="text-sm text-muted-foreground font-sans max-w-md mx-auto">
              {selectedCategory
                ? "No production spaces currently match the selected category. Try selecting another category or view all spaces."
                : "No studios are currently listed. Please check back soon."}
            </p>
          </div>
          {selectedCategory && (
            <button
              type="button"
              onClick={handleResetFilter}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border bg-background hover:bg-secondary text-foreground text-sm font-medium transition-colors cursor-pointer"
            >
              <span>View All Spaces</span>
            </button>
          )}
        </div>
      )}

      {/* 4. Success Grid State */}
      {!isLoading && !error && studios.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {studios.map((studio, idx) => (
            <StudioCard key={studio._id || idx} studio={studio} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function StudiosPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 space-y-8">
      {/* Section Header */}
      <div className="space-y-3 max-w-2xl">
        <span className="text-xs uppercase tracking-[0.2em] text-accent font-semibold">
          • OUR SPACES
        </span>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold tracking-tight text-foreground">
          Explore <span className="text-accent italic">Creative Studios</span>
        </h1>
        <p className="text-base text-muted-foreground font-sans leading-relaxed">
          Discover photography cyc walls, cinema sound stages, podcast lounges, and recording suites built for creators who value quality.
        </p>
      </div>

      {/* Suspense boundary for useSearchParams compliance in App Router */}
      <Suspense fallback={<StudioGridSkeleton count={6} />}>
        <StudiosListContent />
      </Suspense>
    </div>
  );
}
