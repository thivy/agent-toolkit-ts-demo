"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
});

export type CheckInFormValues = z.infer<typeof schema>;

interface CheckInFormProps {
  hasPhoto: boolean;
  isSubmitting: boolean;
  onSubmit: (values: CheckInFormValues) => void;
  resetSignal?: number;
}

export function CheckInForm({ hasPhoto, isSubmitting, onSubmit, resetSignal }: CheckInFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<CheckInFormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  useEffect(() => {
    if (resetSignal !== undefined && resetSignal > 0) {
      reset();
    }
  }, [resetSignal, reset]);

  const isDisabled = !isValid || !hasPhoto || isSubmitting;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="firstName" className="text-sm font-medium">
          First Name
        </label>
        <Input
          id="firstName"
          type="text"
          placeholder="Jane"
          autoComplete="given-name"
          aria-invalid={!!errors.firstName}
          aria-describedby={errors.firstName ? "firstName-error" : undefined}
          {...register("firstName")}
        />
        {errors.firstName && (
          <p id="firstName-error" className="text-destructive text-xs" role="alert">
            {errors.firstName.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="lastName" className="text-sm font-medium">
          Last Name
        </label>
        <Input
          id="lastName"
          type="text"
          placeholder="Smith"
          autoComplete="family-name"
          aria-invalid={!!errors.lastName}
          aria-describedby={errors.lastName ? "lastName-error" : undefined}
          {...register("lastName")}
        />
        {errors.lastName && (
          <p id="lastName-error" className="text-destructive text-xs" role="alert">
            {errors.lastName.message}
          </p>
        )}
      </div>

      {!hasPhoto && (
        <p className="text-muted-foreground text-xs">Please take a photo before checking in.</p>
      )}

      <Button
        type="submit"
        disabled={isDisabled}
        className="mt-2 w-full"
        aria-label="Complete check-in"
      >
        {isSubmitting ? "Saving…" : "Check In"}
      </Button>
    </form>
  );
}
