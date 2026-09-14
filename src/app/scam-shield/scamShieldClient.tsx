"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Flag,
  Loader2,
  RotateCcw,
  ScanSearch,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressRing } from "@/components/ProgressRing";

type ApiResult = {
  ok: boolean;
  result?: {
    riskScore: number;
    riskLevel: "green" | "yellow" | "red";
    redFlags: Array<{ id: string; labelTl: string; evidence?: string }>;
    tipsTl: string[];
    registryHits?: Array<{
      entityName: string;
      riskLevel: string;
      source: string;
      notes: string | null;
    }>;
    communityReportsCount?: number;
    disclaimerTl?: string;
  };
};

const RISK_UI = {
  green: {
    color: "#15803d",
    bg: "bg-emerald-50",
    ring: "ring-emerald-200",
    text: "text-emerald-800",
    label: "Mukhang ligtas",
    sub: "Walang obvious red flags — pero mag-ingat pa rin.",
  },
  yellow: {
    color: "#d97706",
    bg: "bg-amber-50",
    ring: "ring-amber-200",
    text: "text-amber-800",
    label: "Mag-ingat",
    sub: "May mga pattern na karaniwan sa mga scam.",
  },
  red: {
    color: "#e11d48",
    bg: "bg-rose-50",
    ring: "ring-rose-200",
    text: "text-rose-800",
    label: "Delikado",
    sub: "Malakas ang red-flag signals. Wag magpadala ng pera o info.",
  },
} as const;

