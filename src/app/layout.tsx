import type { Metadata } from "next";
import { Public_Sans, DM_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toast";

const dmSansHeading = DM_Sans({ subsets: ['latin'], variable: '--font-heading' });

const publicSans = Public_Sans({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: "StudioSpace | Creative Workspace & Production Studio Sharing",
  description:
    "Discover, filter, inspect availability, and reserve studio slots with transparent pricing and real-time booking management.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {

  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", "font-sans", publicSans.variable, dmSansHeading.variable)}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
