import logging
from twilio.rest import Client
from app.config import TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER

# Setup logging to track if notifications are actually sent
logger = logging.getLogger(__name__)

class NotificationService:
    def __init__(self):
        self.client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        self.from_number = TWILIO_PHONE_NUMBER

    def send_sms_alert(self, to_number: str, ward_name: str, score: float, severity: str):
        """Sends a standard SMS alert to a doctor's phone."""
        try:
            message_body = (
                f"🚨 HISS ALERT: {severity.upper()}\n"
                f"Ward: {ward_name}\n"
                f"Risk Score: {int(score * 100)}%\n"
                f"Action Required: Check 3D Dashboard immediately."
            )
            
            message = self.client.messages.create(
                body=message_body,
                from_=self.from_number,
                to=to_number
            )
            logger.info(f"SMS sent to {to_number}: {message.sid}")
            return message.sid
        except Exception as e:
            logger.error(f"Failed to send SMS: {e}")
            return None

    def send_whatsapp_alert(self, to_number: str, ward_name: str, score: float):
        """Sends a WhatsApp alert (Hackathon Favorite)."""
        try:
            # Twilio WhatsApp numbers usually look like 'whatsapp:+14155238886'
            message = self.client.messages.create(
                from_=f'whatsapp:{self.from_number}',
                body=f"🏥 *Hospital Surveillance Update*\n\nCritical anomaly detected in *{ward_name}*.\nInfection Risk: {int(score * 100)}%",
                to=f'whatsapp:{to_number}'
            )
            return message.sid
        except Exception as e:
            logger.error(f"WhatsApp error: {e}")
            return None

# Initialize a singleton instance
notification_service = NotificationService()