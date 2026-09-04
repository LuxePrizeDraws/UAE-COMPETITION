import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const DEFAULT_COMPETITIONS = [
  {
    id: 1,
    title: 'WIN 10,000 AED CASH',
    description: 'Guaranteed Winner - Fair Live Draw',
    prizeType: 'CASH COMPETITION',
    prizeAmount: 10000,
    prizeDetails: { currency: 'AED', description: 'Cash Prize' },
    entryPrice: 1,
    totalEntries: 10000,
    soldEntries: 7248,
    endsIn: '2 days 14 hours 36 minutes 28 seconds',
    tags: ['Guaranteed Winner', 'Fair Live Draw', 'Transparent Odds'],
    profitMargin: '40% House, 60% Prize Pool (Transparent)',
    expectedWinners: 1,
  },
  {
    id: 2,
    title: 'WIN THE ULTIMATE UAE DREAM PACKAGE',
    description: 'Luxury Stay, Premium Experiences, Travel & Lifestyle',
    prizeType: 'LIFESTYLE PACKAGE',
    prizeAmount: 500000,
    prizeDetails: {
      currency: 'AED',
      description: 'Luxury Experience Package',
      includes: ['5-star luxury stay', 'Premium experiences', 'Travel package', 'Lifestyle experiences'],
    },
    entryPrice: 1,
    totalEntries: 1000000,
    soldEntries: 856000,
    endsIn: '5 days 14 hours 36 minutes 28 seconds',
    tags: ['Luxury Experience', 'Fair Live Draw', 'Transparent Odds'],
    profitMargin: '40% House, 60% Prize Pool (Transparent)',
    expectedWinners: 1,
  },
];

const DEFAULT_TOURNAMENTS = [
  {
    slug: 'chess',
    name: 'Chess Masters Challenge',
    short_title: 'Chess Masters',
    format: 'Swiss + knockout final',
    status: 'open',
    start_date: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
    max_players: 128,
    registered_players: 42,
    entry_fee: 15,
    currency: 'AED',
    time_control: '10+5 rapid',
    rounds: 9,
    description: 'A strategic chess challenge with live finals and cash-prize ladder payouts.',
    highlights: ['Live arbiter supervision', 'Anti-cheat checks', 'Cash-prize finals stream'],
    rules: ['FIDE rapid rules apply', 'Fair-play checks are mandatory', 'Late arrivals forfeit after 10 minutes'],
  },
  {
    slug: 'connect4',
    name: 'Connect 4 Elite Bracket',
    short_title: 'Connect 4 Elite',
    format: 'Double elimination',
    status: 'open',
    start_date: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString(),
    max_players: 256,
    registered_players: 80,
    entry_fee: 5,
    currency: 'AED',
    time_control: null,
    rounds: 8,
    description: 'Fast-paced bracket format with spectator boards and cash-prize challenge rounds.',
    highlights: ['Bracket seeding reveal', 'Live commentary matches', 'Cash-prize challenge round'],
    rules: ['Best-of-3 until semifinals', 'Finals are best-of-5', 'Disconnect over 2 minutes is forfeiture'],
  },
];

