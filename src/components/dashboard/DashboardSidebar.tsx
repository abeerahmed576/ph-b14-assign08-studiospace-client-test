"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PlusCircle,
  Building2,
  CalendarDays,
  PanelLeftClose,
  PanelLeft,
  X,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardSidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean | ((prev: boolean) => boolean)) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (value: boolean) => void;
}

const DASHBOARD_LINKS = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Add New Studio",
    href: "/dashboard/add-studio",
    icon: PlusCircle,
  },
  {
    label: "My Studio Listings",
    href: "/dashboard/my-listings",
    icon: Building2,
  },
  {
    label: "My Bookings",
    href: "/dashboard/my-bookings",
    icon: CalendarDays,
  },
];

export function DashboardSidebar({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
}: DashboardSidebarProps) {
  const pathname = usePathname();

  const isLinkActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* ============================================================== */}
      {/* 1. Desktop Full-Height Sidebar (Hidden in mobile view)         */}
      {/* ============================================================== */}
      <aside
        className={cn(
          "hidden md:flex flex-col shrink-0 min-h-screen sticky top-0 h-screen",
          "border-r border-border bg-card transition-all duration-300 z-30",
          isCollapsed ? "w-20" : "w-64",
        )}
        aria-label="Dashboard Sidebar"
      >
        {/* Top Header: StudioSpace Logo (top-left) + Collapsible Button (top-right) */}
        <div
          className={cn(
            "flex items-center h-16 border-b border-border px-3.5",
            isCollapsed ? "justify-center" : "justify-between",
          )}
        >
          {/* Top-Left Logo */}
          {!isCollapsed && (
            <Link
              href="/"
              className="flex items-center gap-2.5 group outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg py-1 truncate"
              aria-label="StudioSpace Home"
            >
              <div className="relative size-8 shrink-0 transition-transform duration-200 group-hover:scale-105">
                <Image
                  src="/studiospace-icon.svg"
                  alt="StudioSpace Icon"
                  width={32}
                  height={32}
                  className="size-full object-contain"
                  priority
                />
              </div>
              <span className="font-heading font-bold text-lg tracking-tight text-foreground select-none truncate">
                Studio
                <span className="text-accent italic font-bold">Space</span>
              </span>
            </Link>
          )}

          {isCollapsed && (
            <Link
              href="/"
              className="flex items-center justify-center p-1.5 rounded-lg group outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="StudioSpace Home"
              title="StudioSpace Home"
            >
              <Image
                src="/studiospace-icon.svg"
                alt="StudioSpace Icon"
                width={32}
                height={32}
                className="size-8 object-contain"
                priority
              />
            </Link>
          )}

          {/* Top-Right Collapsible Button (opens/closes the navbar) */}
          <button
            type="button"
            onClick={() => setIsCollapsed((prev) => !prev)}
            className={cn(
              "p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary",
              "transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer",
              isCollapsed && "hidden",
            )}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <PanelLeftClose className="size-5" />
          </button>
        </div>

        {/* When collapsed on desktop, show a small expand button below logo */}
        {isCollapsed && (
          <div className="flex justify-center py-2 border-b border-border/50">
            <button
              type="button"
              onClick={() => setIsCollapsed(false)}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Expand sidebar"
              title="Expand sidebar"
            >
              <PanelLeft className="size-5 text-accent" />
            </button>
          </div>
        )}

        {/* Navigation Links with Active Highlighting */}
        <nav
          className="flex-1 py-4 px-2.5 space-y-1.5 overflow-y-auto"
          aria-label="Dashboard Navigation"
        >
          {DASHBOARD_LINKS.map((link) => {
            const active = isLinkActive(link.href);
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-sans transition-all duration-200",
                  active
                    ? "bg-accent/10 text-accent font-semibold border-l-3 border-accent shadow-2xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/70 font-medium",
                  isCollapsed && "justify-center px-2 border-l-0",
                )}
                aria-current={active ? "page" : undefined}
                title={isCollapsed ? link.label : undefined}
              >
                <Icon
                  className={cn(
                    "size-5 shrink-0 transition-colors",
                    active
                      ? "text-accent"
                      : "text-muted-foreground group-hover:text-foreground",
                  )}
                />
                {!isCollapsed && <span className="truncate">{link.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Back-to-site link */}
        <div className="p-3 border-t border-border">
          <Link
            href="/"
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-muted-foreground",
              "hover:text-foreground hover:bg-secondary transition-colors font-sans",
              isCollapsed && "justify-center px-2",
            )}
            title="Back to StudioSpace site"
          >
            <ArrowLeft className="size-4 shrink-0" />
            {!isCollapsed && <span>Back to Main Site</span>}
          </Link>
        </div>
      </aside>

      {/* ============================================================== */}
      {/* 2. Mobile Drawer Navbar (Responsive overlay opened by Top Nav) */}
      {/* ============================================================== */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsMobileOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div className="fixed top-0 bottom-0 left-0 w-72 max-w-[85vw] h-full bg-card border-r border-border shadow-2xl flex flex-col z-50 animate-in slide-in-from-left duration-300">
            {/* Drawer Header: StudioSpace Logo (top-left) + Close Button (top-right) */}
            <div className="flex items-center justify-between h-16 border-b border-border px-4">
              {/* Logo */}
              <Link
                href="/"
                onClick={() => setIsMobileOpen(false)}
                className="flex items-center gap-2.5 outline-none"
              >
                <div className="relative size-8 shrink-0">
                  <Image
                    src="/studiospace-icon.svg"
                    alt="StudioSpace Icon"
                    width={32}
                    height={32}
                    className="size-full object-contain"
                  />
                </div>
                <span className="font-heading font-bold text-lg tracking-tight text-foreground">
                  Studio
                  <span className="text-accent italic font-bold">Space</span>
                </span>
              </Link>

              {/* Collapsible / Close Button at top-right */}
              <button
                type="button"
                onClick={() => setIsMobileOpen(false)}
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Close navigation drawer"
              >
                <X className="size-5 text-foreground" />
              </button>
            </div>

            {/* Drawer Navigation Links */}
            <nav
              className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto"
              aria-label="Mobile Dashboard Navigation"
            >
              {DASHBOARD_LINKS.map((link) => {
                const active = isLinkActive(link.href);
                const Icon = link.icon;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3.5 py-3 rounded-xl text-base font-sans transition-all",
                      active
                        ? "bg-accent/10 text-accent font-semibold border-l-3 border-accent"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/70 font-medium",
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    <Icon
                      className={cn(
                        "size-5 shrink-0",
                        active ? "text-accent" : "text-muted-foreground",
                      )}
                    />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-border">
              <Link
                href="/"
                onClick={() => setIsMobileOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors font-sans"
              >
                <ArrowLeft className="size-4 shrink-0" />
                <span>Back to Main Site</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
