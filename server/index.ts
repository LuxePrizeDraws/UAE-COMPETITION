import express, { Express, NextFunction, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { computeOwnerFinancialSummary, createWithdrawal, OwnerLedger } from './adminFinance.js';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;
const API_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const OWNER_ID = process.env.OWNER_ID || 'owner-1';
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'owner@uaecompetition.com').toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;
const ADMIN_2FA_CODE = process.env.ADMIN_2FA_CODE || '123456';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-owner-secret-change-me';
const OWNER_PROFIT_SHARE = Number.parseFloat(process.env.OWNER_PROFIT_SHARE || '0.4');
const AUTO_WITHDRAW_THRESHOLD = Number.parseFloat(process.env.AUTO_WITHDRAW_THRESHOLD || '10000');

interface Competition {
  id: number;
  title: string;
  description: string;
  prizeType: string;
  prizeAmount: number;
  currency: string;
  cashAlternative: boolean;
  cashAlternativeAmount: number;
  entryPrice: number;
  totalEntries: number;
  soldEntries: number;
  drawReadyPercent: number;
  endsIn: string;
  status: 'live' | 'coming-soon';
  annualProfitPotential: number;
  tags: string[];
  profitMargin: string;
  expectedWinners: number;
  prizeIncludes?: string[];
}

interface EntryRecord {
  id: string;
  ownerId: string;
  competitionId: number;
  amount: number;
  quantity: number;
  timestamp: Date;
}

interface AdminSessionPayload extends JwtPayload {
  userId: string;
  accessLevel: 'owner_only';
  twoFAVerified: boolean;
  jti: string;
}

interface AdminRequest extends Request {
  adminUser?: AdminSessionPayload;
}

interface PendingTwoFAChallenge {
  id: string;
  userId: string;
  email: string;
  ipAddress: string;
  expiresAt: number;
}

interface AdminActivity {
  id: string;
  adminUserId: string;
  action: 'login_challenge' | 'login_success' | 'logout' | 'view_dashboard' | 'withdraw_manual' | 'withdraw_auto';
  details: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}

const pendingTwoFAChallenges = new Map<string, PendingTwoFAChallenge>();
const revokedTokenIds = new Set<string>();
const entryRecords: EntryRecord[] = [];
const adminActivityLog: AdminActivity[] = [];
let ownerLedger: OwnerLedger = {
  availableToWithdraw: 0,
  pendingWithdrawal: 0,
  totalWithdrawn: 0,
};

function toTwoDp(value: number): number {
  return Number(value.toFixed(2));
}

function getRequestIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip;
}

function normalizeIp(ip: string): string {
  return ip.startsWith('::ffff:') ? ip.replace('::ffff:', '') : ip;
}

function getAllowedAdminIps(): string[] {
  const raw = process.env.ADMIN_IP_WHITELIST;
  if (!raw) return [];
  return raw.split(',').map((ip) => normalizeIp(ip.trim())).filter(Boolean);
}

function isAllowedAdminIp(req: Request): boolean {
  const allowedIps = getAllowedAdminIps();
  if (allowedIps.length === 0) return true;

  const requestIp = normalizeIp(getRequestIp(req));
  return allowedIps.includes(requestIp);
}

function logAdminActivity(
  adminUserId: string,
  action: AdminActivity['action'],
  details: string,
  req: Request,
): void {
  adminActivityLog.push({
    id: uuidv4(),
    adminUserId,
    action,
    details,
    ipAddress: getRequestIp(req),
    userAgent: req.get('user-agent') || 'unknown',
    timestamp: new Date(),
  });

  if (adminActivityLog.length > 1000) {
    adminActivityLog.shift();
  }
}

function accrueOwnerProfit(revenue: number): void {
  ownerLedger = {
    ...ownerLedger,
    availableToWithdraw: toTwoDp(ownerLedger.availableToWithdraw + (revenue * OWNER_PROFIT_SHARE)),
  };
}

function buildAdminDashboardResponse() {
  const financialSummary = computeOwnerFinancialSummary(
    entryRecords.map((record) => ({ amount: record.amount, timestamp: record.timestamp })),
    OWNER_PROFIT_SHARE,
  );

  return {
    todaysEntries: financialSummary.todaysEntries,
    todaysRevenue: financialSummary.todaysRevenue,
    todaysOwnerProfit: financialSummary.todaysOwnerProfit,
    publicRingFencedToday: financialSummary.publicRingFencedToday,
    weeklyOwnerProfit: financialSummary.weeklyOwnerProfit,
    monthlyOwnerProfit: financialSummary.monthlyOwnerProfit,
    yearlyProjection: financialSummary.yearlyProjection,
    ownerProfitSharePercent: toTwoDp(OWNER_PROFIT_SHARE * 100),
    publicRingFencedPercent: toTwoDp((1 - OWNER_PROFIT_SHARE) * 100),
    availableToWithdraw: ownerLedger.availableToWithdraw,
    pendingWithdrawal: ownerLedger.pendingWithdrawal,
    totalWithdrawn: ownerLedger.totalWithdrawn,
    autoWithdrawal: {
      enabled: true,
      threshold: AUTO_WITHDRAW_THRESHOLD,
    },
    recentActivity: adminActivityLog
      .slice(-15)
      .reverse()
      .map((log) => ({
        action: log.action,
        details: log.details,
        ipAddress: log.ipAddress,
        timestamp: log.timestamp.toISOString(),
      })),
  };
}

