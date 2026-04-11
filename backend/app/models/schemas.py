from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, Field
import uuid

# ==================== Lab & Patient Data ====================
class LabTestResult(BaseModel):
    """Lab test result from clinical tests"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    patient_id: str
    ward_id: str
    ward_name: str
    test_type: str  # e.g., "Blood Culture", "Swab", "Urinalysis"
    organism: Optional[str] = None  # e.g., "Staphylococcus aureus"
    result: str  # "Positive", "Negative", "Pending"
    source: str  # "Blood", "Wound", "Urine"
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_encoders = {datetime: lambda v: v.isoformat()}


class InfectionLog(BaseModel):
    """Infection control log"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    patient_id: str
    ward_id: str
    ward_name: str
    infection_type: str  # HAI type: SSI, UTI, VEI, etc.
    onset_date: datetime
    status: Literal["suspected", "confirmed", "resolved"]
    severity: Literal["mild", "moderate", "severe"]
    antibiotic_resistant: bool = False
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_encoders = {datetime: lambda v: v.isoformat()}


# ==================== Anomaly Detection ====================
class AnomalyDetectionResult(BaseModel):
    """Result of anomaly detection on a ward"""
    ward_id: str
    ward_name: str
    anomaly_score: float  # 0-1
    status: Literal["normal", "warning", "critical"]
    detected_at: datetime
    infection_clusters: int
    risk_factors: list[str]
    confidence: float

    class Config:
        json_encoders = {datetime: lambda v: v.isoformat()}


# ==================== WebSocket Messages ====================
class AlertMessage(BaseModel):
    """Alert message sent to frontend"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    ward_id: str
    ward_name: str
    severity: Literal["normal", "warning", "critical"]
    message: str
    timestamp: int  # milliseconds since epoch

    class Config:
        json_encoders = {datetime: lambda v: v.isoformat()}


class HospitalStats(BaseModel):
    """Global hospital statistics"""
    total_patients: int
    suspected_infections: int
    critical_alerts: int
    normal_wards: int
    warning_wards: int
    critical_wards: int
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_encoders = {datetime: lambda v: v.isoformat()}


class WebSocketMessage(BaseModel):
    """Generic WebSocket message"""
    type: Literal["alert", "update", "stats", "patient_record"]
    payload: dict


# ==================== DISHA-Compliant Patient Record ====================
class DISHAPatientRecord(BaseModel):
    """
    Anonymized synthetic patient record complying with
    DISHA (Digital Information Security in Healthcare Act) standards.
    No real PHI — all identifiers are hashed/pseudonymized.
    """
    record_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    patient_id: str                     # pseudonymized — e.g. PAT-A7B2C3
    ward_id: str
    ward_name: str
    infection_type: Optional[str]       # SSI, UTI, VAP, CLABSI, HAP, or None
    risk_score: float                   # 0.0 – 1.0 (Isolation Forest output)
    isolation_forest_flag: bool         # True if risk_score >= 0.6
    specimen_type: str                  # Blood, Urine, Wound, Sputum
    organism: Optional[str]             # pathogen, None if culture-negative
    antibiotic_resistant: bool
    onset_date: datetime
    status: Literal["suspected", "confirmed", "resolved"]
    severity: Literal["mild", "moderate", "severe"]
    data_consent: bool = True           # DISHA: explicit consent recorded
    data_encrypted: bool = True         # DISHA: data encrypted at rest
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_encoders = {datetime: lambda v: v.isoformat()}
