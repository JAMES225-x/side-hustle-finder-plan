import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Side Hustle Finder PH",
    short_name: "HustlePH",
    description: "Legit-first side hustle finder for Filipinos (quiz, scam shield, legal kit).",
    start_url: "/",
    display: "standalone",
    background_color: "#F6F7F8",
    theme_color: "#136743",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
