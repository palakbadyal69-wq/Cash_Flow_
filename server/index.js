require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const parseData = require('./pipeline/parseData');
const computeMetrics = require('./pipeline/computeMetrics');
const detectRisks = require('./pipeline/detectRisks');
const computeHealthIndicator = require('./pipeline/computeHealthIndicator');
const decideRecommendation = require('./pipeline/decideRecommendation');
const applyScenario = require('./pipeline/applyScenario');
const generateReport = require('./pipeline/generateReport');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const transactionsFilePath = path.join(__dirname, 'data/transactions.json');
const balanceFilePath = path.join(__dirname, 'data/balance.json');
const profileFilePath = path.join(__dirname, 'data/profile.json');

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'CashFlowAI Backend API (INR MVP)',
    timestamp: new Date().toISOString()
  });
});

// GET /api/setup/status - Checks setup onboarding completion state
app.get('/api/setup/status', (req, res) => {
  try {
    if (!fs.existsSync(profileFilePath)) {
      return res.json({ setupComplete: false });
    }
    const profile = JSON.parse(fs.readFileSync(profileFilePath, 'utf-8'));
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read setup status' });
  }
});

// POST /api/setup - Complete founder onboarding setup
app.post('/api/setup', (req, res) => {
  try {
    const { founderName, startupName, description, startingBalance } = req.body;
    if (!founderName || !startupName || startingBalance === undefined) {
      return res.status(400).json({ error: 'Missing required fields: founderName, startupName, startingBalance' });
    }

    const profile = {
      founderName: founderName.trim(),
      startupName: startupName.trim(),
      description: (description || '').trim(),
      setupComplete: true
    };
    fs.writeFileSync(profileFilePath, JSON.stringify(profile, null, 2), 'utf-8');

    const balanceData = { currentBalance: Number(startingBalance) || 0 };
    fs.writeFileSync(balanceFilePath, JSON.stringify(balanceData, null, 2), 'utf-8');

    console.log(`[API POST /api/setup] Setup completed for ${profile.founderName} (${profile.startupName}). Starting Balance: ₹${balanceData.currentBalance.toLocaleString('en-IN')}`);

    res.status(201).json({ success: true, profile, currentBalance: balanceData.currentBalance });
  } catch (error) {
    console.error('Error saving setup:', error);
    res.status(500).json({ error: 'Failed to save setup', details: error.message });
  }
});

// POST /api/reset - Erase profile/transactions/balance and restart onboarding
app.post('/api/reset', (req, res) => {
  try {
    fs.writeFileSync(profileFilePath, JSON.stringify({ founderName: '', startupName: '', description: '', setupComplete: false }, null, 2), 'utf-8');
    fs.writeFileSync(transactionsFilePath, JSON.stringify([], null, 2), 'utf-8');
    fs.writeFileSync(balanceFilePath, JSON.stringify({ currentBalance: 0 }, null, 2), 'utf-8');
    console.log('[API POST /api/reset] App reset to fresh onboarding state.');
    res.json({ success: true, message: 'Reset complete. Setup will run again.' });
  } catch (error) {
    console.error('Error resetting app:', error);
    res.status(500).json({ error: 'Failed to reset', details: error.message });
  }
});

// GET /api/dashboard - Runs agentic pipeline & returns full report
app.get('/api/dashboard', async (req, res) => {
  try {
    const report = await generateReport();
    res.json(report);
  } catch (error) {
    console.error('Error generating cashflow report:', error);
    res.status(500).json({
      error: 'Failed to generate CashFlowAI report',
      details: error.message
    });
  }
});

