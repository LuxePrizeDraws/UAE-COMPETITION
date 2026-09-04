import express, { type Express, type Request, type Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { randomUUID } from 'node:crypto';
import { createDatabaseClient } from './db.js';

dotenv.config();

type PaymentStatus = 'authorized' | 'failed';

interface PaymentResult {
  status: PaymentStatus;
  transactionId: string;
  provider: string;
  reason?: string;
}

interface PaymentGateway {
  charge: (params: {
    amount: number;
    currency: string;
    idempotencyKey: string;
    metadata: Record<string, string>;
  }) => Promise<PaymentResult>;
}

const PAYMENT_PROVIDER = (process.env.PAYMENT_PROVIDER || 'modular').toLowerCase();

function parseList(value: string | undefined): string[] {
  return (value ?? '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function getCorsOrigins(): Set<string> {
  const configured = parseList(process.env.CORS_ORIGINS);
  if (process.env.CLIENT_URL) configured.push(process.env.CLIENT_URL.toLowerCase());
  return new Set(configured);
}

function createCorsOriginValidator(origins: Set<string>) {
  return (origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) => {
    if (!origin) return callback(null, true);
    const normalizedOrigin = origin.toLowerCase();
    const isAllowed =
      origins.has(normalizedOrigin) ||
      normalizedOrigin.startsWith('http://localhost:') ||
      normalizedOrigin.endsWith('.app.github.dev');

    if (!isAllowed) {
      return callback(new Error('CORS origin denied'));
    }
    return callback(null, true);
  };
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function buildSupportiveReply(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('panic') || lower.includes('anxious') || lower.includes('anxiety')) {
    return 'Thank you for sharing that. Try a slow breathing cycle (inhale 4s, hold 4s, exhale 6s) for two minutes. If you want, I can help you prepare a support-worker handoff note now.';
  }
  if (lower.includes('sad') || lower.includes('depressed') || lower.includes('hopeless')) {
    return 'I hear you, and you are not alone. A small next step can help: drink water, sit somewhere safe, and message one trusted person. If this feels urgent, please request a support worker below.';
  }
  return 'Thanks for sharing this. I can offer supportive guidance and connect you to a support worker. If there is immediate danger, contact local emergency services right now.';
}

function createPaymentGateway(): PaymentGateway {
  return {
    async charge({ amount, currency, idempotencyKey }) {
      if (!Number.isFinite(amount) || amount <= 0) {
        return {
          status: 'failed',
          transactionId: `txn_${randomUUID()}`,
          provider: PAYMENT_PROVIDER,
          reason: 'Invalid amount',
        };
      }

      const baseRef = `txn_${idempotencyKey.replace(/[^a-zA-Z0-9]/g, '').slice(0, 18)}`;
      return {
        status: 'authorized',
        transactionId: baseRef || `txn_${randomUUID()}`,
        provider: PAYMENT_PROVIDER,
      };
    },
  };
}

export function createApp(options: { databaseUrl?: string; paymentGateway?: PaymentGateway } = {}): Express {
  const app: Express = express();
  const db = createDatabaseClient(options.databaseUrl);
  const paymentGateway = options.paymentGateway ?? createPaymentGateway();
  const allowedTournamentSlugs = parseList(process.env.ENABLED_TOURNAMENTS || 'chess,connect4');

  app.use(helmet());
  app.use(morgan('combined'));
  app.use(
    cors({
      origin: createCorsOriginValidator(getCorsOrigins()),
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 900000);
  const max = Number(process.env.RATE_LIMIT_MAX ?? 100);
  app.use(
    rateLimit({
      windowMs: Number.isFinite(windowMs) && windowMs > 0 ? windowMs : 900000,
      max: Number.isFinite(max) && max > 0 ? max : 100,
      message: 'Too many requests from this IP',
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', message: 'UAE Competition API is running', uptimeSeconds: process.uptime() });
  });

  app.get('/api/competitions', (_req: Request, res: Response) => {
    res.json(db.getCompetitions());
  });

  app.get('/api/competitions/:id', (req: Request, res: Response) => {
    const competitionId = Number.parseInt(req.params.id, 10);
    if (!Number.isInteger(competitionId) || competitionId < 1) {
      return res.status(400).json({ error: 'Invalid competition id' });
    }

    const competition = db.getCompetitionById(competitionId);
    if (!competition) {
      return res.status(404).json({ error: 'Competition not found' });
    }

    return res.json(competition);
  });

  app.post('/api/competitions/:id/enter', async (req: Request, res: Response) => {
    const competitionId = Number.parseInt(req.params.id, 10);
    if (!Number.isInteger(competitionId) || competitionId < 1) {
      return res.status(400).json({ error: 'Invalid competition id' });
    }

    const idempotencyKey = String(req.header('Idempotency-Key') || '').trim();
    if (!idempotencyKey || idempotencyKey.length < 8 || idempotencyKey.length > 128) {
      return res.status(400).json({ error: 'Idempotency-Key header is required (8-128 chars)' });
    }

    const routeKey = `/api/competitions/${competitionId}/enter`;
    const previous = db.getIdempotencyRecord(idempotencyKey, routeKey);
    if (previous) {
      return res.status(previous.status_code).json(JSON.parse(previous.response_json));
    }

    const competition = db.getCompetitionById(competitionId);
    if (!competition) {
      return res.status(404).json({ error: 'Competition not found' });
    }

    const quantity = Number(req.body?.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
      return res.status(400).json({ error: 'Invalid quantity. Use an integer between 1 and 100.' });
    }

    if (req.body?.termsAccepted !== true) {
      return res.status(400).json({ error: 'Terms acceptance is required.' });
    }

    const incomingPrizeOption = String(req.body?.prizeOption ?? req.body?.prizeChoice ?? 'physical');
    const prizeChoice = incomingPrizeOption === 'cash' ? 'cash' : 'physical';
    const totalCost = Number((quantity * competition.entryPrice).toFixed(2));

    const paymentAttempt = await paymentGateway.charge({
      amount: totalCost,
      currency: competition.prizeDetails?.currency || 'AED',
      idempotencyKey,
      metadata: {
        competitionId: String(competition.id),
        quantity: String(quantity),
      },
    });

    if (paymentAttempt.status !== 'authorized') {
      const failedResponse = {
        success: false,
        error: paymentAttempt.reason || 'Payment was not authorized',
        paymentStatus: paymentAttempt.status,
      };
      db.saveIdempotencyRecord({ key: idempotencyKey, route: routeKey, statusCode: 402, response: failedResponse });
      return res.status(402).json(failedResponse);
    }

    const entryId = `entry_${randomUUID()}`;
    const entryNumbers = Array.from({ length: quantity }, () => `${competition.id}-${randomUUID().slice(0, 8).toUpperCase()}`);
    const auditEvents = [
      {
        id: `audit_${randomUUID()}`,
        event: 'payment_initiated',
        details: { provider: paymentAttempt.provider, amount: totalCost, currency: competition.prizeDetails?.currency || 'AED' },
      },
      {
        id: `audit_${randomUUID()}`,
        event: 'payment_authorized',
        details: { transactionId: paymentAttempt.transactionId },
      },
      {
        id: `audit_${randomUUID()}`,
        event: 'entry_confirmed',
        details: { quantity, prizeChoice },
      },
    ];

    try {
      const result = db.createCompetitionEntry({
        entryId,
        competitionId,
        quantity,
        totalCost,
        currency: competition.prizeDetails?.currency || 'AED',
        prizeChoice,
        termsAccepted: true,
        entryNumbers,
        paymentStatus: 'authorized',
        paymentReference: paymentAttempt.transactionId,
        idempotencyKey,
        auditEvents,
      });

      const responseBody = {
        success: true,
        message: 'Entry processed and payment authorized',
        entryId,
        competitionId: competition.id,
        competitionTitle: competition.title,
        quantity,
        totalCost,
        currency: competition.prizeDetails?.currency || 'AED',
        prizeChoice,
        entryNumbers,
        drawReadyPercent: Number(((result.competition.soldEntries / result.competition.totalEntries) * 100).toFixed(2)),
        endsIn: competition.endsIn,
        payment: {
          provider: paymentAttempt.provider,
          transactionId: paymentAttempt.transactionId,
          status: paymentAttempt.status,
        },
      };

      db.saveIdempotencyRecord({ key: idempotencyKey, route: routeKey, statusCode: 200, response: responseBody });
      return res.json(responseBody);
    } catch (error) {
      const code = (error as { code?: string }).code;
      if (code === 'INSUFFICIENT_ENTRIES') {
        return res.status(409).json({ error: 'Not enough entries remaining for that quantity.' });
      }
      if (code === 'IDEMPOTENCY_COLLISION') {
        const fallback = db.getIdempotencyRecord(idempotencyKey, routeKey);
        if (fallback) {
          return res.status(fallback.status_code).json(JSON.parse(fallback.response_json));
        }
      }
      return res.status(500).json({ error: 'Failed to process entry' });
    }
  });

  app.get('/api/entries/:entryId/audit', (req: Request, res: Response) => {
    const entryId = String(req.params.entryId || '');
    if (!entryId) return res.status(400).json({ error: 'Invalid entry id' });
    const audit = db.listPaymentAuditByEntryId(entryId);
    return res.json({ entryId, audit });
  });

  app.get('/api/tournaments', (_req: Request, res: Response) => {
    return res.json(db.getTournaments(allowedTournamentSlugs));
  });

  app.get('/api/tournaments/:slug', (req: Request, res: Response) => {
    const slug = String(req.params.slug || '').toLowerCase();
    if (!allowedTournamentSlugs.includes(slug)) {
      return res.status(404).json({ error: 'Tournament not available' });
    }
    const tournament = db.getTournamentBySlug(slug);
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }
    return res.json(tournament);
  });

  app.post('/api/tournaments/:slug/register', (req: Request, res: Response) => {
    const slug = String(req.params.slug || '').toLowerCase();
    if (!allowedTournamentSlugs.includes(slug)) {
      return res.status(404).json({ error: 'Tournament not available' });
    }

    const name = String(req.body?.name || '').trim();
    const email = String(req.body?.email || '').trim().toLowerCase();
    const termsAccepted = req.body?.termsAccepted === true;

    if (name.length < 2) return res.status(400).json({ error: 'Name must be at least 2 characters.' });
    if (!isValidEmail(email)) return res.status(400).json({ error: 'Invalid email address.' });
    if (!termsAccepted) return res.status(400).json({ error: 'Terms acceptance is required.' });

    const registrationId = `reg_${randomUUID()}`;
    try {
      db.registerTournamentPlayer({ registrationId, slug, name, email, termsAccepted: true });
    } catch (error) {
      const code = (error as { code?: string }).code;
      if (code === 'TOURNAMENT_FULL') return res.status(409).json({ error: 'Tournament is full.' });
      if (code === 'TOURNAMENT_NOT_FOUND') return res.status(404).json({ error: 'Tournament not found.' });
      return res.status(500).json({ error: 'Could not complete registration.' });
    }

    return res.status(201).json({
      success: true,
      message: 'Tournament registration confirmed.',
      registrationId,
    });
  });

  app.post('/api/mental-health/chat', async (req: Request, res: Response) => {
    const message = String(req.body?.message || '').trim();
    if (!message) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const mode = (process.env.MENTAL_HEALTH_AI_MODE || 'mock').toLowerCase();
    const endpoint = process.env.MENTAL_HEALTH_AI_ENDPOINT;
    const apiKey = process.env.MENTAL_HEALTH_AI_API_KEY;

    if (mode === 'live' && endpoint && apiKey) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
          },
          body: JSON.stringify({ message, history: req.body?.history ?? [] }),
        });

        if (response.ok) {
          const payload = (await response.json()) as { reply?: string };
          if (payload.reply) {
            return res.json({ reply: payload.reply, source: 'live' });
          }
        }
      } catch {
        // fallback to mock response below
      }
    }

    return res.json({ reply: buildSupportiveReply(message), source: 'mock' });
  });

  app.post('/api/support-worker-requests', (req: Request, res: Response) => {
    const name = String(req.body?.name || '').trim();
    const email = String(req.body?.email || '').trim().toLowerCase();
    const reason = String(req.body?.reason || '').trim();
    const preferredContact = String(req.body?.preferredContact || 'email').trim().toLowerCase();
    const urgent = req.body?.urgent === true;

    if (name.length < 2) return res.status(400).json({ error: 'Name must be at least 2 characters.' });
    if (!isValidEmail(email)) return res.status(400).json({ error: 'Invalid email address.' });
    if (reason.length < 10) return res.status(400).json({ error: 'Please provide at least 10 characters for reason.' });

    const ticketId = `sw_${randomUUID()}`;
    db.createSupportWorkerRequest({ id: ticketId, name, email, reason, preferredContact, urgent });
    return res.status(201).json({ success: true, ticketId });
  });

  app.post('/api/charity/checkout', (req: Request, res: Response) => {
    const amount = Number(req.body?.amount ?? 0);
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than zero.' });
    }

    const configuredCheckoutUrl = process.env.STRIPE_CHECKOUT_URL;
    if (configuredCheckoutUrl) {
      return res.json({ success: true, mode: 'stripe', checkoutUrl: configuredCheckoutUrl });
    }

    return res.json({
      success: true,
      mode: 'demo',
      checkoutUrl: `https://demo-checkout.local/session/${randomUUID()}`,
    });
  });

  app.get('/', (_req: Request, res: Response) => {
    res.json({ message: 'UAE Competition Platform API', version: '2.0.0' });
  });

  return app;
}
