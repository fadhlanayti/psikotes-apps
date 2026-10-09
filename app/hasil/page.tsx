"use client";

import { useRouter } from "next/navigation";

export default function Hasil() {
  const router = useRouter();

  // ponytail: dummy score, nanti dari API
  const score = 0;
  const total = 15;

  return (
    <main className="flex min-h-screen items-center justify-center bg-ivory p-6">
      <div className="w-full max-w-sm rounded-[20px] bg-white p-8 text-center shadow-[0_2px_16px_0_rgba(32,37,36,0.06)]">
        <p className="text-sm font-medium text-muted">Tes selesai</p>
        <h1 className="mt-1 text-2xl font-bold text-charcoal">Hasil Anda</h1>

        <div className="mx-auto mt-8 flex h-32 w-32 items-center justify-center rounded-full bg-ivory">
          <div>
            <div className="text-4xl font-bold text-blue">{score}/{total}</div>
            <div className="mt-1 text-xs text-muted">Jawaban benar</div>
          </div>
        </div>

        <p className="mt-6 text-sm text-muted">
          Skor belum tersedia. Nanti diisi dari API.
        </p>

        <button
          onClick={() => router.push("/")}
          className="mt-6 w-full rounded-xl bg-blue py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
        >
          Kembali ke Beranda
        </button>
      </div>
    </main>
  );
}
