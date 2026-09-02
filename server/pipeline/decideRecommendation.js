require('dotenv').config();
const { generateAIResponse } = require('./aiClient');

/**
 * Step 5: decideRecommendation
 * Invokes multi-provider AI Engine (Anthropic Claude, Groq AI, Google Gemini) to synthesize computed metrics, risks, and health status into a specific, reasoned recommendation.
 * 
 * @param {Object} metrics - Computed metrics
 * @param {Array} risks - Detected risks
 * @param {Object} healthIndicator - Deterministic health status
 * @returns {Promise<Object>} Recommendation JSON
 */
async function decideRecommendation(metrics, risks, healthIndicator) {
  const payload = {
    currency: 'INR (₹)',
    metrics: {
      currentBalance: metrics.currentBalance,
      totalReceived: metrics.totalReceived,
      totalSpent: metrics.totalSpent,
      netCashFlow: metrics.netCashFlow,
      monthlyBurnRate: metrics.monthlyBurnRate,
      runwayMonths: metrics.runwayMonths,
      totalOverdueReceivables: metrics.totalOverdueReceivables,
      totalPendingPayables: metrics.totalPendingPayables,
      receivables: metrics.receivables || [],
      payables: metrics.payables || []
    },
    healthIndicator,
    risks: (risks || []).map((r) => ({
      type: r.type,
      severity: r.severity,
      title: r.title,
      detail: r.detail,
      metrics: r.metrics
    }))
  };

  const systemPrompt = `You are CashFlowAI, an expert AI Chief Financial Officer for Indian tech startups.
Analyze the provided financial metrics, risk flags, and health status (denominated in INR ₹).
Issue an actionable, numeric decision.

CRITICAL INSTRUCTIONS:
1. Reason strictly from the provided numbers only. Do NOT invent external assumptions.
2. Be specific and numeric: cite exact ₹ Rupee figures (formatted nicely as ₹X,XX,XXX or ₹X.X Lakhs) and runway months from the input payload.
3. Select 'action' from: ["cut_spend", "chase_receivables", "delay_hiring", "raise_now", "renegotiate_payables", "healthy_no_action"].
4. Select 'confidence' from: ["low", "medium", "high"].
5. 'reasoning' MUST be 2 to 4 concise sentences citing actual ₹ figures and runway metrics from the payload.
6. 'priority_risks' MUST be an array of string risk types from the payload that most influenced your decision.

Respond ONLY with raw valid JSON matching this exact schema:
{
  "action": "cut_spend | chase_receivables | delay_hiring | raise_now | renegotiate_payables | healthy_no_action",
  "confidence": "low | medium | high",
  "reasoning": "string (citing ₹ amounts)",
  "priority_risks": ["risk_type_1", "risk_type_2"]
}`;

  const messages = [
    {
      role: 'user',
      content: `Analyze this startup financial payload and return your decision JSON:\n${JSON.stringify(payload, null, 2)}`
    }
  ];

  try {
    const aiResult = await generateAIResponse(systemPrompt, messages, { temperature: 0.1 });
    const responseText = aiResult.text || '';
    const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const decision = JSON.parse(cleanJson);

    console.log(`[Pipeline Step 5] decideRecommendation (${aiResult.provider}): Action=${decision.action}, Confidence=${decision.confidence}`);

    return {
      ...decision,
      isFallback: false,
      aiProvider: aiResult.provider
    };
  } catch (err) {
    console.warn(`[Pipeline Step 5] decideRecommendation: All AI providers failed (${err.message}). Using deterministic fallback.`);
    return generateFallbackDecision(payload, `all_ai_providers_failed: ${err.message}`);
  }
}

/**
 * Deterministic fallback generator 100% derived from payload metrics/risks.
 * NEVER uses hardcoded proper nouns (company names) or fake rupee amounts.
 */
