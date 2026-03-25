## Plan: Guest Check-In App

Replace the placeholder home screen with a fast, single-screen guest check-in flow at / that matches the sketch: a large live camera panel on the left, a compact form and primary action on the right, and a client-only submission path that validates first name, last name, and a captured photo before saving each record into IndexedDB. The recommended approach is to keep the route thin, add only the missing generic form primitives, use native browser APIs for camera capture and IndexedDB to avoid unnecessary dependencies, and keep all domain logic inside web/features/guest-checkin.

**Steps**

**Phase 1: Feature foundation**

1. Update web/package.json to add the minimum form dependencies required by the repo conventions: react-hook-form, zod, and @hookform/resolvers. Do not add camera or IndexedDB libraries unless implementation friction proves the native APIs are insufficient. This blocks the validation work in later steps. Skills: web-project-conventions, vercel-react-best-practices.
2. Add generic input primitives under web/components/ui/ so the feature can reuse them without placing domain logic in shared UI. The expected additions are web/components/ui/input.tsx and, if needed for accessible labels and helper copy, web/components/ui/label.tsx. This can run in parallel with step 3. Skills: ui-components, web-project-conventions.
3. Create the feature-local foundation under web/features/guest-checkin/: a feature entry component file at web/features/guest-checkin/guest-checkin-page.tsx, a validation/types module such as web/features/guest-checkin/lib/guest-checkin-schema.ts, and an IndexedDB helper such as web/features/guest-checkin/lib/guest-checkin-db.ts. Keep storage concerns and record typing out of the route module. This can run in parallel with step 2 and blocks steps 4 through 8. Skills: web-project-conventions, next-best-practices.
4. Replace the current root route wiring in web/app/page.tsx so the App Router page stays thin and renders GuestCheckinPage instead of HomePage. Leave web/features/home/home-page.tsx in place unless cleanup is explicitly requested, to keep the diff focused on the new feature. Depends on step 3. Skills: next-best-practices, web-project-conventions.

**Phase 2: UI layout and camera flow**

5. Build the guest check-in page layout in web/features/guest-checkin/guest-checkin-page.tsx to match the wireframe: a dominant camera card on the left, a narrow form stack on the right, and a mobile-first stacked layout for smaller screens. Reuse the existing Button, Card, and Heading primitives rather than creating feature-specific shared components. Depends on steps 2 through 4. Skills: ui-components, web-project-conventions, vercel-react-best-practices.
6. Implement a dedicated camera component such as web/features/guest-checkin/components/camera-capture.tsx that owns webcam lifecycle and explicit capture states. Use navigator.mediaDevices.getUserMedia for the live preview, a hidden canvas for still capture, and an explicit state model such as idle, live, captured, and error instead of multiple overlapping boolean props. The component should support take photo, preview, retake, permission denial messaging, unsupported browser messaging, and media-track cleanup on unmount and retake. This can be developed in parallel with the layout shell after step 3, but full integration depends on step 5. Skills: next-best-practices, vercel-react-best-practices, vercel-composition-patterns.
7. Wire React Hook Form and Zod validation into the right-hand form so first name and last name are required and the Check In action is blocked until a photo has been captured. Keep submission state and non-urgent UI updates local to the feature entry component, and prefer explicit component composition over mode booleans. Depends on steps 1, 2, 5, and 6. Skills: vercel-react-best-practices, web-project-conventions, vercel-composition-patterns.

**Phase 3: Local persistence and finish state**

8. Implement the IndexedDB save path in web/features/guest-checkin/lib/guest-checkin-db.ts with a versioned object store and a record shape that includes an id, firstName, lastName, photoBlob, photoMimeType, and createdAt timestamp. Use Blob storage instead of a base64 string to keep records smaller and closer to the browser’s native storage model. Depends on step 3 and is integrated by step 7. Skills: web-project-conventions, vercel-react-best-practices.
9. Complete the submit lifecycle in web/features/guest-checkin/guest-checkin-page.tsx: on successful save, clear the form, clear the captured preview, restart or re-enable the live camera flow, and show a lightweight inline success state. Also handle IndexedDB save failures without losing the captured photo or typed form values so the user can retry. Depends on steps 7 and 8. Skills: vercel-react-best-practices, vercel-composition-patterns.

**Relevant files**

- web/app/page.tsx — keep the route module thin by rendering the feature entry component.
- web/features/guest-checkin/guest-checkin-page.tsx — main client feature entry, layout composition, form submission orchestration, and success/error state.
- web/features/guest-checkin/components/camera-capture.tsx — isolated webcam preview, capture, retake, and stream cleanup logic.
- web/features/guest-checkin/lib/guest-checkin-schema.ts — Zod schema and shared GuestCheckin payload or record typing.
- web/features/guest-checkin/lib/guest-checkin-db.ts — versioned IndexedDB open and save helpers.
- web/components/ui/input.tsx — generic text input primitive to support the feature and future forms.
- web/components/ui/label.tsx — optional generic label primitive if accessible labels and helper text need shared styling.
- web/components/ui/button.tsx — reuse Button for Take Photo, Retake, and Check In actions.
- web/components/ui/card.tsx — reuse Card, CardContent, and CardFooter to structure the split-screen layout.
- web/components/ui/heading.tsx — reuse Heading for the page title and supporting copy.
- web/package.json — add the required form dependencies.
- web/features/home/home-page.tsx — reference only; likely left untouched to keep scope tight.

**Verification**

1. From web/, run bun install and confirm the added dependencies resolve cleanly.
2. From web/, run bun run lint and confirm the new feature passes oxlint.
3. From web/, run bun run format and confirm formatting is clean.
4. From web/, run bun dev and manually verify the root page now shows the guest check-in layout on desktop and mobile widths.
5. In the browser on localhost, verify the camera permission flow: initial permission prompt, successful live preview, captured still preview, retake path, and clean recovery after denying permission.
6. Verify validation by attempting submit with missing names and with no captured photo; the action should stay blocked or surface inline errors until all required inputs are present.
7. After a successful check-in, open DevTools Application > IndexedDB and confirm a new record is stored with first name, last name, a Blob photo payload, and a createdAt timestamp.
8. Verify a failed save path preserves the typed form values and captured image so the user can retry without re-entering everything.

**Decisions**

- The guest check-in screen replaces the current home page at / rather than living on a secondary route.
- This feature only captures and stores check-ins locally; viewing, editing, deleting, exporting, or syncing saved records is explicitly out of scope.
- The photo flow requires a captured preview with a retake option before final submission.
- Native getUserMedia, canvas capture, and IndexedDB are the default implementation choice to keep dependencies and bundle size down.
- The workspace does not include the .next-docs directory referenced by web/AGENTS.md, so this plan relies on the checked-in repo skills and current codebase patterns instead of local Next.js doc files.

**Further considerations**

1. If a later phase needs staff review or guest history, build that as a separate read-only screen on top of the same IndexedDB helper instead of expanding this capture flow.
2. If mobile kiosk use becomes a priority, consider a follow-up pass for larger touch targets, landscape handling, and camera-device selection after the base flow is working.
