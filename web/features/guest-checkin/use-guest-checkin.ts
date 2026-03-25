"use client";

import { useEffect, useRef } from "react";

import {
  createGuestRecord,
  deleteGuestRecord,
  getTodayDayKey,
  loadGuestsByDay,
} from "./indexeddb-client";
import {
  addGuest,
  clearSuccessMessage,
  hydrateGuests,
  removeGuest,
  setSubmitting,
} from "./use-guests-store";
import type { GuestCheckinInput } from "./types";

export function useGuestCheckin() {
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hydrate today's guests on mount
  useEffect(() => {
    loadGuestsByDay(getTodayDayKey())
      .then((records) => hydrateGuests(records))
      .catch(() => hydrateGuests([]));

    return () => {
      if (successTimerRef.current !== null) {
        clearTimeout(successTimerRef.current);
      }
    };
  }, []);

  async function checkinGuest(input: GuestCheckinInput): Promise<void> {
    setSubmitting(true);
    try {
      const record = await createGuestRecord(input);
      addGuest(record);
      // Clear success message automatically after 3 s; cancel any previous timer first
      if (successTimerRef.current !== null) clearTimeout(successTimerRef.current);
      successTimerRef.current = setTimeout(() => clearSuccessMessage(), 3000);
    } catch {
      setSubmitting(false);
    }
  }

  async function signOutGuest(id: string): Promise<void> {
    removeGuest(id); // optimistic remove
    try {
      await deleteGuestRecord(id);
    } catch {
      // Rollback: reload today's guests to restore consistent state after a failed delete
      loadGuestsByDay(getTodayDayKey())
        .then((records) => hydrateGuests(records))
        .catch(() => {
          // Best-effort rollback — silently ignore if IndexedDB is unavailable
        });
    }
  }

  return { checkinGuest, signOutGuest };
}
