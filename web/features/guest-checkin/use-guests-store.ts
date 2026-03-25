import { create } from "zustand";

import type { GuestRecord } from "./types";

interface GuestsState {
  guests: GuestRecord[];
  isLoading: boolean;
  successMessage: string | null;
  isSubmitting: boolean;
}

export const useGuestsStore = create<GuestsState>(() => ({
  guests: [],
  isLoading: true,
  successMessage: null,
  isSubmitting: false,
}));

// ── Decoupled actions ──────────────────────────────────────────────────────────

export const hydrateGuests = (guests: GuestRecord[]) => {
  useGuestsStore.setState({ guests, isLoading: false });
};

export const addGuest = (guest: GuestRecord) => {
  useGuestsStore.setState((state) => ({
    guests: [guest, ...state.guests],
    successMessage: `${guest.firstName} ${guest.lastName} checked in!`,
    isSubmitting: false,
  }));
};

export const removeGuest = (id: string) => {
  useGuestsStore.setState((state) => ({
    guests: state.guests.filter((g) => g.id !== id),
  }));
};

export const setSubmitting = (isSubmitting: boolean) => {
  useGuestsStore.setState({ isSubmitting });
};

export const clearSuccessMessage = () => {
  useGuestsStore.setState({ successMessage: null });
};
