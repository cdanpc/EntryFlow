"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import type { IScannerControls } from "@zxing/browser";
import { checkInTicket, type CheckInState } from "@/app/staff/actions";
import { CheckInResult } from "@/components/check-in-result";

export function CheckInForm({ eventId, enabled }: { eventId: string; enabled: boolean }) {
  const action = checkInTicket.bind(null, eventId);
  const [state, formAction, pending] = useActionState(action, { kind: "idle", message: "" } satisfies CheckInState);
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [scanStatus, setScanStatus] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannedCodeRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);

  useEffect(() => {
    if (state.kind !== "idle") setScanStatus("");
  }, [state]);

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
          if (scannedCodeRef.current && formRef.current) {
            scannedCodeRef.current.value = result.getText().trim();
            setScanStatus("QR read. Checking ticket…");
            formRef.current.requestSubmit();
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
    <form ref={formRef} action={formAction} className="checkin-form" aria-busy={pending}>
      <label htmlFor="ticketCode">Ticket code</label>
      <input ref={scannedCodeRef} type="hidden" name="ticketCode" />
      <div className="checkin-entry"><input id="ticketCode" name="manualCode" autoComplete="off" placeholder="Enter 6-character code" maxLength={6} disabled={pending} onFocus={() => { if (scannedCodeRef.current) scannedCodeRef.current.value = ""; }} onChange={() => { if (scannedCodeRef.current) scannedCodeRef.current.value = ""; setScanStatus(""); }} /><button type="submit" disabled={pending} onClick={() => { if (scannedCodeRef.current) scannedCodeRef.current.value = ""; setScanStatus(""); }}>{pending ? "Checking…" : "Check in"}</button></div>
      <button className="camera-button" type="button" disabled={pending} onClick={() => { setCameraError(""); setScanStatus(""); setScanning((current) => !current); }}>{scanning ? "Stop camera" : "Scan QR with camera"}</button>
      {scanning && <div className="scanner-preview"><video ref={videoRef} muted playsInline aria-label="Camera preview for QR scanning" /><p>Point the camera at the attendee&apos;s QR ticket.</p></div>}
      {cameraError && <p className="field-error" role="alert">{cameraError}</p>}
      {(pending || scanStatus) && <p className="field-hint" role="status" aria-live="polite">{pending ? "Checking ticket…" : scanStatus}</p>}
      {!enabled && <p className="field-hint">Check-in is available on the event date in Cebu.</p>}
      <CheckInResult state={state} />
    </form>
  );
}
