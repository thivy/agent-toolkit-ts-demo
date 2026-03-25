"use client";

import type { SubmitStatus } from "../hooks/use-guest-checkin";

interface CheckInStatusProps {
  submitStatus: SubmitStatus;
  submitError: string | null;
}

export function CheckInStatus({ submitStatus, submitError }: CheckInStatusProps) {
  if (submitStatus === "idle") return null;

  if (submitStatus === "saving") {
    return (
      <div className="bg-muted rounded-lg px-4 py-3 text-sm" role="status" aria-live="polite">
        Saving check-in…
      </div>
    );
  }

  if (submitStatus === "success") {
    return (
      <div
        className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800 dark:bg-green-950 dark:text-green-200"
        role="status"
        aria-live="polite"
      >
        ✓ Check-in saved! Ready for next guest.
      </div>
    );
  }

  if (submitStatus === "error") {
    return (
      <div
        className="bg-destructive/10 text-destructive rounded-lg px-4 py-3 text-sm"
        role="alert"
        aria-live="assertive"
      >
        {submitError ?? "Something went wrong. Please try again."}
      </div>
    );
  }

  return null;
}
