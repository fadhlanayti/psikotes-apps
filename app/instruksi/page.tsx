"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Instruksi() {
  const router = useRouter();
  const [consent, setConsent] = useState(false);

  async function mulai() {
    // Minta izin kamera dulu
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(t => t.stop()); // stop dulu, nanti dinyalakan di /tes
      router.push("/tes");
    } catch {
      alert("❌ Akses kamera wajib diizinkan untuk mengikuti tes ini.");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-8 text-slate-100">
        <h1 className="text-2xl font-bold">📋 Instruksi & Persetujuan</h1>

        <div className="mt-6 space-y-2 rounded-lg border-l-4 border-indigo-500 bg-slate-950 p-5 text-sm text-slate-300">
          <p>1. Tes terdiri dari <b>10 soal</b> pilihan ganda.</p>
          <p>2. Durasi <b>5 menit</b>, timer otomatis.</p>
          <p>3. <b>Kamera wajib aktif</b> selama tes.</p>
          <p>4. <b>Fullscreen wajib</b> — keluar = pelanggaran.</p>
          <p>5. <b>Pindah tab</b> = pelanggaran.</p>
          <p>6. Maksimal <b>3 pelanggaran</b> → diskualifikasi.</p>
        </div>

        <label className="mt-6 flex cursor-pointer items-start gap-3 text-sm">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-1 h-4 w-4 accent-indigo-600"
          />
          <span>
            Saya menyetujui kamera saya aktif dan foto diambil setiap detik selama tes berlangsung.
          </span>
        </label>

        <button
          disabled={!consent}
          onClick={mulai}
          className="mt-6 w-full rounded-lg bg-indigo-600 py-3 font-semibold text-white disabled:bg-slate-700 disabled:text-slate-500 hover:enabled:bg-indigo-500"
        >
          Aktifkan Kamera & Mulai Tes →
        </button>
      </div>
    </main>
  );
}