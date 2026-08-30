import Database from 'better-sqlite3';
import { randomBytes } from 'crypto';
import path from 'path';

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), 'competitions.db');
export const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ─── Schema ───────────────────────────────────────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS entries (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    competition_id INTEGER NOT NULL,
    entry_numbers  TEXT    NOT NULL,  -- JSON array of entry number strings
    quantity       INTEGER NOT NULL,
    total_cost     REAL    NOT NULL,
    currency       TEXT    NOT NULL DEFAULT 'GBP',
    prize_option   TEXT    NOT NULL DEFAULT 'cash',
    paypal_order_id TEXT   NOT NULL UNIQUE,
    payer_email    TEXT,
    payer_name     TEXT,
    created_at     TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS draws (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    competition_id  INTEGER NOT NULL,
    competition_title TEXT  NOT NULL,
    total_entries   INTEGER NOT NULL,
    total_revenue   REAL    NOT NULL,
    prize_amount    REAL    NOT NULL,
    currency        TEXT    NOT NULL DEFAULT 'GBP',
    winner_entry_number TEXT NOT NULL,
    winner_email    TEXT,
    winner_name     TEXT,
    seed            TEXT    NOT NULL,  -- random seed used for draw (audit trail)
    draw_method     TEXT    NOT NULL DEFAULT 'crypto_random',
    drawn_at        TEXT    NOT NULL DEFAULT (datetime('now')),
    winner_notified INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS competition_state (
    competition_id INTEGER PRIMARY KEY,
    sold_entries   INTEGER NOT NULL DEFAULT 0,
    total_entries  INTEGER NOT NULL,
    is_live        INTEGER NOT NULL DEFAULT 1,
    last_draw_id   INTEGER,
    last_updated   TEXT    NOT NULL DEFAULT (datetime('now'))
  );
`);

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function recordEntry(params: {
  competitionId: number;
  entryNumbers: string[];
  quantity: number;
  totalCost: number;
  currency: string;
  prizeOption: string;
  paypalOrderId: string;
  payerEmail?: string;
  payerName?: string;
}) {
  const stmt = db.prepare(`
    INSERT INTO entries
      (competition_id, entry_numbers, quantity, total_cost, currency, prize_option, paypal_order_id, payer_email, payer_name)
    VALUES
      (@competitionId, @entryNumbers, @quantity, @totalCost, @currency, @prizeOption, @paypalOrderId, @payerEmail, @payerName)
  `);
  stmt.run({
    ...params,
    entryNumbers: JSON.stringify(params.entryNumbers),
    payerEmail: params.payerEmail ?? null,
    payerName: params.payerName ?? null,
  });
}

export function incrementSoldEntries(competitionId: number, qty: number, totalEntries: number) {
  db.prepare(`
    INSERT INTO competition_state (competition_id, sold_entries, total_entries)
    VALUES (@competitionId, @qty, @totalEntries)
    ON CONFLICT(competition_id) DO UPDATE SET
      sold_entries = sold_entries + @qty,
      last_updated = datetime('now')
  `).run({ competitionId, qty, totalEntries });
}

export function getSoldEntries(competitionId: number): number {
  const row = db.prepare(
    'SELECT sold_entries FROM competition_state WHERE competition_id = ?'
  ).get(competitionId) as { sold_entries: number } | undefined;
  return row?.sold_entries ?? 0;
}

export function getAllEntryNumbers(competitionId: number): string[] {
  const rows = db.prepare(
    'SELECT entry_numbers FROM entries WHERE competition_id = ?'
  ).all(competitionId) as { entry_numbers: string }[];
  return rows.flatMap(r => JSON.parse(r.entry_numbers) as string[]);
}

export function recordDraw(params: {
  competitionId: number;
  competitionTitle: string;
  totalEntries: number;
  totalRevenue: number;
  prizeAmount: number;
  currency: string;
  winnerEntryNumber: string;
  winnerEmail?: string;
  winnerName?: string;
  seed: string;
}) {
  const result = db.prepare(`
    INSERT INTO draws
      (competition_id, competition_title, total_entries, total_revenue, prize_amount, currency,
       winner_entry_number, winner_email, winner_name, seed)
    VALUES
      (@competitionId, @competitionTitle, @totalEntries, @totalRevenue, @prizeAmount, @currency,
       @winnerEntryNumber, @winnerEmail, @winnerName, @seed)
  `).run({
    ...params,
    winnerEmail: params.winnerEmail ?? null,
    winnerName: params.winnerName ?? null,
  });
  return result.lastInsertRowid as number;
}

export function markWinnerNotified(drawId: number) {
  db.prepare('UPDATE draws SET winner_notified = 1 WHERE id = ?').run(drawId);
}

export function resetCompetitionEntries(competitionId: number) {
  db.prepare(
    'UPDATE competition_state SET sold_entries = 0, last_updated = datetime(\'now\') WHERE competition_id = ?'
  ).run(competitionId);
}

export function getDrawHistory(competitionId?: number) {
  if (competitionId) {
    return db.prepare(
      'SELECT * FROM draws WHERE competition_id = ? ORDER BY drawn_at DESC'
    ).all(competitionId);
  }
  return db.prepare('SELECT * FROM draws ORDER BY drawn_at DESC').all();
}

export function generateSeed(): string {
  return randomBytes(32).toString('hex');
}
