import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import EventRegistration from '../components/events/EventRegistration.jsx'
import { logInAs } from './fakeBackend.js'

// A small fake of the registration API: one event (id 7) and a set of
// attendees registered for it.
let registered
let fetchMock

function reply(status, body) {
  return { ok: status >= 200 && status < 300, status, json: async () => body }
}

beforeEach(() => {
  registered = false
  fetchMock = vi.fn(async (url, options = {}) => {
    if (!String(url).endsWith('/api/registrations/7')) return reply(404, { error: 'Not found' })

    if (options.method === 'GET') return reply(200, { registered })

    if (options.method === 'POST') {
      if (registered) return reply(409, { error: 'You are already registered for this event' })
      registered = true
      return reply(201, { message: 'Registration successful!' })
    }

    if (options.method === 'DELETE') {
      if (!registered) return reply(404, { error: 'You are not registered for this event' })
      registered = false
      return reply(200, { message: 'Your registration was cancelled.' })
    }

    return reply(405, {})
  })
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
  localStorage.clear()
})

function renderRegistration(going = 3) {
  return render(
    <MemoryRouter>
      <EventRegistration eventId={7} initialGoing={going} />
    </MemoryRouter>,
  )
}

describe('event registration', () => {
  it('shows how many people are going', () => {
    renderRegistration(12)

    expect(screen.getByText('12 people are going')).toBeInTheDocument()
  })

  it('invites the first person when nobody is going yet', () => {
    renderRegistration(0)

    expect(screen.getByText('Be the first to register')).toBeInTheDocument()
  })

  it('asks visitors who are not logged in to log in', () => {
    renderRegistration()

    expect(screen.getByRole('link', { name: 'Log in to register' })).toHaveAttribute('href', '/login')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('tells organizers that only attendees can register', () => {
    logInAs('organizer')
    renderRegistration()

    expect(screen.getByText('Only attendee accounts can register for events.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Register for Free' })).not.toBeInTheDocument()
  })

  it('registers an attendee and adds them to the count', async () => {
    const user = userEvent.setup()
    logInAs('attendee')
    renderRegistration(3)

    await user.click(await screen.findByRole('button', { name: 'Register for Free' }))

    expect(await screen.findByText("You're going")).toBeInTheDocument()
    expect(screen.getByText('4 people are going')).toBeInTheDocument()
    expect(registered).toBe(true)
  })

  it('remembers the registration when the page is opened again', async () => {
    registered = true
    logInAs('attendee')
    renderRegistration()

    expect(await screen.findByText("You're going")).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Register for Free' })).not.toBeInTheDocument()
  })

  it('lets an attendee cancel their registration', async () => {
    const user = userEvent.setup()
    registered = true
    logInAs('attendee')
    renderRegistration(5)

    await user.click(await screen.findByRole('button', { name: 'Cancel registration' }))

    expect(await screen.findByRole('button', { name: 'Register for Free' })).toBeInTheDocument()
    expect(screen.getByText('4 people are going')).toBeInTheDocument()
    expect(screen.getByText('Your registration was cancelled.')).toBeInTheDocument()
    expect(registered).toBe(false)
  })

  it('shows "You\'re going" instead of an error when already registered elsewhere', async () => {
    const user = userEvent.setup()
    logInAs('attendee')
    renderRegistration()
    await user.click(await screen.findByRole('button', { name: 'Register for Free' }))
    await user.click(await screen.findByRole('button', { name: 'Cancel registration' }))

    // Registered again in another tab, so this page still shows the button.
    registered = true
    await user.click(await screen.findByRole('button', { name: 'Register for Free' }))

    expect(await screen.findByText("You're going")).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
