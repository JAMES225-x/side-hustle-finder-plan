import { clamp } from "@/lib/format";

export type ScamShieldFlag = {
  id: string;
  labelTl: string;
  weight: number;
  regex: RegExp;
};

export type ScamShieldResult = {
  riskScore: number; // 0..100
  riskLevel: "green" | "yellow" | "red";
  redFlags: Array<{ id: string; labelTl: string; evidence?: string }>;
  tipsTl: string[];
};

const FLAGS: ScamShieldFlag[] = [
  {
    id: "upfront_fee",
    labelTl: "May hinihinging upfront payment / registration fee",
    weight: 35,
    regex: /(registration fee|slot fee|training fee|processing fee|upfront|pa-?membership|join fee|bayad muna)/i,
  },
  {
    id: "recruitment_based",
    labelTl: "Recruitment-based ang kita (pyramid pattern)",
    weight: 25,
    regex: /(invite|recruit|downline|upline|binary|matrix|pyramid|magpasali ng)/i,
  },
  {
    id: "guaranteed_roi",
    labelTl: "Guaranteed high ROI / " + "sure profit" + " claims",
    weight: 20,
    regex: /(guaranteed|sure profit|double your money|100% profit|kita agad|instant income|no risk)/i,
  },
  {
    id: "otp_pin",
    labelTl: "Humihingi ng OTP / GCash PIN / Maya PIN",
    weight: 45,
    regex: /(otp|one[-\s]?time password|gcash pin|maya pin|verification code|send code)/i,
  },
  {
    id: "too_good",
    labelTl: "Sobrang taas ng kita for minimal work",
    weight: 15,
    regex: /(\b(20k|30k|50k|100k)\b.*(1\s*day|2\s*days|week)|easy money|kahit tulog kumikita)/i,
  },
  {
    id: "pressure_urgency",
    labelTl: "May pressure tactics (" + "limited slots" + ", hurry)",
    weight: 10,
    regex: /(limited slots|hurry|last chance|today only|pm me now|wag mo palampasin)/i,
  },
];

function extractEvidence(input: string, regex: RegExp) {
  const m = input.match(regex);
  if (!m) return undefined;
  return m[0].slice(0, 80);
}

export function analyzeScamText(text: string): ScamShieldResult {
  const input = (text ?? "").trim();

  if (!input) {
    return {
      riskScore: 0,
      riskLevel: "green",
      redFlags: [],
      tipsTl: [
        "Mag-paste ng job offer, page name, o message para ma-check.",
        "Tip: i-include ang screenshot text (kung meron) para mas accurate.",
      ],
    };
  }

  let score = 0;
  const redFlags: ScamShieldResult["redFlags"] = [];

  for (const flag of FLAGS) {
    if (flag.regex.test(input)) {
      score += flag.weight;
      redFlags.push({
        id: flag.id,
        labelTl: flag.labelTl,
        evidence: extractEvidence(input, flag.regex),
      });
    }
  }

  score = clamp(score, 0, 100);

  const riskLevel = score >= 70 ? "red" : score >= 35 ? "yellow" : "green";

  const tipsTl = [
    "Walang legit na trabaho na kailangan mo munang magbayad bago kumita.",
    "Huwag mag-share ng OTP, PIN, o personal IDs sa strangers.",
    "Kung investment/ROI ang usapan, i-check ang SEC advisories at registration.",
  ];

  return { riskScore: score, riskLevel, redFlags, tipsTl };
}
