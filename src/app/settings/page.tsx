import { getCurrentUser } from "@/lib/auth";
import { PageHeader } from "@/components/PageHeader";
import { SettingsClient } from "@/app/settings/SettingsClient";
import { Settings } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Settings",
  description: "I-manage ang profile, account, at data mo.",
};

export default async function SettingsPage() {
  const user = await getCurrentUser();

  return (
    <main className="space-y-4">
      <PageHeader
        icon={<Settings className="h-5 w-5" strokeWidth={2.25} />}
        title="Settings"
        description="Profile, account, at data privacy."
      />
      <SettingsClient initialUser={user} />
    </main>
  );
}
