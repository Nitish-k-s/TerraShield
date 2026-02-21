# TerraShield — Project Source of Truth
> **⚠️ CANONICAL REFERENCE — ALL AGENTS ON ALL DEVICES MUST FOLLOW THIS DOCUMENT.**
> Do NOT hallucinate features, implementations, or architecture details.
> If something is not listed here, ASK THE USER before implementing it.
> Suggest alternatives only when an existing approach appears technically incorrect.

---

## 1. Product Vision

**TerraShield** is an **AI-powered ecological intelligence platform** designed to detect invasive species outbreaks 6–12 months earlier than traditional field survey methods.

Citizens (farmers, hikers, environmental observers) submit geo-tagged photographs of plants or animals they suspect may be invasive. The system:

1. Analyses photos with AI vision to identify species, estimate confidence, and assess ecological risk.
2. Cross-references a structured invasive species reference database to verify whether the identified species is invasive in the reported region.
3. Pulls **Sentinel-2 satellite imagery** to compute **NDVI (Normalized Difference Vegetation Index)** and detect vegetation anomalies over time.
4. Correlates ground-truth citizen reports with satellite vegetation anomalies.
5. Generates **outbreak alerts** with a confidence score based on report density, AI confidence, and satellite anomaly magnitude.
6. Provides an **interactive map dashboard** for users and environmental agencies to visualise sightings, risk zones, alert status, and outbreak progression.

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js 14)                    │
│  - Report submission form (geo-tagged image upload)             │
│  - Interactive outbreak map dashboard                           │
│  - Risk level visualisation                                     │
│  - Auth: Supabase email/password + OAuth callback              │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTP / REST
┌────────────────────────▼────────────────────────────────────────┐
│                     NEXT.JS API ROUTES (Backend)                │
│  POST /api/extract-exif   — multipart upload → EXIF + GPS       │
│  POST /api/analyse-exif   — AI analysis via Gemini              │
│  [future] POST /api/submit-report — full citizen report         │
│  [future] GET  /api/outbreak-alerts — alert feed                │
│  [future] GET  /api/ndvi  — satellite vegetation data           │
└────────┬───────────────┬────────────────────────────────────────┘
         │               │
┌────────▼──────┐ ┌──────▼───────────────────────────────────────┐
│ SQLite (local)│ │   Supabase (cloud)                           │
│ lib/db/exif.db│ │   - Auth (users, sessions)                   │
│ exif_data tbl │ │   - [future] reports, species DB, alerts      │
└───────────────┘ └──────────────────────────────────────────────┘
         │
┌────────▼──────────────────────────────────────────────────────┐
│                    AI LAYER (Google Gemini)                    │
│  Model: gemini-1.5-flash                                      │
│  Purpose: species identification + ecological risk scoring    │
│  Prompt: structured JSON output (label, confidence, risk,     │
│          tags, summary)                                       │
└───────────────────────────────────────────────────────────────┘
         │
┌────────▼──────────────────────────────────────────────────────┐
│                SATELLITE LAYER [PLANNED]                      │
│  Source: Sentinel-2 Earth observation                         │
│  Metric: NDVI (Normalized Difference Vegetation Index)        │
│  Purpose: Detect vegetation anomalies correlated with        │
│           invasive species spread                             │
└───────────────────────────────────────────────────────────────┘
```

---

## 3. Tech Stack

| Layer | Technology | Version / Notes |
|---|---|---|
| Framework | Next.js | ^14.2.0 (App Router) |
| Language | TypeScript | ^5.0.0 |
| Runtime | Node.js | (not Edge) |
| Auth | Supabase SSR | ^0.8.0 |
| Supabase JS client | @supabase/supabase-js | ^2.97.0 |
| AI model | Google Gemini | @google/generative-ai ^0.24.1, model: `gemini-1.5-flash` |
| EXIF parsing | exifr | ^7.1.3 |
| Multipart upload | formidable | ^3.5.2 |
| Local DB | better-sqlite3 | ^12.6.2 |
| React | React + ReactDOM | ^18.3.0 |

---

## 4. Project File Structure (current)

```
TerraShield/
├── .env.local                         # Environment secrets (never commit)
├── .gitignore
├── next.config.mjs                    # Next config (exifr, formidable as external packages)
├── package.json
├── tsconfig.json
├── middleware.ts                      # Auth guard — only covers Next.js app/api routes
│                                      # Excludes public/ SPA assets from auth
│
├── public/                            # Static files — served by Next.js at root URL
│   ├── index.html                     # ← SPA entry point (served at /index.html)
│   ├── pages/                         # Vanilla JS page renderers
│   │   ├── home.js, about.js, login.js, signup.js
│   │   ├── sdgs.js (Alerts), take-action.js (Report), forgot-password.js
│   ├── components/                    # navbar.js, footer.js
│   ├── styles/                        # variables.css, base.css, components.css, pages.css
│   ├── animations/                    # animations.css
│   ├── utils/                         # router.js (hash SPA router), scroll-observer.js, lazy-load.js
│   └── asserts/                       # Static image assets
│
├── frontend/                          # SOURCE of public/ — edit here, then sync to public/
│   └── [mirrors public/ structure]
│
├── app/
│   ├── layout.tsx                     # Root layout with TerraShield metadata
│   ├── page.tsx                       # Redirects / → /index.html (the SPA)
│   ├── login/
│   │   └── page.tsx                   # Next.js login page (Supabase email+password)
│   └── auth/
│       └── callback/
│           └── route.ts               # OAuth code exchange handler
│   └── api/
│       ├── extract-exif/
│       │   └── route.ts               # POST: image upload → EXIF + GPS → SQLite insert
│       └── analyse-exif/
│           └── route.ts               # POST: { recordId } → Gemini Vision multimodal
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                  # Browser Supabase client
│   │   └── server.ts                  # Server-side Supabase client (cookie-based)
│   └── db/
│       ├── exif.ts                    # SQLite schema, CRUD helpers
│       ├── exif.db                    # SQLite database file (WAL mode)
│       ├── exif.db-shm                # SQLite shared memory (WAL)
│       └── exif.db-wal                # SQLite write-ahead log
│
└── scripts/
    ├── check-db.js                    # Dev utility: print all rows in exif_data
    └── migrate-add-image-data.js      # One-time: adds image_data BLOB column
