import { db } from "@/db";
import { quizProfiles } from "@/db/schema";
import { seedCoreData } from "@/db/seed";
import { requireUserId } from "@/lib/identity";
import { z } from "zod";

export const dynamic = "force-dynamic";

const QuizSchema = z.object({
  hoursPerWeek: z.enum(["1-5", "5-15", "15-30", "30+"])
    .or(z.string().min(1)),
  capitalPhp: z.number().int().min(0).max(1_000_000),
  region: z.enum(["NCR", "Luzon", "Visayas", "Mindanao", "Rural"]).or(z.string().min(1)),
  devices: z.array(z.enum(["phone", "laptop", "motor", "car"]).or(z.string())).default([]),
  internet: z.enum(["data", "prepaid_wifi", "fiber", "any"]).or(z.string().min(1)),
  skills: z.array(z.string()).default([]),
  urgency: z.enum(["This week", "1 month", "3-6 months", "Long-term"]).or(z.string().min(1)),
  goal: z.enum(["Pandagdag", "Palit-trabaho", "Negosyo", "Passion"]).or(z.string().min(1)),
});

export async function POST(req: Request) {
  // Best-effort seed so results have data.
  try {
    await seedCoreData();
  } catch {
    // ignore
  }

  const userId = await requireUserId();
  const body = await req.json().catch(() => null);

  const parsed = QuizSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { ok: false, error: "Invalid quiz payload", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const [row] = await db
    .insert(quizProfiles)
    .values({
      userId,
      hoursPerWeek: parsed.data.hoursPerWeek,
      capitalPhp: parsed.data.capitalPhp,
      region: parsed.data.region,
      devices: parsed.data.devices,
      internet: parsed.data.internet,
      skills: parsed.data.skills,
      urgency: parsed.data.urgency,
      goal: parsed.data.goal,
    })
    .returning({ id: quizProfiles.id });

  return Response.json({ ok: true, profileId: row?.id });
}
