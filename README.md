# Zyflex AI – Frontend

**Next.js 14 · React · Tailwind CSS · TypeScript**

Professionel SaaS-frontend til Zyflex AI dispatch-platform for dansk taxa og flextrafik.
Konsumerer det eksisterende FastAPI backend via REST.

---

## Sider

| Side | URL | Beskrivelse |
|---|---|---|
| Landing Page | `/` | Marketing, priser, FAQ, demo-forespørgsel |
| Login | `/login` | SaaS login UI |
| Owner Dashboard | `/dashboard` | AI-anbefaling, hotspots, events, vejr, pipeline |
| Heatmap | `/dashboard/heatmap` | Interaktivt H3 hex-kort (Leaflet) |
| Driver View | `/dashboard/driver` | Mobil-first chaufførvisning med GO NOW |

---

## Kom i gang (lokal)

### Forudsætninger
- Node.js 18+ (`node -v`)
- Backend kørende på `http://localhost:8000`

### Installation

```bash
# Gå til frontend-mappen
cd zyflex-frontend

# Installer dependencies
npm install

# Opret miljøfil
cp .env.local.example .env.local

# Rediger .env.local og sæt backend URL:
# NEXT_PUBLIC_API_URL=http://localhost:8000

# Start dev-server
npm run dev
```

Åbn `http://localhost:3000`.

---

## Miljøvariabler

| Variabel | Beskrivelse | Default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | URL til Zyflex backend | `http://localhost:8000` |
| `NEXT_PUBLIC_DEMO_MODE` | Brug statiske demo-data | `false` |

---

## Build til produktion

```bash
npm run build
npm run start
```

---

## Deploy til Vercel

### Metode 1: Vercel CLI

```bash
npm i -g vercel
vercel
```

Følg prompts. Vercel auto-detecter Next.js.

### Metode 2: GitHub → Vercel

1. Push kode til GitHub
2. Gå til [vercel.com](https://vercel.com) → "Import Project"
3. Vælg `zyflex-frontend` mappen
4. Tilføj Environment Variable:
   - `NEXT_PUBLIC_API_URL` = URL til din deployede backend (Render/Railway)
5. Deploy

### CORS (produktion)

Når frontend er på Vercel og backend er på Render, skal du tilføje CORS i `backend/main.py`:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://din-app.vercel.app"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Deploy backend (Render)

1. Push `zyflex-ai/` til GitHub
2. Render.com → "New Web Service"
3. Root Directory: `zyflex-ai/backend`
4. Build Command: `pip install -r requirements.txt`
5. Start Command: `python main.py`
6. Environment Variables: `BILLETTO_API_KEY`, `PORT=8000`

---

## Projektstruktur

```
zyflex-frontend/
├── app/
│   ├── page.tsx                  ← Landing page
│   ├── layout.tsx
│   ├── globals.css
│   ├── login/page.tsx            ← Login side
│   └── dashboard/
│       ├── page.tsx              ← Owner dashboard
│       ├── heatmap/page.tsx      ← H3 heatmap kort
│       └── driver/page.tsx       ← Mobil driver view
├── components/
│   └── dashboard/
│       └── HeatmapMap.tsx        ← Leaflet kort (dynamisk import)
├── lib/
│   └── api.ts                    ← Al API-kommunikation
├── .env.local.example
├── next.config.mjs
├── tailwind.config.ts
└── package.json
```

---

## API Service Layer (`lib/api.ts`)

Alle backend-kald er samlet i `lib/api.ts`:

```typescript
import { getRecommendation, getHotspots, getHeatmap } from "@/lib/api";

// Hent AI-anbefaling
const rec = await getRecommendation("Horsens");

// Hent hotspots
const hotspots = await getHotspots("Horsens", 5);

// Hent H3 heatmap
const heatmap = await getHeatmap("Horsens");
```

Skift backend-URL én gang i `.env.local` – alt virker automatisk.

---

## Tilpasning

- **Farver:** `tailwind.config.ts` → `theme.colors`
- **By-navn:** skift `city = "Horsens"` i dashboard pages
- **Logo/navn:** `app/page.tsx` navbar sektion
- **Priser:** `PLANS` array i `app/page.tsx`
- **Features:** `FEATURES` array i `app/page.tsx`
