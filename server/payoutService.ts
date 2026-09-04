import { randomUUID } from 'crypto';

export type PayoutMethodType = 'bank' | 'paypal' | 'stripe' | 'wise' | 'applepay' | 'googlepay' | 'crypto' | 'check';
export const PAYOUT_METHOD_TYPES: PayoutMethodType[] = ['bank', 'paypal', 'stripe', 'wise', 'applepay', 'googlepay', 'crypto', 'check'];
type PayoutProcessor = 'stripe' | 'paypal' | 'wise' | 'bank' | 'crypto';
type PayoutStatus = 'pending' | 'initiated' | 'submitted' | 'processing' | 'completed' | 'failed' | 'retry_scheduled' | 'manual_intervention';

export interface WinnerPayoutMethod {
  id: string;
  userId: string;
  primaryMethod: PayoutMethodType;
  destinations: Partial<Record<PayoutMethodType, string>>;
  paypalVerified?: boolean;
  stripeConnected?: boolean;
  verified: boolean;
  autoPayoutEnabled: boolean;
  preferredCurrency?: string;
  status: 'active' | 'inactive' | 'expired' | 'deleted';
  usageCount: number;
  totalAmountReceived: number;
  createdAt: string;
  updatedAt: string;
}

export interface DrawWinnerInput {
  drawWinnerId: string;
  userId: string;
  prizeAmount: number;
  prizeCurrency?: string;
  prizeDescription?: string;
  prizeTier?: number;
}

export interface RingFencedAccountInput {
  id: string;
  balance: number;
  reservePercent?: number;
}

export interface InsurancePolicyInput {
  id: string;
  active: boolean;
  coverageAmount: number;
}

export interface AutomatedPayout {
  id: string;
  drawId: string;
  drawWinnerId: string;
  userId: string;
  prizeAmount: number;
  prizeCurrency: string;
  prizeDescription?: string;
  prizeTier?: number;
  payoutMethodId?: string;
  payoutMethod?: PayoutMethodType;
  payoutDestination?: string;
  payoutDestinationVerified: boolean;
  drawCompletedTimestamp: string;
  payoutInitiatedTimestamp: string;
  payoutProcessorSubmittedTimestamp?: string;
  payoutProcessingTimestamp?: string;
  payoutCompletedTimestamp?: string;
  payoutProcessor?: PayoutProcessor;
  processorReferenceId?: string;
  transactionId?: string;
  processorResponseCode?: string;
  processorFee?: number;
  status: PayoutStatus;
  ringFencedAccountId: string;
  ringFencedVerified: boolean;
  ringFencedDeductionAmount: number;
  ringFencedBalanceBefore: number;
  ringFencedBalanceAfter: number;
  insurancePolicyId?: string;
  insuranceBacked: boolean;
  insuranceVerificationTimestamp?: string;
  fraudCheckPassed: boolean;
  fraudCheckTimestamp: string;
  fraudCheckDetails: string;
  kycVerified: boolean;
  amlVerified: boolean;
  retryCount: number;
  maxRetries: number;
  nextRetryTimestamp?: string;
  retryReason?: string;
  errorMessage?: string;
  errorCode?: string;
  winnerNotified: boolean;
  winnerNotifiedTimestamp?: string;
  winnerConfirmedReceipt: boolean;
  emailSent: boolean;
  smsSent: boolean;
  inAppNotificationSent: boolean;
  certificateIssued: boolean;
  certificateIssuedTimestamp?: string;
  certificateFilePath?: string;
  settlementExpectedDate?: string;
  processingTimeMs?: number;
  createdAt: string;
  updatedAt: string;
}

interface AuditTrail {
  id: string;
  automatedPayoutId: string;
  timestamp: string;
  action: string;
  statusBefore: PayoutStatus;
  statusAfter: PayoutStatus;
  details: string;
  processorName?: string;
  processorResponseCode?: string;
  processorErrorCode?: string;
  processorErrorMessage?: string;
}

