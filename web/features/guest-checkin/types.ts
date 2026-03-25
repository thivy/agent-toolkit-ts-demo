export interface GuestRecord {
  id: string;
  firstName: string;
  lastName: string;
  photo: Blob;
  timestamp: number;
}

export type CheckinScreen = "camera" | "success";
