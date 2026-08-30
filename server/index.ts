import express from 'express';
import type { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const PAYMENT_SETTLEMENT_ENTITY = process.env.PAYMENT_SETTLEMENT_ENTITY || 'GST LLC';
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_MODE = process.env.PAYPAL_MODE || 'sandbox';
const PAYPAL_BASE_URL = PAYPAL_MODE === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';

// Middleware
app.use(helmet());
app.use(morgan('combined'));
app.use(cors({
  origin: CLIENT_URL,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP',
});
app.use(limiter);

// 8 competitions data – transparent structure with cash alternatives
const competitions = [
  {
    id: 1,
    title: 'Weekly £10K Cash Draw',
    description: 'Guaranteed Winner – Fair Live Draw every week',
    prizeType: 'CASH COMPETITION',
    prizeAmount: 10000,
    currency: 'GBP',
    cashAlternative: true,
    cashAlternativeAmount: 10000,
    entryPrice: 1,
    totalEntries: 25000,
    soldEntries: 15625,
    drawReadyPercent: 62.5,
    endsIn: '2 days 14 hours 36 minutes',
    status: 'live',
    annualProfitPotential: 780000,
    tags: ['Guaranteed Winner', 'Fair Live Draw', 'Transparent Odds', 'Cash Alternative Available'],
    profitMargin: '40% House, 60% Prize Pool (Transparent)',
    expectedWinners: 1,
  },
  {
    id: 2,
    title: 'Luxury Experience Package OR £100K Cash',
    description: 'Ultimate luxury travel & lifestyle prize. Cash or prize – your choice.',
    prizeType: 'EXPERIENCE PACKAGE',
    prizeAmount: 100000,
    currency: 'GBP',
    cashAlternative: true,
    cashAlternativeAmount: 100000,
    entryPrice: 5,
    totalEntries: 72000,
    soldEntries: 45000,
    drawReadyPercent: 62.5,
    endsIn: '5 days 8 hours 12 minutes',
    status: 'live',
    annualProfitPotential: 1800000,
    prizeIncludes: ['5-star luxury resort stay', 'Business class flights', 'Yacht experience', 'Fine dining package'],
    tags: ['Luxury Experience', 'Fair Live Draw', 'Transparent Odds', 'Cash Alternative Available'],
    profitMargin: '40% House, 60% Prize Pool (Transparent)',
    expectedWinners: 1,
  },
  {
    id: 3,
    title: '£50K Monthly Cash Draw',
    description: 'Monthly cash prize draw. Win £50,000 or cash equivalent.',
    prizeType: 'CASH COMPETITION',
    prizeAmount: 50000,
    currency: 'GBP',
    cashAlternative: true,
    cashAlternativeAmount: 50000,
    entryPrice: 5,
    totalEntries: 90000,
    soldEntries: 56250,
    drawReadyPercent: 62.5,
    endsIn: '12 days 6 hours',
    status: 'live',
    annualProfitPotential: 900000,
    tags: ['Monthly Draw', 'Fair Live Draw', 'Transparent Odds', 'Cash Alternative Available'],
    profitMargin: '40% House, 60% Prize Pool (Transparent)',
    expectedWinners: 1,
  },
  {
    id: 4,
    title: '£500K Quarterly Cash Draw',
    description: 'Quarterly mega cash draw. Life-changing prize.',
    prizeType: 'CASH COMPETITION',
    prizeAmount: 500000,
    currency: 'GBP',
    cashAlternative: true,
    cashAlternativeAmount: 500000,
    entryPrice: 10,
    totalEntries: 300000,
    soldEntries: 187500,
    drawReadyPercent: 62.5,
    endsIn: '28 days',
    status: 'live',
    annualProfitPotential: 3000000,
    tags: ['Quarterly Draw', 'Fair Live Draw', 'Transparent Odds', 'Cash Alternative Available'],
    profitMargin: '40% House, 60% Prize Pool (Transparent)',
    expectedWinners: 1,
  },
  {
    id: 5,
    title: '£5M Annual Grand Draw',
    description: 'The ultimate annual £5 million cash draw. Coming soon.',
    prizeType: 'CASH COMPETITION',
    prizeAmount: 5000000,
    currency: 'GBP',
    cashAlternative: true,
    cashAlternativeAmount: 5000000,
    entryPrice: 25,
    totalEntries: 1000000,
    soldEntries: 0,
    drawReadyPercent: 0,
    endsIn: 'Coming Soon',
    status: 'coming-soon',
    annualProfitPotential: 7500000,
    tags: ['Annual Draw', 'Fair Live Draw', 'Transparent Odds', 'Cash Alternative Available'],
    profitMargin: '40% House, 60% Prize Pool (Transparent)',
    expectedWinners: 1,
  },
  {
    id: 6,
    title: 'Weekly £10K Bonus Draw',
    description: 'Additional weekly draw for extra cash winnings.',
    prizeType: 'CASH COMPETITION',
    prizeAmount: 10000,
    currency: 'GBP',
    cashAlternative: true,
    cashAlternativeAmount: 10000,
    entryPrice: 1,
    totalEntries: 30000,
    soldEntries: 18750,
    drawReadyPercent: 62.5,
    endsIn: '6 days 22 hours 15 minutes',
    status: 'live',
    annualProfitPotential: 780000,
    tags: ['Weekly Draw', 'Guaranteed Winner', 'Fair Live Draw', 'Cash Alternative Available'],
    profitMargin: '40% House, 60% Prize Pool (Transparent)',
    expectedWinners: 1,
  },
  {
    id: 7,
    title: '3 Premium Supercars OR £135K Cash',
    description: 'Win 3 luxury supercars or take £135K cash instead. CASH OR CARS – YOU CHOOSE!',
    prizeType: 'VEHICLE COMPETITION',
    prizeAmount: 135000,
    currency: 'GBP',
    cashAlternative: true,
    cashAlternativeAmount: 135000,
    entryPrice: 10,
    totalEntries: 33750,
    soldEntries: 21094,
    drawReadyPercent: 62.5,
    endsIn: '18 days 4 hours 30 minutes',
    status: 'live',
    annualProfitPotential: 2430000,
    prizeIncludes: ['Porsche 911 Turbo S', 'Lamborghini Huracán', 'Ferrari 488 GTB', 'OR take £135,000 cash'],
    tags: ['Supercar Draw', 'Cash or Cars', 'Fair Live Draw', 'Cash Alternative Available'],
    profitMargin: '40% House, 60% Prize Pool (Transparent)',
    expectedWinners: 1,
  },
  {
    id: 8,
    title: 'UK Entrepreneur Dream Package OR £320K Cash',
    description: 'Full business & lifestyle prize package or £320K cash. Your choice.',
    prizeType: 'BUSINESS PACKAGE',
    prizeAmount: 320000,
    currency: 'GBP',
    cashAlternative: true,
    cashAlternativeAmount: 320000,
    entryPrice: 25,
    totalEntries: 32000,
    soldEntries: 20000,
    drawReadyPercent: 62.5,
    endsIn: '28 days',
    status: 'live',
    annualProfitPotential: 1920000,
    prizeIncludes: [
      '£80,000 cash lump sum',
      'Premium Supercar',
      'Limited Company setup',
      'Digital business package',
      'Luxury lifestyle bundle',
      'OR take £320,000 cash instead',
    ],
    tags: ['Business Package', 'Cash Alternative', 'Fair Live Draw', 'Cash Alternative Available'],
    profitMargin: '40% House, 60% Prize Pool (Transparent)',
    expectedWinners: 1,
  },
];

const getCompetition = (idParam: string) => competitions.find(c => c.id === parseInt(idParam, 10));

const validateEntryInput = (competition: (typeof competitions)[number] | undefined, quantity: unknown, termsAccepted: unknown) => {
  if (!competition) {
    return { error: { status: 404, message: 'Competition not found' } };
  }

  if (competition.status === 'coming-soon') {
    return { error: { status: 400, message: 'Competition not yet open. Please check back soon.' } };
  }

  if (!termsAccepted) {
    return { error: { status: 400, message: 'You must accept the terms and conditions to enter.' } };
  }

  const qty = Number(quantity);
  if (!Number.isInteger(qty) || qty < 1 || qty > 1000) {
    return { error: { status: 400, message: 'Invalid quantity. Must be a whole number between 1 and 1000.' } };
  }

  return { qty };
};

const createStripeCheckoutSession = async (args: {
  competition: (typeof competitions)[number];
  quantity: number;
  prizeOption: string;
  customerEmail?: string;
}) => {
  if (!STRIPE_SECRET_KEY) {
    throw new Error('Stripe is not configured. Set STRIPE_SECRET_KEY to enable payments.');
  }

  const { competition, quantity, prizeOption, customerEmail } = args;
  const unitAmount = Math.round(competition.entryPrice * 100);
  const successUrl = `${CLIENT_URL}/?checkout=success&competitionId=${competition.id}`;
  const cancelUrl = `${CLIENT_URL}/?checkout=cancelled&competitionId=${competition.id}`;
  const params = new URLSearchParams();

  params.set('mode', 'payment');
  params.set('success_url', successUrl);
  params.set('cancel_url', cancelUrl);
  params.set('payment_intent_data[metadata][competitionId]', String(competition.id));
  params.set('payment_intent_data[metadata][competitionTitle]', competition.title);
  params.set('payment_intent_data[metadata][prizeOption]', prizeOption);
  params.set('payment_intent_data[metadata][settlementEntity]', PAYMENT_SETTLEMENT_ENTITY);
  params.set('line_items[0][quantity]', String(quantity));
  params.set('line_items[0][price_data][currency]', 'gbp');
  params.set('line_items[0][price_data][unit_amount]', String(unitAmount));
  params.set('line_items[0][price_data][product_data][name]', `${competition.title} Ticket Entry`);
  params.set('line_items[0][price_data][product_data][description]', `Ticket purchase for ${competition.title}`);

  if (customerEmail) {
    params.set('customer_email', customerEmail);
  }

  const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + STRIPE_SECRET_KEY,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  });

  if (!stripeResponse.ok) {
    const stripeError = await stripeResponse.text();
    throw new Error(`Stripe checkout creation failed: ${stripeError}`);
  }

  return stripeResponse.json() as Promise<{ id: string; url?: string }>;
};

