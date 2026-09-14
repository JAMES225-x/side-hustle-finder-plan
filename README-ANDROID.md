# Opening this app in Android Studio

This project is a **fullstack Next.js app** (Server Components, API routes,
PostgreSQL via Drizzle). It is wrapped for Android using **Capacitor**, which
generates a native Gradle project (`android/`) that opens directly in Android
Studio and produces a real installable APK/AAB.

Because the app is dynamic (server-rendered pages + database-backed API
routes), it **cannot** be shipped as static HTML inside the APK. Instead, the
Android WebView is configured to load your **deployed** Next.js server over
HTTPS — the native shell just gives you an app icon, splash screen, and
native container.

## 1. Deploy the Next.js app

Deploy this project to any Node host (Vercel, Railway, Render, etc.) with a
production `DATABASE_URL` configured. Note your live HTTPS URL, e.g.
`https://side-hustle-finder-ph.vercel.app`.

## 2. Point the Android app at your deployment

Edit `capacitor.config.ts` at the project root:

```ts
const DEPLOYED_APP_URL = "https://side-hustle-finder-ph.vercel.app";
```

(or set `NEXT_PUBLIC_APP_URL` in your environment before running `cap sync`).

## 3. Sync the native project

From the project root:

```bash
npm install
npx cap sync android
```

This copies the config/assets into `android/app/src/main/assets`.

## 4. Open in Android Studio

- Open **Android Studio**
- Choose **Open** and select the `android/` folder in this project
- Let Gradle sync (first run downloads Gradle + SDK components)
- Press **Run ▶** to install on an emulator or a connected device

## 5. Build a release APK/AAB

Inside Android Studio: **Build → Generate Signed Bundle / APK**, then follow
the wizard to create a signing key and build the release artifact — or from
the command line:

```bash
cd android
./gradlew assembleDebug      # debug APK at app/build/outputs/apk/debug
./gradlew bundleRelease      # release AAB for the Play Store
```

## Notes

- App ID: `ph.sidehustlefinder.app` — change it in `capacitor.config.ts` (and
  re-run `npx cap sync android`) before publishing if you want a different
  package name.
- Native icon/splash assets live under `android/app/src/main/res`. Replace
  the `mipmap-*` and `drawable` folders with your own branded assets (or use
  `npx @capacitor/assets generate` with source images in `resources/`).
- If you add more Capacitor plugins later (e.g. push notifications, camera),
  install them with npm and run `npx cap sync android` again.
- The `android/` folder is a generated native project — safe to commit, but
  treat `capacitor.config.ts`'s `server.url` as an environment-specific
  setting you update per deployment (dev/staging/prod).
