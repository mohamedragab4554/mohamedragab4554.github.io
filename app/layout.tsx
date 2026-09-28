import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { profile } from "@/content/profile";

// Self-hosted fonts (SIL Open Font License): IBM Plex Sans / Mono for text and data, Archivo (variable width) for display.
const sans = localFont({
  src: [
    { path: "./fonts/IBMPlexSans-400.woff2", weight: "400" },
    { path: "./fonts/IBMPlexSans-500.woff2", weight: "500" },
    { path: "./fonts/IBMPlexSans-600.woff2", weight: "600" },
  ],
  variable: "--font-sans",
  display: "swap",
});
const mono = localFont({
  src: [
    { path: "./fonts/IBMPlexMono-400.woff2", weight: "400" },
    { path: "./fonts/IBMPlexMono-500.woff2", weight: "500" },
  ],
  variable: "--font-mono",
  display: "swap",
});
const display = localFont({
  src: "./fonts/Archivo-Variable.woff2",
  variable: "--font-display",
  display: "swap",
  weight: "100 900",
  declarations: [{ prop: "font-stretch", value: "62% 125%" }],
});

export const metadata: Metadata = {
  title: { default: `${profile.name}: ${profile.title}`, template: `%s · ${profile.name}` },
  description:
    "Mohamed Ragab, AI & Digital Construction Engineer: structural engineering, BIM and computer vision applied to inspection, structural drawings, Scan-to-BIM and digital twins. Every metric traced to its source.",
  openGraph: { title: `${profile.name}: ${profile.title}`, description: profile.headline, type: "website", images: ["/images/profile/headshot.webp"] },
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = { themeColor: "#0A1220", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${sans.variable} ${mono.variable} ${display.variable}`} suppressHydrationWarning>
      <head>
        {/* enable motion only with JS and when the visitor has not asked for reduced motion */}
        <script
          dangerouslySetInnerHTML={{
            __html: "try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.dataset.motion='ok'}catch(e){}",
          }}
        />
      </head>
      <body className="min-h-screen font-sans">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-surface focus:px-4 focus:py-2 focus:shadow-card">
          Skip to content
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
