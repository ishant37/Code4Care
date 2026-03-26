# Hospital Infection Surveillance System (HISS)
## 3D Digital Twin SCADA Dashboard for AI-Based HAI Detection

A sophisticated real-time monitoring system for detecting Hospital-Acquired Infections (HAIs) using AI anomaly detection and interactive 3D visualization.

---

## 📋 System Overview

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   React Frontend (3D)                       │
│  - Three Fiber 3D Scene with Bloom Effects                │
│  - TailwindCSS Dashboard UI                                │
│  - Zustand State Management                                │
│  - WebSocket Real-time Updates                             │
└────────────────────────┬────────────────────────────────────┘
                         │ WebSocket
                         ↓
┌─────────────────────────────────────────────────────────────┐
│              FastAPI Backend (Python)                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Data Generation Service                              │  │
│  │ - Mock clinical data (lab tests, infection logs)     │  │
│  │ - Real-time ingestion simulation                     │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ AI Anomaly Detection Service                         │  │
│  │ - Isolation Forest Algorithm                         │  │
│  │ - Heuristic risk scoring                             │  │
│  │ - Outbreak cluster detection                         │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ WebSocket Connection Manager                         │  │
│  │ - Broadcast alerts & stats to frontend               │  │
│  │ - Connection lifecycle management                    │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Key Features

- **🎮 Interactive 3D Hospital Map**
  - Hover over wards to reveal 3D wireframe structures
  - Neon glow effects for visual feedback
  - Dark Sci-Fi/SCADA aesthetic

- **🔬 AI-Powered Anomaly Detection**
  - Isolation Forest algorithm for detecting infection clusters
  - Real-time risk scoring
  - Multi-factor analysis (positivity rates, organisms, resistance)

- **📊 Real-Time Dashboard**
  - Global hospital statistics
  - Ward-specific infection metrics
  - Patient records and lab reports
  - Alert notifications

- **⚡ Real-Time WebSocket Communication**
  - Live alert broadcasting
  - Instant stat updates
  - Patient record streaming

---

## 📁 Project Structure

```
Hospital JMCH/
├── frontend/                           # React Three Fiber Application
│   ├── package.json                    # Dependencies
│   ├── tsconfig.json                   # TypeScript config
│   ├── vite.config.ts                  # Vite configuration
│   ├── tailwind.config.js              # TailwindCSS themes
│   ├── index.html                      # HTML entry point
│   ├── src/
│   │   ├── main.tsx                    # App entry
│   │   ├── App.tsx                     # Main component
│   │   ├── index.css                   # Global styles
│   │   ├── types.ts                    # Type definitions
│   │   ├── store.ts                    # Zustand state management
│   │   ├── hooks/
│   │   │   └── useWebSocket.ts         # WebSocket hook
│   │   └── components/
│   │       ├── Hospital3DSceneEnhanced.tsx    # Main 3D scene
│   │       ├── AlertOverlay.tsx               # 3D alert boxes
│   │       ├── StatisticsPanel.tsx            # Stats display
│   │       ├── AlertsPanel.tsx                # Alert list
│   │       ├── PatientRecordsPanel.tsx        # Lab reports
│   │       ├── WardDetailsSidebar.tsx         # Ward details
│   │       └── ConnectionStatus.tsx           # Connection indicator
│   ├── run.sh                          # Linux/Mac startup
│   └── run.bat                         # Windows startup
│
├── backend/                            # FastAPI Application
│   ├── requirements.txt                # Python dependencies
│   ├── app/
│   │   ├── main.py                     # FastAPI app & WebSocket endpoint
│   │   ├── config.py                   # Configuration
│   │   ├── models/
│   │   │   └── schemas.py              # Pydantic models
│   │   └── services/
│   │       ├── data_generator.py       # Mock data generation
│   │       ├── anomaly_detector.py     # AI anomaly detection
│   │       ├── connection_manager.py   # WebSocket management
│   │       └── background_tasks.py     # Async background processes
│   ├── run.sh                          # Linux/Mac startup
│   └── run.bat                         # Windows startup
│
└── README.md                           # This file
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ (frontend)
- **Python** 3.10+ (backend)
- **npm** or **yarn** (frontend package manager)
- **pip** (Python package manager)

### Backend Setup (Python)

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   ```

3. **Activate virtual environment:**
   - Linux/Mac:
     ```bash
     source venv/bin/activate
     ```
   - Windows:
     ```bash
     venv\Scripts\activate
     ```

4. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Run the server:**
   - **Option A (Direct):**
     ```bash
     python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
     ```
   - **Option B (Script):**
     - Linux/Mac: `./run.sh`
     - Windows: `run.bat`

   ✅ Server should be running on **http://localhost:8000**
   
   - API Docs: http://localhost:8000/docs
   - Health Check: http://localhost:8000/health

### Frontend Setup (React)

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run development server:**
   - **Option A (Direct):**
     ```bash
     npm run dev
     ```
   - **Option B (Script):**
     - Linux/Mac: `./run.sh`
     - Windows: `run.bat`

   ✅ App should be running on **http://localhost:3000**

---

## 🔌 WebSocket Events

### Client ← Server (Broadcasts)

The server sends these message types to the frontend:

#### 1. **Alert Messages**
```json
{
  "type": "alert",
  "payload": {
    "id": "alert_icu-01_1234567890",
    "wardId": "icu-01",
    "wardName": "ICU Ward",
    "severity": "critical",
    "message": "🚨 CRITICAL: Outbreak detected!",
    "timestamp": 1234567890000
  }
}
```

#### 2. **Ward Status Updates**
```json
{
  "type": "update",
  "payload": {
    "wardId": "icu-01",
    "status": "critical",
    "infectionCount": 5
  }
}
```

#### 3. **Global Statistics**
```json
{
  "type": "stats",
  "payload": {
    "total_patients": 185,
    "suspected_infections": 8,
    "critical_alerts": 3,
    "normal_wards": 3,
    "warning_wards": 2,
    "critical_wards": 1
  }
}
```

#### 4. **Patient Records**
```json
{
  "type": "patient_record",
  "payload": {
    "id": "lab_12345",
    "wardId": "icu-01",
    "wardName": "ICU Ward",
    "patientId": "PAT-12345",
    "testType": "Blood Culture",
    "result": "Positive",
    "timestamp": 1234567890000
  }
}
```

---

## 🤖 Anomaly Detection Algorithm

### Feature Extraction

For each ward, the system extracts 8 key features:

1. **Test Positivity Rate** - Percentage of positive lab results
2. **Positive Test Count** - Absolute number of positive results
3. **Suspected Infection Count** - Number of suspected HAIs
4. **Confirmed Infection Count** - Number of confirmed HAIs
5. **Antibiotic Resistant Count** - Resistant infections detected
6. **Average Severity Score** - Mean severity of infections
7. **Organism Clustering** - Detection of same organism in multiple tests
8. **Recent Infections** - Infections with recent onset

### Anomaly Scoring

**Heuristic Method (if insufficient data):**
- Test Positivity Rate: ×40 points
- Confirmed Infections: ×30 points
- Antibiotic Resistance: ×15 points
- Organism Clustering: ×15 points

**Isolation Forest (Machine Learning):**
- Detects multivariate outliers
- Combined with heuristic score for robustness

### Status Classification

| Score | Risk Factors | Status |
|-------|-------------|--------|
| ≥ 0.6 | Any | **CRITICAL** |
| ≥ 0.35 | ≥ 2 | **WARNING** |
| < 0.35 | < 2 | **NORMAL** |

### Risk Factors Detected

- `high_positive_rate` - >20% positive test rate
- `multiple_confirmed_infections` - >3 confirmed infections
- `antibiotic_resistance_detected` - Any resistant organisms
- `potential_outbreak_pattern` - Same organism in >30% of tests
- `recent_infection_onset` - Infections within last 48 hours
- `high_severity_infections` - Average severity >1.5

---

## 🎨 3D Scene Details

### Scene Hierarchy

```
Canvas
├── Lights
│   ├── Ambient Light (0.5 intensity)
│   ├── Directional Light (Blue - from top-right)
│   ├── Directional Light (Magenta - from bottom-left)
│   └── Point Light (Green - center)
├── FloorPlan
│   ├── Floor Plane (40×40 units)
│   ├── Grid (2-unit cells)
│   └── Border Lines
├── Hospital Wards (6 wards)
│   ├── Ward Footprint (invisible, interactive)
│   └── Ward3D (visible on hover)
│       ├── Wireframe Box
│       └── Edge Lines
├── AlertOverlay
│   └── 3D Html Alert Boxes (positioned above wards)
└── Post-Processing Effects
    ├── Bloom (intensity: 2, threshold: 0.2)
    └── Chromatic Aberration
```

### Ward Positions

