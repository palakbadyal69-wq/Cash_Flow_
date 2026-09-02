import React, { useState, useEffect } from 'react';
import { Cpu, RefreshCw, PlusCircle, Terminal, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';

import HealthBanner from './components/HealthBanner';
import MetricCards from './components/MetricCards';
import RecommendationCard from './components/RecommendationCard';
import RiskList from './components/RiskList';
import ForecastChart from './components/ForecastChart';
import ReceivablesPayablesTable from './components/ReceivablesPayablesTable';
import AddTransactionForm from './components/AddTransactionForm';
import ScenarioPlanner from './components/ScenarioPlanner';
import OnboardingSetup from './components/OnboardingSetup';
import ChatAssistant from './components/ChatAssistant';

export default function App() {
  const [setupComplete, setSetupComplete] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [showLogs, setShowLogs] = useState(false);

  const checkSetupStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/setup/status');
      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }
      const data = await response.json();
      if (data && data.setupComplete) {
        setSetupComplete(true);
        await fetchDashboard();
      } else {
        setSetupComplete(false);
        setLoading(false);
      }
    } catch (err) {
      console.error('Failed to check setup status:', err);
      if (err instanceof TypeError || (err.message && err.message.includes('Failed to fetch'))) {
        setError('Cannot reach backend server — please start it in a separate terminal: cd server && npm start');
      } else {
        setError(err.message || 'Could not connect to CashFlowAI backend server.');
      }
      setLoading(false);
    }
  };

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/dashboard');
      if (!response.ok) {
        let serverErrorMsg = '';
        try {
          const errJson = await response.json();
          if (errJson && errJson.error) {
            serverErrorMsg = errJson.error;
          }
        } catch (e) {}

        if (response.status === 404 || response.status === 503 || response.status === 504) {
          throw new Error('Backend server is not running on port 5000. Please start it in a separate terminal: cd server && npm start');
        } else {
          throw new Error(serverErrorMsg || `Server returned status ${response.status}`);
        }
      }
      const data = await response.json();
      setReport(data);
      setSetupComplete(true);
    } catch (err) {
      console.error('Failed to fetch cashflow report:', err);
      if (err instanceof TypeError || (err.message && err.message.includes('Failed to fetch'))) {
        setError('Cannot reach backend server — please start it in a separate terminal: cd server && npm start');
      } else {
        setError(err.message || 'Could not connect to CashFlowAI backend server.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSetupStatus();
  }, []);

  const handleSetupComplete = async () => {
    setSetupComplete(true);
    await fetchDashboard();
  };

  const handleResetDemo = async () => {
    if (window.confirm('This will erase all data and restart onboarding. Continue?')) {
      try {
        setLoading(true);
        const res = await fetch('/api/reset', { method: 'POST' });
        if (res.ok) {
          setReport(null);
          setSetupComplete(false);
        }
      } catch (err) {
        alert('Failed to reset app data');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEditTransaction = (tx) => {
    setEditingTransaction(tx);
    setIsFormOpen(true);
  };

  const handleDeleteTransaction = async (id) => {
    try {
      const response = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
      if (response.ok) {
        await fetchDashboard();
      }
    } catch (err) {
      console.error('Failed to delete transaction:', err);
    }
  };

  if (loading && setupComplete === null) {
    return (
      <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div className="loading-box">
          <div className="spinner"></div>
          <h3 style={{ fontSize: '1.2rem', color: '#c084fc' }}>Connecting to CashFlowAI Controller...</h3>
        </div>
      </div>
    );
  }

  if (setupComplete === false) {
    return <OnboardingSetup onComplete={handleSetupComplete} />;
  }

  const meta = report?.meta || {};
  const startupName = meta.startupName || '';
  const founderName = meta.founderName || '';

  return (
    <div className="app-container">
      {/* Top Persistent Warning Banner for Fallback Mode */}
      {report?.recommendation?.isFallback && (
        <div
          style={{
            background: 'linear-gradient(90deg, #713f12, #a16207)',
            border: '1px solid #eab308',
            color: '#fef08a',
            padding: '10px 16px',
            fontSize: '0.85rem',
            fontWeight: 700,
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '16px',
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
          }}
        >
          ⚠️ Live AI analysis is unavailable — ANTHROPIC_API_KEY is missing or invalid. Recommendations shown are generic, not AI-generated.
        </div>
      )}

      {/* App Header */}
      <header className="app-header">
        <div className="brand">
          <div className="brand-icon">
            <Cpu size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 className="brand-title">
                {startupName ? `CashFlowAI for ${startupName}` : 'CashFlowAI'}
              </h1>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '2px' }}>
              {founderName ? `Welcome back, ${founderName} — ` : ''}Autonomous AI Financial Controller (₹ INR)
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={handleResetDemo}
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#f87171',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              padding: '10px 14px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            title="Erase all data and restart onboarding"
          >
            <RotateCcw size={16} />
            ⟲ Reset Demo
          </button>

          <button
            onClick={() => { setEditingTransaction(null); setIsFormOpen(true); }}
            style={{
              background: '#059669',
              color: 'white',
              border: 'none',
              padding: '10px 16px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <PlusCircle size={18} />
            + Record Entry
          </button>

          <button className="refresh-btn" onClick={fetchDashboard} disabled={loading}>
            <RefreshCw
              size={18}
              className={loading ? 'spinner' : ''}
              style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }}
            />
            {loading ? 'Analyzing...' : 'Re-Run Pipeline'}
          </button>
        </div>
      </header>

      {/* Main Dashboard Layout */}
      {loading && !report ? (
        <div className="loading-box">
          <div className="spinner"></div>
          <h3 style={{ fontSize: '1.2rem', color: '#c084fc', marginBottom: '8px' }}>
            Running Agentic Pipeline (6 Steps)...
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            Ingesting ₹ transactions &rarr; Computing burn/runway &rarr; Evaluating solvency risk rules &rarr; Determining health status &rarr; Invoking Claude AI decision engine
          </p>
        </div>
      ) : error ? (
        <div className="error-card">
          <h3>Failed to Load CashFlowAI Dashboard</h3>
          <p style={{ marginTop: '8px' }}>{error}</p>
          <button className="refresh-btn" onClick={checkSetupStatus} style={{ margin: '16px auto 0 auto' }}>
            Retry Connection
          </button>
        </div>
      ) : report ? (
        <main className="dashboard-grid">
          {/* 1. Health Banner */}
          <HealthBanner healthIndicator={report.healthIndicator} />

          {/* 2. Metric Cards Row */}
          <MetricCards metrics={report.metrics} />

          {/* 3. AI Recommendation Card (Centerpiece) */}
          <RecommendationCard
            recommendation={report.recommendation}
            risks={report.risks}
            metrics={report.metrics}
            healthIndicator={report.healthIndicator}
          />

          {/* 3.5 What-If Scenario Planning */}
          <ScenarioPlanner />

          {/* 4. Risk Flags List */}
          <RiskList risks={report.risks} />

          {/* 5. Cash Flow Projection Chart */}
          <ForecastChart runway={{ monthlyBreakdown: report.metrics?.monthlyBreakdown, currentBalance: report.metrics?.currentBalance }} forecast={report.forecast || []} />

          {/* 6. Receivables & Payables Ledger */}
          <ReceivablesPayablesTable
            receivables={report.metrics?.receivables}
            payables={report.metrics?.payables}
            onEdit={handleEditTransaction}
            onDelete={handleDeleteTransaction}
          />

          {/* Terminal Logs View for Hackathon Demo */}
          {report.pipelineLogs && (
            <div className="section-card" style={{ background: '#0b1329', borderColor: '#1e293b' }}>
              <div
                className="section-header"
                onClick={() => setShowLogs(!showLogs)}
                style={{ cursor: 'pointer', margin: 0, justifyContent: 'space-between' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8' }}>
                  <Terminal size={18} color="#38bdf8" />
                  Terminal Logs: 6-Step Agentic Reasoning Pipeline
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#38bdf8' }}>
                  {showLogs ? 'Hide Logs' : 'Inspect Terminal Chain'}
                  {showLogs ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>

              {showLogs && (
                <div
                  style={{
                    marginTop: '16px',
                    padding: '16px',
                    background: '#020617',
                    borderRadius: '8px',
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    color: '#38bdf8',
                    border: '1px solid #1e293b'
                  }}
                >
                  {report.pipelineLogs.map((log, idx) => (
                    <div key={idx} style={{ marginBottom: '6px' }}>
                      <span style={{ color: '#64748b' }}>[{new Date().toLocaleTimeString()}]</span>{' '}
                      <span style={{ color: '#c084fc', fontWeight: 'bold' }}>Step {idx + 1}:</span>{' '}
                      {log.replace(/^Step \d+:\s*/, '')}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      ) : null}

      {/* Add / Edit Transaction Modal */}
      <AddTransactionForm
        isOpen={isFormOpen}
        editingTransaction={editingTransaction}
        onClose={() => { setIsFormOpen(false); setEditingTransaction(null); }}
        onSuccess={fetchDashboard}
      />

      {/* Floating Finance AI Chat Assistant */}
      <ChatAssistant />
    </div>
  );
}
