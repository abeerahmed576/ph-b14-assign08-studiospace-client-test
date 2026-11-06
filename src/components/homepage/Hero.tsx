"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, RefreshCw } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import { fetchCarouselImages } from "@/lib/api/studios";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Carousel states                                                     */
/* ------------------------------------------------------------------ */

function CarouselSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-64 md:h-80 bg-secondary rounded-2xl" />
      <div className="flex justify-center gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <span key={i} className="size-2 rounded-full bg-secondary" />
        ))}
      </div>
    </div>
  );
}

function CarouselError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="h-64 md:h-80 rounded-2xl border border-border bg-card flex flex-col items-center justify-center gap-3 text-center px-4">
      <p className="text-sm text-muted-foreground font-sans max-w-xs">
        Studio gallery could not be loaded right now.
      </p>
      <button
        type="button"
        onClick={onRetry}
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
  );
}

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

export default function Hero() {
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isCurrent = true;

    const load = async () => {
      try {
        const data = await fetchCarouselImages();
        if (isCurrent) {
          setImages(data);
          setError(null);
          setIsLoading(false);
        }
      } catch (err: unknown) {
        if (isCurrent) {
          setError(
            err instanceof Error
              ? err.message
              : "An unexpected error occurred while loading the gallery.",
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

  // Loop mode needs extra slides beyond the max 3 visible at once
  const canLoop = images.length >= 4;
  const hasImages = images.length > 0;

  return (
    <section
      className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full"
      aria-label="StudioSpace hero"
    >
      <div className="mb-6 max-w-3xl space-y-6 text-center sm:text-start">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold tracking-tight text-foreground leading-[1.1]">
          Premium{" "}
          <span className="text-accent italic font-bold">Creative Studios</span>{" "}
          Built For Creators Who Value Quality.
        </h1>

        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl font-sans leading-relaxed">
          Discover photo cyc walls, sound stages, podcast lounges, and recording
          suites. Inspect real-time availability and reserve studio slots
          seamlessly.
        </p>

        <div className="flex flex-wrap items-center gap-4 pt-2">
          <Link
            href="/studios"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium text-sm sm:text-base text-center sm:text-start hover:opacity-90 transition-all shadow-sm group"
          >
            <span>Explore Studios</span>
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>

          <Link
            href="/dashboard/add-studio"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border bg-background text-foreground hover:bg-secondary font-medium text-sm sm:text-base text-center sm:text-start transition-colors"
          >
            <span className="text-center sm:text-start">Host Your Space</span>
          </Link>
        </div>
      </div>
      {/* ================= Studio carousel ================= */}
      <div className="min-w-0" aria-label="Featured studio photo slider">
        {isLoading ? (
          <CarouselSkeleton />
        ) : error ? (
          <CarouselError onRetry={() => setRetryCount((prev) => prev + 1)} />
        ) : hasImages ? (
          <>
            <Swiper
              modules={[Autoplay]}
              slidesPerView={1}
              spaceBetween={16}
              grabCursor
              loop={canLoop}
              speed={700}
              autoplay={{
                delay: 3500,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              breakpoints={{
                640: { slidesPerView: 1 },
                768: { slidesPerView: 2 },
                1024: { slidesPerView: 2.5 },
                1280: { slidesPerView: 3 },
              }}
              className="w-full"
            >
              {images.map((image, index) => (
                <SwiperSlide key={`${image}-${index}`} className="!h-auto">
                  {/* Card box per image */}
                  <div className="relative h-64 md:h-80 rounded-2xl border border-border bg-card overflow-hidden shadow-xs group">
                    <Image
                      src={image}
                      alt={`Featured studio photo ${index + 1}`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      unoptimized
                    />
                    <div
                      className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent pointer-events-none"
                      aria-hidden="true"
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </>
        ) : (
          <div className="h-64 md:h-80 rounded-2xl border border-dashed border-border bg-secondary/60 flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <p className="text-sm font-sans">No featured studio photos yet.</p>
          </div>
        )}
      </div>
    </section>
  );
}
