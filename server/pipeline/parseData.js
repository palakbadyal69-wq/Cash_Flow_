const fs = require('fs');
const path = require('path');

/**
 * Step 1: parseData
 * Loads and normalizes transactions and current cash balance.
 * 
 * @param {string} transactionsPath 
 * @param {string} balancePath 
 * @returns {Object} { transactions, currentBalance }
 */
function parseData(transactionsPath, balancePath) {
  const txFile = transactionsPath || path.join(__dirname, '../data/transactions.json');
  const balFile = balancePath || path.join(__dirname, '../data/balance.json');

  const rawTx = JSON.parse(fs.readFileSync(txFile, 'utf-8'));
  const rawBal = JSON.parse(fs.readFileSync(balFile, 'utf-8'));

  const transactions = (rawTx || []).map((tx, idx) => ({
    id: tx.id || `tx_${idx}_${Date.now()}`,
    date: tx.date,
    type: (tx.type || '').toLowerCase() === 'inflow' ? 'inflow' : 'outflow',
    category: tx.category || 'other_expense',
    amount: Math.abs(Number(tx.amount) || 0),
    source: tx.source || 'Unknown Party',
    status: (tx.status || 'paid').toLowerCase(),
    dueDate: tx.dueDate || null,
    notes: tx.notes || ''
  }));

  // Sort chronologically ascending
  transactions.sort((a, b) => new Date(a.date) - new Date(b.date));

  const currentBalance = Number(rawBal.currentBalance || rawBal.balance) || 0;

  console.log(`[Pipeline Step 1] parseData: Loaded ${transactions.length} transactions. Current Balance: ₹${currentBalance.toLocaleString('en-IN')}`);

  return { transactions, currentBalance };
}

module.exports = parseData;
