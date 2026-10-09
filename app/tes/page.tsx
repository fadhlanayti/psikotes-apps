// app/tes/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import LockedExam from "@/components/LockedExam";

// ==================== DATA SOAL ====================
const QUESTIONS = [
  {
    id: 1,
    q: "Lanjutkan deret: 2, 6, 18, 54, ...",
    options: ["108", "162", "148", "172"],
    answer: 1,
  },
  {
    id: 2,
    q: "Semua dokter adalah lulusan universitas. Andi adalah lulusan universitas. Maka...",
    options: [
      "Andi pasti seorang dokter",
      "Andi mungkin seorang dokter",
      "Andi bukan dokter",
      "Tidak ada hubungan",
    ],
    answer: 1,
  },
  {
    id: 3,
    q: "Lanjutkan deret: 1, 1, 2, 3, 5, 8, ...",
    options: ["11", "12", "13", "14"],
    answer: 2,
  },
  {
    id: 4,
    q: "Jika KUCING = 11, ANJING = 12, maka KELINCI = ?",
    options: ["13", "14", "15", "7"],
    answer: 1,
  },
  {
    id: 5,
    q: "Seorang pria menunjuk foto dan berkata: 'Ayah dari orang itu adalah anak dari ayah saya.' Siapakah orang di foto itu?",
    options: [
      "Dirinya sendiri",
      "Ayahnya",
      "Kakeknya",
      "Anaknya",
    ],
    answer: 3,
  },
  {
    id: 6,
    q: "Lanjutkan deret: 4, 9, 16, 25, ...",
    options: ["30", "36", "49", "64"],
    answer: 1,
  },
  {
    id: 7,
    q: "Panas : Dingin = Tinggi : ?",
    options: ["Besar", "Pendek", "Kecil", "Lebar"],
    answer: 1,
  },
  {
    id: 8,
    q: "Dari 5 orang (P, Q, R, S, T): P lebih tua dari Q, R lebih muda dari Q, S lebih tua dari P, T lebih muda dari R. Siapa yang paling muda?",
    options: ["Q", "R", "T", "P"],
    answer: 2,
  },
  {
    id: 9,
    q: "Jika hari ini Kamis, 45 hari lagi hari apa?",
    options: ["Senin", "Selasa", "Rabu", "Jumat"],
    answer: 2,
  },
  {
    id: 10,
    q: "Sebuah jam menunjukkan pukul 15:00. Berapa derajat sudut antara jarum jam dan jarum menit?",
    options: ["60", "90", "120", "180"],
    answer: 1,
  },
  {
    id: 11,
    q: "Lanjutkan deret: 3, 7, 15, 31, ...",
    options: ["47", "55", "63", "59"],
    answer: 2,
  },
  {
    id: 12,
    q: "Tidak semua burung bisa terbang. Penguin adalah burung. Maka...",
    options: [
      "Penguin pasti bisa terbang",
      "Penguin tidak bisa terbang",
      "Penguin belum tentu bisa terbang",
      "Tidak dapat disimpulkan",
    ],
    answer: 2,
  },
  {
    id: 13,
    q: "Jika A = 1, B = 2, C = 3, dst. Maka BACA = ?",
    options: ["6", "7", "8", "9"],
    answer: 1,
  },
  {
    id: 14,
    q: "Sebuah tali dilipat menjadi 4 lalu dipotong di tengah. Berapa banyak potongan tali yang dihasilkan?",
    options: ["4", "5", "8", "9"],
    answer: 1,
  },
  {
    id: 15,
    q: "Rudi berlari lebih cepat dari Susi. Toni berlari lebih lambat dari Susi tapi lebih cepat dari Budi. Siapa yang paling lambat?",
    options: ["Rudi", "Susi", "Toni", "Budi"],
    answer: 3,
  },
];

const TEST_DURATION_SECONDS = 600; // 10 menit untuk 15 soal

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
      <div className="flex min-h-screen items-center justify-center bg-ivory text-muted">
        <div className="text-center">
          <div className="mb-4 h-10 w-10 animate-spin rounded-full border-2 border-border border-t-blue mx-auto" />
          <p>Menyiapkan sesi tes…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ivory p-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-danger">Terjadi Kesalahan</h1>
          <p className="mt-3 text-muted">{error}</p>
          <button
            onClick={() => location.reload()}
            className="mt-6 rounded-2xl bg-blue px-6 py-3 font-semibold text-white hover:bg-accent-hover"
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
      <div className="mx-auto max-w-xl px-6 py-10">
        {/* Progress */}
        <div className="mb-1 flex items-center justify-between text-xs text-muted">
          <span>Soal {currentIndex + 1} dari {QUESTIONS.length}</span>
          <span
            className={`font-mono font-semibold ${timeWarning ? "text-danger animate-pulse" : "text-charcoal"}`}
          >
            {mm}:{ss}
          </span>
        </div>
        <div className="mb-8 h-1 w-full overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-blue transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Soal */}
        <h2 className="mb-6 text-lg font-semibold leading-relaxed text-charcoal">
          {q.q}
        </h2>

        {/* Pilihan */}
        <div className="space-y-2.5">
          {q.options.map((opt, i) => {
            const selected = answers[currentIndex] === i;
            return (
              <button
                key={i}
                onClick={() => selectOption(i)}
                className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left text-sm transition-all ${
                  selected
                    ? "border-blue bg-[#EBF4FF] text-charcoal"
                    : "border-border bg-white text-charcoal hover:border-blue/40 hover:bg-ivory"
                }`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    selected ? "bg-blue text-white" : "bg-ivory text-muted"
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
        <div className="mt-6 flex gap-2">
          <button
            onClick={prevQuestion}
            disabled={currentIndex === 0}
            className="rounded-xl border border-border bg-white px-5 py-3 text-sm font-semibold text-charcoal transition-colors hover:bg-ivory disabled:cursor-not-allowed disabled:opacity-40"
          >
            Sebelumnya
          </button>

          <button
            onClick={nextQuestion}
            disabled={!isAnswered}
            className="flex-1 rounded-xl bg-blue py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:bg-border disabled:text-muted"
          >
            {!isAnswered ? "Pilih jawaban dulu" : isLast ? "Selesai & Lihat Hasil" : "Lanjut"}
          </button>
        </div>
      </div>
    </LockedExam>
  );
}
