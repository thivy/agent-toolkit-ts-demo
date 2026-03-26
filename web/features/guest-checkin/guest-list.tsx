"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/components/lib/utils";
import type { GuestRecord } from "@/features/guest-checkin/indexeddb-client";

interface GuestListProps {
  guests: GuestRecord[];
  onSignOut: (id: string) => Promise<void>;
  className?: string;
}

export function GuestList({ guests, onSignOut, className }: GuestListProps) {
  if (guests.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-2 py-12 text-center",
          className,
        )}
      >
        <span className="text-3xl">👥</span>
        <p className="text-sm text-muted-foreground">No guests checked in yet today.</p>
      </div>
    );
  }

  return (
    <ul className={cn("flex flex-col gap-3", className)}>
      {guests.map((guest) => (
        <li
          key={guest.id}
          className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
        >
          {guest.photoDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={guest.photoDataUrl}
              alt={`${guest.firstName} ${guest.lastName}`}
              className="size-12 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="bg-muted text-muted-foreground flex size-12 shrink-0 items-center justify-center rounded-full text-lg font-semibold">
              {guest.firstName.charAt(0).toUpperCase() || "?"}
              {guest.lastName.charAt(0).toUpperCase() || "?"}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {guest.firstName} {guest.lastName}
            </p>
            <p className="text-muted-foreground text-xs">
              {new Date(guest.checkedInAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => onSignOut(guest.id)}
            aria-label={`Sign out ${guest.firstName} ${guest.lastName}`}
          >
            Sign out
          </Button>
        </li>
      ))}
    </ul>
  );
}
