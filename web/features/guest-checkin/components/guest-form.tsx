"use client";

import * as React from "react";

import { CameraFeed, type CameraFeedRef } from "@/components/blocks/guest-checkin/camera-feed";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { insertGuest } from "@/features/shared/indexeddb/db";
import {
  completeCheckin,
  setFirstName,
  setLastName,
  setCameraError,
  useGuestCheckinStore,
} from "@/features/guest-checkin/store";

export function GuestForm() {
  const firstName = useGuestCheckinStore((state) => state.firstName);
  const lastName = useGuestCheckinStore((state) => state.lastName);
  const cameraError = useGuestCheckinStore((state) => state.cameraError);

  const cameraRef = React.useRef<CameraFeedRef>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const isValid = firstName.trim().length > 0 && lastName.trim().length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const photo = await cameraRef.current?.captureFrame();
      if (!photo) {
        setCameraError("Failed to capture photo. Please try again.");
        return;
      }

      const id = crypto.randomUUID();
      completeCheckin(photo);
      await insertGuest({
        id,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        photo,
        timestamp: Date.now(),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {cameraError ? (
        <div className="flex items-center justify-center h-48 rounded-xl bg-muted text-muted-foreground text-sm px-4 text-center">
          <p>Camera unavailable: {cameraError}</p>
        </div>
      ) : (
        <CameraFeed ref={cameraRef} onError={setCameraError} className="aspect-video max-h-64" />
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex gap-3">
          <Input
            placeholder="First name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            disabled={!!cameraError}
          />
          <Input
            placeholder="Last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            disabled={!!cameraError}
          />
        </div>
        <Button
          type="submit"
          disabled={!isValid || !!cameraError || isSubmitting}
          className="w-full"
        >
          {isSubmitting ? "Signing in…" : "Check In"}
        </Button>
      </form>
    </div>
  );
}
