import { PageHeader } from "@/components/PageHeader";
import { TrackerClient } from "@/app/tracker/TrackerClient";
import { Wallet } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kita Tracker",
  description: "I-log ang kita at gastos mo kada raket — automatic na net profit at monthly goal tracking.",
};

export default function TrackerPage() {
  return (
    <main className="space-y-4">
      <PageHeader
        icon={<Wallet className="h-5 w-5" strokeWidth={2.25} />}
        title="Kita Tracker"
        description="Log ang kita at gastos — alamin ang tunay mong net."
      />
      <TrackerClient />
    </main>
  );
}
