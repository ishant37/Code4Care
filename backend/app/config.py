import os
from dotenv import load_dotenv

load_dotenv()

# API Configuration
API_TITLE = "Hospital Infection Surveillance System"
API_VERSION = "1.0.0"

# Server Configuration
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", 8000))
DEBUG = os.getenv("DEBUG", "False").lower() == "true"

# Data Generation
DATA_GENERATION_INTERVAL = int(os.getenv("DATA_GENERATION_INTERVAL", 60))  # seconds
BATCH_SIZE = int(os.getenv("BATCH_SIZE", 20))

# Anomaly Detection
ANOMALY_CHECK_INTERVAL = int(os.getenv("ANOMALY_CHECK_INTERVAL", 30))  # seconds
ANOMALY_CONTAMINATION = float(os.getenv("ANOMALY_CONTAMINATION", 0.1))

# Alert Thresholds
CRITICAL_THRESHOLD = float(os.getenv("CRITICAL_THRESHOLD", 0.6))
WARNING_THRESHOLD = float(os.getenv("WARNING_THRESHOLD", 0.35))

# Hospital Configuration
WARDS = [
    {"id": "icu-01", "name": "ICU Ward", "position": [-8, 0, -8]},
    {"id": "gen-01", "name": "General Ward", "position": [0, 0, -8]},
    {"id": "surg-01", "name": "Surgery Ward", "position": [8, 0, -8]},
    {"id": "pedi-01", "name": "Pediatrics", "position": [-8, 0, 8]},
    {"id": "emer-01", "name": "Emergency", "position": [0, 0, 8]},
    {"id": "amb-01", "name": "Ambulatory", "position": [8, 0, 8]},
]

# Frontend URL
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

print(f"""
╔══════════════════════════════════════════════════════════════╗
║  Hospital Infection Surveillance System (HISS)              ║
║  Configuration Loaded                                        ║
╠══════════════════════════════════════════════════════════════╣
║  API: {API_TITLE:<48} ║
║  Version: {API_VERSION:<52} ║
║  Server: {HOST}:{PORT:<46} ║
║  DEBUG: {str(DEBUG):<54} ║
║  Data Generation Interval: {DATA_GENERATION_INTERVAL}s                      ║
║  Anomaly Check Interval: {ANOMALY_CHECK_INTERVAL}s                          ║
║  Wards: {len(WARDS):<58} ║
╚══════════════════════════════════════════════════════════════╝
""")
