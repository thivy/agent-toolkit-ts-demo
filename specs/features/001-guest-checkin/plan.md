## Plan: Guest Check-In App

Replace the current `/` landing page with a client-driven guest check-in experience that keeps the camera feed centered, collects first and last name on the right, shows today’s checked-in guests on the left, and persists guest records locally in IndexedDB with a day-scoped view and retained history. The implementation should stay within the existing Next.js App Router structure, reuse the current UI primitives and Tailwind token system, and isolate browser-only camera/storage logic inside a dedicated feature module.

**Steps**

### Phase 1: Feature scaffolding and route handoff

1. Replace the current home route entry so `web/app/page.tsx` renders a new guest check-in feature entry component instead of `HomePage`. This keeps the app at `/` as decided and avoids introducing unnecessary route complexity. Use the existing App Router pattern from `web/app/page.tsx` and keep the page itself minimal per the `next-best-practices` skill.
2. Create a dedicated feature folder at `web/features/guest-checkin/` and place all guest check-in domain components and client logic there, following the separation rules from the `web-project-conventions` skill and the placement guidance from the `ui-components` skill.
3. Keep the entry component as a client component because camera access, IndexedDB, and interactive form behavior all require browser APIs. Keep server/client boundaries explicit per the `next-best-practices` and `vercel-react-best-practices` skills.

### Phase 2: Persistence and state design

4. Implement an IndexedDB access layer in `web/features/guest-checkin/indexeddb-client.ts` with a small, explicit schema for guest records. Each record should include a stable id, first name, last name, captured photo, check-in timestamp, and a derived day key based on the browser’s local date. Keep CRUD operations narrowly scoped: load by day key, create check-in record, and delete record on sign-out.
5. Build guest-check-in state around Zustand in `web/features/guest-checkin/use-guests-store.ts`, using the decoupled actions pattern required by the repo’s Zustand guidance. The store should manage: today’s guests, initialization/loading state, current success message, pending check-in state, and actions for hydrate, add guest, remove guest, and clear transient success feedback.
6. Add a thin adapter hook such as `web/features/guest-checkin/use-guest-checkin.ts` or `web/features/guest-checkin/use-indexeddb.ts` to coordinate IndexedDB persistence with store updates. This keeps persistence concerns out of presentational components and follows the composition guidance from the `vercel-composition-patterns` skill.
7. Define a feature-local type module, for example `web/features/guest-checkin/types.ts`, so component props and storage records share one source of truth. Keep date-scoping explicit by modeling both `checkedInAt` and `dayKey`.

### Phase 3: Camera capture flow

8. Create `web/features/guest-checkin/camera-feed.tsx` as the central capture surface. It should request `navigator.mediaDevices.getUserMedia`, bind the stream to a video element, handle permission-denied and unavailable-camera states, and clean up tracks on unmount. Keep this isolated in one client component so media lifecycle is easy to reason about.
9. Add photo capture via a hidden canvas or equivalent browser-native approach. Capture a still frame only when the user checks in, rather than continuously storing frames, to keep the app fast and storage usage bounded. Return a compressed image representation suitable for IndexedDB persistence.
10. Treat the live stream as the primary UI element in the center column and ensure the initial load always prioritizes rendering the camera area, even while IndexedDB hydration or guest list loading is in progress.

### Phase 4: Form, list, and layout composition

11. Create `web/features/guest-checkin/checkin-form.tsx` for the right-side form. Use controlled inputs or a minimal local form state unless a form library becomes clearly necessary. The form should validate required first and last name values, trigger photo capture from the camera component, submit the new guest, then reset inputs after a successful check-in.
12. Create `web/features/guest-checkin/guest-list.tsx` for the left-side daily roster. It should render only guests whose `dayKey` matches today’s browser-local date, show photo plus full name, and provide a sign-out action that deletes the record from IndexedDB and removes it from the in-memory store.
13. Compose the overall screen in `web/features/guest-checkin/guest-checkin-page.tsx` using the existing primitives from `web/components/ui/card.tsx`, `web/components/ui/button.tsx`, and `web/components/ui/heading.tsx`. Use a responsive three-panel layout that becomes a vertical stack on smaller screens, with the camera panel visually dominant. Follow `ui-components` guidance: keep domain logic inside the feature components and avoid adding guest-specific behavior to primitives.
14. Use a small coordination interface between the camera and form instead of boolean-prop-heavy component APIs. For example, the page component can own the photo-capture callback/ref contract and pass explicit actions down, following `vercel-composition-patterns` guidance.
15. Show a transient success message after a completed check-in and clear it automatically after a short interval or on the next interaction. Keep this feedback in feature state rather than scattering local timers across multiple components.

### Phase 5: UX polish and failure handling

