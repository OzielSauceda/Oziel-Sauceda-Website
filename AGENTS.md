<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Project Rules

Rules of engagement for this repo. Read before doing anything. Edit when conventions change.

---

## 1. Project Snapshot

- Personal website for **Oziel** — projects, research, hobbies, general info, contact form.
- Routes live in `src/app/`. Content (MDX) lives in `src/content/`. Components in `src/components/`.
- Owner: ozielutcs@gmail.com — ping for ambiguous product/design questions.

---

## 2. Tech Stack (locked — do not propose alternatives)

| Tool | Use it for |
|------|------------|
| **Next.js 15** (App Router) | Framework. App Router only — no Pages Router. |
| **TypeScript** (strict) | Language. `"strict": true` + `noUncheckedIndexedAccess`. |
| **Tailwind CSS v4** | Styling. No CSS Modules, no styled-components, no plain CSS files (except `globals.css`). |
| **Radix UI primitives** | Headless a11y layer. **Not shadcn/ui.** Style from scratch with Tailwind. |
| **Framer Motion** | Component-scoped motion (hover, presence, layout, route transitions). |
| **GSAP + ScrollTrigger** | Page-scoped scroll choreography (pinning, parallax, timelines). |
| **Lenis** | Global smooth scroll. |
| **React Three Fiber + Drei** | 3D — opt-in per page, max one scene, lazy-loaded. |
| **MDX** + `gray-matter` + Zod | Content. Frontmatter validated at load time. |
| **next/font** (Geist + Fraunces or Newsreader) | Self-hosted typography. No Google Fonts CDN. |
| **Lucide** | Icons. |
| **Resend** + **React Email** | Contact form delivery. |
| **Zod** + **React Hook Form** | Form validation. |
| **Vitest** | Unit tests. |
| **Playwright** + **axe-core** | E2E and accessibility tests. |
| **ESLint** (flat) + **Prettier** + **Husky** + **lint-staged** | Quality gates. |
| **pnpm** | Package manager. **Never npm or yarn.** |
| **Vercel** | Hosting. Preview deploy per branch. |
| **Vercel Analytics + Speed Insights** | Telemetry. No GA, no third-party trackers. |

---

## 3. Required Skills (invoke before working)

Skills that **must** be invoked via the Skill tool before writing code in their domain. Don't guess at a skill's contents — invoke it so its instructions are loaded into context.

| Skill | Invoke when... |
|-------|----------------|
| **`frontend-design`** | Doing **any** UI, frontend, component, page, layout, styling, animation, or visual design work. Invoke **before** writing the first line of JSX, Tailwind, or CSS. Re-invoke whenever the user pivots to a new UI task. |

**Hard rule:** if the task involves anything the user would *see* in the browser, the `frontend-design` skill runs first. No exceptions for "small" UI changes — even a button restyle, color tweak, or spacing adjustment goes through it. This is non-negotiable: the skill exists specifically to keep output away from generic AI aesthetics, which directly serves the Apple-minimal-but-innovative vision.

---

## 4. Code Rules

