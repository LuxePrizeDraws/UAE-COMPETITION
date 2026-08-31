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
    featuredImage: '/gallery/supercars/lamborghini/lamborghini-revuelto-front-3-4-medium.jpg',
    featuredHeadline: 'Win this Lamborghini Revuelto',
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
    featuredImage: '/gallery/supercars/porsche/porsche-911-turbo-s-front-3-4-medium.jpg',
    featuredHeadline: 'Win this Porsche 911 Turbo S',
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

type SupercarType = 'sport' | 'super' | 'hyper' | 'luxury';

interface Supercar {
  id: string;
  brand: string;
  model: string;
  year: number;
  engine: string;
  horsepower: number;
  torque: number;
  zero_to_sixty: number;
  top_speed: number;
  price_range: string;
  colors: string[];
  transmission: string;
  type: SupercarType;
  description: string;
  images: string[];
  key_features: string[];
  specs: Record<string, string>;
  minPrice: number;
  maxPrice: number;
}

const supercars: Supercar[] = [
  {
    id: 'bugatti-chiron',
    brand: 'Bugatti',
    model: 'Chiron',
    year: 2024,
    engine: '8.0L Quad-Turbo W16',
    horsepower: 1479,
    torque: 1180,
    zero_to_sixty: 2.3,
    top_speed: 261,
    price_range: '£2,500,000 - £3,200,000',
    colors: ['French Racing Blue', 'Nocturne Black', 'Arctic White'],
    transmission: '7-Speed DCT',
    type: 'hyper',
    description: 'A world-class hypercar combining extreme engineering and hand-finished luxury.',
    images: [
      '/gallery/supercars/bugatti/bugatti-chiron-front-3-4-large.jpg',
      '/gallery/supercars/bugatti/bugatti-chiron-side-profile-large.jpg',
      '/gallery/supercars/bugatti/bugatti-chiron-interior-large.jpg',
      '/gallery/supercars/bugatti/bugatti-chiron-engine-details-large.jpg',
      '/gallery/supercars/bugatti/bugatti-chiron-action-driving-large.jpg',
    ],
    key_features: ['Carbon monocoque', 'Active aero system', 'Bespoke cabin trims', 'Adaptive suspension'],
    specs: { drivetrain: 'AWD', weight: '1,995 kg', launch: 'Launch control', brakes: 'Carbon ceramic' },
    minPrice: 2500000,
    maxPrice: 3200000,
  },
  {
    id: 'rolls-royce-phantom',
    brand: 'Rolls-Royce',
    model: 'Phantom',
    year: 2024,
    engine: '6.75L Twin-Turbo V12',
    horsepower: 563,
    torque: 664,
    zero_to_sixty: 5.1,
    top_speed: 155,
    price_range: '£400,000 - £520,000',
    colors: ['Arctic White', 'Black Diamond', 'Royal Burgundy'],
    transmission: '8-Speed Automatic',
    type: 'luxury',
    description: 'The benchmark for ultra-luxury motoring with handcrafted serenity and presence.',
    images: [
      '/gallery/supercars/rolls-royce/rolls-royce-phantom-front-3-4-large.jpg',
      '/gallery/supercars/rolls-royce/rolls-royce-phantom-side-profile-large.jpg',
      '/gallery/supercars/rolls-royce/rolls-royce-phantom-interior-large.jpg',
      '/gallery/supercars/rolls-royce/rolls-royce-phantom-engine-details-large.jpg',
      '/gallery/supercars/rolls-royce/rolls-royce-phantom-action-driving-large.jpg',
    ],
    key_features: ['Starlight headliner', 'Rear executive suite', 'Bespoke paintwork', 'Lambswool carpets'],
    specs: { drivetrain: 'RWD', weight: '2,560 kg', comfort: 'Magic carpet ride', audio: 'Bespoke audio' },
    minPrice: 400000,
    maxPrice: 520000,
  },
  {
    id: 'bentley-bacalar',
    brand: 'Bentley',
    model: 'Bacalar',
    year: 2024,
    engine: '6.0L Twin-Turbo W12',
    horsepower: 650,
    torque: 667,
    zero_to_sixty: 3.5,
    top_speed: 200,
    price_range: '£1,500,000 - £1,900,000',
    colors: ['Moss Green', 'Onyx Black', 'Glacier White'],
    transmission: '8-Speed DCT',
    type: 'luxury',
    description: 'An ultra-rare coachbuilt grand tourer blending open-air luxury and W12 performance.',
    images: [
      '/gallery/supercars/bentley/bentley-bacalar-front-3-4-large.jpg',
      '/gallery/supercars/bentley/bentley-bacalar-side-profile-large.jpg',
      '/gallery/supercars/bentley/bentley-bacalar-interior-large.jpg',
      '/gallery/supercars/bentley/bentley-bacalar-engine-details-large.jpg',
      '/gallery/supercars/bentley/bentley-bacalar-action-driving-large.jpg',
    ],
    key_features: ['Coachbuilt design', 'Open cockpit', 'Hand-stitched cabin', 'Limited production'],
    specs: { drivetrain: 'AWD', weight: '2,200 kg', roof: 'Barchetta', production: '12 units' },
    minPrice: 1500000,
    maxPrice: 1900000,
  },
  {
    id: 'ferrari-f8-tributo',
    brand: 'Ferrari',
    model: 'F8 Tributo',
    year: 2024,
    engine: '3.9L Twin-Turbo V8',
    horsepower: 710,
    torque: 568,
    zero_to_sixty: 2.9,
    top_speed: 211,
    price_range: '£280,000 - £320,000',
    colors: ['Rosso Corsa', 'Bianco Avus', 'Nero Daytona'],
    transmission: '7-Speed DCT',
    type: 'super',
    description: 'A focused mid-engine Ferrari delivering race-bred dynamics and unmistakable style.',
    images: [
      '/gallery/supercars/ferrari/ferrari-f8-tributo-front-3-4-large.jpg',
      '/gallery/supercars/ferrari/ferrari-f8-tributo-side-profile-large.jpg',
      '/gallery/supercars/ferrari/ferrari-f8-tributo-interior-large.jpg',
      '/gallery/supercars/ferrari/ferrari-f8-tributo-engine-details-large.jpg',
      '/gallery/supercars/ferrari/ferrari-f8-tributo-action-driving-large.jpg',
    ],
    key_features: ['Aerodynamic S-Duct', 'Manettino drive modes', 'Carbon options', 'Track telemetry'],
    specs: { drivetrain: 'RWD', weight: '1,435 kg', gearbox: 'Dual clutch', body: 'Aluminium chassis' },
    minPrice: 280000,
    maxPrice: 320000,
  },
  {
    id: 'lamborghini-revuelto',
    brand: 'Lamborghini',
    model: 'Revuelto',
    year: 2025,
    engine: '6.5L V12 Hybrid',
    horsepower: 1001,
    torque: 793,
    zero_to_sixty: 2.5,
    top_speed: 217,
    price_range: '£400,000 - £500,000',
    colors: ['Arancio Xanto', 'Verde Mantis', 'Nero Noctis'],
    transmission: '8-Speed DCT',
    type: 'hyper',
    description: 'Lamborghini’s electrified V12 flagship with dramatic design and explosive acceleration.',
    images: [
      '/gallery/supercars/lamborghini/lamborghini-revuelto-front-3-4-large.jpg',
      '/gallery/supercars/lamborghini/lamborghini-revuelto-side-profile-large.jpg',
      '/gallery/supercars/lamborghini/lamborghini-revuelto-interior-large.jpg',
      '/gallery/supercars/lamborghini/lamborghini-revuelto-engine-details-large.jpg',
      '/gallery/supercars/lamborghini/lamborghini-revuelto-action-driving-large.jpg',
    ],
    key_features: ['Plug-in hybrid system', 'Active rear wing', 'Y-shaped lighting', 'ANIMA drive modes'],
    specs: { drivetrain: 'AWD', weight: '1,772 kg', battery: '3.8 kWh', architecture: 'Carbon monofuselage' },
    minPrice: 400000,
    maxPrice: 500000,
  },
  {
    id: 'mclaren-765lt',
    brand: 'McLaren',
    model: '765LT',
    year: 2024,
    engine: '4.0L Twin-Turbo V8',
    horsepower: 755,
    torque: 590,
    zero_to_sixty: 2.7,
    top_speed: 205,
    price_range: '£280,000 - £340,000',
    colors: ['Papaya Orange', 'Onyx Black', 'Silica White'],
    transmission: '7-Speed SSG',
    type: 'super',
    description: 'A lightweight longtail supercar tuned for intense driver engagement and lap pace.',
    images: [
      '/gallery/supercars/mclaren/mclaren-765lt-front-3-4-large.jpg',
      '/gallery/supercars/mclaren/mclaren-765lt-side-profile-large.jpg',
      '/gallery/supercars/mclaren/mclaren-765lt-interior-large.jpg',
      '/gallery/supercars/mclaren/mclaren-765lt-engine-details-large.jpg',
      '/gallery/supercars/mclaren/mclaren-765lt-action-driving-large.jpg',
    ],
    key_features: ['Longtail aero package', 'Track brake upgrade', 'Lightweight seats', 'Proactive damping'],
    specs: { drivetrain: 'RWD', weight: '1,339 kg', suspension: 'Race tuned', exhaust: 'Titanium system' },
    minPrice: 280000,
    maxPrice: 340000,
  },
  {
    id: 'porsche-911-turbo-s',
    brand: 'Porsche',
    model: '911 Turbo S',
    year: 2025,
    engine: '3.8L Twin-Turbo Flat-6',
    horsepower: 640,
    torque: 590,
    zero_to_sixty: 2.6,
    top_speed: 205,
    price_range: '£180,000 - £220,000',
    colors: ['GT Silver', 'Guards Red', 'Jet Black Metallic'],
    transmission: '8-Speed PDK',
    type: 'sport',
    description: 'Everyday usability meets supercar pace in Porsche’s iconic all-weather performance coupe.',
    images: [
      '/gallery/supercars/porsche/porsche-911-turbo-s-front-3-4-large.jpg',
      '/gallery/supercars/porsche/porsche-911-turbo-s-side-profile-large.jpg',
      '/gallery/supercars/porsche/porsche-911-turbo-s-interior-large.jpg',
      '/gallery/supercars/porsche/porsche-911-turbo-s-engine-details-large.jpg',
      '/gallery/supercars/porsche/porsche-911-turbo-s-action-driving-large.jpg',
    ],
    key_features: ['Rear-axle steering', 'Sport Chrono', 'PASM suspension', 'Premium leather cabin'],
    specs: { drivetrain: 'AWD', weight: '1,640 kg', launch: '2.6s launch', cooling: 'Adaptive intake flaps' },
    minPrice: 180000,
    maxPrice: 220000,
  },
  {
    id: 'aston-martin-db12',
    brand: 'Aston Martin',
    model: 'DB12',
    year: 2024,
    engine: '4.0L Twin-Turbo V8',
    horsepower: 671,
    torque: 590,
    zero_to_sixty: 3.5,
    top_speed: 202,
    price_range: '£160,000 - £210,000',
    colors: ['Satin Titanium Grey', 'Racing Green', 'Jet Black'],
    transmission: '8-Speed Automatic',
    type: 'sport',
    description: 'A modern super tourer with muscular performance and handcrafted British luxury.',
    images: [
      '/gallery/supercars/aston-martin/aston-martin-db12-front-3-4-large.jpg',
      '/gallery/supercars/aston-martin/aston-martin-db12-side-profile-large.jpg',
      '/gallery/supercars/aston-martin/aston-martin-db12-interior-large.jpg',
      '/gallery/supercars/aston-martin/aston-martin-db12-engine-details-large.jpg',
      '/gallery/supercars/aston-martin/aston-martin-db12-action-driving-large.jpg',
    ],
    key_features: ['Bespoke interior themes', 'Adaptive dampers', 'Carbon roof option', 'Luxury GT seats'],
    specs: { drivetrain: 'RWD', weight: '1,685 kg', steering: 'Electronic power', audio: 'Bowers & Wilkins' },
    minPrice: 160000,
    maxPrice: 210000,
  },
  {
    id: 'mercedes-amg-gt-63-s',
    brand: 'Mercedes-AMG',
    model: 'GT 63 S',
    year: 2024,
    engine: '4.0L Twin-Turbo V8',
    horsepower: 630,
    torque: 664,
    zero_to_sixty: 3.1,
    top_speed: 196,
    price_range: '£150,000 - £185,000',
    colors: ['Obsidian Black', 'Selenite Grey', 'Designo Diamond White'],
    transmission: '9-Speed MCT',
    type: 'sport',
    description: 'A luxurious four-door performance flagship with daily comfort and AMG aggression.',
    images: [
      '/gallery/supercars/mercedes-amg/mercedes-amg-gt-63-s-front-3-4-large.jpg',
      '/gallery/supercars/mercedes-amg/mercedes-amg-gt-63-s-side-profile-large.jpg',
      '/gallery/supercars/mercedes-amg/mercedes-amg-gt-63-s-interior-large.jpg',
      '/gallery/supercars/mercedes-amg/mercedes-amg-gt-63-s-engine-details-large.jpg',
      '/gallery/supercars/mercedes-amg/mercedes-amg-gt-63-s-action-driving-large.jpg',
    ],
    key_features: ['AMG Performance 4MATIC+', 'Rear steering', 'Luxury tech cabin', 'Active aero'],
    specs: { drivetrain: 'AWD', weight: '2,045 kg', mode: 'Drift mode', seats: 'Performance seats' },
    minPrice: 150000,
    maxPrice: 185000,
  },
  {
    id: 'corvette-stingray',
    brand: 'Chevrolet',
    model: 'Corvette Stingray',
    year: 2024,
    engine: '6.2L Naturally Aspirated V8',
    horsepower: 495,
    torque: 470,
    zero_to_sixty: 2.9,
    top_speed: 194,
    price_range: '£60,000 - £82,000',
    colors: ['Torch Red', 'Rapid Blue', 'Arctic White'],
    transmission: '8-Speed DCT',
    type: 'sport',
    description: 'An attainable mid-engine exotic with dramatic styling and proven V8 thrills.',
    images: [
      '/gallery/supercars/chevrolet/chevrolet-corvette-stingray-front-3-4-large.jpg',
      '/gallery/supercars/chevrolet/chevrolet-corvette-stingray-side-profile-large.jpg',
      '/gallery/supercars/chevrolet/chevrolet-corvette-stingray-interior-large.jpg',
      '/gallery/supercars/chevrolet/chevrolet-corvette-stingray-engine-details-large.jpg',
      '/gallery/supercars/chevrolet/chevrolet-corvette-stingray-action-driving-large.jpg',
    ],
    key_features: ['Mid-engine layout', 'Performance exhaust', 'Digital cockpit', 'Magnetic ride control'],
    specs: { drivetrain: 'RWD', weight: '1,560 kg', trunk: 'Dual storage areas', chassis: 'Aluminum structure' },
    minPrice: 60000,
    maxPrice: 82000,
  },
  {
    id: 'bmw-m850i',
    brand: 'BMW',
    model: 'M850i',
    year: 2024,
    engine: '4.4L Twin-Turbo V8',
    horsepower: 523,
    torque: 553,
    zero_to_sixty: 3.6,
    top_speed: 155,
    price_range: '£120,000 - £145,000',
    colors: ['Tanzanite Blue', 'Black Sapphire', 'Alpine White'],
    transmission: '8-Speed Sport Automatic',
    type: 'luxury',
    description: 'A powerful grand tourer blending executive comfort with M-inspired punch.',
    images: [
      '/gallery/supercars/bmw/bmw-m850i-front-3-4-large.jpg',
      '/gallery/supercars/bmw/bmw-m850i-side-profile-large.jpg',
      '/gallery/supercars/bmw/bmw-m850i-interior-large.jpg',
      '/gallery/supercars/bmw/bmw-m850i-engine-details-large.jpg',
      '/gallery/supercars/bmw/bmw-m850i-action-driving-large.jpg',
    ],
    key_features: ['xDrive traction', 'Merino leather', 'Laser headlights', 'Gesture control'],
    specs: { drivetrain: 'AWD', weight: '1,965 kg', suspension: 'Adaptive M', infotainment: 'iDrive 8' },
    minPrice: 120000,
    maxPrice: 145000,
  },
  {
    id: 'audi-r8',
    brand: 'Audi',
    model: 'R8 V10 Performance',
    year: 2024,
    engine: '5.2L Naturally Aspirated V10',
    horsepower: 602,
    torque: 413,
    zero_to_sixty: 3.1,
    top_speed: 205,
    price_range: '£140,000 - £175,000',
    colors: ['Nardo Grey', 'Mythos Black', 'Ara Blue'],
    transmission: '7-Speed S tronic',
    type: 'super',
    description: 'A naturally aspirated V10 icon delivering precision handling and unmistakable soundtrack.',
    images: [
      '/gallery/supercars/audi/audi-r8-v10-performance-front-3-4-large.jpg',
      '/gallery/supercars/audi/audi-r8-v10-performance-side-profile-large.jpg',
      '/gallery/supercars/audi/audi-r8-v10-performance-interior-large.jpg',
      '/gallery/supercars/audi/audi-r8-v10-performance-engine-details-large.jpg',
      '/gallery/supercars/audi/audi-r8-v10-performance-action-driving-large.jpg',
    ],
    key_features: ['Quattro AWD', 'Virtual cockpit', 'Carbon aero kit', 'Sport exhaust'],
    specs: { drivetrain: 'AWD', weight: '1,595 kg', steering: 'Dynamic steering', brakes: 'Carbon ceramic option' },
    minPrice: 140000,
    maxPrice: 175000,
  },
];

