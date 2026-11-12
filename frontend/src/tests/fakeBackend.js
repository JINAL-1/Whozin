import { vi } from 'vitest'

const DAY = 24 * 60 * 60 * 1000

// A date relative to today in the format MySQL sends it (YYYY-MM-DD), so
// "upcoming" and "past" stay true whenever the tests are run.
export function dateInDays(days) {
  const date = new Date(Date.now() + days * DAY)
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
}

// An event shaped like the rows GET /api/events returns.
export function apiEvent(fields) {
  return {
    organizer_id: 1,
    description: '',
    event_date: dateInDays(7),
    event_time: '19:00:00',
    location: 'Thunder Bay',
    image_url: null,
    ticket_price: '0.00',
    capacity: null,
    status: 'published',
    created_at: '2026-11-01T12:00:00.000Z',
    ...fields,
  }
}

// A login token that expires `seconds` from now. Only the expiry matters here.
export function fakeToken(seconds) {
  const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + seconds }))
  return `header.${payload}.signature`
}

export function logInAs(role, { email = `${role}@example.com`, seconds = 3600 } = {}) {
  localStorage.setItem('token', fakeToken(seconds))
  localStorage.setItem('user', JSON.stringify({ id: 1, email, role }))
}

function reply(status, body) {
  return { ok: status >= 200 && status < 300, status, json: async () => body }
}

// Replaces fetch with a small copy of the Whozin API that works on
// `backend.events`. Set `backend.down = true` to act like the server is off.
// Call vi.unstubAllGlobals() after each test.
export function fakeBackend() {
  const backend = { events: [], down: false }

  const fetch = vi.fn(async (input) => {
    if (backend.down) throw new TypeError('Failed to fetch')

    const url = new URL(String(input), 'http://localhost')
    const byId = url.pathname.match(/^\/api\/events\/([^/]+)$/)

    if (url.pathname === '/api/events') {
      const keyword = (url.searchParams.get('keyword') ?? '').toLowerCase()
      const location = (url.searchParams.get('location') ?? '').toLowerCase()
      const events = backend.events.filter(
        (event) =>
          event.status === 'published' &&
          event.title.toLowerCase().includes(keyword) &&
          event.location.toLowerCase().includes(location),
      )
      return reply(200, { events })
    }

    if (byId && byId[1] !== 'mine') {
      const event = backend.events.find((item) => String(item.id) === byId[1])
      return event ? reply(200, { event }) : reply(404, { error: 'Event not found' })
    }

    return reply(404, { error: 'Not found' })
  })

  vi.stubGlobal('fetch', fetch)
  backend.fetch = fetch
  return backend
}
