"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Star,
  MapPin,
  Sparkles,
  Check,
  CalendarDays,
  X,
  Loader2,
  RefreshCw,
  Users,
  User as UserIcon,
} from "lucide-react";
import { fetchStudioById } from "@/lib/api/studios";
import { createBooking } from "@/lib/api/bookings";
import { useSession } from "@/lib/auth-client";
import { showToast } from "@/components/ui/toast";
import type { Studio, StudioCategory, StudioReview } from "@/types/studio";
import type { BookingPayload } from "@/types/booking";
import { cn } from "@/lib/utils";

const CATEGORY_LABELS: Record<StudioCategory, string> = {
  photo: "Photography",
  video: "Film & Video",
  lounge: "Podcast Lounge",
  music: "Music Suite",
  workshop: "Art Workshop",
};

function normalizeReviews(
  reviews?: StudioReview | StudioReview[],
): StudioReview[] {
  if (!reviews) return [];
  return Array.isArray(reviews) ? reviews : [reviews];
}

/* ------------------------------------------------------------------ */
/* Skeleton (Suspense fallback)                                        */
/* ------------------------------------------------------------------ */

export function StudioDetailSkeleton() {
  return (
    <div className="space-y-10 animate-pulse">
      <div className="space-y-3">
        <div className="h-5 w-28 bg-secondary rounded-full" />
        <div className="h-10 w-2/3 bg-secondary rounded-lg" />
        <div className="h-4 w-1/3 bg-secondary rounded-md" />
      </div>
      <div className="h-72 md:h-[480px] bg-secondary rounded-2xl" />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
        <div className="space-y-8">
          <div className="h-48 bg-secondary rounded-2xl" />
          <div className="h-32 bg-secondary rounded-2xl" />
          <div className="h-40 bg-secondary rounded-2xl" />
        </div>
        <div className="h-72 bg-secondary rounded-2xl" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Gallery carousel (horizontal scroll on all screens)                 */
/* ------------------------------------------------------------------ */

function GalleryCarousel({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});

  const scrollByAmount = (direction: -1 | 1) => {
    const container = scrollRef.current;
    if (!container) return;
    container.scrollBy({
      left: direction * container.clientWidth * 0.9,
      behavior: "smooth",
    });
  };

  return (
    <section aria-label={`${title} photo gallery`} className="space-y-3">
      {/* Controls row: gallery label ... scroll buttons on the right */}
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          • Gallery
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scrollByAmount(-1)}
            className={cn(
              "p-2 rounded-full border border-border bg-background text-foreground",
              "hover:bg-secondary hover:border-accent/50 transition-colors cursor-pointer",
              "outline-none focus-visible:ring-2 focus-visible:ring-ring",
            )}
            aria-label="Scroll gallery left"
          >
            <ChevronLeft className="size-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => scrollByAmount(1)}
            className={cn(
              "p-2 rounded-full border border-border bg-background text-foreground",
              "hover:bg-secondary hover:border-accent/50 transition-colors cursor-pointer",
              "outline-none focus-visible:ring-2 focus-visible:ring-ring",
            )}
            aria-label="Scroll gallery right"
          >
            <ChevronRight className="size-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Horizontal scroller */}
      <div
        ref={scrollRef}
        className={cn(
          "flex overflow-x-auto snap-x snap-mandatory gap-4 rounded-2xl",
          "scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none]",
          "[&::-webkit-scrollbar]:hidden",
        )}
      >
        {images.map((img, index) =>
          imgErrors[index] ? (
            <div
              key={index}
              className="snap-center shrink-0 w-full h-72 sm:h-96 md:h-[480px] rounded-2xl bg-secondary/80 flex flex-col items-center justify-center gap-2 text-muted-foreground"
            >
              <Sparkles className="size-8 text-accent/60" aria-hidden="true" />
              <span className="text-xs font-sans">Image unavailable</span>
            </div>
          ) : (
            <div
              key={index}
              className="relative snap-center shrink-0 w-full h-72 sm:h-96 md:h-[480px] rounded-2xl overflow-hidden bg-secondary"
            >
              <Image
                src={img}
                alt={`${title} — photo ${index + 1}`}
                fill
                sizes="100vw"
                className="object-cover transition-transform duration-500 ease-out hover:scale-[1.03]"
                onError={() =>
                  setImgErrors((prev) => ({ ...prev, [index]: true }))
                }
                unoptimized
              />
            </div>
          ),
        )}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Booking modal                                                       */
/* ------------------------------------------------------------------ */

interface BookingModalProps {
  studio: Studio;
  onClose: () => void;
}

function BookingModal({ studio, onClose }: BookingModalProps) {
  const { data: session, isPending } = useSession();
  const user = session?.user;
  // better-auth doesn't guarantee every custom field — read defensively
  const userPhone = (user as { phone?: string } | undefined)?.phone ?? "";

  const [bookingDate, setBookingDate] = useState("");
  const [dateError, setDateError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  // Escape closes (but not while submitting)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSubmitting) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isSubmitting, onClose]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!bookingDate) {
      setDateError("Please select a booking date.");
      return;
    }
    setDateError(null);

    if (!user?.name || !user.email) {
      showToast.error(
        "Sign in required",
        "Please sign in before booking a workspace.",
      );
      return;
    }

    const payload: BookingPayload = {
      bookingDate,
      status: "Pending",
      renter: {
        _id: user.id,
        name: user.name,
        phone: userPhone,
        email: user.email,
      },
      studio: {
        _id: studio._id,
        title: studio.title,
        hourlyRate: studio.hourlyRate,
        securityDeposit: studio.securityDeposit,
        location: studio.address,
      },
    };

    setIsSubmitting(true);

    try {
      await createBooking(payload);
      showToast.success(
        "Booking requested",
        `Your request for "${studio.title}" on ${bookingDate} is pending confirmation.`,
      );
      onClose();
    } catch (error) {
      showToast.error(
        "Booking failed",
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = cn(
    "w-full rounded-lg border border-border bg-background px-3.5 py-2.5",
    "text-sm font-sans text-foreground placeholder:text-muted-foreground",
    "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring",
    "transition-colors aria-invalid:border-destructive",
    "disabled:opacity-60 disabled:cursor-not-allowed",
  );
  const labelClass =
    "block text-sm font-medium font-sans text-foreground mb-1.5";
  const errorClass = "text-xs text-destructive mt-1";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-dialog-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
        onClick={isSubmitting ? undefined : onClose}
        aria-hidden="true"
      />

      {/* Dialog panel */}
      <div
        className={cn(
          "relative w-full max-w-md rounded-2xl border border-border bg-card shadow-lg p-6",
          "animate-in fade-in zoom-in-95 duration-200",
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h2
              id="booking-dialog-title"
              className="text-lg font-heading font-semibold text-foreground"
            >
              Book this workspace
            </h2>
            <p className="text-xs text-muted-foreground font-sans truncate">
              {studio.title}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className={cn(
              "p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary",
              "transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "disabled:opacity-60 disabled:pointer-events-none",
            )}
            aria-label="Close booking dialog"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-4">
          {/* Renter info — read-only from session */}
          <fieldset disabled className="space-y-4">
            <div>
              <label htmlFor="renter-name" className={labelClass}>
                Name <span className="text-destructive">*</span>
              </label>
              {isPending ? (
                <div className="h-11 w-full bg-secondary/70 rounded-lg animate-pulse" />
              ) : (
                <input
                  id="renter-name"
                  type="text"
                  value={user?.name ?? ""}
                  readOnly
                  className={cn(
                    inputClass,
                    "bg-secondary/40 cursor-not-allowed",
                  )}
                />
              )}
            </div>
            <div>
              <label htmlFor="renter-phone" className={labelClass}>
                Phone
              </label>
              {isPending ? (
                <div className="h-11 w-full bg-secondary/70 rounded-lg animate-pulse" />
              ) : (
                <input
                  id="renter-phone"
                  type="text"
                  value={userPhone}
                  readOnly
                  className={cn(
                    inputClass,
                    "bg-secondary/40 cursor-not-allowed",
                  )}
                />
              )}
            </div>
            <div>
              <label htmlFor="renter-email" className={labelClass}>
                Email <span className="text-destructive">*</span>
              </label>
              {isPending ? (
                <div className="h-11 w-full bg-secondary/70 rounded-lg animate-pulse" />
              ) : (
                <input
                  id="renter-email"
                  type="email"
                  value={user?.email ?? ""}
                  readOnly
                  className={cn(
                    inputClass,
                    "bg-secondary/40 cursor-not-allowed",
                  )}
                />
              )}
            </div>
          </fieldset>

          {/* Booking date */}
          <div>
            <label htmlFor="booking-date" className={labelClass}>
              Booking date <span className="text-destructive">*</span>
            </label>
            <div>
              <input
                id="booking-date"
                type="date"
                min={today}
                value={bookingDate}
                onChange={(e) => {
                  setBookingDate(e.target.value);
                  if (dateError) setDateError(null);
                }}
                aria-invalid={!!dateError}
                className={cn(inputClass, "pr-10")}
              />
            </div>
            {dateError && <p className={errorClass}>{dateError}</p>}
          </div>

          {/* Confirm booking */}
          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className={cn(
                "px-5 py-2.5 rounded-full border border-border bg-background text-foreground",
                "text-sm font-medium hover:bg-secondary transition-colors",
                "outline-none focus-visible:ring-2 focus-visible:ring-ring",
                "disabled:opacity-60 disabled:pointer-events-none",
              )}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isPending}
              className={cn(
                "inline-flex items-center gap-2 px-6 py-2.5 rounded-full",
                "bg-primary text-primary-foreground text-sm font-medium hover:opacity-90",
                "transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring",
                "disabled:opacity-60 disabled:pointer-events-none",
              )}
            >
              {isSubmitting && (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              )}
              <span>{isSubmitting ? "Confirming…" : "Confirm booking"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Small presentational pieces                                         */
/* ------------------------------------------------------------------ */

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="p-6 bg-card border border-border rounded-2xl space-y-4">
      <h2 className="text-lg font-heading font-semibold text-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Main detail view                                                    */
/* ------------------------------------------------------------------ */

export function StudioDetail({ studioId }: { studioId: string }) {
  const [studio, setStudio] = useState<Studio | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  useEffect(() => {
    let isCurrent = true;

    const load = async () => {
      try {
        const data = await fetchStudioById(studioId);
        if (isCurrent) {
          setStudio(data);
          setError(null);
          setIsLoading(false);
        }
      } catch (err: unknown) {
        if (isCurrent) {
          setError(
            err instanceof Error
              ? err.message
              : "An unexpected error occurred while loading this studio.",
          );
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      isCurrent = false;
    };
  }, [studioId, retryCount]);

  if (isLoading) {
    return <StudioDetailSkeleton />;
  }

  if (error || !studio) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
        <span className="size-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
          <RefreshCw className="size-6" aria-hidden="true" />
        </span>
        <p className="text-sm text-muted-foreground max-w-sm font-sans">
          {error ?? "This studio could not be found."}
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
    );
  }

  const categoryLabel = CATEGORY_LABELS[studio.category] || studio.category;
  const reviews = normalizeReviews(studio.reviews);

  return (
    <div className="space-y-10">
      {/* ========================= Header ========================= */}
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-secondary text-foreground border border-border">
            {categoryLabel}
          </span>
          <span className="flex items-center gap-1 text-sm font-medium text-foreground">
            <Star
              className="size-4 text-accent fill-accent"
              aria-hidden="true"
            />
            {studio.rating ? studio.rating.toFixed(1) : "0.0"}
          </span>
        </div>

        <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground">
          {studio.title}
        </h1>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground font-sans">
          <span className="flex items-center gap-1.5">
            <MapPin
              className="size-4 text-accent shrink-0"
              aria-hidden="true"
            />
            {studio.address || "Location available on request"}
          </span>
          {typeof studio.capacity === "number" && (
            <span className="flex items-center gap-1.5">
              <Users
                className="size-4 text-accent shrink-0"
                aria-hidden="true"
              />
              Up to {studio.capacity} guests
            </span>
          )}
        </div>
      </header>

      {/* ==================== Gallery carousel ==================== */}
      {studio.images?.length > 0 && (
        <GalleryCarousel images={studio.images} title={studio.title} />
      )}

      {/* ==================== Content + booking ==================== */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">
        {/* ---------- Left column ---------- */}
        <div className="space-y-8 min-w-0">
          {studio.overview?.length > 0 && (
            <SectionCard title="Workspace Specifications">
              <ul className="space-y-3">
                {studio.overview.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-sm text-muted-foreground font-sans"
                  >
                    <Check
                      className="size-4 text-success shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </SectionCard>
          )}

          {studio.amenities?.length > 0 && (
            <SectionCard title="Amenities">
              <ul className="flex flex-wrap gap-2">
                {studio.amenities.map((amenity) => (
                  <li
                    key={amenity}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-xs font-sans text-secondary-foreground"
                  >
                    <Check
                      className="size-3.5 text-success shrink-0"
                      aria-hidden="true"
                    />
                    <span>{amenity}</span>
                  </li>
                ))}
              </ul>
            </SectionCard>
          )}

          <SectionCard title="Reviews">
            {reviews.length === 0 ? (
              <p className="text-sm text-muted-foreground font-sans">
                No reviews yet for this studio.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reviews.map((review, index) => (
                  <article
                    key={index}
                    className={cn(
                      "p-4 rounded-2xl border border-border bg-background space-y-2",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="size-9 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-sm font-semibold shrink-0"
                        aria-hidden="true"
                      >
                        {review.name?.[0]?.toUpperCase() || "U"}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate font-sans">
                          {review.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {review.designation}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground font-sans leading-relaxed">
                      {review.review}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        {/* ---------- Right column: booking + host ---------- */}
        <div className="space-y-6 lg:sticky lg:top-24">
          <section className="p-6 bg-card-highlight text-[var(--card-highlight-foreground)] border border-border rounded-2xl space-y-4">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-heading font-bold">
                ${studio.hourlyRate}
              </span>
              <span className="text-sm opacity-80 font-sans">/ hr</span>
            </div>
            <p className="text-xs opacity-70 font-sans">
              Security deposit of ${studio.securityDeposit} applies.
            </p>

            <button
              type="button"
              onClick={() => setIsBookingOpen(true)}
              className={cn(
                "w-full inline-flex items-center justify-center gap-2 py-3 px-5",
                "rounded-full bg-primary text-primary-foreground text-sm font-medium",
                "hover:opacity-90 transition-all duration-200 cursor-pointer",
                "outline-none focus-visible:ring-2 focus-visible:ring-ring",
              )}
            >
              <CalendarDays className="size-4 shrink-0" aria-hidden="true" />
              <span>Book Workspace Now</span>
            </button>
          </section>

          <section className="p-6 bg-card border border-border rounded-2xl space-y-4">
            <h2 className="text-lg font-heading font-semibold text-foreground">
              Host Details
            </h2>
            <div className="flex items-center gap-3">
              <span
                className="size-11 rounded-full bg-accent text-accent-foreground flex items-center justify-center shrink-0"
                aria-hidden="true"
              >
                {studio.host?.name ? (
                  <span className="text-sm font-semibold">
                    {studio.host.name[0]?.toUpperCase()}
                  </span>
                ) : (
                  <UserIcon className="size-5 text-accent-foreground" />
                )}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate font-sans">
                  {studio.host?.name || "Host"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  Verified host
                </p>
              </div>
            </div>
            <dl className="space-y-2 text-sm font-sans">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground shrink-0">Phone</dt>
                <dd className="text-foreground text-right truncate">
                  {studio.host?.phone || "—"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground shrink-0">Email</dt>
                <dd className="text-foreground text-right truncate">
                  {studio.host?.email || "—"}
                </dd>
              </div>
            </dl>
          </section>
        </div>
      </div>

      {/* ==================== Booking modal ==================== */}
      {isBookingOpen && (
        <BookingModal studio={studio} onClose={() => setIsBookingOpen(false)} />
      )}
    </div>
  );
}
