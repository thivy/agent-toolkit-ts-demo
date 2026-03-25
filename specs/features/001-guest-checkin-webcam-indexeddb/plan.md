## Plan: Guest Check-In Web App

Build a single-screen guest check-in experience at / that matches the wireframe in docs/my-idea/sketch.png, captures first name, last name, and a webcam photo, and stores each completed check-in locally in IndexedDB. The implementation should stay client-only, follow the repo’s thin route to feature-entry pattern, reuse existing UI primitives where possible, and keep v1 scoped to capture plus local persistence without a records list.

**Steps**

1. Phase 1: Confirm feature entry points and scaffolding.
   Replace the placeholder root route in web/app/page.tsx so it renders a new guest check-in feature entry component instead of the current home feature.
   Create web/features/guest-checkin/guest-checkin-page.tsx as the single feature entry component marked with "use client", following the same pattern currently used by web/features/home/home-page.tsx.
   Create the feature subfolders needed for separation of concerns: web/features/guest-checkin/components, web/features/guest-checkin/hooks, and web/features/guest-checkin/lib.

2. Phase 2: Build the UI shell to match the wireframe. Depends on step 1.
   Implement a responsive two-panel layout in web/features/guest-checkin/guest-checkin-page.tsx that keeps the camera area visually dominant on desktop and stacks cleanly on mobile.
   Reuse existing primitives from web/components/ui/card.tsx, web/components/ui/button.tsx, and web/components/ui/heading.tsx for the shell, CTA, and headings.
   Add a reusable input primitive in web/components/ui/input.tsx only because the repo does not currently contain one and the form needs consistent styling.
   Split feature-specific UI into focused components such as a camera panel, a guest form, and a transient status or helper message area under web/features/guest-checkin/components/.

3. Phase 3: Add camera capture behavior. Parallel with step 4 after step 1.
   Implement a dedicated camera hook in web/features/guest-checkin/hooks/use-camera-capture.ts that owns permission requests, MediaStream lifecycle, capture, retake, and cleanup.
   Use navigator.mediaDevices.getUserMedia in the client, attach the stream to a video element with refs, and capture the still image through a canvas conversion flow.
   Ensure every exit path stops active camera tracks and revokes any generated object URLs so repeated check-ins do not leak memory or leave the camera busy.
   Provide explicit UI states for idle, permission denied, active preview, captured photo preview, and retake.

4. Phase 4: Add form validation and local persistence. Parallel with step 3 after step 1, then integrated after both are complete.
   Add guest form state and validation in a feature-scoped form component. Prefer React Hook Form plus Zod to match repo conventions; because these packages are not currently declared in web/package.json, include the dependency addition as part of implementation if the team wants to follow the established form stack.
   Validate first name and last name before submit, require a captured photo, and disable the final Check In action until the form is valid and a photo exists.
   Implement IndexedDB access in web/features/guest-checkin/lib/guest-checkin-db.ts using the native browser API so the app stays dependency-light and all data remains local.
   Store one record per check-in with first name, last name, captured photo blob, and a created-at timestamp. Keep v1 schema simple with a single object store unless implementation finds a concrete quota problem.
   Add a feature orchestration hook such as web/features/guest-checkin/hooks/use-guest-checkin.ts if needed to coordinate validation, capture state, IndexedDB writes, success reset, and error messaging without overloading the page component.

5. Phase 5: Integrate submit flow and post-submit reset. Depends on steps 3 and 4.
   Wire the capture state and validated form state into a single submit action that writes to IndexedDB and then resets the UI for the next guest.
   Show inline feedback for save-in-progress, save success, and recoverable failures such as IndexedDB write errors or missing camera permission.
   Reset form fields, clear the captured image, and either restart the live camera preview automatically or return to a ready-to-capture state that is consistent across desktop and mobile.

