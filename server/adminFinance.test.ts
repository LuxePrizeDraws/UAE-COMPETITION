import { describe, expect, it } from 'vitest';
import { computeOwnerFinancialSummary, createWithdrawal } from './adminFinance';

describe('computeOwnerFinancialSummary', () => {
  it('calculates transparent owner/public totals by period', () => {
    const now = new Date('2026-09-04T12:00:00.000Z');
    const entries = [
      { amount: 10, timestamp: new Date('2026-09-04T01:00:00.000Z') },
      { amount: 5, timestamp: new Date('2026-09-04T03:00:00.000Z') },
      { amount: 20, timestamp: new Date('2026-09-02T03:00:00.000Z') },
      { amount: 15, timestamp: new Date('2026-08-15T03:00:00.000Z') },
    ];

    const result = computeOwnerFinancialSummary(entries, 0.4, now);

    expect(result.todaysEntries).toBe(2);
    expect(result.todaysRevenue).toBe(15);
    expect(result.todaysOwnerProfit).toBe(6);
    expect(result.publicRingFencedToday).toBe(9);
    expect(result.weeklyOwnerProfit).toBe(14);
    expect(result.monthlyOwnerProfit).toBe(20);
    expect(result.yearlyProjection).toBe(240);
  });
});

describe('createWithdrawal', () => {
  it('reduces available balance and increments withdrawn balance', () => {
    const ledger = {
      availableToWithdraw: 120,
      pendingWithdrawal: 0,
      totalWithdrawn: 10,
    };

    const updated = createWithdrawal(ledger, 20);

    expect(updated.availableToWithdraw).toBe(100);
    expect(updated.totalWithdrawn).toBe(30);
  });

  it('throws for insufficient balance', () => {
    expect(() => createWithdrawal({
      availableToWithdraw: 10,
      pendingWithdrawal: 0,
      totalWithdrawn: 0,
    }, 11)).toThrow('Insufficient available balance');
  });
});
