# Architecture & Implementation Guide
## Hospital Infection Surveillance System (HISS)

---

## 📊 System Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                    USER INTERFACE LAYER                              │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │          React Three Fiber 3D Visualization                │   │
│  │                                                              │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │   │
│  │  │ ICU Ward │  │ General  │  │ Surgery  │  │Pediatric │    │   │
│  │  │ (Hover)  │  │ Ward     │  │ Ward     │  │           │    │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │   │
│  │                                                              │   │
│  │  3D Neon Wireframes • Bloom Effects • Real-time Updates    │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              Dashboard Sidebar UI                           │   │
│  │                                                              │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │   │
│  │  │   Stats      │ │   Alerts     │ │   Patient    │        │   │
│  │  │   Panel      │ │   Panel      │ │   Records    │        │   │
│  │  └──────────────┘ └──────────────┘ └──────────────┘        │   │
│  │                                                              │   │
│  │  Real-time Data Display • SCADA Aesthetic                  │   │
│  └─────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
                    ↑ WebSocket Events ↓
┌──────────────────────────────────────────────────────────────────────┐
│                  STATE MANAGEMENT LAYER (Zustand)                    │
│                                                                      │
│  ┌─────────────┐ ┌─────────────┐ ┌──────────────┐                  │
│  │ Ward Data   │ │  Alerts     │ │  Global      │                  │
│  │             │ │             │ │  Statistics  │                  │
│  └─────────────┘ └─────────────┘ └──────────────┘                  │
└──────────────────────────────────────────────────────────────────────┘
                    ↑ WebSocket Connection ↓
┌──────────────────────────────────────────────────────────────────────┐
│                  FASTAPI BACKEND LAYER                               │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │         WebSocket Connection Manager                       │    │
│  │         • Connection lifecycle management                 │    │
│  │         • Broadcast to multiple clients                   │    │
│  └────────────────────────────────────────────────────────────┘    │
│                           ↑ ↓                                       │
│  ┌────────────────────┐           ┌────────────────────────────┐   │
│  │ Data Generation    │           │ Anomaly Detection Service  │   │
│  │ Service            │           │                            │   │
│  │                    │           │ • Isolation Forest ML      │   │
│  │ • Mock Lab Tests   │           │ • Feature Extraction      │   │
│  │ • Infection Logs   │───────→   │ • Heuristic Scoring       │   │
│  │ • Patient Records  │           │ • Risk Factor Analysis    │   │
│  │ • Real-time Sim    │           │                            │   │
│  └────────────────────┘           └────────────────────────────┘   │
│         • Every 60s                      • Every 30s               │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 📁 Complete File Structure

```
Hospital JMCH/
│
├── README.md                           ← Start here!
├── QUICKSTART.md                       ← Setup instructions
├── API_DOCUMENTATION.md                ← API reference
├── ARCHITECTURE.md                     ← This file
├── docker-compose.yml                  ← Docker deployment
│
├── frontend/                           ← React + Three Fiber App
│   ├── package.json                    │ Dependencies
│   ├── tsconfig.json                   │ TypeScript config
│   ├── vite.config.ts                  │ Vite bundler config
│   ├── tailwind.config.js              │ CSS framework config
│   ├── index.html                      │ HTML entry point
│   ├── Dockerfile                      │ Docker image
│   ├── run.sh                          │ Start script (Unix)
│   ├── run.bat                         │ Start script (Windows)
│   │
│   └── src/
│       ├── main.tsx                    │ React app entry
│       ├── App.tsx                     │ Root component
│       ├── index.css                   │ Global styles
│       ├── types.ts                    │ TypeScript interfaces
│       ├── store.ts                    │ Zustand state management
│       │
│       ├── hooks/
│       │   └── useWebSocket.ts         │ WebSocket connection hook
│       │
│       └── components/
│           ├── Hospital3DSceneEnhanced.tsx  │ Main 3D scene
│           ├── AlertOverlay.tsx             │ 3D alert boxes
│           ├── StatisticsPanel.tsx          │ Global stats display
│           ├── AlertsPanel.tsx              │ Alert log
│           ├── PatientRecordsPanel.tsx      │ Lab results
│           ├── WardDetailsSidebar.tsx       │ Ward details
│           └── ConnectionStatus.tsx         │ Status indicator
│
├── backend/                            ← FastAPI Python Server
│   ├── requirements.txt                │ Python dependencies
│   ├── .env.example                    │ Environment template
│   ├── Dockerfile                      │ Docker image
│   ├── run.sh                          │ Start script (Unix)
│   ├── run.bat                         │ Start script (Windows)
│   │
│   └── app/
│       ├── main.py                     │ FastAPI app + WebSocket
│       ├── config.py                   │ Configuration
│       │
│       ├── models/
│       │   ├── __init__.py             │ Package marker
│       │   └── schemas.py              │ Pydantic models & types
│       │
│       └── services/
│           ├── __init__.py             │ Package marker
│           ├── data_generator.py       │ Mock clinical data
│           ├── anomaly_detector.py     │ AI detection engine
│           ├── connection_manager.py   │ WebSocket manager
│           └── background_tasks.py     │ Background processes
│
└── [Additional Configuration Files]
    ├── .env                            │ Local environment vars
    ├── .gitignore                      │ Git ignore rules
    └── .env.production                 │ Production config
```

