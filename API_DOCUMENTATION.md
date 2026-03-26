# API Documentation - Hospital Infection Surveillance System

## Base URL
```
http://localhost:8000
```

## Interactive API Documentation
```
http://localhost:8000/docs  (Swagger UI)
http://localhost:8000/redoc (ReDoc)
```

---

## Endpoints

### 1. Health Check

**Endpoint:**
```http
GET /health
```

**Description:**
Check if the backend service is running

**Response (200):**
```json
{
  "status": "healthy",
  "service": "Hospital Infection Surveillance System",
  "version": "1.0.0",
  "connections": 5
}
```

**Example:**
```bash
curl http://localhost:8000/health
```

---

### 2. Get Wards Configuration

**Endpoint:**
```http
GET /api/wards
```

**Description:**
Retrieve all hospital ward configurations including positions and metadata

**Response (200):**
```json
{
  "wards": [
    {
      "id": "icu-01",
      "name": "ICU Ward",
      "position": [-8, 0, -8]
    },
    {
      "id": "gen-01",
      "name": "General Ward",
      "position": [0, 0, -8]
    },
    {
      "id": "surg-01",
      "name": "Surgery Ward",
      "position": [8, 0, -8]
    },
    {
      "id": "pedi-01",
      "name": "Pediatrics",
      "position": [-8, 0, 8]
    },
    {
      "id": "emer-01",
      "name": "Emergency",
      "position": [0, 0, 8]
    },
    {
      "id": "amb-01",
      "name": "Ambulatory",
      "position": [8, 0, 8]
    }
  ]
}
```

**Example:**
```bash
curl http://localhost:8000/api/wards
```

---

### 3. Get Initial Clinical Data

**Endpoint:**
```http
GET /api/initial-data
```

**Description:**
Retrieve initial batch of mock clinical data (lab tests and infection logs)

**Response (200):**
```json
{
  "labTests": [
    {
      "id": "lab_uuid",
      "patient_id": "PAT-12345",
      "ward_id": "icu-01",
      "ward_name": "ICU Ward",
      "test_type": "Blood Culture",
      "organism": "Staphylococcus aureus",
      "result": "Positive",
      "source": "Blood",
      "timestamp": "2024-01-01T12:00:00"
    }
  ],
  "infectionLogs": [
    {
      "id": "inf_uuid",
      "patient_id": "PAT-12345",
      "ward_id": "icu-01",
      "ward_name": "ICU Ward",
      "infection_type": "SSI",
      "onset_date": "2024-01-01T10:00:00",
      "status": "confirmed",
      "severity": "moderate",
      "antibiotic_resistant": false,
      "timestamp": "2024-01-01T12:00:00"
    }
  ],
  "timestamp": "2024-01-01T12:00:00"
}
```

**Example:**
```bash
curl http://localhost:8000/api/initial-data
```

---

### 4. WebSocket Connection

**Endpoint:**
```
ws://localhost:8000/ws
```

**Description:**
Connect to real-time event stream for alerts, stats updates, and patient records

**Connection Lifecycle:**

1. **Open Connection**
   ```javascript
   const ws = new WebSocket('ws://localhost:8000/ws');
   ```

2. **Receive Connection Confirmation**
   ```json
   {
     "type": "connection",
     "message": "Connected to Hospital Infection Surveillance System",
     "timestamp": 1704110400000
   }
   ```

3. **Keep-Alive** (connection stays open indefinitely)

4. **Close Connection**
   ```javascript
   ws.close();
   ```

---

## WebSocket Message Types

### Alert Messages

**Type:** `alert`

**When:** When a ward anomaly is detected

**Payload:**
```json
{
  "type": "alert",
  "payload": {
    "id": "alert_icu-01_1704110400",
    "wardId": "icu-01",
    "wardName": "ICU Ward",
    "severity": "critical",
    "message": "🚨 CRITICAL: Outbreak detected!",
    "timestamp": 1704110400000
  }
}
```

**Severity Values:**
- `"critical"` - Anomaly score ≥ 0.6 or ≥ 4 risk factors
- `"warning"` - Anomaly score ≥ 0.35 or ≥ 2 risk factors
- `"normal"` - No anomalies detected

---

### Status Update Messages

**Type:** `update`

**When:** After each anomaly detection run

**Payload:**
```json
{
  "type": "update",
  "payload": {
    "wardId": "icu-01",
    "status": "critical",
    "infectionCount": 5
  }
}
```

---

### Statistics Messages

**Type:** `stats`

