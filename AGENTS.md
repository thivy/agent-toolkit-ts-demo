# AGENTS.md — Project Guidelines for AI Assistants

Guidelines for AI assistants (e.g., Codex, GitHub Copilot) contributing to this repo.

## Golden rules

- Make small, correct, reviewable changes. Prefer the simplest solution that fits existing patterns.
- Keep diffs minimal; don’t refactor unrelated code.
- Prefer existing repo patterns over general best practices.
- Don’t add dependencies unless clearly necessary (explain why).
- Use Bun-native runtime APIs and patterns where possible, and avoid Node.js-specific runtime dependencies unless required.
- You have access to skills in `.github\skills` for project-specific best practices and patterns. YOU MUST use these skills before answering questions or making changes related to these topics:
  - React features: `react-best-practices`
  - React components (composition): `vercel-composition-patterns`
  - Custom UI components: `ui-components`
  - Next.js features: `next-best-practices`
  - State management: `zustand`
  - New feature files: `web-project-conventions`

## Tech Stack

- Framework: Next.js (App Router) — see `web/package.json` for the exact version
- Runtime / package manager: Bun
- Bun in Docker: prefer Bun-native APIs and container-safe patterns (check Bun docs when unsure).
- UI: shadcn/ui components (built on Base UI primitives)
- Styling: Tailwind CSS
- Linting/formatting: oxlint / oxfmt (run via repo scripts)
- Type checking: TypeScript
- Forms: React Hook Form + Zod validation

## Quality Bar

Run these from the root directory:

- Lint: `bun run lint`
- Format: `bun run format`
- Run relevant tests (if any).
- Manually sanity-check the affected page/component in dev.

## Final Response Requirements

Include:

- What you changed (1–5 bullets)
- Why you changed it
- How you verified it (exact commands + results; if you couldn’t run commands, say so)
- Any follow-ups or risks (if applicable)