- **Server Components by default.** `"use client"` requires a one-line reason at the top of the file.
- **No `any`.** No `as` casts except at I/O boundaries (and document them).
- **Named exports only.** Exception: Next.js `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, `route.ts`.
- **Absolute imports** via `@/*`. No `../../..`.
- **No barrel files** (`index.ts` re-exports). They hurt tree-shaking and slow IDE.
- **No `useEffect` for data fetching** in code that could be a Server Component.
- **Naming:** files `kebab-case.tsx`, components `PascalCase`, utilities `camelCase`, types `PascalCase`, env vars `SCREAMING_SNAKE`.
- **Comments:** only when WHY is non-obvious. Never narrate WHAT.
- **No default exports** except where Next.js requires them.
- **Zod schemas live next to the type they describe**, exported alongside.
- **Never commit secrets.** Use `.env.local` (gitignored) and `process.env` server-side only.

---

## 5. Animation Rules (the highest-stakes section)

This site is animation-rich. Animations must be tasteful, performant, and accessible.

- **Animate `transform` and `opacity` only.** Never `width`, `height`, `top`, `left`, `margin`, `padding`.
- **Honor `prefers-reduced-motion: reduce` everywhere.** Render the final state immediately when it's set. No exceptions.
- **Use motion tokens from `src/lib/motion.ts`.** Never hardcode durations or easings inline.
  - Durations: `instant: 0.15s` · `quick: 0.3s` · `base: 0.6s` · `slow: 1.2s`
  - Easings: `easeOut: [0.16, 1, 0.3, 1]` (the "Apple curve") · `easeInOut: [0.65, 0, 0.35, 1]`
  - Stagger: `0.05s` between siblings
- **Tool selection** (don't mix tools for one animation):
  - **CSS:** sub-200ms hover/focus.
  - **Framer Motion:** component-scoped (hover, tap, presence, layout, route).
  - **GSAP + ScrollTrigger:** scroll-driven page sequences, pinning, parallax.
  - **R3F:** opt-in only, lazy-loaded, one scene per page.
- **Lenis is global** in the root layout. Disable it under `prefers-reduced-motion`.
- **60fps floor on a mid-tier laptop.** Profile with the Performance tab before merging anything elaborate.
- **No animation for animation's sake.** Every motion either reveals information, signals state, or rewards attention.

---

## 6. Design Rules

- **Always invoke the `frontend-design` skill before any UI work.** See §3.
- **One accent color** across the entire site. If tempted to add a second, don't.
- **Whitespace is a feature.** Default to more than feels comfortable.
- **Type scale and spacing live in `tailwind.config.ts`.** Never one-off `text-[17px]` or `mt-[23px]`.
- **Mobile-first.** Every animation degrades gracefully on touch.
- **No drop shadows beyond the system tokens.** No gradients except where explicitly designed.
- **Inspired by:** Apple, Linear, Vercel, Stripe. Aim for "minimal but innovative."

---

## 7. Content Rules (MDX frontmatter contract)

Every content file must validate against the Zod schema in `src/lib/mdx.ts`. To add a new project, copy this block and fill in. Same shape (with appropriate field names) for `research/` and `hobbies/`.

```yaml
---
title: string                  # required
slug: string                   # required, kebab-case, unique
date: 2026-05-06               # ISO 8601, required
updated: null                  # ISO 8601 or null
summary: string                # required, ≤ 140 chars, used in cards + meta description
tags: [tag-one, tag-two]       # required, kebab-case
hero:
  src: /images/projects/foo.jpg
  alt: string                  # required, meaningful
status: shipped                # shipped | wip | archived
links:
  live: https://example.com    # or null
  repo: https://github.com/... # or null
featured: false                # show on home page
---
```

- All hero images go in `public/images/<section>/`.
- Image filenames match the slug.
- Body uses MDX — drop in custom components for galleries, embeds, etc.

---

## 8. Accessibility Rules

- **WCAG 2.2 AA minimum.** Non-negotiable.
- **Semantic HTML first.** ARIA only when semantic HTML can't express the relationship.
- **Every interactive element** keyboard-reachable, with a visible focus ring (never `outline: none` without a replacement).
- **Color contrast:** 4.5:1 body text, 3:1 large text. Verify against the accent color.
- **Images:** meaningful `alt` always. Decorative images: `alt=""`.
- **`prefers-reduced-motion`** honored on every animation. See §4.
- **axe-core via Playwright** runs on every route in CI. Violations block merge.

---

## 9. Performance Rules

- **Lighthouse ≥ 95** in all four categories on every route. CI-enforced.
- **Core Web Vitals:** LCP < 1.8s · CLS < 0.05 · INP < 200ms.
- **Images:** always `next/image` with `width`, `height`, and explicit `sizes`. No raw `<img>`.
- **Fonts:** always `next/font` with `display: "swap"`. No external CDN.
- **JS budget:** < 100KB gzipped per route (R3F pages excepted).
- **Static content ships zero JS.** If it's not interactive, it's a Server Component.
- **Third-party scripts** require justification and an entry in §13.

---

## 10. Anti-Patterns — Do NOT

- Install component libraries with built-in chrome: **MUI, Chakra, Mantine, shadcn, Bootstrap, Ant Design.** They fight the bespoke aesthetic.
- Add a headless CMS. MDX-in-repo is the workflow.
- Add state management (Redux, Zustand, Jotai) until **two unrelated components** actually need to share state.
- Animate layout-affecting properties.
- Use `useEffect` for data fetching when a Server Component would work.
- Ship JS for purely static content.
- Accept dependencies not updated in 12+ months.
- Commit with `--no-verify`.
- Disable ESLint or TypeScript errors with inline comments without a `// reason: ...` explanation.

---

## 11. Commands

```bash
pnpm dev           # Local dev server (http://localhost:3000)
pnpm build         # Production build
pnpm start         # Preview production build locally
pnpm lint          # ESLint
pnpm typecheck     # tsc --noEmit
pnpm test          # Vitest unit tests
pnpm test:e2e      # Playwright E2E + axe-core
pnpm format        # Prettier write
```

Before pushing: `pnpm typecheck && pnpm lint && pnpm test`. Husky enforces this on commit.

---

## 12. Workflow Rules

- `main` is always deployable.
- Branch per feature: `feat/<short-name>`, `fix/<short-name>`, `chore/<short-name>`.
- Every PR gets a Vercel preview URL. Smoke-test the preview before requesting review.
- **Conventional Commits** enforced via commitlint:
  - `feat:` new feature · `fix:` bug fix · `chore:` tooling · `docs:` docs only · `refactor:` no behavior change · `perf:` perf · `test:` tests · `style:` formatting
- Never `--no-verify`. If a hook fails, fix the underlying issue.
- Never force-push to `main`.

---

## 13. Communication Rules

- Be terse. No preamble, no trailing summaries.
- Prefer editing existing files. Never create docs (`*.md`) unless explicitly asked.
- For non-trivial changes, propose the approach in 2-3 lines before writing code.
- Cite code as `path/to/file.ts:42` for navigation.
- When uncertain, ask one focused question rather than guessing.

---

## 14. Authorship & Attribution

The repo owner is the sole **author, contributor, committer, commenter, and collaborator** of every artifact this repo produces. Treat this as non-negotiable. This rule is **prevention-first** — cleanup after a leak is unreliable (see "Why prevention matters" below).

**Surfaces this rule covers — none may name, credit, or imply a tool, model, assistant, vendor, or AI service:**

- **Commit author and committer fields** — both must be the repo owner. Never set `--author=` or `GIT_AUTHOR_*` / `GIT_COMMITTER_*` env vars to anything else.
- **Commit messages** — no `Co-Authored-By:` trailers of any kind. No "Generated with…", "Made with…", or similar attribution lines. No tool / model / vendor / product / assistant names anywhere in the subject or body.
- **PR descriptions, PR titles, issue bodies, review comments, GitHub comments, commit comments, and any message posted on the owner's behalf** — no attribution footers, no tool/vendor name-drops, no robot/badge attribution emoji, no "co-authored by" prose.
- **Branch names, tag names, release names, release notes** — none may contain tool/vendor names.
- **Tracked files** (source, configs, docs, code comments, generated assets that ship, MDX content): no tool / model / vendor / assistant names anywhere. **Filenames included** — the rules file is `AGENTS.md`, not a tool-named file.
- **`.gitignore`** (committed) — never add tool-named paths. Per-tool local state (e.g., agent config dirs, agent-specific local files) belongs in `.git/info/exclude` (per-repo, not committed).
- **Auto-inserted attribution** from scaffolds, templates, or tooling — strip it before the change leaves the working tree. Includes default commit-message templates, default PR-body templates, "Generated with…" footers, and any boilerplate.
- **User-facing chat too** — don't quote, paraphrase, or list the avoided trailers/footers as examples of "what I'm not doing." Acknowledge the rule abstractly ("no attribution footers"), without naming the specific strings or vendor.

**Pre-push gate (mandatory before every `git push`, including the first):**

Before any push, run a sweep over the commits about to leave the working tree:

1. Author and committer are the repo owner on every commit being pushed.
2. No `Co-Authored-By:` trailers in any commit message being pushed.
3. No tool / vendor / assistant / model name in any commit subject, body, or trailer being pushed.
4. No tool / vendor / assistant / model name in any tracked file in the snapshot being pushed (the full tree, not just the diff).
5. Branch name being pushed is clean.

If any check fails, **do not push.** Fix at the source (amend / rebase / re-author) before the push leaves the local machine.

**Why prevention matters — the GitHub contributor cache lesson (2026-05-06):**

A `Co-Authored-By:` trailer was pushed to GitHub in this repo's first scaffold commit. The trailer was removed via `git commit --amend` and force-pushed; the tainted commit became orphaned (unreachable from any branch). However, GitHub's Contributors panel kept showing the AI tool as a contributor because GitHub's contributor cache is computed from commits known to the repo, *not* just commits reachable from a branch. Force-pushing rewrites refs but does not delete orphaned commit objects on GitHub's side, and the cache does not reliably re-derive on its own. The only definitive fix was: **delete the GitHub repository, recreate it empty, and push the clean local history fresh.**

Lesson: **once a tainted commit reaches a remote, local history rewriting cannot fully clean the remote.** Run the pre-push gate above on every push. No exceptions, including brand-new repos and one-line follow-up pushes.

---

## 15. Decision Log

Architectural decisions and the reasons behind them. Append entries; never delete.

- **2026-05-06** — Chose Next.js 15 over Astro/SvelteKit. Reason: full-stack flex (Server Actions for contact form), best ecosystem, Vercel-native.
- **2026-05-06** — Rejected shadcn/ui despite popularity. Reason: ships a generic SaaS aesthetic; Apple-minimal vision requires bespoke components on Radix primitives.
- **2026-05-06** — Both Framer Motion AND GSAP. Reason: different jobs (component vs. scroll-driven). Both industry standard. Cost is acceptable.
- **2026-05-06** — Mandated `frontend-design` skill for all UI/frontend work (see §3). Reason: aligns with the "avoid generic AI aesthetics" goal and the Apple-minimal vision; the skill is purpose-built for distinctive, production-grade frontend output.
- **2026-05-06** — Added §14 Authorship & Attribution. Reason: this is a personal portfolio; the owner wants it to read as fully their own work, with zero attribution to any tool, assistant, or vendor in any committed artifact or message posted on their behalf.
- **2026-05-06** — Strengthened §14 to prevention-first after a leak incident: an AI-tool `Co-Authored-By:` trailer was pushed in the first scaffold commit, and three rounds of cleanup (amend + force-push, `filter-branch` + force-push, finally delete-and-recreate the GitHub repo) were required because GitHub's contributor cache survives orphaned commits. Added the pre-push gate. Lesson: never let a tainted commit reach a remote — cleanup is unreliable.
