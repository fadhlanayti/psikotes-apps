"use client";

import { useRouter } from "next/navigation";

export default function Hasil() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center text-slate-100">
        <span className="inline-block rounded-full bg-emerald-900 px-4 py-1 text-xs font-semibold text-emerald-200">
          ✅ Tes Selesai
        </span>
        <h1 className="mt-4 text-2xl font-bold">Hasil Anda</h1>

        <div className="mt-8">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-7xl font-extrabold text-transparent">
            —
          </div>
          <p className="mt-2 text-sm text-slate-400">Skor dari 100</p>
        </div>

        <p className="mt-6 text-sm text-slate-400">
          Halaman hasil dummy. Nanti diisi skor dari API.
        </p>

        <button
          onClick={() => router.push("/")}
          className="mt-6 w-full rounded-lg bg-slate-700 py-3 font-semibold text-white hover:bg-slate-600"
        >
          ← Kembali ke Beranda
        </button>
      </div>
    </main>
  );
}