interface RecoveryRecord {
  id: string;
  automatedPayoutId: string;
  failureTimestamp: string;
  failureReason: string;
  failureCode?: string;
  finalStatus: 'recovered' | 'manual_intervention_required';
  manualInterventionRequired: boolean;
  alternativePayoutMethod?: PayoutMethodType;
  compensationAmount?: number;
  updatedAt: string;
}

interface Batch {
  id: string;
  drawId: string;
  totalWinners: number;
  totalPayoutAmount: number;
  batchCreatedTimestamp: string;
  batchSubmittedTimestamp?: string;
  batchCompletedTimestamp?: string;
  successfulPayouts: number;
  failedPayouts: number;
  retryPayouts: number;
  status: 'created' | 'submitted' | 'processing' | 'completed' | 'partially_failed' | 'failed';
}

interface ProcessorResult {
  success: boolean;
  processor: PayoutProcessor;
  referenceId?: string;
  transactionId?: string;
  responseCode?: string;
  fee?: number;
  expectedSettlementHours?: number;
  errorCode?: string;
  errorMessage?: string;
  transient?: boolean;
}

interface ProcessContext {
  payoutId: string;
  userId: string;
  amount: number;
  method: PayoutMethodType;
  destination: string;
  attempt: number;
}

interface PayoutDependencies {
  now?: () => Date;
  processPayout?: (ctx: ProcessContext) => ProcessorResult;
  runFraudCheck?: (winner: DrawWinnerInput) => { score: number; passed: boolean; details?: string };
}

const METHOD_PROCESSOR: Record<PayoutMethodType, PayoutProcessor> = {
  bank: 'stripe',
  paypal: 'paypal',
  stripe: 'stripe',
  wise: 'wise',
  applepay: 'stripe',
  googlepay: 'stripe',
  crypto: 'crypto',
  check: 'bank',
};

const METHOD_SETTLEMENT_HOURS: Record<PayoutMethodType, number> = {
  bank: 24,
  paypal: 1,
  stripe: 24,
  wise: 4,
  applepay: 1,
  googlepay: 1,
  crypto: 1,
  check: 72,
};

function maskDestination(destination: string): string {
  if (destination.length <= 4) return '****';
  return `${'*'.repeat(Math.max(destination.length - 4, 4))}${destination.slice(-4)}`;
}

function plusSeconds(date: Date, seconds: number): string {
  return new Date(date.getTime() + seconds * 1000).toISOString();
}

function plusHoursDate(date: Date, hours: number): string {
  const d = new Date(date.getTime() + hours * 60 * 60 * 1000);
  return d.toISOString().slice(0, 10);
}

export class AutomatedPayoutService {
  private payoutMethods = new Map<string, WinnerPayoutMethod>();
  private payouts = new Map<string, AutomatedPayout>();
  private auditTrails = new Map<string, AuditTrail[]>();
  private recoveries = new Map<string, RecoveryRecord>();
  private batches = new Map<string, Batch>();
  private ringFencedBalances = new Map<string, number>();
  private now: () => Date;
  private processPayout: (ctx: ProcessContext) => ProcessorResult;
  private runFraudCheck: (winner: DrawWinnerInput) => { score: number; passed: boolean; details?: string };

  constructor(deps: PayoutDependencies = {}) {
    this.now = deps.now || (() => new Date());
    this.processPayout = deps.processPayout || ((ctx) => this.defaultProcessor(ctx));
    this.runFraudCheck = deps.runFraudCheck || (() => ({ score: 5, passed: true, details: 'External fraud screening passed' }));
  }

