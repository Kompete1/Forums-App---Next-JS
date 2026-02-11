import type { Metadata } from "next";
import { Suspense } from "react";
import { JetBrains_Mono, Rajdhani, Source_Sans_3 } from "next/font/google";
import { AppToaster } from "@/components/app-toaster";
import { DraftSubmissionCleanup } from "@/components/draft-submission-cleanup";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const displayFont = Rajdhani({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const bodyFont = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const monoFont = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SA Racing Forum",
  description: "South African motorsport community forum for drivers and enthusiasts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <body className={`${displayFont.variable} ${bodyFont.variable} ${monoFont.variable}`}>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <Suspense fallback={null}>
          <DraftSubmissionCleanup />
        </Suspense>
        <SiteHeader />
        <div id="main-content" className="app-shell" tabIndex={-1}>
          {children}
        </div>
        <AppToaster />
      </body>
    </html>
  );
}
