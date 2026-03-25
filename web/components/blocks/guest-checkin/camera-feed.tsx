"use client";

import * as React from "react";

import { cn } from "@/components/lib/utils";

interface CameraFeedProps {
  onError?: (message: string) => void;
  className?: string;
}

export interface CameraFeedRef {
  captureFrame: () => Promise<Blob | null>;
}

const CameraFeed = React.forwardRef<CameraFeedRef, CameraFeedProps>(
  ({ onError, className }, ref) => {
    const videoRef = React.useRef<HTMLVideoElement>(null);
    const streamRef = React.useRef<MediaStream | null>(null);

    React.useEffect(() => {
      let cancelled = false;

      async function startCamera() {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user" },
          });
          if (cancelled) {
            stream.getTracks().forEach((t) => t.stop());
            return;
          }
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (err) {
          if (cancelled) return;
          const message = err instanceof Error ? err.message : "Unable to access camera";
          onError?.(message);
        }
      }

      startCamera();

      return () => {
        cancelled = true;
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      };
    }, [onError]);

    React.useImperativeHandle(ref, () => ({
      captureFrame: () =>
        new Promise<Blob | null>((resolve) => {
          const video = videoRef.current;
          if (!video) return resolve(null);

          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext("2d");
          if (!ctx) return resolve(null);

          ctx.drawImage(video, 0, 0);
          canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.9);
        }),
    }));

    return (
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className={cn("w-full rounded-xl object-cover bg-muted", className)}
      />
    );
  },
);

CameraFeed.displayName = "CameraFeed";

export { CameraFeed };
