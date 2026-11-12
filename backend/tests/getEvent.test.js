const request = require('supertest');

// Replace the MySQL pool so these tests run without a database.
jest.mock('../src/db', () => ({ query: jest.fn() }));

const pool = require('../src/db');
const app = require('../src/app');

const publishedEvent = {
  id: 42,
  organizer_id: 3,
  title: 'Test party',
  description: 'Bring snacks.',
  event_date: '2026-12-02',
  event_time: '19:00:00',
  location: 'Thunder Bay',
  image_url: null,
  ticket_price: '0.00',
  capacity: null,
  status: 'published',
  created_at: '2026-11-01T12:00:00.000Z',
};

beforeEach(() => {
  pool.query.mockReset();
});

describe('GET /api/events/:id', () => {
  it('returns the event with that id', async () => {
    pool.query.mockResolvedValue([[publishedEvent]]);

    const res = await request(app).get('/api/events/42');

    expect(res.status).toBe(200);
    expect(res.body.event).toEqual(publishedEvent);
    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('WHERE id = ?'), [42]);
  });

  it('returns a cancelled event with its status', async () => {
    pool.query.mockResolvedValue([[{ ...publishedEvent, status: 'cancelled' }]]);

    const res = await request(app).get('/api/events/42');

    expect(res.status).toBe(200);
    expect(res.body.event.status).toBe('cancelled');
  });

  it('returns 404 when no event has that id', async () => {
    pool.query.mockResolvedValue([[]]);

    const res = await request(app).get('/api/events/999');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Event not found');
  });

  it.each(['abc', '0', '-1', '1.5', '1e3'])(
    'returns 404 for the id "%s" without querying the database',
    async (id) => {
      const res = await request(app).get(`/api/events/${id}`);

      expect(res.status).toBe(404);
      expect(pool.query).not.toHaveBeenCalled();
    }
  );

  it('returns 500 without database details when the query fails', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    pool.query.mockRejectedValue(new Error('connect ECONNREFUSED 10.0.0.5:3306'));

    const res = await request(app).get('/api/events/42');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Could not retrieve event' });
    console.error.mockRestore();
  });
});

describe('existing event routes still work', () => {
  it('still treats /api/events/mine as the organizer route', async () => {
    const res = await request(app).get('/api/events/mine');

    expect(res.status).toBe(401);
    expect(pool.query).not.toHaveBeenCalled();
  });

  it('still searches published events', async () => {
    pool.query.mockResolvedValue([[publishedEvent]]);

    const res = await request(app).get('/api/events?keyword=party');

    expect(res.status).toBe(200);
    expect(res.body.events).toHaveLength(1);
    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining("status = 'published'"), [
      '%party%',
      '%%',
    ]);
  });
});