```

---

## 5. Environment Variables

File: `.env.local` (never commit to git)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous (public) key |
| `GEMINI_API_KEY` | Google Gemini API key (server-side only, never exposed to browser) |

---

## 6. Implemented Features (current state as of 2026-02-21)

### ✅ Auth System
- Supabase email + password authentication
- Sign Up / Sign In form at `/login`
- OAuth callback at `/auth/callback`
- Middleware protects all routes except `/login` and `/auth/**`
- Authenticated users redirected away from `/login` to `/`

### ✅ EXIF Extraction — `POST /api/extract-exif`
- Accepts `multipart/form-data` with field name `image`
- Uses `exifr` to extract ALL EXIF tags from uploaded image
- Extracts structured GPS fields (lat, lng, altitude, refs)
- Builds Google Maps deep-link URL when GPS present
- Saves record to local SQLite `exif_data` table via `insertExifRecord()`
- Returns `{ success, recordId, filename, mimeType, gps, allTags, mapsUrl }`
- Auth-guarded: 401 if no Supabase session
- Max upload size: 50 MB

### ✅ AI Analysis — `POST /api/analyse-exif`
- Accepts `{ recordId: number }` (single record) or `{ pending: true }` (all un-analysed)
- Loads record from SQLite — including stored image BLOB
- **Sends actual image bytes to Gemini Vision** (`gemini-1.5-flash` multimodal) as `inlineData`
- EXIF context (GPS, device, timestamp, resolution) provided alongside image as text — NOT re-parsed by Gemini
- Falls back to metadata-only text prompt if `image_data` is NULL (legacy records pre-BLOB migration)
- Expects JSON response: `ai_label`, `ai_confidence` (0–1), `ai_risk_score` (0–10), `ai_tags` (string[]), `ai_summary`
- AI label vocabulary: `invasive-plant | invasive-animal | deforestation | wildfire | urban-encroachment | flood-risk | normal-terrain | unknown`
- Writes results back to SQLite `ai_*` columns via `updateAiAnalysis()`
- Response includes `used_vision: boolean` debug flag indicating whether image was sent
- Auth-guarded: 401 if no Supabase session
- Handles markdown-fence stripping from Gemini output
- Clamps confidence to [0,1] and risk score to [0,10]

### ✅ SQLite Database (`lib/db/exif.ts`)
**Table: `exif_data`**

| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER PK AUTOINCREMENT | |
| `user_id` | TEXT NOT NULL | Supabase auth user UUID |
| `filename` | TEXT NOT NULL | |
| `mime_type` | TEXT NOT NULL | |
| `file_size_bytes` | INTEGER | optional |
| `latitude` | REAL | WGS-84 decimal degrees |
| `longitude` | REAL | WGS-84 decimal degrees |
| `altitude` | REAL | metres above sea level |
| `latitude_ref` | TEXT | "N" or "S" |
| `longitude_ref` | TEXT | "E" or "W" |
| `maps_url` | TEXT | Google Maps deep-link |
| `make` | TEXT | camera make |
| `model` | TEXT | camera model |
| `software` | TEXT | |
| `date_time` | TEXT | ISO-like original capture time |
| `exposure_time` | TEXT | e.g. "1/1000" |
| `f_number` | REAL | aperture |
| `iso` | INTEGER | |
| `focal_length` | REAL | mm |
| `flash` | TEXT | |
| `image_width` | INTEGER | |
| `image_height` | INTEGER | |
| `orientation` | INTEGER | EXIF orientation 1–8 |
| `color_space` | TEXT | |
| `ai_label` | TEXT | e.g. "deforestation" |
| `ai_confidence` | REAL | 0.0–1.0 |
| `ai_tags` | TEXT | JSON array string |
| `ai_summary` | TEXT | free-text |
| `ai_risk_score` | REAL | 0.0–10.0 |
| `ai_analysed_at` | TEXT | ISO-8601 |
| `all_tags_json` | TEXT NOT NULL | full EXIF dump |
| `image_data` | BLOB | raw image bytes (stored for Gemini Vision) |
| `created_at` | TEXT | auto |
| `updated_at` | TEXT | auto (trigger) |

**Indexes:** `user_id`, `(latitude, longitude)`, `ai_label`

**CRUD helpers exported:**
- `insertExifRecord(data: InsertExifRecord): number`
- `getExifById(id: number): ExifRecord | undefined`
- `getExifByUser(userId: string): ExifRecord[]`
- `getPendingAiAnalysis(): ExifRecord[]`
- `updateAiAnalysis(id: number, update: AiAnalysisUpdate): void`
- `deleteExifRecord(id: number): void`
- `countExifRecords(): number`

### ✅ Test/Dev UI (`app/page.tsx`)
- Upload an image → shows EXIF GPS data + all tags table
- Button to trigger Gemini AI analysis for the uploaded record
- Displays `ai_label`, `ai_risk_score` (colour-coded: green/orange/red), `ai_confidence`, `ai_tags`, `ai_summary`
- Logged-in user email shown in header
- Sign Out button

---

## 7. Planned Features (NOT yet implemented — ask user before building)

These arise from the project vision and have NOT been coded yet:

| Feature | Notes |
|---|---|
| Full citizen report submission form | Beyond EXIF; should capture species description, notes, photo |
| Invasive species reference database | Structured DB of known invasive species per region |
| Outbreak clustering algorithm | Group reports by geo-proximity + time window |
| Outbreak confidence score engine | Combines report density + AI confidence + NDVI anomaly magnitude |
| Sentinel-2 NDVI integration | Satellite data retrieval + vegetation index computation |
| Outbreak alerts system | Alert records with confidence scores, send to agencies |
| Interactive map dashboard | Leaflet / Mapbox map showing sightings, anomaly zones, risk overlays |
| Ecological risk summary export | PDF/CSV report for environmental agencies |
| Admin dashboard | Manage users, view DB health, approve reports |
| Migration from SQLite → Supabase/PostGIS | For production geospatial queries |
| FastAPI backend | Mentioned in vision; currently all backend is Next.js API routes |

> **⚠️ NOTE on FastAPI:** The project vision mentions a FastAPI backend. The **current implementation uses Next.js API routes exclusively**. Do NOT add a FastAPI server unless the user explicitly requests it and the migration strategy is agreed upon.

---

## 8. Key Implementation Rules & Constraints

1. **Auth is required on every API route** — always check `supabase.auth.getUser()` first, return 401 if no user.
2. **SQLite is local-only** — `lib/db/exif.db` runs in the Node.js server process. It is NOT accessible from browsers or edge functions.
3. **Gemini key is server-side only** — `GEMINI_API_KEY` must NEVER be exposed to the browser.
4. **All API routes must use `export const runtime = "nodejs"`** — formidable and better-sqlite3 are not Edge-compatible.
5. **Supabase client usage:** use `lib/supabase/client.ts` in Client Components / browser, use `lib/supabase/server.ts` in Server Components / API routes.
6. **formidable parses multipart** — Next.js App Router does not auto-parse multipart forms; always use the `requestToNodeIncoming()` helper.
7. **DB is singleton via global** — `global.__exifDb` caches the SQLite connection to avoid hot-reload issues in dev.
8. **WAL mode is enabled** — the SQLite DB uses WAL + `foreign_keys = ON` pragmas.
9. **next.config.mjs** — `exifr` and `formidable` are listed as `serverComponentsExternalPackages` — do not remove this.
10. **AI label vocabulary** (current Gemini prompt): `deforestation | wildfire | urban-encroachment | flood-risk | normal-terrain | unknown` — extend this list only with user approval.

---

## 9. Supabase Configuration

- **Project URL:** `https://utnlgwhofcssmlcmuvlw.supabase.co`
- **Auth method:** Email + password with email confirmation
- **Email redirect for sign-up:** `{origin}/auth/callback`
- **Supabase tables currently used:** Auth only (no custom tables yet in Supabase — EXIF data is in local SQLite)

---

## 10. Development Commands

```bash
# Start dev server
npm run dev          # → http://localhost:3000

# Check SQLite database contents
node scripts/check-db.js

# Build for production
npm run build

# Lint
npm run lint
```

---

## 11. Known Risks / Open Questions (flag to user)

| Risk | Status |
|---|---|
| SQLite is not suitable for multi-server / production deployment | Must migrate to Supabase+PostGIS before prod |
| Image BLOBs in SQLite will grow the DB file significantly | Acceptable for prototyping; production should use Supabase Storage |
| No rate limiting on API routes | Any authenticated user can spam analysis |
| Gemini API key stored in `.env.local` | Fine for dev; production needs secrets manager |
| `frontend/` and `public/` are out of sync if only one is edited | Always edit `frontend/` then re-copy to `public/` — or edit both |

---

*Last updated: 2026-02-21 by Antigravity agent based on full codebase scan.*
*Source of truth created at user's explicit request — all agents must treat this as canonical.*
