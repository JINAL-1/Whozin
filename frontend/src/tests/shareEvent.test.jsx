import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App.jsx'
import { eventPath } from '../routes.js'
import { createEvent } from '../services/eventApi.js'

// Lets a test make the next event load fail, to check the error message.
const loadFailure = vi.hoisted(() => ({ active: false }))

vi.mock('../services/getEvent.js', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    getEventById: async (id) => {
      if (loadFailure.active) throw new Error('The server is not responding.')
      return actual.getEventById(id)
    },
  }
})

function LocationProbe() {
  const location = useLocation()
  return <output data-testid="location">{location.pathname}</output>
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

beforeEach(() => {
  localStorage.clear()
  loadFailure.active = false
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

  it('shows an event created in the app', async () => {
    const { event } = await createEvent({
      title: 'Test party',
      description: 'Bring snacks.',
      date: '2026-12-01',
      time: '19:00',
      location: 'Thunder Bay',
      ticketType: 'free',
    })

    renderApp(eventPath(event.id))

    expect(await eventHeading('Test party')).toBeInTheDocument()
    expect(screen.getByText('Bring snacks.')).toBeInTheDocument()
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
    loadFailure.active = true
    renderApp('/events/sample-1')

    expect(await screen.findByRole('heading', { name: 'We could not load this event' })).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('The server is not responding.')

    loadFailure.active = false
    await user.click(screen.getByRole('button', { name: 'Try again' }))

    expect(await eventHeading('Waterfront night market')).toBeInTheDocument()
  })
})

describe('share link', () => {
  it('copies a link to the event and says it was copied', async () => {
    const user = userEvent.setup()
    renderApp('/events/sample-2')
    await eventHeading('Open mic night')

    await user.click(screen.getByRole('button', { name: 'Copy link' }))

    expect(screen.getByRole('status')).toHaveTextContent('Link copied')
    expect(await navigator.clipboard.readText()).toBe(`${window.location.origin}/events/sample-2`)
  })

  it('opens the same event when the copied link is opened in a new tab', async () => {
    const user = userEvent.setup()
    const firstTab = renderApp('/events/sample-3')
    await eventHeading('Winter gear swap')
    await user.click(screen.getByRole('button', { name: 'Copy link' }))
    const copiedLink = new URL(await navigator.clipboard.readText())
    firstTab.unmount()

    renderApp(copiedLink.pathname)

    expect(await eventHeading('Winter gear swap')).toBeInTheDocument()
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
    expect(screen.getByRole('status')).toBeEmptyDOMElement()
  })
})

describe('links to the event page', () => {
  it('opens an event from the search results', async () => {
    const user = userEvent.setup()
    renderApp('/search?q=market')

    await user.click(await screen.findByRole('link', { name: 'Waterfront night market' }))

    expect(screen.getByTestId('location')).toHaveTextContent('/events/sample-1')
    expect(await eventHeading('Waterfront night market')).toBeInTheDocument()
  })

  it('opens an event from the homepage', async () => {
    const user = userEvent.setup()
    renderApp('/')

    await user.click(screen.getByRole('link', { name: 'Winter gear swap' }))

    expect(screen.getByTestId('location')).toHaveTextContent('/events/sample-3')
    expect(await eventHeading('Winter gear swap')).toBeInTheDocument()
  })
})