const MIGRATIONS = [
  {
    id: 1,
    name: 'core_tables',
    statements: [
      `CREATE TABLE IF NOT EXISTS competitions (
        id INTEGER PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        prize_type TEXT NOT NULL,
        prize_amount REAL NOT NULL,
        prize_details_json TEXT NOT NULL,
        entry_price REAL NOT NULL,
        total_entries INTEGER NOT NULL,
        sold_entries INTEGER NOT NULL,
        ends_in TEXT NOT NULL,
        tags_json TEXT NOT NULL,
        profit_margin TEXT NOT NULL,
        expected_winners INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS tournaments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        short_title TEXT NOT NULL,
        format TEXT NOT NULL,
        status TEXT NOT NULL,
        start_date TEXT NOT NULL,
        max_players INTEGER NOT NULL,
        registered_players INTEGER NOT NULL,
        entry_fee REAL NOT NULL,
        currency TEXT NOT NULL,
        time_control TEXT,
        rounds INTEGER NOT NULL,
        description TEXT NOT NULL,
        highlights_json TEXT NOT NULL,
        rules_json TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS tournament_registrations (
        id TEXT PRIMARY KEY,
        tournament_slug TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        terms_accepted INTEGER NOT NULL,
        created_at TEXT NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS competition_entries (
        id TEXT PRIMARY KEY,
        competition_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        total_cost REAL NOT NULL,
        currency TEXT NOT NULL,
        prize_choice TEXT NOT NULL,
        terms_accepted INTEGER NOT NULL,
        entry_numbers_json TEXT NOT NULL,
        payment_status TEXT NOT NULL,
        payment_reference TEXT,
        idempotency_key TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (competition_id) REFERENCES competitions(id)
      )`,
      'CREATE UNIQUE INDEX IF NOT EXISTS idx_entries_idempotency ON competition_entries(idempotency_key)',
      `CREATE TABLE IF NOT EXISTS payment_audit_logs (
        id TEXT PRIMARY KEY,
        entry_id TEXT NOT NULL,
        event TEXT NOT NULL,
        details_json TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (entry_id) REFERENCES competition_entries(id)
      )`,
      `CREATE TABLE IF NOT EXISTS support_worker_requests (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        reason TEXT NOT NULL,
        preferred_contact TEXT NOT NULL,
        urgent INTEGER NOT NULL,
        created_at TEXT NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS idempotency_keys (
        key TEXT NOT NULL,
        route TEXT NOT NULL,
        status_code INTEGER NOT NULL,
        response_json TEXT NOT NULL,
        created_at TEXT NOT NULL,
        PRIMARY KEY (key, route)
      )`,
    ],
  },
  {
    id: 2,
    name: 'idempotency_fingerprint',
    statements: [
      "ALTER TABLE idempotency_keys ADD COLUMN request_fingerprint TEXT NOT NULL DEFAULT ''",
    ],
  },
];

function resolveDatabasePath(databaseUrl) {
  if (!databaseUrl) return path.resolve(process.cwd(), 'database.db');
  if (databaseUrl.startsWith('sqlite:')) {
    const sqlitePath = databaseUrl.replace(/^sqlite:/, '').trim();
    if (!sqlitePath || sqlitePath === ':memory:') return ':memory:';
    return path.resolve(process.cwd(), sqlitePath);
  }
  return path.resolve(process.cwd(), 'database.db');
}

function ensureDirectory(filePath) {
  if (filePath === ':memory:') return;
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function parseJson(json, fallback) {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

function rowToCompetition(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    prizeType: row.prize_type,
    prizeAmount: row.prize_amount,
    prizeDetails: parseJson(row.prize_details_json, {}),
    entryPrice: row.entry_price,
    totalEntries: row.total_entries,
    soldEntries: row.sold_entries,
    endsIn: row.ends_in,
    tags: parseJson(row.tags_json, []),
    profitMargin: row.profit_margin,
    expectedWinners: row.expected_winners,
  };
}

function rowToTournament(row) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    shortTitle: row.short_title,
    format: row.format,
    status: row.status,
    startDate: row.start_date,
    maxPlayers: row.max_players,
    registeredPlayers: row.registered_players,
    entryFee: row.entry_fee,
    currency: row.currency,
    timeControl: row.time_control || undefined,
    rounds: row.rounds,
    description: row.description,
    highlights: parseJson(row.highlights_json, []),
    rules: parseJson(row.rules_json, []),
  };
}

