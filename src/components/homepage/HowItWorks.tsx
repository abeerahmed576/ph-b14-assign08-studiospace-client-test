import { CheckCircle2 } from "lucide-react";

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="py-16 md:py-24 bg-background-alt border-y border-border px-4 sm:px-6 lg:px-8 scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-xl mx-auto space-y-3">
          <span className="text-xs uppercase tracking-[0.2em] text-accent font-semibold">
            • HOW IT WORKS
          </span>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
            Book Your Next Space in{" "}
            <span className="text-accent italic">4 Simple Steps</span>
          </h2>
          <p className="text-sm md:text-base text-muted-foreground">
            Everything you need to discover, book, and create in top-tier
            studios.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* Step 1 */}
          <div className="bg-card p-6 rounded-2xl border border-border shadow-xs flex flex-col justify-between h-full">
            <div className="space-y-4">
              <div className="size-10 rounded-full bg-secondary flex items-center justify-center font-heading font-bold text-accent">
                01
              </div>
              <h3 className="text-xl font-heading font-semibold text-foreground">
                Browse & Discover
              </h3>
              <p className="text-sm text-muted-foreground font-sans leading-relaxed">
                Filter by category, equipment specs, cyc dimensions, acoustics,
                and location to find your ideal creative studio.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 text-xs text-accent font-medium">
              <CheckCircle2 className="size-4" />
              <span>Verified Studio Listings</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-card p-6 rounded-2xl border border-border shadow-xs flex flex-col justify-between h-full">
            <div className="space-y-4">
              <div className="size-10 rounded-full bg-secondary flex items-center justify-center font-heading font-bold text-accent">
                02
              </div>
              <h3 className="text-xl font-heading font-semibold text-foreground">
                Pick Your Time Slot
              </h3>
              <p className="text-sm text-muted-foreground font-sans leading-relaxed">
                View live calendar availability, select half-day or full-day
                studio blocks, and see upfront transparent pricing.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 text-xs text-accent font-medium">
              <CheckCircle2 className="size-4" />
              <span>Real-time Calendar Sync</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-card p-6 rounded-2xl border border-border shadow-xs flex flex-col justify-between h-full">
            <div className="space-y-4">
              <div className="size-10 rounded-full bg-secondary flex items-center justify-center font-heading font-bold text-accent">
                03
              </div>
              <h3 className="text-xl font-heading font-semibold text-foreground">
                Book Instantly
              </h3>
              <p className="text-sm text-muted-foreground font-sans leading-relaxed">
                Our dedicated behind-the-scenes folks value your time and make
                sure your bookings are fast and seamless.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 text-xs text-accent font-medium">
              <CheckCircle2 className="size-4" />
              <span>Instant Access & Support</span>
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-card p-6 rounded-2xl border border-border shadow-xs flex flex-col justify-between h-full">
            <div className="space-y-4">
              <div className="size-10 rounded-full bg-secondary flex items-center justify-center font-heading font-bold text-accent">
                04
              </div>
              <h3 className="text-xl font-heading font-semibold text-foreground">
                Create & Produce
              </h3>
              <p className="text-sm text-muted-foreground font-sans leading-relaxed">
                Receive instant studio check-in details, access passes, and
                load-in instructions. Create without friction.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 text-xs text-accent font-medium">
              <CheckCircle2 className="size-4" />
              <span>Instant Access & Support</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
