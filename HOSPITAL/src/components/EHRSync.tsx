import React, { useState } from "react";
import { syncAndTransformFHIR, getWards } from "../services/api";
import "./EHRSync.css";

export default function EHRSync() {
  const [loading, setLoading] = useState(false);
  const [wards, setWards] = useState([]);
  const [selectedWard, setSelectedWard] = useState(null);
  const [syncResult, setSyncResult] = useState(null);
  const [error, setError] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Load wards on mount
  React.useEffect(() => {
    const fetchWards = async () => {
      try {
        const response = await getWards();
        setWards(response.data.wards || []);
      } catch (err) {
        console.error("Error loading wards:", err);
      }
    };
    fetchWards();
  }, []);

  const handleSyncEHR = async () => {
    setLoading(true);
    setError(null);
    setSyncResult(null);

    try {
      console.log(
        "🔄 Initiating EHR Sync with FHIR Transform...",
        selectedWard || "All Wards"
      );

      const response = await syncAndTransformFHIR(selectedWard);
      setSyncResult(response.data);

      console.log("✅ EHR Sync Complete:");
      console.log("📊 Statistics:", response.data.statistics);
      console.log("🏥 FHIR Bundles:", {
        labs: response.data.fhir.lab_observations_bundle,
        infections: response.data.fhir.infection_conditions_bundle,
      });
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail ||
        err.message ||
        "Failed to sync EHR data";
      setError(errorMessage);
      console.error("❌ EHR Sync Error:", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ehr-sync-container">
      <div className="ehr-sync-panel">
        {/* Header */}
        <div className="ehr-header">
          <div className="ehr-header-content">
            <h2>🏥 Hospital EHR Sync</h2>
            <p className="ehr-description">
              Sync with Hospital EHR System • FHIR R4 Compliant
            </p>
          </div>
          <div className="ehr-status-badge">
            <span className="status-dot"></span>
            Connected
          </div>
        </div>

        {/* Ward Selection */}
        <div className="ehr-controls">
          <div className="control-group">
            <label htmlFor="ward-select">Select Ward (Optional)</label>
            <select
              id="ward-select"
              value={selectedWard || ""}
              onChange={(e) => setSelectedWard(e.target.value || null)}
              className="ward-select"
            >
              <option value="">All Wards</option>
              {Object.entries(wards).map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* Sync Button */}
          <button
            onClick={handleSyncEHR}
            disabled={loading}
            className={`sync-button ${loading ? "loading" : ""}`}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Syncing...
              </>
            ) : (
              <>
                <span className="sync-icon">🔄</span>
                Sync with Hospital EHR
              </>
            )}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="error-alert">
            <span className="error-icon">⚠️</span>
            <div className="error-content">
              <p className="error-title">Sync Failed</p>
              <p className="error-message">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="error-close"
            >
              ×
            </button>
          </div>
        )}

        {/* Success Results */}
        {syncResult && (
          <div className="sync-success">
            <div className="success-header">
              <h3>✅ EHR Sync Successful</h3>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="details-toggle"
              >
                {showDetails ? "Hide Details" : "Show FHIR Details"}
              </button>
            </div>

            {/* Statistics Card */}
            <div className="statistics-grid">
              <StatCard
                icon="👥"
                title="Total Patients"
                value={syncResult.statistics.total_patients}
              />
              <StatCard
                icon="🧪"
                title="Lab Observations"
                value={syncResult.statistics.total_observations}
              />
              <StatCard
                icon="🏥"
                title="Conditions Logged"
                value={syncResult.statistics.total_conditions}
              />
              <StatCard
                icon="😷"
                title="Positive Cultures"
                value={syncResult.statistics.positive_cultures}
              />
              <StatCard
                icon="🚨"
                title="Critical Infections"
                value={syncResult.statistics.critical_infections}
              />
              <StatCard
                icon="⚠️"
                title="Antibiotic Resistant"
                value={syncResult.statistics.antibiotic_resistant}
              />
            </div>

            {/* EHR Source Info */}
            <div className="ehr-info-box">
              <h4>📡 EHR Source Information</h4>
              <div className="info-grid">
                <InfoItem label="System" value={syncResult.ehr_source.system} />
                <InfoItem
                  label="Organization"
                  value={syncResult.ehr_source.organization}
                />
                <InfoItem label="Version" value={syncResult.ehr_source.version} />
                <InfoItem
                  label="FHIR Version"
                  value={syncResult.fhir.version}
                />
                <InfoItem label="Sync ID" value={syncResult.sync_id} />
                <InfoItem
                  label="Timestamp"
                  value={new Date(syncResult.timestamp).toLocaleString()}
                />
              </div>
            </div>

            {/* FHIR Details (Hidden by default) */}
            {showDetails && (
              <div className="fhir-details">
                <FHIRBundleViewer
                  title="Lab Observations (FHIR)"
                  bundle={syncResult.fhir.lab_observations_bundle}
                />
                <FHIRBundleViewer
                  title="Infection Conditions (FHIR)"
                  bundle={syncResult.fhir.infection_conditions_bundle}
                />
              </div>
            )}
          </div>
        )}

        {/* Info Panel */}
        {!syncResult && (
          <div className="info-panel">
            <div className="info-item">
              <h3>🔄 Real-Time Sync</h3>
              <p>Pull actual patient data from the Hospital EHR system</p>
            </div>
            <div className="info-item">
              <h3>🏥 FHIR Compliant</h3>
              <p>Data transformed to HL7 FHIR R4 standards</p>
            </div>
            <div className="info-item">
              <h3>📊 Clinical Integration</h3>
              <p>Observation, DiagnosticReport, Condition, and Flag resources</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ icon, title, value }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <p className="stat-title">{title}</p>
        <p className="stat-value">{value}</p>
      </div>
    </div>
  );
}

// Info Item Component
function InfoItem({ label, value }) {
  return (
    <div className="info-item-box">
      <span className="info-label">{label}</span>
      <span className="info-value">{value}</span>
    </div>
  );
}

// FHIR Bundle Viewer Component
function FHIRBundleViewer({ title, bundle }) {
  const [expanded, setExpanded] = useState(false);

  const hasEntries = bundle?.entry && bundle.entry.length > 0;

  return (
    <div className="fhir-bundle">
      <button
        className="bundle-header"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="bundle-icon">{expanded ? "▼" : "▶"}</span>
        <span className="bundle-title">{title}</span>
        <span className="bundle-count">
          ({bundle?.total || 0} resources)
        </span>
      </button>

      {expanded && hasEntries && (
        <div className="bundle-content">
          {bundle.entry.map((entry, idx) => (
            <div key={idx} className="bundle-entry">
              <div className="entry-header">
                <span className="entry-type">
                  {entry.resource.resourceType}
                </span>
                <span className="entry-id">{entry.resource.id}</span>
              </div>
              <pre className="entry-json">
                {JSON.stringify(entry.resource, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
