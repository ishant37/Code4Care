import asyncio
from contextlib import asynccontextmanager
from datetime import datetime
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import typing

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
from app.services.fhir_transformer import FHIRTransformer
from app.services.ehr_simulator import EHRSimulator

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


# ==================== FHIR & EHR Integration Endpoints ====================
@app.get("/api/ehr/authenticate")
async def ehr_authenticate():
    """
    Authenticate with Hospital EHR System
    Returns authentication token and connection details
    """
    try:
        credentials = EHRSimulator.simulate_ehr_credentials()
        print(f"✅ EHR Authentication successful: {credentials['organization_name']}")
        return {
            "status": "authenticated",
            "ehr_credentials": credentials,
            "timestamp": datetime.utcnow().isoformat(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"EHR authentication failed: {str(e)}")


@app.get("/api/ehr/sync")
async def sync_ehr_data(ward_id: str = None):
    """
    Sync Patient Data from Hospital EHR
    Simulates pulling real patient data from the EHR system
    
    Query Parameters:
    - ward_id: Optional specific ward ID to filter data
    """
    try:
        # Simulate EHR authentication
        ehr_creds = EHRSimulator.simulate_ehr_credentials()
        print(f"🔄 EHR Sync initiated from: {ehr_creds['organization_name']}")
        
        # Pull realistic data from EHR simulator
        ehr_data = EHRSimulator.pull_ehr_data(ward_id=ward_id)
        
        # Extract lab tests and infections
        lab_results = ehr_data["lab_results"]
        infections = ehr_data["infections"]
        
        print(f"📊 EHR Data Retrieved: {len(lab_results)} lab tests, {len(infections)} infections")
        
        return {
            "status": "success",
            "source": "Hospital EHR System",
            "sync_id": ehr_data["ehr_sync_id"],
            "timestamp": datetime.utcnow().isoformat(),
            "raw_data": {
                "lab_tests": [t.model_dump() for t in lab_results],
                "infections": [i.model_dump() for i in infections],
            },
            "metadata": ehr_data["metadata"],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"EHR sync failed: {str(e)}")


@app.get("/api/fhir/lab-observations")
async def get_lab_observations_fhir(ward_id: str = None):
    """
    Get Lab Results in FHIR Observation Format
    Returns lab tests wrapped in FHIR Observation + DiagnosticReport resources
    FHIR R4 compliant
    """
    try:
        # Pull data from EHR
        ehr_data = EHRSimulator.pull_ehr_data(ward_id=ward_id)
        lab_results = ehr_data["lab_results"]
        
        # Transform to FHIR Bundle
        fhir_bundle = FHIRTransformer.lab_results_to_fhir_bundle(lab_results)
        
        print(f"🏥 FHIR Lab Observations Bundle created: {fhir_bundle['total']} resources")
        
        return {
            "status": "success",
            "source": "FHIR Lab Results Transform",
            "fhir_version": FHIRTransformer.FHIR_VERSION,
            "bundle": fhir_bundle,
            "timestamp": datetime.utcnow().isoformat(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"FHIR lab observations failed: {str(e)}")


@app.get("/api/fhir/infection-conditions")
async def get_infection_conditions_fhir(ward_id: str = None):
    """
    Get Infection Logs in FHIR Condition & Flag Format
    Returns infections wrapped in FHIR Condition and Flag resources
    FHIR R4 compliant - ideal for alerting systems
    """
    try:
        # Pull data from EHR
        ehr_data = EHRSimulator.pull_ehr_data(ward_id=ward_id)
        infections = ehr_data["infections"]
        
        # Transform to FHIR Bundle
        fhir_bundle = FHIRTransformer.infection_logs_to_fhir_bundle(infections)
        
        print(f"🚨 FHIR Infection Conditions Bundle created: {fhir_bundle['total']} resources")
        
        return {
            "status": "success",
            "source": "FHIR Infection Conditions Transform",
            "fhir_version": FHIRTransformer.FHIR_VERSION,
            "bundle": fhir_bundle,
            "timestamp": datetime.utcnow().isoformat(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"FHIR infection conditions failed: {str(e)}")


@app.post("/api/ehr/sync-and-transform")
async def sync_and_transform_fhir(ward_id: str = None):
    """
    Complete EHR Sync with FHIR Transformation
    Single endpoint to:
    1. Authenticate with EHR
    2. Pull patient data
    3. Transform to FHIR R4 format
    4. Return complete FHIR bundles
    
    Perfect for dashboard integration
    """
    try:
        # Step 1: Authenticate
        ehr_creds = EHRSimulator.simulate_ehr_credentials()
        print(f"✅ Step 1 - EHR Auth: {ehr_creds['organization_name']}")
        
        # Step 2: Pull data
        ehr_data = EHRSimulator.pull_ehr_data(ward_id=ward_id)
        lab_results = ehr_data["lab_results"]
        infections = ehr_data["infections"]
        print(f"📊 Step 2 - Data Retrieved: {len(lab_results)} labs, {len(infections)} infections")
        
        # Step 3: Transform to FHIR
        lab_bundle = FHIRTransformer.lab_results_to_fhir_bundle(lab_results)
        infection_bundle = FHIRTransformer.infection_logs_to_fhir_bundle(infections)
        print(f"🏥 Step 3 - FHIR Transform: {lab_bundle['total'] + infection_bundle['total']} resources")
        
        return {
            "status": "success",
            "sync_id": ehr_data["ehr_sync_id"],
            "ehr_source": {
                "system": ehr_creds["system"],
                "organization": ehr_creds["organization_name"],
                "version": ehr_creds["version"],
            },
            "fhir": {
                "version": FHIRTransformer.FHIR_VERSION,
                "lab_observations_bundle": lab_bundle,
                "infection_conditions_bundle": infection_bundle,
            },
            "statistics": {
                "total_patients": ehr_data["metadata"]["total_patients"],
                "total_observations": lab_bundle["total"],
                "total_conditions": infection_bundle["total"],
                "positive_cultures": ehr_data["metadata"]["positive_cultures"],
                "critical_infections": ehr_data["metadata"]["critical_infections"],
                "antibiotic_resistant": ehr_data["metadata"]["antibiotic_resistant_count"],
            },
            "timestamp": datetime.utcnow().isoformat(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"EHR sync and transform failed: {str(e)}")


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
