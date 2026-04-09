# Hospital Infection Surveillance System (HISS)

A 3D Digital Twin SCADA dashboard for real-time monitoring and AI-driven detection of Hospital-Acquired Infections (HAIs).

## Architecture

- **Frontend**: React 19 + TypeScript + Vite, Three.js/React Three Fiber for 3D visualization, TailwindCSS 4, Recharts, Framer Motion
- **Backend**: Python FastAPI with Uvicorn, scikit-learn Isolation Forest for anomaly detection, WebSockets for real-time updates

## Project Structure

```
HOSPITAL/          # React + Vite frontend (port 5000)
  src/
    components/3D/ # React Three Fiber 3D hospital ward visualization
    Pages/         # Dashboard pages (WardDashboard, AlertDashboard)
    services/      # API & WebSocket integration (relative URLs, proxied by Vite)

backend/           # Python FastAPI backend (port 8000)
  app/
    main.py        # FastAPI app, routes, WebSocket endpoint
    config.py      # Configuration (host=localhost, port=8000)
    services/      # anomaly_detector, data_generator, fhir_transformer, ehr_simulator
    models/        # Pydantic schemas
```

## Workflows

- **Start application**: `cd HOSPITAL && npm run dev` → port 5000 (webview)
- **Backend API**: `cd backend && python -m uvicorn app.main:app --host localhost --port 8000` → port 8000 (console)

## Key Configuration

- Frontend runs on `0.0.0.0:5000`, proxies `/api`, `/health`, and `/ws` to backend at `localhost:8000`
- API URLs in `HOSPITAL/src/services/api.js` use relative paths (e.g., `/api/wards`)
- WebSocket uses `window.location.host` for compatibility with Replit proxy
- Vite config has `allowedHosts: true` and `server.host: '0.0.0.0'`
- Backend CORS allows all origins (`allow_origins=["*"]`)

## Features

- Interactive 3D hospital map with ward status visualization
- AI anomaly detection (Isolation Forest) for infection risk scoring
- Real-time WebSocket alerts for critical infection thresholds
- FHIR R4 compliant data transformation
- Simulated EHR system integration

## Optional Environment Variables

- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` - For SMS alerts
- `DOCTOR_PHONE_NUMBERS` - Comma-separated phone numbers for alerts
- `DATA_GENERATION_INTERVAL` - Data generation frequency in seconds (default: 60)
- `ANOMALY_CHECK_INTERVAL` - Anomaly detection frequency in seconds (default: 30)
