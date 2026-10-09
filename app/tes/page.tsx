// app/tes/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import LockedExam from "@/components/LockedExam";

// ==================== DATA SOAL ====================
const QUESTIONS = [
  {
    id: 1,
    q: "Lanjutkan pola berikut: 2, 4, 8, 16, ...",
    options: ["20", "24", "32", "36"],
    answer: 2,
  },
  {
    id: 2,
    q: "Jika A > B dan B > C, maka...",
    options: ["A < C", "A = C", "A > C", "Tidak dapat ditentukan"],
    answer: 2,
  },
  {
    id: 3,
    q: "Lanjutkan pola: 1, 4, 9, 16, ...",
    options: ["20", "25", "30", "36"],
    answer: 1,
  },
  {
    id: 4,
    q: "Semua kucing adalah hewan. Semua hewan butuh makan. Maka...",
    options: [
      "Semua kucing butuh makan",
      "Semua hewan adalah kucing",
      "Sebagian kucing tidak butuh makan",
      "Tidak dapat disimpulkan",
    ],
    answer: 0,
  },
  {
    id: 5,
    q: "Lanjutkan pola: 3, 6, 12, 24, ...",
    options: ["30", "36", "48", "52"],
    answer: 2,
  },
  {
    id: 6,
    q: "Jika hari ini Rabu, 3 hari lagi hari apa?",
    options: ["Jumat", "Sabtu", "Minggu", "Senin"],
    answer: 1,
  },
  {
    id: 7,
    q: "Lanjutkan pola: 5, 10, 20, 40, ...",
    options: ["60", "70", "80", "100"],
    answer: 2,
  },
  {
    id: 8,
    q: "Andi lebih tinggi dari Budi. Budi lebih tinggi dari Cici. Siapa paling pendek?",
    options: ["Andi", "Budi", "Cici", "Tidak dapat ditentukan"],
    answer: 2,
  },
  {
    id: 9,
    q: "Lanjutkan pola: 100, 90, 81, 73, ...",
    options: ["65", "66", "67", "68"],
    answer: 1,
  },
  {
    id: 10,
    q: "Jika 5 mesin membuat 5 produk dalam 5 menit, berapa menit 100 mesin membuat 100 produk?",
    options: ["5 menit", "20 menit", "100 menit", "1 menit"],
    answer: 0,
  },
];

const TEST_DURATION_SECONDS = 300; // 5 menit

