const request = require('supertest');
const jwt = require('jsonwebtoken');

// Replace the MySQL pool so these tests run without a database.
jest.mock('../src/db', () => ({ query: jest.fn() }));

const pool = require('../src/db');
const app = require('../src/app');

const SECRET = 'test-secret';
const attendeeToken = () =>
  jwt.sign({ id: 5, email: 'sam@lakeheadu.ca', role: 'attendee' }, SECRET, { expiresIn: '1h' });

const register = (eventId) =>
  request(app)
    .post(`/api/registrations/${eventId}`)
    .set('Authorization', `Bearer ${attendeeToken()}`);

beforeAll(() => {
  process.env.JWT_SECRET = SECRET;
});

beforeEach(() => {
  pool.query.mockReset();
});

describe('POST /api/registrations/:eventId', () => {
  it('blocks registering for an event that has already started', async () => {
    pool.query.mockResolvedValueOnce([
      [{ id: 1, ticket_price: '0.00', status: 'published', has_started: 1 }],
    ]);

    const res = await register(1);

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'This event has already started, so registration is closed' });
    expect(pool.query).toHaveBeenCalledTimes(1);
  });

  it('asks the database whether the event has started, using Thunder Bay time', async () => {
    pool.query
      .mockResolvedValueOnce([[{ id: 1, ticket_price: '0.00', status: 'published', has_started: 0 }]])
      .mockResolvedValueOnce([{ insertId: 9 }]);

    const res = await register(1);

    expect(res.status).toBe(201);
    const [sql, params] = pool.query.mock.calls[0];
    expect(sql).toContain('TIMESTAMP(event_date, event_time) <= ?');
    expect(params[0]).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
    expect(params[1]).toBe(1);
  });

  it('still blocks cancelled events', async () => {
    pool.query.mockResolvedValueOnce([
      [{ id: 1, ticket_price: '0.00', status: 'cancelled', has_started: 0 }],
    ]);

    const res = await register(1);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Registration is closed for this event');
  });
});
