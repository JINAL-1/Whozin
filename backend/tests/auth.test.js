const request = require('supertest');
const jwt = require('jsonwebtoken');

// Replace the MySQL pool so these tests run without a database.
jest.mock('../src/db', () => ({ query: jest.fn() }));

const pool = require('../src/db');
const app = require('../src/app');

const SECRET = 'test-secret';
const organizer = { id: 3, email: 'host@lakeheadu.ca', role: 'organizer' };
const attendee = { id: 5, email: 'sam@lakeheadu.ca', role: 'attendee' };

const tokenFor = (user, secret = SECRET) => jwt.sign(user, secret, { expiresIn: '1h' });
const expiredTokenFor = (user) =>
  jwt.sign({ ...user, exp: Math.floor(Date.now() / 1000) - 60 }, SECRET);

beforeAll(() => {
  process.env.JWT_SECRET = SECRET;
});

beforeEach(() => {
  pool.query.mockReset();
});

// Every route that needs a login.
const protectedRoutes = [
  ['post', '/api/events'],
  ['put', '/api/events/1'],
  ['patch', '/api/events/1/cancel'],
  ['get', '/api/events/mine'],
  ['post', '/api/registrations/1'],
];

describe('routes that need a login', () => {
  it.each(protectedRoutes)('%s %s asks the user to log in when there is no token', async (method, path) => {
    const res = await request(app)[method](path);

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'Please log in to continue.' });
    expect(pool.query).not.toHaveBeenCalled();
  });

  it.each(protectedRoutes)('%s %s rejects an expired token', async (method, path) => {
    const res = await request(app)[method](path).set('Authorization', `Bearer ${expiredTokenFor(organizer)}`);

    expect(res.status).toBe(403);
    expect(res.body).toEqual({ error: 'Your session has expired. Please log in again.' });
    expect(pool.query).not.toHaveBeenCalled();
  });

  it.each(protectedRoutes)('%s %s rejects a token that was not signed by Whozin', async (method, path) => {
    const forged = tokenFor(organizer, 'some-other-secret');
    const res = await request(app)[method](path).set('Authorization', `Bearer ${forged}`);

    expect(res.status).toBe(403);
    expect(pool.query).not.toHaveBeenCalled();
  });

  it('lets a logged-in organizer see their events', async () => {
    pool.query.mockResolvedValue([[]]);

    const res = await request(app)
      .get('/api/events/mine')
      .set('Authorization', `Bearer ${tokenFor(organizer)}`);

    expect(res.status).toBe(200);
    expect(pool.query).toHaveBeenCalledWith(expect.any(String), [organizer.id]);
  });

  it('lets a logged-in attendee register for a free event', async () => {
    pool.query
      .mockResolvedValueOnce([[{ id: 1, ticket_price: '0.00', status: 'published' }]])
      .mockResolvedValueOnce([{ insertId: 9 }]);

    const res = await request(app)
      .post('/api/registrations/1')
      .set('Authorization', `Bearer ${tokenFor(attendee)}`);

    expect(res.status).toBe(201);
    expect(pool.query).toHaveBeenLastCalledWith(expect.stringContaining('INSERT INTO registrations'), [
      attendee.id,
      1,
    ]);
  });
});
