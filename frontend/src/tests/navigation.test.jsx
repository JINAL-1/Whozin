import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router'
import { describe, expect, it } from 'vitest'
import App from '../App.jsx'

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
  ])('renders the page for %s', (path, heading) => {
    renderApp(path)
    expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument()
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

  it('lists upcoming events', () => {
    renderApp('/')
    const section = screen.getByRole('region', { name: 'Happening soon' })
    expect(within(section).getAllByRole('article')).toHaveLength(4)
  })
})
