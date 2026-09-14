"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Download,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Scale,
  Target,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { formatPhp } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressRing } from "@/components/ProgressRing";

type Summary = { ok: true; income: number; expense: number; net: number; monthStart: string };

type LogRow = {
  id: number;
  type: "income" | "expense";
  amountPhp: number;
  note: string | null;
  loggedAt: string;
};

const GOAL_KEY = "shfph_goal_php";

export function TrackerClient() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [type, setType] = useState<"income" | "expense">("income");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const [goal, setGoal] = useState<number>(10000);
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState("10000");

  useEffect(() => {
    try {
      const g = Number(localStorage.getItem(GOAL_KEY));
      if (Number.isFinite(g) && g > 0) {
        setGoal(g);
        setGoalInput(String(g));
      }
    } catch {
      // private mode etc.
    }
  }, []);

  const monthLabel = useMemo(() => {
    if (!summary) return "Ngayong buwan";
    return new Date(summary.monthStart).toLocaleString("en-PH", { month: "long", year: "numeric" });
  }, [summary]);

  async function refresh() {
    setLoading(true);
    setStatus(null);
    try {
      const [sRes, lRes] = await Promise.all([
        fetch("/api/tracker/summary"),
        fetch("/api/tracker/logs"),
      ]);
      const sJson = (await sRes.json()) as Summary & { ok: boolean };
      const lJson = (await lRes.json()) as { ok: boolean; logs: LogRow[] };
      if (sRes.ok && sJson?.ok) setSummary(sJson);
      if (lRes.ok && lJson?.ok) setLogs(lJson.logs ?? []);
    } catch {
      setStatus("Network error. Subukan ulit.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function addLog() {
    const amountPhp = Number(amount);
    if (!Number.isFinite(amountPhp) || amountPhp <= 0) {
      setStatus("Pakilagay ang amount na mas malaki sa 0.");
      return;
    }
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch("/api/tracker/logs", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ type, amountPhp: Math.round(amountPhp), note: note.trim() || undefined }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json?.ok) {
        setStatus(json?.error ?? "Hindi na-save.");
        return;
      }
      setAmount("");
      setNote("");
      await refresh();
    } catch {
      setStatus("Network error habang nagse-save.");
    } finally {
      setSaving(false);
    }
  }

  function saveGoal() {
    const g = Number(goalInput);
    if (Number.isFinite(g) && g > 0) {
      setGoal(g);
      try {
        localStorage.setItem(GOAL_KEY, String(g));
      } catch {
        // ignore
      }
    }
    setEditingGoal(false);
  }

  function exportCsv() {
    const header = "Date,Type,Amount (PHP),Note";
    const lines = logs.map((l) => {
      const date = new Date(l.loggedAt).toISOString().slice(0, 10);
      const safeNote = (l.note ?? "").replace(/"/g, '""');
      return `${date},${l.type},${l.amountPhp},"${safeNote}"`;
    });
    const csv = "\uFEFF" + [header, ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kita-tracker-${new Date().toISOString().slice(0, 7)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const income = summary?.income ?? 0;
  const expense = summary?.expense ?? 0;
  const net = summary?.net ?? 0;
  const goalPct = goal > 0 ? Math.round((income / goal) * 100) : 0;

  // Last 7 days chart (income vs expense)
  const days = useMemo(() => {
    const out: Array<{ label: string; income: number; expense: number }> = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const key = d.toDateString();
      const dayLogs = logs.filter((l) => new Date(l.loggedAt).toDateString() === key);
      out.push({
        label: d.toLocaleDateString("en-PH", { weekday: "short" }),
        income: dayLogs.filter((l) => l.type === "income").reduce((s, l) => s + l.amountPhp, 0),
        expense: dayLogs.filter((l) => l.type === "expense").reduce((s, l) => s + l.amountPhp, 0),
      });
    }
    return out;
  }, [logs]);

  const dayMax = Math.max(1, ...days.map((d) => Math.max(d.income, d.expense)));

  return (
    <div className="space-y-4">
      {/* Goal ring */}
      <section className="surface animate-fade-up flex items-center gap-4 rounded-2xl p-4">
        <ProgressRing percent={goalPct} size={92} stroke={10} color="#188052">
          <div className="text-center">
            <p className="tabular text-lg font-extrabold text-brand-700">{Math.min(goalPct, 999)}%</p>
            <p className="text-[9px] font-bold uppercase tracking-wide text-ink-400">goal</p>
          </div>
        </ProgressRing>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-extrabold uppercase tracking-wide text-ink-400">{monthLabel}</p>
          <p className="tabular mt-0.5 text-xl font-extrabold tracking-tight text-ink-950">
            {formatPhp(income)}
            <span className="text-sm font-bold text-ink-400"> / {formatPhp(goal)}</span>
          </p>
          {editingGoal ? (
            <div className="mt-2 flex gap-1.5">
              <input
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                inputMode="numeric"
                className="tabular h-9 w-28 rounded-lg border border-ink-200 px-2 text-sm font-bold outline-none focus:border-brand-500"
                aria-label="Monthly goal"
              />
              <Button size="sm" onClick={saveGoal}>
                Save
              </Button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setEditingGoal(true)}
              className="mt-1.5 inline-flex items-center gap-1 text-xs font-bold text-brand-700"
            >
              <Target className="h-3.5 w-3.5" strokeWidth={2.5} />
              Edit goal <Pencil className="h-3 w-3" strokeWidth={2.5} />
            </button>
          )}
        </div>
      </section>

      {/* Totals */}
      <section className="grid grid-cols-3 gap-2.5">
        <TotalCard
          icon={ArrowUpCircle}
          label="Kita"
          value={income}
          iconColor="text-emerald-500"
          loading={loading}
        />
        <TotalCard
          icon={ArrowDownCircle}
          label="Gastos"
          value={expense}
          iconColor="text-rose-500"
          loading={loading}
        />
        <TotalCard
          icon={Scale}
          label="Net"
          value={net}
          iconColor="text-ink-600"
          loading={loading}
          highlight
        />
      </section>

      {/* 7-day chart */}
      <section className="surface animate-fade-up rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-extrabold text-ink-950">Huling 7 araw</p>
          <div className="flex items-center gap-3 text-[10px] font-bold text-ink-500">
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-brand-500" /> Kita
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-rose-400" /> Gastos
            </span>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-7 items-end gap-2">
          {days.map((d, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="flex h-24 items-end gap-0.5">
                <div
                  className="w-2.5 rounded-t bg-brand-500 transition-all"
                  style={{ height: `${Math.max(3, (d.income / dayMax) * 96)}%` }}
                  title={`Kita: ${formatPhp(d.income)}`}
                />
                <div
                  className="w-2.5 rounded-t bg-rose-400 transition-all"
                  style={{ height: `${Math.max(3, (d.expense / dayMax) * 96)}%` }}
                  title={`Gastos: ${formatPhp(d.expense)}`}
                />
              </div>
              <span className="text-[9px] font-bold uppercase text-ink-400">{d.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Add entry */}
      <section className="surface animate-fade-up space-y-3 rounded-2xl p-4">
        <p className="text-sm font-extrabold text-ink-950">Magdagdag ng entry</p>
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-ink-100 p-1">
          {(["income", "expense"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={cn(
                "h-10 rounded-lg text-sm font-extrabold transition-all",
                type === t
                  ? t === "income"
                    ? "bg-white text-emerald-600 shadow-sm"
                    : "bg-white text-rose-600 shadow-sm"
                  : "text-ink-500"
              )}
            >
              {t === "income" ? "Kita pumasok" : "Gastos"}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputMode="decimal"
            placeholder="Amount (₱)"
            className="tabular h-11 w-full rounded-xl border border-ink-200 bg-white px-3.5 text-sm font-bold outline-none placeholder:font-medium placeholder:text-ink-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          />
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Note (optional)"
            className="h-11 w-full rounded-xl border border-ink-200 bg-white px-3.5 text-sm font-medium outline-none placeholder:text-ink-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
        <div className="flex gap-2">
          <Button type="button" onClick={addLog} disabled={saving} className="flex-1">
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} />
            ) : (
              <Plus className="h-4 w-4" strokeWidth={2.5} />
            )}
            I-save
          </Button>
          <Button type="button" variant="secondary" onClick={refresh} disabled={loading}>
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} strokeWidth={2.25} />
          </Button>
        </div>
        {status ? (
          <p className="rounded-xl bg-ink-50 p-3 text-[13px] font-semibold text-ink-700 ring-1 ring-ink-100">
            {status}
          </p>
        ) : null}
      </section>

      {/* Recent logs */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-extrabold text-ink-950">Mga huling entry</p>
          <button
            type="button"
            onClick={exportCsv}
            disabled={logs.length === 0}
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-ink-700 ring-1 ring-ink-200 transition-all hover:bg-ink-50 active:scale-95 disabled:opacity-40"
          >
            <Download className="h-3.5 w-3.5" strokeWidth={2.5} />
            Export CSV
          </button>
        </div>

        {logs.length === 0 ? (
          <div className="surface flex flex-col items-center gap-2 rounded-2xl p-8 text-center">
            <p className="text-sm font-extrabold text-ink-900">Wala pang entries</p>
            <p className="max-w-[26ch] text-xs text-ink-500">
              Simulan mo sa unang kita o gastos mo — kahit maliit, importante ito i-track.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {logs.map((l) => (
              <li
                key={l.id}
                className="surface flex items-start justify-between gap-3 rounded-2xl p-3.5"
              >
                <div className="flex items-start gap-2.5">
                  <div
                    className={cn(
                      "mt-0.5 grid h-8 w-8 place-items-center rounded-lg",
                      l.type === "income" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"
                    )}
                  >
                    {l.type === "income" ? (
                      <ArrowUpCircle className="h-5 w-5" strokeWidth={2.25} />
                    ) : (
                      <ArrowDownCircle className="h-5 w-5" strokeWidth={2.25} />
                    )}
                  </div>
                  <div>
                    <p className="tabular text-sm font-extrabold text-ink-950">
                      {l.type === "income" ? "+" : "−"}
                      {formatPhp(l.amountPhp)}
                    </p>
                    <p className="text-[11px] font-medium text-ink-400">
                      {new Date(l.loggedAt).toLocaleString("en-PH", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    {l.note ? <p className="mt-1 text-xs text-ink-600">{l.note}</p> : null}
                  </div>
                </div>
                <Badge tone={l.type === "income" ? "green" : "red"}>
                  {l.type === "income" ? "Kita" : "Gastos"}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="text-[11px] leading-relaxed text-ink-400">
        Tip: Ang CSV export ay pwede mong gamitin sa paghahanda ng BIR filing (kasama ng resibo at
        records, syempre).
      </p>
    </div>
  );
}

function TotalCard({
  icon: Icon,
  label,
  value,
  iconColor,
  loading,
  highlight,
}: {
  icon: typeof Scale;
  label: string;
  value: number;
  iconColor: string;
  loading?: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "surface animate-fade-up rounded-2xl p-3.5",
        highlight && "ring-1 ring-brand-200"
      )}
    >
      <div className="flex items-center gap-1.5">
        <Icon className={cn("h-4 w-4", iconColor)} strokeWidth={2.25} />
        <p className="text-[10px] font-extrabold uppercase tracking-wide text-ink-400">{label}</p>
      </div>
      <p className="tabular mt-1.5 text-[15px] font-extrabold tracking-tight text-ink-950">
        {loading ? "—" : formatPhp(value)}
      </p>
    </div>
  );
}
