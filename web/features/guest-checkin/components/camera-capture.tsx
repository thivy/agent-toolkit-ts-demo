"use client";

import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useRef, useState } from "react";

type CameraState = "idle" | "live" | "captured" | "error";

interface CameraCaptureProps {
  onCapture: (blob: Blob, mimeType: string) => void;
  onClear: () => void;
  capturedBlob: Blob | null;
}

export function CameraCapture({ onCapture, onClear, capturedBlob }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [state, setState] = useState<CameraState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    setErrorMessage(null);
    setState("idle");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setState("live");
    } catch (err) {
      stopStream();
      if (err instanceof DOMException && err.name === "NotAllowedError") {
        setErrorMessage("Camera permission denied. Please allow camera access and try again.");
      } else if (err instanceof DOMException && err.name === "NotFoundError") {
        setErrorMessage("No camera found. Please connect a camera and try again.");
      } else {
        setErrorMessage("Unable to access camera. Please check your device and try again.");
      }
      setState("error");
    }
  }, [stopStream]);

  const takePhoto = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || state !== "live") return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        stopStream();
        setState("captured");
        onCapture(blob, "image/jpeg");
      },
      "image/jpeg",
      0.92,
    );
  }, [state, stopStream, onCapture]);

  const retake = useCallback(() => {
    onClear();
    setState("idle");
  }, [onClear]);

  useEffect(() => {
    return () => {
      stopStream();
    };
  }, [stopStream]);

  useEffect(() => {
    if (!capturedBlob) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(capturedBlob);
    setPreviewUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [capturedBlob]);

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center gap-4 overflow-hidden rounded-lg bg-muted">
      {state === "idle" && (
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-muted-foreground text-sm">Camera is off</p>
          <Button type="button" onClick={startCamera}>
            Start Camera
          </Button>
        </div>
      )}

      {state === "error" && (
        <div className="flex flex-col items-center gap-3 px-4 text-center">
          <p className="text-destructive text-sm">{errorMessage}</p>
          <Button type="button" variant="outline" onClick={startCamera}>
            Try Again
          </Button>
        </div>
      )}

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`h-full w-full object-cover ${state === "live" ? "block" : "hidden"}`}
      />

      {state === "live" && (
        <div className="absolute bottom-4">
          <Button type="button" onClick={takePhoto}>
            Take Photo
          </Button>
        </div>
      )}

      {state === "captured" && previewUrl && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt="Captured photo" className="h-full w-full object-cover" />
          <div className="absolute bottom-4">
            <Button type="button" variant="outline" onClick={retake}>
              Retake
            </Button>
          </div>
        </>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
