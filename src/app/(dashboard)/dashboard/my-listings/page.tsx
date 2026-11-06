import type { Metadata } from "next";
import { Suspense } from "react";
import { MyListingsGrid } from "@/components/dashboard/MyListingsGrid";
import { StudioGridSkeleton } from "@/components/shared/StudioSkeleton";

export const metadata: Metadata = {
  title: "My Studio Listings | StudioSpace",
};

export default function MyListingsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="space-y-2">
        <h1 className="text-3xl font-heading font-bold text-foreground">
          My Studio Listings
        </h1>
        <p className="text-muted-foreground">
          Manage and edit your active studio listings.
        </p>
      </div>

      <div className="mt-8">
        <Suspense fallback={<StudioGridSkeleton count={6} />}>
          <MyListingsGrid />
        </Suspense>
      </div>
    </div>
  );
}
