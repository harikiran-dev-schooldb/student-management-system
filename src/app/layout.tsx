// src/app/layout.tsx (SERVER COMPONENT)

import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";
import ClientProviders from "../../providers";
import I18nProvider from "@/components/I18nProvider";
// import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
  subsets: ["latin"],
  fallback: ["Arial", "sans-serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),

  title: {
    default: "School DB | Smart School Management System",
    template: "%s | School DB",
  },

  description:
    "School DB is a centralized school management system that helps principals manage academics, attendance, staff, and fees with clarity and control.",

  openGraph: {
    title: "School DB – Smart School Management System",
    description:
      "A leadership-focused ERP platform built for modern Indian schools.",
    url: "/",
    siteName: "School DB",
    images: [
      {
        url: "/og/home.png",
        width: 1200,
        height: 630,
        alt: "School DB Dashboard Preview",
      },
    ],
    locale: "en_IN",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "School DB – Smart School Management System",
    description:
      "Manage attendance, academics, staff, and fees from one powerful dashboard.",
    images: ["/og/home.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.className} min-h-screen flex flex-col`}>
          <I18nProvider>
            <ClientProviders>{children}</ClientProviders>
          </I18nProvider>

          {/* <Analytics /> */}
          {/* <SpeedInsights /> */}
        </body>
      </html>
    </ClerkProvider>
  );
}