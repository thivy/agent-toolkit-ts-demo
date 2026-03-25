"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { GuestForm } from "@/features/guest-checkin/components/guest-form";
import { SuccessScreen } from "@/features/guest-checkin/components/success-screen";
import { useGuestCheckinStore } from "@/features/guest-checkin/store";

export function GuestCheckinPage() {
  const screen = useGuestCheckinStore((state) => state.screen);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <Heading variant="h3">
            {screen === "camera" ? "Guest Check-in" : "Check-in Complete"}
          </Heading>
        </CardHeader>
        <CardContent>{screen === "camera" ? <GuestForm /> : <SuccessScreen />}</CardContent>
      </Card>
    </div>
  );
}
