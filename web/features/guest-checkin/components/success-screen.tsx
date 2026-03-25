"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { resetCheckin, useGuestCheckinStore } from "@/features/guest-checkin/store";

export function SuccessScreen() {
  const firstName = useGuestCheckinStore((state) => state.firstName);
  const capturedPhoto = useGuestCheckinStore((state) => state.capturedPhoto);

  const photoUrl = React.useMemo(
    () => (capturedPhoto ? URL.createObjectURL(capturedPhoto) : null),
    [capturedPhoto],
  );

  React.useEffect(() => {
    return () => {
      if (photoUrl) URL.revokeObjectURL(photoUrl);
    };
  }, [photoUrl]);

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      {photoUrl && (
        <img
          src={photoUrl}
          alt={`${firstName}'s photo`}
          className="w-32 h-32 rounded-full object-cover ring-4 ring-primary/20"
        />
      )}
      <div className="flex flex-col gap-1">
        <p className="text-2xl font-semibold">Welcome, {firstName}! 👋</p>
        <p className="text-muted-foreground text-sm">You have successfully checked in.</p>
      </div>
      <Button variant="outline" onClick={resetCheckin}>
        Sign in New Guest
      </Button>
    </div>
  );
}
