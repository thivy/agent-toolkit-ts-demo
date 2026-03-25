"use client";

import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/components/lib/utils";
import { useGuestsStore } from "./use-guests-store";
import type { GuestRecord } from "./types";

interface GuestListProps {
  onSignOut: (id: string) => Promise<void>;
  className?: string;
}

export function GuestList({ onSignOut, className }: GuestListProps) {
  const guests = useGuestsStore((state) => state.guests);
  const isLoading = useGuestsStore((state) => state.isLoading);

  if (isLoading) {
    return (
      <div
        className={cn(
          "flex items-center justify-center py-12 text-muted-foreground text-sm",
          className,
        )}
      >
        Loading guests…
      </div>
    );
  }

  if (guests.length === 0) {
    return (
      <div
        className={cn(
          "flex items-center justify-center py-12 text-muted-foreground text-sm",
          className,
        )}
      >
        No guests checked in today.
      </div>
    );
  }

  return (
    <ul className={cn("flex flex-col gap-3", className)}>
      {guests.map((guest) => (
        <GuestItem key={guest.id} guest={guest} onSignOut={onSignOut} />
      ))}
    </ul>
  );
}

function GuestItem({
  guest,
  onSignOut,
}: {
  guest: GuestRecord;
  onSignOut: (id: string) => Promise<void>;
}) {
  return (
    <Card size="sm">
      <CardHeader className="flex-row items-center gap-3 border-b pb-3">
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted">
          {guest.photo ? (
            <Image
              src={guest.photo}
              alt={`${guest.firstName} ${guest.lastName}`}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-sm font-medium text-muted-foreground uppercase">
              {guest.firstName[0] ?? "?"}
              {guest.lastName[0] ?? "?"}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <CardTitle className="truncate text-sm">
            {guest.firstName} {guest.lastName}
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            {new Date(guest.checkedInAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </CardHeader>
      <CardContent className="pt-3">
        <Button
          variant="destructive"
          size="sm"
          className="w-full"
          onClick={() => onSignOut(guest.id)}
        >
          Sign Out
        </Button>
      </CardContent>
    </Card>
  );
}
