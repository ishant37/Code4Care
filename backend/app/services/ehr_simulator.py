"""
EHR (Electronic Health Record) Simulator
Simulates pulling realistic patient data from a hospital EHR system
"""
from datetime import datetime, timedelta
import random
import uuid
from app.models.schemas import LabTestResult, InfectionLog


class EHRSimulator:
    """Simulates an external Hospital EHR system"""
    
    # Realistic patient names for simulation
    PATIENT_NAMES = [
        "John Smith", "Mary Johnson", "Robert Brown", "Patricia Davis",
        "Michael Wilson", "Linda Anderson", "William Taylor", "Barbara Thomas",
        "David Moore", "Susan Jackson", "Richard White", "Jessica Harris",
        "Joseph Martin", "Sarah Thompson", "James Garcia", "Karen Martinez"
    ]
    
    # Organism types commonly found in hospitals
    ORGANISMS = [
        "Staphylococcus aureus",
        "Escherichia coli",
        "Pseudomonas aeruginosa",
        "Klebsiella pneumoniae",
        "Acinetobacter baumannii",
        "Enterococcus faecium",
        "Clostridium difficile",
        None  # Some cultures don't identify organism
    ]
    
    # Specimen sources
    SPECIMEN_SOURCES = ["Blood", "Urine", "Wound", "Sputum", "CSF", "Other"]
    
    # Lab test types
    LAB_TEST_TYPES = [
        "Blood Culture",
        "Urinalysis",
        "Swab",
        "CBC",
        "CRP",
        "ESR"
    ]
    
    # Hospital wards
    WARDS = {
        "ICU-1": "Intensive Care Unit - Block 1",
        "ICU-2": "Intensive Care Unit - Block 2",
        "SURG": "Surgical Ward",
        "PEDS": "Pediatric Ward",
        "ORTHO": "Orthopedic Ward",
        "NEURO": "Neurology Ward"
    }
    
    @staticmethod
    def generate_realistic_patient_id() -> str:
        """Generate realistic hospital patient ID"""
        return f"MRN-{random.randint(100000, 999999)}"
    
    @staticmethod
    def generate_lab_test_results(count: int = 15, ward_id: str = None) -> list[LabTestResult]:
        """
        Generate realistic lab test results as if pulled from EHR
        Simulates actual hospital lab data
        """
        if ward_id is None:
            ward_id = random.choice(list(EHRSimulator.WARDS.keys()))
        
        results = []
        ward_name = EHRSimulator.WARDS[ward_id]
        
        for _ in range(count):
            patient_id = EHRSimulator.generate_realistic_patient_id()
            
            # 60% positive for more realistic hospital data
            result = random.choices(
                ["Positive", "Negative", "Pending"],
                weights=[60, 30, 10]
            )[0]
            
            # Only add organism for positive results
            organism = EHRSimulator.ORGANISMS[0:7] if result == "Positive" else [None]
            
            lab_test = LabTestResult(
                patient_id=patient_id,
                ward_id=ward_id,
                ward_name=ward_name,
                test_type=random.choice(EHRSimulator.LAB_TEST_TYPES),
                organism=random.choice(organism),
                result=result,
                source=random.choice(EHRSimulator.SPECIMEN_SOURCES),
                timestamp=datetime.utcnow() - timedelta(hours=random.randint(0, 48))
            )
            results.append(lab_test)
        
        return results
    
    @staticmethod
    def generate_infection_logs(count: int = 8, ward_id: str = None) -> list[InfectionLog]:
        """
        Generate realistic infection logs as if pulled from EHR
        Simulates actual HAI (Healthcare-Associated Infection) cases
        """
        if ward_id is None:
            ward_id = random.choice(list(EHRSimulator.WARDS.keys()))
        
        infections = []
        ward_name = EHRSimulator.WARDS[ward_id]
        
        # Realistic HAI types
        hai_types = ["SSI", "UTI", "VEI", "CLABSI", "CDIFF"]
        
        for _ in range(count):
            patient_id = EHRSimulator.generate_realistic_patient_id()
            
            # Status distribution: mostly confirmed, some suspected, few resolved
            status = random.choices(
                ["confirmed", "suspected", "resolved"],
                weights=[60, 30, 10]
            )[0]
            
            # Severity distribution: realistic hospital ratios
            severity = random.choices(
                ["mild", "moderate", "severe"],
                weights=[50, 35, 15]
            )[0]
            
            # Antibiotic resistance: 20% of infections
            resistant = random.random() < 0.20
            
            onset_date = datetime.utcnow() - timedelta(days=random.randint(1, 14))
            
            infection_log = InfectionLog(
                patient_id=patient_id,
                ward_id=ward_id,
                ward_name=ward_name,
                infection_type=random.choice(hai_types),
                onset_date=onset_date,
                status=status,
                severity=severity,
                antibiotic_resistant=resistant,
                timestamp=datetime.utcnow()
            )
            infections.append(infection_log)
        
        return infections
    
    @staticmethod
    def pull_ehr_data(ward_id: str = None) -> dict:
        """
        Simulate pulling complete patient data from EHR
        Returns realistic lab and infection data
        """
        lab_results = EHRSimulator.generate_lab_test_results(count=15, ward_id=ward_id)
        infections = EHRSimulator.generate_infection_logs(count=8, ward_id=ward_id)
        
        return {
            "ehr_sync_id": str(uuid.uuid4()),
            "timestamp": datetime.utcnow().isoformat(),
            "source": "Hospital EHR System Simulation",
            "ward": ward_id or "Multi-Ward",
            "lab_results": lab_results,
            "infections": infections,
            "metadata": {
                "total_patients": len(set(r.patient_id for r in lab_results) | set(i.patient_id for i in infections)),
                "total_lab_tests": len(lab_results),
                "total_infections": len(infections),
                "positive_cultures": sum(1 for r in lab_results if r.result == "Positive"),
                "critical_infections": sum(1 for i in infections if i.severity == "severe"),
                "antibiotic_resistant_count": sum(1 for i in infections if i.antibiotic_resistant)
            }
        }
    
    @staticmethod
    def simulate_ehr_credentials() -> dict:
        """Simulate EHR system authentication response"""
        return {
            "system": "Hospital Central EHR",
            "version": "v2.5.1",
            "organization_id": "JMCH-001",
            "organization_name": "Jaipur Medical & Care Hospital",
            "authenticated": True,
            "user": "system_integration_bot",
            "access_level": "read_patient_data",
            "timestamp": datetime.utcnow().isoformat(),
            "session_token": str(uuid.uuid4()),
            "expires_in": 3600
        }
