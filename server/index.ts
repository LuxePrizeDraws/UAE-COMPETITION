import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { buildCartUrl, verifyWebhookSignature, mapOrderToEntries } from './shopifyService.js';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
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
    prizeIncludes: ['5-star Dubai resort stay', 'Business class flights', 'Yacht experience', 'Fine dining package'],
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
  const competition = competitions.find(c => c.id === parseInt(req.params.id));
  if (!competition) {
    return res.status(404).json({ error: 'Competition not found' });
  }
  res.json(competition);
});

app.post('/api/competitions/:id/enter', (req: Request, res: Response) => {
  const { quantity, termsAccepted, prizeOption } = req.body;
  const competition = competitions.find(c => c.id === parseInt(req.params.id));
  
  if (!competition) {
    return res.status(404).json({ error: 'Competition not found' });
  }

  if (competition.status === 'coming-soon') {
    return res.status(400).json({ error: 'Competition not yet open. Please check back soon.' });
  }

  if (!termsAccepted) {
    return res.status(400).json({ error: 'You must accept the terms and conditions to enter.' });
  }

  if (!quantity || !Number.isInteger(Number(quantity)) || Number(quantity) < 1 || Number(quantity) > 1000) {
    return res.status(400).json({ error: 'Invalid quantity. Must be a whole number between 1 and 1000.' });
  }

  const qty = Number(quantity);
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

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'UAE Competition Platform API (Transparent & Compliant)', version: '1.0.0' });
});

// ---------------------------------------------------------------------------
// Supercars gallery endpoint
// ---------------------------------------------------------------------------
const supercars = [
  {
    id: 1,
    make: 'Ferrari',
    model: '488 GTB',
    year: 2023,
    color: 'Rosso Corsa',
    horsepower: 660,
    topSpeed: 205,
    zeroToSixty: 3.0,
    value: 280000,
    currency: 'GBP',
    category: 'Sports',
    image: '🏎️',
    available: true,
    competitionId: 7,
  },
  {
    id: 2,
    make: 'Lamborghini',
    model: 'Huracán EVO',
    year: 2023,
    color: 'Arancio Borealis',
    horsepower: 640,
    topSpeed: 202,
    zeroToSixty: 2.9,
    value: 220000,
    currency: 'GBP',
    category: 'Sports',
    image: '🏎️',
    available: true,
    competitionId: 7,
  },
  {
    id: 3,
    make: 'Porsche',
    model: '911 Turbo S',
    year: 2024,
    color: 'GT Silver',
    horsepower: 650,
    topSpeed: 205,
    zeroToSixty: 2.7,
    value: 200000,
    currency: 'GBP',
    category: 'Sports',
    image: '🚗',
    available: true,
    competitionId: 7,
  },
  {
    id: 4,
    make: 'McLaren',
    model: '720S',
    year: 2023,
    color: 'Papaya Spark',
    horsepower: 710,
    topSpeed: 212,
    zeroToSixty: 2.8,
    value: 250000,
    currency: 'GBP',
    category: 'Hypercar',
    image: '🏎️',
    available: false,
    competitionId: null,
  },
  {
    id: 5,
    make: 'Bentley',
    model: 'Continental GT Speed',
    year: 2024,
    color: 'Midnight Emerald',
    horsepower: 659,
    topSpeed: 208,
    zeroToSixty: 3.2,
    value: 270000,
    currency: 'GBP',
    category: 'Grand Tourer',
    image: '🚙',
    available: true,
    competitionId: 8,
  },
  {
    id: 6,
    make: 'Rolls-Royce',
    model: 'Ghost Black Badge',
    year: 2024,
    color: 'Black Diamond',
    horsepower: 591,
    topSpeed: 155,
    zeroToSixty: 4.6,
    value: 350000,
    currency: 'GBP',
    category: 'Luxury',
    image: '🚗',
    available: true,
    competitionId: 8,
  },
];

