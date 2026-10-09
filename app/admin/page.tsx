"use client";

import { useEffect, useState } from "react";

interface Violation {
  type: string;
  count: number;
  timestamp: number;
}

interface Capture {
  timestamp: number;
  dataUrl: string;
}

interface Session {
  id: string;
  startedAt: number;
  submittedAt: number | null;
  forced: boolean;
  disqualified: boolean;
  violationCount: number;
  violations: Violation[];
  captureCount: number;
  recentCaptures: Capture[];
  answers: Record<number, number> | null;
  lastHeartbeat: number;
}

const V_LABELS: Record<string, string> = {
  fullscreen_exit: "Keluar Fullscreen",
  tab_switch: "Pindah Tab",
  window_blur: "Window Blur",
  navigation: "Navigasi Paksa",
  shortcut: "Shortcut Terlarang",
};

const fmt = (ts: number) =>
  new Date(ts).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

const fmtDate = (ts: number) =>
  new Date(ts).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });

const elapsed = (start: number, end: number | null) => {
  const ms = (end ?? Date.now()) - start;
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${m}m ${s}s`;
};

type Filter = "all" | "disqualified" | "forced" | "clean";

function statusBadge(s: Session) {
  if (s.disqualified) return { text: "Diskualifikasi", cls: "bg-danger-bg text-danger border-danger-border" };
  if (s.forced) return { text: "Timeout", cls: "bg-warning-bg text-warning-text border-warning-border" };
  if (s.submittedAt) return { text: "Selesai", cls: "bg-success-bg text-success-text border-success-border" };
  return { text: "Berlangsung", cls: "bg-[#EBF4FF] text-blue border-blue/20" };
}

const FILTER_META: { key: Filter; label: string; colorClass: string }[] = [
  { key: "all", label: "Total Sesi", colorClass: "text-charcoal" },
  { key: "disqualified", label: "Diskualifikasi", colorClass: "text-danger" },
  { key: "forced", label: "Timeout", colorClass: "text-warning-text" },
  { key: "clean", label: "Bersih", colorClass: "text-success-text" },
];

export default function AdminPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<Session | null>(null);
  const [previewImg, setPreviewImg] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/admin/sessions");
    const data = await res.json();
    setSessions(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, []);

  // sync detail panel on refresh
  useEffect(() => {
    if (!selected) return;
    const updated = sessions.find((s) => s.id === selected.id);
    if (updated) setSelected(updated);
  // ponytail: selected intentionally excluded — adding it causes infinite loop
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessions]);

  const counts: Record<Filter, number> = {
    all: sessions.length,
    disqualified: sessions.filter((s) => s.disqualified).length,
    forced: sessions.filter((s) => s.forced && !s.disqualified).length,
    clean: sessions.filter((s) => !s.forced && !s.disqualified && s.violationCount === 0).length,
  };

  const filtered = sessions.filter((s) => {
    if (filter === "disqualified") return s.disqualified;
    if (filter === "forced") return s.forced && !s.disqualified;
    if (filter === "clean") return !s.forced && !s.disqualified && s.violationCount === 0;
    return true;
  });

  return (
    <div className="min-h-screen bg-ivory">
      {/* Top bar */}
      <header className="sticky top-0 z-10 border-b border-border bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-screen-xl items-center justify-between px-8 py-3">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-blue animate-pulse" />
            <span className="text-sm font-semibold text-charcoal">Admin Panel</span>
            <span className="text-xs text-muted">Refresh otomatis tiap 5 detik</span>
          </div>
          <button
            onClick={load}
            className="rounded-lg border border-border bg-ivory px-3 py-1.5 text-xs font-medium text-charcoal transition-colors hover:bg-border"
          >
            Refresh
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-screen-xl px-8 py-6 space-y-5">
        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-3">
          {FILTER_META.map(({ key, label, colorClass }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`rounded-2xl border p-5 text-left transition-all ${
                filter === key
                  ? "border-blue/40 bg-[#EBF4FF] shadow-sm"
                  : "border-border bg-white hover:border-blue/20 hover:bg-ivory"
              }`}
            >
              <div className={`text-3xl font-bold tabular-nums ${colorClass}`}>{counts[key]}</div>
              <div className="mt-1 text-xs text-muted">{label}</div>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32 text-sm text-muted">Memuat data...</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-white py-32 text-center">
            <div className="text-sm font-medium text-charcoal">Belum ada sesi</div>
            <div className="mt-1 text-xs text-muted">Sesi akan muncul saat peserta mulai tes</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_400px]">
            {/* Table */}
            <div className="overflow-hidden rounded-2xl border border-border bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-ivory/60">
                    <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-muted">ID</th>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-muted">Mulai</th>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-muted">Durasi</th>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-muted">Pelanggaran</th>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-muted">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => {
                    const badge = statusBadge(s);
                    const isSelected = selected?.id === s.id;
                    return (
                      <tr
                        key={s.id}
                        onClick={() => setSelected(isSelected ? null : s)}
                        className={`cursor-pointer border-b border-border last:border-0 transition-colors ${
                          isSelected ? "bg-[#EBF4FF]" : "hover:bg-ivory"
                        }`}
                      >
                        <td className="px-5 py-3.5">
                          <span className="font-mono text-[11px] text-charcoal">{s.id.slice(0, 8)}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="text-xs text-charcoal">{fmtDate(s.startedAt)}</div>
                          <div className="text-[11px] text-muted">{fmt(s.startedAt)}</div>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-muted tabular-nums">{elapsed(s.startedAt, s.submittedAt)}</td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`text-xs font-semibold tabular-nums ${
                              s.violationCount === 0
                                ? "text-muted"
                                : s.violationCount <= 2
                                ? "text-warning-text"
                                : "text-danger"
                            }`}
                          >
                            {s.violationCount}x
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${badge.cls}`}>
                            {badge.text}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Detail panel — sticky beside table */}
            <div className="lg:sticky lg:top-[57px] lg:self-start">
              {selected ? (
                <div className="rounded-2xl border border-border bg-white overflow-hidden">
                  {/* Panel header */}
                  <div className="flex items-start justify-between border-b border-border px-5 py-4">
                    <div>
                      <div className="text-xs font-semibold text-charcoal">Detail Sesi</div>
                      <div className="mt-0.5 font-mono text-[11px] text-muted break-all">{selected.id}</div>
                    </div>
                    <button
                      onClick={() => setSelected(null)}
                      className="ml-3 shrink-0 rounded-lg border border-border px-2.5 py-1 text-[11px] text-muted hover:text-charcoal transition-colors"
                    >
                      Tutup
                    </button>
                  </div>

                  {/* Meta row */}
                  <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
                    {[
                      { label: "Mulai", value: fmt(selected.startedAt) },
                      { label: "Durasi", value: elapsed(selected.startedAt, selected.submittedAt) },
                      { label: "Foto", value: `${selected.captureCount}` },
                    ].map(({ label, value }) => (
                      <div key={label} className="px-4 py-3">
                        <div className="text-[10px] text-muted uppercase tracking-wide">{label}</div>
                        <div className="mt-0.5 text-xs font-semibold text-charcoal tabular-nums">{value}</div>
                      </div>
                    ))}
                  </div>

                  <div className="p-5 space-y-5">
                    {/* Violations */}
                    <div>
                      <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
                        Pelanggaran ({selected.violations.length})
                      </div>
                      {selected.violations.length === 0 ? (
                        <div className="rounded-xl border border-border px-4 py-3 text-xs text-muted">Tidak ada pelanggaran.</div>
                      ) : (
                        <div className="space-y-1.5">
                          {selected.violations.map((v, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between rounded-xl border border-danger-border bg-danger-bg px-3 py-2"
                            >
                              <div>
                                <div className="text-[11px] font-semibold text-danger">{V_LABELS[v.type] ?? v.type}</div>
                                <div className="text-[10px] text-muted">ke-{v.count}</div>
                              </div>
                              <div className="text-[10px] text-muted tabular-nums">{fmt(v.timestamp)}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Captures */}
                    <div>
                      <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
                        Foto ({selected.captureCount} total, tampil 5 terakhir)
                      </div>
                      {selected.recentCaptures.length === 0 ? (
                        <div className="rounded-xl border border-border px-4 py-3 text-xs text-muted">Belum ada foto.</div>
                      ) : (
                        <div className="grid grid-cols-3 gap-2">
                          {selected.recentCaptures.map((c, i) => (
                            <button
                              key={i}
                              onClick={() => setPreviewImg(c.dataUrl)}
                              className="group relative overflow-hidden rounded-xl border border-border"
                            >
                              <img
                                src={c.dataUrl}
                                alt={`Foto ${i + 1}`}
                                className="h-20 w-full object-cover transition-opacity group-hover:opacity-75"
                              />
                              <div className="absolute bottom-0 left-0 right-0 bg-charcoal/60 px-1.5 py-0.5 text-[9px] text-white tabular-nums">
                                {fmt(c.timestamp)}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center rounded-2xl border border-dashed border-border bg-white py-20 text-xs text-muted">
                  Pilih baris untuk melihat detail
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {previewImg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/80 backdrop-blur-sm"
          onClick={() => setPreviewImg(null)}
        >
          <img
            src={previewImg}
            alt="Preview"
            className="max-h-[85vh] max-w-[85vw] rounded-2xl border-2 border-white/20 shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
