const request = require('supertest');

// Replace the MySQL pool so these tests run without a database.
jest.mock('../src/db', () => ({ query: jest.fn() }));

const pool = require('../src/db');
const app = require('../src/app');
const { todayInThunderBay, nowInThunderBay } = require('../src/utils/dates');

// Only the clock is faked, so Supertest's own timers keep working.
const REAL_TIMERS = [
  'nextTick', 'setImmediate', 'clearImmediate', 'setInterval', 'clearInterval',
  'setTimeout', 'clearTimeout', 'queueMicrotask',
];

afterEach(() => {
  jest.useRealTimers();
});

beforeEach(() => {
  pool.query.mockReset();
  pool.query.mockResolvedValue([[]]);
});

describe('GET /api/events', () => {
  it('only asks for events that have not started yet', async () => {
    // 10:30 p.m. on Nov 11 in Thunder Bay.
    jest.useFakeTimers({ now: new Date('2026-11-12T03:30:05Z'), doNotFake: REAL_TIMERS });

    const res = await request(app).get('/api/events');

    expect(res.status).toBe(200);
    const [sql, params] = pool.query.mock.calls[0];
    expect(sql).toContain('TIMESTAMP(event_date, event_time) > ?');
    expect(params).toEqual(['%%', '%%', '2026-11-11 22:30:05']);
  });

  it('still filters by keyword and location', async () => {
    jest.useFakeTimers({ now: new Date('2026-11-12T03:30:05Z'), doNotFake: REAL_TIMERS });

    await request(app).get('/api/events?keyword=jazz&location=Thunder%20Bay');

    const [, params] = pool.query.mock.calls[0];
    expect(params).toEqual(['%jazz%', '%Thunder Bay%', '2026-11-11 22:30:05']);
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

describe('nowInThunderBay', () => {
  it('gives the date and time in Thunder Bay, not UTC', () => {
    expect(nowInThunderBay(new Date('2026-11-12T03:30:05Z'))).toBe('2026-11-11 22:30:05');
  });

  it('writes midnight as 00, not 24', () => {
    expect(nowInThunderBay(new Date('2026-11-12T05:00:00Z'))).toBe('2026-11-12 00:00:00');
  });

  it('follows daylight saving time in the summer', () => {
    expect(nowInThunderBay(new Date('2026-07-01T16:15:00Z'))).toBe('2026-07-01 12:15:00');
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
