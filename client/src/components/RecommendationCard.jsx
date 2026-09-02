import React, { useState } from 'react';
import { Bot, Sparkles, CheckCircle, AlertOctagon, Target, Info, Handshake, ChevronDown, ChevronUp } from 'lucide-react';

export default function RecommendationCard({ recommendation, risks, metrics, healthIndicator }) {
  const [showReasoningTrail, setShowReasoningTrail] = useState(false);

  if (!recommendation) return null;

  const { action, confidence, reasoning, priority_risks, isFallback } = recommendation;

  const actionMap = {
    cut_spend: {
      label: 'Cut Non-Essential Spend Immediately',
      class: 'cut_spend',
      icon: <AlertOctagon size={22} />
    },
    chase_receivables: {
      label: 'Aggressively Chase Overdue Receivables',
      class: 'chase_receivables',
      icon: <Target size={22} />
    },
    raise_now: {
      label: 'Initiate Capital Raise Immediately',
      class: 'raise_now',
      icon: <Target size={22} />
    },
    delay_hiring: {
      label: 'Freeze / Delay Planned Hiring',
      class: 'delay_hiring',
      icon: <AlertOctagon size={22} />
    },
    renegotiate_payables: {
      label: 'Renegotiate Vendor Payment Terms',
      class: 'chase_receivables',
      icon: <Handshake size={22} />
    },
    healthy_no_action: {
      label: 'Maintain Course — Runway Healthy',
      class: 'healthy_no_action',
      icon: <CheckCircle size={22} />
    }
  };

  const actionInfo = actionMap[action] || {
    label: (action || 'Action Required').toUpperCase().replace(/_/g, ' '),
    class: 'cut_spend',
    icon: <Bot size={22} />
  };

  const getRiskTitle = (riskType) => {
    const found = (risks || []).find((r) => r.type === riskType || r.id === riskType);
    return found ? found.title : riskType.replace(/_/g, ' ').toUpperCase();
  };

  return (
    <div className="section-card verdict-card">
      <div className="section-header" style={{ color: '#c084fc', marginBottom: '16px' }}>
        <Sparkles size={22} color="#c084fc" />
        AI Agent Verdict & Decision (Claude Sonnet 4.6 Reasoning)
      </div>

      <div className="verdict-top-bar">
        <div className={`action-chip ${actionInfo.class}`}>
          {actionInfo.icon}
          {actionInfo.label}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="confidence-chip">
            Confidence: <span style={{ color: '#f8fafc', fontWeight: 800 }}>{(confidence || 'HIGH').toUpperCase()}</span>
          </div>

          {isFallback && (
            <div
              title={recommendation.fallbackReason ? `Fallback trigger: ${recommendation.fallbackReason}` : 'Fallback logic executed.'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#facc15',
                background: 'rgba(234, 179, 8, 0.15)',
                border: '1px solid rgba(234, 179, 8, 0.4)',
                padding: '6px 12px',
                borderRadius: '8px'
              }}
            >
              ⚠️ Fallback logic — not live AI reasoning
            </div>
          )}
        </div>
      </div>

      <div className="reasoning-box">
        <div style={{ fontSize: '0.8rem', color: '#c084fc', fontWeight: 700, marginBottom: '6px', textTransform: 'uppercase' }}>
          Agent Decision Rationale & ₹ Figures Citation:
        </div>
        {reasoning}
      </div>

      {priority_risks && priority_risks.length > 0 && (
        <div className="priority-tags">
          <span className="priority-label">Key Risk Drivers:</span>
          {priority_risks.map((riskType) => (
            <span key={riskType} className="risk-tag">
              {getRiskTitle(riskType)}
            </span>
          ))}
        </div>
      )}

      {/* Expandable "Show AI Reasoning" Sub-Panel */}
      <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <button
          onClick={() => setShowReasoningTrail(!showReasoningTrail)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#c084fc',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: 0
          }}
        >
          {showReasoningTrail ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          {showReasoningTrail ? 'Hide AI Reasoning ▴' : 'Show AI Reasoning ▾'}
        </button>

        {showReasoningTrail && (
          <div
            style={{
              marginTop: '12px',
              padding: '16px',
              background: 'rgba(15, 23, 42, 0.85)',
              border: '1px solid rgba(192, 132, 252, 0.3)',
              borderRadius: '10px',
              fontSize: '0.85rem',
              fontFamily: 'monospace, sans-serif',
              color: '#e2e8f0'
            }}
          >
            <div style={{ fontWeight: 800, color: '#c084fc', marginBottom: '12px', fontSize: '0.9rem' }}>
              🔍 Step-by-Step Agentic Reasoning Sequence
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Step 1 — Metrics computed */}
              <div style={{ borderLeft: '2px solid #38bdf8', paddingLeft: '12px' }}>
                <div style={{ color: '#38bdf8', fontWeight: 'bold' }}>Step 1 — Metrics Computed</div>
                <div style={{ color: '#94a3b8', marginTop: '2px' }}>
                  Current Balance: ₹{(metrics?.currentBalance || 0).toLocaleString('en-IN')} | Monthly Burn: ₹{(metrics?.monthlyBurnRate || 0).toLocaleString('en-IN')}/mo | Runway: {metrics?.runwayMonths !== undefined ? (metrics.runwayMonths >= 99 ? '99+ Mo' : `${metrics.runwayMonths} Mo`) : 'N/A'}
                </div>
              </div>

              {/* Step 2 — Risks detected */}
              <div style={{ borderLeft: '2px solid #ef4444', paddingLeft: '12px' }}>
                <div style={{ color: '#ef4444', fontWeight: 'bold' }}>
                  Step 2 — Risks Detected ({(risks || []).length} found)
                </div>
                <div style={{ color: '#94a3b8', marginTop: '2px' }}>
                  {risks && risks.length > 0 ? (
                    risks.map((r, idx) => (
                      <span key={idx} style={{ display: 'inline-block', marginRight: '10px' }}>
                        • <span style={{ color: r.severity === 'high' ? '#f87171' : '#facc15' }}>[{r.severity ? r.severity.toUpperCase() : 'RISK'}]</span> {r.type || r.title}
                      </span>
                    ))
                  ) : (
                    '• No financial risks detected'
                  )}
                </div>
              </div>

              {/* Step 3 — Health status */}
              <div style={{ borderLeft: '2px solid #facc15', paddingLeft: '12px' }}>
                <div style={{ color: '#facc15', fontWeight: 'bold' }}>Step 3 — Deterministic Health Status</div>
                <div style={{ color: '#94a3b8', marginTop: '2px' }}>
                  {healthIndicator?.icon || '🟢'} {healthIndicator?.title || 'Evaluated'} ({healthIndicator?.summary || 'Status evaluated'})
                </div>
              </div>

              {/* Step 4 — AI Decision */}
              <div style={{ borderLeft: '2px solid #c084fc', paddingLeft: '12px' }}>
                <div style={{ color: '#c084fc', fontWeight: 'bold' }}>Step 4 — Final AI Decision (Claude Sonnet 4.6)</div>
                <div style={{ color: '#94a3b8', marginTop: '2px' }}>
                  Action: <span style={{ color: '#f8fafc', fontWeight: 'bold' }}>{(recommendation?.action || '').toUpperCase()}</span> | Confidence: <span style={{ color: '#f8fafc', fontWeight: 'bold' }}>{(recommendation?.confidence || 'HIGH').toUpperCase()}</span>
                </div>
                {priority_risks && priority_risks.length > 0 && (
                  <div style={{ color: '#94a3b8', marginTop: '2px' }}>
                    Influencing Risk Drivers: {priority_risks.join(', ')}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
