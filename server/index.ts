import express from 'express';
import type { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import Stripe from 'stripe';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const charityDonationAmount = Math.max(1, Number(process.env.CHARITY_DONATION_AMOUNT || 5));
const charityCampaignName = process.env.CHARITY_CAMPAIGN_NAME || 'Help Awareness Donation';
const postalEntryAddress = (process.env.POSTAL_ENTRY_ADDRESS || '')
  .split(/\r?\n|\|/)
  .map((line) => line.trim())
  .filter(Boolean);
const postalEntrySupportEmail = process.env.POSTAL_ENTRY_SUPPORT_EMAIL || null;

// Middleware
app.use(helmet());
app.use(morgan('combined'));
app.use(cors({
  origin: CLIENT_URL,
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

app.get('/api/competitions/:id/postal-entry', (req: Request, res: Response) => {
  const competition = competitions.find(c => c.id === parseInt(req.params.id));
  if (!competition) {
    return res.status(404).json({ error: 'Competition not found' });
  }

  res.json({
    available: true,
    competitionId: competition.id,
    competitionTitle: competition.title,
    price: 0,
    currency: competition.currency,
    addressConfigured: postalEntryAddress.length > 0,
    addressLines: postalEntryAddress,
    supportEmail: postalEntrySupportEmail,
    summary: 'Free postal entry is supported for eligible participants.',
    steps: [
      'Review the official competition terms and postal-entry rules before sending your entry.',
      'Send one postal entry per envelope with your full name, contact details, competition title, and preferred prize option.',
      'Make sure your postal entry arrives before the published draw cutoff and meets the age and eligibility requirements.',
    ],
    note: postalEntryAddress.length > 0
      ? 'Use the postal address shown below and follow the official terms for formatting and eligibility.'
      : 'Postal entry address is not configured in this environment yet. Publish the verified address in the official terms before accepting live postal entries.',
  });
});

app.post('/api/competitions/:id/enter', async (req: Request, res: Response) => {
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

  if (stripe) {
    try {
      const checkoutBaseUrl = CLIENT_URL || req.get('origin') || 'http://localhost:5173';
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: [
          {
            quantity: qty,
            price_data: {
              currency: competition.currency.toLowerCase(),
              unit_amount: Math.round(competition.entryPrice * 100),
              product_data: {
                name: competition.title,
                description: competition.description,
              },
            },
          },
        ],
        success_url: `${checkoutBaseUrl}/dashboard?checkout=success&competitionId=${competition.id}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${checkoutBaseUrl}/dashboard?checkout=cancel&competitionId=${competition.id}`,
        metadata: {
          competitionId: String(competition.id),
          competitionTitle: competition.title,
          quantity: String(qty),
          prizeOption: competition.cashAlternative ? selectedPrizeOption : 'physical',
        },
      });

      if (!session.url) {
        return res.status(502).json({ error: 'Stripe checkout session was created without a redirect URL.' });
      }

      return res.json({
        success: true,
        mode: 'stripe',
        message: 'Secure Stripe checkout created successfully.',
        checkoutUrl: session.url,
      });
    } catch (error) {
      console.error('Stripe checkout error', error);
      return res.status(502).json({ error: 'Could not create a Stripe checkout session. Please try again later.' });
    }
  }

  res.json({
    success: true,
    mode: 'demo',
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

app.post('/api/charity/checkout', async (req: Request, res: Response) => {
  if (stripe) {
    try {
      const checkoutBaseUrl = CLIENT_URL || req.get('origin') || 'http://localhost:5173';
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: 'gbp',
              unit_amount: Math.round(charityDonationAmount * 100),
              product_data: {
                name: charityCampaignName,
                description: 'One-click charity support from the wellbeing and awareness section.',
              },
            },
          },
        ],
        success_url: `${checkoutBaseUrl}/wellbeing-support?donation=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${checkoutBaseUrl}/wellbeing-support?donation=cancel`,
        metadata: {
          purpose: 'charity-donation',
          campaign: charityCampaignName,
        },
      });

      if (!session.url) {
        return res.status(502).json({ error: 'Stripe charity checkout session was created without a redirect URL.' });
      }

      return res.json({
        success: true,
        mode: 'stripe',
        message: 'Secure charity checkout created successfully.',
        checkoutUrl: session.url,
        amount: charityDonationAmount,
        currency: 'GBP',
        campaign: charityCampaignName,
      });
    } catch (error) {
      console.error('Stripe charity checkout error', error);
      return res.status(502).json({ error: 'Could not create a charity checkout session. Please try again later.' });
    }
  }

  res.json({
    success: true,
    mode: 'demo',
    message: 'Charity support button is active in demo mode. Configure Stripe to take live donations.',
    amount: charityDonationAmount,
    currency: 'GBP',
    campaign: charityCampaignName,
  });
});

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'UAE Competition Platform API (Transparent & Compliant)', version: '1.0.0' });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n✨ UAE Competition API running on http://localhost:${PORT}`);
  console.log(`📡 CORS enabled for ${CLIENT_URL}`);
  console.log(`💳 Stripe checkout ${stripe ? 'enabled' : 'not configured (demo mode)'}`);
  console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
  console.log(`📊 Competitions: http://localhost:${PORT}/api/competitions\n`);
});
