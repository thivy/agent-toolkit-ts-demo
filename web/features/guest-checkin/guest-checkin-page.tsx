"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { CameraCapture } from "./components/camera-capture";
import { saveCheckin } from "./lib/guest-checkin-db";
import {
  type GuestCheckinFormValues,
  guestCheckinSchema,
} from "./lib/guest-checkin-schema";

type SubmitState = "idle" | "saving" | "success" | "error";

export function GuestCheckinPage() {
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [capturedMimeType, setCapturedMimeType] = useState<string>("image/jpeg");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [photoError, setPhotoError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GuestCheckinFormValues>({
    resolver: zodResolver(guestCheckinSchema),
  });

  const handleCapture = useCallback((blob: Blob, mimeType: string) => {
    setCapturedBlob(blob);
    setCapturedMimeType(mimeType);
    setPhotoError(null);
  }, []);

  const handleClear = useCallback(() => {
    setCapturedBlob(null);
  }, []);

  const onSubmit = async (values: GuestCheckinFormValues) => {
    if (!capturedBlob) {
      setPhotoError("Please capture a photo before checking in.");
      return;
    }

    setSubmitState("saving");
    try {
      await saveCheckin({
        id: crypto.randomUUID(),
        firstName: values.firstName,
        lastName: values.lastName,
        photoBlob: capturedBlob,
        photoMimeType: capturedMimeType,
        createdAt: new Date().toISOString(),
      });
      reset();
      setCapturedBlob(null);
      setPhotoError(null);
      setSubmitState("success");
      setTimeout(() => setSubmitState("idle"), 3000);
    } catch {
      setSubmitState("error");
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-5xl">
        <Heading variant="h1" className="mb-6">
          Guest Check-In
        </Heading>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="flex flex-col gap-6 md:flex-row">
            {/* Camera panel */}
            <div className="min-h-72 flex-1 md:min-h-[480px]">
              <CameraCapture
                onCapture={handleCapture}
                onClear={handleClear}
                capturedBlob={capturedBlob}
              />
              {photoError && (
                <p className="text-destructive mt-2 text-sm">{photoError}</p>
              )}
            </div>

            {/* Form panel */}
            <div className="w-full md:w-80">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Guest Details</CardTitle>
                </CardHeader>

                <CardContent className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="Jane"
                      aria-invalid={!!errors.firstName}
                      {...register("firstName")}
                    />
                    {errors.firstName && (
                      <p className="text-destructive text-xs">{errors.firstName.message}</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      aria-invalid={!!errors.lastName}
                      {...register("lastName")}
                    />
                    {errors.lastName && (
                      <p className="text-destructive text-xs">{errors.lastName.message}</p>
                    )}
                  </div>

                  {submitState === "success" && (
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">
                      ✓ Guest checked in successfully!
                    </p>
                  )}

                  {submitState === "error" && (
                    <p className="text-destructive text-sm">
                      Save failed. Please try again — your photo and form data are preserved.
                    </p>
                  )}
                </CardContent>

                <CardFooter>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={submitState === "saving"}
                  >
                    {submitState === "saving" ? "Saving…" : "Check In"}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
