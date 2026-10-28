
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import SearchEvents from '../pages/SearchEvents.jsx'
import { createEvent, searchEvents } from '../services/eventApi.js'
import { filterEvents } from '../utils/filterEvents.js'

const events = [
  {
    id: '1',
    title: 'Open mic night',
    startsAt: '2026-11-14T00:30:00Z',
    location: 'Lakehead University, the Agora',
    category: 'Music',
    price: 0,
  },
  {
    id: '2',
    title: 'Waterfront night market',
    startsAt: '2026-11-07T22:00:00Z',
    location: "Prince Arthur's Landing",
    category: 'Market',
    price: 0,
  },
  {
    id: '3',
    title: 'Community art fair',
    startsAt: '2026-11-20T18:00:00Z',
    location: 'Lakehead University',
    category: 'Art',
    price: 5,
  },
]

// Events in the format returned by Pranav's backend.
const backendEvents = [
  {
    id: 1,
    title: 'Open mic night',
    event_date: '2026-11-14T05:00:00.000Z',
    event_time: '19:30:00',
    location: 'Lakehead University, the Agora',
    ticket_price: '0.00',
  },
  {
    id: 2,
    title: 'Waterfront night market',
    event_date: '2026-11-07T05:00:00.000Z',
    event_time: '17:00:00',
    location: "Prince Arthur's Landing",
    ticket_price: '0.00',
  },
  {
    id: 3,
    title: 'Community art fair',
    event_date: '2026-11-20T05:00:00.000Z',
    event_time: '13:00:00',
    location: 'Lakehead University',
    ticket_price: '5.00',
  },
]

function mockResponse(data, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
  }
}

beforeEach(() => {
  localStorage.clear()

  // Simulate API responses without needing MySQL running.
  vi.stubGlobal('fetch', vi.fn(async (url) => {
    const parsed = new URL(String(url), 'http://localhost:3001')
    const keyword = (parsed.searchParams.get('keyword') || '').toLowerCase()
    const location = (parsed.searchParams.get('location') || '').toLowerCase()

    const matches = backendEvents.filter((event) => {
      const matchesKeyword =
        !keyword || event.title.toLowerCase().includes(keyword)
      const matchesLocation =
        !location || event.location.toLowerCase().includes(location)

      return matchesKeyword && matchesLocation
    })

    return mockResponse({ events: matches })
  }))
})

afterEach(() => {
  vi.unstubAllGlobals()
})

function renderSearch(path = '/search') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/search" element={<SearchEvents />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('event filtering', () => {
  it('matches a keyword', () => {
    expect(filterEvents(events, { keyword: 'market' }).map((event) => event.id)).toEqual(['2'])
  })

  it('matches a location', () => {
    expect(filterEvents(events, { location: 'lakehead' }).map((event) => event.id)).toEqual(['1', '3'])
  })

  it('combines keyword and location filters', () => {
    expect(
      filterEvents(events, { keyword: 'art', location: 'lakehead' }).map((event) => event.id),
    ).toEqual(['3'])
  })

  it('returns an empty list when nothing matches', () => {
    expect(filterEvents(events, { keyword: 'hockey' })).toEqual([])
  })
})

describe('SearchEvents page', () => {
  it('loads search terms from the URL and displays matching API events', async () => {
    renderSearch('/search?q=market')

    expect(screen.getByLabelText('Keyword')).toHaveValue('market')

    await waitFor(() => {
      expect(screen.getByText('Waterfront night market')).toBeInTheDocument()
    })

    expect(screen.queryByText('Open mic night')).not.toBeInTheDocument()
  })

  it('updates results after submitting the search form', async () => {
    const user = userEvent.setup()
    renderSearch('/search')

    await waitFor(() => {
      expect(screen.getByText('3 events found')).toBeInTheDocument()
    })

    await user.type(screen.getByLabelText('Keyword'), 'art')
    await user.click(screen.getByRole('button', { name: 'Search' }))

    await waitFor(() => {
      expect(screen.getByText('Community art fair')).toBeInTheDocument()
    })

    expect(screen.getByText('1 event found')).toBeInTheDocument()
  })

  it('shows a no-results message', async () => {
    renderSearch('/search?q=not-a-real-event')

    const results = screen.getByRole('region', { name: 'Search results' })

    await waitFor(() => {
      expect(
        within(results).getByRole('heading', { name: 'No events found' })
      ).toBeInTheDocument()
    })

    expect(
      within(results).getByText(
        'Try a different keyword or a broader location.'
      )
    ).toBeInTheDocument()
  })
})

describe('create and search integration', () => {
  it('sends an organizer event to the API and retrieves it in search', async () => {
    const createdEvent = {
      id: 4,
      title: 'Dean Test Concert',
      event_date: '2099-11-14T05:00:00.000Z',
      event_time: '19:00:00',
      location: 'Lakehead University',
      ticket_price: '0.00',
    }

    localStorage.setItem('token', 'test-organizer-token')

    // Simulate POST creating an event and GET returning it.
    vi.stubGlobal('fetch', vi.fn(async (url, options) => {
      const parsed = new URL(String(url), 'http://localhost:3001')

      if (options?.method === 'POST') {
        expect(options.headers.Authorization).toBe(
          'Bearer test-organizer-token'
        )

        const body = JSON.parse(options.body)
        expect(body.event_date).toBe('2099-11-14')
        expect(body.event_time).toBe('19:00')

        return mockResponse({
          message: 'Event created successfully',
          eventId: 4,
        }, 201)
      }

      if (parsed.pathname === '/api/events') {
        return mockResponse({ events: [createdEvent] })
      }

      return mockResponse({ error: 'Not found' }, 404)
    }))

    await createEvent({
      title: 'Dean Test Concert',
      description: 'A campus music event',
      date: '2099-11-14',
      time: '19:00',
      location: 'Lakehead University',
      image: '',
      ticketType: 'free',
    })

    const results = await searchEvents({
      keyword: 'Dean Test',
      location: 'Lakehead',
    })

    expect(
      results.some((event) => event.title === 'Dean Test Concert')
    ).toBe(true)
  })
})
