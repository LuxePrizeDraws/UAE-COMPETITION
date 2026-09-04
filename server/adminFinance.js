function inSameUtcDay(a, b) {
  return a.getUTCFullYear() === b.getUTCFullYear()
    && a.getUTCMonth() === b.getUTCMonth()
    && a.getUTCDate() === b.getUTCDate();
}

function daysAgo(now, days) {
  return new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
}

export function toMoney(value) {
  return Number(value.toFixed(2));
}

export function computeOwnerFinancialSummary(entries, ownerProfitShare, now = new Date()) {
  const validShare = Number.isFinite(ownerProfitShare) && ownerProfitShare > 0 && ownerProfitShare < 1
    ? ownerProfitShare
    : 0.4;
  const publicShare = 1 - validShare;

  const todayEntries = entries.filter((entry) => inSameUtcDay(entry.timestamp, now));
  const weekCutoff = daysAgo(now, 7);
  const monthCutoff = daysAgo(now, 30);

  const weeklyRevenue = entries
    .filter((entry) => entry.timestamp >= weekCutoff)
    .reduce((sum, entry) => sum + entry.amount, 0);

  const monthlyRevenue = entries
    .filter((entry) => entry.timestamp >= monthCutoff)
    .reduce((sum, entry) => sum + entry.amount, 0);

  const todaysRevenue = todayEntries.reduce((sum, entry) => sum + entry.amount, 0);

  return {
    todaysEntries: todayEntries.length,
    todaysRevenue: toMoney(todaysRevenue),
    todaysOwnerProfit: toMoney(todaysRevenue * validShare),
    publicRingFencedToday: toMoney(todaysRevenue * publicShare),
    weeklyOwnerProfit: toMoney(weeklyRevenue * validShare),
    monthlyOwnerProfit: toMoney(monthlyRevenue * validShare),
    yearlyProjection: toMoney(monthlyRevenue * validShare * 12),
  };
}

export function createWithdrawal(ledger, amount) {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('Invalid withdrawal amount');
  }

  if (amount > ledger.availableToWithdraw) {
    throw new Error('Insufficient available balance');
  }

  return {
    availableToWithdraw: toMoney(ledger.availableToWithdraw - amount),
    pendingWithdrawal: toMoney(ledger.pendingWithdrawal),
    totalWithdrawn: toMoney(ledger.totalWithdrawn + amount),
  };
}