function runMigrations(db) {
  db.exec(`CREATE TABLE IF NOT EXISTS schema_migrations (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    applied_at TEXT NOT NULL
  )`);

  const hasMigration = db.prepare('SELECT id FROM schema_migrations WHERE id = ?');
  const markMigration = db.prepare('INSERT INTO schema_migrations (id, name, applied_at) VALUES (?, ?, ?)');

  for (const migration of MIGRATIONS) {
    const existing = hasMigration.get(migration.id);
    if (existing) continue;

    db.exec('BEGIN');
    try {
      for (const statement of migration.statements) {
        try {
          db.exec(statement);
        } catch (error) {
          const message = String(error?.message || '').toLowerCase();
          if (message.includes('duplicate column name')) {
            continue;
          }
          throw error;
        }
      }
      markMigration.run(migration.id, migration.name, new Date().toISOString());
      db.exec('COMMIT');
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
  }
}

function seedDefaults(db) {
  const countCompetitions = db.prepare('SELECT COUNT(*) AS total FROM competitions').get();
  if (countCompetitions.total === 0) {
    const stmt = db.prepare(`INSERT INTO competitions
      (id, title, description, prize_type, prize_amount, prize_details_json, entry_price, total_entries, sold_entries, ends_in, tags_json, profit_margin, expected_winners, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    const now = new Date().toISOString();
    for (const competition of DEFAULT_COMPETITIONS) {
      stmt.run(
        competition.id,
        competition.title,
        competition.description,
        competition.prizeType,
        competition.prizeAmount,
        JSON.stringify(competition.prizeDetails),
        competition.entryPrice,
        competition.totalEntries,
        competition.soldEntries,
        competition.endsIn,
        JSON.stringify(competition.tags),
        competition.profitMargin,
        competition.expectedWinners,
        now,
        now,
      );
    }
  }

  const countTournaments = db.prepare('SELECT COUNT(*) AS total FROM tournaments').get();
  if (countTournaments.total === 0) {
    const stmt = db.prepare(`INSERT INTO tournaments
      (slug, name, short_title, format, status, start_date, max_players, registered_players, entry_fee, currency, time_control, rounds, description, highlights_json, rules_json, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    const now = new Date().toISOString();
    for (const tournament of DEFAULT_TOURNAMENTS) {
      stmt.run(
        tournament.slug,
        tournament.name,
        tournament.short_title,
        tournament.format,
        tournament.status,
        tournament.start_date,
        tournament.max_players,
        tournament.registered_players,
        tournament.entry_fee,
        tournament.currency,
        tournament.time_control,
        tournament.rounds,
        tournament.description,
        JSON.stringify(tournament.highlights),
        JSON.stringify(tournament.rules),
        now,
        now,
      );
    }
  }
}

export function createDatabaseClient(databaseUrl = process.env.DATABASE_URL) {
  const dbPath = resolveDatabasePath(databaseUrl);
  ensureDirectory(dbPath);
  const db = new DatabaseSync(dbPath);
  if (dbPath !== ':memory:') {
    db.exec('PRAGMA journal_mode = WAL');
  }
  db.exec('PRAGMA foreign_keys = ON');
  runMigrations(db);
  seedDefaults(db);

  return {
    getCompetitions() {
      const rows = db.prepare('SELECT * FROM competitions ORDER BY id ASC').all();
      return rows.map(rowToCompetition);
    },

    getCompetitionById(id) {
      const row = db.prepare('SELECT * FROM competitions WHERE id = ?').get(id);
      if (!row) return null;
      return rowToCompetition(row);
    },

    getIdempotencyRecord(key, route) {
      return db.prepare('SELECT status_code, response_json, request_fingerprint FROM idempotency_keys WHERE key = ? AND route = ?').get(key, route) || null;
    },

    reserveIdempotencyRecord({ key, route, requestFingerprint }) {
      const result = db
        .prepare('INSERT OR IGNORE INTO idempotency_keys (key, route, request_fingerprint, status_code, response_json, created_at) VALUES (?, ?, ?, ?, ?, ?)')
        .run(key, route, requestFingerprint, 102, JSON.stringify({ status: 'in_progress' }), new Date().toISOString());
      return result.changes > 0;
    },

    saveIdempotencyRecord({ key, route, requestFingerprint, statusCode, response }) {
      db.prepare('INSERT OR REPLACE INTO idempotency_keys (key, route, request_fingerprint, status_code, response_json, created_at) VALUES (?, ?, ?, ?, ?, ?)')
        .run(key, route, requestFingerprint, statusCode, JSON.stringify(response), new Date().toISOString());
    },

    createCompetitionEntry(payload) {
      const now = new Date().toISOString();
      const entryId = payload.entryId;
      const insertEntry = db.prepare(`INSERT INTO competition_entries
        (id, competition_id, quantity, total_cost, currency, prize_choice, terms_accepted, entry_numbers_json, payment_status, payment_reference, idempotency_key, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
      const updateCompetition = db.prepare('UPDATE competitions SET sold_entries = sold_entries + ?, updated_at = ? WHERE id = ? AND sold_entries + ? <= total_entries');
      const selectCompetition = db.prepare('SELECT * FROM competitions WHERE id = ?');
      const insertAudit = db.prepare('INSERT INTO payment_audit_logs (id, entry_id, event, details_json, created_at) VALUES (?, ?, ?, ?, ?)');

      let competitionRow;
      db.exec('BEGIN');
      try {
        const updateResult = updateCompetition.run(payload.quantity, now, payload.competitionId, payload.quantity);
        if (updateResult.changes === 0) {
          const existing = selectCompetition.get(payload.competitionId);
          const error = new Error(existing ? 'Not enough entries remaining' : 'Competition not found');
          error.code = existing ? 'INSUFFICIENT_ENTRIES' : 'NOT_FOUND';
          throw error;
        }

        competitionRow = selectCompetition.get(payload.competitionId);
        insertEntry.run(
          entryId,
          payload.competitionId,
          payload.quantity,
          payload.totalCost,
          payload.currency,
          payload.prizeChoice,
          payload.termsAccepted ? 1 : 0,
          JSON.stringify(payload.entryNumbers),
          payload.paymentStatus,
          payload.paymentReference,
          payload.idempotencyKey,
          now,
        );

        for (const auditEvent of payload.auditEvents) {
          insertAudit.run(auditEvent.id, entryId, auditEvent.event, JSON.stringify(auditEvent.details), now);
        }

        db.exec('COMMIT');
      } catch (error) {
        db.exec('ROLLBACK');
        if (String(error.message).includes('idx_entries_idempotency')) {
          error.code = 'IDEMPOTENCY_COLLISION';
        }
        throw error;
      }

      return {
        entryId,
        competition: rowToCompetition(competitionRow),
      };
    },

    listPaymentAuditByEntryId(entryId) {
      const rows = db.prepare('SELECT id, event, details_json, created_at FROM payment_audit_logs WHERE entry_id = ? ORDER BY created_at ASC').all(entryId);
      return rows.map((row) => ({
        id: row.id,
        event: row.event,
        details: parseJson(row.details_json, {}),
        createdAt: row.created_at,
      }));
    },

    entryExists(entryId) {
      const row = db.prepare('SELECT id FROM competition_entries WHERE id = ?').get(entryId);
      return Boolean(row);
    },

    getTournaments(enabledSlugs = []) {
      if (enabledSlugs.length === 0) {
        const rows = db.prepare('SELECT * FROM tournaments ORDER BY id ASC').all();
        return rows.map(rowToTournament);
      }
      const placeholders = enabledSlugs.map(() => '?').join(',');
      const rows = db.prepare(`SELECT * FROM tournaments WHERE slug IN (${placeholders}) ORDER BY id ASC`).all(...enabledSlugs);
      return rows.map(rowToTournament);
    },

    getTournamentBySlug(slug) {
      const row = db.prepare('SELECT * FROM tournaments WHERE slug = ?').get(slug);
      return row ? rowToTournament(row) : null;
    },

    registerTournamentPlayer({ registrationId, slug, name, email, termsAccepted }) {
      const tournamentExists = db.prepare('SELECT slug FROM tournaments WHERE slug = ?').get(slug);
      if (!tournamentExists) {
        const error = new Error('Tournament not found');
        error.code = 'TOURNAMENT_NOT_FOUND';
        throw error;
      }

      const now = new Date().toISOString();
      const insertRegistration = db.prepare('INSERT INTO tournament_registrations (id, tournament_slug, name, email, terms_accepted, created_at) VALUES (?, ?, ?, ?, ?, ?)');
      const updateTournament = db.prepare('UPDATE tournaments SET registered_players = registered_players + 1, updated_at = ? WHERE slug = ? AND registered_players < max_players');

      db.exec('BEGIN');
      try {
        const updated = updateTournament.run(now, slug);
        if (updated.changes === 0) {
          const error = new Error('Tournament is full');
          error.code = 'TOURNAMENT_FULL';
          throw error;
        }
        insertRegistration.run(registrationId, slug, name, email, termsAccepted ? 1 : 0, now);
        db.exec('COMMIT');
      } catch (error) {
        db.exec('ROLLBACK');
        throw error;
      }
    },

    createSupportWorkerRequest({ id, name, email, reason, preferredContact, urgent }) {
      db.prepare('INSERT INTO support_worker_requests (id, name, email, reason, preferred_contact, urgent, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
        .run(id, name, email, reason, preferredContact, urgent ? 1 : 0, new Date().toISOString());
    },

    close() {
      db.close();
    },
  };
}
