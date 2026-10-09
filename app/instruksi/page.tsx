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
    <main className="flex min-h-screen items-center justify-center bg-ivory p-6">
      <div className="w-full max-w-2xl rounded-[20px] border border-border bg-white p-8 shadow-[0_4px_24px_0_rgba(32,37,36,0.08)]">
        <h1 className="text-2xl font-bold text-charcoal">📋 Instruksi & Persetujuan</h1>

        <div className="mt-6 space-y-2 rounded-2xl border-l-4 border-blue bg-ivory p-5 text-sm text-muted">
          <p>1. Tes terdiri dari <b className="text-charcoal">10 soal</b> pilihan ganda.</p>
          <p>2. Durasi <b className="text-charcoal">5 menit</b>, timer otomatis.</p>
          <p>3. <b className="text-charcoal">Kamera wajib aktif</b> selama tes.</p>
          <p>4. <b className="text-charcoal">Fullscreen wajib</b> — keluar = pelanggaran.</p>
          <p>5. <b className="text-charcoal">Pindah tab</b> = pelanggaran.</p>
          <p>6. Maksimal <b className="text-charcoal">3 pelanggaran</b> → diskualifikasi.</p>
        </div>

        <label className="mt-6 flex cursor-pointer items-start gap-3 text-sm text-charcoal">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-1 h-4 w-4 accent-blue"
          />
          <span>
            Saya menyetujui kamera saya aktif dan foto diambil setiap detik selama tes berlangsung.
          </span>
        </label>

        <button
          disabled={!consent}
          onClick={mulai}
          className="mt-6 w-full rounded-2xl bg-blue py-3 font-semibold text-white shadow-[0_2px_12px_0_rgba(8,124,240,0.25)] transition-all disabled:bg-border disabled:text-muted disabled:shadow-none hover:enabled:bg-accent-hover"
        >
          Aktifkan Kamera & Mulai Tes →
        </button>
      </div>
    </main>
  );
}
