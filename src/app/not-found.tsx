import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Film } from "lucide-react";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Page Not Found | StudioSpace",
};

/**
 * Global not-found boundary. The root not-found renders inside the root
 * layout only (route-group layouts are NOT applied), so the public chrome
 * (Navbar + Footer) is composed explicitly here.
 */
export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="max-w-xl w-full space-y-6 text-center">
          {/* Oversized ghost numeral */}
          <p
            className="font-heading font-bold text-[6rem] sm:text-[8rem] leading-none text-accent/20 select-none -mb-4"
            aria-hidden="true"
          >
            404
          </p>

          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <Film className="size-3.5 text-accent" aria-hidden="true" />
            <span>• Scene Not Found</span>
          </span>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-foreground leading-[1.15]">
            This Page Has{" "}
            <span className="text-accent italic font-bold">Left the Studio</span>
          </h1>

          <p className="text-base text-muted-foreground font-sans leading-relaxed max-w-md mx-auto">
            The address you followed doesn&apos;t match any studio, listing, or
            page. Double-check the URL, or head back and keep browsing.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/"
              className={cn(
                "inline-flex items-center gap-2 px-6 py-3 rounded-full",
                "bg-primary text-primary-foreground font-medium text-sm sm:text-base",
                "hover:opacity-90 transition-all shadow-sm group",
              )}
            >
              <span>Back to Home</span>
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href="/studios"
              className={cn(
                "inline-flex items-center gap-2 px-6 py-3 rounded-full",
                "border border-border bg-background text-foreground",
                "hover:bg-secondary font-medium text-sm sm:text-base",
                "transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
              )}
            >
              <span>Browse Studios</span>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
