/**
 * Integration tests for LostLink API
 * These mock Supabase responses to test controller logic.
 */

jest.mock('../config/supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
    },
  },
  supabaseAdmin: {
    auth: {
      admin: {
        createUser: jest.fn(),
        deleteUser: jest.fn(),
      },
      getUser: jest.fn(),
    },
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    storage: {
      from: jest.fn().mockReturnThis(),
      upload: jest.fn(),
      getPublicUrl: jest.fn(),
    },
  },
}));

const request = require('supertest');
const app = require('../app');
const { supabase, supabaseAdmin } = require('../config/supabaseClient');

describe('Health Check', () => {
  test('GET /health returns 200', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('LostLink API');
  });
});

describe('Auth Routes', () => {
  describe('POST /auth/register', () => {
    test('rejects missing fields', async () => {
      const res = await request(app).post('/auth/register').send({ email: 'test@test.com' });
      expect(res.status).toBe(400);
    });

    test('rejects invalid email', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({ name: 'Test', email: 'not-an-email', password: 'pass123' });
      expect(res.status).toBe(400);
    });

    test('rejects short password', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({ name: 'Test', email: 'test@test.com', password: '123' });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /auth/login', () => {
    test('rejects missing credentials', async () => {
      const res = await request(app).post('/auth/login').send({});
      expect(res.status).toBe(400);
    });
  });
});

describe('Items Routes', () => {
  describe('GET /items', () => {
    beforeEach(() => {
      supabaseAdmin.from.mockReturnThis();
      supabaseAdmin.select.mockReturnThis();
      supabaseAdmin.order = jest.fn().mockReturnThis();
      supabaseAdmin.range = jest.fn().mockResolvedValue({ data: [], error: null, count: 0 });
    });

    test('GET /items returns 200 with pagination', async () => {
      const res = await request(app).get('/items');
      expect(res.status).toBe(200);
    });

    test('accepts type filter', async () => {
      const res = await request(app).get('/items?type=lost');
      expect(res.status).toBe(200);
    });
  });
});

describe('404 Handler', () => {
  test('unknown route returns 404', async () => {
    const res = await request(app).get('/unknown-route');
    expect(res.status).toBe(404);
  });
});
