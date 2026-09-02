/**
 * Step 2: computeMetrics
 * Computes primary financial metrics, burn rate, runway, receivables, and payables.
 * 
 * @param {Array} transactions 
 * @param {number} currentBalance 
 * @returns {Object} Structured metrics
 */
function computeMetrics(transactions, currentBalance) {
  const currentDate = new Date();

  let totalReceived = 0;
  let totalSpent = 0;

  const monthMap = {};

  transactions.forEach((tx) => {
    if (tx.status === 'received' && tx.type === 'inflow') {
      totalReceived += tx.amount;
    }
    if (tx.status === 'paid' && tx.type === 'outflow') {
      totalSpent += tx.amount;
    }

    // Monthly aggregates for historical burn trend
    const monthKey = tx.date.substring(0, 7);
    if (!monthMap[monthKey]) {
      monthMap[monthKey] = { month: monthKey, inflow: 0, outflow: 0 };
    }

    if (tx.type === 'inflow' && (tx.status === 'received' || tx.status === 'paid')) {
      monthMap[monthKey].inflow += tx.amount;
    } else if (tx.type === 'outflow' && tx.status === 'paid') {
      monthMap[monthKey].outflow += tx.amount;
    }
  });

  const netCashFlow = totalReceived - totalSpent;

  const monthsList = Object.keys(monthMap).sort();
  const monthlyBreakdown = monthsList.map((m) => {
    const data = monthMap[m];
    return {
      month: data.month,
      inflow: Math.round(data.inflow),
      outflow: Math.round(data.outflow),
      netBurn: Math.round(data.outflow - data.inflow)
    };
  });

  // Calculate monthly burn rate over recent 3 months
  const recentMonths = monthlyBreakdown.slice(-3);
  const totalRecentBurn = recentMonths.reduce((acc, m) => acc + m.netBurn, 0);
  const numMonths = Math.max(recentMonths.length, 1);
  const monthlyBurnRate = Math.max(0, Math.round(totalRecentBurn / numMonths));

  let runwayMonths = 99;
  if (monthlyBurnRate > 0) {
    runwayMonths = Number((currentBalance / monthlyBurnRate).toFixed(1));
  }

  // Receivables: pending or overdue inflows
  const receivables = transactions
    .filter((tx) => tx.type === 'inflow' && (tx.status === 'pending' || tx.status === 'overdue'))
    .map((tx) => {
      const due = tx.dueDate ? new Date(tx.dueDate) : new Date(tx.date);
      const diffDays = Math.floor((currentDate - due) / (1000 * 60 * 60 * 24));
      const daysOverdue = diffDays > 0 ? diffDays : 0;
      const isOverdue = daysOverdue > 0 || tx.status === 'overdue';

      return {
        ...tx,
        status: isOverdue ? 'overdue' : 'pending',
        daysOverdue
      };
    });

  // Payables: pending outflows
  const payables = transactions
    .filter((tx) => tx.type === 'outflow' && (tx.status === 'pending' || tx.status === 'overdue'))
    .map((tx) => {
      const due = tx.dueDate ? new Date(tx.dueDate) : new Date(tx.date);
      const diffDays = Math.floor((due - currentDate) / (1000 * 60 * 60 * 24));
      const daysUntilDue = diffDays;

      return {
        ...tx,
        daysUntilDue
      };
    });

  const totalOverdueReceivables = receivables
    .filter((r) => r.status === 'overdue')
    .reduce((acc, r) => acc + r.amount, 0);

  const totalPendingPayables = payables.reduce((acc, p) => acc + p.amount, 0);

  const result = {
    currentBalance,
    totalReceived,
    totalSpent,
    netCashFlow,
    monthlyBurnRate,
    runwayMonths,
    totalOverdueReceivables,
    totalPendingPayables,
    receivables,
    payables,
    monthlyBreakdown
  };

  console.log(`[Pipeline Step 2] computeMetrics: Net Flow=₹${netCashFlow.toLocaleString('en-IN')}, Burn Rate=₹${monthlyBurnRate.toLocaleString('en-IN')}/mo, Runway=${runwayMonths} months.`);

  return result;
}

module.exports = computeMetrics;
