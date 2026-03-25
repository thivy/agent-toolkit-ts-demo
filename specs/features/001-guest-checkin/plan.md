# Plan: Guest Check-in Web App

**TL;DR:** Build a camera-first check-in flow where guests enter name + capture a photo via webcam, with immediate success feedback and IndexedDB persistence. The UI toggles between camera/form input (initial) and success screen, with no external dependencies beyond the existing Next.js + Tailwind setup.

---

## Implementation Phases

### Phase 1: Project Setup & State Management (Foundation)

Establish the feature structure and centralized state layer.

**Steps:**

1. Install Zustand (`bun add zustand`) — required for shared state across components
2. Create feature directory structure under `web/features/guest-checkin/`
3. Define TypeScript types for guest record schema (firstName, lastName, photoBlob, timestamp)
4. Implement Zustand store (`useGuestCheckinStore`) using decoupled actions pattern (per `zustand` skill) to manage:
   - Form state (firstName, lastName inputs)
   - Camera state (stream active, permission granted, error)
   - UI state (current screen: "camera" | "success")
   - Captured photo blob
   - Recent guest records for display (and persistence)
5. Create IndexedDB schema and helper functions in a shared module:
   - Database initialization with object store for guests
   - Insert guest record function
   - Fetch all guests function (for future reference)

**Dependencies:** all parallel

---

### Phase 2: Component Architecture (UI Primitives + Composition)

Build reusable UI components following existing patterns.

**Steps:**

1. Review existing components (`web/components/ui/button.tsx`, `web/components/ui/card.tsx`, `web/components/ui/heading.tsx`) to match styling patterns — use CVA variants and Tailwind utilities consistent with current design system

2. Create UI components in `web/components/ui/` (if not already present):
   - `input.tsx` — Text input for first/last name (check shadcn/ui equivalents first per UI skill)
   - Verify `button.tsx` and `card.tsx` meet requirements; reuse as-is

3. Create composable blocks in `web/components/blocks/guest-checkin/`:
   - `camera-feed.tsx` — Displays live video stream, manages getUserMedia() lifecycle, exposes method to capture frame as blob
   - `guest-form.tsx` — Form inputs (first/last name) with Submit button, integrates with Zustand store
   - `success-screen.tsx` — Shows captured photo thumbnail, displays first name, "Sign in New Guest" button with reset logic

4. Create feature-specific components in `web/features/guest-checkin/components/`:
   - `guest-checkin-page.tsx` — Main container component, conditionally renders camera/form or success screen based on UI state (uses Zustand), orchestrates data flow

**Dependencies:** Steps 1 & 2 parallel; Steps 3 & 4 sequential (composition depends on UI primitives)

---

### Phase 3: Core Feature Implementation (Camera + Form Integration)

Wire camera capture, form submission, and state transitions.

**Steps:**

1. Implement camera permission flow in `camera-feed.tsx`:
   - On mount, call `navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })` (per user preference to request permission immediately)
   - Attach stream to `<video>` element with autoPlay + muted
   - Handle permission denied/errors gracefully (show message, store in Zustand error state)
   - Export `captureFrame()` method that draws video frame to canvas and returns blob

