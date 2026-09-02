import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { LineChart } from 'lucide-react';

export default function ForecastChart({ runway, forecast }) {
  if (!runway || !forecast) return null;

  const { monthlyBreakdown, currentBalance } = runway;

  // Build continuous timeline array for historical + forecast balance
  const chartData = [];

  // Reconstruct historical monthly ending balances backward from currentBalance
  if (monthlyBreakdown && monthlyBreakdown.length > 0) {
    const revHistory = [...monthlyBreakdown].reverse();
    let balancePointer = currentBalance;

    const histPoints = [];
    revHistory.forEach((item, idx) => {
      if (idx === 0) {
        histPoints.unshift({
          month: item.month,
          balance: balancePointer,
          type: 'Historical'
        });
      } else {
        const prevNetBurn = revHistory[idx - 1].netBurn;
        balancePointer = balancePointer + prevNetBurn;
        histPoints.unshift({
          month: item.month,
          balance: Math.max(0, balancePointer),
          type: 'Historical'
        });
      }
    });

    chartData.push(...histPoints);
  }

  // Append 3-month forecast points
  (forecast || []).forEach((f) => {
    chartData.push({
      month: `${f.month} (Proj)`,
      balance: f.projectedBalance,
      type: 'Projected'
    });
  });

  const formatCurrency = (val) => `₹${(val / 100000).toFixed(1)}L`;

  return (
    <div className="section-card">
      <div className="section-header" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <LineChart size={20} color="#c084fc" />
          3-Month Cashflow Forecast & Projection
        </div>
        <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'none' }}>
          Historical Actuals + 90-Day Weighted Moving Projection
        </span>
      </div>

      <div style={{ width: '100%', height: 320, marginTop: '10px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis dataKey="month" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <YAxis
              stroke="#94a3b8"
              tickFormatter={formatCurrency}
              tick={{ fill: '#94a3b8', fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                borderColor: '#334155',
                borderRadius: '8px',
                color: '#f8fafc'
              }}
              formatter={(value) => [`₹${(value || 0).toLocaleString('en-IN')}`, 'Cash Balance']}
            />
            <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="3 3" label="Insolvency Line" />
            <Area
              type="monotone"
              dataKey="balance"
              stroke="#8b5cf6"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#balanceGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
