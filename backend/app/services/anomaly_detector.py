import numpy as np
import pandas as pd
import os
from typing import List, Dict, Tuple
from datetime import datetime, timedelta
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from twilio.rest import Client
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from app.models.schemas import LabTestResult, InfectionLog, AnomalyDetectionResult
from app.services.data_generator import WARD_INFO, RISK_FACTORS


class AnomalyDetector:
    """
    AI-based anomaly detector using Isolation Forest algorithm.
    Detects unusual infection clusters and outbreak patterns in hospital wards.
    """

    def __init__(self, contamination: float = 0.1):
        """
        Initialize the anomaly detector.
        contamination: Expected proportion of outliers in the dataset (0-0.5)
        """
        self.contamination = contamination
        self.isolation_forest = IsolationForest(
            contamination=contamination,
            random_state=42,
            n_estimators=100,
        )
        self.scaler = StandardScaler()
        self.fitted = False

    def extract_ward_features(
        self,
        ward_id: str,
        lab_tests: List[LabTestResult],
        infection_logs: List[InfectionLog],
        time_window_hours: int = 24,
    ) -> Tuple[Dict[str, float], List[str]]:
        """
        Extract numerical features for a specific ward.
        Returns: (features_dict, risk_factors_list)
        """
        now = datetime.utcnow()
        cutoff_time = now - timedelta(hours=time_window_hours)

        # Filter data for this ward
        ward_tests = [t for t in lab_tests if t.ward_id == ward_id]
        ward_infections = [i for i in infection_logs if i.ward_id == ward_id]

        # Count positive results
        positive_tests = len([t for t in ward_tests if t.result == "Positive"])
        total_tests = len(ward_tests)
        test_positivity_rate = positive_tests / total_tests if total_tests > 0 else 0

        # Count infection statuses
        suspected_count = len([i for i in ward_infections if i.status == "suspected"])
        confirmed_count = len([i for i in ward_infections if i.status == "confirmed"])
        resistant_count = len([i for i in ward_infections if i.antibiotic_resistant])

        # Severity scoring
        severity_scores = {
            "mild": 1,
            "moderate": 2,
            "severe": 3,
        }
        avg_severity = (
            sum(severity_scores.get(i.severity, 1) for i in ward_infections)
            / len(ward_infections)
            if ward_infections
            else 0
        )

        # Infection cluster detection (same organism in multiple tests)
        organisms = [t.organism for t in ward_tests if t.organism]
        organism_counts = {}
        for org in organisms:
            organism_counts[org] = organism_counts.get(org, 0) + 1

        max_organism_count = max(organism_counts.values()) if organism_counts else 0
        organism_clustering = max_organism_count / total_tests if total_tests > 0 else 0

        # Recent onset (infections within last 48 hours)
        recent_infections = len([i for i in ward_infections if i.onset_date > cutoff_time])

        # Feature dictionary
        features = {
            "test_positivity_rate": test_positivity_rate,
            "positive_test_count": positive_tests,
            "suspected_infection_count": suspected_count,
            "confirmed_infection_count": confirmed_count,
            "antibiotic_resistant_count": resistant_count,
            "avg_severity_score": avg_severity,
            "organism_clustering": organism_clustering,
            "recent_infections": recent_infections,
        }

        # Identify risk factors
        risk_factors_detected = []
        if test_positivity_rate > 0.2:
            risk_factors_detected.append("high_positive_rate")
        if confirmed_count > 3:
            risk_factors_detected.append("multiple_confirmed_infections")
        if resistant_count > 0:
            risk_factors_detected.append("antibiotic_resistance_detected")
        if organism_clustering > 0.3:
            risk_factors_detected.append("potential_outbreak_pattern")
        if recent_infections > 0:
            risk_factors_detected.append("recent_infection_onset")
        if avg_severity > 1.5:
            risk_factors_detected.append("high_severity_infections")

        return features, risk_factors_detected

    def detect_anomalies(
        self,
        wards: List[Dict],
        lab_tests: List[LabTestResult],
        infection_logs: List[InfectionLog],
        phone_numbers: List[str] = None,
    ) -> List[AnomalyDetectionResult]:
        """
        Detect anomalies across all wards.
        Returns: List of AnomalyDetectionResult for each ward
        """
        if phone_numbers is None:
            phone_numbers = []
        
        results = []

        # Extract features for all wards
        all_features = []
        ward_feature_map = {}

        for ward in wards:
            ward_id = ward["id"]
            features, risk_factors = self.extract_ward_features(
                ward_id, lab_tests, infection_logs
            )
            all_features.append(
                list(features.values())
            )  # Convert to list for sklearn
            ward_feature_map[ward_id] = {
                "features": features,
                "risk_factors": risk_factors,
            }

        if len(all_features) < 3:
            # Not enough data for anomaly detection, use heuristic approach
            for ward in wards:
                ward_id = ward["id"]
                features = ward_feature_map[ward_id]["features"]
                risk_factors = ward_feature_map[ward_id]["risk_factors"]

                anomaly_score = self._calculate_anomaly_score_heuristic(features)
                status = self._classify_status(
                    anomaly_score, len(risk_factors),
                    ward.get("name", "Unknown"), phone_numbers
                )

                results.append(
                    AnomalyDetectionResult(
                        ward_id=ward_id,
                        ward_name=ward.get("name", "Unknown"),
                        anomaly_score=anomaly_score,
                        status=status,
                        detected_at=datetime.utcnow(),
                        infection_clusters=int(features.get("organism_clustering", 0) * 10),
                        risk_factors=risk_factors,
                        confidence=0.7,
                    )
                )
            return results

        # Prepare data for isolation forest
        X = np.array(all_features)
        X_scaled = self.scaler.fit_transform(X)

        # Fit and predict
        predictions = self.isolation_forest.fit_predict(X_scaled)
        anomaly_scores = -self.isolation_forest.score_samples(X_scaled)
        anomaly_scores = (anomaly_scores - anomaly_scores.min()) / (
            anomaly_scores.max() - anomaly_scores.min() + 1e-6
        )

        # Generate results for each ward
        for idx, ward in enumerate(wards):
            ward_id = ward["id"]
            features = ward_feature_map[ward_id]["features"]
            risk_factors = ward_feature_map[ward_id]["risk_factors"]

            anomaly_score = float(anomaly_scores[idx])
            is_anomaly = predictions[idx] == -1

            if is_anomaly:
                # Combine with heuristic score
                heuristic_score = self._calculate_anomaly_score_heuristic(features)
                anomaly_score = (anomaly_score + heuristic_score) / 2

            status = self._classify_status(
                anomaly_score, len(risk_factors),
                ward.get("name", "Unknown"), phone_numbers
            )

            results.append(
                AnomalyDetectionResult(
                    ward_id=ward_id,
                    ward_name=ward.get("name", "Unknown"),
                    anomaly_score=anomaly_score,
                    status=status,
                    detected_at=datetime.utcnow(),
                    infection_clusters=int(features.get("organism_clustering", 0) * 10),
                    risk_factors=risk_factors,
                    confidence=0.85 if is_anomaly else 0.75,
                )
            )

        return results

    def _calculate_anomaly_score_heuristic(self, features: Dict[str, float]) -> float:
        """
        Calculate anomaly score using heuristic method based on domain knowledge.
        """
        score = 0.0

        # Positivity rate (0-40 points)
        score += features.get("test_positivity_rate", 0) * 40

        # Infection counts (0-30 points)
        confirmed = features.get("confirmed_infection_count", 0)
        score += min(confirmed / 5 * 30, 30)

        # Antibiotic resistance (0-15 points)
        resistant = features.get("antibiotic_resistant_count", 0)
        score += min(resistant / 3 * 15, 15)

        # Organism clustering (0-15 points)
        clustering = features.get("organism_clustering", 0)
        score += clustering * 15

        # Normalize to 0-1
        return min(score / 100, 1.0)

    def send_incident_alert(
        self, ward_name: str, priority: str, anomaly_score: float, phone_numbers: List[str]
    ) -> bool:
        """
        Send incident alert via SMS to multiple phone numbers using Twilio.
        
        Args:
            ward_name: Name of the ward
            priority: Priority level (critical/warning)
            anomaly_score: Anomaly score (0-1)
            phone_numbers: List of phone numbers to alert (e.g., doctors)
        
        Returns:
            True if alerts sent successfully, False otherwise
        """
        try:
            account_sid = os.getenv("TWILIO_ACCOUNT_SID")
            auth_token = os.getenv("TWILIO_AUTH_TOKEN")
            client = Client(account_sid, auth_token)
            
            score_percentage = int(anomaly_score * 100)
            alert_message = f"⚠️ HISS {priority.upper()} ALERT\nWard: {ward_name}\nRisk Score: {score_percentage}%\nPriority: {priority}\nPlease check the dashboard immediately."
            
            # Send SMS to all 3 phone numbers
            for phone_number in phone_numbers:
                try:
                    message = client.messages.create(
                        body=alert_message,
                        from_='+1234567890',  # Your Twilio Number
                        to=phone_number
                    )
                    print(f"Alert sent to {phone_number}: {message.sid}")
                except Exception as e:
                    print(f"Failed to send alert to {phone_number}: {str(e)}")
            
            return True
        except Exception as e:
            print(f"Error sending incident alerts: {str(e)}")
            return False

    def _classify_status(
        self, anomaly_score: float, risk_factor_count: int,
        ward_name: str = "Unknown", phone_numbers: List[str] = None
    ) -> str:
        """
        Classify anomaly status based on score and risk factors.
        Sends alerts for critical wards.
        """
        if phone_numbers is None:
            phone_numbers = ['+916367690519','+916376870280']
        
        if anomaly_score >= 0.6 or risk_factor_count >= 4:
            # Send critical alert to all numbers
            if phone_numbers:
                self.send_incident_alert(ward_name, "critical", anomaly_score, phone_numbers)
            return "critical"
        elif anomaly_score >= 0.35 or risk_factor_count >= 2:
            # Send warning alert to all numbers
            if phone_numbers:
                self.send_incident_alert(ward_name, "warning", anomaly_score, phone_numbers)
            return "warning"
        else:
            return "normal"


# Example Usage:
# ============
# To use the anomaly detector with SMS alerts to 3 doctors:
#
# detector = AnomalyDetector()
# three_doctor_numbers = ['+919999999999', '+919999999998', '+919999999997']  # 3 phone numbers
# 
# results = detector.detect_anomalies(
#     wards=wards_list,
#     lab_tests=lab_tests_list,
#     infection_logs=infection_logs_list,
#     phone_numbers=three_doctor_numbers  # Pass the 3 numbers here
# )
#
# When an anomaly is detected (acute status):
# - Critical alert (score >= 0.6): Sends SMS to all 3 numbers
# - Warning alert (score >= 0.35): Sends SMS to all 3 numbers
# - Normal: No alerts sent
