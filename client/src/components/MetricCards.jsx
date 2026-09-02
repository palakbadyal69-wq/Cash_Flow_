import React from 'react';
import { IndianRupee, ArrowUpRight, ArrowDownRight, Flame, Clock, Scale, HelpCircle } from 'lucide-react';

export default function MetricCards({ metrics }) {
  if (!metrics) return null;

  const {
    currentBalance,
    totalReceived,
    totalSpent,
    netCashFlow,
    monthlyBurnRate,
    runwayMonths
  } = metrics;

  const formatINR = (val) => {
    if (val === undefined || val === null) return '₹0';
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const isNetPositive = netCashFlow >= 0;

  return (
    <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))' }}>
      {/* 1. Balance */}
      <div className="stat-box">
        <div className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <IndianRupee size={15} color="#38bdf8" /> Cash Balance
        </div>
        <div className="stat-value" style={{ color: '#38bdf8' }}>
          {formatINR(currentBalance)}
        </div>
      </div>

      {/* 2. Total Received */}
      <div className="stat-box">
        <div className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ArrowUpRight size={15} color="#22c55e" /> Total Received
        </div>
        <div className="stat-value" style={{ color: '#22c55e' }}>
          {formatINR(totalReceived)}
        </div>
      </div>

      {/* 3. Total Spent */}
      <div className="stat-box">
        <div className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ArrowDownRight size={15} color="#ef4444" /> Total Spent
        </div>
        <div className="stat-value" style={{ color: '#ef4444' }}>
          {formatINR(totalSpent)}
        </div>
      </div>

      {/* 4. Net Cash Flow */}
      <div className="stat-box">
        <div className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Scale size={15} color={isNetPositive ? '#22c55e' : '#f97316'} /> Net Cash Flow
        </div>
        <div className="stat-value" style={{ color: isNetPositive ? '#22c55e' : '#f97316' }}>
          {formatINR(netCashFlow)}
        </div>
      </div>

      {/* 5. Burn Rate */}
      <div className="stat-box" title="How much more money you're spending than earning, per month">
        <div className="stat-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Flame size={15} color="#f43f5e" /> Monthly Burn
          </div>
          <HelpCircle size={13} color="#94a3b8" style={{ cursor: 'help' }} />
        </div>
        <div className="stat-value" style={{ color: '#f43f5e' }}>
          {formatINR(monthlyBurnRate)}/mo
        </div>
        <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>Spending vs income/mo</div>
      </div>

      {/* 6. Runway */}
      <div className="stat-box" title="How many months your startup can survive at the current spending rate before running out of cash">
        <div className="stat-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={15} color={runwayMonths < 3 ? '#ef4444' : runwayMonths < 6 ? '#eab308' : '#22c55e'} /> Runway
          </div>
          <HelpCircle size={13} color="#94a3b8" style={{ cursor: 'help' }} />
        </div>
        <div
          className="stat-value"
          style={{ color: runwayMonths < 3 ? '#ef4444' : runwayMonths < 6 ? '#eab308' : '#22c55e' }}
        >
          {runwayMonths >= 99 ? '99+ Mo' : `${runwayMonths} Mo`}
        </div>
        <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>Months until zero cash</div>
      </div>
    </div>
  );
}