// POST /api/chat - Natural language finance chatbot agent endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Missing message' });
    }

    // Reuse existing pipeline functions to build fresh context
    const { transactions, currentBalance } = parseData();
    const metrics = computeMetrics(transactions, currentBalance);
    const risks = detectRisks(metrics, transactions);
    const healthIndicator = computeHealthIndicator(metrics, risks);

    const financialContext = {
      currentBalance: metrics.currentBalance,
      monthlyBurnRate: metrics.monthlyBurnRate,
      runwayMonths: metrics.runwayMonths,
      totalReceived: metrics.totalReceived,
      totalSpent: metrics.totalSpent,
      healthIndicator,
      risks: risks.map((r) => ({ type: r.type, severity: r.severity, detail: r.detail })),
      receivables: metrics.receivables,
      payables: metrics.payables
    };

    const chatWithAgent = require('./pipeline/chatWithAgent');
    const result = await chatWithAgent(message, history || [], financialContext);
    res.json(result);
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ error: 'Failed to process chat message', details: error.message });
  }
});

// GET /api/scenario/:type - Runs What-If scenario simulation in-memory without mutating disk files
app.get('/api/scenario/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const { transactions, currentBalance } = parseData();

    const { adjustedTransactions, adjustedBalance } = applyScenario(transactions, currentBalance, type);

    const baselineMetrics = computeMetrics(transactions, currentBalance);
    const scenarioMetrics = computeMetrics(adjustedTransactions, adjustedBalance);
    const scenarioRisks = detectRisks(scenarioMetrics, adjustedTransactions);
    const scenarioHealth = computeHealthIndicator(scenarioMetrics, scenarioRisks);
    const scenarioRecommendation = await decideRecommendation(scenarioMetrics, scenarioRisks, scenarioHealth);

    res.json({
      scenarioType: type,
      baseline: {
        runwayMonths: baselineMetrics.runwayMonths,
        currentBalance: baselineMetrics.currentBalance,
        monthlyBurnRate: baselineMetrics.monthlyBurnRate
      },
      scenario: {
        runwayMonths: scenarioMetrics.runwayMonths,
        currentBalance: scenarioMetrics.currentBalance,
        monthlyBurnRate: scenarioMetrics.monthlyBurnRate,
        healthIndicator: scenarioHealth,
        risks: scenarioRisks,
        recommendation: scenarioRecommendation
      }
    });
  } catch (error) {
    console.error('Error running scenario:', error);
    res.status(500).json({ error: 'Failed to run scenario', details: error.message });
  }
});

// GET /api/transactions - Returns all historical & active transactions
app.get('/api/transactions', (req, res) => {
  try {
    const rawTx = fs.readFileSync(transactionsFilePath, 'utf-8');
    const transactions = JSON.parse(rawTx);
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to read transactions' });
  }
});