---

## 🔧 Core Components Explained

### Frontend Components

#### `Hospital3DSceneEnhanced.tsx` - Main 3D Scene
```
Purpose: Render the 3D hospital visualization
├── Canvas (THREE.js render target)
├── Lighting System
│   ├── Ambient light
│   ├── Directional lights (blue, magenta)
│   └── Point light (green)
├── FloorPlan
│   ├── Floor texture mesh
│   ├── Grid lines (40×40 units, 2-unit cells)
│   └── Border outline
├── Hospital Wards (×6)
│   ├── WardFootprint (invisible by default)
│   └── Ward3D (visible on hover)
├── AlertOverlay
│   └── 3D HTML elements
└── EffectComposer
    ├── Bloom (intensity: 2)
    └── Chromatic Aberration
```

**Key Features:**
- Bloom effect for neon glow
- Dynamic color changes based on status
- Smooth hover animations
- Responsive to state changes

#### `AlertOverlay.tsx` - 3D Alert Boxes
```
Purpose: Display alerts floating above wards in 3D space
├── Alert positioning (above ward, tracked)
├── Color coding
│   ├── Red (critical)
│   ├── Yellow (warning)
│   └── Blue (normal)
└── CSS animations (pulse glow)
```

#### Dashboard Components
```
StatisticsPanel.tsx
├── Total Patients counter
├── Suspected Infections counter
├── Critical Alerts counter
└── Ward Status Breakdown

AlertsPanel.tsx
├── Alert history list
├── Severity indicators
└── Timestamp tracking

PatientRecordsPanel.tsx
├── Lab test results
├── Test type display
├── Patient ID tracking
└── Auto-scrolling list

WardDetailsSidebar.tsx
├── Selected ward info
├── Infection count
├── Risk scoring
└── Patient population

ConnectionStatus.tsx
├── WebSocket status
└── Connection indicator (pulse animation)
```

### Backend Services

#### `data_generator.py` - Mock Data Generation
```python
Purpose: Simulate real hospital clinical data

Functions:
├── generate_mock_lab_test()
│   ├── Random patient assignment
│   ├── Test type selection
│   └── Result determination (Positive/Negative)
│
├── generate_mock_infection_log()
│   ├── Infection type selection (SSI, UTI, etc.)
│   ├── Severity assignment
│   └── Antibiotic resistance flag
│
└── generate_mock_clinical_data()
    └── Batch generation (default: 20 tests per batch)

Data Models:
├── WARD_INFO (capacity, location)
├── TEST_TYPES (Blood Culture, Urinalysis, etc.)
├── ORGANISMS (Staph, Pseudomonas, Candida, etc.)
├── INFECTION_TYPES (SSI, UTI, VAI, CLABSI, HAP)
└── RISK_FACTORS (used in anomaly detection)

Generation Intervals:
└── Every 60 seconds (configurable)
```

