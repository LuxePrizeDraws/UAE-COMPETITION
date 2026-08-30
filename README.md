# UK Life Changing Competitions 🏆

Premium UK competition platform with **8 live competitions**, transparent pricing, draw-ready tracking, and cash alternatives for every prize.

---

## 🌐 Live Links

| Service | URL |
|---------|-----|
| 🖥️ Frontend | *(Deploy to Vercel – see [Deployment](#deployment) below)* |
| 🔌 Backend API | *(Deploy to Railway – see [Deployment](#deployment) below)* |
| 📬 Postman Collection | Import `UK-Competitions-API.postman_collection.json` |

---

## 🎯 Platform Overview

### 8 Competitions with £18.4M Annual Profit Potential

| # | Competition | Prize | Ticket | Annual Profit |
|---|-------------|-------|--------|---------------|
| 1 | Weekly £10K Cash | £10,000 | £1 | £780K |
| 2 | Luxury Experience OR £100K Cash | £100,000 | £5 | £1.8M |
| 3 | £50K Monthly Cash | £50,000 | £5 | £900K |
| 4 | £500K Quarterly Cash | £500,000 | £10 | £3M |
| 5 | £5M Annual Grand Draw | £5,000,000 | £25 | £7.5M |
| 6 | Weekly £10K Bonus | £10,000 | £1 | £780K |
| 7 | 3 Supercars OR £135K Cash | £135,000 | £10 | £2.43M |
| 8 | UK Entrepreneur Dream OR £320K Cash | £320,000 | £25 | £1.92M |

**Total Annual Profit Potential: £18.4M** | **Average Monthly Revenue: £1.53M**

### Key Features
- 🔵 **Draw-ready tracking** – Live progress bars showing entries sold vs needed
- 💰 **Cash alternatives** – Every prize offers a cash equivalent
- 📊 **Transparent pricing** – 40% house margin shown publicly
- ⏰ **Countdown timers** – Real-time draw deadlines
- ✅ **UK Compliance challenge** – Skill question required before entry (legally required)
- 💳 **PayPal payments** – Live checkout with Apple Pay & Google Pay coming soon
- 📱 **Responsive design** – Works on mobile, tablet, desktop

---

## 🚀 Quick Start

### Prerequisites
- Node.js v16+
- npm v8+

### 1. Clone the Repository
```bash
git clone https://github.com/shugstarwork-maker/UAE-COMPETITION.git
cd UAE-COMPETITION
```

### 2. Backend Setup
```bash
npm install
cp .env.example .env
npm run dev:server
```

You should see:
```
🏆 UK Life Changing Competitions API running on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd client
npm install
cp .env.example .env
npm run dev
```

### 4. Access the Platform

| Service | URL |
|---------|-----|
| 🖥️ Frontend | http://localhost:5173 |
| 📊 Dashboard | http://localhost:5173/dashboard |
| 🔌 Backend API | http://localhost:5000 |

### Run Both Together (from root)
```bash
npm run dev
```

---

## 📁 Project Structure

```
uk-life-changing-competitions/
├── server/
│   ├── index.ts               # Main API with 8 competitions
│   └── .env.example
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CompetitionCard.tsx
│   │   │   └── CheckoutModal.tsx  # PayPal checkout + compliance challenge
│   │   ├── pages/
│   │   │   └── Dashboard.tsx      # Live draw dashboard
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── vite.config.ts
│   ├── package.json
│   └── vercel.json            # Vercel deployment config
├── .env.example
├── railway.toml               # Railway deployment config
└── README.md
```

---

## 🔌 API Endpoints

### Health Check
```bash
curl http://localhost:5000/api/health
```

### Get Skill Challenge Question
```bash
curl http://localhost:5000/api/challenge
```

### Get All Competitions
```bash
curl http://localhost:5000/api/competitions
```

### Enter a Competition (requires challenge token + PayPal order ID)
```bash
curl -X POST http://localhost:5000/api/competitions/1/enter \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 1,
    "termsAccepted": true,
    "challengeToken": "<token from /api/challenge>",
    "challengeAnswer": "20",
    "paypalOrderId": "<PayPal order ID>",
    "prizeOption": "cash"
  }'
```

---

## ⚙️ Environment Variables

### Backend (`.env.example`)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | Server port |
| `NODE_ENV` | `development` | Set to `production` for live PayPal |
| `CLIENT_URL` | `http://localhost:5173` | Frontend URL for CORS |
| `PAYPAL_CLIENT_ID` | *(required)* | PayPal app client ID |
| `PAYPAL_CLIENT_SECRET` | *(required)* | PayPal app secret |

### Frontend (`client/.env.example`)

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:5000` | Backend API URL |
| `VITE_PAYPAL_CLIENT_ID` | *(required)* | PayPal client ID (same as backend) |

---

## 🚀 Deployment

### Deploy Frontend → Vercel (Free)
1. Sign in at [vercel.com](https://vercel.com)
2. **New Project** → Import this repo
3. Add env vars: `VITE_API_URL`, `VITE_PAYPAL_CLIENT_ID`
4. Deploy

### Deploy Backend → Railway (Free)
1. Sign in at [railway.app](https://railway.app)
2. **New Project** → Deploy from GitHub → this repo
3. Add env vars: `NODE_ENV=production`, `CLIENT_URL`, `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`
4. Railway auto-detects `railway.toml`

---

## 🔧 Troubleshooting

**npm install failures**
```bash
rm -rf node_modules package-lock.json && npm install
```

**CORS errors** – Ensure `CLIENT_URL` in backend `.env` exactly matches your frontend URL.

**PayPal not loading** – Check `VITE_PAYPAL_CLIENT_ID` is set in `client/.env`.

**TypeScript errors**
```bash
npm run type-check
```

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite + TypeScript |
| Routing | React Router v6 |
| Backend | Express + Node.js + TypeScript |
| Payments | PayPal (Apple Pay & Google Pay via Stripe — coming soon) |
| Security | Helmet, CORS, Rate limiting |
| Deployment | Vercel (frontend) + Railway (backend) |

---

## 📄 License

MIT © shugstarwork-maker
