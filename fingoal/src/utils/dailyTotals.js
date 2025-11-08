// utils/dailyTotals.js
// transactions: [{ _id, date, amount, type: 'income'|'outcome'|'expense', ... }]
// 'outcome' and 'expense' are treated the same.

export function dailyTotalsForMonth(transactions, year, monthIndex /* 0-11 */) {
    const start = new Date(year, monthIndex, 1);
    const end   = new Date(year, monthIndex + 1, 0);
    const daysInMonth = end.getDate();
  
    const byDay = Array.from({ length: daysInMonth }, () => ({ income: 0, outcome: 0 }));
  
    for (const t of transactions || []) {
      const d = new Date(t.date);
      if (d.getFullYear() !== year || d.getMonth() !== monthIndex) continue;
  
      const dayIdx = d.getDate() - 1;
      const amt = Number(t.amount) || 0;
  
      if ((t.type || '').toLowerCase() === 'income') {
        byDay[dayIdx].income += Math.abs(amt);
      } else {
        // treat outcome/expense/negative as spending
        byDay[dayIdx].outcome += Math.abs(amt);
      }
    }
  
    return byDay; // [{income: number, outcome: number}, ...] length = days in month
  }
  
  export function monthTotals(byDay) {
    return byDay.reduce(
      (acc, d) => ({ income: acc.income + d.income, outcome: acc.outcome + d.outcome }),
      { income: 0, outcome: 0 }
    );
  }
  