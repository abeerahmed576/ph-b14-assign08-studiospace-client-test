import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { StudioCategory } from "@/types/studio";
import { cn } from "@/lib/utils";

/**
 * Static presentation data for the category tiles. The `value` field is the
 * authoritative StudioCategory used for the /studios?category= filter, so
 * it must stay in sync with the StudioCategory union — never invent values.
 */
interface CategoryTile {
  value: StudioCategory;
  title: string;
  subtext: string;
  image: string;
}

const CATEGORY_TILES: CategoryTile[] = [
  {
    value: "photo",
    title: "Photography",
    subtext: "Cyc walls & daylight studios",
    image: "/categories/photo.jpeg",
  },
  {
    value: "video",
    title: "Film & Video",
    subtext: "Sound stages & grip gear",
    image: "/categories/video.jpeg",
  },
  {
    value: "lounge",
    title: "Podcast Lounge",
    subtext: "Acoustics tuned for talk",
    image: "/categories/lounge.jpeg",
  },
  {
    value: "music",
    title: "Music Suite",
    subtext: "Tracking rooms & amps",
    image: "/categories/music.jpeg",
  },
  {
    value: "workshop",
    title: "Art Workshop",
    subtext: "Mess-friendly maker space",
    image: "/categories/art-workshop.jpeg",
  },
];

export function Categories() {
  return (
    <section aria-labelledby="categories-heading" className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ================= Section heading ================= */}
        <div className="space-y-3 mb-8 md:mb-12">
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            • Our Spaces
          </span>
          <h2
            id="categories-heading"
            className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground"
          >
            Browse Studios by{" "}
            <span className="text-accent italic font-bold">Category</span>
          </h2>
          <p className="text-base text-muted-foreground font-sans max-w-xl">
            From photo bays to podcast booths — jump straight to the kind of
            production space your next project calls for.
          </p>
        </div>

        {/* ================= Category tiles ================= */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {CATEGORY_TILES.map((tile) => (
            <Link
              key={tile.value}
              href={`/studios?category=${tile.value}`}
              className={cn(
                "group relative aspect-4/3 rounded-2xl overflow-hidden",
                "border border-border shadow-xs bg-card",
                "hover:shadow-md hover:border-accent/40 transition-all duration-300",
                "outline-none focus-visible:ring-2 focus-visible:ring-ring",
              )}
              aria-label={`Browse ${tile.title} studios`}
            >
              <Image
                src={tile.image}
                alt=""
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              />

              {/* Gradual shade for text legibility */}
              <div
                className="absolute inset-0 bg-linear-to-t from-black/85 via-black/35 to-black/5 pointer-events-none transition-colors duration-300 group-hover:via-black/45"
                aria-hidden="true"
              />

              {/* Title + subtext */}
              <div className="absolute inset-x-0 bottom-0 p-3.5 md:p-4 flex flex-col gap-0.5 text-white pointer-events-none">
                <h3 className="font-heading font-semibold text-sm md:text-base text-white leading-tight">
                  {tile.title}
                </h3>
                <p className="text-[11px] md:text-xs text-white/80 font-sans leading-snug">
                  {tile.subtext}
                </p>
              </div>

              {/* Hover affordance */}
              <span
                className={cn(
                  "absolute top-2.5 right-2.5 size-6 rounded-full",
                  "bg-background/90 text-foreground border border-border/60",
                  "flex items-center justify-center opacity-0 -translate-y-1",
                  "group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300",
                )}
                aria-hidden="true"
              >
                <ArrowRight className="size-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
