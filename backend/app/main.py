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
)
from app.services.data_generator import generate_mock_clinical_data

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
