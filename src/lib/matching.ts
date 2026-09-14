import type { InferSelectModel } from "drizzle-orm";
import { clamp } from "@/lib/format";
import { hustles, quizProfiles } from "@/db/schema";

export type HustleRow = InferSelectModel<typeof hustles>;
export type QuizProfileRow = InferSelectModel<typeof quizProfiles>;

const INTERNET_RANK: Record<string, number> = {
  data: 1,
  prepaid_wifi: 2,
  fiber: 3,
  any: 0,
};

function parseHoursBucket(bucket: string): { min: number; max: number } {
  switch (bucket) {
    case "1-5":
      return { min: 1, max: 5 };
    case "5-15":
      return { min: 5, max: 15 };
    case "15-30":
      return { min: 15, max: 30 };
    case "30+":
      return { min: 30, max: 60 };
    default:
      return { min: 1, max: 60 };
  }
}

function capitalFits(capitalPhp: number, hustle: HustleRow) {
  return capitalPhp >= hustle.capitalMinPhp;
}

function regionFits(region: string, hustle: HustleRow) {
  if (!hustle.regions || hustle.regions.length === 0) return true;
  if (hustle.regions.includes("Nationwide")) return true;
  if (region === "Rural" && hustle.regions.includes("Rural-friendly")) return true;
  return hustle.regions.includes(region);
}

function devicesFit(devices: string[], hustle: HustleRow) {
  const need = hustle.requiresDevices ?? [];
  if (need.length === 0) return true;
  const set = new Set((devices ?? []).map((d) => d.toLowerCase()));
  return need.every((n) => set.has(n.toLowerCase()));
}

function internetFits(internet: string, hustle: HustleRow) {
  const need = hustle.requiresInternet ?? "any";
  if (need === "any") return true;
  const haveRank = INTERNET_RANK[internet] ?? 0;
  const needRank = INTERNET_RANK[need] ?? 0;
  return haveRank >= needRank;
}

function overlapCount(a: string[], b: string[]) {
  const setA = new Set((a ?? []).map((x) => x.toLowerCase()));
  let count = 0;
  for (const item of b ?? []) {
    if (setA.has(item.toLowerCase())) count++;
  }
  return count;
}

export function computeMatch(profile: QuizProfileRow, hustle: HustleRow) {
  const reasons: string[] = [];
  let score = 0;

  // Region (20)
  if (regionFits(profile.region, hustle)) {
    score += 20;
    reasons.push("Available sa lugar mo (o nationwide)");
  } else {
    reasons.push("Baka hindi available sa area mo");
  }

  // Capital (20)
  if (capitalFits(profile.capitalPhp, hustle)) {
    score += 20;
    reasons.push("Pasok sa puhunan mo");
  } else {
    reasons.push("Mukhang kulang ang puhunan sa ngayon");
  }

  // Devices (15)
  if (devicesFit(profile.devices, hustle)) {
    score += 15;
    reasons.push("Pasok sa devices mo");
  } else {
    reasons.push("Kulang ang required device");
  }

  // Internet (10)
  if (internetFits(profile.internet, hustle)) {
    score += 10;
    reasons.push("Kaya ng internet mo");
  } else {
    reasons.push("Baka kailangan ng mas stable na internet");
  }

  // Skills (20)
  const skillsHit = overlapCount(profile.skills, hustle.skillsRequired);
  if ((hustle.skillsRequired?.length ?? 0) === 0) {
    score += 12;
  } else {
    score += clamp(Math.round((skillsHit / hustle.skillsRequired.length) * 20), 0, 20);
  }
  if (skillsHit > 0) reasons.push(`May tugma sa skills mo (${skillsHit} match)`);

  // Time availability (15)
  const bucket = parseHoursBucket(profile.hoursPerWeek);
  const okTime = bucket.max >= hustle.hoursMinPerWeek;
  if (okTime) {
    score += 15;
    reasons.push("Kaya sa oras mo");
  } else {
    reasons.push("Baka mabigat sa oras mo");
  }

  // Urgency bonus/penalty (up to ±5)
  if (profile.urgency === "This week") {
    score += hustle.timeToFirstPesoDays <= 7 ? 5 : 0;
  }

  score = clamp(score, 0, 100);

  return { score, reasons };
}
