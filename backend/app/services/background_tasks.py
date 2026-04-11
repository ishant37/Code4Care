import asyncio
import time
from datetime import datetime
from typing import List
from app.models.schemas import WebSocketMessage, HospitalStats
from app.services.data_generator import generate_mock_clinical_data, calculate_hospital_stats
from app.services.anomaly_detector import AnomalyDetector
from app.services.connection_manager import ConnectionManager
from app.services.notification_service import notification_service
from app.config import (
    WARDS,
    DATA_GENERATION_INTERVAL,
    ANOMALY_CHECK_INTERVAL,
    ANOMALY_CONTAMINATION,
    DOCTOR_PHONE_NUMBERS,
)

# Global state
manager = ConnectionManager()
anomaly_detector = AnomalyDetector(contamination=ANOMALY_CONTAMINATION)

# Data buffers
recent_lab_tests = []
recent_infection_logs = []
generated_alerts = set()

# Latest anomaly results — read by /api/ward-flags endpoint
latest_anomaly_results: list = []


async def simulate_data_generation():
    """
    Background task: Continuously generate mock clinical data.
    """
    print("📊 Starting data generation service...")
    global recent_lab_tests, recent_infection_logs

    while True:
        try:
            # Generate new clinical data
            lab_tests, infection_logs = generate_mock_clinical_data(num_tests=20)

            # Update buffers (keep last 1000 records)
            recent_lab_tests.extend(lab_tests)
            recent_lab_tests = recent_lab_tests[-1000:]

            recent_infection_logs.extend(infection_logs)
            recent_infection_logs = recent_infection_logs[-1000:]

            # Broadcast patient records
            for lab_test in lab_tests:
                message = WebSocketMessage(
                    type="patient_record",
                    payload={
                        "id": lab_test.id,
                        "wardId": lab_test.ward_id,
                        "wardName": lab_test.ward_name,
                        "patientId": lab_test.patient_id,
                        "testType": lab_test.test_type,
                        "result": lab_test.result,
                        "timestamp": int(lab_test.timestamp.timestamp() * 1000),
                    },
                )
                await manager.broadcast(message)

            print(f"✓ Generated {len(lab_tests)} lab tests, {len(infection_logs)} infection logs")

        except Exception as e:
            print(f"✗ Error in data generation: {e}")

        await asyncio.sleep(DATA_GENERATION_INTERVAL)


async def simulate_anomaly_detection():
    """
    Background task: Run anomaly detection and send alerts.
    """
    print("Starting anomaly detection service...")
    global recent_lab_tests, recent_infection_logs, generated_alerts, latest_anomaly_results

    while True:
        try:
            # Run anomaly detection
            results = anomaly_detector.detect_anomalies(
                WARDS,
                recent_lab_tests,
                recent_infection_logs,
            )

            # Expose latest results for the REST API (mutate in-place so imports stay live)
            latest_anomaly_results.clear()
            latest_anomaly_results.extend(results)

            # Process results and send updates
            for result in results:
                # Send status update
                message = WebSocketMessage(
                    type="update",
                    payload={
                        "wardId": result.ward_id,
                        "status": result.status,
                        "infectionCount": result.infection_clusters,
                    },
                )
                await manager.broadcast(message)

                # Send alerts for detected anomalies
                if result.status in ["warning", "critical"]:
                    alert_key = f"{result.ward_id}_{result.status}"

                    if alert_key not in generated_alerts:
                        generated_alerts.add(alert_key)

                        message_text = (
                            f"🚨 CRITICAL: Outbreak detected!"
                            if result.status == "critical"
                            else f"⚠️ Warning: Increased infection rate detected"
                        )

                        alert_message = WebSocketMessage(
                            type="alert",
                            payload={
                                "id": f"alert_{result.ward_id}_{time.time()}",
                                "wardId": result.ward_id,
                                "wardName": result.ward_name,
                                "severity": result.status,
                                "message": message_text,
                                "timestamp": int(time.time() * 1000),
                            },
                        )
                        await manager.broadcast(alert_message)

                        # Send SMS alerts to doctors
                        if DOCTOR_PHONE_NUMBERS and len(DOCTOR_PHONE_NUMBERS) > 0:
                            for phone_number in DOCTOR_PHONE_NUMBERS:
                                try:
                                    if phone_number.strip():  # Only send if phone number is not empty
                                        notification_service.send_sms_alert(
                                            to_number=phone_number.strip(),
                                            ward_name=result.ward_name,
                                            score=result.anomaly_score,
                                            severity=result.status
                                        )
                                        print(f"📱 SMS alert sent to {phone_number} for {result.ward_name}")
                                except Exception as e:
                                    print(f"❌ Failed to send SMS to {phone_number}: {e}")
                        else:
                            print("⚠️ No doctor phone numbers configured for SMS alerts")
                else:
                    # Clear alert if status returns to normal
                    alert_key = f"{result.ward_id}_warning"
                    alert_key_crit = f"{result.ward_id}_critical"
                    generated_alerts.discard(alert_key)
                    generated_alerts.discard(alert_key_crit)

            # Calculate and send global stats
            stats_dict = calculate_hospital_stats(recent_lab_tests, recent_infection_logs)

            # Count wards by status
            normal_count = sum(1 for r in results if r.status == "normal")
            warning_count = sum(1 for r in results if r.status == "warning")
            critical_count = sum(1 for r in results if r.status == "critical")

            stats_dict.update({
                "normal_wards": normal_count,
                "warning_wards": warning_count,
                "critical_wards": critical_count,
            })

            stats_message = WebSocketMessage(
                type="stats",
                payload=stats_dict,
            )
            await manager.broadcast(stats_message)

            print(f"✓ Anomaly detection: {normal_count} normal, {warning_count} warning, {critical_count} critical wards")

        except Exception as e:
            print(f"✗ Error in anomaly detection: {e}")

        await asyncio.sleep(ANOMALY_CHECK_INTERVAL)