export function ScamShieldClient() {
  const [entityName, setEntityName] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiResult["result"] | null>(null);
  const [reporting, setReporting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const canCheck = entityName.trim().length > 1 || text.trim().length > 20;

  const reportDescription = useMemo(() => {
    const parts = [
      entityName.trim() ? `Entity: ${entityName.trim()}` : null,
      text.trim() ? `Offer/Message:\n${text.trim()}` : null,
    ].filter(Boolean);
    return parts.join("\n\n");
  }, [entityName, text]);

  async function runCheck() {
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/scam/check", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ entityName, text }),
      });
      const json = (await res.json()) as ApiResult;
      if (!res.ok || !json.ok) {
        setResult(null);
        setStatus("May error sa check. Subukan ulit.");
        return;
      }
      setResult(json.result ?? null);
    } catch {
      setStatus("Network error. Subukan ulit.");
    } finally {
      setLoading(false);
    }
  }

  async function report() {
    if (reportDescription.length < 10) {
      setStatus("Kulang ang details para sa report.");
      return;
    }
    setReporting(true);
    setStatus(null);
    try {
      const res = await fetch("/api/scam/report", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          entityName: entityName.trim() || "Unknown entity",
          platform: "online",
          description: reportDescription,
        }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json?.ok) {
        setStatus(json?.error ?? "Hindi na-submit ang report.");
        return;
      }
      setStatus("Salamat! Na-submit ang report mo para sa community review.");
    } catch {
      setStatus("Network error habang nagre-report.");
    } finally {
      setReporting(false);
    }
  }

  const ui = result ? RISK_UI[result.riskLevel] : null;

  return (
    <div className="space-y-4">
      {/* Input */}
      <section className="surface animate-fade-up space-y-3 rounded-2xl p-4">
        <div className="space-y-1.5">
          <label className="text-xs font-extrabold uppercase tracking-wide text-ink-500" htmlFor="entity">
            Company / FB page / pangalan
          </label>
          <input
            id="entity"
            value={entityName}
            onChange={(e) => setEntityName(e.target.value)}
            placeholder="Hal. 'ABC Trading Solutions'"
            className="h-12 w-full rounded-xl border border-ink-200 bg-white px-3.5 text-sm font-medium outline-none transition-shadow placeholder:text-ink-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-extrabold uppercase tracking-wide text-ink-500" htmlFor="offer">
            I-paste ang job offer o message
          </label>
          <textarea
            id="offer"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={
              "Hal: 'Kumita ng 20k per week! PM lang, may ₱500 registration fee...' — i-paste dito ang buong message."
            }
            className="min-h-36 w-full rounded-xl border border-ink-200 bg-white px-3.5 py-3 text-sm leading-relaxed outline-none transition-shadow placeholder:text-ink-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
        <Button type="button" onClick={runCheck} disabled={!canCheck || loading} size="lg" className="w-full">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} />
              Sinusuri...
            </>
          ) : (
            <>
              <ScanSearch className="h-4 w-4" strokeWidth={2.5} />
              I-check ang risk
            </>
          )}
        </Button>
      </section>

      {/* Result */}
      {result && ui ? (
        <section className="animate-pop-in space-y-3">
          <div className={cn("rounded-3xl p-5 ring-1", ui.bg, ui.ring)}>
            <div className="flex items-center gap-4">
              <ProgressRing percent={result.riskScore} size={84} stroke={9} color={ui.color} track="rgba(0,0,0,0.08)">
                <div className="text-center">
                  <p className="tabular text-xl font-extrabold" style={{ color: ui.color }}>
                    {result.riskScore}
                  </p>
                  <p className="text-[9px] font-bold uppercase tracking-wide text-ink-500">risk</p>
                </div>
              </ProgressRing>
              <div>
                <p className={cn("text-lg font-extrabold", ui.text)}>{ui.label}</p>
                <p className="mt-1 text-[13px] leading-snug text-ink-600">{ui.sub}</p>
                {typeof result.communityReportsCount === "number" && result.communityReportsCount > 0 ? (
                  <Badge tone="red" className="mt-2">
                    {result.communityReportsCount} community report
                    {result.communityReportsCount > 1 ? "s" : ""}
                  </Badge>
                ) : null}
              </div>
            </div>
          </div>

          {result.redFlags.length > 0 ? (
            <div className="surface space-y-2.5 rounded-2xl p-4">
              <p className="text-sm font-extrabold text-ink-950">Red flags na nakita</p>
              <ul className="space-y-2">
                {result.redFlags.map((f) => (
                  <li key={f.id} className="flex items-start gap-2.5 rounded-xl bg-rose-50/70 p-3">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" strokeWidth={2.25} />
                    <div>
                      <p className="text-[13px] font-bold text-rose-800">{f.labelTl}</p>
                      {f.evidence ? (
                        <p className="mt-0.5 text-xs italic text-rose-600/80">“{f.evidence}”</p>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="surface space-y-2 rounded-2xl p-4">
            <p className="flex items-center gap-2 text-sm font-extrabold text-ink-950">
              <ShieldCheck className="h-4 w-4 text-brand-600" strokeWidth={2.25} />
              Safety checklist
            </p>
            <ul className="space-y-1.5">
              {result.tipsTl.map((t, i) => (
                <li key={i} className="flex items-start gap-2 text-[13px] leading-relaxed text-ink-600">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          {result.registryHits?.length ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-extrabold text-amber-800">Nasa watchlist ito</p>
              <ul className="mt-2 space-y-1.5">
                {result.registryHits.map((h, i) => (
                  <li key={i} className="text-[13px] text-amber-900/90">
                    <span className="font-bold">{h.entityName}</span> — {h.riskLevel} risk ({h.source})
                    {h.notes ? <span className="text-amber-800/80"> · {h.notes}</span> : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="flex gap-2.5">
            <Button type="button" variant="danger" onClick={report} disabled={reporting} className="flex-1">
              {reporting ? (
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} />
              ) : (
                <Flag className="h-4 w-4" strokeWidth={2.25} />
              )}
              I-report ito
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setResult(null);
                setStatus(null);
              }}
            >
              <RotateCcw className="h-4 w-4" strokeWidth={2.25} />
              Bago
            </Button>
          </div>

          {result.disclaimerTl ? (
            <p className="text-[11px] leading-relaxed text-ink-400">{result.disclaimerTl}</p>
          ) : null}
        </section>
      ) : null}

      {status ? (
        <div className="animate-fade-up rounded-2xl bg-brand-50 p-3.5 text-sm font-semibold text-brand-800 ring-1 ring-brand-100">
          {status}
        </div>
      ) : null}
    </div>
  );
}
