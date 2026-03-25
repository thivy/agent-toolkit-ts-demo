"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { useEffect, useState } from "react";
import { CameraPanel } from "./components/camera-panel";
import type { CheckInFormValues } from "./components/check-in-form";
import { CheckInForm } from "./components/check-in-form";
import { CheckInStatus } from "./components/check-in-status";
import { useGuestCheckIn } from "./hooks/use-guest-checkin";

export function GuestCheckInPage() {
  const { camera, submitStatus, submitError, handleSubmit } = useGuestCheckIn();
  // Incremented on each successful check-in so CheckInForm resets its fields.
  const [resetCount, setResetCount] = useState(0);

  useEffect(() => {
    if (submitStatus === "success") {
      setResetCount((c) => c + 1);
    }
  }, [submitStatus]);

  const onSubmit = async (values: CheckInFormValues) => {
    await handleSubmit(values.firstName, values.lastName);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-5xl">
        <Heading variant="h1" className="mb-6 text-center">
          Guest Check-In
        </Heading>

        <div className="grid gap-4 md:grid-cols-[3fr_2fr]">
          {/* Camera panel — visually dominant on desktop */}
          <Card>
            <CardHeader>
              <CardTitle>Camera</CardTitle>
            </CardHeader>
            <CardContent>
              <CameraPanel
                state={camera.state}
                videoRef={camera.videoRef}
                capturedUrl={camera.capturedUrl}
                onStart={camera.startCamera}
                onCapture={camera.capture}
                onRetake={camera.retake}
              />
            </CardContent>
          </Card>

          {/* Form panel */}
          <Card>
            <CardHeader>
              <CardTitle>Guest Details</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <CheckInForm
                hasPhoto={camera.state === "captured"}
                isSubmitting={submitStatus === "saving"}
                onSubmit={onSubmit}
                resetSignal={resetCount}
              />
              <CheckInStatus submitStatus={submitStatus} submitError={submitError} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
