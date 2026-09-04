import { describe, expect, it } from 'vitest';
import { AutomatedPayoutService } from './payoutService.js';

function createNow(start = '2026-08-31T20:00:00.000Z') {
  let tick = 0;
  const base = new Date(start).getTime();
  return () => new Date(base + tick++ * 1000);
}

describe('AutomatedPayoutService', () => {
  it('completes payouts and issues winner notifications/certificates', () => {
    const service = new AutomatedPayoutService({ now: createNow() });
    service.registerWinnerPayoutMethod({
      userId: 'user-1',
      primaryMethod: 'bank',
      destinations: { bank: 'GB11BARC1234567890' },
      verified: true,
      autoPayoutEnabled: true,
      status: 'active',
    });

    const result = service.completeDrawAndPayout({
      drawId: 'draw-1',
      winners: [{ drawWinnerId: 'winner-1', userId: 'user-1', prizeAmount: 1500, prizeTier: 1 }],
      ringFencedAccount: { id: 'rf-1', balance: 3500 },
      insurancePolicy: { id: 'ins-1', active: true, coverageAmount: 35000 },
    });

    expect(result.payouts).toHaveLength(1);
    expect(result.payouts[0].status).toBe('completed');
    expect(result.payouts[0].winnerNotified).toBe(true);
    expect(result.payouts[0].emailSent).toBe(true);
    expect(result.payouts[0].smsSent).toBe(true);
    expect(result.payouts[0].inAppNotificationSent).toBe(true);
    expect(result.payouts[0].certificateIssued).toBe(true);
    expect(result.ringFenced.balanceAfter).toBe(2000);
  });

  it('retries transient processor failures with exponential backoff', () => {
    let calls = 0;
    const service = new AutomatedPayoutService({
      now: createNow(),
      processPayout: () => {
        calls += 1;
        if (calls < 3) {
          return {
            success: false,
            processor: 'stripe',
            errorCode: 'TIMEOUT',
            errorMessage: 'Processor timeout',
            transient: true,
          };
        }
        return {
          success: true,
          processor: 'stripe',
          referenceId: 'batch_ok',
          transactionId: 'txn_ok',
          responseCode: 'ACCEPTED',
        };
      },
    });

    service.registerWinnerPayoutMethod({
      userId: 'user-2',
      primaryMethod: 'bank',
      destinations: { bank: 'GB22BARC1234567890' },
      verified: true,
      autoPayoutEnabled: true,
      status: 'active',
    });

    const payout = service.completeDrawAndPayout({
      drawId: 'draw-2',
      winners: [{ drawWinnerId: 'winner-2', userId: 'user-2', prizeAmount: 750 }],
      ringFencedAccount: { id: 'rf-2', balance: 1000 },
    }).payouts[0];

    expect(payout.status).toBe('completed');
    expect(payout.retryCount).toBe(2);
    expect(payout.nextRetryTimestamp).toContain('2026-08-31T20:');
  });

  it('falls back to an alternative payout method when primary fails permanently', () => {
    const service = new AutomatedPayoutService({
      now: createNow(),
      processPayout: ({ method }) => {
        if (method === 'bank') {
          return {
            success: false,
            processor: 'stripe',
            errorCode: 'INVALID_ACCOUNT',
            errorMessage: 'Invalid bank account',
            transient: false,
          };
        }
        return {
          success: true,
          processor: 'wise',
          referenceId: 'wise_ref',
          transactionId: 'wise_txn',
          responseCode: 'ACCEPTED',
        };
      },
    });

    service.registerWinnerPayoutMethod({
      userId: 'user-3',
      primaryMethod: 'bank',
      destinations: { bank: 'invalid-account', wise: 'wise-acct-123' },
      verified: true,
      autoPayoutEnabled: true,
      status: 'active',
    });

    const payout = service.completeDrawAndPayout({
      drawId: 'draw-3',
      winners: [{ drawWinnerId: 'winner-3', userId: 'user-3', prizeAmount: 500 }],
      ringFencedAccount: { id: 'rf-3', balance: 800 },
    }).payouts[0];

    expect(payout.status).toBe('completed');
    expect(payout.payoutMethod).toBe('wise');
    expect(payout.errorCode).toBe('INVALID_ACCOUNT');
  });
});
