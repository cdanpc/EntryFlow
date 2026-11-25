"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import type { IScannerControls } from "@zxing/browser";
import { useRouter } from "next/navigation";
import { checkInTicket, type CheckInState } from "@/app/staff/actions";
import { CheckInResult } from "@/components/check-in-result";
import { findStaffTicket } from "@/app/staff/scan/actions";
import { LoadingDots } from "@/components/loading-dots";

export function CheckInForm({ eventId, enabled, scannerOnly = false }: { eventId: string; enabled: boolean; scannerOnly?: boolean }) {
  const router = useRouter();
  const action = (scannerOnly ? findStaffTicket : checkInTicket).bind(null, eventId);
  const [state, formAction, pending] = useActionState(action, { kind: "idle", message: "" } satisfies CheckInState);
  const [scanning, setScanning] = useState(scannerOnly);
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
          if (scannerOnly) {
            const value = result.getText().trim();
            let token = value;
            if (/^https?:\/\//i.test(value)) {
              try { token = /^\/tickets\/([A-Za-z0-9_-]{32,64})\/?$/.exec(new URL(value).pathname)?.[1] ?? ""; }
              catch { token = ""; }
            }
            if (/^[A-Za-z0-9_-]{32,64}$/.test(token ?? "")) {
              setScanStatus("Opening ticket…");
              const selectedEvent = new URLSearchParams(window.location.search).get("eventId");
              router.push(`/staff/verify/${token}${selectedEvent ? `?eventId=${encodeURIComponent(selectedEvent)}` : ""}`);
            } else setCameraError("This is not an EntryFlow ticket QR. Try another code.");
            return;
          }
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
            : scannerOnly
              ? "Camera unavailable. Allow camera access or enter the ticket code below."
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
  }, [scanning, enabled, eventId, scannerOnly, router]);

  if (scannerOnly) return <section className="mobile-scanner" aria-label="Scan or enter a ticket"><div className="scanner-frame">{scanning && <video ref={videoRef} muted playsInline aria-label="Camera preview for QR scanning" />}{!scanning && <div className="scanner-idle">Camera paused</div>}<span className="scanner-corners" aria-hidden="true" /></div><p>Place the attendee&apos;s QR code inside the frame.</p><button className="camera-button" type="button" disabled={pending} onClick={() => { setCameraError(""); setScanStatus(""); setScanning((current) => !current); }}>{scanning ? "Stop camera" : "Start camera"}</button>{cameraError && <p className="field-error" role="alert">{cameraError}</p>}{scanStatus && <p role="status">{scanStatus}</p>}
    <form action={formAction} className="checkin-form scan-manual-form" aria-busy={pending} onSubmit={() => { controlsRef.current?.stop(); setScanning(false); setScanStatus(""); }}>
      <label htmlFor="scan-manual-code">Or enter ticket code</label>
      <div className="checkin-entry"><input id="scan-manual-code" name="manualCode" placeholder="A7K2P9" required minLength={6} maxLength={6} pattern="[A-Za-z0-9]{6}" autoComplete="off" autoCapitalize="characters" spellCheck={false} disabled={pending} /><button type="submit" disabled={pending}>{pending ? "Opening…" : "Verify ticket"}</button></div>
      <CheckInResult state={state} />
    </form>{pending && <LoadingDots label="Opening ticket for verification" />}
  </section>;

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