function generateFallbackDecision(payload, fallbackReason = 'no_active_ai_keys') {
  const {
    runwayMonths,
    currentBalance,
    monthlyBurnRate,
    totalReceived,
    totalSpent,
    totalOverdueReceivables,
    receivables
  } = payload.metrics;
  const risks = payload.risks || [];
  const priority_risks = risks.map((r) => r.type);

  // Check for empty/zero transaction dataset
  const hasNoData =
    (totalReceived === 0 && totalSpent === 0 && (receivables || []).length === 0) ||
    (currentBalance === 0 && monthlyBurnRate === 0);

  if (hasNoData) {
    console.log(`[Pipeline Step 5] decideRecommendation (Fallback [${fallbackReason}]): Empty dataset detected.`);
    return {
      action: 'healthy_no_action',
      confidence: 'medium',
      reasoning: 'Not enough transaction data yet to generate a specific recommendation. Add income and expense entries to get AI-powered insights.',
      priority_risks: [],
      isFallback: true,
      fallbackReason
    };
  }

  // Find real overdue receivable if present
  const overdueList = (receivables || []).filter((r) => r.status === 'overdue' || r.daysOverdue > 0);
  const topOverdue = overdueList.sort((a, b) => b.amount - a.amount)[0];

  let action = 'healthy_no_action';
  let confidence = 'high';
  let reasoning = '';

  if (totalOverdueReceivables > 0 && topOverdue) {
    action = 'chase_receivables';
    reasoning = `With a current cash balance of ₹${currentBalance.toLocaleString('en-IN')} and monthly burn of ₹${monthlyBurnRate.toLocaleString('en-IN')}, runway is ${runwayMonths >= 99 ? '99+ months' : `${runwayMonths} months`}. Recovering the ₹${totalOverdueReceivables.toLocaleString('en-IN')} in overdue customer payments (such as ${topOverdue.source}'s ₹${topOverdue.amount.toLocaleString('en-IN')} invoice) will immediately strengthen cash reserves without equity dilution.`;
  } else if (totalOverdueReceivables > 0) {
    action = 'chase_receivables';
    reasoning = `With a current cash balance of ₹${currentBalance.toLocaleString('en-IN')} and monthly burn of ₹${monthlyBurnRate.toLocaleString('en-IN')}, runway is ${runwayMonths >= 99 ? '99+ months' : `${runwayMonths} months`}. Recovering ₹${totalOverdueReceivables.toLocaleString('en-IN')} in overdue customer payments will improve working capital.`;
  } else if (runwayMonths < 3.0 && monthlyBurnRate > 0) {
    action = 'cut_spend';
    reasoning = `Your cash balance of ₹${currentBalance.toLocaleString('en-IN')} with a monthly burn of ₹${monthlyBurnRate.toLocaleString('en-IN')}/mo leaves only ${runwayMonths} months of runway. Immediate spend reductions are required to extend liquidity.`;
  } else if (runwayMonths < 6.0 && monthlyBurnRate > 0) {
    action = 'raise_now';
    reasoning = `Your cash balance of ₹${currentBalance.toLocaleString('en-IN')} provides ${runwayMonths} months of runway against a monthly burn of ₹${monthlyBurnRate.toLocaleString('en-IN')}/mo. Prepare fundraising materials now to avoid capital pressure.`;
  } else if (monthlyBurnRate > 0 && risks.some((r) => r.type === 'burn_rate_acceleration')) {
    action = 'cut_spend';
    reasoning = `Monthly burn of ₹${monthlyBurnRate.toLocaleString('en-IN')}/mo has accelerated. Review variable operating expenses to keep runway at ${runwayMonths} months.`;
  } else {
    action = 'healthy_no_action';
    reasoning = `Your current balance of ₹${currentBalance.toLocaleString('en-IN')} provides a safe runway of ${runwayMonths >= 99 ? '99+ months' : `${runwayMonths} months`}. Continue monitoring transactions and maintaining working capital.`;
  }

  console.log(`[Pipeline Step 5] decideRecommendation (Fallback [${fallbackReason}]): Action=${action}, Confidence=${confidence}`);

  return {
    action,
    confidence,
    reasoning,
    priority_risks,
    isFallback: true,
    fallbackReason
  };
}

module.exports = decideRecommendation;
