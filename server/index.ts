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
    ringFencedPercent: 70,
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
    ringFencedPercent: 70,
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
    ringFencedPercent: 70,
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
    ringFencedPercent: 70,
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
    ringFencedPercent: 70,
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
    ringFencedPercent: 70,
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
    ringFencedPercent: 70,
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
    ringFencedPercent: 70,
  },
];

// Ring-fenced accounts data
const ringFencedAccounts = [
  {
    id: 'master',
    accountName: 'LuxePrize Master Ring-Fenced Account',
    accountType: 'master',
    accountHolder: 'Prize Fund Trustee',
    currentBalance: 1487256.43,
    reservedForPrizes: 987456.00,
    availableBalance: 499800.43,
    reservePercentage: 5,
    insuranceProvider: 'Lloyd\'s of London Syndicate',
    insuranceAmount: 2000000,
    insurancePremiumMonthly: 20000,
    insuranceActive: true,
    bankName: 'Barclays Business',
    auditStatus: 'verified',
    lastAuditDate: '2026-07-31',
    isActive: true,
  },
  {
    id: 'daily',
    accountName: 'Daily Prize Draw Ring-Fenced Account',
    accountType: 'daily',
    accountHolder: 'Prize Fund Trustee',
    currentBalance: 487.50,
    reservedForPrizes: 487.50,
    availableBalance: 0,
    reservePercentage: 5,
    reserveFundAmount: 25,
    insuranceProvider: 'Lloyd\'s of London Syndicate',
    insuranceAmount: 5000,
    insurancePremiumMonthly: 50,
    insuranceActive: true,
    bankName: 'Barclays Business',
    auditStatus: 'verified',
    lastAuditDate: '2026-08-24',
    targetPool: 500,
    entryPrice: 2.50,
    auditFrequency: 'Weekly',
    isActive: true,
  },
  {
    id: 'weekly',
    accountName: 'Weekly Prize Draw Ring-Fenced Account',
    accountType: 'weekly',
    accountHolder: 'Prize Fund Trustee',
    currentBalance: 3287.50,
    reservedForPrizes: 3287.50,
    availableBalance: 0,
    reservePercentage: 5,
    reserveFundAmount: 175,
    insuranceProvider: 'Lloyd\'s of London Syndicate',
    insuranceAmount: 35000,
    insurancePremiumMonthly: 350,
    insuranceActive: true,
    bankName: 'Barclays Business',
    auditStatus: 'verified',
    lastAuditDate: '2026-07-31',
    targetPool: 3500,
    entryPrice: 5,
    auditFrequency: 'Monthly',
    isActive: true,
  },
  {
    id: 'monthly',
    accountName: 'Monthly Mega Draw Ring-Fenced Account',
    accountType: 'monthly',
    accountHolder: 'Prize Fund Trustee',
    currentBalance: 13845.00,
    reservedForPrizes: 13845.00,
    availableBalance: 0,
    reservePercentage: 5,
    reserveFundAmount: 700,
    insuranceProvider: 'Lloyd\'s of London Syndicate',
    insuranceAmount: 140000,
    insurancePremiumMonthly: 1400,
    insuranceActive: true,
    bankName: 'Barclays Business',
    auditStatus: 'verified',
    lastAuditDate: '2026-07-31',
    targetPool: 14000,
    entryPrice: 10,
    auditFrequency: 'Monthly',
    isActive: true,
  },
  {
    id: 'supercar',
    accountName: 'Supercar Special Ring-Fenced Account',
    accountType: 'supercar',
    accountHolder: 'Prize Fund Trustee',
    currentBalance: 25000.00,
    reservedForPrizes: 25000.00,
    availableBalance: 0,
    reservePercentage: 5,
    reserveFundAmount: 1250,
    insuranceProvider: 'Lloyd\'s of London Syndicate',
    insuranceAmount: 250000,
    insurancePremiumMonthly: 2500,
    insuranceActive: true,
    bankName: 'Barclays Business',
    auditStatus: 'verified',
    lastAuditDate: '2026-08-01',
    targetPool: 25000,
    entryPrice: 25,
    auditFrequency: 'Per draw',
    isActive: true,
  },
  {
    id: 'dream_app',
    accountName: 'Dream App Prize Ring-Fenced Account',
    accountType: 'dream_app',
    accountHolder: 'Prize Fund Trustee',
    currentBalance: 50000.00,
    reservedForPrizes: 50000.00,
    availableBalance: 0,
    reservePercentage: 5,
    reserveFundAmount: 2500,
    insuranceProvider: 'Lloyd\'s of London Syndicate',
    insuranceAmount: 500000,
    insurancePremiumMonthly: 5000,
    insuranceActive: true,
    bankName: 'Barclays Business',
    auditStatus: 'verified',
    lastAuditDate: '2026-08-01',
    targetPool: 50000,
    entryPrice: 50,
    auditFrequency: 'Per draw',
    isActive: true,
  },
  {
    id: 'world_record',
    accountName: 'World Record Prize Ring-Fenced Account',
    accountType: 'world_record',
    accountHolder: 'Prize Fund Trustee',
    currentBalance: 987456.00,
    reservedForPrizes: 987456.00,
    availableBalance: 0,
    reservePercentage: 5,
    insuranceProvider: 'Lloyd\'s of London Syndicate',
    insuranceAmount: 2000000,
    insurancePremiumMonthly: 20000,
    insuranceActive: true,
    bankName: 'Barclays Business',
    auditStatus: 'verified',
    lastAuditDate: '2026-07-31',
    targetPool: 1000000,
    entryPrice: 10,
    auditFrequency: 'Monthly + quarterly third-party',
    interestAccrual: true,
    isActive: true,
  },
];

