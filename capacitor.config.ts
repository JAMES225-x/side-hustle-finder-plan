import type { CapacitorConfig } from "@capacitor/cli";

// ---------------------------------------------------------------------------
// Side Hustle Finder PH — Capacitor config
//
// This app is a fullstack Next.js app (Server Components + API routes +
// PostgreSQL). It cannot be exported as static HTML, so the Android WebView
// is pointed at your deployed Next.js server instead of bundling local files.
//
// 1. Deploy this Next.js project (e.g. to Vercel) with your production
//    DATABASE_URL configured.
// 2. Replace the `server.url` below with your deployed HTTPS domain.
// 3. Run `npx cap sync android` then open the `android/` folder in
//    Android Studio to build/run the app. See README-ANDROID.md.
// ---------------------------------------------------------------------------

const DEPLOYED_APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://your-deployed-domain.com";

const config: CapacitorConfig = {
  appId: "ph.sidehustlefinder.app",
  appName: "Side Hustle Finder PH",
  webDir: "public",
  server: {
    url: DEPLOYED_APP_URL,
    cleartext: false,
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