6. Phase 6: Polish, accessibility, and verification. Depends on steps 2 through 5.
   Ensure the layout preserves the wireframe intent while using the existing theme tokens from web/app/globals.css and the app shell in web/app/layout.tsx.
   Verify keyboard access, visible focus states, button disabled states, descriptive labels, and acceptable contrast in both light and dark themes.
   Run formatting and linting from the web app directory because that is where package.json lives, then manually sanity-check the capture and save flow in the browser.

**Relevant files**

- docs/my-idea/guest-checkin.md — source requirement for the feature scope.
- docs/my-idea/sketch.png — wireframe reference that drives the initial layout and action placement.
- web/app/page.tsx — replace the current home feature entry with the guest check-in entry.
- web/app/layout.tsx — preserve the existing global app shell and theme provider while introducing the new page.
- web/app/globals.css — reuse the existing tokens and spacing language; only touch if the design requires minimal global support styles.
- web/features/home/home-page.tsx — reference pattern for a thin route that renders a single feature entry component.
- web/features/guest-checkin/guest-checkin-page.tsx — new feature entry component for the page-level layout and orchestration.
- web/features/guest-checkin/components/camera-panel.tsx — planned camera preview, capture, and retake UI.
- web/features/guest-checkin/components/check-in-form.tsx — planned first-name and last-name form UI.
- web/features/guest-checkin/components/check-in-status.tsx — planned inline helper, success, and error messaging.
- web/features/guest-checkin/hooks/use-camera-capture.ts — planned camera lifecycle and still-image capture hook.
- web/features/guest-checkin/hooks/use-guest-checkin.ts — planned integration hook for submit orchestration if the page component would otherwise become too large.
- web/features/guest-checkin/lib/guest-checkin-db.ts — planned IndexedDB wrapper for opening the database and saving check-in records.
- web/components/ui/button.tsx — existing button styling and variant pattern to reuse.
- web/components/ui/card.tsx — existing card layout primitive to reuse for the two-panel shell.
- web/components/ui/heading.tsx — existing heading primitive to reuse for page and panel titles.
- web/components/ui/input.tsx — planned new shared input primitive because the current repo does not include one.
- web/package.json — add form dependencies only if implementation follows the repo’s React Hook Form plus Zod convention.

**Verification**

1. Start the app from web and confirm the new guest check-in screen renders at / with no runtime errors.
2. Grant camera permission and verify the preview appears, a still image can be captured, and retake works without refreshing the page.
3. Deny camera permission and verify the page shows a clear inline failure state without crashing or trapping the user.
4. Submit a valid check-in and confirm a new IndexedDB record is created with first name, last name, photo blob, and timestamp in browser DevTools.
5. Refresh the page and confirm the app still loads cleanly and previously saved records remain in IndexedDB even though v1 does not display them.
6. Confirm the Check In action stays disabled until both text fields are valid and a photo has been captured.
7. Confirm the screen remains usable on a narrow mobile viewport and preserves the desktop two-panel emphasis on larger screens.
8. Run bun run lint from web and expect oxlint to pass.
9. Run bun run format from web and expect oxfmt to complete without introducing unexpected file changes.

**Decisions**

- The guest check-in experience replaces the current root route at / instead of living on a separate route.
- V1 includes only local persistence in IndexedDB; it does not include a UI for browsing prior check-ins.
- All capture and persistence behavior stays client-side because webcam access and IndexedDB are browser-only APIs.
- The implementation should prefer existing UI primitives and add only the missing shared input primitive rather than pushing feature logic into web/components/ui.
- Server sync, export, deletion, authentication, and analytics are explicitly out of scope for this feature.

**Further Considerations**

1. If photo size becomes a practical IndexedDB quota issue during implementation, prefer JPEG capture with moderate canvas compression before introducing a more complex multi-store schema.
2. If the feature grows beyond a single-screen workflow later, keep saved-record browsing in a separate component or route instead of overloading the initial check-in screen.
3. If React Hook Form plus Zod are considered too heavy for this first pass, the fallback is native controlled inputs plus lightweight validation, but that would diverge from the repo’s stated form convention and should be an explicit choice.
