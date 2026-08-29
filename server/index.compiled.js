"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT || 5000);
const JWT_SECRET = process.env.JWT_SECRET || 'development_secret';
const competitions = [
    {
        id: 1,
        slug: 'win-10000-aed-cash',
        title: 'WIN 10,000 AED CASH',
        shortTitle: '10,000 AED Cash',
        description: 'A fast-moving cash drop with transparent capped entries and immediate lifestyle appeal.',
        prizeType: 'Cash Competition',
        prizeAmount: 10000,
        prizeDetails: { currency: 'AED', description: 'Direct cash payout', includes: ['10,000 AED transfer', 'Live draw announcement', 'Winner concierge support'] },
        entryPrice: 1,
        totalEntries: 10000,
        soldEntries: 7248,
        endsIn: '2 days 14 hours',
        drawDate: '2026-09-05',
        image: '💸',
        location: 'Dubai',
        tags: ['Low entry price', 'Fast draw', 'Transparent odds'],
        highlights: ['Perfect entry-level competition', 'High urgency countdown', 'Ideal for rapid conversion campaigns'],
        profitMargin: 'Transparent model: capped pool, clear sold-entry progress, protected confirmation flow.',
        expectedWinners: 1,
        featured: true,
    },
    {
        id: 2,
        slug: 'win-luxury-uae-dream-package',
        title: 'WIN LUXURY UAE DREAM PACKAGE',
        shortTitle: 'UAE Dream Package',
        description: 'A curated ultra-premium lifestyle package featuring hospitality, dining, wellness and private access moments.',
        prizeType: 'Lifestyle Package',
        prizeAmount: 500000,
        prizeDetails: { currency: 'AED', description: 'Multi-experience UAE luxury prize', includes: ['Five-star resort stay', 'Private chauffeur itinerary', 'Signature dining experiences'] },
        entryPrice: 1,
        totalEntries: 1000000,
        soldEntries: 856000,
        endsIn: '5 days 9 hours',
        drawDate: '2026-09-08',
        image: '🌆',
        location: 'Abu Dhabi & Dubai',
        tags: ['Aspirational lifestyle', 'Huge reach', 'Premium brand fit'],
        highlights: ['Designed for broad market virality', 'Luxury narrative for the GCC audience', 'Strong perceived value at 1 AED entry'],
        profitMargin: 'Luxury positioning with transparent entry caps and public draw timing.',
        expectedWinners: 1,
        featured: true,
    },
    {
        id: 3,
        slug: 'win-ferrari-f8-tributo',
        title: 'WIN FERRARI F8 TRIBUTO',
        shortTitle: 'Ferrari F8 Tributo',
        description: 'An iconic supercar draw crafted for adrenaline, prestige and high-ticket aspiration.',
        prizeType: 'Supercar Competition',
        prizeAmount: 900000,
        prizeDetails: { currency: 'AED', description: 'Ferrari ownership package', includes: ['Ferrari F8 Tributo', 'Registration support', 'White-glove delivery'] },
        entryPrice: 5,
        totalEntries: 500000,
        soldEntries: 281320,
        endsIn: '7 days 20 hours',
        drawDate: '2026-09-12',
        image: '🏎️',
        location: 'Dubai',
        tags: ['Supercar dream', 'High perceived value', 'Collector appeal'],
        highlights: ['Performance-led visual storytelling', 'Strong social media click-through potential', 'Best suited to premium paid traffic'],
        profitMargin: 'Premium product draw with audited cap visibility and protected payment stub.',
        expectedWinners: 1,
    },
    {
        id: 4,
        slug: 'win-dubai-penthouse',
        title: 'WIN DUBAI PENTHOUSE',
        shortTitle: 'Dubai Penthouse',
        description: 'A skyline-defining property experience that anchors the platform’s most ambitious aspiration tier.',
        prizeType: 'Real Estate Competition',
        prizeAmount: 5000000,
        prizeDetails: { currency: 'AED', description: 'Luxury property grand prize', includes: ['Dubai penthouse ownership', 'Legal transfer support', 'VIP winner onboarding'] },
        entryPrice: 10,
        totalEntries: 1000000,
        soldEntries: 434200,
        endsIn: '12 days 6 hours',
        drawDate: '2026-09-18',
        image: '🏙️',
        location: 'Palm Jumeirah',
        tags: ['Flagship campaign', 'Ultra premium', 'Property ownership'],
        highlights: ['Hero product for PR reach', 'Premium audience acquisition magnet', 'Strong trust-building showcase prize'],
        profitMargin: 'Flagship inventory with capped supply, milestone reporting and admin visibility.',
        expectedWinners: 1,
        featured: true,
    },
    {
        id: 5,
        slug: 'win-rolex-daytona',
        title: 'WIN ROLEX DAYTONA',
        shortTitle: 'Rolex Daytona',
        description: 'A collector-grade timepiece draw for watch enthusiasts and premium gifting buyers.',
        prizeType: 'Luxury Watch Competition',
        prizeAmount: 85000,
        prizeDetails: { currency: 'AED', description: 'Rolex Daytona prize', includes: ['Authentic Rolex Daytona', 'Certification documents', 'Insured handover'] },
        entryPrice: 2,
        totalEntries: 100000,
        soldEntries: 51230,
        endsIn: '4 days 13 hours',
        drawDate: '2026-09-06',
        image: '⌚',
        location: 'Dubai',
        tags: ['Collector item', 'Giftable luxury', 'High repeat appeal'],
        highlights: ['Smaller-ticket aspirational category', 'Excellent repeat-entry economics', 'Ideal for watch-focused remarketing'],
        profitMargin: 'Clear availability, capped entry count and secure member tracking.',
        expectedWinners: 1,
    },
    {
        id: 6,
        slug: 'win-private-jet-experience',
        title: 'WIN PRIVATE JET EXPERIENCE',
        shortTitle: 'Private Jet Experience',
        description: 'Deliver an elite aviation moment with concierge touches and ultra-premium storytelling.',
        prizeType: 'Experience Competition',
        prizeAmount: 150000,
        prizeDetails: { currency: 'AED', description: 'Private aviation experience', includes: ['Private jet charter day', 'VIP airport handling', 'Luxury ground transfers'] },
        entryPrice: 3,
        totalEntries: 200000,
        soldEntries: 118400,
        endsIn: '6 days 11 hours',
        drawDate: '2026-09-10',
        image: '🛩️',
        location: 'UAE',
        tags: ['Experience-led', 'Luxury travel', 'VIP service'],
        highlights: ['Strong experiential appeal', 'Ideal for content-led storytelling', 'Premium but accessible price point'],
        profitMargin: 'Protected checkout and visible ticket allocation for confidence at scale.',
        expectedWinners: 1,
    },
    {
        id: 7,
        slug: 'win-100000-aed-cash',
        title: 'WIN 100,000 AED CASH',
        shortTitle: '100,000 AED Cash',
        description: 'A bigger cash ladder prize balancing affordability with major payout desirability.',
        prizeType: 'Cash Competition',
        prizeAmount: 100000,
        prizeDetails: { currency: 'AED', description: 'Large cash payout', includes: ['100,000 AED transfer', 'Winner verification support', 'Public results announcement'] },
        entryPrice: 2,
        totalEntries: 200000,
        soldEntries: 149950,
        endsIn: '3 days 18 hours',
        drawDate: '2026-09-04',
        image: '💵',
        location: 'Sharjah',
        tags: ['High demand', 'Mass appeal', 'Urgent countdown'],
        highlights: ['Great for conversion-focused campaigns', 'Compelling value vs entry cost', 'Simple message with broad appeal'],
        profitMargin: 'Live cap visibility, protected entry creation and structured payout readiness.',
        expectedWinners: 1,
    },
    {
        id: 8,
        slug: 'win-business-class-world-tour',
        title: 'WIN BUSINESS CLASS WORLD TOUR',
        shortTitle: 'Business Class World Tour',
        description: 'A global itinerary designed for prestige travellers who value comfort, access and unforgettable moments.',
        prizeType: 'Travel Competition',
        prizeAmount: 250000,
        prizeDetails: { currency: 'AED', description: 'Global luxury travel package', includes: ['Business class multi-city flights', 'Five-star accommodations', 'Luxury travel concierge'] },
        entryPrice: 5,
        totalEntries: 100000,
        soldEntries: 64440,
        endsIn: '8 days 8 hours',
        drawDate: '2026-09-14',
        image: '🌍',
        location: 'Global departure from Dubai',
        tags: ['Travel prestige', 'Experience-rich', 'Luxury itinerary'],
        highlights: ['Perfect for aspirational travel buyers', 'High shareability through destination content', 'Excellent fit for elite loyalty positioning'],
        profitMargin: 'Luxury travel positioning backed by clear entry pricing and tracked orders.',
        expectedWinners: 1,
    },
];
const users = [
    {
        id: (0, uuid_1.v4)(),
        name: 'Platform Admin',
        email: process.env.ADMIN_EMAIL || 'admin@uaeluxury.ae',
        phone: '+971500000001',
        passwordHash: bcryptjs_1.default.hashSync(process.env.ADMIN_PASSWORD || 'Admin123!', 10),
        role: 'admin',
        createdAt: new Date().toISOString(),
    },
    {
        id: (0, uuid_1.v4)(),
        name: 'Demo Member',
        email: 'member@uaeluxury.ae',
        phone: '+971500000002',
        passwordHash: bcryptjs_1.default.hashSync('Member123!', 10),
        role: 'user',
        createdAt: new Date().toISOString(),
    },
];
const entries = [
    {
        id: `${users[1].id}_entry_1`,
        userId: users[1].id,
        competitionId: 1,
        competitionTitle: 'WIN 10,000 AED CASH',
        quantity: 12,
        totalCost: 12,
        status: 'confirmed',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        entryNumbers: Array.from({ length: 12 }, (_, index) => `1-DEMO-${index + 1}`),
        paymentIntentId: 'pi_demo_member_001',
    },
];
const sanitizeUser = (user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    createdAt: user.createdAt,
});
const signToken = (user) => jsonwebtoken_1.default.sign({ sub: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    const token = authHeader.slice(7);
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = { id: decoded.sub, email: decoded.email, role: decoded.role, name: decoded.name };
        return next();
    }
    catch {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};
const adminMiddleware = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    return next();
};
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)('combined'));
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: 'Too many requests from this IP',
}));
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', message: 'UAE Luxury Competition API is running' });
});
app.post('/api/auth/register', async (req, res) => {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email and password are required' });
    }
    if (users.some((user) => user.email.toLowerCase() === email.toLowerCase())) {
        return res.status(409).json({ error: 'An account already exists for this email' });
    }
    const passwordHash = await bcryptjs_1.default.hash(password, 10);
    const user = {
        id: (0, uuid_1.v4)(),
        name,
        email: email.toLowerCase(),
        phone,
        passwordHash,
        role: 'user',
        createdAt: new Date().toISOString(),
    };
    users.push(user);
    return res.status(201).json({
        user: sanitizeUser(user),
        token: signToken(user),
        entries: [],
        wins: 0,
    });
});
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }
    const user = users.find((record) => record.email.toLowerCase() === email.toLowerCase());
    if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
    }
    const passwordMatches = await bcryptjs_1.default.compare(password, user.passwordHash);
    if (!passwordMatches) {
        return res.status(401).json({ error: 'Invalid email or password' });
    }
    const userEntries = entries.filter((entry) => entry.userId === user.id);
    return res.json({
        user: sanitizeUser(user),
        token: signToken(user),
        entries: userEntries,
        wins: 0,
    });
});
app.get('/api/auth/me', authMiddleware, (req, res) => {
    const user = users.find((record) => record.id === req.user?.id);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    return res.json({
        user: sanitizeUser(user),
        entries: entries.filter((entry) => entry.userId === user.id),
        wins: 0,
    });
});
app.get('/api/competitions', (_req, res) => {
    res.json(competitions);
});
app.get('/api/competitions/:id', (req, res) => {
    const competition = competitions.find((item) => item.id === Number(req.params.id));
    if (!competition) {
        return res.status(404).json({ error: 'Competition not found' });
    }
    return res.json(competition);
});
app.post('/api/competitions/:id/enter', authMiddleware, (req, res) => {
    const competition = competitions.find((item) => item.id === Number(req.params.id));
    const { quantity, paymentIntentId } = req.body;
    if (!competition) {
        return res.status(404).json({ error: 'Competition not found' });
    }
    if (!quantity || quantity < 1 || quantity > 100) {
        return res.status(400).json({ error: 'Quantity must be between 1 and 100' });
    }
    const remainingEntries = competition.totalEntries - competition.soldEntries;
    if (quantity > remainingEntries) {
        return res.status(400).json({ error: 'Not enough entries remaining for this competition' });
    }
    const user = users.find((record) => record.id === req.user?.id);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    competition.soldEntries += quantity;
    const entry = {
        id: `${user.id}_${(0, uuid_1.v4)()}`,
        userId: user.id,
        competitionId: competition.id,
        competitionTitle: competition.title,
        quantity,
        totalCost: quantity * competition.entryPrice,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
        entryNumbers: Array.from({ length: quantity }, () => `${competition.id}-${Math.random().toString(36).slice(2, 10).toUpperCase()}`),
        paymentIntentId,
    };
    entries.unshift(entry);
    return res.status(201).json({
        success: true,
        message: 'Entries confirmed successfully',
        ...entry,
    });
});
app.post('/api/payment/create-intent', (req, res) => {
    const { competitionId, quantity, amount } = req.body;
    if (!competitionId || !quantity || !amount) {
        return res.status(400).json({ error: 'competitionId, quantity and amount are required' });
    }
    return res.status(201).json({
        paymentIntentId: `pi_${(0, uuid_1.v4)().replace(/-/g, '').slice(0, 18)}`,
        clientSecret: `pi_${(0, uuid_1.v4)().replace(/-/g, '').slice(0, 18)}_secret_demo`,
        amount,
        currency: 'aed',
        provider: 'stripe',
        status: 'requires_confirmation',
    });
});
app.get('/api/admin/stats', authMiddleware, adminMiddleware, (_req, res) => {
    const totalRevenue = entries.reduce((sum, entry) => sum + entry.totalCost, 0);
    res.json({
        totalUsers: users.length,
        totalEntries: entries.length,
        totalRevenue,
        activeCompetitions: competitions.length,
    });
});
app.get('/api/admin/users', authMiddleware, adminMiddleware, (_req, res) => {
    res.json(users.map(sanitizeUser));
});
app.get('/api/admin/entries', authMiddleware, adminMiddleware, (_req, res) => {
    res.json(entries.map((entry) => {
        const user = users.find((record) => record.id === entry.userId);
        return {
            ...entry,
            userName: user?.name,
            userEmail: user?.email,
        };
    }));
});
app.get('/', (_req, res) => {
    res.json({ message: 'UAE Luxury Competition Platform API', version: '2.0.0' });
});
if (process.env.VERCEL !== '1') {
    app.listen(PORT, () => {
        console.log(`UAE Competition API running on http://localhost:${PORT}`);
    });
}
exports.default = app;
