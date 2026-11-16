
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

vi.mock('../services/eventApi', () => ({
  getMyEvents: vi.fn(),
  updateEvent: vi.fn(),
  cancelEvent: vi.fn(),
}))

import MyEvents from '../pages/MyEvents'
import { getMyEvents, updateEvent, cancelEvent } from '../services/eventApi'

const testEvents = [
  {
    id: 1,
    organizer_id: 1,
    title: 'Music Night',
    description: 'Live music in Thunder Bay',
    event_date: '2099-11-14T00:00:00.000Z',
    event_time: '19:00:00',
    location: 'Thunder Bay',
    image_url: null,
    ticket_price: 0,
    status: 'published',
  },
  {
    id: 2,
    organizer_id: 1,
    title: 'Cancelled Workshop',
    description: 'A cancelled event',
    event_date: '2099-11-15T00:00:00.000Z',
    event_time: '13:00:00',
    location: 'Lakehead University',
    image_url: null,
    ticket_price: 0,
    status: 'cancelled',
  },
]

beforeEach(() => {
  vi.clearAllMocks()
  getMyEvents.mockResolvedValue(testEvents.map(event => ({ ...event })))
  updateEvent.mockResolvedValue({ message: 'Event updated successfully' })
  cancelEvent.mockResolvedValue({ message: 'Event cancelled successfully' })
})

describe('My Events page', () => {
  it('loads events belonging to the organizer', async () => {
    render(<MyEvents />)

    expect(await screen.findByText('Music Night')).toBeInTheDocument()
    expect(screen.getByText('Cancelled Workshop')).toBeInTheDocument()
    expect(getMyEvents).toHaveBeenCalled()
  })

  it('opens an edit form with existing event details', async () => {
    render(<MyEvents />)

    await screen.findByText('Music Night')

    fireEvent.click(screen.getByRole('button', { name: 'Edit Event' }))

    expect(screen.getByLabelText('Event title *')).toHaveValue('Music Night')
    expect(screen.getByLabelText('Description *')).toHaveValue(
      'Live music in Thunder Bay'
    )
    expect(screen.getByLabelText('Date *')).toHaveValue('2099-11-14')
    expect(screen.getByLabelText('Time *')).toHaveValue('19:00')
    expect(screen.getByLabelText('Location *')).toHaveValue('Thunder Bay')
  })

  it('saves edited event information', async () => {
    render(<MyEvents />)

    await screen.findByText('Music Night')
    fireEvent.click(screen.getByRole('button', { name: 'Edit Event' }))

    fireEvent.change(screen.getByLabelText('Event title *'), {
      target: { value: 'Updated Music Night' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }))

    await waitFor(() => {
      expect(updateEvent).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          title: 'Updated Music Night',
          location: 'Thunder Bay',
        })
      )
    })

    expect(
      await screen.findByText('Event updated successfully!')
    ).toBeInTheDocument()
  })

  it('does not cancel an event if the user declines confirmation', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false)

    render(<MyEvents />)
    await screen.findByText('Music Night')

    fireEvent.click(screen.getByRole('button', { name: 'Cancel Event' }))

    expect(cancelEvent).not.toHaveBeenCalled()

    vi.restoreAllMocks()
  })

  it('cancels an event after confirmation', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)

    render(<MyEvents />)
    await screen.findByText('Music Night')

    fireEvent.click(screen.getByRole('button', { name: 'Cancel Event' }))

    await waitFor(() => {
      expect(cancelEvent).toHaveBeenCalledWith(1)
    })

    expect(
      await screen.findByText('Event cancelled successfully!')
    ).toBeInTheDocument()

    vi.restoreAllMocks()
  })

  it('shows an error when loading events fails', async () => {
    getMyEvents.mockRejectedValue(new Error('Server unavailable'))

    render(<MyEvents />)

    expect(
      await screen.findByText('Server unavailable')
    ).toBeInTheDocument()
  })

  it('shows an error when saving changes fails', async () => {
    updateEvent.mockRejectedValue(new Error('Unable to update event'))

    render(<MyEvents />)
    await screen.findByText('Music Night')

    fireEvent.click(screen.getByRole('button', { name: 'Edit Event' }))
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }))

    expect(
      await screen.findByText('Unable to update event')
    ).toBeInTheDocument()
  })

  describe('paid events', () => {
    const paidEvent = {
      ...testEvents[0],
      id: 3,
      title: 'Jazz Night',
      ticket_price: '15.00',
    }

    beforeEach(() => {
      getMyEvents.mockResolvedValue([{ ...paidEvent }])
    })

    async function openPaidEventEditor() {
      render(<MyEvents />)
      await screen.findByText('Jazz Night')
      fireEvent.click(screen.getByRole('button', { name: 'Edit Event' }))
    }

    it('shows the saved price when editing a paid event', async () => {
      await openPaidEventEditor()

      expect(screen.getByLabelText('Ticket price (CAD) *')).toHaveValue(15)
    })

    it('keeps the price when other details of a paid event are edited', async () => {
      await openPaidEventEditor()

      fireEvent.change(screen.getByLabelText('Event title *'), {
        target: { value: 'Late Jazz Night' },
      })
      fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }))

      await waitFor(() => {
        expect(updateEvent).toHaveBeenCalledWith(
          3,
          expect.objectContaining({
            title: 'Late Jazz Night',
            ticketType: 'paid',
            ticketPrice: '15.00',
          })
        )
      })
      expect(await screen.findByText('Event updated successfully!')).toBeInTheDocument()
    })

    it('saves a new price for a paid event', async () => {
      await openPaidEventEditor()

      fireEvent.change(screen.getByLabelText('Ticket price (CAD) *'), {
        target: { value: '20' },
      })
      fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }))

      await waitFor(() => {
        expect(updateEvent).toHaveBeenCalledWith(
          3,
          expect.objectContaining({ ticketPrice: '20' })
        )
      })
    })

    it('does not save a paid event without a price', async () => {
      await openPaidEventEditor()

      fireEvent.change(screen.getByLabelText('Ticket price (CAD) *'), {
        target: { value: '' },
      })
      fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }))

      expect(await screen.findByText('Enter a ticket price greater than 0.')).toBeInTheDocument()
      expect(updateEvent).not.toHaveBeenCalled()
    })

    it('does not show a price box for free events', async () => {
      getMyEvents.mockResolvedValue([{ ...testEvents[0] }])
      render(<MyEvents />)
      await screen.findByText('Music Night')

      fireEvent.click(screen.getByRole('button', { name: 'Edit Event' }))

      expect(screen.queryByLabelText('Ticket price (CAD) *')).not.toBeInTheDocument()
    })
  })

  it('does not show edit buttons for cancelled events', async () => {
    render(<MyEvents />)
    await screen.findByText('Cancelled Workshop')

    const cancelledSection = screen
      .getByText('Cancelled Workshop')
      .closest('section')

    expect(
      within(cancelledSection).queryByRole('button', { name: 'Edit Event' })
    ).not.toBeInTheDocument()

    expect(
      within(cancelledSection).queryByRole('button', { name: 'Cancel Event' })
    ).not.toBeInTheDocument()
  })
})
