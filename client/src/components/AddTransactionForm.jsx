import React, { useState, useEffect } from 'react';
import { PlusCircle, Edit3, X } from 'lucide-react';

export default function AddTransactionForm({ isOpen, onClose, onSuccess, editingTransaction }) {
  const [type, setType] = useState('inflow');
  const [source, setSource] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('customer_payment');
  const [status, setStatus] = useState('received');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type || 'inflow');
      setSource(editingTransaction.source || '');
      setAmount(editingTransaction.amount !== undefined ? editingTransaction.amount : '');
      setCategory(editingTransaction.category || (editingTransaction.type === 'inflow' ? 'customer_payment' : 'other_expense'));
      setStatus(editingTransaction.status || (editingTransaction.type === 'inflow' ? 'received' : 'paid'));
      setDueDate(editingTransaction.dueDate || '');
      setNotes(editingTransaction.notes || '');
    } else {
      setType('inflow');
      setSource('');
      setAmount('');
      setCategory('customer_payment');
      setStatus('received');
      setDueDate('');
      setNotes('');
    }
    setError(null);
  }, [editingTransaction, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!source || !amount) {
      setError('Please fill in source name and amount.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const url = editingTransaction
        ? `/api/transactions/${editingTransaction.id}`
        : '/api/transactions';
      const method = editingTransaction ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: editingTransaction ? editingTransaction.date : new Date().toISOString().substring(0, 10),
          type,
          category,
          amount: parseFloat(amount),
          source,
          status,
          dueDate: dueDate || null,
          notes
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to ${editingTransaction ? 'update' : 'record'} transaction`);
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(2, 6, 23, 0.8)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px'
      }}
    >
      <div
        style={{
          background: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '16px',
          padding: '24px',
          width: '100%',
          maxWidth: '500px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {editingTransaction ? <Edit3 size={22} color="#38bdf8" /> : <PlusCircle size={22} color="#38bdf8" />}
            {editingTransaction ? 'Edit Transaction' : 'Record New Entry'}
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', color: '#f87171', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Type Selector Toggle */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={() => { setType('inflow'); setCategory('customer_payment'); setStatus('received'); }}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: type === 'inflow' ? '#22c55e' : '#334155',
                background: type === 'inflow' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                color: type === 'inflow' ? '#4ade80' : '#94a3b8',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              + Income / Inflow
            </button>
            <button
              type="button"
              onClick={() => { setType('outflow'); setCategory('other_expense'); setStatus('paid'); }}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: type === 'outflow' ? '#ef4444' : '#334155',
                background: type === 'outflow' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                color: type === 'outflow' ? '#f87171' : '#94a3b8',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              - Expense / Outflow
            </button>
          </div>

          {/* Source/Client Name */}
          <div>
            <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
              {type === 'inflow' ? 'Customer / Client Name' : 'Vendor / Expense Name'} *
            </label>
            <input
              type="text"
              required
              placeholder={type === 'inflow' ? 'e.g. Acme Tech Solutions' : 'e.g. AWS Cloud Hosting'}
              value={source}
              onChange={(e) => setSource(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                background: '#0f172a',
                border: '1px solid #334155',
                color: '#f8fafc',
                fontSize: '0.9rem'
              }}
            />
          </div>

          {/* Amount (₹) & Category */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Amount (₹ INR) *
              </label>
              <input
                type="number"
                required
                placeholder="e.g. 150000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: '#0f172a',
                  border: '1px solid #334155',
                  color: '#f8fafc',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: '#0f172a',
                  border: '1px solid #334155',
                  color: '#f8fafc',
                  fontSize: '0.9rem'
                }}
              >
                {type === 'inflow' ? (
                  <>
                    <option value="customer_payment">Customer Payment</option>
                    <option value="investment">Investment</option>
                    <option value="loan">Bank Loan</option>
                    <option value="other_income">Other Income</option>
                  </>
                ) : (
                  <>
                    <option value="salary">Salary / Payroll</option>
                    <option value="marketing">Marketing & Ads</option>
                    <option value="rent">Office Rent</option>
                    <option value="subscription">Subscription & Cloud</option>
                    <option value="vendor">Vendor Contract</option>
                    <option value="operations">Operations</option>
                    <option value="other_expense">Other Expense</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Status & Due Date */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: '#0f172a',
                  border: '1px solid #334155',
                  color: '#f8fafc',
                  fontSize: '0.9rem'
                }}
              >
                {type === 'inflow' ? (
                  <>
                    <option value="received">Received (Cash In)</option>
                    <option value="pending">Pending</option>
                    <option value="overdue">Overdue</option>
                  </>
                ) : (
                  <>
                    <option value="paid">Paid (Cash Out)</option>
                    <option value="pending">Pending Invoice</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Due Date (Optional)
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: '#0f172a',
                  border: '1px solid #334155',
                  color: '#f8fafc',
                  fontSize: '0.9rem'
                }}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
              Notes / Memo
            </label>
            <input
              type="text"
              placeholder="e.g. Q3 subscription payment"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                background: '#0f172a',
                border: '1px solid #334155',
                color: '#f8fafc',
                fontSize: '0.9rem'
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 16px',
                borderRadius: '8px',
                background: 'transparent',
                border: '1px solid #334155',
                color: '#94a3b8',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                background: '#2563eb',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                fontWeight: 700
              }}
            >
              {submitting ? 'Saving...' : editingTransaction ? 'Update Transaction' : 'Save Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
