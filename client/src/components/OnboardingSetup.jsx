import React, { useState } from 'react';
import { Cpu, ArrowRight, DollarSign, Building, User, FileText } from 'lucide-react';

export default function OnboardingSetup({ onComplete }) {
  const [founderName, setFounderName] = useState('');
  const [startupName, setStartupName] = useState('');
  const [description, setDescription] = useState('');
  const [startingBalance, setStartingBalance] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!founderName || !startupName || startingBalance === '') {
      setError('Please fill in your name, startup name, and starting cash balance.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          founderName,
          startupName,
          description,
          startingBalance: parseFloat(startingBalance) || 0
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to complete setup');
      }

      onComplete();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}
    >
      <div
        style={{
          background: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '20px',
          padding: '36px',
          width: '100%',
          maxWidth: '540px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)'
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              margin: '0 auto 16px',
              boxShadow: '0 6px 20px rgba(59, 130, 246, 0.4)'
            }}
          >
            <Cpu size={32} />
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc', marginBottom: '6px' }}>
            Welcome to CashFlowAI
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
            Autonomous AI Financial Controller & Solvency Risk Engine
          </p>
        </div>

        {error && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid #ef4444',
              color: '#f87171',
              padding: '12px 16px',
              borderRadius: '10px',
              marginBottom: '20px',
              fontSize: '0.85rem'
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Founder Name */}
          <div>
            <label style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <User size={15} color="#38bdf8" /> Founder / Financial Lead Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Palak Sharma"
              value={founderName}
              onChange={(e) => setFounderName(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '10px',
                background: '#0f172a',
                border: '1px solid #334155',
                color: '#f8fafc',
                fontSize: '0.95rem'
              }}
            />
          </div>

          {/* Startup Name */}
          <div>
            <label style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <Building size={15} color="#c084fc" /> Startup Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Acme AI Labs"
              value={startupName}
              onChange={(e) => setStartupName(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '10px',
                background: '#0f172a',
                border: '1px solid #334155',
                color: '#f8fafc',
                fontSize: '0.95rem'
              }}
            />
          </div>

          {/* Description */}
          <div>
            <label style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <FileText size={15} color="#94a3b8" /> One-Line Description (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. B2B SaaS platform automated finance controller"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '10px',
                background: '#0f172a',
                border: '1px solid #334155',
                color: '#f8fafc',
                fontSize: '0.95rem',
                resize: 'none'
              }}
            />
          </div>

          {/* Starting Cash Balance */}
          <div>
            <label style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <DollarSign size={15} color="#22c55e" /> Starting Cash Balance (₹ INR) *
            </label>
            <input
              type="number"
              required
              min="0"
              placeholder="e.g. 2500000"
              value={startingBalance}
              onChange={(e) => setStartingBalance(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '10px',
                background: '#0f172a',
                border: '1px solid #334155',
                color: '#f8fafc',
                fontSize: '0.95rem'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              marginTop: '10px',
              padding: '14px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              border: 'none',
              color: 'white',
              fontSize: '1rem',
              fontWeight: 800,
              cursor: submitting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)'
            }}
          >
            {submitting ? 'Configuring AI Controller...' : 'Complete Setup & Launch Dashboard'}
            <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
