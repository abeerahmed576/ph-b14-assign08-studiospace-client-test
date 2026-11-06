"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronDown,
  LayoutDashboard,
  PlusCircle,
  Building2,
  CalendarDays,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import type { User } from "@/types/user";
import { cn } from "@/lib/utils";

interface UserDropdownProps {
  user: User;
  onLogout?: () => void | Promise<void>;
}

export function UserDropdown({ user, onLogout }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  const menuItems = [
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

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "flex items-center gap-2.5 py-1 px-2 md:py-1.5 md:px-3 rounded-full",
          "border border-border/80 hover:border-accent/50 bg-background hover:bg-secondary/60",
          "transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring",
          isOpen && "ring-2 ring-ring border-accent"
        )}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="User account menu"
      >
        {/* Profile Image / Fallback Avatar */}
        <div className="relative size-8 rounded-full overflow-hidden shrink-0 border border-border bg-secondary flex items-center justify-center">
          {user.image && !imageError ? (
            <Image
              src={user.image}
              alt={user.name || "User profile photo"}
              width={32}
              height={32}
              className="size-full object-cover"
              onError={() => setImageError(true)}
              unoptimized
            />
          ) : (
            <span className="text-xs font-semibold text-secondary-foreground flex items-center justify-center">
              {initials || <UserIcon className="size-4 text-muted-foreground" />}
            </span>
          )}
        </div>

        {/* User Name */}
        <span className="hidden sm:inline-block font-sans text-sm font-medium text-foreground max-w-[130px] truncate">
          {user.name}
        </span>

        {/* Chevron Icon */}
        <ChevronDown
          className={cn(
            "size-4 text-muted-foreground transition-transform duration-200 shrink-0",
            isOpen && "rotate-180 text-foreground"
          )}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown Menu Popup */}
      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className={cn(
            "absolute right-0 mt-2 w-64 rounded-2xl border border-border bg-card shadow-lg",
            "p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 origin-top-right",
            "focus:outline-none divide-y divide-border/60"
          )}
        >
          {/* User Info Header */}
          <div className="px-3.5 py-3">
            <p className="text-sm font-medium text-foreground truncate font-sans">
              {user.name}
            </p>
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {user.email}
            </p>
          </div>

          {/* Navigation Links */}
          <div className="py-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  role="menuitem"
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-2.5 px-3.5 py-2 text-sm text-foreground",
                    "rounded-xl hover:bg-secondary/80 hover:text-accent transition-colors",
                    "font-sans group"
                  )}
                >
                  <Icon className="size-4 text-muted-foreground group-hover:text-accent transition-colors shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Logout Action */}
          <div className="py-1">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setIsOpen(false);
                if (onLogout) {
                  onLogout();
                }
              }}
              className={cn(
                "w-full flex items-center gap-2.5 px-3.5 py-2 text-sm",
                "text-destructive hover:bg-destructive/10 rounded-xl",
                "transition-colors font-sans text-left"
              )}
            >
              <LogOut className="size-4 shrink-0" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

