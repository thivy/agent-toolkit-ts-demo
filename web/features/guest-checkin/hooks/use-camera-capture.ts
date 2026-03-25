"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type CameraState = "idle" | "requesting" | "active" | "captured" | "denied" | "error";

export interface UseCameraCaptureReturn {
  state: CameraState;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  capturedUrl: string | null;
  capturedBlob: Blob | null;
  startCamera: () => Promise<void>;
  capture: () => void;
  retake: () => void;
  stopCamera: () => void;
}

export function useCameraCapture(): UseCameraCaptureReturn {
  const [state, setState] = useState<CameraState>("idle");
  const [capturedUrl, setCapturedUrl] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const revokeObjectUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    setState("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setState("active");
    } catch (err) {
      stopStream();
      const isDenied =
        err instanceof DOMException &&
        (err.name === "NotAllowedError" || err.name === "PermissionDeniedError");
      setState(isDenied ? "denied" : "error");
    }
  }, [stopStream]);

  const capture = useCallback(() => {
    const video = videoRef.current;
    if (!video || state !== "active") return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        revokeObjectUrl();
        const url = URL.createObjectURL(blob);
        objectUrlRef.current = url;
        setCapturedUrl(url);
        setCapturedBlob(blob);
        stopStream();
        setState("captured");
      },
      "image/jpeg",
      0.85,
    );
  }, [state, stopStream, revokeObjectUrl]);

  const retake = useCallback(() => {
    revokeObjectUrl();
    setCapturedUrl(null);
    setCapturedBlob(null);
    setState("idle");
  }, [revokeObjectUrl]);

  const stopCamera = useCallback(() => {
    stopStream();
    revokeObjectUrl();
    setCapturedUrl(null);
    setCapturedBlob(null);
    setState("idle");
  }, [stopStream, revokeObjectUrl]);

  useEffect(() => {
    return () => {
      stopStream();
      revokeObjectUrl();
    };
  }, [stopStream, revokeObjectUrl]);

  return {
    state,
    videoRef,
    capturedUrl,
    capturedBlob,
    startCamera,
    capture,
    retake,
    stopCamera,
  };
}
