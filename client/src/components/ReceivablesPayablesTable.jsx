import React from 'react';
import { ArrowDownLeft, ArrowUpRight, Clock, Edit3, Trash2, HelpCircle } from 'lucide-react';

export default function ReceivablesPayablesTable({ receivables, payables, onEdit, onDelete }) {
  const formatINR = (val) => `₹${(val || 0).toLocaleString('en-IN')}`;

  const handleDelete = (id, source) => {
    if (window.confirm(`Delete transaction for "${source}"?`)) {
      if (onDelete) onDelete(id);
    }
  };

  return (
    <div className="section-card">
      <div className="section-header">
        <Clock size={20} color="#38bdf8" />
        Working Capital: Receivables & Payables Ledger
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        {/* Receivables Table */}
        <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '1rem', color: '#22c55e' }}>
              <ArrowDownLeft size={18} />
              Receivables (Pending Inflows)
            </div>
            <div
              title="Money customers owe you but haven't paid yet"
              style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#94a3b8', cursor: 'help' }}
            >
              <HelpCircle size={14} color="#38bdf8" /> What is this?
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '14px' }}>
            Money customers owe you but haven't paid yet
          </div>

          {!receivables || receivables.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No pending or overdue receivables.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}>
                    <th style={{ padding: '8px 4px' }}>Source Client</th>
                    <th style={{ padding: '8px 4px' }}>Amount</th>
                    <th style={{ padding: '8px 4px' }}>Due Date</th>
                    <th style={{ padding: '8px 4px' }}>Status</th>
                    <th style={{ padding: '8px 4px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {receivables.map((item) => {
                    const isOverdue = item.status === 'overdue';
                    return (
                      <tr
                        key={item.id}
                        style={{
                          borderBottom: '1px solid rgba(51, 65, 85, 0.5)',
                          background: isOverdue ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                          color: isOverdue ? '#fca5a5' : '#f8fafc'
                        }}
                      >
                        <td style={{ padding: '10px 4px', fontWeight: 600 }}>{item.source}</td>
                        <td style={{ padding: '10px 4px', fontWeight: 700 }}>{formatINR(item.amount)}</td>
                        <td style={{ padding: '10px 4px', color: '#94a3b8' }}>{item.dueDate || item.date}</td>
                        <td style={{ padding: '10px 4px' }}>
                          {isOverdue ? (
                            <span className="severity-badge high" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                              Overdue ({item.daysOverdue}d)
                            </span>
                          ) : (
                            <span className="severity-badge medium" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                              Pending
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '10px 4px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => onEdit && onEdit(item)}
                              title="Edit transaction"
                              style={{ background: 'transparent', border: 'none', color: '#38bdf8', cursor: 'pointer', padding: 0 }}
                            >
                              <Edit3 size={15} />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id, item.source)}
                              title="Delete transaction"
                              style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', padding: 0 }}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Payables Table */}
        <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '1rem', color: '#f43f5e' }}>
              <ArrowUpRight size={18} />
              Payables (Pending Outflows)
            </div>
            <div
              title="Money you owe to vendors/suppliers, not yet paid"
              style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#94a3b8', cursor: 'help' }}
            >
              <HelpCircle size={14} color="#f43f5e" /> What is this?
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '14px' }}>
            Money you owe to vendors/suppliers, not yet paid
          </div>

          {!payables || payables.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No pending vendor payables.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}>
                    <th style={{ padding: '8px 4px' }}>Vendor / Source</th>
                    <th style={{ padding: '8px 4px' }}>Amount</th>
                    <th style={{ padding: '8px 4px' }}>Due Date</th>
                    <th style={{ padding: '8px 4px' }}>Due In</th>
                    <th style={{ padding: '8px 4px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payables.map((item) => {
                    const isUrgent = item.daysUntilDue <= 5;
                    return (
                      <tr
                        key={item.id}
                        style={{
                          borderBottom: '1px solid rgba(51, 65, 85, 0.5)',
                          background: isUrgent ? 'rgba(234, 179, 8, 0.1)' : 'transparent',
                          color: isUrgent ? '#fde047' : '#f8fafc'
                        }}
                      >
                        <td style={{ padding: '10px 4px', fontWeight: 600 }}>{item.source}</td>
                        <td style={{ padding: '10px 4px', fontWeight: 700 }}>{formatINR(item.amount)}</td>
                        <td style={{ padding: '10px 4px', color: '#94a3b8' }}>{item.dueDate || item.date}</td>
                        <td style={{ padding: '10px 4px' }}>
                          <span
                            className={`severity-badge ${isUrgent ? 'high' : 'low'}`}
                            style={{ fontSize: '0.7rem', padding: '2px 8px' }}
                          >
                            {item.daysUntilDue <= 0 ? 'Due Today' : `${item.daysUntilDue} days`}
                          </span>
                        </td>
                        <td style={{ padding: '10px 4px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => onEdit && onEdit(item)}
                              title="Edit transaction"
                              style={{ background: 'transparent', border: 'none', color: '#38bdf8', cursor: 'pointer', padding: 0 }}
                            >
                              <Edit3 size={15} />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id, item.source)}
                              title="Delete transaction"
                              style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', padding: 0 }}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
