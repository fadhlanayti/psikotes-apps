// app/page.tsx
"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900/80 p-10 shadow-2xl backdrop-blur text-slate-100">
        {/* Badge */}
        <span className="inline-flex items-center gap-2 rounded-full bg-indigo-950 px-4 py-1.5 text-xs font-semibold text-indigo-300 ring-1 ring-indigo-800">
          🔒 Secure Mode
        </span>

        {/* Judul */}
        <h1 className="mt-5 text-3xl font-bold tracking-tight">
          Tes Logika Dasar
        </h1>
        <p className="mt-3 text-slate-400 leading-relaxed">
          Ukur kemampuan penalaran logis Anda dalam 5 menit. Tes ini dipantau
          dengan <b className="text-slate-200">kamera</b> dan{" "}
          <b className="text-slate-200">fullscreen lock</b>.
        </p>

        {/* Info grid */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
            <div className="text-xs text-slate-500">Jumlah Soal</div>
            <div className="mt-1 text-xl font-bold text-slate-100">10 Soal</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
            <div className="text-xs text-slate-500">Durasi</div>
            <div className="mt-1 text-xl font-bold text-slate-100">5 Menit</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
            <div className="text-xs text-slate-500">Proctoring</div>
            <div className="mt-1 text-sm font-bold text-slate-100">
              📸 Kamera + Layar
            </div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
            <div className="text-xs text-slate-500">Pelanggaran</div>
            <div className="mt-1 text-sm font-bold text-red-400">
              Maks 3×
            </div>
          </div>
        </div>

        {/* Info tambahan */}
        <div className="mt-6 rounded-xl border border-amber-900/50 bg-amber-950/30 p-4 text-sm text-amber-200">
          <b>⚠️ Perhatian:</b> Jangan keluar dari fullscreen, jangan pindah tab,
          dan jangan tutup browser selama tes berlangsung.
        </div>

        {/* CTA */}
        <button
          onClick={() => router.push("/instruksi")}
          className="mt-6 w-full rounded-xl bg-indigo-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-indigo-900/50 transition-all hover:bg-indigo-500 active:scale-[0.99]"
        >
          Mulai Tes →
        </button>

        {/* Footer */}
        <p className="mt-5 text-center text-xs text-slate-600">
          Dummy MVP · Data tidak disimpan ke server
        </p>
      </div>
    </main>
  );
}