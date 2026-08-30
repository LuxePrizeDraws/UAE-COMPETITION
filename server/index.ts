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
  {
    id: 9,
    title: 'BIGGEST BUSINESS PRIZE: £100K Win Your Own Company + Start-up Grant',
    description: 'Flagship launch prize ambition: £100K company package with custom web + app build design support, subject to terms.',
    prizeType: 'FLAGSHIP BUSINESS PACKAGE',
    prizeAmount: 100000,
    currency: 'GBP',
    cashAlternative: true,
    cashAlternativeAmount: 100000,
    entryPrice: 1,
    totalEntries: 400000,
    soldEntries: 0,
    drawReadyPercent: 0,
    endsIn: 'Coming Soon',
    status: 'coming-soon',
    annualProfitPotential: 1200000,
    prizeIncludes: [
      'Company launch support',
      'Start-up grant package',
      'Custom web build design',
      'Custom app build design',
      'OR take £100,000 cash',
    ],
    tags: ['Flagship Prize', 'Biggest Business Package', 'Coming Soon', 'Cash Alternative Available'],
    profitMargin: '40% House, 60% Prize Pool (Transparent)',
    expectedWinners: 1,
    recordGoalUSD: 10000001,
    recordCurrentUSD: 0,
    recordUnlockText: '$100M community mega draw',
  },
  {
    id: 10,
    title: 'LIVE WORLD RECORD CHASE: £1 Entry Cash Pot',
    description: 'A live global £1-entry campaign targeting a record milestone, subject to eligibility, terms, and legal approvals.',
    prizeType: 'LIVE CASH CHALLENGE',
    prizeAmount: 100000000,
    currency: 'GBP',
    cashAlternative: false,
    cashAlternativeAmount: 0,
    entryPrice: 1,
    totalEntries: 120000000,
    soldEntries: 6400000,
    drawReadyPercent: 5.3,
    endsIn: '37 days',
    status: 'live',
    annualProfitPotential: 100000000,
    prizeIncludes: [
      '£1 ticket entry',
      'Global live participation',
      'Transparent milestone tracker',
      'Target: unlock $100M mega draw',
    ],
    tags: ['Live Competition', 'Record Chase', '£1 Entry', 'Community Unlock'],
    profitMargin: 'Target campaign model with transparent milestone tracking',
    expectedWinners: 1,
    recordGoalUSD: 10000001,
    recordCurrentUSD: 6400000,
    recordUnlockText: '$100M community mega draw',
  },
];

const getCompetition = (idParam: string) => competitions.find(c => c.id === parseInt(idParam, 10));

type EntryMethod = 'paid' | 'postal';
type DrawEntryRecord = {
  id: string;
  competitionId: number;
  method: EntryMethod;
  quantity: number;
  entryNumbers: string[];
  riskLevel: 'low' | 'medium' | 'high';
  riskScore: number;
  status: 'accepted' | 'manual-review';
  createdAt: string;
};

const drawEntryPool: DrawEntryRecord[] = [];
const participantEmailCounts = new Map<string, number>();
const MAX_TRACKED_PARTICIPANT_EMAILS = 5000;

const generateEntryNumbers = (competitionId: number, quantity: number) =>
  Array.from({ length: quantity }, () => `${competitionId}-${Math.random().toString(36).slice(2, 11).toUpperCase()}`);

const runEntryRiskScan = (input: {
  method: EntryMethod;
  quantity: number;
  fullName?: string;
  email?: string;
  postalAddress?: string;
}) => {
  let score = 0;
  const email = (input.email || '').trim().toLowerCase();
  const fullName = (input.fullName || '').trim();
  const postalAddress = (input.postalAddress || '').trim();

  if (input.quantity > 50) score += 20;
  if (input.method === 'postal' && input.quantity !== 1) score += 25;
  if (postalAddress.length > 0 && postalAddress.length < 10) score += 20;
  if (fullName.length > 0 && fullName.split(' ').filter(Boolean).length < 2) score += 15;

  if (email) {
    if (participantEmailCounts.size >= MAX_TRACKED_PARTICIPANT_EMAILS && !participantEmailCounts.has(email)) {
      const firstKey = participantEmailCounts.keys().next().value;
      if (typeof firstKey === 'string') participantEmailCounts.delete(firstKey);
    }
    const previousCount = participantEmailCounts.get(email) || 0;
    if (previousCount >= 2) score += 25;
    participantEmailCounts.set(email, previousCount + 1);
  }

  const riskLevel = score >= 45 ? 'high' : score >= 20 ? 'medium' : 'low';
  return {
    riskScore: score,
    riskLevel,
    status: (riskLevel === 'high' ? 'manual-review' : 'accepted') as 'accepted' | 'manual-review',
  };
};

