import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import { BottomNav } from "@/components/BottomNav";
import { AppHeader } from "@/components/AppHeader";
import { IdentityBootstrapper } from "@/components/IdentityBootstrapper";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Side Hustle Finder PH — Hanap ng Legit na Raket",
    template: "%s · Side Hustle Finder PH",
  },
  description:
    "Ang unang app na tumutulong sa mga Pilipino na maghanap ng legit na raket na bagay sa oras, puhunan, at lugar nila — may Scam Shield at Legal Starter Kit pa.",
  keywords: [
    "side hustle philippines",
    "raket",
    "dagdag kita",
    "negosyo",
    "legit online job",
    "paano kumita",
  ],
};

export const viewport: Viewport = {
  themeColor: "#136743",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tl" className={inter.variable}>
      <body className="min-h-screen w-full overflow-x-hidden font-sans text-ink-900 antialiased">
        <IdentityBootstrapper />
        <div className="mx-auto flex min-h-screen w-full max-w-md flex-col overflow-x-clip sm:max-w-lg">
          <AppHeader />
          <div className="w-full min-w-0 flex-1 px-4 pb-28 pt-4">{children}</div>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
