export interface Competition {
  id: number;
  title: string;
  description: string;
  prizeType: string;
  prizeAmount: number;
  prizeDetails: {
    currency?: string;
    description?: string;
    includes?: string[];
  };
  entryPrice: number;
  totalEntries: number;
  soldEntries: number;
  endsIn: string;
  tags: string[];
  profitMargin: string;
  expectedWinners: number;
}

export interface Tournament {
  id: number;
  slug: string;
  name: string;
  shortTitle: string;
  format: string;
  status: string;
  startDate: string;
  maxPlayers: number;
  registeredPlayers: number;
  entryFee: number;
  currency: string;
  timeControl?: string;
  rounds: number;
  description: string;
  highlights: string[];
  rules: string[];
}

export interface IdempotencyRecord {
  status_code: number;
  response_json: string;
  request_fingerprint: string;
}

export interface AuditEventInput {
  id: string;
  event: string;
  details: Record<string, unknown>;
}

export interface CreateEntryInput {
  entryId: string;
  competitionId: number;
  quantity: number;
  totalCost: number;
  currency: string;
  prizeChoice: string;
  termsAccepted: boolean;
  entryNumbers: string[];
  paymentStatus: string;
  paymentReference: string;
  idempotencyKey: string;
  auditEvents: AuditEventInput[];
}

export interface DatabaseClient {
  getCompetitions(): Competition[];
  getCompetitionById(id: number): Competition | null;
  getIdempotencyRecord(key: string, route: string): IdempotencyRecord | null;
  reserveIdempotencyRecord(input: { key: string; route: string; requestFingerprint: string }): boolean;
  saveIdempotencyRecord(input: { key: string; route: string; requestFingerprint: string; statusCode: number; response: unknown }): void;
  createCompetitionEntry(input: CreateEntryInput): { entryId: string; competition: Competition };
  listPaymentAuditByEntryId(entryId: string): Array<{ id: string; event: string; details: Record<string, unknown>; createdAt: string }>;
  entryExists(entryId: string): boolean;
  getTournaments(enabledSlugs?: string[]): Tournament[];
  getTournamentBySlug(slug: string): Tournament | null;
  registerTournamentPlayer(input: { registrationId: string; slug: string; name: string; email: string; termsAccepted: boolean }): void;
  createSupportWorkerRequest(input: { id: string; name: string; email: string; reason: string; preferredContact: string; urgent: boolean }): void;
  close(): void;
}

export function createDatabaseClient(databaseUrl?: string): DatabaseClient;
