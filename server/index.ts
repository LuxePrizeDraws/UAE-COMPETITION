import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

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

// Mock competitions data - 2.5x PROFIT MODEL (TRANSPARENT STRUCTURE)
// Formula: Revenue = Prize × 2.5 | House profit = Revenue - Prize | Margin: 60% house / 40% prize
// Pre-seeded at 62.5% progress (soldEntries = entriesNeededForDraw × 0.625)
const competitions = [
  {
    id: 1,
    title: 'WIN £2,000 CASH',
    description: 'Weekly cash prize draw — Guaranteed Winner, Fair Live Draw',
    prizeType: 'CASH COMPETITION',
    prizeAmount: 2000,
    prizeDetails: {
      currency: 'GBP',
      description: '£2,000 Cash Prize',
    },
    entryPrice: 1,
    totalEntries: 5000,
    entriesNeededForDraw: 5000,
    soldEntries: 3125,           // 5000 × 0.625
    entriesRemaining: 1875,
    drawReadyProgress: 62.5,
    houseProfitPerDraw: 3000,
    frequency: 'Weekly',
    annualProfit: 156000,
    endsIn: '2 days 14 hours 36 minutes 28 seconds',
    tags: ['Guaranteed Winner', 'Fair Live Draw', 'Transparent Odds', 'Weekly Draw'],
    profitMargin: '60% House, 40% Prize Pool (Transparent)',
    expectedWinners: 1,
  },
  {
    id: 2,
    title: 'WIN THE ULTIMATE LUXURY EXPERIENCE PACKAGE',
    description: '5-Star Luxury Stay, Premium Experiences, Travel & Lifestyle — Worth £100,000',
    prizeType: 'LUXURY EXPERIENCE',
    prizeAmount: 100000,
    prizeDetails: {
      currency: 'GBP',
      description: '£100,000 Luxury Experience Package',
      includes: ['5-star luxury stay', 'Premium experiences', 'International travel package', 'Exclusive lifestyle experiences'],
    },
    entryPrice: 5,
    totalEntries: 50000,
    entriesNeededForDraw: 50000,
    soldEntries: 31250,          // 50000 × 0.625
    entriesRemaining: 18750,
    drawReadyProgress: 62.5,
    houseProfitPerDraw: 150000,
    frequency: 'Monthly',
    annualProfit: 1800000,
    endsIn: '5 days 14 hours 36 minutes 28 seconds',
    tags: ['Luxury Experience', 'Fair Live Draw', 'Transparent Odds', 'Monthly Draw'],
    profitMargin: '60% House, 40% Prize Pool (Transparent)',
    expectedWinners: 1,
  },
  {
    id: 3,
    title: 'WIN £50,000 CASH',
    description: 'Monthly cash prize draw — Guaranteed Winner, Fair Live Draw',
    prizeType: 'CASH COMPETITION',
    prizeAmount: 50000,
    prizeDetails: {
      currency: 'GBP',
      description: '£50,000 Cash Prize',
    },
    entryPrice: 5,
    totalEntries: 25000,
    entriesNeededForDraw: 25000,
    soldEntries: 15625,          // 25000 × 0.625
    entriesRemaining: 9375,
    drawReadyProgress: 62.5,
    houseProfitPerDraw: 75000,
    frequency: 'Monthly',
    annualProfit: 900000,
    endsIn: '8 days 10 hours 22 minutes 45 seconds',
    tags: ['Guaranteed Winner', 'Fair Live Draw', 'Transparent Odds', 'Monthly Draw'],
    profitMargin: '60% House, 40% Prize Pool (Transparent)',
    expectedWinners: 1,
  },
  {
    id: 4,
    title: 'WIN £500,000 CASH',
    description: 'Quarterly cash mega-draw — Guaranteed Winner, Fair Live Draw',
    prizeType: 'CASH COMPETITION',
    prizeAmount: 500000,
    prizeDetails: {
      currency: 'GBP',
      description: '£500,000 Cash Prize',
    },
    entryPrice: 10,
    totalEntries: 125000,
    entriesNeededForDraw: 125000,
    soldEntries: 78125,          // 125000 × 0.625
    entriesRemaining: 46875,
    drawReadyProgress: 62.5,
    houseProfitPerDraw: 750000,
    frequency: 'Quarterly',
    annualProfit: 3000000,
    endsIn: '14 days 6 hours 15 minutes 10 seconds',
    tags: ['Guaranteed Winner', 'Fair Live Draw', 'Transparent Odds', 'Quarterly Draw'],
    profitMargin: '60% House, 40% Prize Pool (Transparent)',
    expectedWinners: 1,
  },
  {
    id: 5,
    title: 'WIN £5,000,000 CASH',
    description: 'Annual jackpot mega-draw — Change Your Life Forever',
    prizeType: 'JACKPOT COMPETITION',
    prizeAmount: 5000000,
    prizeDetails: {
      currency: 'GBP',
      description: '£5,000,000 Cash Jackpot',
    },
    entryPrice: 25,
    totalEntries: 500000,
    entriesNeededForDraw: 500000,
    soldEntries: 312500,         // 500000 × 0.625
    entriesRemaining: 187500,
    drawReadyProgress: 62.5,
    houseProfitPerDraw: 7500000,
    frequency: 'Annual',
    annualProfit: 7500000,
    endsIn: 'Coming Soon',
    tags: ['Jackpot', 'Fair Live Draw', 'Transparent Odds', 'Annual Draw', 'Coming Soon'],
    profitMargin: '60% House, 40% Prize Pool (Transparent)',
    expectedWinners: 1,
    comingSoon: true,
  },
  {
    id: 6,
    title: 'WIN £10,000 CASH — WEEKLY DRAW',
    description: 'Win £10,000 every week — Guaranteed Winner, Fair Live Draw',
    prizeType: 'CASH COMPETITION',
    prizeAmount: 10000,
    prizeDetails: {
      currency: 'GBP',
      description: '£10,000 Cash Prize',
    },
    entryPrice: 1,
    totalEntries: 25000,
    entriesNeededForDraw: 25000,
    soldEntries: 15625,          // 25000 × 0.625
    entriesRemaining: 9375,
    drawReadyProgress: 62.5,
    houseProfitPerDraw: 15000,
    frequency: 'Weekly',
    annualProfit: 780000,
    endsIn: '4 days 20 hours 48 minutes 12 seconds',
    tags: ['Guaranteed Winner', 'Fair Live Draw', 'Transparent Odds', 'Weekly Draw'],
    profitMargin: '60% House, 40% Prize Pool (Transparent)',
    expectedWinners: 1,
  },
  {
    id: 7,
    title: 'WIN 3 LUXURY SUPERCARS — MONTHLY DRAW',
    description: 'Three premium vehicles worth £135,000 — Guaranteed Winners, Fair Live Draw',
    prizeType: 'SUPERCAR COMPETITION',
    prizeAmount: 135000,
    prizeDetails: {
      currency: 'GBP',
      description: '3 Luxury Supercars (combined value £135,000)',
      includes: ['Premium Supercar #1', 'Premium Supercar #2', 'Premium Supercar #3'],
    },
    entryPrice: 10,
    totalEntries: 33750,
    entriesNeededForDraw: 33750,
    soldEntries: 21094,          // 33750 × 0.625 ≈ 21094
    entriesRemaining: 12656,
    drawReadyProgress: 62.5,
    houseProfitPerDraw: 202500,
    frequency: 'Monthly',
    annualProfit: 2430000,
    endsIn: '11 days 3 hours 29 minutes 55 seconds',
    tags: ['Supercar', 'Guaranteed Winners', 'Fair Live Draw', 'Transparent Odds', 'Monthly Draw'],
    profitMargin: '60% House, 40% Prize Pool (Transparent)',
    expectedWinners: 3,
  },
  {
    id: 8,
    title: 'WIN THE ULTIMATE UK ENTREPRENEUR DREAM',
    description: '£80K Cash + Supercar + UK Ltd Company Setup + Digital Package (Website & App) + Luxury Lifestyle — Total Value £320,000+',
    prizeType: 'ENTREPRENEUR PACKAGE',
    prizeAmount: 320000,
    prizeDetails: {
      currency: 'GBP',
      description: '£320,000+ UK Entrepreneur Dream Package',
      includes: [
        '£80,000 Cash',
        'Luxury Supercar',
        'UK Limited Company Setup (full Companies House registration)',
        'Custom Website + Mobile App + Hosting',
        'Luxury Lifestyle: Concierge, Travel, Fine Dining & Spa',
      ],
    },
    entryPrice: 25,
    totalEntries: 32000,
    entriesNeededForDraw: 32000,
    soldEntries: 20000,          // 32000 × 0.625
    entriesRemaining: 12000,
    drawReadyProgress: 62.5,
    houseProfitPerDraw: 480000,
    frequency: 'Quarterly',
    annualProfit: 1920000,
    endsIn: '18 days 7 hours 14 minutes 33 seconds',
    tags: ['Entrepreneur', 'Business', 'Supercar', 'Digital Package', 'Luxury Lifestyle', 'Quarterly Draw'],
    profitMargin: '60% House, 40% Prize Pool (Transparent)',
    expectedWinners: 1,
  },
];

// Routes
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'UAE Competition API is running' });
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
  const { quantity } = req.body;
  const competition = competitions.find(c => c.id === parseInt(req.params.id));
  
  if (!competition) {
    return res.status(404).json({ error: 'Competition not found' });
  }

  if (!quantity || quantity < 1) {
    return res.status(400).json({ error: 'Invalid quantity' });
  }

  const totalCost = quantity * competition.entryPrice;
  
  // Mock response - in production this would process payment
  res.json({
    success: true,
    message: 'Entry processed (mock)',
    competitionId: competition.id,
    quantity,
    totalCost,
    currency: 'AED',
    entryNumbers: Array.from({ length: quantity }, (_, i) => `${competition.id}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`),
  });
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
