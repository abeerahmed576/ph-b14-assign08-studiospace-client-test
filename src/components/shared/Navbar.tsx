"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, ArrowRight } from "lucide-react";
import { UserDropdown } from "./UserDropdown";
import { ThemeToggle } from "./ThemeToggle";
import type { NavbarProps, NavItem } from "@/types/navbar";
import { cn } from "@/lib/utils";
import { signOut, useSession } from "@/lib/auth-client";

const NAV_LINKS: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Explore Studios", href: "/studios" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "About Us", href: "/about-us" },
];

export function Navbar({
  user: propUser,
  onLogout: propOnLogout,
  className,
}: NavbarProps) {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const currentUser = propUser !== undefined ? propUser : session?.user;

  const handleLogout = async () => {
    if (propOnLogout) {
      await propOnLogout();
      return;
    }
    signOut();
    router.push("/");
    router.refresh();
  };
  const pathname = usePathname();
  const [currentHash, setCurrentHash] = useState<string>("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);

  // Synchronize mobile menu closing on route changes
  const [prevPathname, setPrevPathname] = useState<string>(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setIsMobileMenuOpen(false);
  }

  // Track window scroll for subtle elevation styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Track hash for active state on anchor links (e.g. /#how-it-works)
  useEffect(() => {
    const updateHash = () => {
      setCurrentHash(window.location.hash);
    };
    updateHash();
    window.addEventListener("hashchange", updateHash);
    return () => window.removeEventListener("hashchange", updateHash);
  }, []);

  // Determine if a navigation link is currently active
  const isLinkActive = (href: string) => {
    if (href === "/#how-it-works") {
      return pathname === "/" && currentHash === "#how-it-works";
    }
    if (href === "/") {
      return pathname === "/" && (!currentHash || currentHash === "#");
    }
    if (href.startsWith("/studios")) {
      return pathname.startsWith("/studios");
    }
    if (href.startsWith("/about-us")) {
      return pathname.startsWith("/about-us");
    }
    return pathname === href;
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full bg-background/85 backdrop-blur-md border-b border-border transition-shadow duration-200",
        isScrolled && "shadow-xs",
        className,
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* ================= LEFT: Brand Logo ================= */}
          <div className="flex items-center">
            <Link
              href="/"
              className="flex items-center gap-3 group outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg py-1"
              aria-label="StudioSpace Home"
            >
              <div className="relative size-9 sm:size-10 shrink-0 transition-transform duration-300 group-hover:scale-105">
                <Image
                  src="/studiospace-icon.svg"
                  alt="StudioSpace Icon"
                  width={40}
                  height={40}
                  className="size-full object-contain"
                  priority
                />
              </div>
              <span className="font-heading font-bold text-xl sm:text-2xl tracking-tight text-foreground select-none">
                Studio
                <span className="text-accent italic font-bold">Space</span>
              </span>
            </Link>
          </div>

          {/* ================= MIDDLE: Desktop Navigation Links ================= */}
          <nav
            className="hidden md:flex items-center gap-1 lg:gap-2"
            aria-label="Main Navigation"
          >
            {NAV_LINKS.map((link) => {
              const active = isLinkActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative px-3.5 py-2 text-sm font-sans transition-colors rounded-full",
                    active
                      ? "text-accent font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/60",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <span>{link.label}</span>
                  {/* Active Route Indicator Bar */}
                  {active && (
                    <span
                      className="absolute bottom-0 left-3.5 right-3.5 h-0.5 bg-accent rounded-full"
                      aria-hidden="true"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* ================= RIGHT: Actions & Auth State ================= */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Desktop Auth State */}
            <div className="hidden sm:flex items-center gap-2 min-h-10">
              {isPending && propUser === undefined ? (
                <div className="flex items-center gap-2">
                  <div className="h-8 w-16 bg-secondary/70 animate-pulse rounded-full" />
                  <div className="h-8 w-20 bg-secondary/70 animate-pulse rounded-full" />
                </div>
              ) : currentUser ? (
                /* Authenticated State */
                <UserDropdown user={currentUser} onLogout={handleLogout} />
              ) : (
                /* Unauthenticated State */
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className={cn(
                      "inline-flex items-center justify-center px-4 py-2 rounded-full",
                      "text-sm font-medium text-foreground hover:text-accent hover:bg-secondary/70",
                      "transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    )}
                  >
                    Login
                  </Link>

                  <Link
                    href="/register"
                    className={cn(
                      "inline-flex items-center justify-center gap-1.5 px-4.5 py-2 rounded-full",
                      "text-sm font-medium bg-primary text-primary-foreground hover:opacity-90",
                      "transition-all duration-200 shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    )}
                  >
                    <span>Register</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className={cn(
                "md:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary",
                "transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
              )}
              aria-label={
                isMobileMenuOpen
                  ? "Close navigation menu"
                  : "Open navigation menu"
              }
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="size-6 text-foreground" />
              ) : (
                <Menu className="size-6 text-foreground" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ================= Mobile Navigation Drawer ================= */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 pt-3 pb-6 animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col gap-1.5" aria-label="Mobile Navigation">
            {NAV_LINKS.map((link) => {
              const active = isLinkActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-base font-sans transition-colors",
                    active
                      ? "bg-secondary text-accent font-semibold border-l-3 border-accent"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <span>{link.label}</span>
                  {active && <span className="size-2 rounded-full bg-accent" />}
                </Link>
              );
            })}
          </nav>

          {/* Mobile Auth Actions */}
          <div className="mt-4 pt-4 border-t border-border">
            {isPending && propUser === undefined ? (
              <div className="py-2 flex justify-center">
                <div className="h-9 w-full bg-secondary/60 animate-pulse rounded-xl" />
              </div>
            ) : currentUser ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 px-3 py-2 bg-secondary/50 rounded-xl">
                  {currentUser.image ? (
                    <Image
                      src={currentUser.image}
                      alt={currentUser.name || "User avatar"}
                      width={36}
                      height={36}
                      className="size-9 rounded-full object-cover border border-border"
                      unoptimized
                    />
                  ) : (
                    <div className="size-9 rounded-full bg-accent text-accent-foreground font-semibold flex items-center justify-center text-sm">
                      {currentUser.name?.[0]?.toUpperCase() || "U"}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {currentUser.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {currentUser.email}
                    </p>
                  </div>
                </div>

                {/* Mobile Dropdown Links */}
                <div className="grid grid-cols-1 gap-1">
                  <Link
                    href="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-3.5 py-2 text-sm text-foreground hover:bg-secondary rounded-lg transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/dashboard/add-studio"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-3.5 py-2 text-sm text-foreground hover:bg-secondary rounded-lg transition-colors"
                  >
                    Add New Studio
                  </Link>
                  <Link
                    href="/dashboard/my-listings"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-3.5 py-2 text-sm text-foreground hover:bg-secondary rounded-lg transition-colors"
                  >
                    My Studio Listings
                  </Link>
                  <Link
                    href="/dashboard/my-bookings"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-3.5 py-2 text-sm text-foreground hover:bg-secondary rounded-lg transition-colors"
                  >
                    My Bookings
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-left px-3.5 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 px-4 rounded-full border border-border text-foreground hover:bg-secondary transition-colors text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 px-4 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity text-sm font-medium flex items-center justify-center gap-1.5"
                >
                  <span>Register</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
