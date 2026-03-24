## GitHub Copilot Agent Toolkit

This repo showcases GitHub Copilot coding agents and reusable skills that speed up modern frontend development. It pairs a Next.js (App Router) demo app with curated agent/skill guidance for Tailwind CSS, shadcn/ui components, and Zustand state management.

## What You Get

- A working Next.js app under [web/](web/) for hands-on examples.
- A 2-phase agent workflow under [.github/agents/](.github/agents/) for combined planning and task planning.
- Agent and skill docs under [.github/skills/](.github/skills/) to guide Copilot on best practices.
- Consistent conventions for components, features, and state that keep changes small and reviewable.

## Stack Focus

- Next.js (App Router)
- Tailwind CSS
- shadcn/ui component library
- Zustand (decoupled actions pattern)
- Bun for package management and scripts

## Repo Tour

- [AGENTS.md](AGENTS.md) - How agents should work in this repo.
- [.github/agents/](.github/agents/) - Built-in planning agents:
  - [📝 Plan](.github/agents/plan.agent.md) - Gathers requirements and produces a combined planning output with technical design.
  - [✅ Task](.github/agents/task.agent.md) - Breaks the approved plan into actionable implementation tasks.
- [web/](web/) - Next.js application code.
- [.github/skills/](.github/skills/) - Skill references that guide Copilot on React composition, Next.js patterns, UI composition, and state management.

## Agent Workflow

Use the two agents in order for spec-driven delivery:

1. **📝 Plan** → capture requirements and define the technical approach in one approved plan output.
2. **✅ Task** → generate an execution-ready task breakdown from that approved plan.

Each agent is phase-scoped and writes only its phase artifact under `specs/features/{NNN}-{feature-name}/`.

## Quick Start

From [web/](web/):

```bash
bun install
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

## Use With GitHub Copilot

Ask Copilot to:

- Generate new UI using existing shadcn/ui primitives.
- Extend features using the composition patterns in the skills.
- Create or refactor Zustand stores using the decoupled actions template.

The skills in this repo are optimized to keep edits small, consistent, and aligned with the stack.
