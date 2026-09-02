import React from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function RiskList({ risks }) {
  if (!risks || risks.length === 0) {
    return (
      <div className="section-card">
        <div className="section-header">
          <AlertTriangle size={20} color="#eab308" />
          Detected Risk Flags
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#22c55e', padding: '12px' }}>
          <CheckCircle2 size={24} /> No elevated financial risks detected in current data.
        </div>
      </div>
    );
  }

  return (
    <div className="section-card">
      <div className="section-header">
        <ShieldAlert size={20} color="#ef4444" />
        Detected Risk Flags ({risks.length})
      </div>

      <div className="risk-grid">
        {risks.map((risk, idx) => (
          <div key={risk.type || risk.id || idx} className={`risk-item ${risk.severity.toLowerCase()}`}>
            <div className="risk-header-line">
              <div className="risk-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle
                  size={18}
                  color={
                    risk.severity === 'high'
                      ? '#ef4444'
                      : risk.severity === 'medium'
                      ? '#eab308'
                      : '#38bdf8'
                  }
                />
                {risk.title}
              </div>
              <span className={`severity-badge ${risk.severity.toLowerCase()}`}>
                {risk.severity} Severity
              </span>
            </div>
            <div className="risk-desc">{risk.detail || risk.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
