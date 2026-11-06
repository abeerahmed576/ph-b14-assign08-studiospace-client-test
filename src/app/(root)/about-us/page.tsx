import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | StudioSpace",
  description: "Learn about StudioSpace, our mission, and our creator community.",
};

export default function AboutUsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="space-y-4 max-w-3xl">
        <span className="text-xs uppercase tracking-[0.2em] text-accent font-semibold">
          • ABOUT US
        </span>
        <h1 className="text-3xl md:text-5xl font-heading font-bold text-foreground">
          Built For <span className="text-accent italic">Creators Who Value Quality</span>
        </h1>
        <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
          StudioSpace connects creators with private and production-grade creative spaces. From indie photographers to film crews, our mission is to make finding and reserving production environments effortless.
        </p>
      </div>
    </div>
  );
}

