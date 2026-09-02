require('dotenv').config();
const { generateAIResponse } = require('./aiClient');

/**
 * Step 5.5: chatWithAgent
 * Invokes multi-provider AI Engine with user message, conversation history, and real financial context.
 * Supports Anthropic Claude, Groq AI, and Google Gemini.
 * 
 * @param {string} userMessage - Founder query
 * @param {Array} conversationHistory - Prior conversation turns
 * @param {Object} financialContext - In-memory computed metrics, risks, health & receivables/payables
 * @returns {Promise<Object>} { reply, isFallback, aiProvider }
 */
async function chatWithAgent(userMessage, conversationHistory, financialContext) {
  const systemPrompt = `You are CashFlowAI's autonomous finance assistant, helping a startup founder understand their company's cash position. You have access to their real, current financial data below. Answer using ONLY this data — do not invent numbers or make assumptions beyond what's given. If asked something the data can't answer, say so honestly rather than guessing. Keep answers concise (2-4 sentences unless the founder asks for detail), in plain language, not finance jargon. Use ₹ for all amounts.

CURRENT FINANCIAL DATA:
${JSON.stringify(financialContext, null, 2)}`;

  // Filter history to last 10 valid turns
  const validHistory = (conversationHistory || [])
    .slice(-10)
    .filter((m) => m && m.role && m.content)
    .map((m) => ({ role: m.role, content: m.content }));

  const messages = [...validHistory, { role: 'user', content: userMessage }];

  try {
    const aiResult = await generateAIResponse(systemPrompt, messages, { temperature: 0.2 });
    return {
      reply: aiResult.text,
      isFallback: false,
      aiProvider: aiResult.provider
    };
  } catch (error) {
    console.warn('[Chat Engine] All AI providers failed or unconfigured:', error.message);

    const hasNoData =
      (financialContext?.totalReceived === 0 && financialContext?.totalSpent === 0 && (financialContext?.receivables || []).length === 0) ||
      (financialContext?.currentBalance === 0 && financialContext?.monthlyBurnRate === 0);

    if (hasNoData) {
      return {
        reply: "Not enough financial data recorded yet. Add your income and expense transactions to get personalized financial advice.",
        isFallback: true
      };
    }

    const runway = financialContext?.runwayMonths !== undefined ? (financialContext.runwayMonths >= 99 ? '99+ months' : `${financialContext.runwayMonths} months`) : 'unknown';
    const balance = (financialContext?.currentBalance || 0).toLocaleString('en-IN');
    const burn = (financialContext?.monthlyBurnRate || 0).toLocaleString('en-IN');
    const status = financialContext?.healthIndicator?.title || 'Evaluated';

    return {
      reply: `Based on your current numbers: Your cash balance is ₹${balance}, monthly burn rate is ₹${burn}/mo, giving you a runway of ${runway}. Overall health status: ${status}. (Note: AI network unavailable, so this is a data-derived summary fallback).`,
      isFallback: true
    };
  }
}

module.exports = chatWithAgent;
