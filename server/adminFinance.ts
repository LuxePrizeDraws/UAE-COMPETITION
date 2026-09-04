export interface EntryEvent {
  amount: number;
  timestamp: Date;
}

export interface OwnerLedger {
  availableToWithdraw: number;
  pendingWithdrawal: number;
  totalWithdrawn: number;
}

export interface OwnerFinancialSummary {
  todaysEntries: number;
  todaysRevenue: number;
  todaysOwnerProfit: number;
  publicRingFencedToday: number;
  weeklyOwnerProfit: number;
  monthlyOwnerProfit: number;
  yearlyProjection: number;
}

function inSameUtcDay(a: Date, b: Date): boolean {
  return (
    a.getUTCFullYear() === b.getUTCFullYear()
    && a.getUTCMonth() === b.getUTCMonth()
    && a.getUTCDate() === b.getUTCDate()
  );
}

function daysAgo(now: Date, days: number): Date {
  return new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
}

export function toMoney(value: number): number {
  return Number(value.toFixed(2));
}

export function computeOwnerFinancialSummary(
  entries: EntryEvent[],
  ownerProfitShare: number,
  now = new Date(),
): OwnerFinancialSummary {
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
  const todaysOwnerProfit = todaysRevenue * validShare;
  const publicRingFencedToday = todaysRevenue * publicShare;
  const weeklyOwnerProfit = weeklyRevenue * validShare;
  const monthlyOwnerProfit = monthlyRevenue * validShare;
  const yearlyProjection = monthlyOwnerProfit * 12;

  return {
    todaysEntries: todayEntries.length,
    todaysRevenue: toMoney(todaysRevenue),
    todaysOwnerProfit: toMoney(todaysOwnerProfit),
    publicRingFencedToday: toMoney(publicRingFencedToday),
    weeklyOwnerProfit: toMoney(weeklyOwnerProfit),
    monthlyOwnerProfit: toMoney(monthlyOwnerProfit),
    yearlyProjection: toMoney(yearlyProjection),
  };
}

export function createWithdrawal(
  ledger: OwnerLedger,
  amount: number,
): OwnerLedger {
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
