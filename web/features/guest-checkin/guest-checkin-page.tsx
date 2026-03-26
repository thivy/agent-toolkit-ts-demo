"use client";

import { useRef } from "react";

import { Heading } from "@/components/ui/heading";
import { CameraFeed, type CameraFeedHandle } from "@/features/guest-checkin/camera-feed";
import { CheckinForm } from "@/features/guest-checkin/checkin-form";
import { GuestList } from "@/features/guest-checkin/guest-list";
import { useGuests } from "@/features/guest-checkin/use-guests-store";

export function GuestCheckinPage() {
  const cameraRef = useRef<CameraFeedHandle>(null);
  const { guests, isLoading, checkIn, signOut } = useGuests();

  async function handleCheckin(firstName: string, lastName: string) {
    const photoDataUrl = cameraRef.current?.capture() ?? null;
    await checkIn(firstName, lastName, photoDataUrl);
  }

  return (
    <div className="flex h-screen flex-col">
      <header className="border-b border-border px-6 py-4">
        <Heading variant="h3">Guest Check-In</Heading>
      </header>

      <main className="flex min-h-0 flex-1 flex-col gap-4 p-4 md:flex-row md:gap-6 md:p-6">
        {/* Left: guest list */}
        <aside className="flex flex-col gap-3 md:w-64 md:shrink-0 lg:w-72">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Today&apos;s Guests
            {!isLoading && <span className="ml-2 text-foreground">{guests.length}</span>}
          </h2>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <GuestList guests={guests} onSignOut={signOut} />
          </div>
        </aside>

        {/* Center: camera feed */}
        <section className="flex min-h-0 flex-1 flex-col gap-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Camera
          </h2>
          <CameraFeed ref={cameraRef} className="min-h-[240px] flex-1" />
        </section>

        {/* Right: check-in form */}
        <aside className="flex flex-col gap-3 md:w-64 md:shrink-0 lg:w-72">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            New Check-In
          </h2>
          <CheckinForm onCheckin={handleCheckin} />
        </aside>
      </main>
    </div>
  );
}