  registerWinnerPayoutMethod(input: Omit<WinnerPayoutMethod, 'id' | 'usageCount' | 'totalAmountReceived' | 'createdAt' | 'updatedAt'>): WinnerPayoutMethod {
    const now = this.now().toISOString();
    const existing = this.payoutMethods.get(input.userId);
    const method: WinnerPayoutMethod = {
      id: existing?.id || randomUUID(),
      usageCount: existing?.usageCount ?? 0,
      totalAmountReceived: existing?.totalAmountReceived ?? 0,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
      ...input,
      destinations: {
        ...(existing?.destinations || {}),
        ...(input.destinations || {}),
      },
    };
    this.payoutMethods.set(method.userId, method);
    return method;
  }

  completeDrawAndPayout(params: {
    drawId: string;
    winners: DrawWinnerInput[];
    ringFencedAccount: RingFencedAccountInput;
    insurancePolicy?: InsurancePolicyInput;
  }) {
    const startedAt = this.now();
    const drawCompletedTimestamp = startedAt.toISOString();
    const reservePercent = params.ringFencedAccount.reservePercent ?? 5;
    const totalPayout = params.winners.reduce((sum, winner) => sum + winner.prizeAmount, 0);
    let ringBalance = this.ringFencedBalances.get(params.ringFencedAccount.id) ?? params.ringFencedAccount.balance;

    if (ringBalance < totalPayout) {
      const gap = totalPayout - ringBalance;
      if (!params.insurancePolicy?.active || params.insurancePolicy.coverageAmount < gap) {
        throw new Error('Insufficient ring-fenced balance and insurance coverage unavailable');
      }
      ringBalance += gap;
    }

    const balanceBefore = ringBalance;
    ringBalance -= totalPayout;
    this.ringFencedBalances.set(params.ringFencedAccount.id, ringBalance);
    const reserveTarget = Math.max(0, ringBalance * (reservePercent / 100));

    const batchId = `batch_${params.drawId}_${this.now().getTime()}`;
    const batch: Batch = {
      id: batchId,
      drawId: params.drawId,
      totalWinners: params.winners.length,
      totalPayoutAmount: totalPayout,
      batchCreatedTimestamp: plusSeconds(startedAt, 1),
      successfulPayouts: 0,
      failedPayouts: 0,
      retryPayouts: 0,
      status: 'created',
    };
    this.batches.set(params.drawId, batch);

    let runningBalanceBeforeWinner = balanceBefore;
    const createdPayouts = params.winners.map((winner) => {
      const winnerBalanceBefore = runningBalanceBeforeWinner;
      runningBalanceBeforeWinner -= winner.prizeAmount;
      return this.processWinner({
        drawId: params.drawId,
        winner,
        drawCompletedTimestamp,
        ringFencedAccountId: params.ringFencedAccount.id,
        ringFencedBalanceBefore: winnerBalanceBefore,
        ringFencedBalanceAfter: runningBalanceBeforeWinner,
        ringFencedDeductionAmount: winner.prizeAmount,
        insurancePolicyId: params.insurancePolicy?.id,
        insuranceBacked: Boolean(params.insurancePolicy?.active),
      });
    });

    batch.batchSubmittedTimestamp = plusSeconds(startedAt, 3);
    batch.batchCompletedTimestamp = this.now().toISOString();
    batch.successfulPayouts = createdPayouts.filter((p) => p.status === 'completed').length;
    batch.failedPayouts = createdPayouts.filter((p) => p.status !== 'completed').length;
    batch.retryPayouts = createdPayouts.filter((p) => p.retryCount > 0).length;
    if (batch.successfulPayouts === batch.totalWinners) {
      batch.status = 'completed';
    } else if (batch.successfulPayouts === 0) {
      batch.status = 'failed';
    } else {
      batch.status = 'partially_failed';
    }

    return {
      drawId: params.drawId,
      drawCompletedTimestamp,
      payoutActivatedTimestamp: plusSeconds(startedAt, 0.5),
      reserveTarget,
      ringFenced: {
        accountId: params.ringFencedAccount.id,
        balanceBefore,
        totalPayout,
        balanceAfter: ringBalance,
      },
      batch,
      payouts: createdPayouts,
    };
  }

