const fs = require('fs');
const path = require('path');
const parseData = require('./parseData');
const computeMetrics = require('./computeMetrics');
const detectRisks = require('./detectRisks');
const forecastCashflow = require('./forecastCashflow');
const computeHealthIndicator = require('./computeHealthIndicator');
const decideRecommendation = require('./decideRecommendation');

/**
 * Step 6: generateReport
 * Executes the complete 6-step agentic AI financial analysis pipeline.
 * Logs each step to the terminal for live hackathon demo visibility.
 * 
 * @returns {Promise<Object>} Combined CashFlowAI report object
 */
async function generateReport() {
  console.log('\n======================================================');
  console.log('🤖 CashFlowAI Agentic Pipeline Triggered (INR Mode)');
  console.log('Timestamp:', new Date().toISOString());
  console.log('======================================================\n');

  // Read Profile Data
  const profilePath = path.join(__dirname, '../data/profile.json');
  let profile = { founderName: '', startupName: '', description: '', setupComplete: false };
  if (fs.existsSync(profilePath)) {
    try {
      profile = JSON.parse(fs.readFileSync(profilePath, 'utf-8'));
    } catch (e) {}
  }

  // Step 1: Parse Data & Balance
  const { transactions, currentBalance } = parseData();

  // Step 2: Compute Financial Metrics & Runway
  const metrics = computeMetrics(transactions, currentBalance);

  // Step 3: Rule-Based Solvency Risk Detection
  const risks = detectRisks(metrics, transactions);

  // Step 4: 3-Month Cashflow Projection
  const forecast = forecastCashflow(transactions, metrics, 3);

  // Step 5: Deterministic Health Status Indicator (🟢/🟡/🔴)
  const healthIndicator = computeHealthIndicator(metrics, risks);

  // Step 6: LLM Reasoning & Strategic Decision (Claude)
  const recommendation = await decideRecommendation(metrics, risks, healthIndicator);

  console.log('\n[Pipeline Step 6] generateReport: Successfully compiled CashFlowAI report.');
  console.log('======================================================\n');

  const endBalanceForecast = forecast[forecast.length - 1]?.projectedBalance || 0;

  return {
    meta: {
      appName: 'CashFlowAI',
      version: '1.0.0',
      track: 'Razorpay AI Buildathon - AI Finance Controller',
      currency: 'INR (₹)',
      founderName: profile.founderName || '',
      startupName: profile.startupName || '',
      description: profile.description || '',
      setupComplete: Boolean(profile.setupComplete),
      generatedAt: new Date().toISOString()
    },
    metrics,
    risks,
    forecast,
    healthIndicator,
    recommendation,
    pipelineLogs: [
      `Step 1: Ingested ${transactions.length} transactions; Current Balance: ₹${currentBalance.toLocaleString('en-IN')}`,
      `Step 2: Computed Net Flow (₹${metrics.netCashFlow.toLocaleString('en-IN')}), Burn Rate (₹${metrics.monthlyBurnRate.toLocaleString('en-IN')}/mo), Runway (${metrics.runwayMonths} mo)`,
      `Step 3: Detected ${risks.length} risk flags (${risks.map((r) => r.type).join(', ')})`,
      `Step 4: Generated 3-month forecast ending balance of ₹${endBalanceForecast.toLocaleString('en-IN')}`,
      `Step 5: Assigned Health Status -> ${healthIndicator.icon} ${healthIndicator.title}`,
      `Step 6: AI Decision issued -> ${recommendation.action.toUpperCase()} (${recommendation.confidence} confidence)`
    ]
  };
}

module.exports = generateReport;
