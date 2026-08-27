# UAE Competition Platform

Premium UAE luxury competition platform built with React + Vite + TypeScript (frontend) and Express + Node.js (backend).

## Features

- Premium black & gold luxury design
- Two competition types (Cash & Lifestyle Package)
- User registration, login, and dashboard
- Server-side checkout validation
- Admin dashboard
- Auditable draw system
- UAE location gallery
- Secure payment integration (modular)
- Database persistence

## Project Structure

```
.
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── styles/        # CSS/styling
│   │   └── App.tsx
│   └── vite.config.ts
├── server/                # Express backend
│   ├── config/           # Database & config
│   ├── controllers/       # Request handlers
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── middleware/       # Auth, validation, etc.
│   └── index.ts
├── database/             # Migrations & seeds
└── package.json
```

## Setup

```bash
npm install
npm run dev
```

## Environment Variables

Create `.env` in root:

```
DATABASE_URL=postgresql://user:password@localhost:5432/uae_competition
JWT_SECRET=your_jwt_secret_key
PORT=5000
NODE_ENV=development
PAYMENT_PROVIDER=modular  # To be configured
```

## Development

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000
- **API**: http://localhost:5000/api
