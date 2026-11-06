import Link from "next/link";
import { ArrowRight, ShieldCheck, BadgeCheck, PackageCheck, Headphones } from "lucide-react";
import { cn } from "@/lib/utils";

import type { LucideIcon } from "lucide-react";

interface Assurance {
  icon: LucideIcon;
  title: string;
  description: string;
}

const ASSURANCES: Assurance[] = [
  {
    icon: ShieldCheck,
    title: "Liability Protection",
    description:
      "Every booking is backed by clear liability terms — damages, disputes, and cancellations are handled with fair, transparent rules for hosts and creators alike.",
  },
  {
    icon: BadgeCheck,
    title: "Verified Profiles",
    description:
      "Hosts and renters pass identity verification before listings go live or bookings are accepted, so every conversation starts from a place of trust.",
  },
  {
    icon: PackageCheck,
    title: "Equipment Safety",
    description:
      "Studios document their gear, handling rules, and safety checks on each listing — you always know exactly what you're walking into.",
  },
  {
    icon: Headphones,
    title: "24/7 Host Support",
    description:
      "Shoot ends at 2 AM and something breaks? Our support team is available around the clock, every day of the week.",
  },
];

export default function GuaranteeAndSupport() {
  return (
    <section
      aria-labelledby="guarantee-heading"
      className="py-16 md:py-24 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          {/* ================= Copy ================= */}
          <div className="space-y-6 max-w-2xl">
            <div className="space-y-3">
              <span className="text-xs uppercase tracking-[0.2em] text-accent font-semibold">
                • Trust &amp; Support
              </span>
              <h2
                id="guarantee-heading"
                className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground leading-[1.15]"
              >
                Book Any Space With{" "}
                <span className="text-accent italic font-bold">
                  Total Peace of Mind
                </span>
              </h2>
              <p className="text-base text-muted-foreground font-sans leading-relaxed">
                Hosting your gear, your team, and your reputation on a peer
                platform takes trust. StudioSpace guarantees are written into
                every booking — not bolted on as fine print.
              </p>
            </div>

            <Link
              href="/studios"
              className={cn(
                "inline-flex items-center gap-2 px-6 py-3 rounded-full",
                "bg-primary text-primary-foreground font-medium text-sm sm:text-base",
                "hover:opacity-90 transition-all shadow-sm group w-fit",
              )}
            >
              <span>Browse Verified Studios</span>
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* ================= Assurance cards ================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            {ASSURANCES.map((assurance) => {
              const Icon = assurance.icon;
              return (
                <div
                  key={assurance.title}
                  className={cn(
                    "h-full flex flex-col gap-3 rounded-2xl p-6",
                    "bg-card border border-border shadow-xs",
                    "hover:border-accent/40 hover:shadow-md transition-all duration-300",
                  )}
                >
                  <div className="size-10 rounded-full bg-secondary text-accent flex items-center justify-center shrink-0">
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                  <h3 className="font-heading font-semibold text-lg text-foreground">
                    {assurance.title}
                  </h3>
                  <p className="text-sm text-muted-foreground font-sans leading-relaxed">
                    {assurance.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
