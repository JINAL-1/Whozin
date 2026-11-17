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

describe('GET /api/registrations/:eventId', () => {
  const status = (eventId) =>
    request(app)
      .get(`/api/registrations/${eventId}`)
      .set('Authorization', `Bearer ${attendeeToken()}`);

  it('says registered when the attendee has a registration', async () => {
    pool.query.mockResolvedValueOnce([[{ id: 9 }]]);

    const res = await status(1);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ registered: true });
    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('attendee_id = ?'), [5, 1]);
  });

  it('says not registered when there is no registration', async () => {
    pool.query.mockResolvedValueOnce([[]]);

    const res = await status(1);

    expect(res.body).toEqual({ registered: false });
  });

  it('needs a login', async () => {
    const res = await request(app).get('/api/registrations/1');

    expect(res.status).toBe(401);
    expect(pool.query).not.toHaveBeenCalled();
  });

  it('rejects an invalid event id', async () => {
    const res = await status('abc');

    expect(res.status).toBe(400);
    expect(pool.query).not.toHaveBeenCalled();
  });
});

describe('DELETE /api/registrations/:eventId', () => {
  const cancel = (eventId) =>
    request(app)
      .delete(`/api/registrations/${eventId}`)
      .set('Authorization', `Bearer ${attendeeToken()}`);

  it("cancels the attendee's own registration", async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const res = await cancel(1);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'Your registration was cancelled.' });
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM registrations WHERE attendee_id = ? AND event_id = ?'),
      [5, 1]
    );
  });

  it('returns 404 when the attendee was not registered', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

    const res = await cancel(1);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('You are not registered for this event');
  });

  it('needs a login', async () => {
    const res = await request(app).delete('/api/registrations/1');

    expect(res.status).toBe(401);
    expect(pool.query).not.toHaveBeenCalled();
  });
});
