import { PageHeader } from "@/components/PageHeader";
import { QuizWizard } from "@/app/quiz/QuizWizard";
import { Disclaimer } from "@/components/Disclaimer";
import { Sparkles } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kita Match Quiz",
  description: "8 tanong, under 90 seconds — alamin kung anong raket ang bagay sa'yo.",
};

export default function QuizPage() {
  return (
    <main className="space-y-4">
      <PageHeader
        icon={<Sparkles className="h-5 w-5" strokeWidth={2.25} />}
        title="Kita Match Quiz"
        description="8 tanong · Under 90 seconds · Taglish"
      />
      <QuizWizard />
      <Disclaimer variant="estimates" />
    </main>
  );
}
