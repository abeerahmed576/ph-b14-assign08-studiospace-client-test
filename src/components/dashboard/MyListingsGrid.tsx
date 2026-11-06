"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Star,
  MapPin,
  ArrowRight,
  Sparkles,
  SquarePen,
  Trash2,
  AlertCircle,
  RefreshCw,
  Loader2,
  ImageOff,
} from "lucide-react";
import { fetchUserStudios, deleteStudio } from "@/lib/api/studios";
import { useAuth } from "@/hooks/useAuth";
import { showToast } from "@/components/ui/toast";
import type { Studio, StudioCategory } from "@/types/studio";
import { cn } from "@/lib/utils";

const CATEGORY_LABELS: Record<StudioCategory, string> = {
  photo: "Photography",
  video: "Film & Video",
  lounge: "Podcast Lounge",
  music: "Music Suite",
  workshop: "Art Workshop",
};

/* ------------------------------------------------------------------ */
/* Owner studio card                                                   */
/* ------------------------------------------------------------------ */

interface OwnerStudioCardProps {
  studio: Studio;
  onDeleteRequest: (studio: Studio) => void;
}

function OwnerStudioCard({ studio, onDeleteRequest }: OwnerStudioCardProps) {
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
      {/* ============================ Header photo ============================ */}
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

        <div
          className="absolute inset-0 bg-linear-to-t from-black/85 via-black/30 to-transparent pointer-events-none"
          aria-hidden="true"
        />

        {/* Badges: category (top-left), rating (top-right) */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none z-10">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-background/90 text-foreground backdrop-blur-md border border-border/60 shadow-xs">
            {categoryLabel}
          </span>

          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-background/90 text-foreground backdrop-blur-md border border-border/60 shadow-xs">
            <Star className="size-3.5 text-accent fill-accent" aria-hidden="true" />
            <span>{studio.rating ? studio.rating.toFixed(1) : "0.0"}</span>
          </span>
        </div>
      </div>

      {/* ============================== Card body ============================= */}
      <div className="p-5 sm:p-6 flex flex-col flex-1 gap-4">
        <div className="space-y-2">
          <h3 className="font-heading font-semibold text-lg sm:text-xl text-foreground line-clamp-1 group-hover:text-accent transition-colors">
            {studio.title}
          </h3>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-sans line-clamp-1">
            <MapPin className="size-3.5 shrink-0 text-accent" aria-hidden="true" />
            <span className="truncate">
              {studio.address || "Location available on request"}
            </span>
          </div>
        </div>

        {/* ============================== Actions ============================= */}
        <div className="mt-auto space-y-2.5">
          {/* View Details — goes to the public studio detail page */}
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

          {/* Update + Delete (side-by-side) */}
          <div className="grid grid-cols-2 gap-2.5">
            <Link
              href={`/dashboard/my-listings/update/${studioId}`}
              className={cn(
                "inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-full",
                "border border-border bg-background text-foreground text-sm font-medium",
                "hover:bg-secondary hover:text-accent transition-all duration-200",
              )}
            >
              <SquarePen className="size-3.5" aria-hidden="true" />
              <span>Update</span>
            </Link>

            <button
              type="button"
              onClick={() => onDeleteRequest(studio)}
              className={cn(
                "inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-full",
                "bg-destructive/10 text-destructive text-sm font-medium",
                "hover:bg-destructive/20 transition-all duration-200",
                "outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer",
              )}
            >
              <Trash2 className="size-3.5" aria-hidden="true" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* Delete confirmation dialog                                          */
/* ------------------------------------------------------------------ */

interface DeleteConfirmDialogProps {
  studio: Studio;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteConfirmDialog({
  studio,
  isDeleting,
  onConfirm,
  onCancel,
}: DeleteConfirmDialogProps) {
  // Escape closes the dialog while not in-flight
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isDeleting) onCancel();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isDeleting, onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
        onClick={isDeleting ? undefined : onCancel}
        aria-hidden="true"
      />

      {/* Dialog panel */}
      <div
        className={cn(
          "relative w-full max-w-md rounded-2xl border border-border bg-card shadow-lg p-6",
          "animate-in fade-in zoom-in-95 duration-200",
        )}
      >
        <div className="flex items-start gap-4">
          <span
            className="shrink-0 mt-0.5 size-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center"
            aria-hidden="true"
          >
            <Trash2 className="size-5" />
          </span>
          <div className="space-y-1.5">
            <h2
              id="delete-dialog-title"
              className="text-lg font-heading font-semibold text-foreground"
            >
              Delete this listing?
            </h2>
            <p className="text-sm text-muted-foreground font-sans leading-relaxed">
              You are about to permanently delete{" "}
              <span className="font-medium text-foreground">{studio.title}</span>
              . This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
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
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className={cn(
              "inline-flex items-center gap-2 px-5 py-2.5 rounded-full",
              "bg-destructive text-white text-sm font-medium hover:opacity-90",
              "transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "disabled:opacity-60 disabled:pointer-events-none",
            )}
          >
            {isDeleting && (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            )}
            <span>{isDeleting ? "Deleting…" : "Delete"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main listings grid                                                  */
/* ------------------------------------------------------------------ */

export function MyListingsGrid() {
  const router = useRouter();
  const { user, isAuthenticated, isPending } = useAuth();

  const [studios, setStudios] = useState<Studio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Studio pending confirmation, or null when the dialog is closed
  const [studioToDelete, setStudioToDelete] = useState<Studio | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const email = user?.email;

  useEffect(() => {
    if (!email) return;

    let isCurrent = true;

    const load = async () => {
      try {
        const data = await fetchUserStudios(email);
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
              : "An unexpected error occurred while loading your listings.",
          );
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      isCurrent = false;
    };
  }, [email, retryCount]);

  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    setRetryCount((prev) => prev + 1);
  };

  const handleDeleteConfirm = async () => {
    if (!studioToDelete) return;

    const target = studioToDelete;
    setIsDeleting(true);

    try {
      await deleteStudio(target._id);

      // Reflect deletion immediately without refetching
      setStudios((prev) => prev.filter((s) => s._id !== target._id));
      setStudioToDelete(null);

      showToast.info(
        "Studio deleted",
        `"${target.title}" has been removed from your listings.`,
      );

      // Per spec: redirect back to the listings page after a successful deletion
      router.push("/dashboard/my-listings");
    } catch (err: unknown) {
      showToast.error(
        "Could not delete studio",
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsDeleting(false);
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

  if (!isAuthenticated || !email) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
        <span className="size-12 rounded-full bg-secondary text-muted-foreground flex items-center justify-center">
          <AlertCircle className="size-6" aria-hidden="true" />
        </span>
        <p className="text-sm text-muted-foreground max-w-sm font-sans">
          Please sign in to view and manage your studio listings.
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
        <p className="text-sm font-sans">Loading your listings…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
        <span className="size-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
          <AlertCircle className="size-6" aria-hidden="true" />
        </span>
        <p className="text-sm text-muted-foreground max-w-sm font-sans">{error}</p>
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

  if (studios.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
        <span className="size-12 rounded-full bg-secondary text-muted-foreground flex items-center justify-center">
          <ImageOff className="size-6" aria-hidden="true" />
        </span>
        <p className="text-sm text-muted-foreground max-w-sm font-sans">
          You have no studio listings yet. Create your first listing to start
          receiving bookings.
        </p>
        <Link
          href="/dashboard/add-studio"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <span>Add New Studio</span>
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {studios.map((studio) => (
          <OwnerStudioCard
            key={studio._id}
            studio={studio}
            onDeleteRequest={setStudioToDelete}
          />
        ))}
      </div>

      {studioToDelete && (
        <DeleteConfirmDialog
          studio={studioToDelete}
          isDeleting={isDeleting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setStudioToDelete(null)}
        />
      )}
    </>
  );
}
