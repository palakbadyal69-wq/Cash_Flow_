/**
 * forecastCashflow
 * Computes a weighted-average projection of cash balance over the next N months in INR ₹.
 * @param {Array} transactions - Parsed transaction list
 * @param {Object} metrics - Computed metrics from computeMetrics
 * @param {number} months - Projection horizon (default 3)
 * @returns {Array} Array of projected monthly balance objects
 */
function forecastCashflow(transactions, metrics, months = 3) {
  const { currentBalance, monthlyBreakdown } = metrics || {};

  const history = monthlyBreakdown || [];
  const recent = history.slice(-3);

  let projInflow = 500000;
  let projOutflow = 1400000;

  if (recent.length >= 3) {
    projInflow = Math.round(recent[2].inflow * 0.5 + recent[1].inflow * 0.3 + recent[0].inflow * 0.2);
    const outflowTrendFactor = recent[2].outflow > recent[1].outflow ? 1.05 : 1.0;
    projOutflow = Math.round((recent[2].outflow * 0.5 + recent[1].outflow * 0.3 + recent[0].outflow * 0.2) * outflowTrendFactor);
  } else if (recent.length > 0) {
    projInflow = Math.round(recent.reduce((acc, m) => acc + m.inflow, 0) / recent.length);
    projOutflow = Math.round(recent.reduce((acc, m) => acc + m.outflow, 0) / recent.length);
  }

  const lastMonthStr = history.length > 0 ? history[history.length - 1].month : new Date().toISOString().substring(0, 7);
  const [yearStr, monthStr] = lastMonthStr.split('-');
  let curYear = parseInt(yearStr, 10);
  let curMonth = parseInt(monthStr, 10);

  const forecast = [];
  let runningBalance = currentBalance;

  for (let i = 1; i <= months; i++) {
    curMonth++;
    if (curMonth > 12) {
      curMonth = 1;
      curYear++;
    }

    const nextMonthStr = `${curYear}-${String(curMonth).padStart(2, '0')}`;
    const monthlyNet = projInflow - projOutflow;
    runningBalance = Math.max(0, runningBalance + monthlyNet);

    forecast.push({
      month: nextMonthStr,
      projectedBalance: Math.round(runningBalance),
      projectedInflow: projInflow,
      projectedOutflow: projOutflow,
      isForecast: true
    });
  }

  const forecastSummary = forecast.map((f) => `${f.month}: ₹${f.projectedBalance.toLocaleString('en-IN')}`).join(', ');
  console.log(`[Pipeline Step 4] forecastCashflow: Projected balances over next ${months} months -> [${forecastSummary}].`);

  return forecast;
}

module.exports = forecastCashflow;
