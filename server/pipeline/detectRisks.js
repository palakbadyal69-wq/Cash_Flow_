/**
 * Step 3: detectRisks
 * Evaluates rule-based financial risk flags based on metrics and transaction patterns.
 * 
 * @param {Object} metrics - Output from computeMetrics
 * @param {Array} transactions - All parsed transactions
 * @returns {Array} Array of risk flag objects
 */
function detectRisks(metrics, transactions) {
  const risks = [];
  const { runwayMonths, monthlyBreakdown, totalOverdueReceivables, payables, currentBalance } = metrics;

  // Rule 1: Burn rate accelerating month-over-month (last 3 months)
  if (monthlyBreakdown && monthlyBreakdown.length >= 3) {
    const recent = monthlyBreakdown.slice(-3);
    const b1 = recent[0].netBurn;
    const b2 = recent[1].netBurn;
    const b3 = recent[2].netBurn;

    if (b3 > b2 && b2 > b1 && b3 > 0) {
      const growthPct = b1 > 0 ? Math.round(((b3 - b1) / b1) * 100) : 100;
      risks.push({
        type: 'burn_rate_acceleration',
        severity: 'high',
        title: 'Accelerating Monthly Cash Burn',
        detail: `Net monthly burn expanded by ${growthPct}% over consecutive recent months (from ₹${b1.toLocaleString('en-IN')} to ₹${b3.toLocaleString('en-IN')}/mo).`,
        metrics: { previousBurn: b1, currentBurn: b3, growthPct }
      });
    }
  }

  // Rule 2: Runway below 6 months
  if (runwayMonths < 6.0) {
    const severity = runwayMonths < 3.0 ? 'high' : 'medium';
    risks.push({
      type: 'runway_below_threshold',
      severity,
      title: `Low Cash Runway (${runwayMonths} Months Left)`,
      detail: `Current cash reserves (₹${currentBalance.toLocaleString('en-IN')}) provide only ${runwayMonths} months of operation under the current burn rate (₹${metrics.monthlyBurnRate.toLocaleString('en-IN')}/mo).`,
      metrics: { runwayMonths, currentBalance, burnRate: metrics.monthlyBurnRate }
    });
  }

  // Rule 3: Overdue receivables (total ₹ amount at risk)
  if (totalOverdueReceivables > 0) {
    const overdueCount = metrics.receivables.filter((r) => r.status === 'overdue').length;
    risks.push({
      type: 'overdue_receivables',
      severity: 'high',
      title: 'Overdue Customer Receivables At Risk',
      detail: `₹${totalOverdueReceivables.toLocaleString('en-IN')} across ${overdueCount} customer invoice(s) is overdue, creating immediate working capital stress.`,
      metrics: { totalOverdueReceivables, overdueCount }
    });
  }

  // Rule 4: Large payable due soon relative to current balance
  const largeImmediatePayables = payables.filter(
    (p) => p.amount > currentBalance * 0.12 && p.daysUntilDue <= 7
  );
  if (largeImmediatePayables.length > 0) {
    const totalLargePayable = largeImmediatePayables.reduce((acc, p) => acc + p.amount, 0);
    const pctOfBalance = Math.round((totalLargePayable / currentBalance) * 100);
    risks.push({
      type: 'large_impending_payable',
      severity: 'high',
      title: 'Large Imminent Payable Outflow',
      detail: `Upcoming vendor/subscription invoice of ₹${totalLargePayable.toLocaleString('en-IN')} is due within 7 days, representing ${pctOfBalance}% of total available cash.`,
      metrics: { totalLargePayable, pctOfBalance }
    });
  }

  // Rule 5: Revenue concentration (one customer > 40% of inflow)
  const customerInflows = {};
  let totalInflow = 0;

  transactions.forEach((tx) => {
    if (tx.type === 'inflow' && (tx.status === 'received' || tx.status === 'pending' || tx.status === 'overdue')) {
      customerInflows[tx.source] = (customerInflows[tx.source] || 0) + tx.amount;
      totalInflow += tx.amount;
    }
  });

  if (totalInflow > 0) {
    let topCustomer = '';
    let topAmount = 0;

    Object.entries(customerInflows).forEach(([source, amount]) => {
      if (amount > topAmount) {
        topAmount = amount;
        topCustomer = source;
      }
    });

    const concentrationPct = Math.round((topAmount / totalInflow) * 100);
    if (concentrationPct > 40) {
      risks.push({
        type: 'revenue_concentration',
        severity: 'medium',
        title: 'High Customer Revenue Concentration',
        detail: `Single client '${topCustomer}' accounts for ${concentrationPct}% of total revenue (₹${topAmount.toLocaleString('en-IN')} of ₹${totalInflow.toLocaleString('en-IN')}).`,
        metrics: { topCustomer, topAmount, concentrationPct }
      });
    }
  }

  console.log(`[Pipeline Step 3] detectRisks: Detected ${risks.length} risk flags (${risks.map((r) => r.type).join(', ')}).`);

  return risks;
}

module.exports = detectRisks;
