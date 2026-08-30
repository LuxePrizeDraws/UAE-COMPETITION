import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { randomUUID } from 'crypto';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || '';
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || '';
const PAYPAL_API =
  process.env.NODE_ENV === 'production'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

// Middleware
app.use(helmet());
app.use(morgan('combined'));
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP',
});
app.use(limiter);

// ─── UK Compliance Challenge ──────────────────────────────────────────────────
// UK prize competitions avoid Gambling Commission licensing by requiring a
// genuine skill element that the average person can answer. The correct answer
// is validated server-side using a one-use token so it cannot be bypassed.
const CHALLENGE_POOL = [
  { question: 'What is 12 + 8?', answer: '20' },
  { question: 'What is 15 × 3?', answer: '45' },
  { question: 'What is 100 ÷ 4?', answer: '25' },
  { question: 'What is 7 × 7?', answer: '49' },
  { question: 'What is 50 + 37?', answer: '87' },
  { question: 'What is 9 × 6?', answer: '54' },
  { question: 'What is 200 ÷ 8?', answer: '25' },
  { question: 'What is 13 + 29?', answer: '42' },
  { question: 'What is 11 × 4?', answer: '44' },
  { question: 'What is 144 ÷ 12?', answer: '12' },
  { question: 'What is 8 × 9?', answer: '72' },
  { question: 'What is 64 ÷ 8?', answer: '8' },
  { question: 'What is 35 + 47?', answer: '82' },
  { question: 'What is 6 × 8?', answer: '48' },
  { question: 'What is 120 ÷ 6?', answer: '20' },
  { question: 'What is 17 + 16?', answer: '33' },
  { question: 'What is 9 × 9?', answer: '81' },
  { question: 'What is 75 ÷ 3?', answer: '25' },
  { question: 'What is 4 × 12?', answer: '48' },
  { question: 'What is 28 + 54?', answer: '82' },
];

// In-memory token store: token → { answer, expiresAt }
// NOTE: This works for single-process deployments (Railway, Render, VPS).
// For Vercel serverless functions, replace with an external store (Redis/KV)
// since each invocation may be a separate process.
const challengeTokens = new Map<string, { answer: string; expiresAt: number }>();

// Clean up expired tokens every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [token, data] of challengeTokens.entries()) {
    if (now > data.expiresAt) challengeTokens.delete(token);
  }
}, 10 * 60 * 1000);

// ─── PayPal helpers ───────────────────────────────────────────────────────────
async function getPayPalAccessToken(): Promise<string> {
  const credentials = Buffer.from(
    `${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`
  ).toString('base64');
  const res = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

async function verifyPayPalOrder(
  orderID: string,
  expectedAmount: number
): Promise<boolean> {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) return false;
  // Validate orderID format to prevent SSRF – PayPal order IDs are alphanumeric + hyphens only
  if (!/^[A-Z0-9-]{1,50}$/i.test(orderID)) return false;
  try {
    const accessToken = await getPayPalAccessToken();
    const safeOrderID = encodeURIComponent(orderID);
    const res = await fetch(`${PAYPAL_API}/v2/checkout/orders/${safeOrderID}`, {
      headers: { Authorization: 'Bearer ' + accessToken },
    });
    const order = (await res.json()) as {
      status: string;
      purchase_units: Array<{ amount: { value: string } }>;
    };
    if (order.status !== 'COMPLETED') return false;
    const paidAmount = parseFloat(
      order.purchase_units[0]?.amount?.value || '0'
    );
    return Math.abs(paidAmount - expectedAmount) < 0.01;
  } catch {
    return false;
  }
}

// ─── Competition data ─────────────────────────────────────────────────────────
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
    description: 'Win 3 luxury supercars or take £135K cash instead.',
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

// ─── Routes ───────────────────────────────────────────────────────────────────

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

// GET /api/challenge
// Returns a skill question and a one-use server-side token (expires 15 min).
// The token binds the question to the answer so the client cannot bypass it.
app.get('/api/challenge', (req: Request, res: Response) => {
  const pick = CHALLENGE_POOL[Math.floor(Math.random() * CHALLENGE_POOL.length)];
  const token = randomUUID();
  challengeTokens.set(token, {
    answer: pick.answer,
    expiresAt: Date.now() + 15 * 60 * 1000,
  });
  res.json({ token, question: pick.question });
});

// POST /api/competitions/:id/enter
// Validates: skill challenge answer (server-side) + PayPal payment, then issues entry.
app.post('/api/competitions/:id/enter', async (req: Request, res: Response) => {
  const { quantity, termsAccepted, prizeOption, challengeToken, challengeAnswer, paypalOrderId } =
    req.body;
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

  // ── Compliance: server-side skill challenge validation ──
  if (!challengeToken || !challengeAnswer) {
    return res.status(400).json({ error: 'Skill challenge answer is required to enter.' });
  }
  const tokenData = challengeTokens.get(String(challengeToken));
  if (!tokenData || Date.now() > tokenData.expiresAt) {
    return res.status(400).json({ error: 'Challenge token expired. Please refresh and try again.' });
  }
  if (tokenData.answer.trim().toLowerCase() !== String(challengeAnswer).trim().toLowerCase()) {
    challengeTokens.delete(String(challengeToken));
    return res.status(400).json({ error: 'Incorrect answer. Please try again.' });
  }
  // One-use: delete token after successful validation
  challengeTokens.delete(String(challengeToken));

  // ── Payment: verify PayPal order ──
  if (!paypalOrderId) {
    return res.status(400).json({ error: 'Payment required. Please complete PayPal checkout.' });
  }
  const qty = Number(quantity);
  const expectedAmount = qty * competition.entryPrice;

  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    return res.status(503).json({ error: 'Payment processing is not configured. Please contact support.' });
  }
  const paymentVerified = await verifyPayPalOrder(String(paypalOrderId), expectedAmount);
  if (!paymentVerified) {
    return res.status(400).json({ error: 'Payment could not be verified. Please contact support.' });
  }

  const totalCost = expectedAmount;
  const validPrizeOptions = ['physical', 'cash'];
  const selectedPrizeOption =
    prizeOption && validPrizeOptions.includes(prizeOption) ? prizeOption : 'cash';

  res.json({
    success: true,
    message: 'Entry confirmed! Good luck in the draw.',
    competitionId: competition.id,
    competitionTitle: competition.title,
    quantity: qty,
    totalCost,
    currency: competition.currency,
    prizeOption: competition.cashAlternative ? selectedPrizeOption : 'physical',
    entryNumbers: Array.from({ length: qty }, () =>
      `${competition.id}-${Math.random().toString(36).slice(2, 11).toUpperCase()}`
    ),
    paypalOrderId,
    drawReadyPercent: competition.drawReadyPercent,
    endsIn: competition.endsIn,
  });
});

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'UAE Competition Platform API (Transparent & Compliant)', version: '1.0.0' });
});

app.listen(PORT, () => {
  console.log(`\n✨ UAE Competition API running on http://localhost:${PORT}`);
  console.log(`📡 CORS enabled for ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
  console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
  console.log(`📊 Competitions: http://localhost:${PORT}/api/competitions\n`);
});
