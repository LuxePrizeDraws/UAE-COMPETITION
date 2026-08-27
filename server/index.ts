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

const calcDrawReady = (soldEntries: number, totalEntries: number): number => {
  if (!totalEntries) return 0;
  return Number(((soldEntries / totalEntries) * 100).toFixed(1));
};

// Mock competitions data - TRANSPARENT STRUCTURE
const competitionsRaw = [
  {
    id: 1,
    title: 'WIN £2,000 CASH',
    description: 'Guaranteed Winner - Fair Live Draw',
    prizeType: 'CASH COMPETITION',
    prizeAmount: 2000,
    prizeDetails: {
      currency: 'GBP',
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
    title: 'WIN THE ULTIMATE UK LIFESTYLE PACKAGE',
    description: 'Luxury Stay, Premium Experiences, Travel & Lifestyle',
    prizeType: 'LIFESTYLE PACKAGE',
    prizeAmount: 100000,
    prizeDetails: {
      currency: 'GBP',
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
    description: 'Massive guaranteed cash payout',
    prizeType: 'CASH COMPETITION',
    prizeAmount: 50000,
    prizeDetails: {
      currency: 'GBP',
      description: 'Cash Prize'
    },
    entryPrice: 5,
    totalEntries: 20000,
    soldEntries: 12500,
    endsIn: '7 days 8 hours 20 minutes 15 seconds',
    tags: ['Cash Prize', 'Fair Live Draw', 'Transparent Odds'],
    profitMargin: '40% House, 60% Prize Pool (Transparent)',
    expectedWinners: 1,
  },
  {
    id: 4,
    title: 'WIN £500,000 CASH',
    description: 'Life-changing half-million cash win',
    prizeType: 'MEGA CASH COMPETITION',
    prizeAmount: 500000,
    prizeDetails: {
      currency: 'GBP',
      description: 'Mega Cash Prize'
    },
    entryPrice: 10,
    totalEntries: 100000,
    soldEntries: 62500,
    endsIn: '15 days 2 hours 42 minutes 11 seconds',
    tags: ['Mega Prize', 'Fair Live Draw', 'Transparent Odds'],
    profitMargin: '40% House, 60% Prize Pool (Transparent)',
    expectedWinners: 1,
  },
  {
    id: 5,
    title: 'WIN £5,000,000 CASH',
    description: 'Coming soon: our biggest UK draw ever',
    prizeType: 'COMING SOON',
    prizeAmount: 5000000,
    prizeDetails: {
      currency: 'GBP',
      description: 'Grand Jackpot'
    },
    entryPrice: 20,
    totalEntries: 1000000,
    soldEntries: 0,
    endsIn: 'Coming Soon',
    tags: ['Grand Prize', 'Coming Soon', 'Transparent Odds'],
    profitMargin: '40% House, 60% Prize Pool (Transparent)',
    expectedWinners: 1,
  },
  {
    id: 6,
    title: 'WIN £10,000 CASH WEEKLY',
    description: 'Weekly guaranteed winner with fair live draw',
    prizeType: 'WEEKLY CASH DRAW',
    prizeAmount: 10000,
    prizeDetails: {
      currency: 'GBP',
      description: 'Weekly Cash Prize'
    },
    entryPrice: 1,
    totalEntries: 4000,
    soldEntries: 2500,
    endsIn: '3 days 10 hours 05 minutes 42 seconds',
    tags: ['Weekly Winner', 'Fair Live Draw', 'Transparent Odds'],
    profitMargin: '2.5x Revenue Model',
    expectedWinners: 1,
  },
  {
    id: 7,
    title: 'WIN 3 PREMIUM SUPERCARS',
    description: 'Monthly supercar draw with transparent live winner reveal',
    prizeType: 'SUPERCAR COMPETITION',
    prizeAmount: 135000,
    prizeDetails: {
      currency: 'GBP',
      description: '3 Premium Supercars Package',
      includes: ['Range Rover Sport', 'Mercedes-AMG', 'Porsche 911']
    },
    entryPrice: 10,
    totalEntries: 5400,
    soldEntries: 3375,
    endsIn: '22 days 18 hours 12 minutes 05 seconds',
    tags: ['Supercars', 'Fair Live Draw', 'Transparent Odds'],
    profitMargin: '2.5x Revenue Model',
    expectedWinners: 1,
  },
  {
    id: 8,
    title: "WIN THE ULTIMATE UK ENTREPRENEUR'S DREAM",
    description: 'Win £80K Cash + Supercar + UK Business Setup + Digital Agency Package + Luxury Lifestyle',
    prizeType: 'ULTIMATE PRIZE',
    prizeAmount: 320000,
    prizeDetails: {
      currency: 'GBP',
      description: 'Premium UK Business & Lifestyle Package',
      includes: [
        '£80,000 cash prize',
        '1 premium supercar (Mercedes-AMG / Porsche 911 / Range Rover Sport)',
        'Companies House registration',
        'Articles of Association & MOA',
        'Director appointment documentation',
        'Registered office address setup',
        'Company bank account facilitation',
        'Tax ID (UTR) application support',
        'Professional website build (5-10 pages, custom design)',
        'Mobile app development (iOS/Android)',
        'Cloud hosting (12 months included)',
        'Domain name (1 year)',
        'SSL certificate',
        'Email hosting setup',
        'SEO optimization',
        'Analytics dashboard',
        '1-year personal concierge service',
        'Luxury travel package (5-star hotel stays x4)',
        'Fine dining experiences (12 x Michelin-starred restaurants)',
        'Spa & wellness retreat',
        'VIP event access'
      ]
    },
    entryPrice: 20,
    totalEntries: 6400,
    soldEntries: 4000,
    endsIn: '30 days 0 hours 0 minutes 0 seconds',
    tags: ['Ultimate Prize', 'Business Starter', 'Luxury Lifestyle', 'Fair Live Draw', 'Transparent Odds', 'Entrepreneur Package'],
    profitMargin: '2.5x Revenue Model',
    expectedWinners: 1,
  }
];

const competitions = competitionsRaw.map((competition) => ({
  ...competition,
  drawReady: calcDrawReady(competition.soldEntries, competition.totalEntries)
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
    currency: competition.prizeDetails.currency,
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
