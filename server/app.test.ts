import { afterEach, describe, expect, it } from 'vitest';
import { createServer, type Server } from 'node:http';
import { AddressInfo } from 'node:net';
import { createApp } from './app.js';

interface RunningServer {
  server: Server;
  baseUrl: string;
}

const runningServers: Server[] = [];

async function startServer(options: {
  paymentGateway?: {
    charge: (params: {
      amount: number;
      currency: string;
      idempotencyKey: string;
      metadata: Record<string, string>;
    }) => Promise<{ status: 'authorized' | 'failed'; transactionId: string; provider: string; reason?: string }>;
  };
} = {}): Promise<RunningServer> {
  process.env.AUDIT_API_TOKEN = 'test-audit-token';
  const app = createApp({ databaseUrl: 'sqlite::memory:', paymentGateway: options.paymentGateway });
  const server = createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve());
  });

  const address = server.address() as AddressInfo;
  runningServers.push(server);
  return {
    server,
    baseUrl: `http://127.0.0.1:${address.port}`,
  };
}

afterEach(async () => {
  await Promise.all(
    runningServers.splice(0).map(
      (server) =>
        new Promise<void>((resolve, reject) => {
          server.close((error) => {
            if (error) reject(error);
            else resolve();
          });
        }),
    ),
  );
});

describe('competition entry API', () => {
  it('requires terms and idempotency key', async () => {
    const { baseUrl } = await startServer();

    const missingIdempotency = await fetch(`${baseUrl}/api/competitions/1/enter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: 1, termsAccepted: true, prizeOption: 'cash' }),
    });
    expect(missingIdempotency.status).toBe(400);

    const missingTerms = await fetch(`${baseUrl}/api/competitions/1/enter`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': 'test-key-12345',
      },
      body: JSON.stringify({ quantity: 1, termsAccepted: false, prizeOption: 'cash' }),
    });
    expect(missingTerms.status).toBe(400);
  });

  it('returns same result for duplicate idempotency key and records audit events', async () => {
    const { baseUrl } = await startServer();

    const entryPayload = {
      quantity: 2,
      termsAccepted: true,
      prizeOption: 'cash',
    };

    const key = 'repeatable-key-12345';
    const firstResponse = await fetch(`${baseUrl}/api/competitions/1/enter`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': key,
      },
      body: JSON.stringify(entryPayload),
    });

    expect(firstResponse.status).toBe(200);
    const firstBody = await firstResponse.json() as { entryId: string; payment: { status: string } };
    expect(firstBody.payment.status).toBe('authorized');

    const secondResponse = await fetch(`${baseUrl}/api/competitions/1/enter`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': key,
      },
      body: JSON.stringify(entryPayload),
    });

    expect(secondResponse.status).toBe(200);
    const secondBody = await secondResponse.json() as { entryId: string };
    expect(secondBody.entryId).toBe(firstBody.entryId);

    const auditResponse = await fetch(`${baseUrl}/api/entries/${firstBody.entryId}/audit`, {
      headers: { 'X-Entry-Audit-Token': 'test-audit-token' },
    });
    expect(auditResponse.status).toBe(200);
    const auditBody = await auditResponse.json() as { audit: Array<{ event: string }> };
    expect(auditBody.audit.map((item) => item.event)).toEqual([
      'payment_initiated',
      'payment_authorized',
      'entry_confirmed',
    ]);
  });

  it('rejects reused idempotency key with different payload', async () => {
    const { baseUrl } = await startServer();
    const key = 'stable-idempotency-98765';

    const firstResponse = await fetch(`${baseUrl}/api/competitions/1/enter`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': key,
      },
      body: JSON.stringify({ quantity: 1, termsAccepted: true, prizeOption: 'cash' }),
    });
    expect(firstResponse.status).toBe(200);

    const secondResponse = await fetch(`${baseUrl}/api/competitions/1/enter`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': key,
      },
      body: JSON.stringify({ quantity: 2, termsAccepted: true, prizeOption: 'cash' }),
    });
    expect(secondResponse.status).toBe(422);
  });

  it('returns 409 while matching idempotent request is still processing', async () => {
    let releaseCharge: (() => void) | null = null;
    const slowGateway = {
      charge: async () => {
        await new Promise<void>((resolve) => {
          releaseCharge = () => resolve();
        });
        return {
          status: 'authorized' as const,
          transactionId: 'txn-slow-gateway',
          provider: 'test-gateway',
        };
      },
    };

    const { baseUrl } = await startServer({ paymentGateway: slowGateway });
    const key = 'in-progress-key-12345';
    const payload = JSON.stringify({ quantity: 1, termsAccepted: true, prizeOption: 'cash' });

    const firstPromise = fetch(`${baseUrl}/api/competitions/1/enter`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': key,
      },
      body: payload,
    });

    await new Promise((resolve) => setTimeout(resolve, 25));

    const secondResponse = await fetch(`${baseUrl}/api/competitions/1/enter`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': key,
      },
      body: payload,
    });
    expect(secondResponse.status).toBe(409);

    const release = releaseCharge as (() => void) | null;
    if (typeof release === 'function') {
      release();
    }
    const firstResponse = await firstPromise;
    expect(firstResponse.status).toBe(200);
  });
});

describe('tournament and support APIs', () => {
  it('serves tournament listing and registration', async () => {
    const { baseUrl } = await startServer();

    const listResponse = await fetch(`${baseUrl}/api/tournaments`);
    expect(listResponse.status).toBe(200);
    const tournaments = await listResponse.json() as Array<{ slug: string }>;
    expect(tournaments.length).toBeGreaterThan(0);

    const registerResponse = await fetch(`${baseUrl}/api/tournaments/chess/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Player',
        email: 'player@example.com',
        termsAccepted: true,
      }),
    });

    expect(registerResponse.status).toBe(201);
    const registerBody = await registerResponse.json() as { registrationId: string };
    expect(registerBody.registrationId.startsWith('reg_')).toBe(true);
  });

  it('returns 409 when tournament reaches capacity', async () => {
    const { baseUrl } = await startServer();
    let finalStatus = 201;

    for (let i = 0; i < 120; i += 1) {
      const response = await fetch(`${baseUrl}/api/tournaments/chess/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `Player ${i}`,
          email: `player${i}@example.com`,
          termsAccepted: true,
        }),
      });
      finalStatus = response.status;
      if (finalStatus === 409) break;
    }

    expect(finalStatus).toBe(409);
  });

  it('returns supportive reply and creates support request', async () => {
    const { baseUrl } = await startServer();

    const chatResponse = await fetch(`${baseUrl}/api/mental-health/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'I feel anxious today', history: [] }),
    });
    expect(chatResponse.status).toBe(200);
    const chatBody = await chatResponse.json() as { reply: string };
    expect(chatBody.reply.length).toBeGreaterThan(10);

    const supportResponse = await fetch(`${baseUrl}/api/support-worker-requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        reason: 'Need follow-up support after stressful week.',
        preferredContact: 'email',
        urgent: false,
      }),
    });

    expect(supportResponse.status).toBe(201);
    const supportBody = await supportResponse.json() as { ticketId: string };
    expect(supportBody.ticketId.startsWith('sw_')).toBe(true);
  });
});
