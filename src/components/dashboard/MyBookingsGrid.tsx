"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  MapPin,
  ArrowRight,
  Loader2,
  RefreshCw,
  AlertCircle,
  CalendarX2,
  Clock,
} from "lucide-react";
import { fetchBookingsByUser, cancelBooking } from "@/lib/api/bookings";
import { useAuth } from "@/hooks/useAuth";
import { showToast } from "@/components/ui/toast";
import type { Booking, BookingStatus } from "@/types/booking";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<BookingStatus, string> = {
  Pending: "bg-accent/10 text-accent border-accent/30",
  Confirmed: "bg-success/10 text-success border-success/30",
  Completed: "bg-secondary text-muted-foreground border-border",
  Cancelled: "bg-destructive/10 text-destructive border-destructive/30",
};

/* ------------------------------------------------------------------ */
/* Booking card                                                        */
/* ------------------------------------------------------------------ */

interface BookingCardProps {
  booking: Booking;
  onCancelRequest: (booking: Booking) => void;
}

function BookingCard({ booking, onCancelRequest }: BookingCardProps) {
  const studio = booking.studio;

  return (
    <article
      className={cn(
        "h-full flex flex-col rounded-2xl border border-border bg-card",
        "shadow-xs hover:shadow-md hover:border-accent/40",
        "transition-all duration-300 overflow-hidden",
      )}
    >
      {/* Header: status badge */}
      <div className="flex items-center justify-between px-5 sm:px-6 pt-5">
        <span
          className={cn(
            "px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase border",
            STATUS_STYLES[booking.status] ?? STATUS_STYLES.Pending,
          )}
        >
          {booking.status}
        </span>
      </div>

      {/* Body */}
      <div className="p-5 sm:p-6 flex flex-col flex-1 gap-4">
        <div className="space-y-2">
          <h3 className="font-heading font-semibold text-lg sm:text-xl text-foreground line-clamp-1">
            {studio?.title || "Studio booking"}
          </h3>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-sans line-clamp-1">
            <MapPin
              className="size-3.5 shrink-0 text-accent"
              aria-hidden="true"
            />
            <span className="truncate">
              {studio?.location || "Location available on request"}
            </span>
          </div>

          {booking.bookingDate && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-sans">
              <Clock
                className="size-3.5 shrink-0 text-accent"
                aria-hidden="true"
              />
              <span>
                Booked for{" "}
                <span className="font-bold">{booking.bookingDate}</span>
              </span>
            </div>
          )}
        </div>

        {/* Pricing rows */}
        <dl className="mt-auto space-y-2.5 text-sm font-sans bg-secondary/50 rounded-xl px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">Hourly rate</dt>
            <dd className="font-medium text-foreground">
              ${studio?.hourlyRate ?? "—"}{" "}
              <span className="text-xs text-muted-foreground">/ hr</span>
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">Security deposit</dt>
            <dd className="font-medium text-foreground">
              ${studio?.securityDeposit ?? "—"}
            </dd>
          </div>
        </dl>

        {/* View details */}
        <Link
          href={`/studios/${studio?._id ?? ""}`}
          className={cn(
            "w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-full",
            "border border-border bg-background hover:bg-primary hover:text-primary-foreground hover:border-transparent",
            "text-foreground text-sm font-medium transition-all duration-200 shadow-2xs group/btn",
          )}
        >
          <span>View Details</span>
          <ArrowRight className="size-3.5 transition-transform duration-200 group-hover/btn:translate-x-1" />
        </Link>

        {/* Cancel — only for pending bookings */}
        {booking.status === "Pending" && (
          <button
            type="button"
            onClick={() => onCancelRequest(booking)}
            className={cn(
              "inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-full",
              "bg-destructive/10 text-destructive text-sm font-medium",
              "hover:bg-destructive/20 transition-all duration-200 cursor-pointer",
              "outline-none focus-visible:ring-2 focus-visible:ring-ring",
            )}
          >
            <CalendarX2 className="size-4 shrink-0" aria-hidden="true" />
            <span>Cancel Booking</span>
          </button>
        )}
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* Skeleton (Suspense fallback)                                        */
/* ------------------------------------------------------------------ */

export function MyBookingsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden animate-pulse"
        >
          <div className="flex justify-between p-5 sm:p-6">
            <div className="h-4 w-20 bg-secondary rounded-full" />
          </div>
          <div className="p-5 sm:p-6 flex flex-col gap-4">
            <div className="h-6 bg-secondary rounded-md w-3/4" />
            <div className="h-3.5 bg-secondary rounded-md w-1/2" />
            <div className="h-24 bg-secondary rounded-xl" />
            <div className="h-10 bg-secondary rounded-full w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main bookings grid                                                  */
/* ------------------------------------------------------------------ */

export function MyBookingsGrid() {
  const { user, isAuthenticated, isPending } = useAuth();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;

    let isCurrent = true;

    const load = async () => {
      try {
        const data = await fetchBookingsByUser(userId);
        if (isCurrent) {
          setBookings(data);
          setError(null);
          setIsLoading(false);
        }
      } catch (err: unknown) {
        if (isCurrent) {
          setError(
            err instanceof Error
              ? err.message
              : "An unexpected error occurred while loading your bookings.",
          );
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      isCurrent = false;
    };
  }, [userId, retryCount]);

  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    setRetryCount((prev) => prev + 1);
  };

  const handleCancelBooking = async (booking: Booking) => {
    if (!booking._id || cancellingId) return;

    setCancellingId(booking._id);

    try {
      await cancelBooking(booking._id);

      setBookings((prev) => prev.filter((b) => b._id !== booking._id));
      showToast.success(
        "Booking cancelled",
        booking.studio?.title
          ? `Your booking for "${booking.studio.title}" has been cancelled.`
          : "Your booking has been cancelled.",
      );
    } catch (err: unknown) {
      showToast.error(
        "Could not cancel booking",
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setCancellingId(null);
    }
  };

  /* ----------------------------- states ------------------------------ */

  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
        <Loader2 className="size-6 animate-spin" aria-hidden="true" />
        <p className="text-sm font-sans">Checking your session…</p>
      </div>
    );
  }

  if (!isAuthenticated || !userId) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
        <span className="size-12 rounded-full bg-secondary text-muted-foreground flex items-center justify-center">
          <AlertCircle className="size-6" aria-hidden="true" />
        </span>
        <p className="text-sm text-muted-foreground max-w-sm font-sans">
          Please sign in to view your studio bookings.
        </p>
        <Link
          href="/login"
          className="p-3 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Sign In
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
        <Loader2 className="size-6 animate-spin" aria-hidden="true" />
        <p className="text-sm font-sans">Loading your bookings…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
        <span className="size-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
          <AlertCircle className="size-6" aria-hidden="true" />
        </span>
        <p className="text-sm text-muted-foreground max-w-sm font-sans">
          {error}
        </p>
        <button
          type="button"
          onClick={handleRetry}
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

  if (bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
        <span className="size-12 rounded-full bg-secondary text-muted-foreground flex items-center justify-center">
          <CalendarX2 className="size-6" aria-hidden="true" />
        </span>
        <p className="text-sm text-muted-foreground max-w-sm font-sans">
          You have no bookings yet. Browse studios and book your first creative
          workspace.
        </p>
        <Link
          href="/studios"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <span>Explore Studios</span>
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      {bookings.map((booking) => (
        <BookingCard
          key={booking._id}
          booking={booking}
          onCancelRequest={handleCancelBooking}
        />
      ))}
    </div>
  );
}
