import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import {
  createPaymentIntent,
  retrievePaymentIntent,
  constructWebhookEvent,
} from '../services/stripeService.js';
import { competitions } from '../index.js';

const router = Router();

// Stricter rate limit for payment endpoints
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many payment requests, please try again later.' },
});

/**
 * POST /api/payments/create-payment-intent
 * Creates a Stripe PaymentIntent for a competition entry.
 */
router.post(
  '/create-payment-intent',
  paymentLimiter,
  async (req: Request, res: Response) => {
    try {
      const { competitionId, quantity } = req.body;

      if (!competitionId || !quantity) {
        return res.status(400).json({ error: 'competitionId and quantity are required.' });
      }

      const qty = Number(quantity);
      const compId = Number(competitionId);

      if (!Number.isInteger(qty) || qty < 1 || qty > 1000) {
        return res.status(400).json({ error: 'quantity must be an integer between 1 and 1000.' });
      }

      if (!Number.isInteger(compId) || compId < 1) {
        return res.status(400).json({ error: 'competitionId must be a positive integer.' });
      }

      const competition = competitions.find(c => c.id === compId);
      if (!competition) {
        return res.status(404).json({ error: 'Competition not found.' });
      }

      if (competition.status === 'coming-soon') {
        return res.status(400).json({ error: 'This competition is not yet open for entries.' });
      }

      // Stripe amounts are in the smallest currency unit (pence for GBP)
      const amountInPence = Math.round(competition.entryPrice * qty * 100);

      const result = await createPaymentIntent({
        amount: amountInPence,
        currency: competition.currency,
        competitionId: compId,
        quantity: qty,
      });

      console.log(`[payments] PaymentIntent created: ${result.paymentIntentId} for competition ${compId}, qty ${qty}`);

      return res.json({
        clientSecret: result.clientSecret,
        paymentIntentId: result.paymentIntentId,
        amount: result.amount,
        currency: result.currency,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      console.error('[payments] create-payment-intent error:', message);
      return res.status(500).json({ error: message });
    }
  }
);

/**
 * POST /api/payments/webhook
 * Handle Stripe webhook events.
 * Requires raw body (express.raw middleware applied at mount point).
 */
router.post('/webhook', async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('[payments] STRIPE_WEBHOOK_SECRET is not configured');
    return res.status(500).json({ error: 'Webhook secret not configured.' });
  }

  if (!signature || typeof signature !== 'string') {
    return res.status(400).json({ error: 'Missing stripe-signature header.' });
  }

  let event;
  try {
    event = constructWebhookEvent(req.body as Buffer, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Webhook signature verification failed';
    console.error('[payments] Webhook verification failed:', message);
    return res.status(400).json({ error: `Webhook Error: ${message}` });
  }

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object;
      console.log(`[payments] PaymentIntent succeeded: ${paymentIntent.id}`, {
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        metadata: paymentIntent.metadata,
      });
      // TODO: Persist transaction record in database and fulfil competition entry
      break;
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object;
      const failureMessage = paymentIntent.last_payment_error?.message ?? 'Unknown error';
      console.warn(`[payments] PaymentIntent failed: ${paymentIntent.id} – ${failureMessage}`);
      // TODO: Update transaction status in database
      break;
    }

    default:
      console.log(`[payments] Unhandled event type: ${event.type}`);
  }

  return res.json({ received: true });
});

/**
 * GET /api/payments/transaction/:id
 * Retrieve Stripe PaymentIntent details by ID.
 */
router.get('/transaction/:id', paymentLimiter, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || !/^pi_[a-zA-Z0-9_]+$/.test(id)) {
      return res.status(400).json({ error: 'Invalid payment intent ID format.' });
    }

    const paymentIntent = await retrievePaymentIntent(id);

    return res.json({
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      metadata: paymentIntent.metadata,
      created: paymentIntent.created,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to retrieve transaction.';
    console.error('[payments] transaction retrieve error:', message);
    return res.status(500).json({ error: message });
  }
});

export default router;
