import { z } from "zod";

export const guestCheckinSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

export type GuestCheckinFormValues = z.infer<typeof guestCheckinSchema>;

export interface GuestCheckinRecord {
  id: string;
  firstName: string;
  lastName: string;
  photoBlob: Blob;
  photoMimeType: string;
  createdAt: string;
}
