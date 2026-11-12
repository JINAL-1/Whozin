import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App.jsx'
import { apiEvent, fakeBackend, logInAs } from './fakeBackend.js'

// These tests talk to a fake backend, whatever .env.local says.
vi.hoisted(() => {
  vi.stubEnv('VITE_DEMO_MODE', 'false')
})

beforeEach(() => {
  const backend = fakeBackend()
  backend.events = [apiEvent({ id: 42, title: 'Board game night' })]
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  localStorage.clear()
})

function LocationProbe() {
  const location = useLocation()
  return <output data-testid="location">{location.pathname + location.search}</output>
}

function renderApp(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
      <LocationProbe />
    </MemoryRouter>,
  )
}

const mainNav = () => screen.getByRole('navigation', { name: 'Main' })

describe('routing', () => {
  it('shows the homepage at /', () => {
    renderApp('/')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      "See what's on in Thunder Bay",
    )
  })

  it.each([
    ['/search', 'Find events'],
    ['/events/new', 'Create an Event'],
    ['/login', 'Welcome Back!'],
    ['/signup', 'Create Account'],
    ['/events/42', 'Board game night'],
  ])('renders the page for %s', async (path, heading) => {
    renderApp(path)
  
    expect(
      await screen.findByRole('heading', { name: heading })
    ).toBeInTheDocument()
  
    // This test verifies routing, not backend data loading.
    // Search API loading/error behavior is covered in SearchEvents.test.jsx.
  })

  it('shows a not found page for unknown paths', () => {
    renderApp('/this-does-not-exist')
    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Go to the homepage' })).toHaveAttribute('href', '/')
  })

  it('keeps the navbar and footer on every page', () => {
    renderApp('/login')
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Skip to main content' })).toHaveAttribute(
      'href',
      '#main',
    )
  })
})

