import asyncio
from contextlib import asynccontextmanager
from datetime import datetime
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import API_TITLE, API_VERSION, HOST, PORT, WARDS
from app.database import connect_db, disconnect_db
from app.routes.auth import router as auth_router
from app.services.background_tasks import (
    manager,
    simulate_data_generation,
    simulate_anomaly_detection,
    latest_anomaly_results,
)
from app.services.data_generator import (
    generate_mock_clinical_data,
    generate_disha_patient_records,
)

background_tasks = []


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("\n🚀 Starting Hospital Infection Surveillance System...\n")
    await connect_db()

    task1 = asyncio.create_task(simulate_data_generation())
    task2 = asyncio.create_task(simulate_anomaly_detection())
    background_tasks.extend([task1, task2])

    yield

    print("\n🛑 Shutting down...\n")
    for task in background_tasks:
        task.cancel()
    await disconnect_db()


app = FastAPI(
    title=API_TITLE,
    version=API_VERSION,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": API_TITLE,
        "version": API_VERSION,
        "connections": manager.get_connection_count(),
        "timestamp": datetime.utcnow().isoformat(),
    }


@app.get("/api/wards")
async def get_wards():
    return {"wards": WARDS}


@app.get("/api/initial-data")
async def get_initial_data():
    try:
        lab_tests, infection_logs = generate_mock_clinical_data(num_tests=50)
        return {
            "labTests": [t.model_dump() for t in lab_tests],
            "infectionLogs": [i.model_dump() for i in infection_logs],
            "timestamp": datetime.utcnow().isoformat(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/ward-stats")
async def get_ward_stats():
    try:
        lab_tests, infection_logs = generate_mock_clinical_data(num_tests=30)
        ward_stats = {}
        for ward in WARDS:
            wid = ward["id"]
            ward_infections = [i for i in infection_logs if i.ward_id == wid]
            ward_tests = [t for t in lab_tests if t.ward_id == wid]
            ward_stats[wid] = {
                "ward_id": wid,
                "ward_name": ward["name"],
                "total_tests": len(ward_tests),
                "infections": len(ward_infections),
                "critical": sum(1 for i in ward_infections if i.severity == "critical"),
                "status": "critical" if len(ward_infections) > 2 else "warning" if len(ward_infections) > 0 else "normal",
            }
        return {"ward_stats": ward_stats, "timestamp": datetime.utcnow().isoformat()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/ward-flags")
async def get_ward_flags():
    """
    Returns the latest Isolation Forest anomaly results per ward.
    Frontend uses this to color 3D mesh blocks (red = infected, grey = safe).
    Threshold: risk_score >= 0.6 → flagged = True (critical)
    """
    from app.config import CRITICAL_THRESHOLD
    flags = []
    for result in latest_anomaly_results:
        flags.append({
            "ward_id": result.ward_id,
            "ward_name": result.ward_name,
            "risk_score": round(result.anomaly_score, 4),
            "status": result.status,
            "flagged": result.anomaly_score >= CRITICAL_THRESHOLD,
            "infection_type": result.risk_factors[0].replace("_", " ").title() if result.risk_factors else None,
            "risk_factors": result.risk_factors,
            "confidence": round(result.confidence, 4),
            "detected_at": result.detected_at.isoformat(),
        })
    return {
        "flags": flags,
        "total_wards": len(flags),
        "flagged_count": sum(1 for f in flags if f["flagged"]),
        "timestamp": datetime.utcnow().isoformat(),
    }


@app.get("/api/patients")
async def get_disha_patients(limit: int = 50):
    """
    Returns DISHA-compliant anonymized synthetic patient records from MongoDB.
    Fields: patient_id (hashed), ward_id, infection_type, risk_score, etc.
    """
    try:
        records = generate_disha_patient_records(num_records=limit)
        return {
            "patients": [r.model_dump() for r in records],
            "total": len(records),
            "disha_compliant": True,
            "data_encrypted": True,
            "timestamp": datetime.utcnow().isoformat(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    try:
        await manager.connect(websocket)
        await websocket.send_json({
            "type": "connection",
            "message": "Connected to Hospital Infection Surveillance System",
            "timestamp": int(datetime.utcnow().timestamp() * 1000),
        })
        while True:
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        await manager.disconnect(websocket)
    except Exception as e:
        print(f"WebSocket error: {e}")
        await manager.disconnect(websocket)


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "error": str(exc)},
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=HOST, port=PORT, reload=False)
