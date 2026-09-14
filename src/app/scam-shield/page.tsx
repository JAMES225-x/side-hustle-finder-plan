import { PageHeader } from "@/components/PageHeader";
import { ScamShieldClient } from "@/app/scam-shield/scamShieldClient";
import {
  GraduationCap,
  Layers,
  PiggyBank,
  ShieldAlert,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";
import type { Metadata } from "next";
import type { LucideIcon } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Scam Shield",
  description:
    "I-check ang job offer, FB page, o investment pitch bago ka mahulog — red-flag detector at community scam reports.",
};

const LESSONS: Array<{
  icon: LucideIcon;
  title: string;
  points: string[];
}> = [
  {
    icon: Layers,
    title: "Pyramid vs. Legit MLM vs. Direct Selling",
    points: [
      "PYRAMID: Kumikita ka kapag may NAPASALI ka — hindi sa benta ng produkto. Illegal at laging babagsak.",
      "LEGIT MLM: May totoong produktong ibinebenta sa retail; bonus lang ang recruitment — at hindi ito ang pangunahing kita.",
      "DIRECT SELLING: Benta ka ng produkto, commission ka — walang buy-in na malaki, walang recruitment pressure.",
      "Litmus test: Kung kailangan mong mag-recruit para kumita, umalis ka na.",
    ],
  },
  {
    icon: PiggyBank,
    title: "Paluwagan Risk Explainer",
    points: [
      "Ang paluwagan ay based sa TIWALA — walang legal protection kapag tumakas ang admin.",
      "Red flag: Paluwagan sa FB/Messenger kung hindi mo kakilala nang personal ang admin.",
      "Mas delikado: 'Online paluwagan' na may bonus sa pag-recruit — pyramid scheme na iyan.",
      "Alternatibo: MP2 o cooperative savings — may legal na proteksyon.",
    ],
  },
  {
    icon: TrendingUp,
    title: "'Crypto Mentor' / Forex Signal Scams",
    points: [
      "Pattern: Flexing ng lifestyle, 'ganto kumita sa crypto', tapos offer ng 'mentorship' o 'signals'.",
      "Kapag nagpadala ka ng pera sa kanilang 'trading account', malamang wala ka nang makikitang withdrawal.",
      "Red flag: Guaranteed ROI, screenshots ng 'earnings', urgency na 'last 5 slots'.",
      "I-check: SEC advisories para sa mga unregistered investment schemes.",
    ],
  },
  {
    icon: ShoppingBag,
    title: "Fake Online Seller Checklist",
    points: [
      "Bagong page, konting followers, walang reviews — pero 'nasa sale' lahat?",
      "Ayaw sa COD (cash on delivery) at gusto laging full payment agad via GCash.",
      "Ninakaw na product photos — i-google image search kung pamilyar.",
      "Presyo na sobrang mura kumpara sa presyo sa mall — baka too good to be true.",
    ],
  },
  {
    icon: ShieldAlert,
    title: "Job Scam Red Flags",
    points: [
      "'Placement fee', 'training fee', 'medical fee' bago ka mag-start — red flag agad.",
      "Interview sa Telegram/WhatsApp lang, walang official email o office address.",
      "'Task-based' na trabaho: mag-like/subscribe ka tapos magbabayad ka para sa 'bigger tasks'.",
      "Remember: Sa legit na trabaho, IKAW ang binabayaran — hindi ka ang nagbabayad.",
    ],
  },
];

export default function ScamShieldPage() {
  return (
    <main className="space-y-4">
      <PageHeader
        icon={<ShieldAlert className="h-5 w-5" strokeWidth={2.25} />}
        title="Scam Shield"
        description="I-paste ang offer o message — i-check ang mga red flags."
      />

      <ScamShieldClient />

      {/* Scam education */}
      <section className="animate-fade-up space-y-3 pt-2">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-brand-700" strokeWidth={2.25} />
          <h2 className="text-base font-extrabold tracking-tight text-ink-950">
            Aralin: Kilala mo ba ang mga scam na 'to?
          </h2>
        </div>

        <div className="space-y-2.5">
          {LESSONS.map((lesson, i) => (
            <details
              key={lesson.title}
              className="surface group animate-fade-up overflow-hidden rounded-2xl open:ring-1 open:ring-brand-200"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <summary className="flex cursor-pointer items-center gap-3 p-4 [&::-webkit-details-marker]:hidden">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-rose-50 text-rose-600">
                  <lesson.icon className="h-5 w-5" strokeWidth={2.25} />
                </span>
                <span className="flex-1 text-sm font-extrabold tracking-tight text-ink-950">
                  {lesson.title}
                </span>
                <span className="grid h-6 w-6 place-items-center rounded-full bg-ink-100 text-ink-500 transition-transform group-open:rotate-45">
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </span>
              </summary>
              <ul className="space-y-2 px-4 pb-4 pl-[68px]">
                {lesson.points.map((p, j) => (
                  <li key={j} className="flex items-start gap-2 text-[13px] leading-relaxed text-ink-600">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
                    {p}
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </div>
      </section>

      <div className="flex items-start gap-2.5 rounded-2xl bg-ink-100/70 p-3 text-[11px] leading-relaxed text-ink-500">
        <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-400" />
        <p>
          Ang Scam Shield ay gabay at community signal lamang — hindi ito legal determination.
          I-cross-check pa rin ang official SEC advisories at mag-report sa PNP-ACG o NBI kung
          nabiktima ka.
        </p>
      </div>
    </main>
  );
}
