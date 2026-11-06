"use client";

import * as React from "react";
import { Toast as ToastPrimitive } from "@base-ui/react/toast";
import { cn } from "@/lib/utils";
import {
  X,
  CheckCircle2,
  AlertCircle,
  Info,
  AlertTriangle,
  Loader2,
} from "lucide-react";

const toast = ToastPrimitive.createToastManager();

function ToastProvider({ ...props }: ToastPrimitive.Provider.Props) {
  return <ToastPrimitive.Provider {...props} />;
}

function ToastPortal({ ...props }: ToastPrimitive.Portal.Props) {
  return <ToastPrimitive.Portal data-slot="toast-portal" {...props} />;
}

function ToastViewport({ className, ...props }: ToastPrimitive.Viewport.Props) {
  return (
    <ToastPrimitive.Viewport
      data-slot="toast-viewport"
      className={cn(
        "pointer-events-none fixed top-4 right-4 z-1000 flex flex-col gap-2 w-auto max-w-sm sm:w-full outline-none",
        className,
      )}
      {...props}
    />
  );
}

function Toast({ className, ...props }: ToastPrimitive.Root.Props) {
  return (
    <ToastPrimitive.Root
      data-slot="toast"
      swipeDirection="up"
      className={cn(
        "group/toast pointer-events-auto relative z-[calc(1000-var(--toast-index))] w-full rounded-2xl border border-border bg-card text-card-foreground shadow-lg will-change-transform outline-none select-none",
        "[--gap:0.75rem] [--peek:0.75rem] [--scale:calc(max(0,1-(var(--toast-index)*0.08)))] [--shrink:calc(1-var(--scale))] [--height:var(--toast-frontmost-height,var(--toast-height))] [--offset-y:calc(var(--toast-offset-y)+(var(--toast-index)*var(--gap))+var(--toast-swipe-movement-y))]",
        "origin-top-right transition-all duration-300 ease-out",
        "data-starting-style:opacity-0 data-starting-style:-translate-y-4 data-starting-style:scale-95",
        "data-ending-style:opacity-0 data-ending-style:-translate-y-4 data-ending-style:scale-95",
        className,
      )}
      {...props}
    />
  );
}

function ToastContent({ className, ...props }: ToastPrimitive.Content.Props) {
  return (
    <ToastPrimitive.Content
      data-slot="toast-content"
      className={cn("flex items-start gap-3 p-4", className)}
      {...props}
    />
  );
}

function ToastTitle({ className, ...props }: ToastPrimitive.Title.Props) {
  return (
    <ToastPrimitive.Title
      data-slot="toast-title"
      className={cn(
        "text-sm font-semibold font-sans text-foreground leading-snug",
        className,
      )}
      {...props}
    />
  );
}

function ToastDescription({
  className,
  ...props
}: ToastPrimitive.Description.Props) {
  return (
    <ToastPrimitive.Description
      data-slot="toast-description"
      className={cn(
        "text-xs text-muted-foreground font-sans mt-0.5 leading-relaxed",
        className,
      )}
      {...props}
    />
  );
}

function ToastClose({
  className,
  children,
  ...props
}: ToastPrimitive.Close.Props) {
  return (
    <ToastPrimitive.Close
      data-slot="toast-close"
      aria-label="Close notification"
      className={cn(
        "relative shrink-0 -mr-1 -mt-1 p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      {...props}
    >
      {children ?? <X className="size-4" aria-hidden="true" />}
    </ToastPrimitive.Close>
  );
}

function ToastIcon({ type }: { type: string | undefined }) {
  if (type === "success") {
    return (
      <span className="shrink-0 text-success mt-0.5" aria-hidden="true">
        <CheckCircle2 className="size-5" />
      </span>
    );
  }

  if (type === "error") {
    return (
      <span className="shrink-0 text-destructive mt-0.5" aria-hidden="true">
        <AlertCircle className="size-5" />
      </span>
    );
  }

  if (type === "warning") {
    return (
      <span className="shrink-0 text-accent mt-0.5" aria-hidden="true">
        <AlertTriangle className="size-5" />
      </span>
    );
  }

  if (type === "info") {
    return (
      <span className="shrink-0 text-accent mt-0.5" aria-hidden="true">
        <Info className="size-5" />
      </span>
    );
  }

  if (type === "loading") {
    return (
      <span
        className="shrink-0 text-muted-foreground mt-0.5"
        aria-hidden="true"
      >
        <Loader2 className="size-5 animate-spin" />
      </span>
    );
  }

  return null;
}

function ToastList() {
  const { toasts } = ToastPrimitive.useToastManager();

  return toasts.map((toastItem) => (
    <Toast key={toastItem.id} toast={toastItem}>
      <ToastContent>
        <ToastIcon type={toastItem.type} />
        <div className="flex min-w-0 flex-1 flex-col">
          <ToastTitle />
          <ToastDescription />
        </div>
        <ToastClose />
      </ToastContent>
    </Toast>
  ));
}

function Toaster({
  children,
  toastManager = toast,
  ...props
}: ToastPrimitive.Provider.Props) {
  return (
    <ToastProvider toastManager={toastManager} {...props}>
      {children}
      <ToastPortal>
        <ToastViewport>
          <ToastList />
        </ToastViewport>
      </ToastPortal>
    </ToastProvider>
  );
}

// Convenient helper functions matching current action
export const showToast = {
  success: (title: string, description?: string) =>
    toast.add({ title, description, type: "success" }),
  error: (title: string, description?: string) =>
    toast.add({ title, description, type: "error" }),
  info: (title: string, description?: string) =>
    toast.add({ title, description, type: "info" }),
  warning: (title: string, description?: string) =>
    toast.add({ title, description, type: "warning" }),
};

export {
  Toaster,
  Toast,
  ToastClose,
  ToastContent,
  ToastDescription,
  ToastPortal,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  toast,
};
