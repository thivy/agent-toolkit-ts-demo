---
description: "Execute and implement tasks from a spec tasks.md file sequentially, marking each task complete as it is finished."
argument-hint: "Path to the spec folder (e.g. specs/features/{feature-name})"
agent: "agent"
---

# 1. Load Spec Context

Given the spec folder path or feature number in the user input (e.g. `specs/features/{feature-name}`), load all spec files:

1. `{folder}/plan.md` — technical design decisions and architecture context
2. `{folder}/tasks.md` — the source of truth for what to implement and in what order

Also read every file listed under **Relevant Files** in `plan.md` and `tasks.md` that is marked as a reference (do not modify reference files).

# 2. Execute Each Task — In Order

For each task in sequence:

### Before starting

- Mark it `in-progress` in the todo list.
- Re-read any files the task touches to get current content.

### During implementation

- Implement **exactly and only** what the task specifies.
- Do not refactor, add comments, or change unrelated code.
- Follow all project conventions (see AGENTS.md and the skills referenced in it).
- For each skill area touched, load the relevant skill from `.github/skills/` or `AGENTS.md` before writing code.

### After implementation

- Verify the task's **Done When** criteria are met.
- Run any verification commands specified in the task (e.g. `bun run lint`, `bun run format`).
- If a verification command fails, fix the issue before proceeding — do not skip.
- Mark the task `completed` in the todo list.
- **Update `tasks.md`**: change `- [ ]` to `- [x]` for the completed task and save the file.

### If a task cannot be completed

- Stop execution.
- Report exactly which task failed, what the blocker is, and what was tried.
- Do not mark it complete or continue to subsequent tasks.

# 3. Constraints

- ONLY implement tasks marked `- [ ]` — skip any already marked `- [x]`.
- NEVER modify files listed as reference-only in the Relevant Files section.
- NEVER introduce new dependencies to `package.json` unless the task explicitly requires it.
- NEVER add features, refactor unrelated code, or make "improvements" beyond each task's scope.
- After EVERY completed task, `tasks.md` must be updated on disk before moving to the next task.
