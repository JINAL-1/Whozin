import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App.jsx'
import { getShareLinks } from '../utils/shareLinks.js'
import { apiEvent, dateInDays, fakeBackend } from './fakeBackend.js'

// These tests talk to a fake backend, whatever .env.local says.
vi.hoisted(() => {
  vi.stubEnv('VITE_DEMO_MODE', 'false')
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

const savedEvent = apiEvent({
  id: 42,
  title: 'Test party',
  description: 'Bring snacks.',
  location: "Prince Arthur's Landing",
})

const cancelledEvent = apiEvent({ id: 43, title: 'Open studio afternoon', status: 'cancelled' })
const pastEvent = apiEvent({ id: 44, title: 'Fall harvest potluck', event_date: dateInDays(-20) })

let backend

beforeEach(() => {
  backend = fakeBackend()
  backend.events = [savedEvent, cancelledEvent, pastEvent]
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

const requestedUrls = () => backend.fetch.mock.calls.map(([url]) => String(url))

describe('event page', () => {
  it('shows the details of the event in the link', async () => {
    renderApp('/events/42')

    expect(await eventHeading('Test party')).toBeInTheDocument()
    expect(screen.getByText("Prince Arthur's Landing")).toBeInTheDocument()
    expect(screen.getByText('Free')).toBeInTheDocument()
    expect(screen.getByText('Bring snacks.')).toBeInTheDocument()
  })

  it('loads just that event from the backend', async () => {
    renderApp('/events/42')
    await eventHeading('Test party')

    expect(requestedUrls()).toHaveLength(1)
    expect(requestedUrls()[0]).toMatch(/\/api\/events\/42$/)
  })

  it('says when an event was cancelled and hides register, calendar and share', async () => {
    renderApp('/events/43')

    expect(await eventHeading('Open studio afternoon')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'This event has been cancelled' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Copy link' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /to calendar/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Register/ })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Find other events' })).toHaveAttribute('href', '/search')
  })

  it('says when an event has already happened', async () => {
    renderApp('/events/44')

    expect(await eventHeading('Fall harvest potluck')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'This event has already happened' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Copy link' })).not.toBeInTheDocument()
  })

  it('does not show a notice for an upcoming event', async () => {
    renderApp('/events/42')
    await eventHeading('Test party')

    expect(screen.queryByText(/This event has/)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Copy link' })).toBeInTheDocument()
  })

  it('still shows the event when its date is missing', async () => {
    backend.events = [apiEvent({ id: 7, title: 'Pop-up show', event_date: 'not a date' })]
    renderApp('/events/7')

    expect(await eventHeading('Pop-up show')).toBeInTheDocument()
    expect(screen.getByText('Date to be announced')).toBeInTheDocument()
  })

  it('shows a not found message for an unknown event', async () => {
    renderApp('/events/999')

    expect(await screen.findByRole('heading', { name: 'Event not found' })).toBeInTheDocument()
    expect(within(screen.getByRole('main')).getByRole('link', { name: 'Find events' })).toHaveAttribute(
      'href',
      '/search',
    )
  })

  it('does not ask the server about links that cannot be events', async () => {
    renderApp('/events/does-not-exist')

    expect(await screen.findByRole('heading', { name: 'Event not found' })).toBeInTheDocument()
    expect(backend.fetch).not.toHaveBeenCalled()
  })

  it('shows an error and loads the event again with Try again', async () => {
    const user = userEvent.setup()
    backend.down = true
    renderApp('/events/42')

    expect(await screen.findByRole('heading', { name: 'We could not load this event' })).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent("We couldn't reach the server.")

    backend.down = false
    await user.click(screen.getByRole('button', { name: 'Try again' }))

    expect(await eventHeading('Test party')).toBeInTheDocument()
  })
})

describe('share link', () => {
  it('copies a link to the event and says it was copied', async () => {
    const user = userEvent.setup()
    renderApp('/events/42')
    await eventHeading('Test party')

    await user.click(screen.getByRole('button', { name: 'Copy link' }))

    expect(shareStatus()).toHaveTextContent('Link copied')
    expect(await navigator.clipboard.readText()).toBe(`${window.location.origin}/events/42`)
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
    renderApp('/events/42')
    await eventHeading('Test party')
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('Not allowed'))

    await user.click(screen.getByRole('button', { name: 'Copy link' }))

    expect(screen.getByLabelText('Copy this link')).toHaveValue(
      `${window.location.origin}/events/42`,
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

    await user.click(await screen.findByRole('link', { name: 'Test party' }))

    expect(screen.getByTestId('location')).toHaveTextContent('/events/42')
    expect(await eventHeading('Test party')).toBeInTheDocument()
  })
})

describe('share to other apps', () => {
  it('builds email, WhatsApp, Facebook and X links that include the event link', () => {
    const url = 'https://whozin.example/events/42'
    const links = Object.fromEntries(
      getShareLinks({ title: 'Test party', url }).map((link) => [link.name, link.href]),
    )

    expect(links.Email).toBe(
      'mailto:?subject=Test%20party&body=Check%20out%20Test%20party%20on%20Whozin%3A%20https%3A%2F%2Fwhozin.example%2Fevents%2F42',
    )
    expect(links.WhatsApp).toBe(
      `https://wa.me/?text=${encodeURIComponent(`Check out Test party on Whozin: ${url}`)}`,
    )
    expect(links.Facebook).toBe(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`)
    expect(links.X).toBe(
      `https://x.com/intent/tweet?text=${encodeURIComponent('Check out Test party on Whozin')}&url=${encodeURIComponent(url)}`,
    )
  })

  it('shows the share options on the event page', async () => {
    renderApp('/events/42')
    await eventHeading('Test party')
    const options = screen.getByRole('list', { name: 'Or share to' })
    const eventLink = `${window.location.origin}/events/42`

    const whatsapp = within(options).getByRole('link', { name: /WhatsApp/ })
    expect(whatsapp).toHaveAttribute('target', '_blank')
    expect(whatsapp).toHaveAttribute('rel', 'noopener noreferrer')
    expect(decodeURIComponent(whatsapp.getAttribute('href'))).toContain(eventLink)

    const email = within(options).getByRole('link', { name: 'Email' })
    expect(email.getAttribute('href')).toMatch(/^mailto:/)
    expect(decodeURIComponent(email.getAttribute('href'))).toContain(eventLink)

    expect(within(options).getByRole('link', { name: /Facebook/ })).toBeInTheDocument()
    expect(within(options).getByRole('link', { name: /^X/ })).toBeInTheDocument()
  })

  it('hides More options when the browser has no share menu', async () => {
    renderApp('/events/42')
    await eventHeading('Test party')

    expect(screen.queryByRole('button', { name: 'More options' })).not.toBeInTheDocument()
  })

  it('opens the device share menu where the browser supports it', async () => {
    const user = userEvent.setup()
    const share = vi.fn().mockRejectedValue(new DOMException('Share cancelled', 'AbortError'))
    Object.defineProperty(navigator, 'share', { value: share, configurable: true })

    try {
      renderApp('/events/42')
      await eventHeading('Test party')

      await user.click(screen.getByRole('button', { name: 'More options' }))

      expect(share).toHaveBeenCalledWith({
        title: 'Test party',
        text: 'Check out Test party on Whozin',
        url: `${window.location.origin}/events/42`,
      })
      // Closing the menu without sharing leaves the page as it was.
      expect(screen.getByRole('heading', { level: 1, name: 'Test party' })).toBeInTheDocument()
    } finally {
      delete navigator.share
    }
  })
})
