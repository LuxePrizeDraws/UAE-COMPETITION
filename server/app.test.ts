import { afterEach, describe, expect, it } from 'vitest';
import { createServer, type Server } from 'node:http';
import { AddressInfo } from 'node:net';
import { createApp } from './app.js';

interface RunningServer {
  server: Server;
  baseUrl: string;
}

const runningServers: Server[] = [];

async function startServer(): Promise<RunningServer> {
  const app = createApp({ databaseUrl: 'sqlite::memory:' });
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

    const auditResponse = await fetch(`${baseUrl}/api/entries/${firstBody.entryId}/audit`);
    expect(auditResponse.status).toBe(200);
    const auditBody = await auditResponse.json() as { audit: Array<{ event: string }> };
    expect(auditBody.audit.map((item) => item.event)).toEqual([
      'payment_initiated',
      'payment_authorized',
      'entry_confirmed',
    ]);
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
