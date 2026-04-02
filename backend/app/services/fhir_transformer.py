"""
FHIR (Fast Healthcare Interoperability Resources) Transformation Module
Converts Clinical Data to HL7 FHIR JSON-LD Format (R4)
"""
from datetime import datetime
from typing import Optional
import uuid
from app.models.schemas import LabTestResult, InfectionLog


class FHIRTransformer:
    """Transform clinical data to FHIR compliant resources"""
    
    FHIR_VERSION = "4.0.1"
    SYSTEM_URL = "https://jmch-hospital.org"
    
    @staticmethod
    def create_patient_reference(patient_id: str) -> dict:
        """Create FHIR Patient reference"""
        return {
            "reference": f"Patient/{patient_id}",
            "type": "Patient",
            "display": f"Patient {patient_id}"
        }
    
    @staticmethod
    def create_lab_observation(lab_result: LabTestResult) -> dict:
        """
        Transform LabTestResult to FHIR Observation Resource
        Represents individual lab test results
        """
        observation_id = str(uuid.uuid4())
        
        # Map test type to LOINC codes (standardized lab codes)
        loinc_mapping = {
            "Blood Culture": "600-7",
            "Swab": "597-4",
            "Urinalysis": "5803-2",
            "CBC": "57021-8",
            "CRP": "1988-5",
            "ESR": "4537-7"
        }
        
        loinc_code = loinc_mapping.get(lab_result.test_type, "15545-0")
        
        # Map result to standardized codes
        result_code_mapping = {
            "Positive": "260373001",   # SNOMED CT: Positive
            "Negative": "260415000",   # SNOMED CT: Negative
            "Pending": "385655000"     # SNOMED CT: Pending
        }
        
        return {
            "resourceType": "Observation",
            "id": observation_id,
            "meta": {
                "profile": [
                    "http://hl7.org/fhir/StructureDefinition/Observation"
                ],
                "lastUpdated": datetime.utcnow().isoformat() + "Z"
            },
            "identifier": [
                {
                    "system": f"{FHIRTransformer.SYSTEM_URL}/observation",
                    "value": lab_result.id
                }
            ],
            "basedOn": [
                {
                    "reference": f"ServiceRequest/{lab_result.ward_id}",
                    "type": "ServiceRequest"
                }
            ],
            "status": "final",
            "category": [
                {
                    "coding": [
                        {
                            "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                            "code": "laboratory",
                            "display": "Laboratory"
                        }
                    ]
                }
            ],
            "code": {
                "coding": [
                    {
                        "system": "http://loinc.org",
                        "code": loinc_code,
                        "display": lab_result.test_type
                    }
                ],
                "text": lab_result.test_type
            },
            "subject": FHIRTransformer.create_patient_reference(lab_result.patient_id),
            "effectiveDateTime": lab_result.timestamp.isoformat() + "Z",
            "issued": datetime.utcnow().isoformat() + "Z",
            "performer": [
                {
                    "reference": f"Organization/{lab_result.ward_id}",
                    "type": "Organization",
                    "display": lab_result.ward_name
                }
            ],
            "specimen": [
                {
                    "reference": f"Specimen/{str(uuid.uuid4())}",
                    "type": "Specimen",
                    "display": f"{lab_result.source} sample"
                }
            ],
            "value": {
                "coding": [
                    {
                        "system": "http://snomed.info/sct",
                        "code": result_code_mapping.get(lab_result.result, "unknown"),
                        "display": lab_result.result
                    }
                ],
                "text": lab_result.result
            },
            "interpretation": [
                {
                    "coding": [
                        {
                            "system": "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation",
                            "code": "POS" if lab_result.result == "Positive" else "NEG" if lab_result.result == "Negative" else "PENDING",
                            "display": lab_result.result
                        }
                    ]
                }
            ],
            "note": [
                {
                    "text": f"Source: {lab_result.source}. Organism: {lab_result.organism or 'Not identified'}"
                }
            ]
        }
    
    @staticmethod
    def create_diagnostic_report(lab_results: list[LabTestResult]) -> dict:
        """
        Create FHIR DiagnosticReport bundling multiple lab observations
        """
        report_id = str(uuid.uuid4())
        
        if not lab_results:
            return {}
        
        # Use first result's patient for report
        first_result = lab_results[0]
        
        return {
            "resourceType": "DiagnosticReport",
            "id": report_id,
            "meta": {
                "profile": [
                    "http://hl7.org/fhir/StructureDefinition/DiagnosticReport"
                ],
                "lastUpdated": datetime.utcnow().isoformat() + "Z"
            },
            "status": "final",
            "category": [
                {
                    "coding": [
                        {
                            "system": "http://terminology.hl7.org/CodeSystem/v2-0074",
                            "code": "LAB",
                            "display": "Laboratory"
                        }
                    ]
                }
            ],
            "code": {
                "coding": [
                    {
                        "system": "http://loinc.org",
                        "code": "11502-2",
                        "display": "Laboratory report"
                    }
                ],
                "text": "Lab Results Report"
            },
            "subject": FHIRTransformer.create_patient_reference(first_result.patient_id),
            "issued": datetime.utcnow().isoformat() + "Z",
            "performer": [
                {
                    "reference": f"Organization/{first_result.ward_id}",
                    "type": "Organization",
                    "display": first_result.ward_name
                }
            ],
            "result": [
                {
                    "reference": f"Observation/{str(uuid.uuid4())}",
                    "type": "Observation"
                }
                for _ in lab_results
            ],
            "conclusion": f"Analyzed {len(lab_results)} lab test(s) from {first_result.ward_name}",
            "conclusionCode": [
                {
                    "coding": [
                        {
                            "system": "http://snomed.info/sct",
                            "code": "840533007",
                            "display": "Laboratory test"
                        }
                    ]
                }
            ]
        }
    
    @staticmethod
    def create_infection_condition(infection: InfectionLog) -> dict:
        """
        Transform InfectionLog to FHIR Condition Resource
        Represents healthcare-associated infections
        """
        condition_id = str(uuid.uuid4())
        
        # Map infection types to SNOMED CT codes
        infection_snomed_mapping = {
            "SSI": "281784007",   # Surgical site infection
            "UTI": "68566005",    # Urinary tract infection
            "VEI": "29882004",    # Ventilator-associated pneumonia
            "CLABSI": "41030004", # Bloodstream infection
            "CDIFF": "3092002"    # Clostridium difficile infection
        }
        
        snomed_code = infection_snomed_mapping.get(infection.infection_type, "80384002")
        
        # Map status to FHIR clinical status
        clinical_status_mapping = {
            "suspected": "preliminary",
            "confirmed": "active",
            "resolved": "resolved"
        }
        
        # Map severity to FHIR severity codes
        severity_mapping = {
            "mild": "255604002",
            "moderate": "6736007",
            "severe": "24484000"
        }
        
        return {
            "resourceType": "Condition",
            "id": condition_id,
            "meta": {
                "profile": [
                    "http://hl7.org/fhir/StructureDefinition/Condition"
                ],
                "lastUpdated": datetime.utcnow().isoformat() + "Z"
            },
            "identifier": [
                {
                    "system": f"{FHIRTransformer.SYSTEM_URL}/condition",
                    "value": infection.id
                }
            ],
            "clinicalStatus": {
                "coding": [
                    {
                        "system": "http://terminology.hl7.org/CodeSystem/condition-clinical",
                        "code": clinical_status_mapping[infection.status]
                    }
                ]
            },
            "verificationStatus": {
                "coding": [
                    {
                        "system": "http://terminology.hl7.org/CodeSystem/condition-ver-status",
                        "code": "confirmed" if infection.status == "confirmed" else "unconfirmed"
                    }
                ]
            },
            "category": [
                {
                    "coding": [
                        {
                            "system": "http://terminology.hl7.org/CodeSystem/condition-category",
                            "code": "infection",
                            "display": "Infection"
                        }
                    ]
                }
            ],
            "code": {
                "coding": [
                    {
                        "system": "http://snomed.info/sct",
                        "code": snomed_code,
                        "display": infection.infection_type
                    }
                ],
                "text": f"Healthcare-Associated Infection: {infection.infection_type}"
            },
            "subject": FHIRTransformer.create_patient_reference(infection.patient_id),
            "onsetDateTime": infection.onset_date.isoformat() + "Z",
            "recordedDate": datetime.utcnow().isoformat() + "Z",
            "recorder": {
                "reference": f"Practitioner/{str(uuid.uuid4())}",
                "type": "Practitioner",
                "display": "Hospital Infection Control"
            },
            "note": [
                {
                    "text": f"Ward: {infection.ward_name}. Antibiotic Resistant: {infection.antibiotic_resistant}"
                }
            ],
            "severity": {
                "coding": [
                    {
                        "system": "http://snomed.info/sct",
                        "code": severity_mapping[infection.severity],
                        "display": infection.severity.capitalize()
                    }
                ]
            }
        }
    
    @staticmethod
    def create_infection_flag(infection: InfectionLog) -> dict:
        """
        Create FHIR Flag Resource for infection alerts
        Flags are for high-priority items requiring clinical attention
        """
        flag_id = str(uuid.uuid4())
        
        # Map status to flag codes
        flag_status_mapping = {
            "suspected": "suspected",
            "confirmed": "active",
            "resolved": "inactive"
        }
        
        return {
            "resourceType": "Flag",
            "id": flag_id,
            "meta": {
                "profile": [
                    "http://hl7.org/fhir/StructureDefinition/Flag"
                ],
                "lastUpdated": datetime.utcnow().isoformat() + "Z"
            },
            "identifier": [
                {
                    "system": f"{FHIRTransformer.SYSTEM_URL}/flag",
                    "value": f"infection-{infection.id}"
                }
            ],
            "status": flag_status_mapping[infection.status],
            "category": [
                {
                    "coding": [
                        {
                            "system": "http://terminology.hl7.org/CodeSystem/flag-category",
                            "code": "infection-control",
                            "display": "Infection Control"
                        }
                    ]
                }
            ],
            "code": {
                "coding": [
                    {
                        "system": "http://snomed.info/sct",
                        "code": "50581003",
                        "display": "Healthcare-associated infection"
                    }
                ],
                "text": f"Alert: {infection.infection_type} - {infection.severity.upper()}"
            },
            "subject": FHIRTransformer.create_patient_reference(infection.patient_id),
            "period": {
                "start": infection.onset_date.isoformat() + "Z",
                "end": None if infection.status != "resolved" else datetime.utcnow().isoformat() + "Z"
            },
            "encounterDetail": [
                {
                    "reference": f"Encounter/{infection.ward_id}",
                    "display": infection.ward_name
                }
            ],
            "author": {
                "reference": f"Organization/{infection.ward_id}",
                "type": "Organization",
                "display": infection.ward_name
            },
            "title": f"HAI Alert: {infection.infection_type}",
            "description": f"Severity: {infection.severity} | Antibiotic Resistant: {infection.antibiotic_resistant}",
            "priority": "high" if infection.severity == "severe" else "medium"
        }
    
    @staticmethod
    def lab_results_to_fhir_bundle(lab_results: list[LabTestResult]) -> dict:
        """
        Create FHIR Bundle containing multiple Observation resources
        """
        bundle_id = str(uuid.uuid4())
        
        entries = []
        for lab in lab_results:
            observation = FHIRTransformer.create_lab_observation(lab)
            entries.append({
                "fullUrl": f"{FHIRTransformer.SYSTEM_URL}/Observation/{observation['id']}",
                "resource": observation,
                "request": {
                    "method": "POST",
                    "url": "Observation"
                }
            })
        
        # Add DiagnosticReport
        if lab_results:
            diagnostic_report = FHIRTransformer.create_diagnostic_report(lab_results)
            entries.append({
                "fullUrl": f"{FHIRTransformer.SYSTEM_URL}/DiagnosticReport/{diagnostic_report['id']}",
                "resource": diagnostic_report,
                "request": {
                    "method": "POST",
                    "url": "DiagnosticReport"
                }
            })
        
        return {
            "resourceType": "Bundle",
            "id": bundle_id,
            "meta": {
                "lastUpdated": datetime.utcnow().isoformat() + "Z"
            },
            "type": "transaction",
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "total": len(entries),
            "entry": entries
        }
    
    @staticmethod
    def infection_logs_to_fhir_bundle(infections: list[InfectionLog]) -> dict:
        """
        Create FHIR Bundle containing Condition and Flag resources for infections
        """
        bundle_id = str(uuid.uuid4())
        
        entries = []
        for infection in infections:
            # Add Condition resource
            condition = FHIRTransformer.create_infection_condition(infection)
            entries.append({
                "fullUrl": f"{FHIRTransformer.SYSTEM_URL}/Condition/{condition['id']}",
                "resource": condition,
                "request": {
                    "method": "POST",
                    "url": "Condition"
                }
            })
            
            # Add Flag resource for high-priority alert
            flag = FHIRTransformer.create_infection_flag(infection)
            entries.append({
                "fullUrl": f"{FHIRTransformer.SYSTEM_URL}/Flag/{flag['id']}",
                "resource": flag,
                "request": {
                    "method": "POST",
                    "url": "Flag"
                }
            })
        
        return {
            "resourceType": "Bundle",
            "id": bundle_id,
            "meta": {
                "lastUpdated": datetime.utcnow().isoformat() + "Z"
            },
            "type": "transaction",
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "total": len(entries),
            "entry": entries
        }