2. Implement form handling in `guest-form.tsx`:
   - Bind inputs to Zustand store via onChange handlers
   - Validate non-empty firstName, lastName before enabling submit
   - On submit: call camera's `captureFrame()`, pass blob to Zustand store, update UI state to "success"
   - Reference `web-project-conventions` skill for form patterns (client component with `"use client")

3. Implement success screen in `success-screen.tsx`:
   - Display photo thumbnail using blob URL (`URL.createObjectURL()`)
   - Show formatted firstName in greeting
   - "Sign in New Guest" button clears form + photo, resets UI state to "camera"

4. Integrate IndexedDB persistence in Zustand store:
   - On successful check-in (after UI state → "success"), call `insertGuest()` to persist record
   - Generate unique ID (timestamp or UUID), store all guest data (firstName, lastName, photo as base64 or blob, timestamp)

**Dependencies:** Step 1 independent; Step 2 waits on Step 1 (camera capture); Step 3 parallel with Step 2; Step 4 last (waits on all UI)

---

### Phase 4: Routing & Page Export

Connect feature to Next.js routing.

**Steps:**

1. Create route file `web/app/checkin/page.tsx` (or `/` if check-in is homepage):
   - Server component that renders `<GuestCheckinPage />` from feature
   - Import from `@/features/guest-checkin`

2. Verify layout and metadata:
   - Ensure `web/app/layout.tsx` provides theme provider (already present per codebase review)
   - Set document title/meta for check-in page if needed

**Dependencies:** Follows Phase 3 completion

---

### Phase 5: Styling & Responsive Layout

Ensure mobile-first Tailwind alignment with wireframe.

**Steps:**

1. Layout main container with Tailwind:
   - Full viewport height & width (`h-screen w-screen`)
   - Center content with flexbox
   - Camera feed: max width (e.g., 400px), aspect ratio preserved
   - Form below or beside (responsive: stack mobile, side-by-side desktop)

2. Apply design system consistency:
   - Use existing spacing scale (margins/padding from `globals.css` or Tailwind config)
   - Button and input styles match existing UI components (colors, spacing, focus states)
   - Success screen: centered card with photo preview + greeting

3. Handle edge cases:
   - Camera unavailable: show error message, hide form
   - Photo not captured: disable/gray out submit button
   - Mobile landscape vs portrait: adjust layout

**Dependencies:** Follows component implementation (Phase 2 & 3); can incorporate incrementally

---

### Phase 6: Verification & Testing

Validate feature completeness and robustness.

**Steps:**

1. Manual testing:
   - Load page, verify camera permission request appears
   - Allow/deny permission, verify UI responds correctly
   - Fill form, capture photo, verify success screen shows photo + name
   - Click "Sign in New Guest", verify form resets and camera re-appears
   - Reload page, verify previously saved guests still exist (IndexedDB persists)

2. Code quality checks:
   - Run `bun run lint` — no errors
   - Run `bun run format` — code formatted
   - Verify all TypeScript types are explicit (no `any`)
   - Verify no console errors in browser DevTools

3. Browser compatibility:
   - Test on mobile (iOS Safari, Chrome) and desktop (Chrome, Firefox, Safari)
   - Verify camera access works across platforms
   - Verify IndexedDB available and persists data

4. Performance verification:
   - Camera feed smooth (no lag), <30ms frame capture
   - No memory leaks (camera stops, objects cleaned up on unmount)
   - Bundle size impact acceptable (Zustand small, no external libs)

---

## Relevant Files

- `web/features/guest-checkin/` — Feature entry point and orchestration
  - `guest-checkin-page.tsx` — Main container, uses Zustand store to render camera or success based on state
  - `types.ts` — Shared types (Guest, UI state enums)
  - `store.ts` — Zustand store with camera, form, and UI state; decoupled actions per `zustand` skill

- `web/features/guest-checkin/components/` — Feature-specific compositions
  - `guest-form.tsx` — Form component, binds to Zustand store, triggers capture on submit
  - `success-screen.tsx` — Success state UI, photo display, reset button

- `web/components/blocks/guest-checkin/` — Reusable blocks (if shared across features; otherwise colocate in feature)
  - `camera-feed.tsx` — Live video stream, capture frame logic, media stream lifecycle

- `web/features/shared/indexeddb/` — Shared persistence layer
  - `db.ts` — Database initialization, guest schema, insert/fetch operations

- `web/app/checkin/page.tsx` — Route handler that renders `<GuestCheckinPage />`

- `web/package.json` — Install Zustand dependency

---

## Verification

1. **Functional testing:**
   - [ ] Camera permission request triggers on page load
   - [ ] Form inputs accept and store first/last name
   - [ ] "Submit" button captures frame and transitions to success screen
   - [ ] Success screen displays captured photo and guest name
   - [ ] "Sign in New Guest" resets flow to camera/form state
   - [ ] Page reload retains guest history (IndexedDB persists)

2. **Code quality:**
   - [ ] `bun run lint` passes (no errors/warnings)
   - [ ] `bun run format` applied
   - [ ] TypeScript strict mode (all types explicit)
   - [ ] No console errors in browser DevTools

3. **Browser compatibility:**
   - [ ] Desktop: Chrome, Firefox, Safari (camera + IndexedDB work)
   - [ ] Mobile iOS: Safari (camera works; note: camera access via https required)
   - [ ] Mobile Android: Chrome (camera + IndexedDB)

4. **Performance:**
   - [ ] Camera frame capture <50ms
   - [ ] No memory leaks (DevTools > Memory profile before/after camera stop)

---

## Decisions

1. **Native APIs only** — No external camera or IndexedDB libraries. Rationale: Keeps bundle small, leverages modern browser capabilities, aligns with "Bun-native runtime APIs" preference in AGENTS.md.

2. **Zustand for state** — Single source of truth for camera, form, and UI state. Rationale: Decouples components, simplifies synchronization between camera and form submit, matches project's state management pattern.

3. **Client-side only** — All logic in `"use client"` components. No server-side check-in processing. Rationale: Meets "stored locally in browser" requirement, simpler than server round-trip.

4. **Feature directory structure** — Colocate feature logic under `web/features/guest-checkin/`. Rationale: Follows existing `web/features/home/` pattern; keeps feature self-contained.

5. **Camera permission on load** — Not behind a button (per user preference). Rationale: Faster UX if user expects immediate camera access; privacy dialog handled by browser.

6. **Photo as blob, not base64** — Store captured frame as blob for IndexedDB. Rationale: More efficient (native format), avoids encoding overhead, blob URLs work directly in `<img>` and `<canvas>`.

---

## Further Considerations

1. **Camera device selection** — Current plan uses `facingMode: "user"` (front camera). If you want rear camera option later, consider adding a toggle in form or using device constraints.

2. **Photo compression** — Native canvas export uses PNG lossless format. For storage efficiency, consider converting to JPEG or WebP (adds `canvas.toBlob(...)` format option). Current approach prioritizes speed.

3. **Guest history UI** — Plan stores guests in IndexedDB but doesn't display history. Future feature could show "Recent Guests" list on success screen or separate page.

4. **HTTPS requirement (mobile)** — Camera access via `getUserMedia()` requires secure context (HTTPS on production, localhost ok for dev). Ensure deployment handles this.

---

## References to Skills

- **`web-project-conventions`** (Phase 2, Step 1 & 2; Phase 4): Directory structure, feature co-location, PascalCase components, absolute imports via `@/`, client component boundaries
- **`ui-components`** (Phase 2): Check shadcn/ui for existing input, button, card components before creating; use `cn()` utility; keep `web/components/ui/*` generic
- **`zustand`** (Phase 1 & 3): Decoupled actions pattern, store design for camera + form state
- **`vercel-react-best-practices`** (Phase 2 & 3): Client component patterns, state handling, no unnecessary re-renders in camera feed
