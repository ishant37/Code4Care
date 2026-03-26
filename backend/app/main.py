import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import (
    API_TITLE,
    API_VERSION,
    HOST,
    PORT,
    FRONTEND_URL,
    WARDS,
)
from app.services.background_tasks import (
    manager,
    simulate_data_generation,
    simulate_anomaly_detection,
)
from app.services.data_generator import generate_mock_clinical_data

# ==================== Background Tasks ====================
background_tasks = []


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    FastAPI lifespan context manager for startup and shutdown.
    """
    # Startup
    print("\n🚀 Starting background services...\n")

    # Create and start background tasks
    task1 = asyncio.create_task(simulate_data_generation())
    task2 = asyncio.create_task(simulate_anomaly_detection())

    background_tasks.append(task1)
    background_tasks.append(task2)

    yield

    # Shutdown
    print("\n🛑 Shutting down background services...\n")
    for task in background_tasks:
        task.cancel()


# ==================== FastAPI App ====================
app = FastAPI(
    title=API_TITLE,
    version=API_VERSION,
    lifespan=lifespan,
)

# ==================== CORS Configuration ====================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== Health Check ====================
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": API_TITLE,
        "version": API_VERSION,
        "connections": manager.get_connection_count(),
    }


# ==================== API Endpoints ====================
@app.get("/api/wards")
async def get_wards():
    """Get all hospital wards configuration"""
    return {
        "wards": WARDS,
    }


@app.get("/api/initial-data")
async def get_initial_data():
    """Get initial clinical data for dashboard"""
    try:
        lab_tests, infection_logs = generate_mock_clinical_data(num_tests=50)

        return {
            "labTests": [t.model_dump() for t in lab_tests],
            "infectionLogs": [i.model_dump() for i in infection_logs],
            "timestamp": datetime.utcnow().isoformat(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


from datetime import datetime


# ==================== WebSocket Endpoint ====================
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time hospital surveillance updates.
    Clients connect here to receive live alerts, stats, and patient records.
    """
    try:
        # Accept the connection
        await manager.connect(websocket)

        # Send initial connection confirmation
        await websocket.send_json({
            "type": "connection",
            "message": "Connected to Hospital Infection Surveillance System",
            "timestamp": int(datetime.utcnow().timestamp() * 1000),
        })

        # Keep the connection alive
        while True:
            # Receive message from client (if any) - prevents connection timeout
            data = await websocket.receive_text()
            # Echo back or process commands from client (optional)
            # For now, just keep the connection alive

    except WebSocketDisconnect:
        await manager.disconnect(websocket)
        print("Client disconnected from WebSocket")

    except Exception as e:
        print(f"WebSocket error: {e}")
        await manager.disconnect(websocket)


# ==================== Error Handlers ====================
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "error": str(exc)},
    )


# ==================== Startup Message ====================
@app.on_event("startup")
async def startup_message():
    print(f"""
╔══════════════════════════════════════════════════════════════╗
║         HOSPITAL INFECTION SURVEILLANCE SYSTEM               ║
║              🏥 3D Digital Twin SCADA                         ║
╠══════════════════════════════════════════════════════════════╣
║  API Server Running                                          ║
║  🌐 http://{HOST}:{PORT}                                    ║
║  📊 Health Check: http://{HOST}:{PORT}/health                │
║  📚 Documentation: http://{HOST}:{PORT}/docs                 │
║  🔗 WebSocket: ws://{HOST}:{PORT}/ws                         ║
╚══════════════════════════════════════════════════════════════╝
    """)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=HOST,
        port=PORT,
        reload=False,
    )
