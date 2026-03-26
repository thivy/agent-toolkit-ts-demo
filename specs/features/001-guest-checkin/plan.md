# Guest Check-In Feature Plan

## Goal

Build a fast guest check-in web app that:

- Always shows a live camera feed centered on initial load.
- Shows a check-in form (first name, last name, button) on the right.
- Shows today's checked-in guests with photo, name, and sign-out action on the left.
- Resets UI and shows success feedback after check-in.
- Stores all data locally in the browser using IndexedDB.

## Implementation Phases

### Phase 1: Route and Feature Scaffolding

1. Create a thin route module for the feature page.
2. Create the feature folder and entry component that composes the three-panel layout.

Relevant files:

- web/app/guest-checkin/page.tsx
- web/features/guest-checkin/guest-checkin-page.tsx

Verification criteria:

- Navigating to `/guest-checkin` renders the feature entry component.
- No domain logic is placed in `web/app/` route file.

### Phase 2: Domain Model and IndexedDB Persistence

1. Define guest record type with fields for identity, photo, timestamps, and day key.
2. Implement IndexedDB initialization and CRUD operations:
   - add guest check-in
   - list guests for current day
   - sign out/remove guest
3. Keep persistence logic isolated in a feature-local data module.

Relevant files:

- web/features/guest-checkin/indexeddb-client.ts
- web/features/guest-checkin/use-guests-store.ts

Verification criteria:

- DB initializes without runtime errors in browser.
- Check-in records are persisted and available after page reload.
- Sign-out removes record from IndexedDB and UI.

### Phase 3: Camera, Form, and Guest List UI

1. Build center camera component:
   - auto-start webcam preview when available
   - expose capture action for check-in
   - graceful fallback for permission/device errors
2. Build right-side check-in form:
   - first name + last name inputs
   - submit/check-in button
   - validation for required trimmed values
3. Build left-side guest list:
   - today's guests with name and captured photo
   - sign-out action per guest

Relevant files:

- web/features/guest-checkin/camera-feed.tsx
- web/features/guest-checkin/checkin-form.tsx
- web/features/guest-checkin/guest-list.tsx
- web/features/guest-checkin/guest-checkin-page.tsx

Verification criteria:

- Initial screen always displays camera feed in center.
- Right panel accepts names and triggers check-in.
- Left panel updates immediately with new guest and supports sign-out.

### Phase 4: UX Flow and State Orchestration

1. Coordinate check-in flow:
   - capture image frame
   - persist guest
   - update in-memory state
   - show success message
   - reset form for next guest
2. Ensure list is filtered to current day on load.

Relevant files:

- web/features/guest-checkin/guest-checkin-page.tsx
- web/features/guest-checkin/use-guests-store.ts
- web/features/guest-checkin/checkin-form.tsx

Verification criteria:

- After successful check-in, form resets and success feedback appears.
- New guest appears in left list without refresh.
- Only current-day guests are shown.

### Phase 5: Quality Checks

1. Run lint/format/type checks according to repo scripts.
2. Perform manual sanity checks for desktop and mobile layout behavior.

Relevant commands:

- bun run lint
- bun run format

Verification criteria:

- No new lint/format issues.
- Layout remains usable on small and large screens.

## File Plan

Files to create:

- web/app/guest-checkin/page.tsx
- web/features/guest-checkin/guest-checkin-page.tsx
- web/features/guest-checkin/camera-feed.tsx
- web/features/guest-checkin/checkin-form.tsx
- web/features/guest-checkin/guest-list.tsx
- web/features/guest-checkin/use-guests-store.ts
- web/features/guest-checkin/indexeddb-client.ts

Potential file to update:

- web/package.json (only if adding form-validation dependencies)

## Decisions Made

1. Use a dedicated feature module at `web/features/guest-checkin/` to match repo conventions.
2. Keep App Router page file thin and delegate to feature entry component.
3. Use IndexedDB as the source of truth for local persistence.
4. Keep UI primitives generic and place domain behavior in feature components.
5. Start with a simple storage format for captured photos (data URL) for implementation speed.

## Further Considerations

1. Photo storage optimization:
   - If volume grows, move from data URL to Blob storage for better memory usage.
2. Validation strategy:
   - If stricter validation is needed later, adopt React Hook Form + Zod consistently.
3. Date handling:
   - Define and document day-boundary logic based on local timezone for "current day" filtering.
4. Privacy and retention:
   - Consider adding optional "clear all today" or retention policy UX in follow-up work.
5. Accessibility:
   - Ensure form labels, button states, and feedback messaging are screen-reader friendly.
