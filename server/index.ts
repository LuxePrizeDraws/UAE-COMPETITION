import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { AutomatedPayoutService, PAYOUT_METHOD_TYPES } from './payoutService.js';
import { randomUUID } from 'crypto';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;
const payoutService = new AutomatedPayoutService();
const MENTAL_HEALTH_AI_MODE = (process.env.MENTAL_HEALTH_AI_MODE || 'mock').toLowerCase();
const MENTAL_HEALTH_AI_ENDPOINT = process.env.MENTAL_HEALTH_AI_ENDPOINT || '';
const MENTAL_HEALTH_AI_API_KEY = process.env.MENTAL_HEALTH_AI_API_KEY || '';
const enabledTournamentSlugs = new Set(
  (process.env.ENABLED_TOURNAMENTS || 'chess,connect4')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)
);

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

type TournamentSlug = 'chess' | 'connect4';

interface Tournament {
  id: number;
  slug: TournamentSlug;
  name: string;
  shortTitle: string;
  format: string;
  status: 'open' | 'upcoming';
  startDate: string;
  maxPlayers: number;
  registeredPlayers: number;
  entryFee: number;
  currency: string;
  timeControl?: string;
  rounds: number;
  description: string;
  highlights: string[];
  rules: string[];
}

const tournaments: Tournament[] = [
  {
    id: 101,
    slug: 'chess',
    name: 'UAE Chess Masters Tournament',
    shortTitle: 'Chess Tournament',
    format: 'Swiss',
    status: 'open',
    startDate: '2026-09-12T18:00:00.000Z',
    maxPlayers: 128,
    registeredPlayers: 72,
    entryFee: 15,
    currency: 'GBP',
    timeControl: '10+5',
    rounds: 7,
    description: 'Rapid Swiss event with live leaderboard updates and fair matchmaking brackets.',
    highlights: ['FIDE-inspired pairing logic', 'Live standings each round', 'Cash and trophy rewards'],
    rules: ['Respect fair play policies', 'Join each round on time', 'Disconnect grace period of 3 minutes'],
  },
  {
    id: 102,
    slug: 'connect4',
    name: 'UAE Connect 4 Clash',
    shortTitle: 'Connect 4 Tournament',
    format: 'Double Elimination',
    status: 'open',
    startDate: '2026-09-14T17:00:00.000Z',
    maxPlayers: 256,
    registeredPlayers: 149,
    entryFee: 5,
    currency: 'GBP',
    rounds: 8,
    description: 'Fast-paced Connect 4 brackets with strategic rematches and stream-friendly rounds.',
    highlights: ['Double-elimination safety bracket', 'Best-of-3 finals', 'Live bracket progression'],
    rules: ['No stalling between turns', 'Report technical issues immediately', 'Sportsmanship is mandatory'],
  },
];

const tournamentRegistrations: {
  id: string;
  tournamentSlug: TournamentSlug;
  name: string;
  email: string;
  createdAt: string;
}[] = [];

const supportWorkerRequests: {
  ticketId: string;
  name: string;
  email: string;
  reason: string;
  preferredContact: string;
  urgent: boolean;
  createdAt: string;
}[] = [];

function isTournamentEnabled(slug: string): slug is TournamentSlug {
  return (slug === 'chess' || slug === 'connect4') && enabledTournamentSlugs.has(slug);
}

function getRegisteredPlayers(tournament: Tournament): number {
  return tournament.registeredPlayers + tournamentRegistrations.filter(
    (registration) => registration.tournamentSlug === tournament.slug
  ).length;
}

function toTournamentResponse(tournament: Tournament): Tournament {
  return {
    ...tournament,
    registeredPlayers: getRegisteredPlayers(tournament),
  };
}

function isValidEmail(email: string): boolean {
  const atIndex = email.indexOf('@');
  const lastDotIndex = email.lastIndexOf('.');
  return atIndex > 0 && lastDotIndex > atIndex + 1 && lastDotIndex < email.length - 1;
}

function generateSupportiveReply(message: string): string {
  const normalized = message.toLowerCase();
  if (normalized.includes('anxious') || normalized.includes('anxiety')) {
    return 'It sounds like anxiety is feeling heavy right now. A brief grounding step can help: breathe in for 4 counts, hold for 4, and exhale for 6, repeating for one minute.';
  }
  if (normalized.includes('sleep') || normalized.includes('insomnia')) {
    return 'Sleep stress can build quickly. Try a short wind-down: dim screens, write down racing thoughts, and focus on slow breathing for 5 minutes before bed.';
  }
  if (normalized.includes('stress') || normalized.includes('overwhelm')) {
    return 'When stress piles up, it can help to pick one small next step you can finish in 10 minutes. Completing that step often reduces overwhelm and gives momentum.';
  }
  return 'Thanks for sharing that. I can offer supportive, practical steps and we can also connect you with a support worker if you want more personal follow-up.';
}