describe('navbar', () => {
  it('moves between pages and marks the current link', async () => {
    const user = userEvent.setup()
    renderApp('/')

    await user.click(within(mainNav()).getByRole('link', { name: 'Find events' }))
    expect(screen.getByTestId('location')).toHaveTextContent('/search')
    expect(within(mainNav()).getByRole('link', { name: 'Find events' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(within(mainNav()).getByRole('link', { name: 'Create event' })).not.toHaveAttribute(
      'aria-current',
    )

    await user.click(within(mainNav()).getByRole('link', { name: 'Sign up' }))
    expect(screen.getByRole('heading', { name: 'Create Account' })).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: 'Whozin home' }))
    expect(screen.getByTestId('location')).toHaveTextContent(/^\/$/)
  })

  it('opens and closes the mobile menu', async () => {
    const user = userEvent.setup()
    renderApp('/')

    const toggle = screen.getByRole('button', { name: 'Menu' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(toggle).toHaveAttribute('aria-controls', 'site-menu')

    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(toggle).toHaveAccessibleName('Close')

    await user.keyboard('{Escape}')
    expect(toggle).toHaveAttribute('aria-expanded', 'false')

    await user.click(toggle)
    await user.click(within(mainNav()).getByRole('link', { name: 'Create event' }))
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByTestId('location')).toHaveTextContent('/events/new')
  })
})

describe('homepage', () => {
  it('sends the search terms to the search page', async () => {
    const user = userEvent.setup()
    renderApp('/')

    await user.type(screen.getByLabelText('What'), 'night market')
    await user.click(screen.getByRole('button', { name: 'Search events' }))

    expect(screen.getByTestId('location')).toHaveTextContent(
      '/search?q=night+market&location=Thunder+Bay',
    )
  })

  it('goes to the search page without a query when both fields are empty', async () => {
    const user = userEvent.setup()
    renderApp('/')

    await user.clear(screen.getByLabelText('Where'))
    await user.click(screen.getByRole('button', { name: 'Search events' }))

    expect(screen.getByTestId('location')).toHaveTextContent(/^\/search$/)
  })

  it('links organizers to the create event page', () => {
    renderApp('/')
    expect(screen.getByRole('link', { name: 'Create an event' })).toHaveAttribute(
      'href',
      '/events/new',
    )
  })
})

describe('account in the navbar', () => {
  it('shows Log in, Sign up and only the public pages when logged out', () => {
    renderApp('/')
    const nav = mainNav()

    expect(within(nav).getByRole('link', { name: 'Log in' })).toHaveAttribute('href', '/login')
    expect(within(nav).getByRole('link', { name: 'Sign up' })).toHaveAttribute('href', '/signup')
    expect(within(nav).getByRole('link', { name: 'Create event' })).toBeInTheDocument()
    expect(within(nav).queryByRole('link', { name: 'My events' })).not.toBeInTheDocument()
    expect(within(nav).queryByRole('button', { name: 'Log out' })).not.toBeInTheDocument()
  })

  it('shows the account, organizer pages and Log out for an organizer', () => {
    logInAs('organizer', { email: 'host@lakeheadu.ca' })
    renderApp('/')
    const nav = mainNav()

    expect(within(nav).getByText('host@lakeheadu.ca')).toBeInTheDocument()
    expect(within(nav).getByText('Organizer')).toBeInTheDocument()
    expect(within(nav).getByRole('link', { name: 'Create event' })).toBeInTheDocument()
    expect(within(nav).getByRole('link', { name: 'My events' })).toHaveAttribute('href', '/events/mine')
    expect(within(nav).getByRole('button', { name: 'Log out' })).toBeInTheDocument()
    expect(within(nav).queryByRole('link', { name: 'Log in' })).not.toBeInTheDocument()
  })

  it('does not show organizer pages to attendees', () => {
    logInAs('attendee')
    renderApp('/')
    const nav = mainNav()

    expect(within(nav).getByText('Attendee')).toBeInTheDocument()
    expect(within(nav).getByRole('link', { name: 'Find events' })).toBeInTheDocument()
    expect(within(nav).queryByRole('link', { name: 'Create event' })).not.toBeInTheDocument()
    expect(within(nav).queryByRole('link', { name: 'My events' })).not.toBeInTheDocument()
  })

  it('logs out and goes back to the homepage', async () => {
    const user = userEvent.setup()
    logInAs('organizer')
    renderApp('/events/mine')

    await user.click(within(mainNav()).getByRole('button', { name: 'Log out' }))

    expect(localStorage.getItem('token')).toBeNull()
    expect(localStorage.getItem('user')).toBeNull()
    expect(screen.getByTestId('location')).toHaveTextContent(/^\/$/)
    expect(within(mainNav()).getByRole('link', { name: 'Log in' })).toBeInTheDocument()
  })

  it('treats an expired login as logged out', async () => {
    logInAs('organizer', { seconds: -60 })
    renderApp('/')

    expect(await within(mainNav()).findByRole('link', { name: 'Log in' })).toBeInTheDocument()
    expect(localStorage.getItem('token')).toBeNull()
  })

  it('logs out when the login expires while the site is open', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    logInAs('organizer', { seconds: 5 })
    renderApp('/')
    expect(within(mainNav()).getByRole('button', { name: 'Log out' })).toBeInTheDocument()

    await act(async () => {
      vi.advanceTimersByTime(6000)
    })

    expect(within(mainNav()).getByRole('link', { name: 'Log in' })).toBeInTheDocument()
    expect(localStorage.getItem('token')).toBeNull()
  })

  it('shows a login saved without a page reload once the user moves on', async () => {
    const user = userEvent.setup()
    renderApp('/')

    logInAs('organizer', { email: 'new@lakeheadu.ca' })
    await user.click(within(mainNav()).getByRole('link', { name: 'Find events' }))

    expect(within(mainNav()).getByText('new@lakeheadu.ca')).toBeInTheDocument()
  })
})
