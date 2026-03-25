"use client";

import { useEffect, useImperativeHandle, useRef, forwardRef } from "react";

import { cn } from "@/components/lib/utils";
import type { CameraStatus } from "./types";

export interface CameraFeedHandle {
  capturePhoto: () => string | null;
}

interface CameraFeedProps {
  onStatusChange: (status: CameraStatus) => void;
  className?: string;
}

export const CameraFeed = forwardRef<CameraFeedHandle, CameraFeedProps>(function CameraFeed(
  { onStatusChange, className },
  ref,
) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function startCamera() {
      onStatusChange("requesting");
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        onStatusChange("active");
      } catch (err) {
        if (cancelled) return;
        const name = (err as DOMException).name;
        if (name === "NotAllowedError" || name === "PermissionDeniedError") {
          onStatusChange("denied");
        } else if (
          name === "NotFoundError" ||
          name === "DevicesNotFoundError" ||
          name === "NotReadableError"
        ) {
          onStatusChange("unavailable");
        } else {
          onStatusChange("error");
        }
      }
    }

    if (typeof navigator !== "undefined" && navigator.mediaDevices) {
      startCamera();
    } else {
      onStatusChange("unavailable");
    }

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [onStatusChange]);

  useImperativeHandle(ref, () => ({
    capturePhoto(): string | null {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < 2) return null;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      ctx.drawImage(video, 0, 0);
      return canvas.toDataURL("image/jpeg", 0.7);
    },
  }));

  return (
    <div className={cn("relative w-full overflow-hidden rounded-xl bg-black", className)}>
      <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
});
