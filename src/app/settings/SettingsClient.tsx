"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  LogIn,
  LogOut,
  Loader2,
  MapPin,
  Save,
  ShieldAlert,
  Trash2,
  User,
  UserCircle,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { SessionUser } from "@/lib/auth";

const REGIONS = ["NCR", "Luzon", "Visayas", "Mindanao", "Rural"];

export function SettingsClient({ initialUser }: { initialUser: SessionUser | null }) {
  const router = useRouter();
  const [user, setUser] = useState(initialUser);
  const [name, setName] = useState(initialUser?.name ?? "");
  const [region, setRegion] = useState(initialUser?.region ?? "");
  const [city, setCity] = useState(initialUser?.city ?? "");
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const isGuest = !user || user.isGuest;

  async function saveProfile() {
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, region, city }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json?.ok) {
        setStatus(json?.error ?? "Hindi na-save.");
        return;
      }
      setUser((u) => (u ? { ...u, name, region, city } : u));
      setStatus("Na-save na ang profile mo.");
    } catch {
      setStatus("Network error habang nagse-save.");
    } finally {
      setSaving(false);
    }
  }

  async function signOut() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  async function deleteAccount() {
    setDeleting(true);
    setStatus(null);
    try {
      const res = await fetch("/api/account/delete", { method: "POST" });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json?.ok) {
        setStatus(json?.error ?? "Hindi na-delete.");
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setStatus("Network error habang nagde-delete.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Account card */}
      <section className="surface animate-fade-up flex items-center gap-3.5 rounded-2xl p-4">
        <div
          className={cn(
            "grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-lg font-extrabold text-white",
            isGuest ? "bg-ink-400" : "bg-brand-600"
          )}
        >
          {isGuest ? (
            <UserCircle className="h-7 w-7" strokeWidth={2} />
          ) : (
            (user?.name?.trim()?.[0] ?? user?.email?.[0] ?? "U").toUpperCase()
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-extrabold text-ink-950">
            {isGuest ? "Guest mode" : user?.name || "Walang pangalan"}
          </p>
          <p className="truncate text-xs text-ink-500">
            {isGuest ? "Hindi naka-save sa cloud ang data mo" : user?.email}
          </p>
        </div>
        {isGuest ? (
          <Badge tone="araw" className="shrink-0">
            Guest
          </Badge>
        ) : (
          <Badge tone="green" className="shrink-0">
            Signed in
          </Badge>
        )}
      </section>

      {isGuest ? (
        <section className="animate-fade-up rounded-2xl bg-gradient-to-br from-brand-700 to-brand-900 p-4 text-white">
          <p className="text-sm font-extrabold">I-save ang progress mo</p>
          <p className="mt-1 text-[13px] leading-relaxed text-brand-100">
            Gumawa ng account para hindi mawala ang saved hustles, kita logs, at quiz history mo
            kapag nagpalit ka ng device.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link href="/signup">
              <Button className="w-full bg-white text-brand-800 hover:bg-brand-50">
                Gumawa ng account
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" className="w-full bg-white/10 text-white ring-1 ring-white/25 hover:bg-white/15">
                <LogIn className="h-4 w-4" strokeWidth={2.25} />
                Sign in
              </Button>
            </Link>
          </div>
        </section>
      ) : null}

      {/* Profile form */}
      <section className="surface animate-fade-up space-y-3 rounded-2xl p-4">
        <p className="flex items-center gap-1.5 text-sm font-extrabold text-ink-950">
          <User className="h-4 w-4 text-brand-600" strokeWidth={2.25} />
          Profile
        </p>

        <div className="min-w-0 space-y-1.5">
          <label className="text-xs font-extrabold uppercase tracking-wide text-ink-500">
            Pangalan
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Juan Dela Cruz"
            className="h-11 w-full min-w-0 rounded-xl border border-ink-200 bg-white px-3.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="min-w-0 space-y-1.5">
            <label className="flex items-center gap-1 text-xs font-extrabold uppercase tracking-wide text-ink-500">
              <MapPin className="h-3.5 w-3.5" strokeWidth={2.25} />
              Region
            </label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="h-11 w-full min-w-0 truncate rounded-xl border border-ink-200 bg-white px-2.5 text-sm outline-none focus:border-brand-500"
            >
              <option value="">Pumili</option>
              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-0 space-y-1.5">
            <label className="text-xs font-extrabold uppercase tracking-wide text-ink-500">
              Lungsod
            </label>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Hal. Quezon City"
              className="h-11 w-full min-w-0 rounded-xl border border-ink-200 bg-white px-3.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
        </div>

        <Button type="button" onClick={saveProfile} disabled={saving} className="w-full">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} /> : <Save className="h-4 w-4" strokeWidth={2.25} />}
          I-save ang profile
        </Button>

        {status ? (
          <p className="rounded-xl bg-ink-50 p-3 text-[13px] font-semibold text-ink-700 ring-1 ring-ink-100">
            {status}
          </p>
        ) : null}
      </section>

      {/* Account actions */}
      {!isGuest ? (
        <section className="surface animate-fade-up rounded-2xl p-4">
          <Button type="button" variant="secondary" onClick={signOut} disabled={loggingOut} className="w-full">
            {loggingOut ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} /> : <LogOut className="h-4 w-4" strokeWidth={2.25} />}
            Sign out
          </Button>
        </section>
      ) : null}

      {/* Danger zone */}
      <section className="animate-fade-up space-y-2.5 rounded-2xl border border-rose-200 bg-rose-50/60 p-4">
        <p className="flex items-center gap-1.5 text-sm font-extrabold text-rose-800">
          <AlertTriangle className="h-4 w-4" strokeWidth={2.25} />
          Danger zone
        </p>
        <p className="text-[13px] leading-relaxed text-rose-700/90">
          Permanenteng ma-delete ang account, saved hustles, kita logs, at quiz history mo. Hindi
          na ito mababawi (Data Privacy Act — right to erasure).
        </p>
        {confirmDelete ? (
          <div className="flex gap-2">
            <Button type="button" variant="danger" onClick={deleteAccount} disabled={deleting} className="flex-1">
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} /> : <Trash2 className="h-4 w-4" strokeWidth={2.25} />}
              Oo, i-delete lahat
            </Button>
            <Button type="button" variant="secondary" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
          </div>
        ) : (
          <Button type="button" variant="danger" onClick={() => setConfirmDelete(true)} className="w-full">
            <Trash2 className="h-4 w-4" strokeWidth={2.25} />
            I-delete ang data ko
          </Button>
        )}
      </section>

      <div className="flex items-start gap-2.5 rounded-2xl bg-ink-100/70 p-3 text-[11px] leading-relaxed text-ink-500">
        <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-400" />
        <p>
          Guest mode data ay naka-store gamit ang isang device cookie lamang. Mag-sign up para
          hindi mawala ang data mo.
        </p>
      </div>
    </div>
  );
}