**When:** After each anomaly detection run

**Payload:**
```json
{
  "type": "stats",
  "payload": {
    "total_patients": 185,
    "suspected_infections": 8,
    "critical_alerts": 3,
    "normal_wards": 3,
    "warning_wards": 2,
    "critical_wards": 1
  }
}
```

---

### Patient Record Messages

**Type:** `patient_record`

**When:** For each lab test generated

**Payload:**
```json
{
  "type": "patient_record",
  "payload": {
    "id": "lab_uuid",
    "wardId": "icu-01",
    "wardName": "ICU Ward",
    "patientId": "PAT-12345",
    "testType": "Blood Culture",
    "result": "Positive",
    "timestamp": 1704110400000
  }
}
```

---

## JavaScript Client Example

```javascript
// Connect to WebSocket
const ws = new WebSocket('ws://localhost:8000/ws');

// Connection opened
ws.onopen = () => {
  console.log('Connected to HISS');
};

// Receive messages
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  
  switch (message.type) {
    case 'alert':
      console.log('🚨 Alert:', message.payload);
      // Update UI with alert
      break;
    
    case 'update':
      console.log('📊 Ward Status:', message.payload);
      // Update 3D scene colors
      break;
    
    case 'stats':
      console.log('📈 Stats:', message.payload);
      // Update dashboard statistics
      break;
    
    case 'patient_record':
      console.log('🔬 Lab Result:', message.payload);
      // Add to patient records table
      break;
  }
};

// Error handling
ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};

// Connection closed
ws.onclose = () => {
  console.log('Disconnected from HISS');
};
```

---

## Python Client Example

```python
import asyncio
import websockets
import json

async def receive_updates():
    uri = "ws://localhost:8000/ws"
    
    async with websockets.connect(uri) as websocket:
        print("Connected to HISS")
        
        while True:
            try:
                message = await websocket.recv()
                data = json.loads(message)
                
                print(f"Message type: {data['type']}")
                print(f"Payload: {data['payload']}")
                
            except websockets.exceptions.ConnectionClosed:
                print("Connection closed")
                break

# Run
asyncio.run(receive_updates())
```

---

## Data Models

### Lab Test Result

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique identifier |
| `patient_id` | string | Patient identifier |
| `ward_id` | string | Ward identifier |
| `ward_name` | string | Human-readable ward name |
| `test_type` | string | Type of test (Blood Culture, Urinalysis, etc.) |
| `organism` | string\|null | Detected organism (if positive) |
| `result` | string | "Positive", "Negative", or "Pending" |
| `source` | string | Sample source (Blood, Wound, Urine, Sputum) |
| `timestamp` | datetime | ISO 8601 datetime |

### Infection Log

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique identifier |
| `patient_id` | string | Patient identifier |
| `ward_id` | string | Ward identifier |
| `ward_name` | string | Human-readable ward name |
| `infection_type` | string | HAI type (SSI, UTI, VAI, CLABSI, HAP) |
| `onset_date` | datetime | When infection started |
| `status` | string | "suspected", "confirmed", or "resolved" |
| `severity` | string | "mild", "moderate", or "severe" |
| `antibiotic_resistant` | boolean | Is organism antibiotic resistant |
| `timestamp` | datetime | ISO 8601 datetime |

---

## Error Responses

### 500 Internal Server Error
```json
{
  "detail": "Internal server error",
  "error": "Error message details"
}
```

---

## Rate Limiting & Quotas

- **No rate limiting** for development
- **Data buffer:** Keeps last 1000 records
- **Alert deduplication:** 1 alert per (ward, severity) per run
- **WebSocket:** Unlimited connections

---

## Performance Metrics

| Metric | Value |
|--------|-------|
| Data generation interval | 60 seconds |
| Anomaly detection interval | 30 seconds |
| Typical message latency | <100ms |
| Memory per connection | ~5KB |

---

## Troubleshooting

### Connection Refused
```
Error: connect ECONNREFUSED 127.0.0.1:8000
```
**Solution:** Check if backend is running on port 8000

### Connection Timeout
```
Error: timeout waiting for response
```
**Solution:** Backend may be overloaded. Check logs.

### Invalid JSON
```
Error: Failed to parse WebSocket message
```
**Solution:** Malformed message. Check client implementation.

---

## Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [WebSocket Guide](https://websockets.readthedocs.io)
- [Hospital Infection Types](https://www.cdc.gov/hai/)
- [FHIR Standards](https://www.hl7.org/fhir/)

