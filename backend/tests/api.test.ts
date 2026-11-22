import request from 'supertest';
import app from '../src/server';
import prisma from '../src/config/prisma';

describe('API Integration Tests', () => {
  let authToken: string;
  let testUserId: string;

  beforeAll(async () => {
    // Ensure DB connection
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('GET /api/health should return 200 OK', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('OK');
  });

  it('POST /api/auth/login should authenticate seeded user Alex', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'alex@capstone.edu',
        password: 'Password123!',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe('alex@capstone.edu');

    authToken = res.body.data.token;
    testUserId = res.body.data.user.id;
  });

  it('GET /api/auth/me should return user profile with valid JWT', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(testUserId);
  });

  it('GET /api/expenses should return paginated list of expenses', async () => {
    const res = await request(app)
      .get('/api/expenses?page=1&limit=10')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.page).toBe(1);
  });

  it('GET /api/budgets should return user monthly budgets with progress', async () => {
    const res = await request(app)
      .get('/api/budgets')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0]).toHaveProperty('spent');
    expect(res.body.data[0]).toHaveProperty('percentage');
  });

  it('GET /api/groups should return user groups', async () => {
    const res = await request(app)
      .get('/api/groups')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].name).toBe('Apartment 402 Roommates');
  });

  it('GET /api/analytics/dashboard should return complete financial KPIs', async () => {
    const res = await request(app)
      .get('/api/analytics/dashboard')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('totalBalance');
    expect(res.body.data).toHaveProperty('monthlyIncome');
    expect(res.body.data).toHaveProperty('monthlyExpense');
    expect(res.body.data).toHaveProperty('spendingVelocity');
    expect(res.body.data).toHaveProperty('sharedBalances');
  });
});
