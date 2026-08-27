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

// Mock competitions data - TRANSPARENT STRUCTURE
const competitions = [
  {
    id: 1,
    title: 'WIN £2,000 CASH OR EQUIVALENT',
    description: 'WIN £2,000 Cash OR £2,000 Equivalent - Guaranteed Winner - Fair Live Draw',
    prizeType: 'CASH COMPETITION',
    prizeAmount: 2000,
    prizeDetails: {
      currency: 'GBP',
      description: '£2,000 Cash Prize or Equivalent',
      cashAlternative: true,
      cashAlternativeAmount: 2000,
      alternatives: [
        { type: 'cash', amount: 2000, description: '£2,000 GBP cash' },
        { type: 'physical_prize', description: '£2,000 equivalent prize' },
      ],
    },
    entryPrice: 1,
    totalEntries: 5000,
    soldEntries: 3125,
    endsIn: '2 days 14 hours 36 minutes 28 seconds',
    tags: ['Guaranteed Winner', 'Fair Live Draw', 'Transparent Odds', 'Cash Alternative Available'],
    profitMargin: '40% House, 60% Prize Pool (Transparent)',
    expectedWinners: 1,
  },
  {
    id: 2,
    title: 'WIN LUXURY EXPERIENCE PACKAGE OR £100K CASH',
    description: 'WIN Full Luxury Package (5-Star Stays, Dining, Travel, Experiences) OR £100,000 Cash Equivalent',
    prizeType: 'LIFESTYLE PACKAGE',
    prizeAmount: 100000,
    prizeDetails: {
      currency: 'GBP',
      description: 'Luxury Experience Package or £100,000 Cash',
      includes: ['5-star luxury stays', 'Premium dining experiences', 'Travel package', 'Lifestyle experiences'],
      cashAlternative: true,
      cashAlternativeAmount: 100000,
      alternatives: [
        { type: 'physical_prize', description: 'Full luxury package (5-star stays, dining, travel, experiences)' },
        { type: 'cash', amount: 100000, description: '£100,000 GBP cash equivalent' },
      ],
    },
    entryPrice: 5,
    totalEntries: 250000,
    soldEntries: 156250,
    endsIn: '5 days 14 hours 36 minutes 28 seconds',
    tags: ['Luxury Experience', 'Fair Live Draw', 'Transparent Odds', 'Cash Alternative Available'],
    profitMargin: '40% House, 60% Prize Pool (Transparent)',
    expectedWinners: 1,
  },
  {
    id: 3,
    title: 'WIN £50,000 CASH OR EQUIVALENT',
    description: 'WIN £50,000 Cash OR £50,000 Equivalent - Your Choice',
    prizeType: 'CASH COMPETITION',
    prizeAmount: 50000,
    prizeDetails: {
      currency: 'GBP',
      description: '£50,000 Cash Prize or Equivalent',
      cashAlternative: true,
      cashAlternativeAmount: 50000,
      alternatives: [
        { type: 'cash', amount: 50000, description: '£50,000 GBP cash' },
        { type: 'physical_prize', description: '£50,000 equivalent prize' },
      ],
    },
    entryPrice: 5,
    totalEntries: 125000,
    soldEntries: 78125,
    endsIn: '7 days 4 hours 0 minutes 0 seconds',
    tags: ['Guaranteed Winner', 'Fair Live Draw', 'Transparent Odds', 'Cash Alternative Available'],
    profitMargin: '40% House, 60% Prize Pool (Transparent)',
    expectedWinners: 1,
  },
  {
    id: 4,
    title: 'WIN £500,000 CASH OR EQUIVALENT',
    description: 'WIN £500,000 Cash OR £500,000 Equivalent - Life-Changing Prize',
    prizeType: 'CASH COMPETITION',
    prizeAmount: 500000,
    prizeDetails: {
      currency: 'GBP',
      description: '£500,000 Cash Prize or Equivalent',
      cashAlternative: true,
      cashAlternativeAmount: 500000,
      alternatives: [
        { type: 'cash', amount: 500000, description: '£500,000 GBP cash' },
        { type: 'physical_prize', description: '£500,000 equivalent prize' },
      ],
    },
    entryPrice: 10,
    totalEntries: 125000,
    soldEntries: 78125,
    endsIn: '14 days 0 hours 0 minutes 0 seconds',
    tags: ['Guaranteed Winner', 'Fair Live Draw', 'Transparent Odds', 'Cash Alternative Available'],
    profitMargin: '40% House, 60% Prize Pool (Transparent)',
    expectedWinners: 1,
  },
  {
    id: 5,
    title: 'WIN £5,000,000 CASH OR EQUIVALENT',
    description: 'WIN £5,000,000 Cash OR £5,000,000 Equivalent - Life-Changing Jackpot',
    prizeType: 'JACKPOT COMPETITION',
    prizeAmount: 5000000,
    prizeDetails: {
      currency: 'GBP',
      description: '£5,000,000 Cash Prize or Equivalent',
      cashAlternative: true,
      cashAlternativeAmount: 5000000,
      alternatives: [
        { type: 'cash', amount: 5000000, description: '£5,000,000 GBP cash' },
        { type: 'physical_prize', description: '£5,000,000 equivalent prize' },
      ],
    },
    entryPrice: 25,
    totalEntries: 500000,
    soldEntries: 312500,
    endsIn: '30 days 0 hours 0 minutes 0 seconds',
    tags: ['Coming Soon', 'Fair Live Draw', 'Transparent Odds', 'Cash Alternative Available'],
    profitMargin: '40% House, 60% Prize Pool (Transparent)',
    expectedWinners: 1,
  },
  {
    id: 6,
    title: 'WIN WEEKLY £10,000 CASH OR EQUIVALENT',
    description: 'WIN £10,000 Cash OR £10,000 Equivalent - Weekly Draw Every Friday',
    prizeType: 'WEEKLY CASH DRAW',
    prizeAmount: 10000,
    prizeDetails: {
      currency: 'GBP',
      description: '£10,000 Weekly Cash Prize or Equivalent',
      cashAlternative: true,
      cashAlternativeAmount: 10000,
      alternatives: [
        { type: 'cash', amount: 10000, description: '£10,000 GBP cash' },
        { type: 'physical_prize', description: '£10,000 equivalent prize' },
      ],
    },
    entryPrice: 1,
    totalEntries: 25000,
    soldEntries: 15625,
    endsIn: '3 days 0 hours 0 minutes 0 seconds',
    tags: ['Weekly Draw', 'Fair Live Draw', 'Transparent Odds', 'Cash Alternative Available'],
    profitMargin: '40% House, 60% Prize Pool (Transparent)',
    expectedWinners: 1,
  },
  {
    id: 7,
    title: 'WIN 3 PREMIUM SUPERCARS OR £135K CASH',
    description: 'WIN 3 Premium Supercars OR £135,000 Cash Equivalent - CASH OR CARS, YOU CHOOSE!',
    prizeType: 'SUPERCAR COMPETITION',
    prizeAmount: 135000,
    prizeDetails: {
      currency: 'GBP',
      description: 'Choose any 3 Premium Supercars from curated list or £135,000 cash',
      includes: [
        'Porsche 911 Turbo (£120K)',
        'Lamborghini Huracán (£135K)',
        'Mercedes-AMG GT63 (£130K)',
        'Ferrari F8 Tributo (up to £135K)',
        'McLaren 570S (£135K)',
        'Aston Martin DB11 (£130K)',
        'Jaguar F-Type SVR (£85K)',
        'BMW M8 (£105K)',
        'And 10+ more premium options',
      ],
      cashAlternative: true,
      cashAlternativeAmount: 135000,
      alternatives: [
        { type: 'physical_prize', description: 'Winner selects 3 vehicles from premium supercar list' },
        { type: 'cash', amount: 135000, description: '£135,000 GBP cash equivalent' },
      ],
    },
    entryPrice: 10,
    totalEntries: 33750,
    soldEntries: 21094,
    endsIn: '21 days 0 hours 0 minutes 0 seconds',
    tags: ['Monthly Draw', 'Fair Live Draw', 'Transparent Odds', 'Cash Alternative Available', 'Cash or Cars - You Choose!'],
    profitMargin: '40% House, 60% Prize Pool (Transparent)',
    expectedWinners: 1,
  },
  {
    id: 8,
    title: 'WIN UK ENTREPRENEUR DREAM OR £320K CASH',
    description: 'WIN UK Business Starter Dream Package OR £320,000 Cash Equivalent - CASH OR BUSINESS, YOU CHOOSE!',
    prizeType: 'ENTREPRENEUR PACKAGE',
    prizeAmount: 320000,
    prizeDetails: {
      currency: 'GBP',
      description: 'Complete UK Entrepreneur Package or £320,000 cash',
      includes: [
        '£80,000 cash',
        '1 Premium Supercar (Porsche 911 Turbo or equivalent, £120K value)',
        'UK Limited Company setup (£3-5K value)',
        'Digital Business Package - Website + Mobile App + Hosting (£20-30K value)',
        'Luxury Lifestyle package (£80K value)',
      ],
      cashAlternative: true,
      cashAlternativeAmount: 320000,
      alternatives: [
        { type: 'physical_prize', description: 'Complete entrepreneur package (cash + supercar + Ltd Co + digital + lifestyle)' },
        { type: 'cash', amount: 320000, description: '£320,000 GBP cash equivalent' },
      ],
    },
    entryPrice: 25,
    totalEntries: 32000,
    soldEntries: 20000,
    endsIn: '28 days 0 hours 0 minutes 0 seconds',
    tags: ['Quarterly Draw', 'Fair Live Draw', 'Transparent Odds', 'Cash Alternative Available', 'Cash or Business - You Choose!'],
    profitMargin: '40% House, 60% Prize Pool (Transparent)',
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
    currency: 'GBP',
    entryNumbers: Array.from({ length: quantity }, () => `${competition.id}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`),
    prizeInfo: {
      cashAlternative: competition.prizeDetails.cashAlternative ?? false,
      cashAlternativeAmount: competition.prizeDetails.cashAlternativeAmount ?? null,
      alternatives: competition.prizeDetails.alternatives ?? [],
      note: competition.prizeDetails.cashAlternative
        ? 'Winner may choose physical prize or cash equivalent. Notify fulfilment team of winner\'s choice (prizeOption: "cash" | "physical").'
        : undefined,
    },
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
