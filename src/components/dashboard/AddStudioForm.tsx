"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  UploadCloud,
  Loader2,
  PlusCircle,
  SquarePen,
  X,
  ChevronDown,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { showToast } from "@/components/ui/toast";
import { fetchStudioById, createStudio, updateStudio } from "@/lib/api/studios";
import { useSession } from "@/lib/auth-client";
import type { Studio, StudioCategory } from "@/types/studio";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Constants & helpers                                                 */
/* ------------------------------------------------------------------ */

const CATEGORIES: { value: StudioCategory; label: string }[] = [
  { value: "photo", label: "Photo Studio" },
  { value: "video", label: "Video Studio" },
  { value: "lounge", label: "Podcast Lounge" },
  { value: "music", label: "Music Studio" },
  { value: "workshop", label: "Art Workshop" },
];

const IMGBB_UPLOAD_URL = `https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_API_KEY}`;

const inputClass = cn(
  "w-full rounded-lg border border-border bg-background px-3.5 py-2.5",
  "text-sm font-sans text-foreground placeholder:text-muted-foreground",
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring",
  "transition-colors aria-invalid:border-destructive",
  "disabled:opacity-60 disabled:cursor-not-allowed",
);

const labelClass = "block text-sm font-medium font-sans text-foreground mb-1.5";
const errorClass = "text-xs text-destructive mt-1";

/**
 * An image entry in the form. `file` holds a locally chosen File that gets
 * uploaded to imgbb on submission; `file: null` means an existing hosted
 * image (from the studio record) that only needs to be kept or dropped.
 */
interface SelectedImage {
  file: File | null;
  previewUrl: string;
}

type FormErrors = Partial<
  Record<
    | "title"
    | "category"
    | "hourlyRate"
    | "securityDeposit"
    | "capacity"
    | "address"
    | "images"
    | "amenities"
    | "overview"
    | "host",
    string
  >
>;

interface StudioPayload {
  title: string;
  category: StudioCategory;
  hourlyRate: number;
  securityDeposit: number;
  capacity: number;
  address: string;
  images: string[];
  amenities: string[];
  overview: string[];
  host: {
    name: string;
    phone: string;
    email: string;
  };
}

/** Upload a single image file to imgbb and return its hosted URL. */
async function uploadImageToImgbb(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(IMGBB_UPLOAD_URL, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`imgbb responded with ${res.status}`);
  }

  const json: {
    success?: boolean;
    data?: { url?: string; display_url?: string };
  } = await res.json();

  const url = json?.data?.url ?? json?.data?.display_url;
  if (!json?.success || !url) {
    throw new Error("Missing image URL in imgbb response");
  }

  return url;
}

/* ------------------------------------------------------------------ */
/* Skeleton (Suspense fallback)                                        */
/* ------------------------------------------------------------------ */

export function AddStudioFormSkeleton() {
  return (
    <div className="mt-8 max-w-3xl p-6 md:p-8 bg-card border border-border rounded-2xl animate-pulse">
      <div className="space-y-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-28 bg-secondary rounded" />
            <div className="h-11 w-full bg-secondary rounded-lg" />
          </div>
        ))}
        <div className="h-10 w-40 bg-secondary rounded-lg" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Public entries                                                      */
/* ------------------------------------------------------------------ */

export function AddStudioForm() {
  return <StudioForm mode="create" />;
}

/**
 * Loads the studio by id and renders the form prefilled for updating.
 * Handles its own loading / error states.
 */