async function isPasswordValid(inputPassword: string): Promise<boolean> {
  if (ADMIN_PASSWORD_HASH) {
    return bcrypt.compare(inputPassword, ADMIN_PASSWORD_HASH);
  }

  return inputPassword === ADMIN_PASSWORD;
}

function issueAccessToken(userId: string): string {
  const payload: AdminSessionPayload = {
    userId,
    accessLevel: 'owner_only',
    twoFAVerified: true,
    jti: uuidv4(),
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
}

function adminAuthMiddleware(req: AdminRequest, res: Response, next: NextFunction) {
  const tokenFromCustomHeader = req.headers['x-admin-token'];
  const authHeader = req.headers.authorization;
  const tokenFromBearer = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const token = typeof tokenFromCustomHeader === 'string' && tokenFromCustomHeader
    ? tokenFromCustomHeader
    : tokenFromBearer;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AdminSessionPayload;

    if (decoded.accessLevel !== 'owner_only' || !decoded.twoFAVerified) {
      return res.status(403).json({ error: 'Forbidden - owner access required' });
    }

    if (revokedTokenIds.has(decoded.jti)) {
      return res.status(401).json({ error: 'Session expired' });
    }

    if (!isAllowedAdminIp(req)) {
      return res.status(403).json({ error: 'Forbidden - IP not allowed' });
    }

    req.adminUser = decoded;
    return next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

function runAutoWithdrawalSweep(): void {
  if (ownerLedger.availableToWithdraw < AUTO_WITHDRAW_THRESHOLD) {
    return;
  }

  const amount = AUTO_WITHDRAW_THRESHOLD;
  ownerLedger = createWithdrawal(ownerLedger, amount);
  adminActivityLog.push({
    id: uuidv4(),
    adminUserId: OWNER_ID,
    action: 'withdraw_auto',
    details: `Auto-withdrawal completed for £${amount.toFixed(2)}`,
    ipAddress: 'system',
    userAgent: 'system',
    timestamp: new Date(),
  });
}

// Middleware
app.use(helmet());
app.use(morgan('combined'));
app.use(cors({
  origin: API_URL,
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
const competitions: Competition[] = [
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

// Public routes
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'Premium Competitions API is running',
    timestamp: new Date().toISOString(),
    competitions: competitions.length,
    live: competitions.filter((competition) => competition.status === 'live').length,
  });
});

app.get('/api/competitions', (req: Request, res: Response) => {
  res.json(competitions);
});

app.get('/api/competitions/:id', (req: Request, res: Response) => {
  const competition = competitions.find((value) => value.id === parseInt(req.params.id, 10));
  if (!competition) {
    return res.status(404).json({ error: 'Competition not found' });
  }
  return res.json(competition);
});

app.post('/api/competitions/:id/enter', (req: Request, res: Response) => {
  const { quantity, termsAccepted, prizeOption } = req.body;
  const competition = competitions.find((value) => value.id === parseInt(req.params.id, 10));

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

  entryRecords.push({
    id: uuidv4(),
    ownerId: OWNER_ID,
    competitionId: competition.id,
    amount: toTwoDp(totalCost),
    quantity: qty,
    timestamp: new Date(),
  });

  accrueOwnerProfit(totalCost);

  return res.json({
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

// Owner admin routes
app.post('/api/admin/login', async (req: Request, res: Response) => {
  const emailInput = typeof req.body?.email === 'string' ? req.body.email.toLowerCase().trim() : '';
  const passwordInput = typeof req.body?.password === 'string' ? req.body.password : '';

  if (!emailInput || !passwordInput) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  if (!isAllowedAdminIp(req)) {
    return res.status(403).json({ error: 'Forbidden - IP not allowed' });
  }

  const validEmail = emailInput === ADMIN_EMAIL;
  const validPassword = validEmail ? await isPasswordValid(passwordInput) : false;

  if (!validEmail || !validPassword) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const challengeId = uuidv4();
  pendingTwoFAChallenges.set(challengeId, {
    id: challengeId,
    userId: OWNER_ID,
    email: ADMIN_EMAIL,
    ipAddress: getRequestIp(req),
    expiresAt: Date.now() + (5 * 60 * 1000),
  });

  logAdminActivity(OWNER_ID, 'login_challenge', 'Password accepted. Waiting for 2FA verification.', req);

  return res.json({
    requiresTwoFA: true,
    challengeId,
    expiresInSeconds: 300,
  });
});

app.post('/api/admin/verify-2fa', (req: Request, res: Response) => {
  const challengeId = typeof req.body?.challengeId === 'string' ? req.body.challengeId : '';
  const twoFACode = typeof req.body?.twoFACode === 'string' ? req.body.twoFACode.trim() : '';

  const challenge = pendingTwoFAChallenges.get(challengeId);
  if (!challenge) {
    return res.status(401).json({ error: 'Invalid or expired authentication challenge' });
  }

  if (challenge.expiresAt < Date.now()) {
    pendingTwoFAChallenges.delete(challengeId);
    return res.status(401).json({ error: 'Authentication challenge expired' });
  }

  if (challenge.ipAddress !== getRequestIp(req)) {
    pendingTwoFAChallenges.delete(challengeId);
    return res.status(401).json({ error: 'IP mismatch for authentication challenge' });
  }

  if (twoFACode !== ADMIN_2FA_CODE) {
    return res.status(401).json({ error: 'Invalid 2FA code' });
  }

  pendingTwoFAChallenges.delete(challengeId);
  const token = issueAccessToken(challenge.userId);
  logAdminActivity(challenge.userId, 'login_success', 'Owner login completed with 2FA.', req);

  return res.json({
    token,
    tokenType: 'Bearer',
    expiresInSeconds: 8 * 60 * 60,
  });
});

app.get('/api/admin/dashboard', adminAuthMiddleware, (req: AdminRequest, res: Response) => {
  logAdminActivity(req.adminUser!.userId, 'view_dashboard', 'Viewed owner financial dashboard.', req);
  return res.json(buildAdminDashboardResponse());
});

app.get('/api/admin/activity', adminAuthMiddleware, (req: AdminRequest, res: Response) => {
  return res.json({
    activity: adminActivityLog
      .filter((log) => log.adminUserId === req.adminUser!.userId)
      .slice(-100)
      .reverse()
      .map((log) => ({
        action: log.action,
        details: log.details,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        timestamp: log.timestamp.toISOString(),
      })),
  });
});

app.get('/api/admin/daily-calculations', adminAuthMiddleware, (req: AdminRequest, res: Response) => {
  const grouped = new Map<string, { date: string; entries: number; revenue: number; ownerProfit: number; ringFenced: number }>();

  for (const entry of entryRecords) {
    const date = entry.timestamp.toISOString().slice(0, 10);
    const current = grouped.get(date) || { date, entries: 0, revenue: 0, ownerProfit: 0, ringFenced: 0 };
    current.entries += 1;
    current.revenue += entry.amount;
    current.ownerProfit += entry.amount * OWNER_PROFIT_SHARE;
    current.ringFenced += entry.amount * (1 - OWNER_PROFIT_SHARE);
    grouped.set(date, current);
  }

  return res.json({
    calculations: Array.from(grouped.values())
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 31)
      .map((day) => ({
        date: day.date,
        entries: day.entries,
        revenue: toTwoDp(day.revenue),
        ownerProfit: toTwoDp(day.ownerProfit),
        ringFencedAmount: toTwoDp(day.ringFenced),
      })),
  });
});

app.post('/api/admin/withdraw', adminAuthMiddleware, (req: AdminRequest, res: Response) => {
  const amount = Number.parseFloat(String(req.body?.amount));

  try {
    ownerLedger = createWithdrawal(ownerLedger, amount);
    logAdminActivity(req.adminUser!.userId, 'withdraw_manual', `Manual withdrawal initiated for £${amount.toFixed(2)}.`, req);

    return res.json({
      success: true,
      amount: toTwoDp(amount),
      availableToWithdraw: ownerLedger.availableToWithdraw,
      totalWithdrawn: ownerLedger.totalWithdrawn,
    });
  } catch (error) {
    return res.status(400).json({ error: error instanceof Error ? error.message : 'Withdrawal failed' });
  }
});

app.post('/api/admin/logout', adminAuthMiddleware, (req: AdminRequest, res: Response) => {
  revokedTokenIds.add(req.adminUser!.jti);
  logAdminActivity(req.adminUser!.userId, 'logout', 'Owner logged out.', req);
  return res.status(204).send();
});

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'UAE Competition Platform API (Transparent & Compliant)', version: '1.0.0' });
});

setInterval(runAutoWithdrawalSweep, 60 * 60 * 1000);

// Start server
app.listen(PORT, () => {
  console.log(`\n✨ UAE Competition API running on http://localhost:${PORT}`);
  console.log(`📡 CORS enabled for ${API_URL}`);
  console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
  console.log(`📊 Competitions: http://localhost:${PORT}/api/competitions`);
  console.log(`🔐 Owner admin login: http://localhost:${PORT}/api/admin/login\n`);
});
