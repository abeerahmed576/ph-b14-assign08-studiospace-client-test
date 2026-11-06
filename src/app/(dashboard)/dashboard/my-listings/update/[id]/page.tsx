import type { Metadata } from "next";
import { Suspense } from "react";
import {
  UpdateStudioForm,
  AddStudioFormSkeleton,
} from "@/components/dashboard/AddStudioForm";

export const metadata: Metadata = {
  title: "Update Studio | StudioSpace",
};

interface UpdateStudioPageProps {
  params: Promise<{ id: string }>;
}

export default async function UpdateStudioPage({
  params,
}: UpdateStudioPageProps) {
  const { id } = await params;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="space-y-2">
        <h1 className="text-3xl font-heading font-bold text-foreground">
          Update Studio
        </h1>
        <p className="text-muted-foreground">Update your studio details here</p>
      </div>
      <Suspense fallback={<AddStudioFormSkeleton />}>
        <UpdateStudioForm studioId={id} />
      </Suspense>
    </div>
  );
}
