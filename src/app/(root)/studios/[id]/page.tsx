import type { Metadata } from "next";
import { Suspense } from "react";
import { StudioDetail, StudioDetailSkeleton } from "@/components/shared/StudioDetail";

export const metadata: Metadata = {
  title: "Studio Details | StudioSpace",
};

interface StudioDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function StudioDetailPage({ params }: StudioDetailPageProps) {
  const { id } = await params;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <Suspense fallback={<StudioDetailSkeleton />}>
        <StudioDetail studioId={id} />
      </Suspense>
    </div>
  );
}
