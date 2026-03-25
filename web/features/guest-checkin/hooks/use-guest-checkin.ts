"use client";

import { useCallback, useState } from "react";
import { saveCheckIn } from "../lib/guest-checkin-db";
import { useCameraCapture } from "./use-camera-capture";

export type SubmitStatus = "idle" | "saving" | "success" | "error";

export interface UseGuestCheckInReturn {
  camera: ReturnType<typeof useCameraCapture>;
  submitStatus: SubmitStatus;
  submitError: string | null;
  handleSubmit: (firstName: string, lastName: string) => Promise<void>;
  resetAll: () => void;
}

export function useGuestCheckIn(): UseGuestCheckInReturn {
  const camera = useCameraCapture();
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (firstName: string, lastName: string) => {
      if (!camera.capturedBlob) return;
      setSubmitStatus("saving");
      setSubmitError(null);
      try {
        await saveCheckIn({
          firstName,
          lastName,
          photo: camera.capturedBlob,
          createdAt: Date.now(),
        });
        setSubmitStatus("success");
        setTimeout(() => {
          camera.retake();
          setSubmitStatus("idle");
        }, 2000);
      } catch (err) {
        console.error("[guest-checkin] save failed:", err);
        setSubmitStatus("error");
        setSubmitError("Could not save check-in. Please try again.");
      }
    },
    [camera],
  );

  const resetAll = useCallback(() => {
    camera.stopCamera();
    setSubmitStatus("idle");
    setSubmitError(null);
  }, [camera]);

  return {
    camera,
    submitStatus,
    submitError,
    handleSubmit,
    resetAll,
  };
}