#### `anomaly_detector.py` - AI Detection Engine
```python
Purpose: Detect HAI outbreaks and anomalies using ML

Algorithm:
├── Feature Extraction (8 features per ward)
│   ├── Test positivity rate
│   ├── Positive test count
│   ├── Infection counts (suspected/confirmed)
│   ├── Antibiotic resistance count
│   ├── Average severity score
│   ├── Organism clustering
│   └── Recent infection count
│
├── Isolation Forest (scikit-learn)
│   ├── Detects multivariate outliers
│   ├── Contamination: 0.1 (10% expected outliers)
│   └── n_estimators: 100
│
├── Heuristic Scoring
│   ├── Test positivity: ×40 points
│   ├── Confirmed infections: ×30 points
│   ├── Antibiotic resistance: ×15 points
│   └── Organism clustering: ×15 points
│
└── Status Classification
    ├── Critical: score ≥ 0.6 OR ≥ 4 risk factors
    ├── Warning: score ≥ 0.35 OR ≥ 2 risk factors
    └── Normal: score < 0.35 AND < 2 risk factors

Risk Factors:
├── high_positive_rate
├── multiple_confirmed_infections
├── antibiotic_resistance_detected
├── potential_outbreak_pattern
├── recent_infection_onset
└── high_severity_infections

Detection Interval:
└── Every 30 seconds (configurable)
```

#### `connection_manager.py` - WebSocket Management
```python
Purpose: Manage WebSocket connections and broadcasting

Key Methods:
├── connect(websocket)
│   └── Accept new connection
│
├── disconnect(websocket)
│   └── Clean up disconnected client
│
├── broadcast(message)
│   ├── Send to all connected clients
│   └── Auto-cleanup on failures
│
└── broadcast_dict(data)
    └── Send raw JSON dictionary

Features:
├── Automatic error handling
├── Connection tracking
├── Non-blocking sends
└── Graceful degradation
```

#### `background_tasks.py` - Background Processes
```python
Purpose: Run continuous backend services

Tasks:
├── simulate_data_generation()
│   ├── Generate mock clinical data
│   ├── Update data buffers
│   ├── Broadcast patient records
│   └── Runs every 60 seconds
│
└── simulate_anomaly_detection()
    ├── Run anomaly detection
    ├── Generate alerts
    ├── Send ward status updates
    ├── Calculate global statistics
    └── Runs every 30 seconds
```

#### `main.py` - FastAPI Application
```python
Purpose: HTTP & WebSocket server

Endpoints:
├── GET /health               → Health check
├── GET /api/wards            → Ward configuration
├── GET /api/initial-data     → Initial clinical data
└── WS /ws                    → WebSocket connection

Features:
├── CORS middleware
├── Exception handlers
├── Startup/shutdown events
├── Background task management
└── Lifespan context manager
```

---

## 🔄 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Every 60 seconds:                                          │
│ ┌─────────────────────────────────────────────────────┐    │
│ │ Data Generation Service                            │    │
│ │ • Generate 20 random lab tests                     │    │
│ │ • Generate ~2 infection logs                       │    │
│ └────────────────┬───────────────────────────────────┘    │
│                  │                                         │
└──────────────────┼─────────────────────────────────────────┘
                   ↓
     ┌─────────────────────────┐
     │ Data Buffers (In-Memory)│
     │ • Recent Lab Tests      │
     │ • Recent Infection Logs │
     └─────────────┬───────────┘
                   │
┌──────────────────┼─────────────────────────────────────────┐
│ Every 30 seconds:                                         │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ Anomaly Detection Service                          │  │
│ │ • Extract features per ward                        │  │
│ │ • Run Isolation Forest                             │  │
│ │ • Calculate heuristic scores                       │  │
│ │ • Classify status (normal/warning/critical)        │  │
│ └────────────────┬─────────────────────────────────┘  │
└──────────────────┼─────────────────────────────────────┘
                   ↓
     ┌──────────────────────────────┐
     │ Generate Events              │
     ├──────────────────────────────┤
     │ • Alert Messages             │
     │ • Status Updates             │
     │ • Global Statistics          │
     └────────────┬─────────────────┘
                  ↓
     ┌──────────────────────────────┐
     │ WebSocket Broadcast Manager  │
     └────────────┬─────────────────┘
                  ↓
        [Connected Clients]
     ┌──────────────────────────────┐
     │ React Frontend               │
     ├──────────────────────────────┤
     │ • Zustand Store Updated      │
     │ • 3D Scene Re-renders        │
     │ • UI Updates                 │
     │ • Animations Triggered       │
     └──────────────────────────────┘