const createPayPalCheckoutOrder = async (args: {
  competition: (typeof competitions)[number];
  quantity: number;
  prizeOption: string;
}) => {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    throw new Error('PayPal is not configured. Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET.');
  }

  const basicAuth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
  const tokenResponse = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basicAuth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ grant_type: 'client_credentials' }),
  });

  if (!tokenResponse.ok) {
    const tokenError = await tokenResponse.text();
    throw new Error(`PayPal auth failed: ${tokenError}`);
  }

  const tokenPayload = await tokenResponse.json() as { access_token: string };
  const amount = (args.competition.entryPrice * args.quantity).toFixed(2);
  const orderResponse = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + tokenPayload.access_token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          description: `${args.competition.title} Ticket Entry`,
          custom_id: String(args.competition.id),
          soft_descriptor: 'UK LUXE PRIZE DRAW',
          amount: {
            currency_code: 'GBP',
            value: amount,
          },
        },
      ],
      application_context: {
        return_url: `${CLIENT_URL}/?checkout=success&competitionId=${args.competition.id}&provider=paypal`,
        cancel_url: `${CLIENT_URL}/?checkout=cancelled&competitionId=${args.competition.id}&provider=paypal`,
        user_action: 'PAY_NOW',
        brand_name: 'UK Luxe Prize Draw',
      },
    }),
  });

  if (!orderResponse.ok) {
    const orderError = await orderResponse.text();
    throw new Error(`PayPal order creation failed: ${orderError}`);
  }

  const orderPayload = await orderResponse.json() as {
    id: string;
    links?: Array<{ rel: string; href: string }>;
  };
  const approveLink = orderPayload.links?.find((link) => link.rel === 'approve')?.href;
  if (!approveLink) {
    throw new Error('PayPal order was created but no approval link was returned.');
  }

  return {
    id: orderPayload.id,
    url: approveLink,
    provider: 'paypal',
    prizeOption: args.prizeOption,
    settlementEntity: PAYMENT_SETTLEMENT_ENTITY,
  };
};

