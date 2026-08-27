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

// Helper: calculate draw-readiness fields based on 2.5x profit model
function calcDrawReady(prizeAmount: number, entryPrice: number, soldEntries: number) {
  // Entries needed so revenue = prizeAmount * 2.5 (i.e., prize covered + 2.5x profit)
  // Revenue needed = prizeAmount / (1 / 2.5) ... re: problem spec:
  // "Need to sell entries worth: prizeAmount / 2.5"  → break-even threshold
  const revenueNeeded = prizeAmount / 2.5;
  const entriesNeededForDraw = Math.ceil(revenueNeeded / entryPrice);
  const rawProgress = (soldEntries * entryPrice) / revenueNeeded;
  const drawReadyProgress = Math.min(Math.round(rawProgress * 100), 100);
  const drawReadyStatus: 'not_ready' | 'ready' | 'in_draw' =
    drawReadyProgress >= 100 ? 'ready' : 'not_ready';
  const entriesRemaining = Math.max(entriesNeededForDraw - soldEntries, 0);
  return { drawReadyProgress, drawReadyStatus, entriesNeededForDraw, entriesRemaining };
}

// Mock competitions data - TRANSPARENT STRUCTURE
const competitionsRaw = [
  {
    id: 1,
    title: 'WIN 10,000 AED CASH',
    description: 'Guaranteed Winner - Fair Live Draw',
    prizeType: 'CASH COMPETITION',
    prizeAmount: 10000,
    prizeDetails: {
      currency: 'AED',
      description: 'Cash Prize'
    },
    entryPrice: 1,
    totalEntries: 10000,
    soldEntries: 7248,
    endsIn: '2 days 14 hours 36 minutes 28 seconds',
    tags: ['Guaranteed Winner', 'Fair Live Draw', 'Transparent Odds'],
    profitMargin: '40% House, 60% Prize Pool (Transparent)',
    expectedWinners: 1,
  },
  {
    id: 2,
    title: 'WIN THE ULTIMATE UAE DREAM PACKAGE',
    description: 'Luxury Stay, Premium Experiences, Travel & Lifestyle',
    prizeType: 'LIFESTYLE PACKAGE',
    prizeAmount: 500000,
    prizeDetails: {
      currency: 'AED',
      description: 'Luxury Experience Package',
      includes: ['5-star luxury stay', 'Premium experiences', 'Travel package', 'Lifestyle experiences']
    },
    entryPrice: 1,
    totalEntries: 1000000,
    soldEntries: 856000,
    endsIn: '5 days 14 hours 36 minutes 28 seconds',
    tags: ['Luxury Experience', 'Fair Live Draw', 'Transparent Odds'],
    profitMargin: '40% House, 60% Prize Pool (Transparent)',
    expectedWinners: 1,
  },
  {
    id: 3,
    title: 'WIN £50,000 CASH',
    description: 'Win £50,000 - Fair Live Draw',
    prizeType: 'CASH COMPETITION',
    prizeAmount: 50000,
    prizeDetails: {
      currency: 'GBP',
      description: 'Cash Prize',
    },
    entryPrice: 1,
    // 50K / 2.5 = 20,000 entries needed; pre-seed at 62.5% → 12,500 entries
    totalEntries: 50000,
    soldEntries: 12500,
    endsIn: '7 days 0 hours 0 minutes 0 seconds',
    tags: ['Guaranteed Winner', 'Fair Live Draw', 'Transparent Odds'],
    profitMargin: '2.5x Profit Model (Transparent)',
    expectedWinners: 1,
  },
  {
    id: 4,
    title: 'WIN £500,000 CASH',
    description: 'Win £500,000 - Fair Live Draw',
    prizeType: 'CASH COMPETITION',
    prizeAmount: 500000,
    prizeDetails: {
      currency: 'GBP',
      description: 'Cash Prize',
    },
    entryPrice: 1,
    // 500K / 2.5 = 200,000 entries needed; pre-seed at 62.5% → 125,000 entries
    totalEntries: 500000,
    soldEntries: 125000,
    endsIn: '14 days 0 hours 0 minutes 0 seconds',
    tags: ['Guaranteed Winner', 'Fair Live Draw', 'Transparent Odds'],
    profitMargin: '2.5x Profit Model (Transparent)',
    expectedWinners: 1,
  },
];

const competitions = competitionsRaw.map((c) => ({
  ...c,
  ...calcDrawReady(c.prizeAmount, c.entryPrice, c.soldEntries),
}));

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
