# 🏥 Hospital Infection Surveillance System (HISS)
## Complete Boilerplate - Getting Started

Welcome! This directory contains a **production-ready boilerplate** for a sophisticated 3D Digital Twin SCADA Dashboard for AI-based Hospital-Acquired Infection (HAI) detection and monitoring.

---

## 📚 Documentation Index

Start with these documents in this order:

### 1. **[README.md](README.md)** ← **START HERE**
- 📋 Complete system overview
- 🏗️ Architecture explanation
- 📁 Full project structure
- 🚀 Setup instructions
- 📊 Data models
- 🐛 Troubleshooting guide

### 2. **[QUICKSTART.md](QUICKSTART.md)**
- ⚡ 5-minute setup guide
- 🪟 Windows/Mac/Linux instructions
- 🐳 Docker Compose option
- ✅ What to expect when running

### 3. **[ARCHITECTURE.md](ARCHITECTURE.md)**
- 🔧 Detailed component breakdown
- 📊 Data flow diagrams
- 🧬 State management architecture
- 💾 Backend service details
- 🎨 3D scene coordinate system
- 🐞 Common issues & solutions

### 4. **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)**
- 🔌 REST API endpoints
- 📡 WebSocket message formats
- 📝 Python/JavaScript client examples
- 📊 Data model specifications
- ⚙️ Configuration parameters

### 5. **[FILE_STRUCTURE.md](FILE_STRUCTURE.md)**
- 📁 Complete file listing
- ✅ Implementation checklist
- 📦 Dependency summary
- 🎯 Component relationships

---

## 🎯 Quick Navigation

### For Different Roles

**👨‍💼 Project Manager / Team Lead**
- Start with README.md (System Overview section)
- Review FILE_STRUCTURE.md (project stats)
- Check QUICKSTART.md (deployment options)

**👨‍💻 Frontend Developer**
- Read QUICKSTART.md (Frontend Setup)
- Review ARCHITECTURE.md (Frontend Components section)
- Explore `frontend/src/components/`
- Study `Hospital3DSceneEnhanced.tsx` (main 3D scene)

**🐍 Backend Developer**
- Read QUICKSTART.md (Backend Setup)
- Review ARCHITECTURE.md (Backend Services section)
- Explore `backend/app/services/`
- Study `anomaly_detector.py` (AI algorithm)

**🤖 Data Scientist / ML Engineer**
- Check `backend/app/services/anomaly_detector.py` (Isolation Forest)
- Review feature extraction logic
- Study risk factor calculation
- Reference DATA_GENERATION_INTERVAL in config

**🏗️ DevOps / Infrastructure**
- Review `docker-compose.yml`
- Check `backend/Dockerfile` & `frontend/Dockerfile`
- Review configuration files (`.env.example`)
- See QUICKSTART.md (Docker section)

### For Different Tasks

| Task | Start With | Key Files |
|------|-----------|-----------|
| Set up locally | QUICKSTART.md | run.bat / run.sh |
| Deploy with Docker | QUICKSTART.md | docker-compose.yml |
| Integrate real data | API_DOCUMENTATION.md | data_generator.py |
| Customize 3D scene | ARCHITECTURE.md | Hospital3DSceneEnhanced.tsx |
| Modify AI algorithm | ARCHITECTURE.md | anomaly_detector.py |
| Add authentication | README.md | main.py (security section) |
| Debug issues | README.md | Troubleshooting section |

---

## 📁 Project Contents