// Routes
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'Premium Competitions API is running',
    timestamp: new Date().toISOString(),
    competitions: competitions.length,
    live: competitions.filter(c => c.status === 'live').length,
  });
});

app.get('/api/competitions', (req: Request, res: Response) => {
  res.json(competitions);
});

app.get('/api/competitions/:id', (req: Request, res: Response) => {
  const competition = getCompetition(req.params.id);
  if (!competition) {
    return res.status(404).json({ error: 'Competition not found' });
  }
  res.json(competition);
});

app.post('/api/competitions/:id/enter', (req: Request, res: Response) => {
  const { quantity, termsAccepted, prizeOption } = req.body;
  const competition = getCompetition(req.params.id);
  const validation = validateEntryInput(competition, quantity, termsAccepted);
  if ('error' in validation) {
    return res.status(validation.error.status).json({ error: validation.error.message });
  }

  const qty = validation.qty;
  const totalCost = qty * competition.entryPrice;
  const validPrizeOptions = ['physical', 'cash'];
  const selectedPrizeOption = prizeOption && validPrizeOptions.includes(prizeOption) ? prizeOption : 'cash';
  
  res.json({
    success: true,
    message: 'Entry processed successfully (demo mode)',
    competitionId: competition.id,
    competitionTitle: competition.title,
    quantity: qty,
    totalCost,
    currency: competition.currency,
    prizeOption: competition.cashAlternative ? selectedPrizeOption : 'physical',
    entryNumbers: Array.from({ length: qty }, () => `${competition.id}-${Math.random().toString(36).slice(2, 11).toUpperCase()}`),
    drawReadyPercent: competition.drawReadyPercent,
    endsIn: competition.endsIn,
  });
});

