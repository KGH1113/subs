import "@/styles/globals.css";
import "@sweetalert2/theme-dark/dark.min.css";

import { Inter as FontSans } from "next/font/google";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";

import MainLayout from "@/components/MainLayout";
import { Toaster } from "@/components/ui/sonner";

import { SpeedInsights } from "@vercel/speed-insights/next";

const fontSans = FontSans({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "SUBS",
  description: "Seoun Middle School Broadcast System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="@sweetalert2/themes/dark/dark.css" />
      </head>
      <body
        className={cn(
          "h-fit bg-background font-sans antialiased dark",
          fontSans.variable
        )}
      >
        <MainLayout>{children}</MainLayout>
        <Toaster richColors />
        <SpeedInsights />
      </body>
    </html>
  );
}
