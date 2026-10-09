// app/page.tsx
"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen items-center justify-center bg-ivory p-6">
      <div className="w-full max-w-md rounded-[20px] bg-white p-8 shadow-[0_2px_16px_0_rgba(32,37,36,0.06)]">

        <h1 className="text-2xl font-bold text-charcoal">Tes Logika Dasar</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          15 soal pilihan ganda, 10 menit. Dipantau dengan kamera dan fullscreen lock.
        </p>

        <div className="mt-6 flex gap-3">
          <div className="flex-1 rounded-xl bg-ivory px-4 py-3 text-center">
            <div className="text-2xl font-bold text-charcoal">15</div>
            <div className="text-xs text-muted">Soal</div>
          </div>
          <div className="flex-1 rounded-xl bg-ivory px-4 py-3 text-center">
            <div className="text-2xl font-bold text-charcoal">10:00</div>
            <div className="text-xs text-muted">Menit</div>
          </div>
          <div className="flex-1 rounded-xl bg-ivory px-4 py-3 text-center">
            <div className="text-2xl font-bold text-danger">3</div>
            <div className="text-xs text-muted">Maks. Pelanggaran</div>
          </div>
        </div>

        <p className="mt-5 text-xs leading-relaxed text-muted">
          Jangan keluar fullscreen, pindah tab, atau tutup browser selama tes.
        </p>

        <button
          onClick={() => router.push("/instruksi")}
          className="mt-5 w-full rounded-xl bg-blue py-3.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover active:scale-[0.99]"
        >
          Mulai Tes
        </button>

        <p className="mt-4 text-center text-[11px] text-muted">
          Dummy MVP, data tidak disimpan ke server
        </p>
      </div>
    </main>
  );
}