async function fetchExternalMentalHealthReply(message: string, history: Array<{ role: string; content: string }>) {
  const response = await fetch(MENTAL_HEALTH_AI_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(MENTAL_HEALTH_AI_API_KEY ? { Authorization: 'Bearer ' + MENTAL_HEALTH_AI_API_KEY } : {}),
    },
    body: JSON.stringify({ message, history }),
  });

  if (!response.ok) {
    throw new Error(`AI provider error: ${response.status}`);
  }

  const payload = await response.json() as { reply?: string };
  if (!payload.reply || typeof payload.reply !== 'string') {
    throw new Error('Invalid AI provider response');
  }

  return payload.reply;
}

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

app.get('/api/tournaments', (req: Request, res: Response) => {
  const visibleTournaments = tournaments
    .filter((tournament) => enabledTournamentSlugs.has(tournament.slug))
    .map(toTournamentResponse);
  res.json(visibleTournaments);
});

app.get('/api/tournaments/:slug', (req: Request, res: Response) => {
  const slug = req.params.slug.toLowerCase();
  if (!isTournamentEnabled(slug)) {
    return res.status(404).json({ error: 'Tournament not found or currently disabled' });
  }

  const tournament = tournaments.find((entry) => entry.slug === slug);
  if (!tournament) {
    return res.status(404).json({ error: 'Tournament not found' });
  }

  res.json(toTournamentResponse(tournament));
});

