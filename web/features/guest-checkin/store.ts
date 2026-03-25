import { create } from "zustand";

import type { CheckinScreen } from "@/features/guest-checkin/types";

interface GuestCheckinState {
  firstName: string;
  lastName: string;
  screen: CheckinScreen;
  capturedPhoto: Blob | null;
  cameraError: string | null;
}

export const useGuestCheckinStore = create<GuestCheckinState>(() => ({
  firstName: "",
  lastName: "",
  screen: "camera",
  capturedPhoto: null,
  cameraError: null,
}));

export const setFirstName = (firstName: string) => {
  useGuestCheckinStore.setState({ firstName });
};

export const setLastName = (lastName: string) => {
  useGuestCheckinStore.setState({ lastName });
};

export const setCameraError = (cameraError: string | null) => {
  useGuestCheckinStore.setState({ cameraError });
};

export const completeCheckin = (photo: Blob) => {
  useGuestCheckinStore.setState({ capturedPhoto: photo, screen: "success" });
};

export const resetCheckin = () => {
  useGuestCheckinStore.setState({
    firstName: "",
    lastName: "",
    screen: "camera",
    capturedPhoto: null,
    cameraError: null,
  });
};