export function UpdateStudioForm({ studioId }: { studioId: string }) {
  const [studio, setStudio] = useState<Studio | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

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
    return <AddStudioFormSkeleton />;
  }

  if (error || !studio) {
    return (
      <div className="mt-8 flex flex-col items-center justify-center py-16 gap-3 text-center">
        <span className="size-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
          <AlertCircle className="size-6" aria-hidden="true" />
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

  return (
    <StudioForm mode="update" initialStudio={studio} studioId={studioId} />
  );
}

/* ------------------------------------------------------------------ */
/* Shared studio form (create & update)                                */
/* ------------------------------------------------------------------ */

interface StudioFormProps {
  mode: "create" | "update";
  initialStudio?: Studio;
  studioId?: string;
}

function StudioForm({ mode, initialStudio, studioId }: StudioFormProps) {
  const router = useRouter();
  const { data: session, isPending: isSessionPending } = useSession();

  const isUpdate = mode === "update";

  const [title, setTitle] = useState(initialStudio?.title ?? "");
  const [category, setCategory] = useState<StudioCategory | "">(
    initialStudio?.category ?? "",
  );
  const [hourlyRate, setHourlyRate] = useState(
    isUpdate && initialStudio?.hourlyRate != null
      ? String(initialStudio.hourlyRate)
      : "",
  );
  const [securityDeposit, setSecurityDeposit] = useState(
    isUpdate && initialStudio?.securityDeposit != null
      ? String(initialStudio.securityDeposit)
      : "",
  );
  const [capacity, setCapacity] = useState(
    isUpdate && initialStudio?.capacity != null
      ? String(initialStudio.capacity)
      : "",
  );
  const [address, setAddress] = useState(initialStudio?.address ?? "");
  const [imageFiles, setImageFiles] = useState<SelectedImage[]>(() => {
    if (isUpdate && initialStudio?.images?.length) {
      return initialStudio.images
        .filter(Boolean)
        .map((url) => ({ file: null, previewUrl: url }));
    }
    return [];
  });
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageFilesRef = useRef<SelectedImage[]>([]);

  // Keep the ref in sync so the unmount cleanup can revoke all preview URLs
  useEffect(() => {
    imageFilesRef.current = imageFiles;
  }, [imageFiles]);

  // Revoke any remaining preview object URLs when the form unmounts
  useEffect(() => {
    return () => {
      imageFilesRef.current.forEach((img) => {
        if (img.file) URL.revokeObjectURL(img.previewUrl);
      });
    };
  }, []);

  const [amenitiesText, setAmenitiesText] = useState(
    initialStudio?.amenities?.join("\n") ?? "",
  );
  const [overviewText, setOverviewText] = useState(
    initialStudio?.overview?.join("\n") ?? "",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const user = session?.user;
  // better-auth doesn't guarantee every custom field — read defensively
  const hostPhone = (user as { phone?: string } | undefined)?.phone ?? "";

  const splitLines = (text: string) =>
    text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

  /* ------------------------- image selection ------------------------- */

  /**
   * Store selected files locally (with previews). No upload happens here —
   * files are uploaded to imgbb during form submission.
   */
  const handleImageSelection = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const validFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/"),
    );
    if (validFiles.length === 0) return;

    setImageFiles((prev) => [
      ...prev,
      ...validFiles.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
      })),
    ]);

    // Allow re-selecting the same file
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (previewUrl: string) => {
    setImageFiles((prev) => {
      const item = prev.find((img) => img.previewUrl === previewUrl);
      // Only locally created blobs are revoked; existing hosted URLs are not
      if (item?.file) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((img) => img.previewUrl !== previewUrl);
    });
  };

  /* ------------------------- validation --------------------------- */

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};

    if (!title.trim()) {
      nextErrors.title = "Studio title is required.";
    }
    if (!category) {
      nextErrors.category = "Please select a studio category.";
    }

    const rate = Number(hourlyRate);
    if (!Number.isFinite(rate) || rate <= 0) {
      nextErrors.hourlyRate = "Hourly rate must be greater than 0.";
    }

    const deposit = Number(securityDeposit);
    if (!Number.isFinite(deposit) || deposit < 0) {
      nextErrors.securityDeposit = "Security deposit must be 0 or more.";
    }

    const guests = Number(capacity);
    if (!Number.isInteger(guests) || guests < 1) {
      nextErrors.capacity = "Capacity must be a whole number of at least 1.";
    }

    if (!address.trim()) {
      nextErrors.address = "Street address is required.";
    }
    if (imageFiles.length === 0) {
      nextErrors.images = "At least one studio image is required.";
    }
    if (splitLines(amenitiesText).length === 0) {
      nextErrors.amenities = "Add at least one amenity.";
    }
    if (splitLines(overviewText).length === 0) {
      nextErrors.overview = "Add at least one workshop specification.";
    }
    if (!user?.name || !user.email) {
      nextErrors.host = "Host details are unavailable. Please sign in again.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      showToast.error(
        "Please fix the highlighted fields",
        `${Object.keys(nextErrors).length} field${
          Object.keys(nextErrors).length > 1 ? "s are" : " is"
        } invalid.`,
      );
      return false;
    }
    return true;
  };

  /* --------------------------- submit ------------------------------ */

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;

    if (!user?.name || !user.email) return;

    // Images that are already hosted (existing listing images kept as-is)
    const keptImageUrls = imageFiles
      .filter((img) => !img.file)
      .map((img) => img.previewUrl);
    // Images the user picked locally in this session
    const newImageFiles = imageFiles.filter(
      (img): img is SelectedImage & { file: File } => img.file !== null,
    );

    if (newImageFiles.length > 0 && !process.env.NEXT_PUBLIC_IMGBB_API_KEY) {
      showToast.error(
        "Upload configuration missing",
        "Image upload key is not set. Please try again later.",
      );
      return;
    }

    setIsSubmitting(true);
    if (newImageFiles.length > 0) setIsUploadingImages(true);

    try {
      let imageUrls = keptImageUrls;

      /* ------- 1. Upload newly selected images to imgbb ------- */
      if (newImageFiles.length > 0) {
        const results = await Promise.allSettled(
          newImageFiles.map((img) => uploadImageToImgbb(img.file)),
        );

        const uploadedUrls = results
          .filter(
            (result): result is PromiseFulfilledResult<string> =>
              result.status === "fulfilled",
          )
          .map((result) => result.value);

        const failedCount = results.length - uploadedUrls.length;

        // Abort submission if any image failed — the listing must have all its images
        if (failedCount > 0) {
          showToast.error(
            "Image upload failed",
            `Could not upload ${failedCount} of ${results.length} image${
              results.length > 1 ? "s" : ""
            }. Please try submitting again.`,
          );
          return;
        }

        imageUrls = [...keptImageUrls, ...uploadedUrls];
      }

      /* ------- 2. Create or update the studio listing ------- */
      const payload: StudioPayload = {
        title: title.trim(),
        category: category as StudioCategory,
        hourlyRate: Number(hourlyRate),
        securityDeposit: Number(securityDeposit) || 0,
        capacity: Number(capacity),
        address: address.trim(),
        images: imageUrls,
        amenities: splitLines(amenitiesText),
        overview: splitLines(overviewText),
        host: {
          name: user.name,
          phone: hostPhone,
          email: user.email,
        },
      };
      if (isUpdate) {
        await updateStudio(studioId as string, payload);
      } else {
        await createStudio(payload);
      }

      if (isUpdate) {
        showToast.success(
          "Studio updated",
          `"${payload.title}" has been updated successfully.`,
        );
      } else {
        showToast.success(
          "Studio added",
          `"${payload.title}" is now listed on StudioSpace.`,
        );
      }
      router.push("/dashboard/my-listings");
    } catch (error) {
      showToast.error(
        isUpdate ? "Could not update studio" : "Could not add studio",
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
      setIsUploadingImages(false);
    }
  };

  /* ---------------------------- render ----------------------------- */

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="mt-8 max-w-3xl p-6 md:p-8 bg-card border border-border rounded-2xl space-y-8"
    >
      {/* ===================== Studio details ===================== */}
      <fieldset className="space-y-5" disabled={isSubmitting}>
        <legend className="text-lg font-heading font-semibold text-foreground">
          Studio Details
        </legend>

        <div>
          <label htmlFor="studio-title" className={labelClass}>
            Title <span className="text-destructive">*</span>
          </label>
          <input
            id="studio-title"
            type="text"
            placeholder="e.g. Downtown Cyc Wall & Daylight Studio"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-invalid={!!errors.title}
            className={inputClass}
          />
          {errors.title && <p className={errorClass}>{errors.title}</p>}
        </div>

        {/* Category + pricing row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label htmlFor="studio-category" className={labelClass}>
              Category <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <select
                id="studio-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as StudioCategory)}
                aria-invalid={!!errors.category}
                className={cn(
                  inputClass,
                  "appearance-none pr-10 cursor-pointer",
                  !category && "text-muted-foreground",
                )}
              >
                <option value="" disabled>
                  Select category
                </option>
                {CATEGORIES.map((c) => (
                  <option
                    key={c.value}
                    value={c.value}
                    className="text-foreground"
                  >
                    {c.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
                aria-hidden="true"
              />
            </div>
            {errors.category && <p className={errorClass}>{errors.category}</p>}
          </div>

          <div>
            <label htmlFor="studio-hourly-rate" className={labelClass}>
              Hourly rate (USD) <span className="text-destructive">*</span>
            </label>
            <input
              id="studio-hourly-rate"
              type="number"
              min="1"
              step="0.01"
              placeholder="e.g. 89"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              aria-invalid={!!errors.hourlyRate}
              className={inputClass}
            />
            {errors.hourlyRate && (
              <p className={errorClass}>{errors.hourlyRate}</p>
            )}
          </div>

          <div>
            <label htmlFor="studio-security-deposit" className={labelClass}>
              Security deposit (USD) <span className="text-destructive">*</span>
            </label>
            <input
              id="studio-security-deposit"
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 50"
              value={securityDeposit}
              onChange={(e) => setSecurityDeposit(e.target.value)}
              aria-invalid={!!errors.securityDeposit}
              className={inputClass}
            />
            {errors.securityDeposit && (
              <p className={errorClass}>{errors.securityDeposit}</p>
            )}
          </div>
        </div>

        {/* Capacity + address row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label htmlFor="studio-capacity" className={labelClass}>
              Capacity (people) <span className="text-destructive">*</span>
            </label>
            <input
              id="studio-capacity"
              type="number"
              min="1"
              step="1"
              placeholder="e.g. 12"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              aria-invalid={!!errors.capacity}
              className={inputClass}
            />
            {errors.capacity && <p className={errorClass}>{errors.capacity}</p>}
          </div>

          <div className="md:col-span-2">
            <label htmlFor="studio-address" className={labelClass}>
              Address <span className="text-destructive">*</span>
            </label>
            <input
              id="studio-address"
              type="text"
              placeholder="e.g. 42 Warehouse Row, Brooklyn, NY"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              aria-invalid={!!errors.address}
              className={inputClass}
            />
            {errors.address && <p className={errorClass}>{errors.address}</p>}
          </div>
        </div>
      </fieldset>

      {/* ========================= Images ========================= */}
      <fieldset className="space-y-3" disabled={isSubmitting}>
        <legend className="text-lg font-heading font-semibold text-foreground">
          Studio Images
        </legend>
        <p className="text-xs text-muted-foreground font-sans mt-0.5">
          Select one or more images
          {isUpdate ? " to add to the existing ones" : ""}
        </p>

        <label
          htmlFor="studio-images"
          className={cn(
            "flex flex-col items-center justify-center gap-2 cursor-pointer",
            "border-2 border-dashed border-border hover:border-accent/50 rounded-2xl px-4 py-8",
            "text-muted-foreground hover:text-accent transition-colors",
            "outline-none focus-within:ring-2 focus-within:ring-ring",
          )}
        >
          <UploadCloud className="size-6" aria-hidden="true" />
          <span className="text-sm font-sans font-medium">
            Click to choose images
          </span>
          <span className="text-xs font-sans">
            Multiple images supported (JPEG, PNG, WebP)
          </span>
          <input
            id="studio-images"
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="sr-only"
            onChange={(e) => handleImageSelection(e.target.files)}
            aria-describedby="studio-images-hint"
          />
        </label>

        {imageFiles.length > 0 && (
          <ul className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {imageFiles.map((img) => (
              <li
                key={img.previewUrl}
                className="relative aspect-square rounded-xl overflow-hidden border border-border group"
              >
                <Image
                  src={img.previewUrl}
                  alt={img.file?.name || "Studio image"}
                  width={160}
                  height={160}
                  className="size-full object-cover"
                  unoptimized
                />
                <button
                  type="button"
                  onClick={() => removeImage(img.previewUrl)}
                  className={cn(
                    "absolute top-1.5 right-1.5 p-1 rounded-full bg-background/80",
                    "text-foreground hover:text-destructive transition-colors cursor-pointer",
                    "outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  )}
                  aria-label={`Remove image ${img.file?.name || "preview"}`}
                >
                  <X className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
        {errors.images && <p className={errorClass}>{errors.images}</p>}
        <span id="studio-images-hint" className="sr-only">
          Images are uploaded to imgbb when the form is submitted and added to
          the listing
        </span>
      </fieldset>

      {/* ==================== Amenities & overview ==================== */}
      <fieldset
        className="grid grid-cols-1 md:grid-cols-2 gap-5"
        disabled={isSubmitting}
      >
        <legend className="text-lg font-heading font-semibold text-foreground">
          Amenities &amp; Specifications
        </legend>

        <div>
          <label htmlFor="studio-amenities" className={labelClass}>
            Amenities <span className="text-destructive">*</span>
          </label>
          <textarea
            id="studio-amenities"
            rows={5}
            placeholder={
              "e.g.\nSony FX6 camera kit\nCyc wall with even lighting\nPrivate prep room"
            }
            value={amenitiesText}
            onChange={(e) => setAmenitiesText(e.target.value)}
            aria-invalid={!!errors.amenities}
            className={cn(inputClass, "resize-y")}
          />
          <p className="text-xs text-muted-foreground mt-1.5">
            One amenity per line
          </p>
          {errors.amenities && <p className={errorClass}>{errors.amenities}</p>}
        </div>

        <div>
          <label htmlFor="studio-overview" className={labelClass}>
            Workshop specifications <span className="text-destructive">*</span>
          </label>
          <textarea
            id="studio-overview"
            rows={5}
            placeholder={
              "e.g.\n1200 sq. ft. open floor plan\n18 ft. ceiling height\nDrive-in freight access"
            }
            value={overviewText}
            onChange={(e) => setOverviewText(e.target.value)}
            aria-invalid={!!errors.overview}
            className={cn(inputClass, "resize-y")}
          />
          <p className="text-xs text-muted-foreground mt-1.5">
            One specification per line
          </p>
          {errors.overview && <p className={errorClass}>{errors.overview}</p>}
        </div>
      </fieldset>

      {/* ===================== Host (read-only) ===================== */}
      <fieldset className="space-y-4" disabled>
        <legend className="text-lg font-heading font-semibold text-foreground">
          Host Details
        </legend>

        {isSessionPending ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-11 w-full bg-secondary/70 rounded-lg" />
            <div className="h-11 w-2/3 bg-secondary/70 rounded-lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label htmlFor="host-name" className={labelClass}>
                Name <span className="text-destructive">*</span>
              </label>
              <input
                id="host-name"
                type="text"
                value={user?.name ?? ""}
                readOnly
                aria-invalid={!!errors.host}
                className={cn(inputClass, "bg-secondary/40 cursor-not-allowed")}
              />
            </div>
            <div>
              <label htmlFor="host-phone" className={labelClass}>
                Phone
              </label>
              <input
                id="host-phone"
                type="text"
                value={hostPhone}
                readOnly
                className={cn(inputClass, "bg-secondary/40 cursor-not-allowed")}
              />
            </div>
            <div>
              <label htmlFor="host-email" className={labelClass}>
                Email <span className="text-destructive">*</span>
              </label>
              <input
                id="host-email"
                type="email"
                value={user?.email ?? ""}
                readOnly
                aria-invalid={!!errors.host}
                className={cn(inputClass, "bg-secondary/40 cursor-not-allowed")}
              />
            </div>
          </div>
        )}
        {errors.host && <p className={errorClass}>{errors.host}</p>}
      </fieldset>

      {/* ========================= Submit ============================ */}
      <div className="pt-2 border-border flex justify-end">
        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting || isUploadingImages}
          className={cn(
            "rounded-lg gap-2 font-sans text-sm font-medium px-6",
            "bg-primary text-primary-foreground hover:opacity-90",
          )}
        >
          {isUploadingImages ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              <span>Uploading images…</span>
            </>
          ) : isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              <span>{isUpdate ? "Saving changes…" : "Adding studio…"}</span>
            </>
          ) : (
            <>
              {isUpdate ? (
                <SquarePen className="size-4" aria-hidden="true" />
              ) : (
                <PlusCircle className="size-4" aria-hidden="true" />
              )}
              <span>{isUpdate ? "Save changes" : "Add studio"}</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
