import React, { useState } from 'react';
import { Sliders, TrendingDown, Users, DollarSign, RefreshCw, Sparkles, AlertOctagon, Target, CheckCircle, Handshake, Info, X } from 'lucide-react';

export default function ScenarioPlanner() {
  const [activeScenario, setActiveScenario] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const presets = [
    {
      id: 'revenue_drop_20',
      label: 'Revenue drops 20%',
      icon: <TrendingDown size={16} color="#ef4444" />,
      desc: 'Simulate a 20% drop across all customer revenue inflows.'
    },
    {
      id: 'hire_two_employees',
      label: 'Hire 2 employees',
      icon: <Users size={16} color="#c084fc" />,
      desc: 'Simulate adding ₹1,60,000/mo in recurring payroll.'
    },
    {
      id: 'investment_2l',
      label: 'Receive ₹2L investment',
      icon: <DollarSign size={16} color="#22c55e" />,
      desc: 'Simulate an immediate ₹2,00,000 cash injection.'
    }
  ];

  const runScenario = async (scenarioType) => {
    setActiveScenario(scenarioType);
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/scenario/${scenarioType}`);
      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }
      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error('Scenario calculation failed:', err);
      setError(err.message || 'Failed to simulate scenario.');
    } finally {
      setLoading(false);
    }
  };

  const clearScenario = () => {
    setActiveScenario(null);
    setResult(null);
    setError(null);
  };

  const actionMap = {
    cut_spend: { label: 'Cut Non-Essential Spend Immediately', class: 'cut_spend', icon: <AlertOctagon size={20} /> },
    chase_receivables: { label: 'Aggressively Chase Overdue Receivables', class: 'chase_receivables', icon: <Target size={20} /> },
    raise_now: { label: 'Initiate Capital Raise Immediately', class: 'raise_now', icon: <Target size={20} /> },
    delay_hiring: { label: 'Freeze / Delay Planned Hiring', class: 'delay_hiring', icon: <AlertOctagon size={20} /> },
    renegotiate_payables: { label: 'Renegotiate Vendor Payment Terms', class: 'chase_receivables', icon: <Handshake size={20} /> },
    healthy_no_action: { label: 'Maintain Course — Runway Healthy', class: 'healthy_no_action', icon: <CheckCircle size={20} /> }
  };

  return (
    <div className="section-card" style={{ border: '1px solid #3b82f6', boxShadow: '0 0 25px rgba(59, 130, 246, 0.15)' }}>
      <div className="section-header" style={{ color: '#38bdf8', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sliders size={22} color="#38bdf8" />
          What-If Scenario Planning
        </div>
        <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'none' }}>
          Read-Only In-Memory Projections (No Disk Mutation)
        </span>
      </div>

      {/* Preset Scenario Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        {presets.map((preset) => {
          const isActive = activeScenario === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => runScenario(preset.id)}
              disabled={loading}
              style={{
                background: isActive ? 'rgba(56, 189, 248, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                border: isActive ? '2px solid #38bdf8' : '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '14px',
                textAlign: 'left',
                color: '#f8fafc',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.95rem' }}>
                {preset.icon}
                {preset.label}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{preset.desc}</div>
            </button>
          );
        })}
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div style={{ textAlignment: 'center', padding: '24px', textAlign: 'center', color: '#38bdf8' }}>
          <RefreshCw size={24} className="spinner" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 8px' }} />
          <div>Re-running 6-step pipeline against hypothetical scenario...</div>
        </div>
      )}

      {/* Error Output */}
      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#f87171', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {/* Results Comparison Output */}
      {result && !loading && (
        <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid #334155', borderRadius: '14px', padding: '20px', position: 'relative' }}>
          <button
            onClick={clearScenario}
            title="Reset Scenario View"
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>

          <div style={{ fontSize: '1rem', fontWeight: 800, color: '#38bdf8', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="#38bdf8" />
            Scenario Impact Analysis & Comparison
          </div>

          {/* Side-by-side Runway Comparison */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            {/* Baseline Card */}
            <div style={{ background: 'rgba(30, 41, 59, 0.6)', border: '1px solid #334155', borderRadius: '12px', padding: '16px' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>
                Baseline Status (Current)
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc', marginTop: '6px' }}>
                {result.baseline.runwayMonths} Months
              </div>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>
                Balance: ₹{result.baseline.currentBalance.toLocaleString('en-IN')}
              </div>
            </div>

            {/* Scenario Card */}
            <div style={{ background: 'rgba(30, 41, 59, 0.6)', border: '1px solid #38bdf8', borderRadius: '12px', padding: '16px' }}>
              <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase' }}>
                Simulated Scenario Impact
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: result.scenario.runwayMonths < result.baseline.runwayMonths ? '#ef4444' : '#22c55e', marginTop: '6px' }}>
                {result.scenario.runwayMonths} Months
                <span style={{ fontSize: '0.9rem', marginLeft: '8px', color: result.scenario.runwayMonths < result.baseline.runwayMonths ? '#ef4444' : '#22c55e' }}>
                  ({(result.scenario.runwayMonths - result.baseline.runwayMonths).toFixed(1)} mo)
                </span>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>
                Projected Balance: ₹{result.scenario.currentBalance.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* Scenario Recommendation Verdict Card */}
          {result.scenario.recommendation && (
            <div style={{ background: 'linear-gradient(145deg, #1e293b, #0f172a)', border: '1px solid #38bdf8', borderRadius: '12px', padding: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Scenario AI Recommendation & Impact:
                </div>
                <div className={`action-chip ${(actionMap[result.scenario.recommendation.action] || {}).class || 'cut_spend'}`} style={{ fontSize: '0.85rem', padding: '6px 12px' }}>
                  {(actionMap[result.scenario.recommendation.action] || {}).label || result.scenario.recommendation.action.toUpperCase()}
                </div>
              </div>

              <div className="reasoning-box" style={{ fontSize: '0.95rem', background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(56,189,248,0.3)', marginBottom: '12px' }}>
                {result.scenario.recommendation.reasoning}
              </div>

              {result.scenario.recommendation.priority_risks && (
                <div className="priority-tags">
                  <span className="priority-label">Simulated Risks:</span>
                  {result.scenario.recommendation.priority_risks.map((riskType, i) => (
                    <span key={i} className="risk-tag">
                      {riskType.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
