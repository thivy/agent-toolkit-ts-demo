"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/components/lib/utils";
import { useGuestsStore } from "./use-guests-store";
import type { CameraFeedHandle } from "./camera-feed";
import type { GuestCheckinInput } from "./types";

interface CheckinFormProps {
  cameraRef: React.RefObject<CameraFeedHandle | null>;
  onCheckin: (input: GuestCheckinInput) => Promise<void>;
  className?: string;
}

export function CheckinForm({ cameraRef, onCheckin, className }: CheckinFormProps) {
  const isSubmitting = useGuestsStore((state) => state.isSubmitting);
  const successMessage = useGuestsStore((state) => state.successMessage);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [errors, setErrors] = useState<{ firstName?: string; lastName?: string }>({});

  function validate() {
    const next: typeof errors = {};
    if (!firstName.trim()) next.firstName = "First name is required";
    if (!lastName.trim()) next.lastName = "Last name is required";
    return next;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next = validate();
    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }
    setErrors({});

    const photo = cameraRef.current?.capturePhoto() ?? "";

    await onCheckin({ firstName: firstName.trim(), lastName: lastName.trim(), photo });

    setFirstName("");
    setLastName("");
  }

  return (
    <form onSubmit={handleSubmit} className={cn("flex flex-col gap-4", className)} noValidate>
      <div className="flex flex-col gap-1">
        <label htmlFor="firstName" className="text-sm font-medium">
          First Name
        </label>
        <input
          id="firstName"
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="Jane"
          aria-invalid={!!errors.firstName}
          className={cn(
            "rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring",
            errors.firstName && "border-destructive focus:ring-destructive/50",
          )}
        />
        {errors.firstName && <p className="text-destructive text-xs">{errors.firstName}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="lastName" className="text-sm font-medium">
          Last Name
        </label>
        <input
          id="lastName"
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Smith"
          aria-invalid={!!errors.lastName}
          className={cn(
            "rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring",
            errors.lastName && "border-destructive focus:ring-destructive/50",
          )}
        />
        {errors.lastName && <p className="text-destructive text-xs">{errors.lastName}</p>}
      </div>

      {successMessage && (
        <p className="rounded-md bg-primary/10 px-3 py-2 text-sm text-primary">{successMessage}</p>
      )}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Checking in…" : "Check In"}
      </Button>
    </form>
  );
}
