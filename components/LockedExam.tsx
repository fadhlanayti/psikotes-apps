// components/LockedExam.tsx
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  enterFullscreen,
  exitFullscreen,
  isFullscreen,
  lockNavigation,
  blockShortcuts,
  blockContextMenu,
  blockCopyPaste,
  preventUnload,
  requestCamera,
  stopCamera,
  captureFrame,
  MAX_VIOLATIONS,
  VIOLATION_LABELS,
  type ViolationType,
} from "@/lib/security";

interface LockedExamProps {
  sessionId: string;
  children: React.ReactNode;
  onDisqualified?: () => void;
  onCameraReady?: (stream: MediaStream) => void;
}

export default function LockedExam({
  sessionId,
  children,
  onDisqualified,
  onCameraReady,
}: LockedExamProps) {
  const router = useRouter();
  const [violations, setViolations] = useState(0);
  const [warning, setWarning] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [photosSent, setPhotosSent] = useState(0);

  const violationsRef = useRef(0);
  const lockedRef = useRef(false);
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const captureIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ==================== REPORT VIOLATION ====================
  const reportViolation = useCallback(
    async (type: ViolationType) => {
      if (lockedRef.current) return;

      violationsRef.current += 1;
      const count = violationsRef.current;
      setViolations(count);

      // Kirim ke server (dummy, tidak apa-apa kalau gagal)
      try {
        await fetch("/api/violation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, type, count }),
        });
      } catch {
        // silent
      }

      // Kalau sudah lewat batas → diskualifikasi
      if (count >= MAX_VIOLATIONS) {
        lockedRef.current = true;
        setLocked(true);
        setWarning("Anda terdiskualifikasi karena terlalu banyak pelanggaran.");

        // Auto submit paksa
        try {
          await fetch("/api/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId,
              forced: true,
              reason: "max_violations",
            }),
          });
        } catch {
          // silent
        }

        onDisqualified?.();
        router.replace("/hasil?status=disqualified");
        return;
      }

      // Tampilkan peringatan
      setWarning(
        `Peringatan ${count}/${MAX_VIOLATIONS}: ${VIOLATION_LABELS[type]}`
      );

      // Coba masuk fullscreen lagi
      setTimeout(() => {
        if (!isFullscreen()) {
          enterFullscreen().catch(() => {});
        }
      }, 300);
    },
    [sessionId, onDisqualified, router]
  );

  // ==================== SETUP CAMERA + LOCK ====================
  useEffect(() => {
    let cancelled = false;

    async function setup() {
      // 1. Minta kamera
      try {
        const stream = await requestCamera();
        if (cancelled) {
          stopCamera(stream);
          return;
        }

        streamRef.current = stream;
        setCameraReady(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }

        onCameraReady?.(stream);
      } catch (err) {
        console.error("Camera error:", err);
        setWarning("Kamera tidak dapat diakses. Tes tidak bisa dilanjutkan.");
        return;
      }

      // 2. Masuk fullscreen
      try {
        await enterFullscreen();
      } catch {
        setWarning("Harap izinkan mode fullscreen untuk memulai tes.");
      }

      // 3. Mulai capture foto tiap 1 detik
      captureIntervalRef.current = setInterval(async () => {
        if (!videoRef.current || !streamRef.current) return;
        if (lockedRef.current) return;

        try {
          const blob = await captureFrame(videoRef.current, 320, 240, 0.6);
          if (!blob) return;

          // Dummy: kirim ke /api/capture
          const formData = new FormData();
          formData.append("photo", blob, `capture_${Date.now()}.jpg`);
          formData.append("sessionId", sessionId);
          formData.append("timestamp", String(Date.now()));
          formData.append("violations", String(violationsRef.current));

          await fetch("/api/capture", {
            method: "POST",
            body: formData,
          }).catch(() => {});

          setPhotosSent((p) => p + 1);
        } catch (err) {
          console.warn("Capture error:", err);
        }
      }, 1000);
    }

    setup();

    return () => {
      cancelled = true;
      if (captureIntervalRef.current) {
        clearInterval(captureIntervalRef.current);
        captureIntervalRef.current = null;
      }
      stopCamera(streamRef.current);
      streamRef.current = null;
    };
  }, [sessionId, onCameraReady]);

  // ==================== EVENT LISTENERS ====================
  useEffect(() => {
    const cleanups: Array<() => void> = [];

    // 1. Deteksi keluar fullscreen
    const onFsChange = () => {
      if (!lockedRef.current && !isFullscreen()) {
        reportViolation("fullscreen_exit");
      }
    };
    document.addEventListener("fullscreenchange", onFsChange);
    document.addEventListener("webkitfullscreenchange", onFsChange as any);
    cleanups.push(() => {
      document.removeEventListener("fullscreenchange", onFsChange);
      document.removeEventListener("webkitfullscreenchange", onFsChange as any);
    });

    // 2. Deteksi pindah tab / minimize
    const onVisibility = () => {
      if (document.visibilityState === "hidden" && !lockedRef.current) {
        reportViolation("tab_switch");
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    cleanups.push(() => document.removeEventListener("visibilitychange", onVisibility));

    // 3. Deteksi window blur
    const onBlur = () => {
      if (!lockedRef.current) {
        reportViolation("window_blur");
      }
    };
    window.addEventListener("blur", onBlur);
    cleanups.push(() => window.removeEventListener("blur", onBlur));

    // 4. Lock navigasi, shortcut, context menu, copy-paste
    cleanups.push(lockNavigation(reportViolation));
    cleanups.push(blockShortcuts(reportViolation));
    cleanups.push(blockContextMenu());
    cleanups.push(blockCopyPaste());
    cleanups.push(preventUnload());

    // 5. Heartbeat ke server tiap 5 detik
    const hb = setInterval(() => {
      fetch("/api/heartbeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      }).catch(() => {});
    }, 5000);
    cleanups.push(() => clearInterval(hb));

    return () => cleanups.forEach((fn) => fn());
  }, [reportViolation, sessionId]);

  // ==================== RENDER ====================
  return (
    <div
      className="min-h-screen bg-ivory text-charcoal"
      style={{
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
    >
      {/* Header status */}
      <div className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-white/90 px-6 py-3 backdrop-blur">
        <div className="text-sm text-muted">
          Sesi:{" "}
          <span className="font-mono text-charcoal">
            {sessionId.slice(0, 8)}…
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-xs text-muted">
            📸 {photosSent} foto
          </div>
          <div className="text-sm">
            Pelanggaran:{" "}
            <span
              className={
                violations === 0
                  ? "text-success-text font-semibold"
                  : violations === 1
                  ? "text-warning-text font-semibold"
                  : "text-danger font-semibold"
              }
            >
              {violations}/{MAX_VIOLATIONS}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${
                cameraReady ? "bg-[#166534] animate-pulse" : "bg-border"
              }`}
            />
            <span className="text-xs text-muted">
              {cameraReady ? "REC" : "OFF"}
            </span>
          </div>
        </div>
      </div>

      {/* Warning banner */}
      {warning && (
        <div className="border-b border-danger-border bg-danger-bg px-6 py-3 text-center text-sm font-medium text-danger">
          ⚠️ {warning}
        </div>
      )}

      {/* Konten soal */}
      <div className={locked ? "pointer-events-none opacity-30" : ""}>
        {children}
      </div>

      {/* Preview kamera */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className={`fixed bottom-5 right-5 z-[9999] h-[120px] w-[160px] rounded-2xl border-2 border-blue bg-charcoal object-cover shadow-[0_4px_24px_0_rgba(8,124,240,0.2)] ${
          cameraReady ? "" : "hidden"
        }`}
      />

      {/* Overlay saat terkunci */}
      {locked && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-charcoal/95">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-danger">
              TERDISKUALIFIKASI
            </h1>
            <p className="mt-3 text-white/70">
              Terlalu banyak pelanggaran ({violations}/{MAX_VIOLATIONS}).
            </p>
            <p className="mt-1 text-sm text-white/50">
              Mengalihkan ke halaman hasil…
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
