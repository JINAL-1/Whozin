const request = require('supertest');

// Replace the MySQL pool so these tests run without a database.
jest.mock('../src/db', () => ({ query: jest.fn() }));

const pool = require('../src/db');
const app = require('../src/app');
const { todayInThunderBay } = require('../src/utils/dates');

beforeEach(() => {
  pool.query.mockReset();
  pool.query.mockResolvedValue([[]]);
});

describe('GET /api/events', () => {
  it('only asks for events from today onwards', async () => {
    const res = await request(app).get('/api/events');

    expect(res.status).toBe(200);
    const [sql, params] = pool.query.mock.calls[0];
    expect(sql).toContain('event_date >= ?');
    expect(params).toEqual(['%%', '%%', todayInThunderBay()]);
  });

  it('still filters by keyword and location', async () => {
    await request(app).get('/api/events?keyword=jazz&location=Thunder%20Bay');

    const [, params] = pool.query.mock.calls[0];
    expect(params).toEqual(['%jazz%', '%Thunder Bay%', todayInThunderBay()]);
  });

  it('still only returns published events, soonest first', async () => {
    await request(app).get('/api/events');

    const [sql] = pool.query.mock.calls[0];
    expect(sql).toContain("status = 'published'");
    expect(sql).toContain('ORDER BY event_date ASC, event_time ASC');
  });

  it('returns 500 without database details when the query fails', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    pool.query.mockRejectedValue(new Error('connect ECONNREFUSED 10.0.0.5:3306'));

    const res = await request(app).get('/api/events');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Could not retrieve events' });
    console.error.mockRestore();
  });
});

describe('todayInThunderBay', () => {
  it('uses Thunder Bay time, not the server clock in UTC', () => {
    // 10:30 p.m. on Nov 11 in Thunder Bay is already Nov 12 in UTC.
    expect(todayInThunderBay(new Date('2026-11-12T03:30:00Z'))).toBe('2026-11-11');
    expect(todayInThunderBay(new Date('2026-11-12T05:30:00Z'))).toBe('2026-11-12');
  });

  it('follows daylight saving time in the summer', () => {
    expect(todayInThunderBay(new Date('2026-07-01T03:59:00Z'))).toBe('2026-06-30');
    expect(todayInThunderBay(new Date('2026-07-01T04:00:00Z'))).toBe('2026-07-01');
  });
});
