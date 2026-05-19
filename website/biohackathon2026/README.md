# Pearl

A women's-health platform for understanding and managing PCOS. Marketing site + patient app + clinician dashboard.

## Stack

- **Framework:** [Next.js 14](https://nextjs.org) (App Router)
- **Language:** TypeScript
- **UI:** React 18, plain CSS variables (no UI lib)
- **Fonts:** Manrope + Newsreader, via `next/font/google`

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Other scripts:

```bash
npm run build         # production build
npm run start         # serve production build
npm run lint          # next/eslint
npm run type-check    # tsc --noEmit
```

## Project structure

```
app/
├─ layout.tsx              Root layout — fonts, global nav, palette provider
├─ globals.css             Design tokens + reset + utility classes
├─ page.tsx                /             — marketing landing
├─ assessment/page.tsx     /assessment   — 3-min PCOS questionnaire
├─ results/page.tsx        /results      — patient risk report
├─ tracker/page.tsx        /tracker      — cycle & symptom tracker
├─ booking/page.tsx        /booking      — doctor booking flow
└─ doctor/page.tsx         /doctor       — clinician dashboard

components/
├─ TopNav.tsx              Sticky header, view toggle (patient/doctor)
├─ PaletteProvider.tsx     Theme context + applies CSS vars
├─ Icon.tsx                Inline SVG icon set
├─ Logo.tsx                Pearl wordmark
├─ Avatar.tsx              Initials avatar
├─ Eyebrow.tsx             Uppercase section label
├─ Stat.tsx                Big-number stat block
└─ screens/                Page bodies (client components)
   ├─ Landing.tsx
   ├─ Assessment.tsx
   ├─ Results.tsx
   ├─ Tracker.tsx
   ├─ Booking.tsx
   └─ Doctor.tsx

lib/
├─ palettes.ts             Color-theme presets + applyPalette()
├─ screens.ts              Route/nav metadata + ScreenId type
└─ useGo.ts                Hook that wraps useRouter for navigation by screen id

public/                    Static assets
```

## TypeScript notes

- `tsconfig.json` runs `strict: true` with `noImplicitAny: false` so the screen-internal helper components (lifted unchanged from the prototype) don't need exhaustive prop types. The public surface — exported screens, lib functions, types — is fully typed. Tighten `noImplicitAny` to `true` when you're ready to type the helpers.
- Path alias `@/*` resolves from the project root (e.g. `@/components/Icon`).
- A canonical `ScreenId` union lives in `lib/screens.ts` — use it whenever you accept a screen identifier.

## Routing

The app uses Next.js App Router file-based routing. Each top-level screen is a folder under `app/` with a `page.tsx`. Screens are **client components** (they use React state for assessment progress, tracker selection, etc.) — pages thinly wrap them.

Screen components receive a `go(id)` function that wraps `useRouter().push(...)`. This preserves the original prop shape while delegating to real Next.js navigation.
