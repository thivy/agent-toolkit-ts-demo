"use client";

import { useRef, useState, useCallback } from "react";

import { Heading } from "@/components/ui/heading";
import { cn } from "@/components/lib/utils";
import { CameraFeed } from "./camera-feed";
import { CheckinForm } from "./checkin-form";
import { GuestList } from "./guest-list";
import { useGuestCheckin } from "./use-guest-checkin";
import type { CameraFeedHandle } from "./camera-feed";
import type { CameraStatus } from "./types";

export function GuestCheckinPage() {
  const cameraRef = useRef<CameraFeedHandle | null>(null);
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>("idle");
  const { checkinGuest, signOutGuest } = useGuestCheckin();

  const handleStatusChange = useCallback((status: CameraStatus) => {
    setCameraStatus(status);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b px-6 py-4">
        <Heading variant="h3">Guest Check-In</Heading>
      </header>

      {/* Three-panel layout */}
      <main className="flex flex-1 flex-col gap-4 p-4 lg:flex-row lg:gap-6 lg:p-6">
        {/* Left panel — today's roster */}
        <aside className="flex flex-col gap-4 lg:w-72 xl:w-80">
          <Heading variant="h4">Today&apos;s Guests</Heading>
          <GuestList onSignOut={signOutGuest} className="overflow-y-auto" />
        </aside>

        {/* Center panel — camera */}
        <section className="flex flex-1 flex-col gap-4">
          <Heading variant="h4">Camera</Heading>
          <div className="relative flex-1 min-h-64 lg:min-h-0">
            {(cameraStatus === "denied" ||
              cameraStatus === "unavailable" ||
              cameraStatus === "error") && <CameraFallback status={cameraStatus} />}
            <CameraFeed
              ref={cameraRef}
              onStatusChange={handleStatusChange}
              className={cn(
                "h-full w-full",
                (cameraStatus === "denied" ||
                  cameraStatus === "unavailable" ||
                  cameraStatus === "error") &&
                  "hidden",
              )}
            />
          </div>
        </section>

        {/* Right panel — check-in form */}
        <aside className="flex flex-col gap-4 lg:w-72 xl:w-80">
          <Heading variant="h4">Check In</Heading>
          <CheckinForm cameraRef={cameraRef} onCheckin={checkinGuest} />
        </aside>
      </main>
    </div>
  );
}

function CameraFallback({ status }: { status: CameraStatus }) {
  const messages: Record<CameraStatus, string> = {
    denied: "Camera access was denied. Please allow camera permissions in your browser settings.",
    unavailable: "No camera found. Please connect a camera and reload the page.",
    error: "Camera encountered an unexpected error. Please reload the page.",
    idle: "",
    requesting: "",
    active: "",
  };

  return (
    <div className="flex h-full w-full min-h-64 items-center justify-center rounded-xl border border-dashed border-border bg-muted p-6 text-center text-sm text-muted-foreground">
      {messages[status]}
    </div>
  );
}
