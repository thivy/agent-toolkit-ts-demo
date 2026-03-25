export interface GuestRecord {
  id: string;
  firstName: string;
  lastName: string;
  photo: string; // compressed data URL
  checkedInAt: number; // Unix timestamp (ms)
  dayKey: string; // "YYYY-MM-DD" in browser local time
}

export type GuestCheckinInput = {
  firstName: string;
  lastName: string;
  photo: string;
};

export type CameraStatus = "idle" | "requesting" | "active" | "denied" | "unavailable" | "error";
