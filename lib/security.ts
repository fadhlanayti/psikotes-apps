// lib/security.ts
"use client";

// ==================== KONSTANTA ====================
export const MAX_VIOLATIONS = 3;

export type ViolationType =
  | "tab_switch"
  | "fullscreen_exit"
  | "window_blur"
  | "copy_attempt"
  | "devtools_attempt"
  | "back_attempt"
  | "refresh_attempt";

export interface Violation {
  type: ViolationType;
  timestamp: number;
}

export const VIOLATION_LABELS: Record<ViolationType, string> = {
  tab_switch: "Berpindah tab / minimize window",
  fullscreen_exit: "Keluar dari mode fullscreen",
  window_blur: "Kehilangan fokus window",
  copy_attempt: "Percobaan copy/paste/cut",
  devtools_attempt: "Percobaan membuka DevTools",
  back_attempt: "Percobaan navigasi mundur",
  refresh_attempt: "Percobaan refresh halaman",
};

// ==================== FULLSCREEN ====================
export async function enterFullscreen(el: HTMLElement = document.documentElement): Promise<void> {
  if (el.requestFullscreen) {
    return el.requestFullscreen();
  }
  // @ts-ignore
  if (el.webkitRequestFullscreen) {
    // @ts-ignore
    return el.webkitRequestFullscreen();
  }
  // @ts-ignore
  if (el.msRequestFullscreen) {
    // @ts-ignore
    return el.msRequestFullscreen();
  }
  throw new Error("Fullscreen API tidak didukung browser ini");
}

export function isFullscreen(): boolean {
  return !!(
    document.fullscreenElement ||
    // @ts-ignore
    document.webkitFullscreenElement ||
    // @ts-ignore
    document.msFullscreenElement
  );
}

export async function exitFullscreen(): Promise<void> {
  if (!isFullscreen()) return;
  if (document.exitFullscreen) {
    return document.exitFullscreen();
  }
  // @ts-ignore
  if (document.webkitExitFullscreen) {
    // @ts-ignore
    return document.webkitExitFullscreen();
  }
  // @ts-ignore
  if (document.msExitFullscreen) {
    // @ts-ignore
    return document.msExitFullscreen();
  }
}

// ==================== NAVIGATION LOCK ====================
/**
 * Mencegah user menekan tombol back browser untuk keluar dari tes.
 * Cara kerja: dorong state dummy ke history, lalu saat user menekan back,
 * kita dorong lagi state dummy tersebut.
 */
export function lockNavigation(onViolation: (v: ViolationType) => void): () => void {
  history.pushState(null, "", location.href);

  const onPop = () => {
    history.pushState(null, "", location.href);
    onViolation("back_attempt");
  };

  window.addEventListener("popstate", onPop);
  return () => window.removeEventListener("popstate", onPop);
}

// ==================== KEYBOARD SHORTCUTS LOCK ====================
/**
 * Blokir shortcut berbahaya:
 * - Ctrl/Cmd + C, V, X, A, P, S, U  → copy/paste/print/save/view-source
 * - Ctrl/Cmd + W, N, T             → close/new window/tab
 * - Ctrl/Cmd + R                   → refresh
 * - F12                            → DevTools
 * - Ctrl/Cmd + Shift + I/J/C       → DevTools
 */
export function blockShortcuts(onViolation: (v: ViolationType) => void): () => void {
  const handler = (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    const ctrl = e.ctrlKey || e.metaKey;

    // F12 → DevTools
    if (e.key === "F12") {
      e.preventDefault();
      e.stopPropagation();
      onViolation("devtools_attempt");
      return;
    }

    // Ctrl+Shift+I/J/C → DevTools
    if (ctrl && e.shiftKey && ["i", "j", "c"].includes(key)) {
      e.preventDefault();
      e.stopPropagation();
      onViolation("devtools_attempt");
      return;
    }

    // Ctrl+U → view source
    if (ctrl && key === "u") {
      e.preventDefault();
      e.stopPropagation();
      onViolation("devtools_attempt");
      return;
    }

    // Ctrl+C/V/X/A/P/S → copy, paste, cut, select all, print, save
    if (ctrl && ["c", "v", "x", "a", "p", "s"].includes(key)) {
      e.preventDefault();
      e.stopPropagation();
      onViolation("copy_attempt");
      return;
    }

    // Ctrl+R → refresh
    if (ctrl && key === "r") {
      e.preventDefault();
      e.stopPropagation();
      onViolation("refresh_attempt");
      return;
    }

    // Ctrl+W/N/T → close, new window, new tab
    if (ctrl && ["w", "n", "t"].includes(key)) {
      e.preventDefault();
      e.stopPropagation();
      onViolation("back_attempt");
      return;
    }
  };

  window.addEventListener("keydown", handler, { capture: true });
  return () => window.removeEventListener("keydown", handler, { capture: true } as any);
}

// ==================== CONTEXT MENU ====================
export function blockContextMenu(): () => void {
  const handler = (e: MouseEvent) => e.preventDefault();
  window.addEventListener("contextmenu", handler);
  return () => window.removeEventListener("contextmenu", handler);
}

// ==================== COPY / PASTE / DRAG ====================
export function blockCopyPaste(): () => void {
  const prevent = (e: Event) => e.preventDefault();
  const events = ["copy", "cut", "paste", "dragstart", "selectstart"];

  events.forEach((ev) => document.addEventListener(ev, prevent));
  return () => events.forEach((ev) => document.removeEventListener(ev, prevent));
}

// ==================== UNLOAD PREVENTION ====================
/**
 * Cegah user menutup / refresh tab saat tes aktif.
 * Browser akan menampilkan dialog konfirmasi native.
 */
export function preventUnload(): () => void {
  const handler = (e: BeforeUnloadEvent) => {
    e.preventDefault();
    e.returnValue = "";
    return "";
  };

  window.addEventListener("beforeunload", handler);
  return () => window.removeEventListener("beforeunload", handler);
}

// ==================== CAMERA HELPERS ====================
export async function requestCamera(): Promise<MediaStream> {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error("Browser tidak mendukung akses kamera");
  }

  return navigator.mediaDevices.getUserMedia({
    video: {
      width: { ideal: 320 },
      height: { ideal: 240 },
      facingMode: "user",
    },
    audio: false,
  });
}

export function stopCamera(stream: MediaStream | null): void {
  if (!stream) return;
  stream.getTracks().forEach((track) => track.stop());
}

/**
 * Capture frame dari video element ke canvas, kembalikan sebagai Blob (JPEG).
 */
export async function captureFrame(
  video: HTMLVideoElement,
  width = 320,
  height = 240,
  quality = 0.6
): Promise<Blob | null> {
  if (!video || video.readyState < 2) return null;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.drawImage(video, 0, 0, width, height);

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob),
      "image/jpeg",
      quality
    );
  });
}

// ==================== VISIBILITY HELPERS ====================
export function isHidden(): boolean {
  return document.visibilityState === "hidden";
}

// ==================== DEVTOOLS DETECTION (opsional) ====================
/**
 * Deteksi sederhana apakah DevTools terbuka dengan membandingkan
 * ukuran window dan viewport.
 */
export function isDevToolsOpen(): boolean {
  const threshold = 160;
  const widthDiff = window.outerWidth - window.innerWidth;
  const heightDiff = window.outerHeight - window.innerHeight;
  return widthDiff > threshold || heightDiff > threshold;
}