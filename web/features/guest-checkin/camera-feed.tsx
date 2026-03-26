"use client";

import { useEffect, useImperativeHandle, useRef, useState } from "react";

import { cn } from "@/components/lib/utils";

export interface CameraFeedHandle {
  capture: () => string | null;
}

interface CameraFeedProps {
  ref: React.Ref<CameraFeedHandle>;
  className?: string;
}

export function CameraFeed({ ref, className }: CameraFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsReady(true);
        }
      } catch (err) {
        if (err instanceof Error) {
          if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
            setError("Camera access denied. Please allow camera permissions.");
          } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
            setError("No camera found on this device.");
          } else {
            setError("Camera unavailable. Please check your device settings.");
          }
        }
      }
    }

    startCamera();

    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useImperativeHandle(ref, () => ({
    capture(): string | null {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || !isReady) return null;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      ctx.drawImage(video, 0, 0);
      return canvas.toDataURL("image/jpeg", 0.8);
    },
  }));

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center overflow-hidden rounded-xl bg-muted",
        className,
      )}
    >
      {error ? (
        <div className="flex flex-col items-center gap-3 p-6 text-center">
          <span className="text-4xl">📷</span>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      ) : (
        <>
          {!isReady && <p className="absolute text-sm text-muted-foreground">Starting camera…</p>}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={cn(
              "h-full w-full object-cover transition-opacity duration-300",
              isReady ? "opacity-100" : "opacity-0",
            )}
          />
        </>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
