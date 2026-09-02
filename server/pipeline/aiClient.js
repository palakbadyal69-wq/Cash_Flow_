require('dotenv').config();
let Anthropic;
try {
  Anthropic = require('@anthropic-ai/sdk').Anthropic;
} catch (e) {
  Anthropic = null;
}

/**
 * Multi-provider LLM client for CashFlowAI.
 * Automatically tries in priority order:
 * 1. Anthropic Claude (if ANTHROPIC_API_KEY set & active)
 * 2. Groq API (if GROQ_API_KEY or GROQ_KEY set)
 * 3. Google Gemini API (if GEMINI_API_KEY or GOOGLE_API_KEY set)
 * 
 * @param {string} systemPrompt
 * @param {Array} messages - [{ role: 'user'|'assistant', content: string }]
 * @param {Object} options - { temperature }
 * @returns {Promise<Object>} { text, provider }
 */
async function generateAIResponse(systemPrompt, messages, options = {}) {
  // 1. Try Anthropic Claude
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (anthropicKey && anthropicKey.startsWith('sk-ant') && Anthropic) {
    try {
      const client = new Anthropic({ apiKey: anthropicKey });
      const model = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';
      const res = await client.messages.create({
        model,
        max_tokens: 1000,
        temperature: options.temperature || 0.1,
        system: systemPrompt,
        messages
      });
      if (res.content && res.content[0]?.text) {
        console.log(`[AI Engine] Success via Anthropic Claude (${model}).`);
        return { text: res.content[0].text, provider: 'Anthropic Claude' };
      }
    } catch (err) {
      console.warn(`[AI Engine] Anthropic Claude failed (${err.message}). Falling back to next AI provider...`);
    }
  }

  // 2. Try Groq API
  const groqKey = process.env.GROQ_API_KEY || process.env.GROQ_KEY;
  if (groqKey && groqKey.startsWith('gsk_')) {
    try {
      const model = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';
      const groqMessages = [{ role: 'system', content: systemPrompt }, ...messages];
      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages: groqMessages,
          temperature: options.temperature || 0.1,
          max_tokens: 1000
        })
      });

      if (groqRes.ok) {
        const data = await groqRes.json();
        const text = data.choices && data.choices[0]?.message?.content;
        if (text) {
          console.log(`[AI Engine] Success via Groq API (${model}).`);
          return { text, provider: 'Groq AI' };
        }
      } else {
        const errJson = await groqRes.json();
        console.warn(`[AI Engine] Groq API returned error: ${JSON.stringify(errJson.error || errJson)}`);
      }
    } catch (err) {
      console.warn(`[AI Engine] Groq API failed (${err.message}). Falling back to next AI provider...`);
    }
  }

  // 3. Try Google Gemini API
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GEMINI_KEY;
  if (geminiKey) {
    try {
      const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
      const contents = messages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

      const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents
        })
      });

      if (geminiRes.ok) {
        const data = await geminiRes.json();
        const text = data.candidates && data.candidates[0]?.content?.parts[0]?.text;
        if (text) {
          console.log(`[AI Engine] Success via Google Gemini API (${model}).`);
          return { text, provider: 'Google Gemini AI' };
        }
      } else {
        const errJson = await geminiRes.json();
        console.warn(`[AI Engine] Google Gemini API returned error: ${JSON.stringify(errJson.error || errJson)}`);
      }
    } catch (err) {
      console.warn(`[AI Engine] Google Gemini API failed (${err.message}).`);
    }
  }

  throw new Error('All configured AI providers (Anthropic, Groq, Google Gemini) failed or have empty keys.');
}

module.exports = { generateAIResponse };