app.post('/api/tournaments/:slug/register', (req: Request, res: Response) => {
  const slug = req.params.slug.toLowerCase();
  if (!isTournamentEnabled(slug)) {
    return res.status(404).json({ error: 'Tournament not found or currently disabled' });
  }

  const tournament = tournaments.find((entry) => entry.slug === slug);
  if (!tournament) {
    return res.status(404).json({ error: 'Tournament not found' });
  }

  const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const termsAccepted = req.body.termsAccepted === true;

  if (name.length < 2 || name.length > 100) {
    return res.status(400).json({ error: 'Please enter a valid name (2-100 characters).' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }

  if (!termsAccepted) {
    return res.status(400).json({ error: 'You must accept tournament terms before registering.' });
  }

  const registeredPlayers = getRegisteredPlayers(tournament);
  if (registeredPlayers >= tournament.maxPlayers) {
    return res.status(409).json({ error: 'Tournament capacity is full.' });
  }

  const duplicateRegistration = tournamentRegistrations.some(
    (registration) => registration.tournamentSlug === tournament.slug && registration.email === email
  );
  if (duplicateRegistration) {
    return res.status(409).json({ error: 'This email is already registered for the tournament.' });
  }

  const registrationId = `${tournament.slug.toUpperCase()}-${randomUUID().slice(0, 8).toUpperCase()}`;
  tournamentRegistrations.push({
    id: registrationId,
    tournamentSlug: tournament.slug,
    name,
    email,
    createdAt: new Date().toISOString(),
  });

  res.json({
    success: true,
    registrationId,
    tournament: tournament.shortTitle,
    message: 'Registration received. We will email bracket and schedule details shortly.',
  });
});

app.post('/api/mental-health/chat', async (req: Request, res: Response) => {
  const message = typeof req.body.message === 'string' ? req.body.message.trim() : '';
  const history = Array.isArray(req.body.history) ? req.body.history : [];

  if (message.length < 2 || message.length > 500) {
    return res.status(400).json({ error: 'Message must be between 2 and 500 characters.' });
  }

  try {
    const reply = MENTAL_HEALTH_AI_MODE === 'live' && MENTAL_HEALTH_AI_ENDPOINT
      ? await fetchExternalMentalHealthReply(message, history)
      : generateSupportiveReply(message);

    return res.json({
      mode: MENTAL_HEALTH_AI_MODE === 'live' && MENTAL_HEALTH_AI_ENDPOINT ? 'live' : 'mock',
      reply,
      disclaimer: 'Supportive guidance only. This assistant is not emergency care.',
    });
  } catch {
    return res.json({
      mode: 'mock-fallback',
      reply: generateSupportiveReply(message),
      disclaimer: 'Supportive guidance only. This assistant is not emergency care.',
      error: 'Live AI provider unavailable. Fallback response returned.',
    });
  }
});

app.post('/api/support-worker-requests', (req: Request, res: Response) => {
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const reason = typeof req.body.reason === 'string' ? req.body.reason.trim() : '';
  const preferredContact = typeof req.body.preferredContact === 'string' ? req.body.preferredContact.trim() : 'email';
  const urgent = req.body.urgent === true;

  if (name.length < 2 || name.length > 100) {
    return res.status(400).json({ error: 'Please enter your name (2-100 characters).' });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }
  if (reason.length < 10 || reason.length > 1200) {
    return res.status(400).json({ error: 'Please add some context for support (10-1200 characters).' });
  }

  const ticketId = `SUP-${randomUUID().slice(0, 8).toUpperCase()}`;
  supportWorkerRequests.push({
    ticketId,
    name,
    email,
    reason,
    preferredContact,
    urgent,
    createdAt: new Date().toISOString(),
  });

  return res.status(201).json({
    success: true,
    ticketId,
    message: 'Support worker request sent. A team member will follow up soon.',
  });
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

app.post('/api/payout-methods', (req: Request, res: Response) => {
  const {
    userId,
    primaryMethod,
    destinations,
    preferredCurrency,
    verified = false,
    autoPayoutEnabled = false,
    status = 'active',
    paypalVerified,
    stripeConnected,
  } = req.body;
  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'userId is required' });
  }
  if (typeof primaryMethod !== 'string') {
    return res.status(400).json({ error: 'primaryMethod is required' });
  }
  if (!PAYOUT_METHOD_TYPES.includes(primaryMethod)) {
    return res.status(400).json({ error: 'Invalid primary payout method' });
  }
  if (!destinations || typeof destinations !== 'object' || Object.keys(destinations).length === 0) {
    return res.status(400).json({ error: 'At least one payout destination is required' });
  }

  try {
    const method = payoutService.registerWinnerPayoutMethod({
      userId,
      primaryMethod,
      destinations,
      preferredCurrency,
      verified: Boolean(verified),
      autoPayoutEnabled: Boolean(autoPayoutEnabled),
      status,
      paypalVerified: typeof paypalVerified === 'boolean' ? paypalVerified : Boolean(destinations.paypal),
      stripeConnected: typeof stripeConnected === 'boolean' ? stripeConnected : Boolean(destinations.stripe),
    });
    res.status(201).json(method);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

app.post('/api/draws/:drawId/complete-and-payout', (req: Request, res: Response) => {
  const { drawId } = req.params;
  const { winners, ringFencedAccount, insurancePolicy } = req.body;

  if (!Array.isArray(winners) || winners.length === 0) {
    return res.status(400).json({ error: 'winners array is required' });
  }
  if (!ringFencedAccount?.id || typeof ringFencedAccount.balance !== 'number') {
    return res.status(400).json({ error: 'ringFencedAccount with id and balance is required' });
  }

  try {
    const result = payoutService.completeDrawAndPayout({
      drawId,
      winners,
      ringFencedAccount,
      insurancePolicy,
    });
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

app.get('/api/draws/:drawId/payouts', (req: Request, res: Response) => {
  res.json(payoutService.getPayoutsByDraw(req.params.drawId));
});

app.get('/api/payouts/:payoutId', (req: Request, res: Response) => {
  const payout = payoutService.getPayout(req.params.payoutId);
  if (!payout) {
    return res.status(404).json({ error: 'Payout not found' });
  }
  res.json(payout);
});

app.get('/api/payouts/:payoutId/audit', (req: Request, res: Response) => {
  res.json(payoutService.getAuditTrail(req.params.payoutId));
});

app.get('/api/payouts/:payoutId/recovery', (req: Request, res: Response) => {
  const recovery = payoutService.getRecovery(req.params.payoutId);
  if (!recovery) {
    return res.status(404).json({ error: 'Recovery record not found' });
  }
  res.json(recovery);
});

app.get('/api/draws/:drawId/payout-batch', (req: Request, res: Response) => {
  const batch = payoutService.getBatch(req.params.drawId);
  if (!batch) {
    return res.status(404).json({ error: 'Batch not found' });
  }
  res.json(batch);
});

app.get('/api/draws/:drawId/payout-dashboard', (req: Request, res: Response) => {
  res.json(payoutService.getDashboard(req.params.drawId));
});

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'UAE Competition Platform API (Transparent & Compliant)', version: '1.0.0' });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n✨ UAE Competition API running on http://localhost:${PORT}`);
  console.log(`📡 CORS enabled for http://localhost:5173`);
  console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
  console.log(`📊 Competitions: http://localhost:${PORT}/api/competitions\n`);
});