  getPayout(payoutId: string) {
    return this.payouts.get(payoutId);
  }

  getPayoutsByDraw(drawId: string) {
    return Array.from(this.payouts.values()).filter((p) => p.drawId === drawId);
  }

  getAuditTrail(payoutId: string) {
    return this.auditTrails.get(payoutId) ?? [];
  }

  getRecovery(payoutId: string) {
    return this.recoveries.get(payoutId);
  }

  getBatch(drawId: string) {
    return this.batches.get(drawId);
  }

  getDashboard(drawId: string) {
    const payouts = this.getPayoutsByDraw(drawId);
    const total = payouts.reduce((sum, p) => sum + p.prizeAmount, 0);
    const successful = payouts.filter((p) => p.status === 'completed').length;
    const failed = payouts.length - successful;
    const avgProcessingMs = payouts.length
      ? Math.round(payouts.reduce((sum, p) => sum + (p.processingTimeMs ?? 0), 0) / payouts.length)
      : 0;

    return {
      drawId,
      winners: payouts.length,
      successful,
      failed,
      pending: payouts.filter((p) => ['pending', 'initiated', 'submitted', 'processing', 'retry_scheduled'].includes(p.status)).length,
      successRate: payouts.length ? Number(((successful / payouts.length) * 100).toFixed(2)) : 0,
      totalPayoutAmount: total,
      averageProcessingTimeMs: avgProcessingMs,
      byMethod: payouts.reduce<Record<string, { count: number; amount: number }>>((acc, payout) => {
        const key = payout.payoutMethod || 'unknown';
        if (!acc[key]) acc[key] = { count: 0, amount: 0 };
        acc[key].count += 1;
        acc[key].amount += payout.prizeAmount;
        return acc;
      }, {}),
    };
  }

