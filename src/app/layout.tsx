import type { Metadata } from "next";
import { Geist, Geist_Mono, Press_Start_2P } from "next/font/google";
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
      className={`${geistSans.variable} ${geistMono.variable} ${pressStart2P.variable}`}
    >
      <body className="min-h-screen overflow-x-hidden text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