```

---

## 🧬 State Management (Zustand)

```typescript
Interface AppState {
  // Ward Data
  wards: WardData[]
  updateWardStatus(wardId, status, count)

  // Alerts
  alerts: AlertMessage[]
  addAlert(alert)
  clearOldAlerts()

  // Patient Records
  patientRecords: PatientRecord[]
  addPatientRecord(record)

  // Statistics
  stats: HospitalStats | null
  setStats(stats)

  // UI State
  hoveredWardId: string | null
  selectedWardId: string | null

  // Connection
  isConnected: boolean
}

Architecture:
├── One global store instance
├── Subscribed by multiple components
├── Actions are synchronous
├── Derived state in selectors
└── No side effects in store
```

---

## 🎨 3D Scene Coordinate System

```
View from above (Y = up):

    Z (depth)
    ↑
    │
    │  Emergency    Pediatrics   Ambulatory
    │  (0,0,8)      (-8,0,8)     (8,0,8)
    │
    │     ┌─────────┬─────────┬─────────┐
    │     │         │         │         │
    ├─────┼─────────┼─────────┼─────────┼────→ X
    │     │         │  Floor  │         │
    │     │   ICU   │ (40×40) │ Surgery │
    │     │(-8,0,-8)│         │(8,0,-8) │
    │     │         │  Grid   │         │
    │     │ General │(2-unit) │         │
    │     │(0,0,-8) │         │         │
    │     └─────────┴─────────┴─────────┘
    │

Ward Dimensions:
- Width: 5 units
- Depth: 5 units
- Height: 4 units
- Position: Center of footprint

Camera Position:
- Position: (0, 25, 25)
- Looking at: (0, 0, 0)
- FOV: 60 degrees
```

---

## 🚀 Deployment Scenarios

### Development
```bash
# Terminal 1
cd backend && ./run.sh

# Terminal 2
cd frontend && ./run.sh
```

### Docker Compose
```bash
docker-compose up --build
```

### Production
```bash
# Backend
gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app

# Frontend
npm run build  # Creates dist/ folder
# Serve from static host (nginx, etc.)
```

---

## 🔐 Security Considerations

### Missing in Current Boilerplate (Add Before Production):

1. **Authentication**
   - JWT tokens for API
   - Role-based access control (RBAC)
   - WebSocket auth headers

2. **Data Protection**
   - Encrypt sensitive data at rest
   - Use HTTPS/WSS in production
   - Input validation & sanitization

3. **Rate Limiting**
   - API endpoint throttling
   - WebSocket message rate control

4. **Logging & Monitoring**
   - Log all anomaly detections
   - Monitor system performance
   - Alert on failures

5. **HIPAA Compliance**
   - Data retention policies
   - Audit trails
   - Access logging

---

## 📈 Performance Optimization Tips

### Frontend
- Use React.memo for expensive components
- Virtualize alert/record lists
- Optimize 3D geometry (Indexed buffers)
- Lazy load THREE.js animations

### Backend
- Use connection pooling for DB
- Cache ward configuration
- Batch WebSocket sends
- Profile anomaly detection

### Database (Future)
- Index on ward_id, timestamp
- Partition by date
- Archive old records

---

## 🐞 Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| 3D scene not rendering | WebGL unsupported | Update GPU drivers |
| Slow anomaly detection | Too much data | Reduce buffer size |
| WebSocket disconnects | Network issue | Implement auto-reconnect |
| High CPU usage | Animation frame rate | Set FPS limit in Vite |
| Memory leak | Old alerts not cleared | Implement cleanup timer |

---

## 📚 Next Steps

1. **Run the System** → Follow QUICKSTART.md
2. **Explore API** → Visit http://localhost:8000/docs
3. **Monitor Real-time** → Open DevTools → Network → WS
4. **Extend Features** → Modify components and services
5. **Deploy** → Use Docker Compose or Kubernetes
6. **Integrate Real Data** → Connect to actual hospital EHR

---

## 🎓 Learning Resources

- **Three.js**: https://threejs.org/docs
- **React Three Fiber**: https://docs.pmnd.rs/react-three-fiber
- **FastAPI**: https://fastapi.tiangolo.com
- **WebSockets**: https://websockets.readthedocs.io
- **scikit-learn**: https://scikit-learn.org
- **HAI Resources**: https://www.cdc.gov/hai/

---

**Ready to explore the system? Start with QUICKSTART.md! 🚀**

