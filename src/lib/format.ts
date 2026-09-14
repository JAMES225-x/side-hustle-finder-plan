export function formatPhp(amount: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPhpRange(min: number, max: number, period: string) {
  const range = `${formatPhp(min)} – ${formatPhp(max)}`;

  const suffix =
    period === "day"
      ? "/ araw"
      : period === "job"
        ? "/ project"
        : "/ buwan";

  return `${range} ${suffix}`;
}

export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}
