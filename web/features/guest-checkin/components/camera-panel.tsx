"use client";

import { Button } from "@/components/ui/button";
import type { CameraState } from "../hooks/use-camera-capture";

interface CameraPanelProps {
  state: CameraState;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  capturedUrl: string | null;
  onStart: () => void;
  onCapture: () => void;
  onRetake: () => void;
}

export function CameraPanel({
  state,
  videoRef,
  capturedUrl,
  onStart,
  onCapture,
  onRetake,
}: CameraPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Preview area */}
      <div className="bg-muted relative aspect-video w-full overflow-hidden rounded-xl">
        {state === "idle" && (
          <div className="text-muted-foreground flex h-full flex-col items-center justify-center gap-3">
            <CameraIcon className="size-12 opacity-40" />
            <span className="text-sm">Camera off</span>
          </div>
        )}

        {state === "requesting" && (
          <div className="text-muted-foreground flex h-full items-center justify-center">
            <span className="text-sm">Requesting camera access…</span>
          </div>
        )}

        {(state === "active" || state === "captured") && (
          <>
            {/* Live preview */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`h-full w-full object-cover ${state === "captured" ? "hidden" : ""}`}
            />
            {/* Still preview */}
            {state === "captured" && capturedUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={capturedUrl}
                alt="Captured photo preview"
                className="h-full w-full object-cover"
              />
            )}
          </>
        )}

        {state === "denied" && (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center">
            <CameraOffIcon className="text-destructive size-10" />
            <p className="text-sm font-medium">Camera access denied</p>
            <p className="text-muted-foreground text-xs">
              Allow camera access in your browser settings, then try again.
            </p>
          </div>
        )}

        {state === "error" && (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center">
            <CameraOffIcon className="text-destructive size-10" />
            <p className="text-sm font-medium">Camera unavailable</p>
            <p className="text-muted-foreground text-xs">
              Could not access your camera. Please check your device.
            </p>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex justify-end gap-2">
        {state === "idle" || state === "denied" || state === "error" ? (
          <Button variant="outline" onClick={onStart} aria-label="Start camera">
            <CameraIcon className="size-4" />
            Start Camera
          </Button>
        ) : state === "active" ? (
          <Button onClick={onCapture} aria-label="Take photo">
            <CameraIcon className="size-4" />
            Take Photo
          </Button>
        ) : (
          <Button variant="outline" onClick={onRetake} aria-label="Retake photo">
            <RetakeIcon className="size-4" />
            Retake
          </Button>
        )}
      </div>
    </div>
  );
}

function CameraIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  );
}

function CameraOffIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <line x1="2" y1="2" x2="22" y2="22" />
      <path d="M7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16" />
      <path d="M9.5 4h5L17 7h3a2 2 0 0 1 2 2v7.5" />
      <path d="M14.121 15.121A3 3 0 1 1 9.88 10.88" />
    </svg>
  );
}

function RetakeIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}
