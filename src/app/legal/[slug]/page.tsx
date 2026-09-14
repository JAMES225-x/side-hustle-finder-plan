import { notFound } from "next/navigation";
import { db } from "@/db";
import { legalGuides } from "@/db/schema";
import { Badge } from "@/components/ui/Badge";
import { Disclaimer } from "@/components/Disclaimer";
import { BookOpenCheck } from "lucide-react";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

function renderBody(body: string) {
  // Minimal markdown-ish rendering: **bold** inline, keep newlines
  const parts = body.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-extrabold text-ink-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export default async function LegalGuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const rows = await db.select().from(legalGuides).where(eq(legalGuides.slug, slug)).limit(1);
  const guide = rows[0];
  if (!guide) notFound();

  const paragraphs = guide.bodyTl.split("\n");

  return (
    <main className="space-y-4">
      <section className="animate-fade-up space-y-2">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-sky-50 text-sky-600">
          <BookOpenCheck className="h-5 w-5" strokeWidth={2.25} />
        </div>
        <h1 className="text-xl font-extrabold leading-tight tracking-tight text-ink-950">
          {guide.titleTl}
        </h1>
        <div className="flex flex-wrap gap-1.5">
          {guide.agency ? <Badge tone="blue">{guide.agency}</Badge> : null}
          <Badge>
            Last verified:{" "}
            {new Date(guide.lastVerifiedAt).toLocaleDateString("en-PH", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </Badge>
        </div>
      </section>

      <Disclaimer variant="legal" />

      <article className="surface animate-fade-up rounded-2xl p-5">
        <div className="space-y-2">
          {paragraphs.map((p, i) =>
            p.trim() === "" ? (
              <div key={i} className="h-2" />
            ) : (
              <p key={i} className="text-sm leading-[1.75] text-ink-700">
                {renderBody(p)}
              </p>
            )
          )}
        </div>
      </article>
    </main>
  );
}
