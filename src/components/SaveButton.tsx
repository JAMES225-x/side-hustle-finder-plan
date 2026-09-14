"use client";

import { useEffect, useState } from "react";
import { Bookmark } from "lucide-react";
import { cn } from "@/lib/cn";

export function SaveButton({ hustleId }: { hustleId: number }) {
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/save");
        const json = (await res.json()) as { ok: boolean; ids?: number[] };
        if (!cancelled && json.ok && Array.isArray(json.ids)) {
          setSaved(json.ids.includes(hustleId));
        }
      } catch {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hustleId]);

  async function toggle() {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/save", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ hustleId }),
      });
      const json = (await res.json()) as { ok: boolean; saved?: boolean };
      if (json.ok && typeof json.saved === "boolean") setSaved(json.saved);
    } catch {
      // ignore
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition-all active:scale-[0.97]",
        saved
          ? "bg-brand-50 text-brand-700 ring-1 ring-brand-200"
          : "bg-white text-ink-700 ring-1 ring-ink-200 hover:bg-ink-50"
      )}
    >
      <Bookmark
        className={cn("h-4 w-4 transition-all", saved && "fill-brand-600 text-brand-600")}
        strokeWidth={2.25}
      />
      {saved ? "Naka-save" : "I-save"}
    </button>
  );
}
