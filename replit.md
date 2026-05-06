# Hospital Infection Surveillance System (HISS)

A 3D Digital Twin SCADA dashboard for real-time monitoring and AI-driven detection of Hospital-Acquired Infections (HAIs). **Pure frontend — no backend required.**

## Run & Operate

| Command | Purpose |
|---|---|
| `cd HOSPITAL && npm run dev` | Dev server → port 5000 |
| `cd HOSPITAL && npm run build` | Production build → `HOSPITAL/dist/` |
| `cd HOSPITAL && npm run preview` | Preview prod build locally |

No environment variables required for the demo.

## Stack

- **Frontend**: React 19 + TypeScript + Vite 8 (port 5000)
- **3D**: Three.js + React Three Fiber + Drei + postprocessing
- **UI**: TailwindCSS 4 + Framer Motion + Recharts
- **Auth**: Local credential check (no JWT, no API)
- **Data**: In-memory mock data + `setInterval` simulation engine

## Where things live

```
HOSPITAL/src/
  Pages/          WardDashboard, AlertDashboard, Dashboard (3D map), Login, Home, Navbar
  components/3D/  React Three Fiber hospital ward meshes
  services/
    mockData.ts   INITIAL_WARDS, MOCK_PATIENTS, MOCK_CREDENTIALS, startSimulation()
    api.js        Stub file (no-ops) — kept for import compatibility
  context/
    AuthContext.tsx  Local dummy auth — no API calls
vercel.json         Root-level Vercel deployment config
```

## Architecture decisions

- **No backend**: All data served from `mockData.ts`. `startSimulation()` fires `setInterval` events to drift anomaly scores and generate alerts — replaces WebSocket.
- **Auth**: Credentials checked in-memory against `MOCK_CREDENTIALS`. "Token" is the string `"demo-token"` stored in localStorage.
- **Vercel**: `vercel.json` at root sets `buildCommand`, `outputDirectory: HOSPITAL/dist`, and SPA rewrite `/(.*) → /index.html`.
- **3D LOD**: Window grid and ChromaticAberration removed; Bloom retained for performance.

## Product

- Role-based login: Doctor (`doctor / Doctor@2024`) · Ward Manager (`wardman / Ward@2024`)
- Interactive 3D hospital floor map — click wards to see infection risk score
- Live anomaly score drift every 6 s; new alert every 22 s (simulated)
- Alert Dashboard with hourly/weekly Recharts + organism breakdown
- Critical banner with emergency call link (`+91 6367690519`)

## Gotchas

- `backend/` directory still exists but is unused by the frontend; the Backend API workflow can be stopped for Vercel deployments.
- `api.js` is intentionally `.js` (not `.ts`) — add `"allowJs": true` is NOT needed; TypeScript skips it with the current config but `Home.tsx` no longer imports it.
- Vite chunk warning (~2 MB) is expected due to Three.js; not a blocker for Vercel.
