import type { Metadata } from "next";
import { DM_Serif_Display, Geist, Geist_Mono, Press_Start_2P } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
// Font style 1 (backup): Jersey 25 — chunky retro display, clean lowercase e/g/s,
// pairs naturally with the pixel-art bear. To re-enable, uncomment the import +
// loader below and point --font-pixel in globals.css back to var(--font-jersey).
// import { Jersey_25 } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// Font style 1 backup loader (kept for reference; not currently active):
// const jersey25 = Jersey_25({
//   variable: "--font-jersey",
//   subsets: ["latin"],
//   weight: "400",
//   display: "swap",
// });

const pressStart2P = Press_Start_2P({
  variable: "--font-press-start",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

// DM Serif Display — free Google Font (SIL OFL). High-contrast display
// serif with sharp wedge serifs. The actual JIK album-cover face is GT
// Super Display Regular by Grilli Type, which is paid/commercial — DM
// Serif Display lands in the same editorial-display zone (high stroke
// contrast, sharp serifs, all-caps-friendly) without reproducing GT
// Super itself.
const dmSerifDisplay = DM_Serif_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Oziel — personal site",
  description:
    "Personal site of Oziel. Projects, research, hobbies, and ways to get in touch.",
  metadataBase: new URL("https://oziel.dev"),
  openGraph: {
    title: "Oziel",
    description:
      "Personal site of Oziel. Projects, research, hobbies, and ways to get in touch.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${pressStart2P.variable} ${dmSerifDisplay.variable}`}
    >
      <body className="min-h-screen overflow-x-hidden text-ink antialiased">
        <SiteHeader />
        {children}
        <footer className="border-t border-hairline px-10 py-10 sm:px-16">
          <div className="flex flex-col items-start justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.22em] text-muted sm:flex-row sm:items-center">
            <span>© Oziel · 2026</span>
            <span>Built with care · Next.js · Motion</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
