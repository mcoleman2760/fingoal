// src/data/financeData.js
export const demoData = {
    September: {
      income: [
        { label: "Paycheck", amount: 4200 },
        { label: "Freelance", amount: 900 },
        { label: "Dividend", amount: 120 },
      ],
      outcome: [
        { label: "Rent", amount: 1800 },
        { label: "Groceries", amount: 460 },
        { label: "Dining Out", amount: 220 },
        { label: "Transport", amount: 140 },
        { label: "Subscriptions", amount: 65 },
        { label: "Other", amount: 120 },
      ],
    },
    October: {
      income: [
        { label: "Paycheck", amount: 4200 },
        { label: "Freelance", amount: 400 },
      ],
      outcome: [
        { label: "Rent", amount: 1800 },
        { label: "Groceries", amount: 520 },
        { label: "Dining Out", amount: 180 },
        { label: "Transport", amount: 150 },
        { label: "Subscriptions", amount: 65 },
      ],
    },
    November: {
      income: [
        { label: "Paycheck", amount: 4200 },
        { label: "Freelance", amount: 0 },
      ],
      outcome: [
        { label: "Rent", amount: 1800 },
        { label: "Groceries", amount: 480 },
        { label: "Dining Out", amount: 210 },
        { label: "Transport", amount: 130 },
        { label: "Subscriptions", amount: 65 },
      ],
    },
  };
  
  export const months = Object.keys(demoData);
  
  export function getNetForMonth(month) {
    const m = demoData[month] || { income: [], outcome: [] };
    const totalIncome = m.income.reduce((s, x) => s + x.amount, 0);
    const totalOutcome = m.outcome.reduce((s, x) => s + x.amount, 0);
    return totalIncome - totalOutcome; // income - outcome
  }
  