app.post('/api/competitions/:id/checkout-session', async (req: Request, res: Response) => {
  try {
    const { quantity, termsAccepted, prizeOption, customerEmail, paymentProvider } = req.body;
    const competition = getCompetition(req.params.id);
    const validation = validateEntryInput(competition, quantity, termsAccepted);
    if ('error' in validation) {
      return res.status(validation.error.status).json({ error: validation.error.message });
    }

    const validPrizeOptions = ['physical', 'cash'];
    const selectedPrizeOption = prizeOption && validPrizeOptions.includes(prizeOption) ? prizeOption : 'cash';
    const provider = paymentProvider === 'paypal' ? 'paypal' : 'stripe';
    const session = provider === 'paypal'
      ? await createPayPalCheckoutOrder({
        competition,
        quantity: validation.qty,
        prizeOption: selectedPrizeOption,
      })
      : await createStripeCheckoutSession({
        competition,
        quantity: validation.qty,
        prizeOption: selectedPrizeOption,
        customerEmail: typeof customerEmail === 'string' ? customerEmail : undefined,
      });

    res.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id,
      provider,
      settlementEntity: PAYMENT_SETTLEMENT_ENTITY,
      message: provider === 'paypal' ? 'PayPal checkout order created' : 'Stripe checkout session created',
    });
  } catch (error) {
    const details = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: 'Unable to start payment checkout', details });
  }
});

app.post('/api/competitions/:id/free-entry', (req: Request, res: Response) => {
  const { fullName, email, postalAddress, termsAccepted, declarationAccepted } = req.body;
  const competition = getCompetition(req.params.id);
  if (!competition) {
    return res.status(404).json({ error: 'Competition not found' });
  }

  if (!termsAccepted || !declarationAccepted) {
    return res.status(400).json({ error: 'Terms and declaration must be accepted for free entry.' });
  }

  if (!fullName || !email || !postalAddress) {
    return res.status(400).json({ error: 'fullName, email, and postalAddress are required.' });
  }

  const reference = `FREE-${competition.id}-${Date.now()}`;
  res.status(201).json({
    success: true,
    message: 'Free entry request submitted for manual validation.',
    competitionId: competition.id,
    reference,
  });
});

app.get('/api/compliance/no-purchase-route', (_req: Request, res: Response) => {
  res.json({
    enabled: true,
    message: 'No purchase necessary route is active via /api/competitions/:id/free-entry.',
    requirements: [
      'Provide full name, email, and postal address',
      'Accept terms and declaration',
      'Manual eligibility validation applies',
    ],
  });
});

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'UK Luxe Prize Draw API (Transparent & Compliant)', version: '1.0.0' });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n✨ UK Luxe Prize Draw API running on http://localhost:${PORT}`);
  console.log(`📡 CORS enabled for http://localhost:5173`);
  console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
  console.log(`📊 Competitions: http://localhost:${PORT}/api/competitions\n`);
});
