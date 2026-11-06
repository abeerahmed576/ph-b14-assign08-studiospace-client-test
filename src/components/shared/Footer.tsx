"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { showToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import type { StudioCategory } from "@/types/studio";

/* ------------------------------------------------------------------ */
/* Static content                                                      */
/* ------------------------------------------------------------------ */

const QUICK_LINKS: { label: string; href: string }[] = [
  { label: "Home", href: "/" },
  { label: "Browse Studios", href: "/studios" },
  { label: "About Us", href: "/about-us" },
  { label: "Host Your Space", href: "/dashboard/add-studio" },
];

const CATEGORY_LINKS: { value: StudioCategory; label: string }[] = [
  { value: "photo", label: "Photography" },
  { value: "video", label: "Film & Video" },
  { value: "lounge", label: "Podcast Lounge" },
  { value: "music", label: "Music Suite" },
  { value: "workshop", label: "Art Workshop" },
];

/** Brand glyphs aren't shipped by lucide-react — inline SVG paths instead. */
const SOCIALS: { label: string; href: string; path: string }[] = [
  {
    label: "X (Twitter)",
    href: "#",
    path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  },
  {
    label: "Instagram",
    href: "#",
    path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98C.014 8.333 0 8.741 0 12s.014 3.668.072 4.948c.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.668-.014 4.948-.072c4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948s-.014-3.667-.072-4.947c-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
  },
  {
    label: "Facebook",
    href: "#",
    path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  },
  {
    label: "YouTube",
    href: "#",
    path: "M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  },
];

/* ------------------------------------------------------------------ */
/* Footer                                                              */
/* ------------------------------------------------------------------ */

export function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterError, setNewsletterError] = useState<string | null>(null);

  // Dummy newsletter signup — no backend endpoint exists yet
  const handleNewsletterSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const email = newsletterEmail.trim();
    if (!email) {
      setNewsletterError("Please enter your email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setNewsletterError("That doesn't look like a valid email address.");
      return;
    }

    setNewsletterError(null);
    setNewsletterEmail("");
    showToast.success("You're subscribed!", "Welcome to the StudioSpace newsletter — see you in your inbox.");
  };

  return (
    <footer className="bg-background-alt border-t border-border" aria-label="Site footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ================= Top grid ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 py-12 md:py-16">
          {/* Brand + mission + socials */}
          <div className="lg:col-span-5 space-y-6">
            <Link
              href="/"
              className="inline-flex items-center gap-3 group outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg py-1"
              aria-label="StudioSpace Home"
            >
              <div className="relative size-9 sm:size-10 shrink-0 transition-transform duration-300 group-hover:scale-105">
                <Image
                  src="/studiospace-icon.svg"
                  alt="StudioSpace Icon"
                  width={40}
                  height={40}
                  className="size-full object-contain"
                />
              </div>
              <span className="font-heading font-bold text-xl sm:text-2xl tracking-tight text-foreground select-none">
                Studio
                <span className="text-accent italic font-bold">Space</span>
              </span>
            </Link>

            <p className="text-sm text-muted-foreground font-sans leading-relaxed max-w-sm">
              Empowering creators to find, book, and host premium production
              spaces — so great ideas always have a place to come to life.
            </p>

            {/* Dummy social links */}
            <ul className="flex items-center gap-2.5" aria-label="Social media">
              {SOCIALS.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    aria-label={social.label}
                    className={cn(
                      "size-9 rounded-full border border-border bg-background",
                      "flex items-center justify-center text-muted-foreground",
                      "hover:text-accent hover:border-accent/50 hover:bg-card",
                      "transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    )}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="size-4" aria-hidden="true">
                      <path d={social.path} />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick links */}
          <nav className="lg:col-span-2" aria-label="Quick links">
            <h3 className="font-heading font-semibold text-sm uppercase tracking-wider text-foreground mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground font-sans hover:text-accent transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Categories */}
          <nav className="lg:col-span-2" aria-label="Studio categories">
            <h3 className="font-heading font-semibold text-sm uppercase tracking-wider text-foreground mb-4">
              Categories
            </h3>
            <ul className="space-y-2.5">
              {CATEGORY_LINKS.map((category) => (
                <li key={category.value}>
                  <Link
                    href={`/studios?category=${category.value}`}
                    className="text-sm text-muted-foreground font-sans hover:text-accent transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                  >
                    {category.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Newsletter (dummy) */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="font-heading font-semibold text-sm uppercase tracking-wider text-foreground">
              Stay in the Loop
            </h3>
            <p className="text-sm text-muted-foreground font-sans leading-relaxed">
              New studio drop-ins, host tips, and member perks — once a month,
              no noise.
            </p>

            <form
              onSubmit={handleNewsletterSubmit}
              noValidate
              className="space-y-2"
              aria-label="Newsletter signup"
            >
              <div className="flex items-center gap-2">
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={newsletterEmail}
                  onChange={(event) => {
                    setNewsletterEmail(event.target.value);
                    setNewsletterError(null);
                  }}
                  className={cn(
                    "flex-1 min-w-0 px-4 py-2.5 rounded-full text-sm font-sans",
                    "bg-background border border-border text-foreground placeholder:text-muted-foreground/70",
                    "outline-none focus:border-accent/60 focus-visible:ring-2 focus-visible:ring-ring",
                    "transition-colors",
                    newsletterError && "border-destructive/60",
                  )}
                />
                <button
                  type="submit"
                  className={cn(
                    "size-10 shrink-0 rounded-full bg-primary text-primary-foreground",
                    "flex items-center justify-center hover:opacity-90",
                    "transition-opacity outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer",
                  )}
                  aria-label="Subscribe to newsletter"
                >
                  <ArrowRight className="size-4" aria-hidden="true" />
                </button>
              </div>
              {newsletterError && (
                <p className="text-xs text-destructive font-sans" role="alert">
                  {newsletterError}
                </p>
              )}
            </form>
          </div>
        </div>

        {/* ================= Bottom bar ================= */}
        <div className="border-t border-border py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground font-sans text-center sm:text-left">
            © {new Date().getFullYear()} StudioSpace. All rights reserved. By
            using StudioSpace you agree to our{" "}
            <a href="#" className="underline underline-offset-2 hover:text-accent transition-colors">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="underline underline-offset-2 hover:text-accent transition-colors">
              Privacy Policy
            </a>
            .
          </p>
          <p className="text-xs text-muted-foreground font-sans flex items-center gap-1.5">
            <span className="text-accent">•</span>
            Built for creators, by creators
          </p>
        </div>
      </div>
    </footer>
  );
}
