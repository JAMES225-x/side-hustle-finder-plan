import { ShieldAlert } from "lucide-react";

export function Disclaimer({
  variant = "legal",
}: {
  variant?: "legal" | "estimates";
}) {
  const text =
    variant === "legal"
      ? "Gabay lang ito — hindi legal o tax advice. Kumonsulta sa DTI/BIR o accountant."
      : "TANTIYA LAMANG ang mga kita figures. Base sa community research — hindi guaranteed at hindi investment advice.";

  return (
    <div className="flex items-start gap-2.5 rounded-2xl bg-ink-100/70 p-3 text-[11px] leading-relaxed text-ink-500">
      <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-400" />
      <p>{text}</p>
    </div>
  );
}