// ==================== KOMPONEN ====================
export default function TesPage() {
  const router = useRouter();

  const [sessionId, setSessionId] = useState<string>("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [secondsLeft, setSecondsLeft] = useState(TEST_DURATION_SECONDS);
  const [submitted, setSubmitted] = useState(false);
  const [starting, setStarting] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ==================== START SESSION ====================
  useEffect(() => {
    let cancelled = false;

    async function startSession() {
      try {
        const res = await fetch("/api/start", { method: "POST" });
        if (!res.ok) throw new Error("Gagal memulai sesi");
        const data = await res.json();
        if (!cancelled) {
          setSessionId(data.sessionId);
          setStarting(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError("Tidak dapat memulai sesi tes. Coba muat ulang halaman.");
          setStarting(false);
        }
      }
    }

    startSession();
    return () => {
      cancelled = true;
    };
  }, []);

  // ==================== SUBMIT ====================
  const handleSubmit = useCallback(
    async (forced = false) => {
      if (submitted) return;
      setSubmitted(true);

      try {
        await fetch("/api/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            answers,
            forced,
            submittedAt: Date.now(),
          }),
        });

        // Simpan hasil di sessionStorage untuk halaman /hasil
        sessionStorage.setItem(
          "psikotes_result",
          JSON.stringify({
            sessionId,
            answers,
            questions: QUESTIONS.map((q) => ({ id: q.id, answer: q.answer })),
            forced,
          })
        );
      } catch {
        // silent
      }

      router.replace("/hasil");
    },
    [sessionId, answers, submitted, router]
  );

  // ==================== TIMER ====================
  useEffect(() => {
    if (!sessionId || submitted) return;

    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          handleSubmit(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(t);
  }, [sessionId, submitted, handleSubmit]);

  // ==================== NAVIGASI SOAL ====================
  function selectOption(optIndex: number) {
    setAnswers((prev) => ({ ...prev, [currentIndex]: optIndex }));
  }

  function nextQuestion() {
    if (answers[currentIndex] === undefined) return;
    if (currentIndex < QUESTIONS.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      handleSubmit(false);
    }
  }

  function prevQuestion() {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  }

  // ==================== LOADING / ERROR ====================
  if (starting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300">
        <div className="text-center">
          <div className="mb-4 h-10 w-10 animate-spin rounded-full border-2 border-slate-700 border-t-indigo-500 mx-auto" />
          <p>Menyiapkan sesi tes…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-slate-300">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-red-400">Terjadi Kesalahan</h1>
          <p className="mt-3 text-slate-400">{error}</p>
          <button
            onClick={() => location.reload()}
            className="mt-6 rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-500"
          >
            Muat Ulang
          </button>
        </div>
      </div>
    );
  }

  if (!sessionId) return null;

  // ==================== RENDER SOAL ====================
  const q = QUESTIONS[currentIndex];
  const isAnswered = answers[currentIndex] !== undefined;
  const isLast = currentIndex === QUESTIONS.length - 1;
  const progress = ((currentIndex + 1) / QUESTIONS.length) * 100;

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");
  const timeWarning = secondsLeft <= 60;

  return (
    <LockedExam sessionId={sessionId}>
      <div className="mx-auto max-w-3xl px-6 py-10">
        {/* Progress bar */}
        <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Timer + nomor soal */}
        <div className="mb-8 flex items-center justify-between">
          <div className="text-sm text-slate-400">
            Soal{" "}
            <span className="font-bold text-slate-200">{currentIndex + 1}</span>{" "}
            / {QUESTIONS.length}
          </div>
          <div
            className={`rounded-lg px-4 py-2 font-mono text-lg font-bold transition-colors ${
              timeWarning
                ? "bg-red-900/50 text-red-300 animate-pulse"
                : "bg-slate-800 text-indigo-300"
            }`}
          >
            ⏱ {mm}:{ss}
          </div>
        </div>

        {/* Soal */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold leading-relaxed text-slate-100">
            {q.q}
          </h2>
        </div>

        {/* Pilihan */}
        <div className="space-y-3">
          {q.options.map((opt, i) => {
            const selected = answers[currentIndex] === i;
            return (
              <button
                key={i}
                onClick={() => selectOption(i)}
                className={`w-full rounded-xl border-2 px-5 py-4 text-left transition-all ${
                  selected
                    ? "border-indigo-500 bg-indigo-950/50 text-indigo-100"
                    : "border-slate-800 bg-slate-900 text-slate-300 hover:border-indigo-700 hover:bg-slate-800/50"
                }`}
              >
                <span
                  className={`mr-3 inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${
                    selected
                      ? "bg-indigo-500 text-white"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {String.fromCharCode(65 + i)}
                </span>
                {opt}
              </button>
            );
          })}
        </div>

        {/* Navigasi */}
        <div className="mt-8 flex gap-3">
          <button
            onClick={prevQuestion}
            disabled={currentIndex === 0}
            className="rounded-lg bg-slate-800 px-6 py-3 font-semibold text-slate-300 transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ← Sebelumnya
          </button>

          <button
            onClick={nextQuestion}
            disabled={!isAnswered}
            className="flex-1 rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500"
          >
            {!isAnswered
              ? "Pilih Jawaban Dulu"
              : isLast
              ? "Selesai & Lihat Hasil"
              : "Lanjut →"}
          </button>
        </div>

        {/* Info */}
        <p className="mt-6 text-center text-xs text-slate-600">
          🔒 Mode aman aktif — kamera merekam & tab terkunci
        </p>
      </div>
    </LockedExam>
  );
}