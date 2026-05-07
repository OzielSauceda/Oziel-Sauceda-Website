import { BearSpeech } from "@/components/bear-speech";
import { Hero } from "@/components/hero";
import { IdleCat } from "@/components/idle-cat";
import { Sections } from "@/components/sections";
import { SiteHeader } from "@/components/site-header";

export default function Home() {
  return (
    <main className="relative">
      <SiteHeader />
      <div className="px-10 pt-2 sm:px-16">
        <BearSpeech />
      </div>
      <IdleCat />
      <Hero />
      <Sections />

      <footer className="border-t border-hairline px-10 py-10 sm:px-16">
        <div className="flex flex-col items-start justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.22em] text-muted sm:flex-row sm:items-center">
          <span>© Oziel · 2026</span>
          <span>Built with care · Next.js · Motion</span>
        </div>
      </footer>
    </main>
  );
}
