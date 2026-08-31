/**
 * Tournament Service
 *
 * LEGAL MODEL – NO GAMBLING LICENCE REQUIRED
 * -------------------------------------------
 * These are SKILL-BASED tournaments, not prize draws or lotteries.
 *   • Chess and Connect 4 are universally recognised as games of skill.
 *   • Players compete in a single/double-elimination bracket; the winner is
 *     determined by skill performance, not by chance.
 *   • Entry fees fund the prize pool (platform retains a 20% hosting fee).
 *   • This model mirrors platforms like Chess.com, Battlefy, Challonge and
 *     standard esports tournament operators who operate without a gambling
 *     licence under the "skill-game exemption" in most jurisdictions.
 *   • Always verify local regulations before launching in a new jurisdiction.
 */

export type GameType = 'chess' | 'connect4';
export type TournamentFormat = 'single-elimination' | 'double-elimination' | 'round-robin';
export type TournamentStatus = 'open' | 'full' | 'in-progress' | 'completed';

export interface Participant {
  id: string;
  name: string;
  registeredAt: string;
  seed?: number;
}

export interface BracketMatch {
  matchId: string;
  round: number;
  player1: Participant | null;
  player2: Participant | null;
  winner: Participant | null;
  scheduledAt?: string;
}

export interface Tournament {
  id: string;
  game: GameType;
  title: string;
  description: string;
  format: TournamentFormat;
  status: TournamentStatus;
  entryFee: number;              // in GBP
  currency: string;
  maxParticipants: number;
  participants: Participant[];
  prizePool: number;             // entryFee * maxParticipants * 0.80
  prizeBreakdown: { place: string; amount: number }[];
  platformFeePercent: number;   // 20 – covers hosting, prize escrow, admin
  startsAt: string;
  registrationDeadline: string;
  rules: string[];
  bracket: BracketMatch[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function iso(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString();
}

function buildSingleEliminationBracket(participants: Participant[]): BracketMatch[] {
  if (participants.length === 0) return [];
  // Pad to next power of 2
  const size = Math.pow(2, Math.ceil(Math.log2(Math.max(participants.length, 2))));
  const seeded = [...participants];
  while (seeded.length < size) seeded.push(null as unknown as Participant);
  const matches: BracketMatch[] = [];
  let matchIndex = 0;
  for (let i = 0; i < size; i += 2) {
    matches.push({
      matchId: `m${++matchIndex}`,
      round: 1,
      player1: seeded[i] ?? null,
      player2: seeded[i + 1] ?? null,
      winner: null,
    });
  }
  // Subsequent rounds (empty – to be filled as bracket progresses)
  let prevRoundMatches = matches.length;
  let round = 2;
  while (prevRoundMatches > 1) {
    prevRoundMatches = Math.ceil(prevRoundMatches / 2);
    for (let i = 0; i < prevRoundMatches; i++) {
      matches.push({ matchId: `m${++matchIndex}`, round, player1: null, player2: null, winner: null });
    }
    round++;
  }
  return matches;
}

function makePrizeBreakdown(pool: number): { place: string; amount: number }[] {
  return [
    { place: '🥇 1st Place', amount: parseFloat((pool * 0.6).toFixed(2)) },
    { place: '🥈 2nd Place', amount: parseFloat((pool * 0.25).toFixed(2)) },
    { place: '🥉 3rd / 4th Place', amount: parseFloat((pool * 0.075).toFixed(2)) },
  ];
}

// ---------------------------------------------------------------------------
// Static tournament catalogue  (in production, store in DB)
// ---------------------------------------------------------------------------
const PLATFORM_FEE = 0.2;

const rawTournaments: Omit<Tournament, 'prizePool' | 'prizeBreakdown' | 'bracket'>[] = [
  {
    id: 'chess-weekly-blitz',
    game: 'chess',
    title: 'Weekly Blitz Chess Championship',
    description:
      'Fast-paced 5+3 blitz chess. 16-player single-elimination bracket. Prove your skill and take the prize pool.',
    format: 'single-elimination',
    status: 'open',
    entryFee: 10,
    currency: 'GBP',
    maxParticipants: 16,
    participants: [],
    platformFeePercent: 20,
    startsAt: iso(7),
    registrationDeadline: iso(6),
    rules: [
      'Time control: 5 minutes + 3 second increment (blitz)',
      'Matches played online via Chess.com or Lichess (free accounts)',
      'Single-elimination – one loss and you are out',
      'No computer assistance permitted; violations result in disqualification',
      'Anti-cheating enforced via platform fair-play tools',
      'Players must be 18+ to register',
      'Prize awarded as bank transfer or crypto within 48 hours of final',
      'Skill-based competition – no element of chance determines the winner',
    ],
  },
  {
    id: 'chess-monthly-classical',
    game: 'chess',
    title: 'Monthly Classical Chess Grand Prix',
    description:
      '30+20 classical chess tournament. 32 players, double-elimination format. Biggest monthly prize pool.',
    format: 'double-elimination',
    status: 'open',
    entryFee: 25,
    currency: 'GBP',
    maxParticipants: 32,
    participants: [],
    platformFeePercent: 20,
    startsAt: iso(21),
    registrationDeadline: iso(19),
    rules: [
      'Time control: 30 minutes + 20 second increment (classical)',
      'Matches played on Lichess (free account, no subscription required)',
      'Double-elimination – you must lose twice to be eliminated',
      'No engine assistance; fair-play enforced by platform',
      'Players must be 18+ to register',
      'Prize pool distributed within 72 hours of the final match',
      'Skill-based competition – outcome determined by chess ability alone',
    ],
  },
  {
    id: 'connect4-weekly',
    game: 'connect4',
    title: 'Weekly Connect 4 Showdown',
    description:
      'Best-of-3 Connect 4 matches. 16-player single-elimination. Fast, fun, and purely skill-based.',
    format: 'single-elimination',
    status: 'open',
    entryFee: 5,
    currency: 'GBP',
    maxParticipants: 16,
    participants: [],
    platformFeePercent: 20,
    startsAt: iso(4),
    registrationDeadline: iso(3),
    rules: [
      'Each match is best-of-3 games',
      'Played via the platform\'s built-in Connect 4 interface (coming soon) or agreed external tool',
      'Single-elimination bracket',
      'Players must be 18+ to register',
      'Connect 4 is a solved, skill-based game; outcome is not determined by chance',
      'Prize paid within 48 hours of final',
    ],
  },
  {
    id: 'connect4-masters',
    game: 'connect4',
    title: 'Connect 4 Masters Cup',
    description:
      'Monthly 32-player Connect 4 championship. Best-of-5 finals. Highest Connect 4 prize pool.',
    format: 'single-elimination',
    status: 'open',
    entryFee: 15,
    currency: 'GBP',
    maxParticipants: 32,
    participants: [],
    platformFeePercent: 20,
    startsAt: iso(14),
    registrationDeadline: iso(12),
    rules: [
      'Quarter-finals and below: best-of-3',
      'Semi-finals: best-of-5',
      'Final: best-of-7',
      'Single-elimination bracket',
      'Players must be 18+ to register',
      'Connect 4 is a skill-based strategy game',
      'Prize paid within 48 hours of final',
    ],
  },
];

function hydrate(raw: Omit<Tournament, 'prizePool' | 'prizeBreakdown' | 'bracket'>): Tournament {
  const prizePool = parseFloat((raw.entryFee * raw.maxParticipants * (1 - PLATFORM_FEE)).toFixed(2));
  return {
    ...raw,
    prizePool,
    prizeBreakdown: makePrizeBreakdown(prizePool),
    bracket: buildSingleEliminationBracket(raw.participants),
  };
}

// In-memory store (replace with DB in production)
const store: Tournament[] = rawTournaments.map(hydrate);

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
export function getAllTournaments(): Tournament[] {
  return store;
}

export function getTournamentById(id: string): Tournament | undefined {
  return store.find((t) => t.id === id);
}

export interface RegistrationResult {
  success: boolean;
  message: string;
  tournament?: Tournament;
  participant?: Participant;
  checkoutUrl?: string;
}

export function registerParticipant(
  tournamentId: string,
  name: string,
  clientUrl: string
): RegistrationResult {
  const tournament = store.find((t) => t.id === tournamentId);

  if (!tournament) {
    return { success: false, message: 'Tournament not found.' };
  }
  if (tournament.status === 'full' || tournament.participants.length >= tournament.maxParticipants) {
    return { success: false, message: 'This tournament is full.' };
  }
  if (tournament.status === 'in-progress' || tournament.status === 'completed') {
    return { success: false, message: 'Registration is closed for this tournament.' };
  }
  if (!name || name.trim().length < 2) {
    return { success: false, message: 'Please provide a valid player name (minimum 2 characters).' };
  }

  const duplicate = tournament.participants.find(
    (p) => p.name.toLowerCase() === name.trim().toLowerCase()
  );
  if (duplicate) {
    return { success: false, message: 'A player with that name is already registered.' };
  }

  const participant: Participant = {
    id: `p-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: name.trim(),
    registeredAt: new Date().toISOString(),
    seed: tournament.participants.length + 1,
  };

  tournament.participants.push(participant);

  // Update status if now full
  if (tournament.participants.length >= tournament.maxParticipants) {
    tournament.status = 'full';
  }

  // Rebuild bracket with new participant list
  tournament.bracket = buildSingleEliminationBracket(tournament.participants);

  // Build a post-registration confirmation URL
  const qs = new URLSearchParams({
    tournament_id: tournament.id,
    tournament_title: tournament.title,
    player_name: participant.name,
    entry_fee: String(tournament.entryFee),
  });
  const checkoutUrl = `${clientUrl}/tournament-confirmed?${qs}`;

  return { success: true, message: 'Registration successful!', tournament, participant, checkoutUrl };
}
