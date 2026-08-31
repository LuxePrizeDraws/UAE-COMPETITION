# UAE Competition Platform 🏆

Premium UK competition platform with **8 live competitions**, transparent pricing, draw-ready tracking, and cash alternatives for every prize.

---

## 🌐 Live Staging Links

| Service | URL |
|---------|-----|
| 🖥️ Frontend | *(Deploy to Vercel – see [Deployment](#deployment) below)* |
| 🔌 Backend API | *(Deploy to Railway – see [Deployment](#deployment) below)* |
| 📬 Postman Collection | Import `UAE-Competition-API.postman_collection.json` |

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
- 💰 **Cash alternatives** – Every prize offers a cash equivalent ("CASH OR CARS – YOU CHOOSE!")
- 📊 **Transparent pricing** – 40% house margin shown publicly
- ⏰ **Countdown timers** – Real-time draw deadlines
- ✅ **Terms acceptance** – Compliance-first entry flow
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
✨ UAE Competition API running on http://localhost:5000
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
UAE-COMPETITION/
├── server/
│   ├── index.ts               # Main API with 8 competitions
│   └── .env.example
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   └── CompetitionCard.tsx
│   │   ├── pages/
│   │   │   └── Dashboard.tsx  # Live demo dashboard
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── vite.config.ts
│   ├── package.json
│   └── vercel.json            # Vercel deployment config
├── .env.example
├── .env.staging
├── .env.production
├── railway.toml               # Railway deployment config
├── UAE-Competition-API.postman_collection.json
└── README.md
```

---

## 🔌 API Endpoints

### Health Check
```bash
curl http://localhost:5000/api/health
```

### Get All Competitions
```bash
curl http://localhost:5000/api/competitions
```

### Get Single Competition
```bash
curl http://localhost:5000/api/competitions/7
```

### Enter a Competition
```bash
# Basic cash entry
curl -X POST http://localhost:5000/api/competitions/1/enter \
  -H "Content-Type: application/json" \
  -d '{"quantity": 5, "termsAccepted": true}'

# Supercar – physical prize
curl -X POST http://localhost:5000/api/competitions/7/enter \
  -H "Content-Type: application/json" \
  -d '{"quantity": 10, "termsAccepted": true, "prizeOption": "physical"}'

# UK Dream – cash alternative
curl -X POST http://localhost:5000/api/competitions/8/enter \
  -H "Content-Type: application/json" \
  -d '{"quantity": 3, "termsAccepted": true, "prizeOption": "cash"}'
```

**Request body fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `quantity` | integer | ✅ | Tickets to buy (1–1000) |
| `termsAccepted` | boolean | ✅ | Must be `true` |
| `prizeOption` | string | ❌ | `"physical"` or `"cash"` |

---

## ⚙️ Environment Variables

### Backend (`server/.env.example` or Railway Variables)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | Server port |
| `NODE_ENV` | `development` | Environment |
| `CLIENT_URL` | `http://localhost:5173` | Frontend URL(s) for CORS (comma-separated allowed) |
| `STRIPE_SECRET_KEY` | `sk_test_replace_me` | Stripe secret key (set only in host env vars) |
| `STRIPE_WEBHOOK_SECRET` | `whsec_replace_me` | Stripe webhook signing secret (set only in host env vars) |

### Frontend (`client/.env.example` or Vercel Variables)

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:5000` | Backend API URL |
| `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_test_replace_me` | Stripe publishable key |

---

## 🚀 Deployment

### Deploy Frontend → Vercel (Free)
1. Sign in at [vercel.com](https://vercel.com)
2. **New Project** → Import `UAE-COMPETITION` repo
3. Set **Root Directory** to `client`
4. Add env vars:
   - `VITE_API_URL=https://your-backend.railway.app`
   - `VITE_STRIPE_PUBLISHABLE_KEY=pk_live_or_pk_test_value`
5. Deploy

### Deploy Backend → Railway (Free)
1. Sign in at [railway.app](https://railway.app)
2. **New Project** → Deploy from GitHub → `UAE-COMPETITION`
3. Add env vars:
   - `NODE_ENV=production`
   - `CLIENT_URL=https://your-frontend.vercel.app` (or comma-separated preview + prod URLs)
   - `STRIPE_SECRET_KEY=sk_live_or_sk_test_value`
   - `STRIPE_WEBHOOK_SECRET=whsec_value`
4. Railway auto-detects `railway.toml` and runs:
   - Build: `npm install && npm run build:server`
   - Start: `npm run start`

---

## 🔧 Troubleshooting

**Port already in use**
```bash
lsof -i :5000   # find PID
kill -9 <PID>
```

**CORS errors** – Ensure `CLIENT_URL` in backend `.env` exactly matches your frontend URL.

**npm install failures**
```bash
rm -rf node_modules package-lock.json && npm install
```

**TypeScript errors**
```bash
npm run type-check
```

**Frontend can't reach API** – Check `VITE_API_URL` in `client/.env` points to running backend.

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite + TypeScript |
| Routing | React Router v6 |
| Backend | Express + Node.js + TypeScript |
| Security | Helmet, CORS, Rate limiting |
| Deployment | Vercel (frontend) + Railway (backend) |

---

## 📬 Postman Collection

Import `UAE-Competition-API.postman_collection.json` into Postman:
1. Open Postman → **Import** → select the JSON file
2. Set `baseUrl` variable to your backend URL (default: `http://localhost:5000`)
3. Run requests from **Health & Info**, **Competitions**, or **Entry Management**

---

## 📄 License

MIT © shugstarwork-maker
