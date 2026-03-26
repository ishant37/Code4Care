# Quick Start Guide for Hospital Infection Surveillance System

## 🚀 One-Command Setup (Using Docker Compose)

### Prerequisites
- Docker & Docker Compose installed

### Option 1: Production Mode (Recommended)
```bash
docker-compose up --build
```

### Option 2: Individual Services

**Backend:**
```bash
docker-compose up backend
```

**Frontend:**
```bash
docker-compose up frontend
```

---

## 📝 Manual Setup (Development)

### Windows

**Step 1: Open PowerShell and navigate to project**
```powershell
cd "d:\Hospital JMCH"
```

**Step 2: Start Backend (in a terminal)**
```powershell
cd backend
./run.bat
```

**Step 3: Start Frontend (in another terminal)**
```powershell
cd frontend
./run.bat
```

**Step 4: Open browser**
- Frontend: http://localhost:3000
- API Docs: http://localhost:8000/docs

---

### Mac/Linux

**Step 1: Navigate to project**
```bash
cd /path/to/Hospital\ JMCH
```

**Step 2: Start Backend**
```bash
cd backend
chmod +x run.sh
./run.sh
```

**Step 3: Start Frontend (new terminal)**
```bash
cd frontend
chmod +x run.sh
./run.sh
```

**Step 4: Open browser**
- Frontend: http://localhost:3000
- API Docs: http://localhost:8000/docs

---

## 🧪 Testing the System

### 1. Verify Backend
```bash
curl http://localhost:8000/health
```

### 2. View API Documentation
```
http://localhost:8000/docs
```

### 3. Check Initial Data
```bash
curl http://localhost:8000/api/initial-data | json_pp
```

### 4. Monitor WebSocket
Open browser DevTools → Network → WS and watch messages in real-time

---

## 🎯 What to Expect

1. **Frontend loads** → Dark Sci-Fi dashboard
2. **3D Scene** → Hospital floor plan with invisible wards
3. **Hover** → Wards light up with neon wireframes
4. **Red Glow** → Critical alerts appear (if anomaly detected)
5. **Dashboard** → Stats, alerts, and patient records update in real-time

---

## 🔧 Troubleshooting

### Port Already in Use
```bash
# Find process using port 8000
lsof -i :8000  # Mac/Linux
netstat -ano | findstr :8000  # Windows

# Kill process
kill -9 <PID>  # Mac/Linux
taskkill /PID <PID> /F  # Windows
```

### Dependencies Not Installing
```bash
# Backend
pip install --upgrade pip
pip install -r requirements.txt

# Frontend
npm cache clean --force
npm install
```

### WebSocket Not Connecting
1. Check backend console for errors
2. Verify CORS settings in `backend/app/config.py`
3. Check browser console (F12) for connection errors

---

## 📚 Architecture Overview

```
┌─────────────────────┐
│   React Frontend    │
│   3D Visualization  │
│   TailwindCSS UI    │
└──────────┬──────────┘
           │ WebSocket
           ↓
┌─────────────────────┐
│   FastAPI Backend   │
│   Data Generation   │
│   AI Anomaly Det.   │
└─────────────────────┘
```

---

## 💻 System Specifications

### Backend Performance
- **Data Generation**: 20 tests/60 sec (simulated)
- **Anomaly Detection**: 30 sec intervals
- **Max Data Buffer**: 1000 recent records
- **Concurrent Connections**: Unlimited

### Frontend Performance
- **3D Render**: 60 FPS target
- **WebSocket Latency**: <100ms
- **Bundle Size**: ~500KB (gzipped)

---

## 🤝 Contributing

To extend or modify:

1. **Add new AI algorithm**: `backend/app/services/anomaly_detector.py`
2. **Add new 3D components**: `frontend/src/components/`
3. **Add new API endpoints**: `backend/app/main.py`
4. **Modify dashboard**: `frontend/src/components/StatisticsPanel.tsx`

---

Good luck! 🚀

