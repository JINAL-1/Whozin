import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App.jsx'
import { apiEvent, dateInDays, fakeBackend } from './fakeBackend.js'

// These tests talk to a fake backend, whatever .env.local says.
vi.hoisted(() => {
  vi.stubEnv('VITE_DEMO_MODE', 'false')
})

// Out of order on purpose, with one past event and one event sent twice.
const events = [
  apiEvent({ id: 5, title: 'Curling open house', event_date: dateInDays(5) }),
  apiEvent({ id: 1, title: 'Board game night', event_date: dateInDays(1) }),
  apiEvent({ id: 9, title: 'Fall harvest potluck', event_date: dateInDays(-20) }),
  apiEvent({ id: 3, title: 'Jazz at the Hoito', event_date: dateInDays(3) }),
  apiEvent({ id: 7, title: 'Indie film double bill', event_date: dateInDays(7) }),
  apiEvent({ id: 2, title: 'Winter photo walk', event_date: dateInDays(2) }),
  apiEvent({ id: 3, title: 'Jazz at the Hoito', event_date: dateInDays(3) }),
  apiEvent({ id: 4, title: 'Learn to skate', event_date: dateInDays(4) }),
  apiEvent({ id: 6, title: 'Holiday craft fair', event_date: dateInDays(6) }),
]

let backend

beforeEach(() => {
  backend = fakeBackend()
  backend.events = events
})

afterEach(() => {
  vi.unstubAllGlobals()
})

function renderHome() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>,
  )
}

const titlesIn = (region) =>
  within(region)
    .getAllByRole('heading', { level: 3 })
    .map((heading) => heading.textContent)

describe('homepage events', () => {
  it('shows the next two events at the top and the four after them under Happening soon', async () => {
    renderHome()

    const nextUp = await screen.findByRole('region', { name: 'Next up' })
    const soon = screen.getByRole('region', { name: 'Happening soon' })

    expect(titlesIn(nextUp)).toEqual(['Board game night', 'Winter photo walk'])
    expect(titlesIn(soon)).toEqual([
      'Jazz at the Hoito',
      'Learn to skate',
      'Curling open house',
      'Holiday craft fair',
    ])
  })

  it('lists each event once', async () => {
    renderHome()
    await screen.findByRole('region', { name: 'Next up' })

    for (const title of ['Board game night', 'Jazz at the Hoito']) {
      expect(screen.getAllByRole('link', { name: title })).toHaveLength(1)
    }
  })

  it('leaves out events that have already happened', async () => {
    renderHome()
    await screen.findByRole('region', { name: 'Next up' })

    expect(screen.queryByText('Fall harvest potluck')).not.toBeInTheDocument()
  })

  it('only shows events from the database, not made-up sample events', async () => {
    renderHome()
    await screen.findByRole('region', { name: 'Next up' })

    expect(screen.queryByText('Waterfront night market')).not.toBeInTheDocument()
    expect(screen.queryByText('Winter gear swap')).not.toBeInTheDocument()
  })

  it('links each event to its page', async () => {
    renderHome()

    expect(await screen.findByRole('link', { name: 'Board game night' })).toHaveAttribute(
      'href',
      '/events/1',
    )
    expect(screen.getByRole('link', { name: 'Holiday craft fair' })).toHaveAttribute(
      'href',
      '/events/6',
    )
  })

  it('says so when there are no upcoming events', async () => {
    backend.events = [events[2]]
    renderHome()

    expect(await screen.findByRole('heading', { name: 'No upcoming events yet' })).toBeInTheDocument()
    expect(screen.queryByRole('region', { name: 'Next up' })).not.toBeInTheDocument()
  })

  it('says when everything coming up is already shown', async () => {
    backend.events = [events[1], events[5]]
    renderHome()

    expect(
      await screen.findByText("That's everything coming up for now. Check back soon for more."),
    ).toBeInTheDocument()
  })

  it('shows an error and loads the events again with Try again', async () => {
    const user = userEvent.setup()
    backend.down = true
    renderHome()

    expect(await screen.findByRole('alert')).toHaveTextContent("We couldn't load events right now")

    backend.down = false
    await user.click(screen.getByRole('button', { name: 'Try again' }))

    expect(await screen.findByRole('link', { name: 'Board game night' })).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