// POST /api/transactions - Record new income or expense transaction
app.post('/api/transactions', (req, res) => {
  try {
    const { date, type, category, amount, source, status, dueDate, notes } = req.body;

    if (!type || !amount || !source) {
      return res.status(400).json({ error: 'Missing required fields: type, amount, source' });
    }

    const numAmount = Math.abs(Number(amount));
    const txType = (type || 'outflow').toLowerCase();
    const txStatus = (status || (txType === 'inflow' ? 'received' : 'paid')).toLowerCase();

    const newTx = {
      id: `tx_${Date.now()}`,
      date: date || new Date().toISOString().substring(0, 10),
      type: txType,
      category: category || (txType === 'inflow' ? 'customer_payment' : 'other_expense'),
      amount: numAmount,
      source: source.trim(),
      status: txStatus,
      dueDate: dueDate || null,
      notes: notes || ''
    };

    // Load existing transactions
    const rawTx = fs.readFileSync(transactionsFilePath, 'utf-8');
    const transactions = JSON.parse(rawTx);
    transactions.push(newTx);
    fs.writeFileSync(transactionsFilePath, JSON.stringify(transactions, null, 2), 'utf-8');

    // Load and update balance if funds moved
    const rawBal = fs.readFileSync(balanceFilePath, 'utf-8');
    const balanceData = JSON.parse(rawBal);
    let currentBalance = Number(balanceData.currentBalance || balanceData.balance) || 0;

    if (txStatus === 'received' && txType === 'inflow') {
      currentBalance += numAmount;
    } else if (txStatus === 'paid' && txType === 'outflow') {
      currentBalance -= numAmount;
    }

    balanceData.currentBalance = currentBalance;
    fs.writeFileSync(balanceFilePath, JSON.stringify(balanceData, null, 2), 'utf-8');

    console.log(`[API POST /api/transactions] Recorded new ${txType} entry of ₹${numAmount.toLocaleString('en-IN')} for ${source}. Updated Balance: ₹${currentBalance.toLocaleString('en-IN')}`);

    res.status(201).json({
      success: true,
      transaction: newTx,
      currentBalance
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Failed to record transaction', details: error.message });
  }
});

// PUT /api/transactions/:id - Update existing transaction
app.put('/api/transactions/:id', (req, res) => {
  try {
    const rawTx = fs.readFileSync(transactionsFilePath, 'utf-8');
    const transactions = JSON.parse(rawTx);
    const index = transactions.findIndex(t => t.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const updatedTx = { ...transactions[index], ...req.body, id: req.params.id };
    if (updatedTx.amount) updatedTx.amount = Math.abs(Number(updatedTx.amount));
    transactions[index] = updatedTx;

    fs.writeFileSync(transactionsFilePath, JSON.stringify(transactions, null, 2), 'utf-8');
    console.log(`[API PUT /api/transactions/${req.params.id}] Updated transaction: ${updatedTx.source}`);
    res.json({ success: true, transaction: transactions[index] });
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ error: 'Failed to update transaction', details: error.message });
  }
});

// DELETE /api/transactions/:id - Delete transaction
app.delete('/api/transactions/:id', (req, res) => {
  try {
    const rawTx = fs.readFileSync(transactionsFilePath, 'utf-8');
    let transactions = JSON.parse(rawTx);
    const exists = transactions.some(t => t.id === req.params.id);
    if (!exists) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    transactions = transactions.filter(t => t.id !== req.params.id);
    fs.writeFileSync(transactionsFilePath, JSON.stringify(transactions, null, 2), 'utf-8');
    console.log(`[API DELETE /api/transactions/${req.params.id}] Deleted transaction.`);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: 'Failed to delete transaction', details: error.message });
  }
});

const server = app.listen(PORT, () => {
  console.log(`\n🚀 CashFlowAI Backend Server running on http://localhost:${PORT}`);
  console.log(`   GET  http://localhost:${PORT}/api/setup/status  - Setup Status Check`);
  console.log(`   POST http://localhost:${PORT}/api/setup         - Onboarding Setup`);
  console.log(`   POST http://localhost:${PORT}/api/reset         - Reset Demo App`);
  console.log(`   POST http://localhost:${PORT}/api/chat          - AI Finance Chatbot`);
  console.log(`   GET  http://localhost:${PORT}/api/dashboard     - Run Pipeline & Get Report`);
  console.log(`   GET  http://localhost:${PORT}/api/scenario/:t  - What-If Scenario Simulation`);
  console.log(`   GET  http://localhost:${PORT}/api/transactions  - List Ledger Transactions`);
  console.log(`   POST http://localhost:${PORT}/api/transactions  - Add New Transaction`);
  console.log(`   PUT  http://localhost:${PORT}/api/transactions/:id - Update Transaction`);
  console.log(`   DELETE http://localhost:${PORT}/api/transactions/:id - Delete Transaction\n`);

  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('⚠️  ANTHROPIC_API_KEY is not set — AI recommendations will use a fallback, NOT real Claude reasoning.\n');
  }
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${PORT} is already in use.`);
    console.error(`   Another instance of this server (or something else) is already running.`);
    console.error(`   Fix it with one of these:`);
    console.error(`   1. Find and stop the old process:`);
    console.error(`      Windows:  netstat -ano | findstr :${PORT}   then   taskkill /PID <pid> /F`);
    console.error(`      Mac/Linux: lsof -i :${PORT}                 then   kill -9 <pid>`);
    console.error(`   2. Or run on a different port:  PORT=5001 npm start`);
    console.error(`      (if you do this, also update client/vite.config.js proxy target to match)\n`);
    process.exit(1);
  } else {
    console.error('Server failed to start:', err);
    process.exit(1);
  }
});