16. Add loading and empty states that are specific to the feature: guest list hydration, no guests checked in yet today, camera unavailable, camera permission denied, and check-in submission in progress. This prevents the interface from feeling broken during browser permission or storage delays.
17. Ensure sign-out behavior is explicit and immediate. Remove the guest from the left list only after the IndexedDB delete succeeds, or optimistically remove then roll back on failure if the implementation remains simple and predictable.
18. Keep history in IndexedDB but do not surface a past-days view in this feature. The current scope is today’s operational check-in list only, with historical records retained only to satisfy the persistence decision.

### Phase 6: Validation and project hygiene

19. Run the repo quality commands from the root after implementation: `bun run lint` and `bun run format`. If the project requires running from `web/`, document that explicitly in the implementation notes. Use the exact commands verified during implementation.
20. Manually verify the browser behavior in local dev: camera prompt appears, live feed renders centered, check-in stores the guest locally, the list shows only today’s records, sign-out removes the guest, refresh preserves today’s data, and the UI resets after success.
21. If there is time and the browser behavior warrants it, add a small manual test checklist to `docs/my-idea/guest-checkin.md` or a nearby feature note, but only if the repo already treats docs as part of feature delivery.

**Relevant files**

- `web/app/page.tsx` — replace the existing `HomePage` handoff with the new guest check-in feature entry.
- `web/features/home/home-page.tsx` — current landing page implementation being displaced; useful only as a reference for current route ownership.
- `web/app/layout.tsx` — verify the existing root layout remains sufficient for the new full-screen feature and theme wrapping.
- `web/app/globals.css` — reuse existing design tokens and global Tailwind theme variables; only extend if the feature truly needs global styling.
- `web/components/ui/button.tsx` — reuse for check-in and sign-out actions instead of creating feature-specific button primitives.
- `web/components/ui/card.tsx` — reuse for panel structure and guest list item framing.
- `web/components/ui/heading.tsx` — reuse for page and panel headings.
- `web/components/lib/utils.ts` — reuse `cn()` for class composition.
- `web/features/guest-checkin/guest-checkin-page.tsx` — new feature entry and overall screen composition.
- `web/features/guest-checkin/camera-feed.tsx` — browser camera lifecycle and frame capture.
- `web/features/guest-checkin/checkin-form.tsx` — right-side name entry and submit interaction.
- `web/features/guest-checkin/guest-list.tsx` — left-side today roster and sign-out UI.
- `web/features/guest-checkin/use-guests-store.ts` — Zustand store for feature state.
- `web/features/guest-checkin/indexeddb-client.ts` — IndexedDB schema and CRUD operations.
- `web/features/guest-checkin/use-indexeddb.ts` or `web/features/guest-checkin/use-guest-checkin.ts` — coordination layer between persistence, camera capture, and UI events.
- `web/features/guest-checkin/types.ts` — shared feature types for guest records and UI state.
- `docs/my-idea/guest-checkin.md` — source requirements and optional place to record manual verification notes.

**Verification**

1. Run `bun run lint` from the repo root and confirm there are no new lint failures in the web app.
2. Run `bun run format` from the repo root and confirm formatting completes without unexpected file churn.
3. Run the app locally with the project’s existing dev command and verify the `/` route now renders the guest check-in experience.
4. In the browser, grant camera permission and verify the live video feed is visible in the center panel on first load.
5. Submit a guest with valid first and last name values and verify: a photo is captured, the form resets, a success message appears, and the guest shows in the left-side list immediately.
6. Refresh the page and verify today’s guest list rehydrates from IndexedDB.
7. Change the browser-local date simulation if possible, or mock the day-key helper during development, to verify the UI only shows the current day’s guests while older records remain stored.
8. Sign out a guest and verify the record disappears from the UI and is removed from IndexedDB.
9. Deny camera permission and verify the UI shows a clear fallback state without crashing the page.
10. Test at a narrow mobile width and a desktop width to verify the layout stacks cleanly on small screens and preserves the left-center-right hierarchy on larger screens.

**Decisions**

- The guest check-in app will replace the current `/` home page rather than being added as a secondary route.
- IndexedDB will retain historical guest records, but the UI will show only the current day’s guests using the browser’s local date as the day boundary.
- The feature will stay fully client-side; no API routes, server actions, or backend persistence are included.
- The feature will reuse existing UI primitives and Tailwind tokens rather than introducing a new design system layer.
- A dedicated feature module under `web/features/guest-checkin/` is in scope; broad refactors to unrelated home-page or app-shell code are not.

**Further Considerations**

1. Preferred photo format should be decided during implementation: compressed data URL is simpler, while Blob storage is usually more space-efficient in IndexedDB.
2. If kiosk-style operation matters, consider a follow-up to keep the screen awake and harden camera recovery when devices suspend or permissions change.
3. If operators need auditability later, a separate history view can be added on top of the retained IndexedDB records without changing the initial today-only workflow.
