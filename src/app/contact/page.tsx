export default function ContactPage() {
  return (
    <main className="relative px-10 pb-40 pt-32 sm:px-16 md:pl-32">
      <h1
        className="font-display text-[3rem] font-normal uppercase leading-[1.05] tracking-[0.02em] text-ink sm:text-[5rem]"
        style={{ textShadow: "3px 3px 0 #10204a" }}
      >
        Contact
      </h1>
      <p className="mt-10 max-w-2xl text-base leading-relaxed text-ink/80 sm:text-lg">
        Best way to reach me — {""}
        <a
          href="mailto:ozielutcs@gmail.com"
          className="text-accent underline-offset-4 transition-colors hover:underline"
        >
          ozielutcs@gmail.com
        </a>
      </p>
    </main>
  );
}
