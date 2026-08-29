CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(30),
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE competitions (
  id BIGSERIAL PRIMARY KEY,
  slug VARCHAR(120) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  short_title VARCHAR(180) NOT NULL,
  description TEXT NOT NULL,
  prize_type VARCHAR(80) NOT NULL,
  prize_amount NUMERIC(12, 2) NOT NULL,
  entry_price NUMERIC(10, 2) NOT NULL,
  total_entries INTEGER NOT NULL,
  sold_entries INTEGER NOT NULL DEFAULT 0,
  draw_date DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'live', 'closed', 'drawn')),
  image VARCHAR(20),
  location VARCHAR(120),
  profit_margin TEXT,
  expected_winners INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  competition_id BIGINT NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  total_cost NUMERIC(12, 2) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'refunded')),
  payment_intent_id VARCHAR(255),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entry_id UUID REFERENCES entries(id) ON DELETE SET NULL,
  amount NUMERIC(12, 2) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'AED',
  provider VARCHAR(50) NOT NULL DEFAULT 'stripe',
  provider_reference VARCHAR(255),
  status VARCHAR(30) NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'processing', 'succeeded', 'failed', 'refunded')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_competitions_status ON competitions(status);
CREATE INDEX idx_entries_user_id ON entries(user_id);
CREATE INDEX idx_entries_competition_id ON entries(competition_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