| Ward | Position | Color | Info |
|------|----------|-------|------|
| ICU Ward | (-8, 0, -8) | Blue (#00d4ff) | High-risk patient area |
| General Ward | (0, 0, -8) | Green (#00ff41) | Standard patient care |
| Surgery | (8, 0, -8) | Purple (#8800ff) | Post-op patients |
| Pediatrics | (-8, 0, 8) | Magenta (#ff00ff) | Child patients |
| Emergency | (0, 0, 8) | Orange (#ffaa00) | Acute cases |
| Ambulatory | (8, 0, 8) | Cyan (#00ffff) | Outpatient care |

### Color Scheme

| Element | Color | Hex | Usage |
|---------|-------|-----|-------|
| Background | Sci-Fi Dark | #0a0e27 | Main theme |
| Primary | Sci-Fi Blue | #00d4ff | Accents, wireframes |
| Success | Sci-Fi Green | #00ff41 | Normal status |
| Danger | Sci-Fi Red | #ff0040 | Critical status |
| Warning | Sci-Fi Purple | #8800ff | Warning status |

---

## 📊 Data Model

### Lab Test Result
```python
{
  "id": str,
  "patient_id": str,
  "ward_id": str,
  "ward_name": str,
  "test_type": str,  # Blood Culture, Urinalysis, etc.
  "organism": Optional[str],
  "result": str,  # Positive, Negative, Pending
  "source": str,  # Blood, Wound, Urine, Sputum
  "timestamp": datetime
}
```

### Infection Log
```python
{
  "id": str,
  "patient_id": str,
  "ward_id": str,
  "ward_name": str,
  "infection_type": str,  # SSI, UTI, VAI, CLABSI, HAP
  "onset_date": datetime,
  "status": str,  # suspected, confirmed, resolved
  "severity": str,  # mild, moderate, severe
  "antibiotic_resistant": bool,
  "timestamp": datetime
}
```

---

## ⚙️ Configuration

Environment variables can be set in `.env` file in the backend directory:

```bash
# Server
HOST=0.0.0.0
PORT=8000
DEBUG=False

# Data Generation
DATA_GENERATION_INTERVAL=60  # seconds between data batches
BATCH_SIZE=20  # number of tests per batch

# Anomaly Detection
ANOMALY_CHECK_INTERVAL=30  # seconds between checks
ANOMALY_CONTAMINATION=0.1  # expected outlier proportion

# Frontend
FRONTEND_URL=http://localhost:3000
```

---

## 🔍 API Endpoints

### Health Check
```
GET /health
```

### Get Wards Configuration
```
GET /api/wards
Response:
{
  "wards": [
    { "id": "icu-01", "name": "ICU Ward", "position": [-8, 0, -8] },
    ...
  ]
}
```

### Get Initial Data
```
GET /api/initial-data
Response:
{
  "labTests": [...],
  "infectionLogs": [...],
  "timestamp": "2024-01-01T12:00:00"
}
```

### WebSocket
```
WS /ws
Connects to real-time event stream
```

---

## 🐛 Troubleshooting

### WebSocket Connection Issues
- Check backend is running on port 8000
- Verify CORS settings in `app/config.py`
- Check browser console for connection errors

### 3D Scene Not Rendering
- Verify WebGL is enabled in browser
- Check browser GPU capabilities
- Try updating graphics drivers

### Missing Dependencies
- Backend: `pip install -r requirements.txt`
- Frontend: `npm install`

### Port Already in Use
- Backend: `netstat -ano | findstr :8000` (Windows) or `lsof -i :8000` (Mac/Linux)
- Frontend: `netstat -ano | findstr :3000` (Windows) or `lsof -i :3000` (Mac/Linux)

---

## 💡 Future Enhancements

- [ ] Database persistence (PostgreSQL)
- [ ] Real hospital EHR integration
- [ ] Machine learning model training pipeline
- [ ] Advanced prediction algorithms
- [ ] Mobile app (React Native)
- [ ] Multi-hospital federation
- [ ] FHIR compliance
- [ ] HL7 data ingestion
- [ ] Predictive outbreak modeling
- [ ] Compliance reporting (CMS, CDC)

---

## 📜 License

This project is designed for educational and research purposes.

---

## 👨‍💻 Development Notes

### Key Technologies

**Frontend:**
- React 18 + TypeScript
- Three.js, React Three Fiber
- TailwindCSS for styling
- Zustand for state management
- WebSocket for real-time updates

**Backend:**
- FastAPI (async Python web framework)
- Pydantic for data validation
- scikit-learn for ML (Isolation Forest)
- pandas & numpy for data processing
- Uvicorn ASGI server

### Performance Considerations

- Data buffers keep last 1000 records
- Alerts stay in memory for quick lookup
- Isolation Forest runs every 30 seconds
- WebSocket broadcasts are non-blocking

---

## 📞 Support

For issues or questions, check the troubleshooting section or review the inline code comments.

**Good luck!** 🚀

