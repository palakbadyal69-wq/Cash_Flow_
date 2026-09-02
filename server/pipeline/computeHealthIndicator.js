/**
 * Step 4: computeHealthIndicator
 * Deterministically computes the company's financial health indicator (🟢/🟡/🔴).
 * NO LLM CALLS inside this function.
 * 
 * @param {Object} metrics - Calculated financial metrics
 * @param {Array} risks - Array of detected risk flags
 * @returns {Object} Health status object
 */
function computeHealthIndicator(metrics, risks) {
  const { runwayMonths, totalOverdueReceivables } = metrics;
  const highRisks = risks.filter((r) => r.severity === 'high');

  let status = 'healthy';
  let icon = '🟢';
  let title = 'Healthy Solvency Status';
  let summary = 'Cash reserves provide safe operational headroom with manageable burn rate.';

  if (runwayMonths < 3.0 || highRisks.length >= 2 || totalOverdueReceivables > 500000) {
    status = 'critical';
    icon = '🔴';
    title = 'Critical Solvency Risk';
    summary = `Capital runway is critically low (${runwayMonths} months) with ₹${totalOverdueReceivables.toLocaleString('en-IN')} in overdue customer payments at risk.`;
  } else if (runwayMonths < 6.0 || risks.length >= 2 || totalOverdueReceivables > 0) {
    status = 'caution';
    icon = '🟡';
    title = 'Caution Required — Operational Stress Detected';
    summary = `Runway is constrained (${runwayMonths} months) with ₹${totalOverdueReceivables.toLocaleString('en-IN')} overdue receivables and accelerating burn rate.`;
  }

  const result = {
    status,
    icon,
    title,
    summary
  };

  console.log(`[Pipeline Step 4] computeHealthIndicator: Computed status -> ${icon} ${title}`);

  return result;
}

module.exports = computeHealthIndicator;
