"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import type { IScannerControls } from "@zxing/browser";
import { checkInTicket, type CheckInState } from "@/app/staff/actions";

export function CheckInForm({ eventId, enabled }: { eventId: string; enabled: boolean }) {
  const action = checkInTicket.bind(null, eventId);
  const [state, formAction, pending] = useActionState(action, { kind: "idle", message: "" } satisfies CheckInState);
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);

  useEffect(() => {
    if (!scanning) return;
    let cancelled = false;
    let detected = false;

    async function startCamera() {
      try {
        if (!navigator.mediaDevices?.getUserMedia || !window.isSecureContext) {
          throw new Error("Camera scanning requires HTTPS and camera access.");
        }
        const { BrowserQRCodeReader } = await import("@zxing/browser");
        if (cancelled || !videoRef.current) return;
        const reader = new BrowserQRCodeReader();
        const controls = await reader.decodeFromConstraints({ video: { facingMode: { ideal: "environment" } } }, videoRef.current, (result) => {
          if (!result || cancelled || detected) return;
          detected = true;
          controlsRef.current?.stop();
          setScanning(false);
          if (inputRef.current && formRef.current) {
            inputRef.current.value = result.getText().trim();
            if (enabled) formRef.current.requestSubmit();
            else setCameraError("QR scanned. Check-in opens on the event date in Cebu.");
          }
        });
        if (cancelled || detected) controls.stop();
        else controlsRef.current = controls;
      } catch (error) {
        if (!cancelled) {
          setCameraError(error instanceof Error && error.message === "Camera scanning requires HTTPS and camera access."
            ? error.message
            : "Camera unavailable. Allow camera access or enter the ticket code manually.");
          setScanning(false);
        }
      }
    }

    void startCamera();
    return () => {
      cancelled = true;
      controlsRef.current?.stop();
      controlsRef.current = null;
    };
  }, [scanning, enabled, eventId]);

  return (
    <form ref={formRef} action={formAction} className="checkin-form">
      <label htmlFor="ticketCode">Ticket code</label>
      <div className="checkin-entry"><input ref={inputRef} id="ticketCode" name="ticketCode" autoComplete="off" placeholder="Enter ticket code" required disabled={!enabled || pending} /><button type="submit" disabled={!enabled || pending}>{pending ? "Checking…" : "Check in"}</button></div>
      <button className="camera-button" type="button" disabled={pending} onClick={() => { setCameraError(""); setScanning((current) => !current); }}>{scanning ? "Stop camera" : "Scan QR with camera"}</button>
      {scanning && <div className="scanner-preview"><video ref={videoRef} muted playsInline aria-label="Camera preview for QR scanning" /><p>Point the camera at the attendee&apos;s QR ticket.</p></div>}
      {cameraError && <p className="field-error" role="alert">{cameraError}</p>}
      {!enabled && <p className="field-hint">Check-in is available on the event date in Cebu.</p>}
      {state.kind !== "idle" && <div className={`checkin-result result-${state.kind}`} role="status" aria-live="polite"><strong>{state.message}</strong>{state.attendee && <span>{state.attendee}</span>}{state.time && <span>{state.time}</span>}</div>}
    </form>
  );
}
