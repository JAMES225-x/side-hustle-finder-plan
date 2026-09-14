"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  Banknote,
  Bike,
  Car,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Laptop,
  Loader2,
  MapPin,
  Smartphone,
  Sparkles,
  Target,
  Wifi,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";

const SKILLS = [
  { id: "communication", label: "Communication" },
  { id: "english", label: "English" },
  { id: "sales", label: "Sales" },
  { id: "customer_service", label: "Customer service" },
  { id: "content", label: "Content creation" },
  { id: "video_editing", label: "Video editing" },
  { id: "graphic_design", label: "Graphic design" },
  { id: "writing", label: "Writing" },
  { id: "teaching", label: "Teaching/Tutoring" },
  { id: "admin", label: "Admin/Organization" },
  { id: "tech", label: "Tech" },
  { id: "accounting", label: "Bookkeeping" },
  { id: "delivery", label: "Delivery/Rider" },
  { id: "cooking", label: "Cooking/Baking" },
  { id: "beauty", label: "Beauty services" },
  { id: "repair", label: "Repair" },
  { id: "photography", label: "Photo/Video" },
  { id: "agri", label: "Agri" },
];

const STEP_ICONS: LucideIcon[] = [Clock, Banknote, MapPin, Smartphone, Wifi, Sparkles, Zap, Target];

type QuizPayload = {
  hoursPerWeek: string;
  capitalPhp: number;
  region: string;
  devices: string[];
  internet: string;
  skills: string[];
  urgency: string;
  goal: string;
};

