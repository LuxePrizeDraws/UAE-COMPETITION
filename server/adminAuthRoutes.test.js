import { beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.ADMIN_EMAIL = 'owner@test.com';
process.env.ADMIN_PASSWORD = 'testpass';
process.env.ADMIN_2FA_CODE = '654321';
process.env.ENABLE_AUTO_WITHDRAW_SWEEP = 'false';

let app;

beforeAll(async () => {
  const module = await import('./index.ts');
  app = module.app;
});

describe('admin auth and dashboard routes', () => {
  it('rejects dashboard without auth token', async () => {
    const response = await request(app).get('/api/admin/dashboard');
    expect(response.status).toBe(401);
  });

  it('supports login + 2FA + dashboard + withdrawal + logout flow', async () => {
    const login = await request(app)
      .post('/api/admin/login')
      .send({ email: 'owner@test.com', password: 'testpass' });

    expect(login.status).toBe(200);
    expect(login.body.requiresTwoFA).toBe(true);
    expect(login.body.challengeId).toBeTypeOf('string');

    const verify = await request(app)
      .post('/api/admin/verify-2fa')
      .send({ challengeId: login.body.challengeId, twoFACode: '654321' });

    expect(verify.status).toBe(200);
    expect(verify.body.token).toBeTypeOf('string');

    const token = verify.body.token;

    const entry = await request(app)
      .post('/api/competitions/1/enter')
      .send({ quantity: 2, termsAccepted: true });

    expect(entry.status).toBe(200);

    const dashboard = await request(app)
      .get('/api/admin/dashboard')
      .set('x-admin-token', token);

    expect(dashboard.status).toBe(200);
    expect(dashboard.body.todaysRevenue).toBe(2);
    expect(dashboard.body.availableToWithdraw).toBeGreaterThan(0);

    const calculations = await request(app)
      .get('/api/admin/daily-calculations')
      .set('x-admin-token', token);

    expect(calculations.status).toBe(200);
    expect(calculations.body.calculations).toHaveLength(1);
    expect(calculations.body.calculations[0].entries).toBe(1);
    expect(calculations.body.calculations[0].revenue).toBe(2);
    expect(calculations.body.calculations[0].ownerProfit).toBe(0.8);

    const withdrawal = await request(app)
      .post('/api/admin/withdraw')
      .set('x-admin-token', token)
      .send({ amount: 0.5 });

    expect(withdrawal.status).toBe(200);
    expect(withdrawal.body.success).toBe(true);

    const oversizedWithdrawal = await request(app)
      .post('/api/admin/withdraw')
      .set('x-admin-token', token)
      .send({ amount: 1000000 });

    expect(oversizedWithdrawal.status).toBe(400);

    const logout = await request(app)
      .post('/api/admin/logout')
      .set('x-admin-token', token);

    expect(logout.status).toBe(204);

    const postLogoutDashboard = await request(app)
      .get('/api/admin/dashboard')
      .set('x-admin-token', token);

    expect(postLogoutDashboard.status).toBe(401);
  });
});
