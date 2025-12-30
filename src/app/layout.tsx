// src/app/layout.tsx (SERVER COMPONENT)

import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientProviders from "../../providers";
import I18nProvider from "@/components/I18nProvider"; // 👈 Import this
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
  subsets: ["latin"],
  fallback: ["Arial", "sans-serif"],
});

export const metadata = {
  title: "Kotak Salesian School",
  description: "SCHOOL MANAGEMENT SYSTEM",
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
          {/* 👇 Wrap ClientProviders or children with I18nProvider */}
          <I18nProvider>
            <ClientProviders>
              {children}
            </ClientProviders>
          </I18nProvider>

          <Analytics />
          <SpeedInsights />
        </body>
      </html>
    </ClerkProvider>
  );
}