export function QuizWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [hoursPerWeek, setHoursPerWeek] = useState("5-15");
  const [capitalPhp, setCapitalPhp] = useState<number>(1000);
  const [region, setRegion] = useState("NCR");
  const [devices, setDevices] = useState<string[]>(["phone"]);
  const [internet, setInternet] = useState("data");
  const [skills, setSkills] = useState<string[]>([]);
  const [urgency, setUrgency] = useState("1 month");
  const [goal, setGoal] = useState("Pandagdag");

  const payload: QuizPayload = useMemo(
    () => ({ hoursPerWeek, capitalPhp, region, devices, internet, skills, urgency, goal }),
    [hoursPerWeek, capitalPhp, region, devices, internet, skills, urgency, goal]
  );

  function toggle(list: string[], value: string) {
    return list.includes(value) ? list.filter((x) => x !== value) : [...list, value];
  }

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as { ok?: boolean; profileId?: number; error?: string };
      if (!res.ok || !json?.ok || !json.profileId) {
        setError(json?.error ?? "May error. Try ulit.");
        return;
      }
      router.push(`/quiz/results/${json.profileId}`);
    } catch {
      setError("Network error. Try ulit.");
    } finally {
      setLoading(false);
    }
  }

  const StepIcon = STEP_ICONS[step - 1];

  const stepTitle = [
    "Ilang oras kada linggo ang kaya mo?",
    "Magkano ang puhunan mo?",
    "Saan ka nakatira?",
    "Anong device meron ka?",
    "Gaano kalakas ang internet mo?",
    "Ano ang skills mo?",
    "Kailan mo kailangan ng pera?",
    "Ano ang goal mo?",
  ][step - 1];

  const stepSub = [
    "Lagi kang on time sa sagot — okay lang kahit konti.",
    "Hindi kailangan malaki. Maraming raket ang ₱0 ang start.",
    "May mga raket na location-dependent (hal. mga rider apps).",
    "Piliin lahat ng nandiyan sa'yo.",
    "May online raket na kayang tumakbo sa mobile data lang.",
    "Multi-select — piliin lahat ng applicable.",
    "Speed vs. stability — para ma-match ang tamang raket.",
    "Pandagdag lang, o papalit sa full-time?",
  ][step - 1];

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="surface rounded-2xl p-4">
        <div className="flex items-center justify-between text-xs font-bold text-ink-500">
          <span className="inline-flex items-center gap-1.5 text-brand-700">
            <StepIcon className="h-4 w-4" strokeWidth={2.25} />
            Tanong {step} ng 8
          </span>
          <span className="tabular">{Math.round((step / 8) * 100)}%</span>
        </div>
        <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-ink-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-600 transition-all duration-500 ease-out"
            style={{ width: `${(step / 8) * 100}%` }}
          />
        </div>
      </div>

      {error ? (
        <div className="animate-pop-in rounded-2xl bg-rose-50 p-3.5 text-sm font-semibold text-rose-700 ring-1 ring-rose-200">
          {error}
        </div>
      ) : null}

      {/* Question card */}
      <section key={step} className="surface animate-pop-in rounded-2xl p-5">
        <h2 className="text-lg font-extrabold leading-snug tracking-tight text-ink-950">
          {stepTitle}
        </h2>
        <p className="mt-1 text-[13px] text-ink-500">{stepSub}</p>

        <div className="mt-5">
          {step === 1 && (
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { v: "1-5", l: "1–5 oras", s: "Konting oras lang" },
                { v: "5-15", l: "5–15 oras", s: "Part-time feel" },
                { v: "15-30", l: "15–30 oras", s: "Serious side hustle" },
                { v: "30+", l: "30+ oras", s: "Malapit nang full-time" },
              ].map((o) => (
                <OptionCard key={o.v} selected={hoursPerWeek === o.v} onClick={() => setHoursPerWeek(o.v)} label={o.l} sub={o.s} />
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { v: 0, l: "₱0", s: "Sagad na tipid" },
                { v: 1000, l: "₱1 – ₱1K", s: "Pasok sa allowance" },
                { v: 5000, l: "₱1K – ₱5K", s: "Konting ipon" },
                { v: 20000, l: "₱5K – ₱20K+", s: "May pondo" },
              ].map((o) => (
                <OptionCard key={o.v} selected={capitalPhp === o.v} onClick={() => setCapitalPhp(o.v)} label={o.l} sub={o.s} />
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { v: "NCR", l: "NCR / Metro Manila" },
                { v: "Luzon", l: "Luzon (outside NCR)" },
                { v: "Visayas", l: "Visayas" },
                { v: "Mindanao", l: "Mindanao" },
                { v: "Rural", l: "Rural / Probinsya" },
              ].map((o) => (
                <OptionCard key={o.v} selected={region === o.v} onClick={() => setRegion(o.v)} label={o.l} />
              ))}
            </div>
          )}

          {step === 4 && (
            <MultiGrid
              options={[
                { v: "phone", l: "Phone", icon: Smartphone },
                { v: "laptop", l: "Laptop / PC", icon: Laptop },
                { v: "motor", l: "Motor", icon: Bike },
                { v: "car", l: "Kotse", icon: Car },
              ]}
              selected={devices}
              onToggle={(v) => setDevices((d) => toggle(d, v))}
            />
          )}

          {step === 5 && (
            <div className="grid grid-cols-1 gap-2.5">
              {[
                { v: "data", l: "Mobile data lang", s: "Prepaid, konting load" },
                { v: "prepaid_wifi", l: "Prepaid WiFi", s: "Globe at Home type" },
                { v: "fiber", l: "Fiber / wired", s: "Stable at mabilis" },
                { v: "any", l: "Hindi ako laging online", s: "Offline raket ang hanap" },
              ].map((o) => (
                <OptionCard key={o.v} horizontal selected={internet === o.v} onClick={() => setInternet(o.v)} label={o.l} sub={o.s} />
              ))}
            </div>
          )}

          {step === 6 && (
            <div className="flex flex-wrap gap-2">
              {SKILLS.map((s) => {
                const active = skills.includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSkills((x) => toggle(x, s.id))}
                    className={cn(
                      "inline-flex h-10 items-center gap-1.5 rounded-full border px-4 text-[13px] font-bold transition-all active:scale-95",
                      active
                        ? "border-brand-600 bg-brand-600 text-white shadow-sm shadow-brand-600/25"
                        : "border-ink-200 bg-white text-ink-700 hover:border-ink-300"
                    )}
                  >
                    {active ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : null}
                    {s.label}
                  </button>
                );
              })}
            </div>
          )}

          {step === 7 && (
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { v: "This week", l: "This week", s: "Kailangan na agad" },
                { v: "1 month", l: "1 buwan", s: "Kaya maghintay konti" },
                { v: "3-6 months", l: "3–6 buwan", s: "May timeline" },
                { v: "Long-term", l: "Long-term", s: "Nag-iinvest sa future" },
              ].map((o) => (
                <OptionCard key={o.v} selected={urgency === o.v} onClick={() => setUrgency(o.v)} label={o.l} sub={o.s} />
              ))}
            </div>
          )}

          {step === 8 && (
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { v: "Pandagdag", l: "Pandagdag sa kita", s: "Extra income" },
                { v: "Palit-trabaho", l: "Palit-trabaho", s: "Gusto lumipat" },
                { v: "Negosyo", l: "Negosyo", s: "Magpapalaki" },
                { v: "Passion", l: "Passion project", s: "Enjoy + kita" },
              ].map((o) => (
                <OptionCard key={o.v} selected={goal === o.v} onClick={() => setGoal(o.v)} label={o.l} sub={o.s} />
              ))}
            </div>
          )}
        </div>

        {step === 8 && (
          <div className="mt-5 rounded-2xl bg-ink-50 p-3.5 ring-1 ring-ink-100">
            <p className="text-xs font-extrabold uppercase tracking-wide text-ink-500">Recap</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[
                `${hoursPerWeek} hrs/linggo`,
                `Puhunan: ₱${capitalPhp.toLocaleString()}`,
                region,
                devices.map((d) => (d === "phone" ? "Phone" : d === "laptop" ? "Laptop" : d === "motor" ? "Motor" : "Kotse")).join(" + "),
                internet === "data" ? "Mobile data" : internet === "prepaid_wifi" ? "Prepaid WiFi" : internet === "fiber" ? "Fiber" : "Hindi laging online",
                `${skills.length} skills`,
                urgency,
                goal,
              ].map((t, i) => (
                <span key={i} className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-ink-600 ring-1 ring-ink-200">
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Actions */}
      <div className="flex gap-2.5">
        <Button
          type="button"
          variant="secondary"
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          disabled={step === 1 || loading}
          className="shrink-0"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={2.5} />
          Balik
        </Button>
        {step < 8 ? (
          <Button type="button" onClick={() => setStep((s) => Math.min(8, s + 1))} disabled={loading} className="flex-1" size="lg">
            Susunod
            <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
          </Button>
        ) : (
          <Button type="button" onClick={submit} disabled={loading} className="flex-1" size="lg">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} />
                Nagko-compute...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" strokeWidth={2.5} />
                Ipakita ang matches
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

function OptionCard({
  selected,
  onClick,
  label,
  sub,
  horizontal,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  sub?: string;
  horizontal?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative rounded-2xl border-2 p-3.5 text-left transition-all duration-150 active:scale-[0.98]",
        horizontal ? "flex items-center gap-3" : "min-h-[76px]",
        selected
          ? "border-brand-600 bg-brand-50 shadow-sm shadow-brand-600/10"
          : "border-ink-200 bg-white hover:border-ink-300"
      )}
    >
      <span className={cn("block text-sm font-extrabold", selected ? "text-brand-800" : "text-ink-900")}>
        {label}
      </span>
      {sub ? (
        <span className={cn("mt-0.5 block text-xs font-medium", selected ? "text-brand-700/80" : "text-ink-400")}>
          {sub}
        </span>
      ) : null}
      {selected ? (
        <span className="absolute right-3 top-3 grid h-5 w-5 place-items-center rounded-full bg-brand-600 text-white">
          <Check className="h-3 w-3" strokeWidth={3.5} />
        </span>
      ) : null}
    </button>
  );
}

function MultiGrid({
  options,
  selected,
  onToggle,
}: {
  options: Array<{ v: string; l: string; icon: LucideIcon }>;
  selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {options.map((o) => {
        const active = selected.includes(o.v);
        return (
          <button
            key={o.v}
            type="button"
            onClick={() => onToggle(o.v)}
            className={cn(
              "flex items-center gap-3 rounded-2xl border-2 p-3.5 text-left transition-all active:scale-[0.98]",
              active ? "border-brand-600 bg-brand-50" : "border-ink-200 bg-white hover:border-ink-300"
            )}
          >
            <span
              className={cn(
                "grid h-10 w-10 place-items-center rounded-xl",
                active ? "bg-brand-600 text-white" : "bg-ink-100 text-ink-500"
              )}
            >
              <o.icon className="h-5 w-5" strokeWidth={2.25} />
            </span>
            <span className={cn("text-sm font-extrabold", active ? "text-brand-800" : "text-ink-900")}>
              {o.l}
            </span>
            {active ? (
              <span className="ml-auto grid h-5 w-5 place-items-center rounded-full bg-brand-600 text-white">
                <Check className="h-3 w-3" strokeWidth={3.5} />
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
