// app/page.tsx
"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen items-center justify-center bg-ivory p-6">
      <div className="w-full max-w-lg rounded-[20px] border border-border bg-white p-10 shadow-[0_4px_24px_0_rgba(32,37,36,0.08)]">
        {/* Badge */}
        <span className="inline-flex items-center gap-2 rounded-full bg-mint-soft px-4 py-1.5 text-xs font-semibold text-charcoal ring-1 ring-mint">
          🔒 Secure Mode
        </span>

        {/* Judul */}
        <h1 className="mt-5 text-3xl font-bold tracking-tight text-charcoal">
          Tes Logika Dasar
        </h1>
        <p className="mt-3 leading-relaxed text-muted">
          Ukur kemampuan penalaran logis Anda dalam 5 menit. Tes ini dipantau
          dengan <b className="text-charcoal font-semibold">kamera</b> dan{" "}
          <b className="text-charcoal font-semibold">fullscreen lock</b>.
        </p>

        {/* Info grid */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-border bg-ivory p-4">
            <div className="text-xs text-muted">Jumlah Soal</div>
            <div className="mt-1 text-xl font-bold text-charcoal">10 Soal</div>
          </div>
          <div className="rounded-2xl border border-border bg-ivory p-4">
            <div className="text-xs text-muted">Durasi</div>
            <div className="mt-1 text-xl font-bold text-charcoal">5 Menit</div>
          </div>
          <div className="rounded-2xl border border-border bg-ivory p-4">
            <div className="text-xs text-muted">Proctoring</div>
            <div className="mt-1 text-sm font-bold text-charcoal">
              📸 Kamera + Layar
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-ivory p-4">
            <div className="text-xs text-muted">Pelanggaran</div>
            <div className="mt-1 text-sm font-bold text-danger">
              Maks 3×
            </div>
          </div>
        </div>

        {/* Info tambahan */}
        <div className="mt-6 rounded-2xl border border-warning-border bg-warning-bg p-4 text-sm text-warning-text">
          <b>⚠️ Perhatian:</b> Jangan keluar dari fullscreen, jangan pindah tab,
          dan jangan tutup browser selama tes berlangsung.
        </div>

        {/* CTA */}
        <button
          onClick={() => router.push("/instruksi")}
          className="mt-6 w-full rounded-2xl bg-blue px-6 py-3.5 font-semibold text-white shadow-[0_2px_12px_0_rgba(8,124,240,0.25)] transition-all hover:bg-accent-hover active:scale-[0.99]"
        >
          Mulai Tes →
        </button>

        {/* Footer */}
        <p className="mt-5 text-center text-xs text-muted">
          Dummy MVP · Data tidak disimpan ke server
        </p>
      </div>
    </main>
  );
}