const ringFencedTransactions = [
  { id: 'txn-001', accountId: 'weekly', type: 'entry_deposit', amount: 3.50, description: 'Entry deposit – Weekly Draw', date: '2026-08-31T14:22:00Z', status: 'completed', verified: true },
  { id: 'txn-002', accountId: 'monthly', type: 'entry_deposit', amount: 7.00, description: 'Entry deposit – Monthly Mega Draw', date: '2026-08-31T13:55:00Z', status: 'completed', verified: true },
  { id: 'txn-003', accountId: 'supercar', type: 'entry_deposit', amount: 17.50, description: 'Entry deposit – Supercar Special', date: '2026-08-31T13:10:00Z', status: 'completed', verified: true },
  { id: 'txn-004', accountId: 'world_record', type: 'interest_credit', amount: 412.30, description: 'Monthly interest accrual – World Record Account', date: '2026-08-01T00:00:00Z', status: 'completed', verified: true },
  { id: 'txn-005', accountId: 'daily', type: 'prize_payout', amount: -487.50, description: 'Daily draw winner payout', date: '2026-08-30T20:00:00Z', status: 'completed', verified: true },
];

const guaranteeCertificates = [
  { id: 'cert-daily-001', accountId: 'daily', type: 'ring_fence', status: 'active', issuedDate: '2026-08-01', expiryDate: '2026-12-31', certificateNumber: 'RF-DAILY-2026-001', guaranteedAmount: 5000 },
  { id: 'cert-weekly-001', accountId: 'weekly', type: 'ring_fence', status: 'active', issuedDate: '2026-08-01', expiryDate: '2026-12-31', certificateNumber: 'RF-WEEKLY-2026-001', guaranteedAmount: 35000 },
  { id: 'cert-monthly-001', accountId: 'monthly', type: 'ring_fence', status: 'active', issuedDate: '2026-08-01', expiryDate: '2026-12-31', certificateNumber: 'RF-MONTHLY-2026-001', guaranteedAmount: 140000 },
  { id: 'cert-supercar-001', accountId: 'supercar', type: 'ring_fence', status: 'active', issuedDate: '2026-08-01', expiryDate: '2026-12-31', certificateNumber: 'RF-SUPERCAR-2026-001', guaranteedAmount: 250000 },
  { id: 'cert-dreamapp-001', accountId: 'dream_app', type: 'ring_fence', status: 'active', issuedDate: '2026-08-01', expiryDate: '2026-12-31', certificateNumber: 'RF-DREAMAPP-2026-001', guaranteedAmount: 500000 },
  { id: 'cert-wr-001', accountId: 'world_record', type: 'ring_fence', status: 'active', issuedDate: '2026-08-01', expiryDate: '2026-12-31', certificateNumber: 'RF-WORLDREC-2026-001', guaranteedAmount: 2000000 },
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

// Ring-fencing routes
app.get('/api/ring-fencing/accounts', (_req: Request, res: Response) => {
  const summary = ringFencedAccounts;
  const totalRingFenced = ringFencedAccounts.reduce((sum, a) => sum + a.reservedForPrizes, 0);
  const totalInsurance = ringFencedAccounts.reduce((sum, a) => sum + a.insuranceAmount, 0);
  res.json({ accounts: summary, totalRingFenced, totalInsurance, allVerified: true });
});

app.get('/api/ring-fencing/accounts/:id', (req: Request, res: Response) => {
  const account = ringFencedAccounts.find(a => a.id === req.params.id);
  if (!account) return res.status(404).json({ error: 'Account not found' });
  res.json(account);
});

app.get('/api/ring-fencing/transactions', (_req: Request, res: Response) => {
  res.json(ringFencedTransactions);
});

app.get('/api/ring-fencing/certificates', (_req: Request, res: Response) => {
  res.json(guaranteeCertificates);
});

app.get('/api/ring-fencing/certificates/:id', (req: Request, res: Response) => {
  const cert = guaranteeCertificates.find(c => c.id === req.params.id);
  if (!cert) return res.status(404).json({ error: 'Certificate not found' });
  res.json(cert);
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