const registerDrawEntries = (input: {
  competitionId: number;
  method: EntryMethod;
  quantity: number;
  fullName?: string;
  email?: string;
  postalAddress?: string;
}) => {
  const scan = runEntryRiskScan(input);
  const entryNumbers = generateEntryNumbers(input.competitionId, input.quantity);
  const record: DrawEntryRecord = {
    id: `DRAW-${input.competitionId}-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    competitionId: input.competitionId,
    method: input.method,
    quantity: input.quantity,
    entryNumbers,
    riskLevel: scan.riskLevel,
    riskScore: scan.riskScore,
    status: scan.status,
    createdAt: new Date().toISOString(),
  };
  drawEntryPool.push(record);
  return record;
};

const validateEntryInput = (
  competition: (typeof competitions)[number] | undefined,
  quantity: unknown,
  termsAccepted: unknown,
  ageConfirmed: unknown,
) => {
  if (!competition) {
    return { error: { status: 404, message: 'Competition not found' } };
  }

  if (competition.status === 'coming-soon') {
    return { error: { status: 400, message: 'Competition not yet open. Please check back soon.' } };
  }

  if (!termsAccepted) {
    return { error: { status: 400, message: 'You must accept the terms and conditions to enter.' } };
  }

  if (!ageConfirmed) {
    return { error: { status: 400, message: 'You must confirm you are 18+ to enter.' } };
  }

  const qty = Number(quantity);
  if (!Number.isInteger(qty) || qty < 1 || qty > 1000) {
    return { error: { status: 400, message: 'Invalid quantity. Must be a whole number between 1 and 1000.' } };
  }

  return { qty, competition };
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
    body: params.toString(),
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

  const accessToken = await getPayPalAccessToken();
  const amount = (args.competition.entryPrice * args.quantity).toFixed(2);
  const orderResponse = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + accessToken,
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

async function getPayPalAccessToken() {
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
  return tokenPayload.access_token;
}

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
  const { quantity, termsAccepted, ageConfirmed, prizeOption, fullName, email, postalAddress } = req.body;
  const competition = getCompetition(req.params.id);
  const validation = validateEntryInput(competition, quantity, termsAccepted, ageConfirmed);
  if ('error' in validation) {
    return res.status(validation.error.status).json({ error: validation.error.message });
  }

  const { qty, competition: validatedCompetition } = validation;
  const totalCost = qty * validatedCompetition.entryPrice;
  const validPrizeOptions = ['physical', 'cash'];
  const selectedPrizeOption = prizeOption && validPrizeOptions.includes(prizeOption) ? prizeOption : 'cash';
  
  const drawEntry = registerDrawEntries({
    competitionId: validatedCompetition.id,
    method: 'paid',
    quantity: qty,
    fullName: typeof fullName === 'string' ? fullName : undefined,
    email: typeof email === 'string' ? email : undefined,
    postalAddress: typeof postalAddress === 'string' ? postalAddress : undefined,
  });

  res.json({
    success: true,
    message: 'Entry processed successfully (demo mode)',
    competitionId: validatedCompetition.id,
    competitionTitle: validatedCompetition.title,
    quantity: qty,
    totalCost,
    currency: validatedCompetition.currency,
    prizeOption: validatedCompetition.cashAlternative ? selectedPrizeOption : 'physical',
    entryNumbers: drawEntry.entryNumbers,
    drawPoolStatus: drawEntry.status,
    riskLevel: drawEntry.riskLevel,
    equalChanceRule: 'Each accepted ticket is entered once, regardless of paid or postal route.',
    drawReadyPercent: validatedCompetition.drawReadyPercent,
    endsIn: validatedCompetition.endsIn,
  });
});

app.post('/api/competitions/:id/checkout-session', async (req: Request, res: Response) => {
  try {
    const { quantity, termsAccepted, ageConfirmed, prizeOption, customerEmail, paymentProvider } = req.body;
    const competition = getCompetition(req.params.id);
    const validation = validateEntryInput(competition, quantity, termsAccepted, ageConfirmed);
    if ('error' in validation) {
      return res.status(validation.error.status).json({ error: validation.error.message });
    }

    const validPrizeOptions = ['physical', 'cash'];
    const selectedPrizeOption = prizeOption && validPrizeOptions.includes(prizeOption) ? prizeOption : 'cash';
    const provider = paymentProvider === 'paypal' ? 'paypal' : 'stripe';
    const { qty, competition: validatedCompetition } = validation;
    const session = provider === 'paypal'
      ? await createPayPalCheckoutOrder({
        competition: validatedCompetition,
        quantity: qty,
        prizeOption: selectedPrizeOption,
      })
      : await createStripeCheckoutSession({
        competition: validatedCompetition,
        quantity: qty,
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
  const { fullName, email, postalAddress, termsAccepted, declarationAccepted, ageConfirmed } = req.body;
  const competition = getCompetition(req.params.id);
  if (!competition) {
    return res.status(404).json({ error: 'Competition not found' });
  }

  if (competition.status === 'coming-soon') {
    return res.status(400).json({ error: 'Competition not yet open. Please check back soon.' });
  }

  if (!termsAccepted || !declarationAccepted) {
    return res.status(400).json({ error: 'Terms and declaration must be accepted for free entry.' });
  }

  if (!ageConfirmed) {
    return res.status(400).json({ error: 'You must confirm you are 18+ for free entry.' });
  }

  if (!fullName || !email || !postalAddress) {
    return res.status(400).json({ error: 'fullName, email, and postalAddress are required.' });
  }

  const normalizedEmail = typeof email === 'string' ? email.trim() : '';
  const atIndex = normalizedEmail.indexOf('@');
  const dotIndex = normalizedEmail.lastIndexOf('.');
  const hasValidEmailShape = atIndex > 0 && dotIndex > atIndex + 1 && dotIndex < normalizedEmail.length - 1 && !normalizedEmail.includes(' ');
  if (!hasValidEmailShape) {
    return res.status(400).json({ error: 'A valid email address is required.' });
  }

  const reference = `FREE-${competition.id}-${Date.now()}`;
  const drawEntry = registerDrawEntries({
    competitionId: competition.id,
    method: 'postal',
    quantity: 1,
    fullName: typeof fullName === 'string' ? fullName : undefined,
    email: normalizedEmail,
    postalAddress: typeof postalAddress === 'string' ? postalAddress : undefined,
  });
  res.status(201).json({
    success: true,
    message: 'Free entry request submitted for manual validation.',
    competitionId: competition.id,
    reference,
    drawPoolStatus: drawEntry.status,
    riskLevel: drawEntry.riskLevel,
    equalChanceRule: 'Postal and paid entries are mixed into one draw with equal chance per ticket.',
  });
});

app.get('/api/competitions/:id/draw-pool', (req: Request, res: Response) => {
  const competition = getCompetition(req.params.id);
  if (!competition) {
    return res.status(404).json({ error: 'Competition not found' });
  }

  const entries = drawEntryPool.filter((entry) => entry.competitionId === competition.id);
  const paidTickets = entries.filter((entry) => entry.method === 'paid').reduce((sum, entry) => sum + entry.quantity, 0);
  const postalTickets = entries.filter((entry) => entry.method === 'postal').reduce((sum, entry) => sum + entry.quantity, 0);
  const acceptedTickets = entries
    .filter((entry) => entry.status === 'accepted')
    .reduce((sum, entry) => sum + entry.quantity, 0);

  return res.json({
    competitionId: competition.id,
    totalRecords: entries.length,
    paidTickets,
    postalTickets,
    acceptedTickets,
    equalChanceRule: '1 ticket = 1 draw chance across paid and postal entries.',
    entries,
  });
});

app.get('/api/payments/stripe/session/:sessionId/verify', async (req: Request, res: Response) => {
  try {
    if (!STRIPE_SECRET_KEY) {
      return res.status(503).json({ error: 'Stripe is not configured.' });
    }

    const sessionId = req.params.sessionId;
    const isSafeSessionId = typeof sessionId === 'string'
      && sessionId.length > 6
      && sessionId.length < 200
      && sessionId.startsWith('cs_')
      && [...sessionId].every((char) => /[A-Za-z0-9_]/.test(char));
    if (!isSafeSessionId) {
      return res.status(400).json({ error: 'Invalid Stripe session id.' });
    }

    const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, {
      headers: {
        Authorization: 'Bearer ' + STRIPE_SECRET_KEY,
      },
    });

    if (!response.ok) {
      const details = await response.text();
      return res.status(400).json({ error: 'Unable to verify Stripe session', details });
    }

    const session = await response.json() as { payment_status?: string; status?: string };
    const paid = session.payment_status === 'paid' || session.status === 'complete';
    return res.json({ success: true, paid, session });
  } catch (error) {
    const details = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: 'Stripe verification failed', details });
  }
});

app.post('/api/payments/paypal/capture', async (req: Request, res: Response) => {
  try {
    const { orderId } = req.body;
    if (!orderId || typeof orderId !== 'string') {
      return res.status(400).json({ error: 'orderId is required.' });
    }
    const isSafeOrderId = orderId.length > 6
      && orderId.length < 80
      && [...orderId].every((char) => /[A-Z0-9]/.test(char));
    if (!isSafeOrderId) {
      return res.status(400).json({ error: 'Invalid PayPal order id.' });
    }

    const accessToken = await getPayPalAccessToken();
    const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      const details = await response.text();
      return res.status(400).json({ error: 'Unable to capture PayPal payment', details });
    }

    const payload = await response.json() as { status?: string };
    const paid = payload.status === 'COMPLETED';
    return res.json({ success: true, paid, capture: payload });
  } catch (error) {
    const details = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: 'PayPal capture failed', details });
  }
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