```
Hospital JMCH/
├── 📖 Documentation Files (4)
│   ├── README.md               ⭐ Start here!
│   ├── QUICKSTART.md           ⚡ Setup guide
│   ├── ARCHITECTURE.md         🔧 Technical details
│   ├── API_DOCUMENTATION.md    📡 API reference
│   └── FILE_STRUCTURE.md       📋 This index
│
├── 🎨 Frontend (22 files)
│   ├── package.json, vite.config.ts, tailwind.config.js
│   ├── index.html, src/main.tsx, src/App.tsx
│   ├── Components (7 files)
│   │   ├── Hospital3DSceneEnhanced.tsx  (Main 3D)
│   │   ├── AlertOverlay.tsx
│   │   ├── StatisticsPanel.tsx
│   │   ├── AlertsPanel.tsx
│   │   ├── PatientRecordsPanel.tsx
│   │   ├── WardDetailsSidebar.tsx
│   │   └── ConnectionStatus.tsx
│   ├── hooks (1 file)
│   │   └── useWebSocket.ts
│   ├── State (1 file)
│   │   └── store.ts  (Zustand)
│   └── Setup files: run.sh, run.bat, Dockerfile
│
├── 🐍 Backend (14 files)
│   ├── requirements.txt, .env.example
│   ├── app/main.py            (FastAPI + WebSocket)
│   ├── app/config.py
│   ├── models/schemas.py       (Data types)
│   ├── services/
│   │   ├── data_generator.py   (Mock data)
│   │   ├── anomaly_detector.py (AI/ML)
│   │   ├── connection_manager.py
│   │   └── background_tasks.py
│   └── Setup files: run.sh, run.bat, Dockerfile
│
├── 🐳 Deployment
│   ├── docker-compose.yml
│   └── .env.example
│
└── 📄 This file: INDEX.md
```

---

## 🚀 30-Second Start

### Windows PowerShell
```powershell
# Terminal 1: Backend
cd backend
./run.bat

# Terminal 2: Frontend (new window)
cd frontend
./run.bat

# Then open http://localhost:3000 in browser
```

### Mac/Linux Terminal
```bash
# Terminal 1: Backend
cd backend
chmod +x run.sh
./run.sh

# Terminal 2: Frontend (new terminal)
cd frontend
chmod +x run.sh
./run.sh

# Then open http://localhost:3000 in browser
```

### Docker (Any OS)
```bash
docker-compose up --build
# Open http://localhost:3000
```

---

## ✨ What You'll See

### Frontend ✅
- **3D Scene**: Dark sci-fi hospital floor plan with 6 interactive wards
- **Hover Effect**: Ward structures light up with neon wireframes
- **Dashboard**: Real-time statistics, alerts, and patient records
- **Connection**: Live WebSocket status indicator
- **Responsive**: Works on desktop (optimized for larger screens)

### Backend ✅
- **API Server**: Running on http://localhost:8000
- **WebSocket**: Real-time data streaming
- **Data Generation**: Simulated clinical data every 60 seconds
- **AI Detection**: Anomaly detection running every 30 seconds
- **Auto-Alerts**: Critical alerts trigger when anomalies detected

---

## 🎯 Key Features

### 🎮 Interactive 3D Visualization
- React Three Fiber with Three.js
- 6 hospital wards (ICU, General, Surgery, Pediatrics, Emergency, Ambulatory)
- Hover to reveal 3D wireframe structures
- Neon glow effects with Bloom post-processing

### 🤖 AI-Powered Anomaly Detection
- Isolation Forest machine learning algorithm
- 8-feature anomaly scoring system
- Real-time outbreak detection
- Heuristic risk factor analysis

### 📊 Real-Time Dashboard
- Global hospital statistics
- Ward-specific metrics
- Patient record streaming
- Alert notification system
- Connection status monitoring

### ⚡ Real-Time WebSocket Communication
- Live event broadcasting
- Instant alert notifications
- Automatic reconnection
- Non-blocking message delivery

---

## 🔧 Technology Stack

### Frontend
- **React 18** - UI framework
- **Three.js** - 3D graphics engine
- **React Three Fiber** - React renderer for Three.js
- **React Three Drei** - Useful helpers
- **React Three Postprocessing** - Post-effects (Bloom)
- **Zustand** - State management
- **TailwindCSS** - Styling
- **TypeScript** - Type safety
- **Vite** - Fast bundler
- **WebSocket** - Real-time updates

