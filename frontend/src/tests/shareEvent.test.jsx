import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App.jsx'
import { sampleEvents } from '../data/sampleEvents.js'

// The event list the app sees. Replacing searchEvents keeps these tests the
// same whether VITE_DEMO_MODE is on or off and whether the backend is running.
const api = vi.hoisted(() => ({ events: [], fail: false }))

vi.mock('../services/eventApi.js', async (importOriginal) => {
  const { filterEvents } = await import('../utils/filterEvents.js')

  return {
    ...(await importOriginal()),
    searchEvents: async ({ keyword = '', location = '' } = {}) => {
      if (api.fail) throw new Error('The server is not responding.')
      return filterEvents(api.events, { keyword, location })
    },
  }
})

function LocationProbe() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname}</div>
}

function renderApp(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
      <LocationProbe />
    </MemoryRouter>,
  )
}

const eventHeading = (name) => screen.findByRole('heading', { level: 1, name })
const shareStatus = () => within(screen.getByRole('main')).getByRole('status')

const savedEvent = {
  id: 42,
  title: 'Test party',
  description: 'Bring snacks.',
  startsAt: '2026-12-02T00:00:00Z',
  location: 'Thunder Bay',
  category: 'Community',
  price: 0,
}

beforeEach(() => {
  api.events = [...sampleEvents, savedEvent]
  api.fail = false
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('event page', () => {
  it('shows the details of the event in the link', async () => {
    renderApp('/events/sample-1')

    expect(await eventHeading('Waterfront night market')).toBeInTheDocument()
    expect(screen.getByText("Prince Arthur's Landing")).toBeInTheDocument()
    expect(screen.getByText('Free')).toBeInTheDocument()
  })

  it('shows an event that was created in the app', async () => {
    renderApp('/events/42')

    expect(await eventHeading('Test party')).toBeInTheDocument()
    expect(screen.getByText('Bring snacks.')).toBeInTheDocument()
  })

  it('opens the sample events even when the server is down', async () => {
    api.fail = true
    renderApp('/events/sample-3')

    expect(await eventHeading('Winter gear swap')).toBeInTheDocument()
  })

  it('still shows the event when its date is missing', async () => {
    api.events = [{ id: 7, title: 'Pop-up show', startsAt: 'not a date', location: 'Thunder Bay' }]
    renderApp('/events/7')

    expect(await eventHeading('Pop-up show')).toBeInTheDocument()
    expect(screen.getByText('Date to be announced')).toBeInTheDocument()
  })

  it('shows a not found message for an unknown event', async () => {
    renderApp('/events/does-not-exist')

    expect(await screen.findByRole('heading', { name: 'Event not found' })).toBeInTheDocument()
    expect(within(screen.getByRole('main')).getByRole('link', { name: 'Find events' })).toHaveAttribute(
      'href',
      '/search',
    )
  })

  it('shows an error and loads the event again with Try again', async () => {
    const user = userEvent.setup()
    api.fail = true
    renderApp('/events/42')

    expect(await screen.findByRole('heading', { name: 'We could not load this event' })).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('The server is not responding.')

    api.fail = false
    await user.click(screen.getByRole('button', { name: 'Try again' }))

    expect(await eventHeading('Test party')).toBeInTheDocument()
  })
})

describe('share link', () => {
  it('copies a link to the event and says it was copied', async () => {
    const user = userEvent.setup()
    renderApp('/events/sample-2')
    await eventHeading('Open mic night')

    await user.click(screen.getByRole('button', { name: 'Copy link' }))

    expect(shareStatus()).toHaveTextContent('Link copied')
    expect(await navigator.clipboard.readText()).toBe(`${window.location.origin}/events/sample-2`)
  })

  it('opens the same event when the copied link is opened in a new tab', async () => {
    const user = userEvent.setup()
    const firstTab = renderApp('/events/42')
    await eventHeading('Test party')
    await user.click(screen.getByRole('button', { name: 'Copy link' }))
    const copiedLink = new URL(await navigator.clipboard.readText())
    firstTab.unmount()

    renderApp(copiedLink.pathname)

    expect(await eventHeading('Test party')).toBeInTheDocument()
  })

  it('shows the link to copy by hand when the browser blocks copying', async () => {
    const user = userEvent.setup()
    renderApp('/events/sample-1')
    await eventHeading('Waterfront night market')
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('Not allowed'))

    await user.click(screen.getByRole('button', { name: 'Copy link' }))

    expect(screen.getByLabelText('Copy this link')).toHaveValue(
      `${window.location.origin}/events/sample-1`,
    )
    expect(shareStatus()).toBeEmptyDOMElement()
  })
})

describe('links to the event page', () => {
  it('opens an event from the search results', async () => {
    const user = userEvent.setup()
    renderApp('/search?q=party')

    await user.click(await screen.findByRole('link', { name: 'Test party' }))

    expect(screen.getByTestId('location')).toHaveTextContent('/events/42')
    expect(await eventHeading('Test party')).toBeInTheDocument()
  })

  it('keeps Create event on its own page', async () => {
    renderApp('/events/new')

    expect(await screen.findByRole('heading', { name: 'Create an Event' })).toBeInTheDocument()
    expect(screen.queryByText('Event not found')).not.toBeInTheDocument()
  })

  it('opens an event from the homepage', async () => {
    const user = userEvent.setup()
    renderApp('/')

    await user.click(screen.getByRole('link', { name: 'Winter gear swap' }))

    expect(screen.getByTestId('location')).toHaveTextContent('/events/sample-3')
    expect(await eventHeading('Winter gear swap')).toBeInTheDocument()
  })
})
