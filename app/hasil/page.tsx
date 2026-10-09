"use client";

import { useRouter } from "next/navigation";

export default function Hasil() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen items-center justify-center bg-ivory p-6">
      <div className="w-full max-w-lg rounded-[20px] border border-border bg-white p-10 text-center shadow-[0_4px_24px_0_rgba(32,37,36,0.08)]">
        <span className="inline-block rounded-full bg-success-bg px-4 py-1 text-xs font-semibold text-success-text border border-success-border">
          ✅ Tes Selesai
        </span>
        <h1 className="mt-4 text-2xl font-bold text-charcoal">Hasil Anda</h1>

        <div className="mt-8">
          <div className="text-7xl font-extrabold text-blue">
            —
          </div>
          <p className="mt-2 text-sm text-muted">Skor dari 100</p>
        </div>

        <p className="mt-6 text-sm text-muted">
          Halaman hasil dummy. Nanti diisi skor dari API.
        </p>

        <button
          onClick={() => router.push("/")}
          className="mt-6 w-full rounded-2xl bg-ivory border border-border py-3 font-semibold text-charcoal hover:bg-border transition-colors"
        >
          ← Kembali ke Beranda
        </button>
      </div>
    </main>
  );
}
