import { cn } from "@/lib/cn";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("h-8 w-8", className)}
      role="img"
      aria-label="Side Hustle Finder PH logo"
    >
      <defs>
        <linearGradient id="lg-brand" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#188052" />
          <stop offset="1" stopColor="#0e442f" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#lg-brand)" />
      {/* Araw (sun) */}
      <circle cx="22" cy="10.5" r="3.4" fill="#fbbf24" />
      <path
        d="M22 4.5v2M27.5 10.5h-2M25.9 6.4l-1.4 1.4M25.9 14.6l-1.4-1.4"
        stroke="#fbbf24"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      {/* Peso sign */}
      <text
        x="8"
        y="24"
        fontSize="15"
        fontWeight="800"
        fill="#ffffff"
        fontFamily="ui-sans-serif, system-ui"
      >
        ₱
      </text>
    </svg>
  );
}
