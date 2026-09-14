"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, Lock, Mail, User } from "lucide-react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/PageHeader";
import { Disclaimer } from "@/components/Disclaimer";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json?.ok) {
        setError(json?.error ?? "Hindi maka-sign in.");
        return;
      }
      router.push("/settings");
      router.refresh();
    } catch {
      setError("Network error. Subukan ulit.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="space-y-4">
      <PageHeader
        icon={<LogIn className="h-5 w-5" strokeWidth={2.25} />}
        title="Sign in"
        description="Balik sa saved hustles, kita logs, at quiz history mo."
      />

      <form onSubmit={onSubmit} className="surface animate-fade-up space-y-3 rounded-2xl p-4">
        {error ? (
          <div className="rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-700 ring-1 ring-rose-200">
            {error}
          </div>
        ) : null}

        <Field icon={Mail} label="Email">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="juan@email.com"
            className="h-11 w-full min-w-0 rounded-xl border border-ink-200 bg-white px-3.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          />
        </Field>

        <Field icon={Lock} label="Password">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Password mo"
            className="h-11 w-full min-w-0 rounded-xl border border-ink-200 bg-white px-3.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          />
        </Field>

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} /> : null}
          Sign in
        </Button>

        <p className="text-center text-xs font-semibold text-ink-500">
          Wala pang account?{" "}
          <Link href="/signup" className="font-extrabold text-brand-700">
            Gumawa ng account
          </Link>
        </p>
      </form>

      <Disclaimer variant="legal" />
    </main>
  );
}

function Field({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof User;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0 space-y-1.5">
      <label className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide text-ink-500">
        <Icon className="h-3.5 w-3.5" strokeWidth={2.25} />
        {label}
      </label>
      {children}
    </div>
  );
}
