
import { useEffect, useState } from 'react'
import { getMyEvents, updateEvent, cancelEvent } from '../services/eventApi'
import { validateEvent } from '../utils/validateEvent'
import '../styles/CreateEvent.css'

function formatDate(date) {
  return String(date).slice(0, 10)
}

function formatTime(time) {
  return String(time).slice(0, 5)
}

export default function MyEvents() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(null)
  const [formErrors, setFormErrors] = useState({})
  const [saving, setSaving] = useState(false)

  async function loadEvents() {
    try {
      setLoading(true)
      setError('')
      const result = await getMyEvents()
      setEvents(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true

    async function fetchEvents() {
      try {
        const result = await getMyEvents()
        if (active) setEvents(result)
      } catch (err) {
        if (active) setError(err.message)
      } finally {
        if (active) setLoading(false)
      }
    }

    fetchEvents()

    return () => {
      active = false
    }
  }, [])

  function startEditing(event) {
    setEditingId(event.id)
    setMessage('')
    setFormErrors({})

    setForm({
      title: event.title,
      description: event.description,
      date: formatDate(event.event_date),
      time: formatTime(event.event_time),
      location: event.location,
      image: event.image_url || '',
      ticketType: Number(event.ticket_price) > 0 ? 'paid' : 'free',
    })
  }

  function handleChange(event) {
    const { name, value } = event.target

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }))

    setFormErrors((previous) => ({
      ...previous,
      [name]: '',
    }))
  }

  async function handleSave(event) {
    event.preventDefault()

    const errors = validateEvent(form)
    setFormErrors(errors)

    if (Object.keys(errors).length > 0) {
      setError('Please correct the highlighted fields.')
      return
    }

    try {
      setSaving(true)
      setError('')
      await updateEvent(editingId, form)

      setEditingId(null)
      setForm(null)
      setMessage('Event updated successfully!')
      await loadEvents()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleCancel(eventId) {
    const confirmed = window.confirm(
      'Are you sure you want to cancel this event? This cannot be undone.'
    )

    if (!confirmed) return

    try {
      setSaving(true)
      setError('')
      setMessage('')

      await cancelEvent(eventId)

      setEditingId(null)
      setForm(null)
      setMessage('Event cancelled successfully!')
      await loadEvents()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="create-event-page">
      <div className="create-event-container">
        <header className="create-event-header">
          <span className="create-event-eyebrow">WHOZIN EVENTS</span>
          <h1>My Events</h1>
          <p>View, edit, or cancel the events you've created.</p>
        </header>

        {error && (
          <div className="form-message error" role="alert">
            {error}
          </div>
        )}

        {message && (
          <div className="form-message success" role="status">
            {message}
          </div>
        )}

        {loading && <p>Loading your events...</p>}

        {!loading && events.length === 0 && !error && (
          <p>You haven't created any events yet.</p>
        )}

        {!loading && events.map((event) => (
          <section
            key={event.id}
            className="create-event-form"
            style={{ marginBottom: '24px' }}
          >
            <h2>{event.title}</h2>

            <p>
              <strong>Status:</strong> {event.status}
            </p>

            <p>
              <strong>Date:</strong> {formatDate(event.event_date)}
            </p>

            <p>
              <strong>Time:</strong> {formatTime(event.event_time)}
            </p>

            <p>
              <strong>Location:</strong> {event.location}
            </p>

            {event.status === 'published' && editingId !== event.id && (
              <div className="form-actions">
                <button
                  type="button"
                  className="publish-button"
                  disabled={saving}
                  onClick={() => startEditing(event)}
                >
                  Edit Event
                </button>

                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleCancel(event.id)}
                >
                  Cancel Event
                </button>
              </div>
            )}

            {editingId === event.id && form && (
              <form onSubmit={handleSave} noValidate>
                <h3>Edit Event Details</h3>

                <div className="form-field">
                  <label htmlFor="edit-title">Event title *</label>
                  <input
                    id="edit-title"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                  />
                  {formErrors.title && (
                    <span className="field-error">{formErrors.title}</span>
                  )}
                </div>

                <div className="form-field">
                  <label htmlFor="edit-description">Description *</label>
                  <textarea
                    id="edit-description"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                  />
                  {formErrors.description && (
                    <span className="field-error">{formErrors.description}</span>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-field">
                    <label htmlFor="edit-date">Date *</label>
                    <input
                      id="edit-date"
                      name="date"
                      type="date"
                      value={form.date}
                      onChange={handleChange}
                    />
                    {formErrors.date && (
                      <span className="field-error">{formErrors.date}</span>
                    )}
                  </div>

                  <div className="form-field">
                    <label htmlFor="edit-time">Time *</label>
                    <input
                      id="edit-time"
                      name="time"
                      type="time"
                      value={form.time}
                      onChange={handleChange}
                    />
                    {formErrors.time && (
                      <span className="field-error">{formErrors.time}</span>
                    )}
                  </div>
                </div>

                <div className="form-field">
                  <label htmlFor="edit-location">Location *</label>
                  <input
                    id="edit-location"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                  />
                  {formErrors.location && (
                    <span className="field-error">{formErrors.location}</span>
                  )}
                </div>

                <div className="form-field">
                  <label htmlFor="edit-image">Image URL</label>
                  <input
                    id="edit-image"
                    name="image"
                    type="url"
                    value={form.image}
                    onChange={handleChange}
                  />
                  {formErrors.image && (
                    <span className="field-error">{formErrors.image}</span>
                  )}
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    className="publish-button"
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>

                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => {
                      setEditingId(null)
                      setForm(null)
                      setError('')
                    }}
                  >
                    Discard Changes
                  </button>
                </div>
              </form>
            )}
          </section>
        ))}
      </div>
    </div>
  )
}
