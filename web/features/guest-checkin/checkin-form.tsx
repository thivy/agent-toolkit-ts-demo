"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/components/lib/utils";

interface CheckinFormProps {
  onCheckin: (firstName: string, lastName: string) => Promise<void>;
  className?: string;
}

export function CheckinForm({ onCheckin, className }: CheckinFormProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
  }>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (successTimerRef.current !== null) {
        clearTimeout(successTimerRef.current);
      }
    };
  }, []);

  function validate() {
    const next: { firstName?: string; lastName?: string } = {};
    if (!firstName.trim()) next.firstName = "First name is required.";
    if (!lastName.trim()) next.lastName = "Last name is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setStatus("loading");
    try {
      await onCheckin(firstName.trim(), lastName.trim());
      setFirstName("");
      setLastName("");
      setErrors({});
      setStatus("success");
      if (successTimerRef.current !== null) {
        clearTimeout(successTimerRef.current);
      }
      successTimerRef.current = setTimeout(() => setStatus("idle"), 3000);
    } catch {
      setStatus("idle");
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className={cn("flex flex-col gap-4", className)}>
      <div className="flex flex-col gap-1">
        <label htmlFor="firstName" className="text-sm font-medium">
          First name
        </label>
        <input
          id="firstName"
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="Jane"
          autoComplete="given-name"
          aria-invalid={!!errors.firstName}
          aria-describedby={errors.firstName ? "firstName-error" : undefined}
          className={cn(
            "border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring h-9 w-full rounded-md border px-3 py-1 text-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
            errors.firstName && "border-destructive",
          )}
        />
        {errors.firstName && (
          <p id="firstName-error" className="text-destructive text-xs">
            {errors.firstName}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="lastName" className="text-sm font-medium">
          Last name
        </label>
        <input
          id="lastName"
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Doe"
          autoComplete="family-name"
          aria-invalid={!!errors.lastName}
          aria-describedby={errors.lastName ? "lastName-error" : undefined}
          className={cn(
            "border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring h-9 w-full rounded-md border px-3 py-1 text-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
            errors.lastName && "border-destructive",
          )}
        />
        {errors.lastName && (
          <p id="lastName-error" className="text-destructive text-xs">
            {errors.lastName}
          </p>
        )}
      </div>

      <Button type="submit" disabled={status === "loading"} className="w-full">
        {status === "loading" ? "Checking in…" : "Check in"}
      </Button>

      {status === "success" && (
        <p role="status" className="text-primary text-center text-sm font-medium">
          ✓ Guest checked in!
        </p>
      )}
    </form>
  );
}
