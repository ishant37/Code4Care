import hashlib
import random
from datetime import datetime, timedelta
from typing import List
import pandas as pd
import numpy as np

from app.models.schemas import LabTestResult, InfectionLog, DISHAPatientRecord

# ==================== Mock Data Generators ====================

WARD_INFO = {
    "icu-01": {"name": "ICU Ward", "capacity": 15},
    "gen-01": {"name": "General Ward", "capacity": 45},
    "surg-01": {"name": "Surgery Ward", "capacity": 20},
    "pedi-01": {"name": "Pediatrics", "capacity": 30},
    "emer-01": {"name": "Emergency", "capacity": 50},
    "amb-01": {"name": "Ambulatory", "capacity": 25},
}

TEST_TYPES = [
    "Blood Culture",
    "Urinalysis",
    "Wound Swab",
    "Sputum Culture",
    "Nasal Swab",
]

ORGANISMS = [
    "Staphylococcus aureus",
    "Enterococcus faecium",
    "Pseudomonas aeruginosa",
    "Acinetobacter baumannii",
    "Candida auris",
    "Clostridium difficile",
]

INFECTION_TYPES = ["SSI", "UTI", "VAI", "CLABSI", "HAP"]

RISK_FACTORS = [
    "prolonged_hospitalization",
    "invasive_device",
    "immunocompromised",
    "antibiotic_use",
    "surgery_recent",
    "old_age",
]


def generate_mock_lab_test(ward_id: str, infection_probability: float = 0.15) -> LabTestResult:
    """
    Generate a mock lab test result.
    infection_probability: probability of positive result
    """
    ward_name = WARD_INFO.get(ward_id, {}).get("name", "Unknown")
    patient_id = f"PAT-{random.randint(10000, 99999)}"

    # Determine if result is positive
    is_positive = random.random() < infection_probability
    result = "Positive" if is_positive else "Negative"

    return LabTestResult(
        patient_id=patient_id,
        ward_id=ward_id,
        ward_name=ward_name,
        test_type=random.choice(TEST_TYPES),
        organism=random.choice(ORGANISMS) if is_positive else None,
        result=result,
        source=random.choice(["Blood", "Wound", "Urine", "Sputum"]),
    )


def generate_mock_infection_log(ward_id: str) -> InfectionLog:
    """Generate a mock infection log"""
    ward_name = WARD_INFO.get(ward_id, {}).get("name", "Unknown")
    patient_id = f"PAT-{random.randint(10000, 99999)}"

    onset_date = datetime.utcnow() - timedelta(days=random.randint(1, 7))

    return InfectionLog(
        patient_id=patient_id,
        ward_id=ward_id,
        ward_name=ward_name,
        infection_type=random.choice(INFECTION_TYPES),
        onset_date=onset_date,
        status=random.choices(
            ["suspected", "confirmed", "resolved"],
            weights=[0.3, 0.5, 0.2],
        )[0],
        severity=random.choices(
            ["mild", "moderate", "severe"],
            weights=[0.4, 0.4, 0.2],
        )[0],
        antibiotic_resistant=random.random() < 0.1,
    )


def generate_mock_clinical_data(
    num_tests: int = 20,
) -> tuple[List[LabTestResult], List[InfectionLog]]:
    """
    Generate a batch of mock clinical data.
    Simulates real-time data ingestion from hospital systems.
    """
    lab_tests = []
    infection_logs = []

    wards = list(WARD_INFO.keys())

    # Vary infection probability by ward (ICU and Emergency higher risk)
    ward_probabilities = {
        "icu-01": 0.35,
        "emer-01": 0.30,
        "surg-01": 0.20,
        "gen-01": 0.15,
        "pedi-01": 0.10,
        "amb-01": 0.05,
    }

    for _ in range(num_tests):
        ward_id = random.choice(wards)
        infection_prob = ward_probabilities.get(ward_id, 0.15)

        lab_test = generate_mock_lab_test(ward_id, infection_prob)
        lab_tests.append(lab_test)

        # Occasionally generate infection logs
        if random.random() < 0.1:
            infection_log = generate_mock_infection_log(ward_id)
            infection_logs.append(infection_log)

    return lab_tests, infection_logs


def _anonymize_patient_id(seed: str) -> str:
    """Pseudonymize patient ID using SHA-256 — no real PHI stored."""
    h = hashlib.sha256(seed.encode()).hexdigest()[:6].upper()
    return f"PAT-{h}"


# Ward-level risk weights used by DISHA synthetic data
_WARD_RISK_WEIGHTS = {
    "icu-01":  (0.55, 0.45),   # (mean, std) — high risk
    "emer-01": (0.50, 0.40),
    "surg-01": (0.35, 0.30),
    "gen-01":  (0.25, 0.25),
    "pedi-01": (0.20, 0.20),
    "amb-01":  (0.10, 0.15),
}


def generate_disha_patient_records(num_records: int = 50) -> List[DISHAPatientRecord]:
    """
    Generate DISHA-compliant anonymized synthetic patient records.
    Each record includes a pseudonymized patient_id, ward_id, infection_type,
    risk_score (simulated Isolation Forest output), and DISHA compliance flags.
    """
    records: List[DISHAPatientRecord] = []
    wards = list(WARD_INFO.keys())

    for i in range(num_records):
        ward_id = random.choice(wards)
        ward_name = WARD_INFO[ward_id]["name"]

        # Pseudonymize patient identity
        raw_id = f"{ward_id}-{i}-{random.randint(100000, 999999)}"
        patient_id = _anonymize_patient_id(raw_id)

        # Simulate Isolation Forest risk score using ward-specific distribution
        mean, std = _WARD_RISK_WEIGHTS.get(ward_id, (0.25, 0.25))
        risk_score = float(np.clip(np.random.normal(mean, std), 0.0, 1.0))
        flagged = risk_score >= 0.6

        is_infected = risk_score > 0.3 or random.random() < 0.15
        infection_type = random.choice(INFECTION_TYPES) if is_infected else None
        organism = random.choice(ORGANISMS) if is_infected else None

        onset_date = datetime.utcnow() - timedelta(days=random.randint(0, 14))

        records.append(DISHAPatientRecord(
            patient_id=patient_id,
            ward_id=ward_id,
            ward_name=ward_name,
            infection_type=infection_type,
            risk_score=round(risk_score, 4),
            isolation_forest_flag=flagged,
            specimen_type=random.choice(["Blood", "Urine", "Wound", "Sputum"]),
            organism=organism,
            antibiotic_resistant=random.random() < 0.08,
            onset_date=onset_date,
            status=random.choices(
                ["suspected", "confirmed", "resolved"],
                weights=[0.30, 0.50, 0.20],
            )[0],
            severity=random.choices(
                ["mild", "moderate", "severe"],
                weights=[0.40, 0.40, 0.20],
            )[0],
        ))

    return records


def calculate_hospital_stats(
    lab_tests: List[LabTestResult],
    infection_logs: List[InfectionLog],
) -> dict:
    """
    Calculate global hospital statistics from recent data.
    """
    total_patients = len(set(t.patient_id for t in lab_tests))
    suspected_infections = len([l for l in infection_logs if l.status == "suspected"])
    confirmed_infections = len([l for l in infection_logs if l.status == "confirmed"])
    critical_alerts = suspected_infections + confirmed_infections

    # Count positive results
    positive_results = len([t for t in lab_tests if t.result == "Positive"])

    return {
        "total_patients": total_patients,
        "suspected_infections": suspected_infections,
        "critical_alerts": critical_alerts,
    }
