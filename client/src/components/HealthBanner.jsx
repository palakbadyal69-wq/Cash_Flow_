import React from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';

export default function HealthBanner({ healthIndicator }) {
  if (!healthIndicator) return null;

  const { status, icon, title, summary } = healthIndicator;

  const statusStyles = {
    healthy: {
      bg: 'rgba(34, 197, 94, 0.15)',
      border: 'rgba(34, 197, 94, 0.4)',
      text: '#4ade80',
      guide: '🟢 Healthy: no urgent concerns. Solvency metrics within safe operating limits.',
      icon: <CheckCircle2 size={24} color="#4ade80" />
    },
    caution: {
      bg: 'rgba(234, 179, 8, 0.15)',
      border: 'rgba(234, 179, 8, 0.4)',
      text: '#facc15',
      guide: '🟡 Attention Required: some risk building up, review the details below.',
      icon: <AlertTriangle size={24} color="#facc15" />
    },
    critical: {
      bg: 'rgba(239, 68, 68, 0.15)',
      border: 'rgba(239, 68, 68, 0.4)',
      text: '#f87171',
      guide: '🔴 Critical: act now to protect your cash position and extend runway.',
      icon: <AlertCircle size={24} color="#f87171" />
    }
  };

  const currentStyle = statusStyles[status] || statusStyles.caution;

  return (
    <div
      style={{
        background: currentStyle.bg,
        border: `1px solid ${currentStyle.border}`,
        borderRadius: '14px',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
        gap: '16px',
        flexWrap: 'wrap'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {currentStyle.icon}
        <div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: currentStyle.text }}>
            {icon} {title}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: '2px' }}>
            {summary}
          </div>
          <div style={{ fontSize: '0.78rem', color: currentStyle.text, marginTop: '4px', opacity: 0.9 }}>
            ⓘ {currentStyle.guide}
          </div>
        </div>
      </div>
      <div
        title={currentStyle.guide}
        style={{
          background: 'rgba(15, 23, 42, 0.6)',
          border: `1px solid ${currentStyle.border}`,
          padding: '6px 14px',
          borderRadius: '9999px',
          fontSize: '0.8rem',
          fontWeight: 700,
          color: currentStyle.text,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          cursor: 'help'
        }}
      >
        Status: {status}
      </div>
    </div>
  );
}