### Backend
- **FastAPI** - Async Python web framework
- **Uvicorn** - ASGI server
- **Pydantic** - Data validation
- **scikit-learn** - Machine learning (Isolation Forest)
- **Pandas & NumPy** - Data processing
- **WebSockets** - Real-time communication

---

## 📋 Getting Started Checklist

- [ ] Read README.md (main documentation)
- [ ] Follow QUICKSTART.md (setup instructions)
- [ ] Run backend: `python -m uvicorn app.main:app --reload`
- [ ] Run frontend: `npm run dev`
- [ ] Open http://localhost:3000
- [ ] Verify 3D scene renders
- [ ] Hover over wards to test interaction
- [ ] Check dashboard for real-time updates
- [ ] Monitor WebSocket in DevTools

---

## 🆘 Need Help?

### Common Questions

**Q: Where do I start?**  
A: Read README.md, then follow QUICKSTART.md

**Q: How do I set up locally?**  
A: Use QUICKSTART.md for step-by-step instructions

**Q: How does the AI detection work?**  
A: See ARCHITECTURE.md section "Anomaly Detection Engine"

**Q: What are the API endpoints?**  
A: Check API_DOCUMENTATION.md

**Q: How do I customize the 3D scene?**  
A: See `frontend/src/components/Hospital3DSceneEnhanced.tsx`

**Q: Where is the AI algorithm?**  
A: See `backend/app/services/anomaly_detector.py`

**Q: How do I add real hospital data?**  
A: Modify `backend/app/services/data_generator.py`

### Troubleshooting

- **Port in use**: Change port in config or kill process
- **Node not found**: Install Node.js 18+
- **Python error**: Install dependencies with pip
- **WebSocket won't connect**: Check backend is running
- **3D scene slow**: Check GPU & update drivers

See README.md "Troubleshooting" section for more

---

## 📞 File Quick Reference

| File | Purpose | Lines | Type |
|------|---------|-------|------|
| Hospital3DSceneEnhanced.tsx | Main 3D visualization | ~250 | React |
| anomaly_detector.py | AI detection engine | ~300 | Python |
| main.py | FastAPI server | ~150 | Python |
| store.ts | State management | ~120 | TypeScript |
| data_generator.py | Mock data | ~180 | Python |

---

## 🎓 Learning Resources

- **Three.js Tutorial**: https://threejs.org/manual/
- **React Three Fiber**: https://docs.pmnd.rs/react-three-fiber/
- **FastAPI Guide**: https://fastapi.tiangolo.com/
- **WebSocket Intro**: https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
- **Machine Learning**: https://scikit-learn.org/

---

## 🚀 Next Steps After Setup

1. **Test the system** ← Run locally using QUICKSTART.md
2. **Explore the code** ← Review key components
3. **Customize** ← Modify for your needs
4. **Extend** ← Add features
5. **Deploy** ← Use Docker or cloud platform
6. **Integrate** ← Connect real hospital data

---

## 📊 Project Statistics

```
Total Files: 41
Lines of Code: ~7,800
Frontend Components: 7
Backend Services: 4
API Documentation Pages: 4
3D Ward Models: 6
Supported Infection Types: 5
Anomaly Detection Features: 8
Real-time Event Types: 4
```

---

## 🎉 You're Ready!

Everything is set up and ready to run. Pick a documentation file above and get started!

### Quick Links
- 📖 **[README.md](README.md)** - Full documentation
- ⚡ **[QUICKSTART.md](QUICKSTART.md)** - 5-minute setup
- 🔧 **[ARCHITECTURE.md](ARCHITECTURE.md)** - Technical details

---

**Created:** March 26, 2026  
**System:** Hospital Infection Surveillance System (HISS)  
**Status:** 🟢 Production-Ready Boilerplate  

**Let's build the future of hospital infection detection! 🚀**

---

*Last Updated: March 26, 2026*

