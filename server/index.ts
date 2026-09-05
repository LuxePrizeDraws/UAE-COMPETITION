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
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow same-origin / server-to-server
    const allowed =
      origin.startsWith('http://localhost:') ||
      origin.endsWith('.app.github.dev') ||
      origin === (process.env.CLIENT_URL ?? '');
    return callback(null, allowed);
  },
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
  }
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
  const { quantity, prizeChoice } = req.body;
  const competition = competitions.find(c => c.id === parseInt(req.params.id));
  
  if (!competition) {
    return res.status(404).json({ error: 'Competition not found' });
  }

  const parsedQuantity = Number(quantity);
  if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1 || parsedQuantity > 100) {
    return res.status(400).json({ error: 'Invalid quantity' });
  }

  const validPrizeChoices = ['prize', 'cash'];
  const selectedPrizeChoice = validPrizeChoices.includes(prizeChoice) ? prizeChoice : 'prize';

  const totalCost = parsedQuantity * competition.entryPrice;
  
  // Mock response - in production this would process payment
  res.json({
    success: true,
    message: 'Entry processed (mock)',
    competitionId: competition.id,
    quantity: parsedQuantity,
    totalCost,
    currency: 'AED',
    prizeChoice: selectedPrizeChoice,
    entryNumbers: Array.from({ length: parsedQuantity }, () => `${competition.id}-${Math.random().toString(36).substring(2, 11).toUpperCase()}`),
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
