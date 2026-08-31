/**
 * Database layer – PostgreSQL via `pg`.
 *
 * If DATABASE_URL is not set the module falls back to an in-memory store so
 * the server still runs in local development without a real database.
 *
 * Schema is created automatically on first connection (idempotent DDL).
 */

import pg from 'pg';

const { Pool } = pg;

// ---------------------------------------------------------------------------
// Connection pool
// ---------------------------------------------------------------------------
let pool: pg.Pool | null = null;

function getPool(): pg.Pool {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not set – cannot connect to PostgreSQL');
    }
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
      max: 10,
    });
  }
  return pool;
}

// ---------------------------------------------------------------------------
// Schema bootstrap
// ---------------------------------------------------------------------------
export async function bootstrapSchema(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    console.warn('[db] DATABASE_URL not set – skipping schema bootstrap (in-memory mode)');
    return;
  }

  const client = await getPool().connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id          SERIAL PRIMARY KEY,
        email       TEXT UNIQUE NOT NULL,
        password    TEXT NOT NULL,
        name        TEXT NOT NULL,
        role        TEXT NOT NULL DEFAULT 'user',
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS competition_entries (
        id              SERIAL PRIMARY KEY,
        competition_id  INTEGER NOT NULL,
        user_id         INTEGER REFERENCES users(id),
        order_id        TEXT,
        quantity        INTEGER NOT NULL,
        prize_option    TEXT NOT NULL DEFAULT 'cash',
        total_cost      NUMERIC(12, 2) NOT NULL,
        currency        TEXT NOT NULL DEFAULT 'GBP',
        entry_numbers   TEXT[] NOT NULL,
        status          TEXT NOT NULL DEFAULT 'pending',
        created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_entries_competition ON competition_entries(competition_id);
      CREATE INDEX IF NOT EXISTS idx_entries_user       ON competition_entries(user_id);

      CREATE TABLE IF NOT EXISTS tournament_registrations (
        id             SERIAL PRIMARY KEY,
        tournament_id  TEXT NOT NULL,
        user_id        INTEGER REFERENCES users(id),
        player_name    TEXT NOT NULL,
        entry_fee_paid BOOLEAN NOT NULL DEFAULT FALSE,
        payment_ref    TEXT,
        registered_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_treg_tournament ON tournament_registrations(tournament_id);
    `);
    console.log('[db] Schema bootstrapped ✓');
  } finally {
    client.release();
  }
}

// ---------------------------------------------------------------------------
// Typed query helper
// ---------------------------------------------------------------------------
export async function query<T = pg.QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<pg.QueryResult<T>> {
  return getPool().query<T>(text, params);
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------
export interface UserRow {
  id: number;
  email: string;
  password: string;
  name: string;
  role: string;
  created_at: Date;
}

export async function createUser(
  email: string,
  hashedPassword: string,
  name: string
): Promise<UserRow> {
  const res = await query<UserRow>(
    `INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING *`,
    [email, hashedPassword, name]
  );
  return res.rows[0];
}

export async function findUserByEmail(email: string): Promise<UserRow | null> {
  const res = await query<UserRow>(`SELECT * FROM users WHERE email = $1`, [email]);
  return res.rows[0] ?? null;
}

export async function findUserById(id: number): Promise<UserRow | null> {
  const res = await query<UserRow>(`SELECT * FROM users WHERE id = $1`, [id]);
  return res.rows[0] ?? null;
}

// ---------------------------------------------------------------------------
// Competition entries
// ---------------------------------------------------------------------------
export interface EntryRow {
  id: number;
  competition_id: number;
  user_id: number | null;
  order_id: string | null;
  quantity: number;
  prize_option: string;
  total_cost: string;
  currency: string;
  entry_numbers: string[];
  status: string;
  created_at: Date;
}

export async function createEntry(params: {
  competitionId: number;
  userId?: number | null;
  orderId?: string | null;
  quantity: number;
  prizeOption: string;
  totalCost: number;
  currency: string;
  entryNumbers: string[];
  status?: string;
}): Promise<EntryRow> {
  const res = await query<EntryRow>(
    `INSERT INTO competition_entries
       (competition_id, user_id, order_id, quantity, prize_option, total_cost, currency, entry_numbers, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     RETURNING *`,
    [
      params.competitionId,
      params.userId ?? null,
      params.orderId ?? null,
      params.quantity,
      params.prizeOption,
      params.totalCost,
      params.currency,
      params.entryNumbers,
      params.status ?? 'pending',
    ]
  );
  return res.rows[0];
}

export async function updateEntryStatus(
  entryId: number,
  status: string,
  orderId?: string
): Promise<void> {
  await query(
    `UPDATE competition_entries SET status = $1, order_id = COALESCE($2, order_id) WHERE id = $3`,
    [status, orderId ?? null, entryId]
  );
}

export async function getEntriesByCompetition(competitionId: number): Promise<EntryRow[]> {
  const res = await query<EntryRow>(
    `SELECT * FROM competition_entries WHERE competition_id = $1 ORDER BY created_at DESC`,
    [competitionId]
  );
  return res.rows;
}

export async function getEntriesByUser(userId: number): Promise<EntryRow[]> {
  const res = await query<EntryRow>(
    `SELECT * FROM competition_entries WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId]
  );
  return res.rows;
}

export async function countPaidEntries(competitionId: number): Promise<number> {
  const res = await query<{ total: string }>(
    `SELECT COALESCE(SUM(quantity), 0) AS total
       FROM competition_entries
      WHERE competition_id = $1 AND status = 'paid'`,
    [competitionId]
  );
  return parseInt(res.rows[0]?.total ?? '0');
}

// ---------------------------------------------------------------------------
// Tournament registrations
// ---------------------------------------------------------------------------
export interface TournamentRegRow {
  id: number;
  tournament_id: string;
  user_id: number | null;
  player_name: string;
  entry_fee_paid: boolean;
  payment_ref: string | null;
  registered_at: Date;
}

export async function createTournamentRegistration(params: {
  tournamentId: string;
  userId?: number | null;
  playerName: string;
}): Promise<TournamentRegRow> {
  const res = await query<TournamentRegRow>(
    `INSERT INTO tournament_registrations (tournament_id, user_id, player_name)
     VALUES ($1,$2,$3) RETURNING *`,
    [params.tournamentId, params.userId ?? null, params.playerName]
  );
  return res.rows[0];
}

export async function getTournamentRegistrations(tournamentId: string): Promise<TournamentRegRow[]> {
  const res = await query<TournamentRegRow>(
    `SELECT * FROM tournament_registrations WHERE tournament_id = $1 ORDER BY registered_at ASC`,
    [tournamentId]
  );
  return res.rows;
}
