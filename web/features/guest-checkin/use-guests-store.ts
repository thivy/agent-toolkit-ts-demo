"use client";

import { useEffect } from "react";
import { create } from "zustand";

import {
  addGuest,
  listTodayGuests,
  removeGuest,
  type GuestRecord,
} from "@/features/guest-checkin/indexeddb-client";

interface GuestsState {
  guests: GuestRecord[];
  isLoading: boolean;
}

interface GuestsActions {
  loadGuests: () => Promise<void>;
  checkIn: (
    firstName: string,
    lastName: string,
    photoDataUrl: string | null,
  ) => Promise<GuestRecord>;
  signOut: (id: string) => Promise<void>;
}

const useGuestsStore = create<GuestsState & GuestsActions>((set) => ({
  guests: [],
  isLoading: false,

  loadGuests: async () => {
    set({ isLoading: true });
    try {
      const guests = await listTodayGuests();
      set({ guests });
    } finally {
      set({ isLoading: false });
    }
  },

  checkIn: async (firstName, lastName, photoDataUrl) => {
    const record = await addGuest({
      id: crypto.randomUUID(),
      firstName,
      lastName,
      photoDataUrl,
      checkedInAt: Date.now(),
    });
    set((state) => ({ guests: [...state.guests, record] }));
    return record;
  },

  signOut: async (id) => {
    await removeGuest(id);
    set((state) => ({ guests: state.guests.filter((g) => g.id !== id) }));
  },
}));

export function useGuests() {
  const guests = useGuestsStore((s) => s.guests);
  const isLoading = useGuestsStore((s) => s.isLoading);
  const loadGuests = useGuestsStore((s) => s.loadGuests);
  const checkIn = useGuestsStore((s) => s.checkIn);
  const signOut = useGuestsStore((s) => s.signOut);

  useEffect(() => {
    loadGuests();
    // loadGuests is a stable Zustand action reference
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { guests, isLoading, loadGuests, checkIn, signOut };
}
