import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import Logo from '../components/brand/Logo.jsx'
import EventCard from '../components/events/EventCard.jsx'
import Button from '../components/ui/Button.jsx'
import FormField from '../components/ui/FormField.jsx'
import { formatPrice, getDateParts } from '../utils/formatEvent.js'

const withRouter = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>)

const event = {
  id: 'e1',
  title: 'Open mic night',
  startsAt: '2026-11-14T00:30:00Z',
  location: 'Lakehead University, the Agora',
  category: 'Music',
  price: 0,
}

describe('Button', () => {
  it('renders a button with type="button" by default', () => {
    render(<Button>Save</Button>)
    expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute('type', 'button')
  })

  it('allows a submit button', () => {
    render(<Button type="submit">Search</Button>)
    expect(screen.getByRole('button', { name: 'Search' })).toHaveAttribute('type', 'submit')
  })

  it('renders a link when given a route', () => {
    withRouter(<Button to="/login" variant="ghost">Log in</Button>)
    const link = screen.getByRole('link', { name: 'Log in' })
    expect(link).toHaveAttribute('href', '/login')
    expect(link).toHaveClass('btn', 'btn--ghost')
  })
})

describe('FormField', () => {
  it('connects the label to the input', () => {
    render(<FormField label="Email" type="email" />)
    expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email')
  })

  it('shows an error and marks the field invalid', () => {
    render(<FormField label="Email" error="Enter a valid email address" />)
    const input = screen.getByLabelText('Email')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAccessibleDescription('Enter a valid email address')
  })

  it('includes the hint in the description', () => {
    render(<FormField label="Password" hint="At least 8 characters" />)
    expect(screen.getByLabelText('Password')).toHaveAccessibleDescription(
      'At least 8 characters',
    )
  })

  it('can render a textarea', () => {
    render(<FormField as="textarea" label="Description" />)
    expect(screen.getByLabelText('Description').tagName).toBe('TEXTAREA')
  })
})

describe('EventCard', () => {
  it('shows the event details in Thunder Bay time', () => {
    withRouter(<EventCard event={event} />)
    const card = screen.getByRole('article')
    expect(screen.getByRole('heading', { name: 'Open mic night' })).toBeInTheDocument()
    expect(card).toHaveTextContent('Nov')
    expect(card).toHaveTextContent('13')
    expect(card).toHaveTextContent('Fri')
    expect(card).toHaveTextContent('7:30')
    expect(card).toHaveTextContent('Lakehead University, the Agora')
    expect(card).toHaveTextContent('Free')
  })

  it('links the title when a route is given', () => {
    withRouter(<EventCard event={event} to="/events/e1" />)
    expect(screen.getByRole('link', { name: 'Open mic night' })).toHaveAttribute(
      'href',
      '/events/e1',
    )
  })

  it('leaves out the price when it is unknown', () => {
    withRouter(<EventCard event={{ ...event, price: undefined }} />)
    expect(screen.getByRole('article')).not.toHaveTextContent('Free')
  })
})

describe('formatters', () => {
  it('formats prices in Canadian dollars', () => {
    expect(formatPrice(0)).toBe('Free')
    expect(formatPrice(12)).toBe('$12')
    expect(formatPrice(12.5)).toBe('$12.50')
    expect(formatPrice(null)).toBeNull()
  })

  it('splits a date into card parts', () => {
    const parts = getDateParts('2026-11-07T22:00:00Z')
    expect(parts.month).toBe('Nov')
    expect(parts.day).toBe('7')
    expect(parts.weekday).toBe('Sat')
  })
})

describe('Logo', () => {
  it('has a text alternative', () => {
    render(<Logo />)
    expect(screen.getByRole('img', { name: 'Whozin' })).toBeInTheDocument()
  })
})