  private processWinner(params: {
    drawId: string;
    winner: DrawWinnerInput;
    drawCompletedTimestamp: string;
    ringFencedAccountId: string;
    ringFencedBalanceBefore: number;
    ringFencedBalanceAfter: number;
    ringFencedDeductionAmount: number;
    insurancePolicyId?: string;
    insuranceBacked: boolean;
  }): AutomatedPayout {
    const payoutMethodRecord = this.payoutMethods.get(params.winner.userId);
    if (!payoutMethodRecord || !payoutMethodRecord.verified || !payoutMethodRecord.autoPayoutEnabled || payoutMethodRecord.status !== 'active') {
      throw new Error(`Missing active verified payout method for user ${params.winner.userId}`);
    }

    const now = this.now();
    const payoutId = randomUUID();
    const fraudCheck = this.runFraudCheck(params.winner);
    const payout: AutomatedPayout = {
      id: payoutId,
      drawId: params.drawId,
      drawWinnerId: params.winner.drawWinnerId,
      userId: params.winner.userId,
      prizeAmount: params.winner.prizeAmount,
      prizeCurrency: params.winner.prizeCurrency || payoutMethodRecord.preferredCurrency || 'GBP',
      prizeDescription: params.winner.prizeDescription,
      prizeTier: params.winner.prizeTier,
      payoutMethodId: payoutMethodRecord.id,
      payoutDestinationVerified: true,
      drawCompletedTimestamp: params.drawCompletedTimestamp,
      payoutInitiatedTimestamp: plusSeconds(now, 1),
      status: 'initiated',
      ringFencedAccountId: params.ringFencedAccountId,
      ringFencedVerified: true,
      ringFencedDeductionAmount: params.ringFencedDeductionAmount,
      ringFencedBalanceBefore: params.ringFencedBalanceBefore,
      ringFencedBalanceAfter: params.ringFencedBalanceAfter,
      insurancePolicyId: params.insurancePolicyId,
      insuranceBacked: params.insuranceBacked,
      insuranceVerificationTimestamp: plusSeconds(now, 2),
      fraudCheckPassed: fraudCheck.passed,
      fraudCheckTimestamp: plusSeconds(now, 3),
      fraudCheckDetails: fraudCheck.details || `Fraud score ${fraudCheck.score}/100`,
      kycVerified: true,
      amlVerified: true,
      retryCount: 0,
      maxRetries: 3,
      winnerNotified: false,
      winnerConfirmedReceipt: false,
      emailSent: false,
      smsSent: false,
      inAppNotificationSent: false,
      certificateIssued: false,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    this.payouts.set(payout.id, payout);
    this.logAudit(payout.id, 'payout_initiated', 'pending', 'initiated', 'Automated payout initiated');
    this.tryMethods(payout, payoutMethodRecord);
    payoutMethodRecord.usageCount += 1;
    payoutMethodRecord.totalAmountReceived += payout.prizeAmount;
    payoutMethodRecord.updatedAt = this.now().toISOString();
    return payout;
  }

  private tryMethods(payout: AutomatedPayout, payoutMethodRecord: WinnerPayoutMethod) {
    const availableMethods = this.getAvailableMethods(payoutMethodRecord);
    const primaryMethod = payoutMethodRecord.primaryMethod;
    const orderedMethods = [primaryMethod, ...availableMethods.filter((m) => m !== primaryMethod)];
    let failedPrimary = false;

    for (const method of orderedMethods) {
      const destination = payoutMethodRecord.destinations[method];
      if (!destination) continue;
      const settled = this.executeWithRetries(payout, method, destination);
      if (settled) {
        if (failedPrimary && method !== primaryMethod) {
          this.recoveries.set(payout.id, {
            id: randomUUID(),
            automatedPayoutId: payout.id,
            failureTimestamp: this.now().toISOString(),
            failureReason: 'Primary payout method failed and was recovered with fallback method',
            failureCode: payout.errorCode,
            finalStatus: 'recovered',
            manualInterventionRequired: false,
            alternativePayoutMethod: method,
            updatedAt: this.now().toISOString(),
          });
        }
        return;
      }
      if (method === primaryMethod) {
        failedPrimary = true;
      }
    }

    payout.status = 'manual_intervention';
    payout.errorMessage = payout.errorMessage || 'All payout methods failed';
    payout.updatedAt = this.now().toISOString();
    this.logAudit(payout.id, 'manual_intervention', 'failed', 'manual_intervention', payout.errorMessage);

    this.recoveries.set(payout.id, {
      id: randomUUID(),
      automatedPayoutId: payout.id,
      failureTimestamp: this.now().toISOString(),
      failureReason: payout.errorMessage || 'Unknown payout failure',
      failureCode: payout.errorCode,
      finalStatus: 'manual_intervention_required',
      manualInterventionRequired: true,
      compensationAmount: Number((payout.prizeAmount * 0.1).toFixed(2)),
      updatedAt: this.now().toISOString(),
    });
  }

  private executeWithRetries(payout: AutomatedPayout, method: PayoutMethodType, destination: string): boolean {
    for (let attempt = 1; attempt <= payout.maxRetries + 1; attempt += 1) {
      const previousStatus = payout.status;
      const result = this.processPayout({
        payoutId: payout.id,
        userId: payout.userId,
        amount: payout.prizeAmount,
        method,
        destination,
        attempt,
      });

      payout.payoutMethod = method;
      payout.payoutDestination = maskDestination(destination);
      payout.payoutProcessor = result.processor;
      payout.payoutProcessorSubmittedTimestamp = plusSeconds(this.now(), 4);
      payout.payoutProcessingTimestamp = plusSeconds(this.now(), 5);
      payout.status = 'processing';
      this.logAudit(payout.id, 'processor_submitted', previousStatus, 'processing', `Submitted to ${result.processor}`, result);

      if (result.success) {
        const completedAt = this.now();
        payout.status = 'completed';
        payout.processorReferenceId = result.referenceId || `ref_${randomUUID().slice(0, 12)}`;
        payout.transactionId = result.transactionId || `txn_${randomUUID().slice(0, 12)}`;
        payout.processorResponseCode = result.responseCode || 'ACCEPTED';
        payout.processorFee = result.fee ?? Number((payout.prizeAmount * 0.015).toFixed(2));
        payout.payoutCompletedTimestamp = completedAt.toISOString();
        payout.settlementExpectedDate = plusHoursDate(completedAt, result.expectedSettlementHours ?? METHOD_SETTLEMENT_HOURS[method]);
        payout.processingTimeMs = completedAt.getTime() - new Date(payout.drawCompletedTimestamp).getTime();
        payout.winnerNotified = true;
        payout.winnerNotifiedTimestamp = plusSeconds(completedAt, 6);
        payout.emailSent = true;
        payout.smsSent = true;
        payout.inAppNotificationSent = true;
        payout.certificateIssued = true;
        payout.certificateIssuedTimestamp = plusSeconds(completedAt, 10);
        payout.certificateFilePath = `/certificates/${payout.drawId}/${payout.id}.pdf`;
        payout.updatedAt = completedAt.toISOString();
        this.logAudit(payout.id, 'completed', 'processing', 'completed', 'Payout completed', result);
        return true;
      }

      payout.errorCode = result.errorCode || 'PROCESSOR_ERROR';
      payout.errorMessage = result.errorMessage || 'Payout failed';
      payout.updatedAt = this.now().toISOString();

      if (attempt <= payout.maxRetries && result.transient === true) {
        payout.retryCount += 1;
        payout.status = 'retry_scheduled';
        const backoffSeconds = 30 * Math.pow(2, payout.retryCount - 1);
        payout.nextRetryTimestamp = plusSeconds(this.now(), backoffSeconds);
        payout.retryReason = payout.errorMessage;
        this.logAudit(payout.id, 'retry_scheduled', 'processing', 'retry_scheduled', `Retry ${payout.retryCount} scheduled in ${backoffSeconds}s`, result);
        continue;
      }

      payout.status = 'failed';
      this.logAudit(payout.id, 'failed', 'processing', 'failed', payout.errorMessage, result);
      return false;
    }

    return false;
  }

  private getAvailableMethods(record: WinnerPayoutMethod): PayoutMethodType[] {
    return (Object.keys(record.destinations) as PayoutMethodType[]).filter((m) => Boolean(record.destinations[m]));
  }

  private logAudit(
    payoutId: string,
    action: string,
    statusBefore: PayoutStatus,
    statusAfter: PayoutStatus,
    details: string,
    processorResult?: ProcessorResult,
  ) {
    const entries = this.auditTrails.get(payoutId) ?? [];
    entries.push({
      id: randomUUID(),
      automatedPayoutId: payoutId,
      timestamp: this.now().toISOString(),
      action,
      statusBefore,
      statusAfter,
      details,
      processorName: processorResult?.processor,
      processorResponseCode: processorResult?.responseCode,
      processorErrorCode: processorResult?.errorCode,
      processorErrorMessage: processorResult?.errorMessage,
    });
    this.auditTrails.set(payoutId, entries);
  }

  private defaultProcessor(ctx: ProcessContext): ProcessorResult {
    if (ctx.destination.includes('invalid')) {
      return {
        success: false,
        processor: METHOD_PROCESSOR[ctx.method],
        errorCode: 'INVALID_DESTINATION',
        errorMessage: 'Invalid payout destination',
        transient: false,
      };
    }

    return {
      success: true,
      processor: METHOD_PROCESSOR[ctx.method],
      referenceId: `batch_${randomUUID().slice(0, 12)}`,
      transactionId: `tx_${randomUUID().slice(0, 12)}`,
      responseCode: 'ACCEPTED',
      expectedSettlementHours: METHOD_SETTLEMENT_HOURS[ctx.method],
      fee: Number((ctx.amount * 0.01).toFixed(2)),
    };
  }
}
