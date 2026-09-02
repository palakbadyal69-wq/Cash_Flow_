/**
 * Step 4.5: applyScenario
 * Applies a hypothetical adjustment to transactions/balance, WITHOUT mutating
 * the original data files. Returns adjusted transactions + balance for
 * re-running the existing pipeline.
 * 
 * @param {Array} transactions - Parsed original transactions
 * @param {number} currentBalance - Original cash balance
 * @param {string} scenarioType - 'revenue_drop_20' | 'hire_two_employees' | 'investment_2l'
 * @returns {Object} { adjustedTransactions, adjustedBalance }
 */
function applyScenario(transactions, currentBalance, scenarioType) {
  let adjustedTransactions = JSON.parse(JSON.stringify(transactions)); // deep clone, never mutate original
  let adjustedBalance = currentBalance;

  switch (scenarioType) {
    case 'revenue_drop_20':
      adjustedTransactions = adjustedTransactions.map((tx) =>
        tx.type === 'inflow' ? { ...tx, amount: Math.round(tx.amount * 0.8) } : tx
      );
      break;
    case 'hire_two_employees': {
      // Add a projected recurring payroll outflow for the current and next 2 months
      const today = new Date();
      for (let i = 0; i < 3; i++) {
        const d = new Date(today.getFullYear(), today.getMonth() + i, 15);
        adjustedTransactions.push({
          id: `scenario_hire_${i}`,
          date: d.toISOString().substring(0, 10),
          type: 'outflow',
          category: 'salary',
          amount: 160000,
          source: 'New Hires (Scenario)',
          status: 'paid',
          dueDate: null,
          notes: 'Projected: 2 new employee hires'
        });
      }
      break;
    }
    case 'investment_2l':
      adjustedBalance = currentBalance + 200000;
      adjustedTransactions.push({
        id: 'scenario_investment',
        date: new Date().toISOString().substring(0, 10),
        type: 'inflow',
        category: 'investment',
        amount: 200000,
        source: 'Scenario Investment',
        status: 'received',
        dueDate: null,
        notes: 'Projected ₹2L investment'
      });
      break;
    default:
      throw new Error(`Unknown scenario type: ${scenarioType}`);
  }

  console.log(`[Pipeline Scenario] applyScenario: Applied '${scenarioType}'. Adjusted Tx count: ${adjustedTransactions.length}, Adjusted Balance: ₹${adjustedBalance.toLocaleString('en-IN')}`);

  return { adjustedTransactions, adjustedBalance };
}

module.exports = applyScenario;