function applySupercarFilters(source: Supercar[], query: Request['query']) {
  const brand = typeof query.brand === 'string' ? query.brand : '';
  const type = typeof query.type === 'string' ? query.type : '';
  const color = typeof query.color === 'string' ? query.color : '';
  const search = typeof query.search === 'string' ? query.search : '';
  const price = typeof query.price === 'string' ? query.price : '';
  const sort = typeof query.sort === 'string' ? query.sort : 'newest';

  let result = [...source];

  if (brand) {
    result = result.filter((car) => car.brand.toLowerCase() === brand.toLowerCase());
  }
  if (type) {
    result = result.filter((car) => car.type.toLowerCase() === type.toLowerCase());
  }
  if (color) {
    result = result.filter((car) => car.colors.some((c) => c.toLowerCase() === color.toLowerCase()));
  }
  if (search) {
    const needle = search.toLowerCase();
    result = result.filter(
      (car) => car.model.toLowerCase().includes(needle) || car.brand.toLowerCase().includes(needle),
    );
  }
  if (price) {
    result = result.filter((car) => {
      if (price === 'lt-200k') return car.maxPrice < 200000;
      if (price === '200k-500k') return car.minPrice >= 200000 && car.maxPrice <= 500000;
      if (price === '500k-1m') return car.minPrice >= 500000 && car.maxPrice <= 1000000;
      if (price === '1m-plus') return car.minPrice >= 1000000;
      return true;
    });
  }

  switch (sort) {
    case 'price-low':
      result.sort((a, b) => a.minPrice - b.minPrice);
      break;
    case 'price-high':
      result.sort((a, b) => b.maxPrice - a.maxPrice);
      break;
    case 'brand':
      result.sort((a, b) => a.brand.localeCompare(b.brand));
      break;
    case 'fastest':
      result.sort((a, b) => a.zero_to_sixty - b.zero_to_sixty);
      break;
    default:
      result.sort((a, b) => b.year - a.year);
      break;
  }

  return result;
}

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

app.get('/api/supercars', (req: Request, res: Response) => {
  const filtered = applySupercarFilters(supercars, req.query);
  res.json(filtered);
});

app.get('/api/supercars/filter', (req: Request, res: Response) => {
  const filtered = applySupercarFilters(supercars, req.query);
  res.json(filtered);
});

app.get('/api/supercars/search', (req: Request, res: Response) => {
  const query = typeof req.query.q === 'string' ? req.query.q : typeof req.query.search === 'string' ? req.query.search : '';
  const filtered = applySupercarFilters(supercars, { ...req.query, search: query });
  res.json(filtered);
});

app.get('/api/supercars/:id', (req: Request, res: Response) => {
  const car = supercars.find((entry) => entry.id === req.params.id);
  if (!car) {
    return res.status(404).json({ error: 'Supercar not found' });
  }
  return res.json(car);
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
