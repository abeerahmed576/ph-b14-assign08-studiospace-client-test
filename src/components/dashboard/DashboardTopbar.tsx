"use client";

import { useRouter } from "next/navigation";
import { PanelLeft } from "lucide-react";
import { UserDropdown } from "@/components/shared/UserDropdown";
import { signOut, useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "../shared/ThemeToggle";

interface DashboardTopbarProps {
  onOpenMobileNav: () => void;
}

export function DashboardTopbar({ onOpenMobileNav }: DashboardTopbarProps) {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const handleLogout = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  const user = session?.user;

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full bg-background/85 backdrop-blur-md",
        "border-b border-border transition-shadow duration-200",
      )}
      aria-label="Dashboard Topbar"
    >
      <div className="relative flex items-center justify-between h-16 px-4 sm:px-6">
        {/* ================= LEFT: Drawer Toggle (mobile only) ================= */}
        <button
          type="button"
          onClick={onOpenMobileNav}
          className={cn(
            "md:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary",
            "transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer",
          )}
          aria-label="Open dashboard navigation"
          aria-controls="dashboard-mobile-drawer"
        >
          <PanelLeft className="size-6 text-foreground" />
        </button>
        <div className="hidden md:block" aria-hidden="true" />

        {/* ================= RIGHT: User Avatar & Dropdown ================= */}
        <div className="flex gap-2 items-center min-h-10">
          <ThemeToggle />
          {isPending ? (
            <div className="h-8 w-24 bg-secondary/70 animate-pulse rounded-full" />
          ) : user ? (
            <UserDropdown user={user} onLogout={handleLogout} />
          ) : null}
        </div>
      </div>
    </header>
  );
}
