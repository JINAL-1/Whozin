import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'
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


beforeEach(() => {
  localStorage.clear()
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
  it('loads search terms from the URL and displays matching demo events', async () => {
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
      expect(screen.getByText('6 events found')).toBeInTheDocument()
    })

    await user.type(screen.getByLabelText('Keyword'), 'craft')
    await user.click(screen.getByRole('button', { name: 'Search' }))

    await waitFor(() => {
      expect(screen.getByText('Holiday craft fair')).toBeInTheDocument()
    })

    expect(screen.getByText('1 event found')).toBeInTheDocument()
  })

  it('shows a no-results message', async () => {
    renderSearch('/search?q=not-a-real-event')

    const results = screen.getByRole('region', { name: 'Search results' })

    await waitFor(() => {
      expect(within(results).getByRole('heading', { name: 'No events found' })).toBeInTheDocument()
    })

    expect(within(results).getByText('Try a different keyword or a broader location.')).toBeInTheDocument()
  })
})

describe('create and search integration', () => {
  it('includes a newly created demo event in search results', async () => {
    await createEvent({
      title: 'Dean Test Concert',
      description: 'A campus music event',
      date: '2099-11-14',
      time: '19:00',
      location: 'Lakehead University',
      image: '',
      ticketType: 'free',
    })

    const results = await searchEvents({ keyword: 'Dean Test', location: 'Lakehead' })

    expect(results.some((event) => event.title === 'Dean Test Concert')).toBe(true)
  })
})

