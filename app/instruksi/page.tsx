"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Instruksi() {
  const router = useRouter();
  const [consent, setConsent] = useState(false);

  async function mulai() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(t => t.stop());
      router.push("/tes");
    } catch {
      alert("Akses kamera wajib diizinkan untuk mengikuti tes ini.");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-ivory p-6">
      <div className="w-full max-w-md rounded-[20px] bg-white p-8 shadow-[0_2px_16px_0_rgba(32,37,36,0.06)]">
        <h1 className="text-2xl font-bold text-charcoal">Instruksi</h1>
        <p className="mt-1 text-sm text-muted">Baca sebelum memulai tes.</p>

        <ul className="mt-5 space-y-2.5 text-sm text-charcoal">
          {[
            "15 soal pilihan ganda.",
            "Durasi 10 menit, timer otomatis.",
            "Kamera wajib aktif selama tes.",
            "Keluar fullscreen dihitung pelanggaran.",
            "Pindah tab dihitung pelanggaran.",
            "Maksimal 3 pelanggaran sebelum diskualifikasi.",
          ].map((rule, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue text-[11px] font-bold text-white">
                {i + 1}
              </span>
              <span className="text-charcoal">{rule}</span>
            </li>
          ))}
        </ul>

        <label className="mt-6 flex cursor-pointer items-start gap-3 text-sm text-charcoal">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-blue"
          />
          <span className="text-muted">
            Saya menyetujui kamera aktif dan foto diambil setiap detik selama tes.
          </span>
        </label>

        <button
          disabled={!consent}
          onClick={mulai}
          className="mt-5 w-full rounded-xl bg-blue py-3 text-sm font-semibold text-white transition-colors disabled:bg-border disabled:text-muted disabled:shadow-none hover:enabled:bg-accent-hover"
        >
          Aktifkan Kamera & Mulai Tes
        </button>
      </div>
    </main>
  );
}