app.get('/api/supercars', (req: Request, res: Response) => {
  const { category, search } = req.query as Record<string, string | undefined>;
  let result = supercars;
  if (category && category !== 'all') {
    result = result.filter((c) => c.category.toLowerCase() === category.toLowerCase());
  }
  if (search) {
    const term = search.toLowerCase();
    result = result.filter(
      (c) =>
        c.make.toLowerCase().includes(term) ||
        c.model.toLowerCase().includes(term) ||
        c.color.toLowerCase().includes(term)
    );
  }
  res.json(result);
});

// ---------------------------------------------------------------------------
// Shopify checkout endpoint
// POST /api/shopify/checkout
// Body: { competitionId, quantity, prizeOption, termsAccepted }
// ---------------------------------------------------------------------------
app.post('/api/shopify/checkout', (req: Request, res: Response) => {
  const { competitionId, quantity, prizeOption, termsAccepted } = req.body as {
    competitionId?: number;
    quantity?: number;
    prizeOption?: string;
    termsAccepted?: boolean;
  };

  if (!termsAccepted) {
    return res.status(400).json({ error: 'You must accept the terms and conditions to enter.' });
  }

  const competition = competitions.find((c) => c.id === Number(competitionId));
  if (!competition) {
    return res.status(404).json({ error: 'Competition not found.' });
  }
  if (competition.status === 'coming-soon') {
    return res.status(400).json({ error: 'Competition not yet open. Please check back soon.' });
  }

  const qty = Number(quantity);
  if (!Number.isInteger(qty) || qty < 1 || qty > 1000) {
    return res.status(400).json({ error: 'Quantity must be a whole number between 1 and 1000.' });
  }

  const validPrizeOptions = ['cash', 'physical'];
  const selectedPrize = prizeOption && validPrizeOptions.includes(prizeOption) ? prizeOption : 'cash';

  try {
    const checkoutUrl = buildCartUrl({
      competitionId: competition.id,
      quantity: qty,
      prizeOption: selectedPrize,
    });

    return res.json({
      success: true,
      checkoutUrl,
      competitionId: competition.id,
      competitionTitle: competition.title,
      quantity: qty,
      totalCost: qty * competition.entryPrice,
      currency: competition.currency,
      prizeOption: selectedPrize,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not create checkout.';
    return res.status(500).json({ error: message });
  }
});

// ---------------------------------------------------------------------------
// Shopify webhook endpoint
// POST /api/shopify/webhook
// Headers: X-Shopify-Topic, X-Shopify-Hmac-Sha256
// ---------------------------------------------------------------------------
app.post(
  '/api/shopify/webhook',
  express.raw({ type: 'application/json' }),
  (req: Request, res: Response) => {
    const hmacHeader = (req.headers['x-shopify-hmac-sha256'] as string) || '';
    const topic = (req.headers['x-shopify-topic'] as string) || '';
    const rawBody: Buffer = req.body as Buffer;

    if (!verifyWebhookSignature(rawBody, hmacHeader)) {
      return res.status(401).json({ error: 'Webhook signature verification failed.' });
    }

    let order: Record<string, unknown>;
    try {
      order = JSON.parse(rawBody.toString('utf-8')) as Record<string, unknown>;
    } catch {
      return res.status(400).json({ error: 'Invalid JSON payload.' });
    }

    if (topic === 'orders/paid') {
      const entries = mapOrderToEntries(order);
      // In a full implementation, persist entries to a database here.
      // For now, log and acknowledge.
      console.log(`[Shopify] orders/paid – mapped ${entries.length} entry record(s)`, entries);
      return res.status(200).json({ received: true, entries });
    }

    if (topic === 'orders/cancelled' || topic === 'refunds/create') {
      console.log(`[Shopify] ${topic} – order ${order.id} cancelled/refunded`);
      return res.status(200).json({ received: true });
    }

    return res.status(200).json({ received: true });
  }
);

// Start server
app.listen(PORT, () => {
  console.log(`\n✨ UAE Competition API running on http://localhost:${PORT}`);
  console.log(`📡 CORS enabled for http://localhost:5173`);
  console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
  console.log(`📊 Competitions: http://localhost:${PORT}/api/competitions`);
  console.log(`🛒 Shopify checkout: POST http://localhost:${PORT}/api/shopify/checkout\n`);
});
