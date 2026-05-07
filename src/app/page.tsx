import { BearSpeech } from "@/components/bear-speech";
import { Hero } from "@/components/hero";
import { LevitatingCard } from "@/components/levitating-card";
import { SiteHeader } from "@/components/site-header";

const sections = [
  { label: "01", title: "About", href: "#about" },
  { label: "02", title: "Work", href: "#work" },
  { label: "03", title: "Research", href: "#research" },
  { label: "04", title: "Hobbies", href: "#hobbies" },
  { label: "05", title: "Contact", href: "mailto:ozielutcs@gmail.com" },
];

export default function Home() {
  return (
    <main className="relative">
      <SiteHeader />
      <div className="px-10 pt-2 sm:px-16">
        <BearSpeech />
      </div>
      <Hero />

      <section
        id="sections"
        aria-label="Site sections"
        className="relative px-10 pb-40 sm:px-16 md:pl-32"
      >
        <ul className="flex flex-col items-start gap-14 sm:gap-16">
          {sections.map((s) => (
            <li key={s.title}>
              <LevitatingCard
                label={s.label}
                title={s.title}
                href={s.href}
              />
            </li>
          ))}
        </ul>
      </section>

      <footer className="border-t border-hairline px-10 py-10 sm:px-16">
        <div className="flex flex-col items-start justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.22em] text-muted sm:flex-row sm:items-center">
          <span>© Oziel · 2026</span>
          <span>Built with care · Next.js · Motion</span>
        </div>
      </footer>
    </main>
  );
}
