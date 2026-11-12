import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import ShareButton from '../components/events/ShareButton.jsx'
import ShareLinks from '../components/events/ShareLinks.jsx'
import Add2Cal from '../components/events/Add2Cal.jsx'
import Button from '../components/ui/Button.jsx'
import { ROUTES, eventPath } from '../routes.js'
import { getEventById } from '../services/getEvent.js'
import { sampleEvents } from '../data/sampleEvents.js'
import { registerForEvent } from '../services/registrationApi.js'
import { formatPrice, getDateParts } from '../utils/formatEvent.js'
import './EventDetails.css'
import './StatusPage.css'

function EventDetails() {
  const { id } = useParams()
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState({ key: null, event: null, error: '', checkedAt: 0 })

  // US-06: Registration states
  const [registering, setRegistering] = useState(false)
  const [registrationMessage, setRegistrationMessage] = useState('')
  const [registrationError, setRegistrationError] = useState('')
  const [registeredEventId, setRegisteredEventId] = useState(null)

  // A new key on each load (or retry), so the page knows when it is still loading.
  const requestKey = `${id}:${attempt}`

  useEffect(() => {
    let active = true

    getEventById(id)
      .then((event) => {
        if (active) setResult({ key: requestKey, event, error: '', checkedAt: Date.now() })
      })
      .catch((requestError) => {
        if (active) {
          setResult({
            key: requestKey,
            event: null,
            error: requestError.message || 'Unable to load this event.',
            checkedAt: Date.now(),
          })
        }
      })

    return () => {
      active = false
    }
  }, [id, requestKey])

  // US-06: Register attendee for a free event
  const handleRegistration = async () => {
    if (registering || String(registeredEventId) === String(id)) return

    setRegistrationError('')
    setRegistrationMessage('')

    if (!localStorage.getItem('token')) {
      setRegistrationError('Please log in to register for this event.')
      return
    }

    let user = null

    try {
      user = JSON.parse(localStorage.getItem('user') || 'null')
    } catch {
      // Keep user as null if stored data is invalid
    }

    if (user?.role !== 'attendee') {
      setRegistrationError('Only attendees can register for events.')
      return
    }

    setRegistering(true)

    try {
      const response = await registerForEvent(id)

      setRegisteredEventId(id)
      setRegistrationMessage(
        response.message || 'Registration successful!'
      )
    } catch (error) {
      setRegistrationError(
        error.message || 'Registration failed. Please try again.'
      )
    } finally {
      setRegistering(false)
    }
  }

  if (result.key !== requestKey) {
    return (
      <section className="status-page container" aria-busy="true">
        <p role="status">Loading event...</p>
      </section>
    )
  }

  if (result.error) {
    return (
      <section className="status-page container" aria-labelledby="status-title">
        <h1 id="status-title">We could not load this event</h1>
        <p role="alert">{result.error}</p>
        <div className="status-page__actions">
          <Button onClick={() => setAttempt((count) => count + 1)}>Try again</Button>
          <Button to={ROUTES.search} variant="secondary">
            See all events
          </Button>
        </div>
      </section>
    )
  }

  if (!result.event) {
    return (
      <section className="status-page container" aria-labelledby="status-title">
        <h1 id="status-title">Event not found</h1>
        <p>The link may be mistyped, or the event may have been cancelled or removed.</p>
        <div className="status-page__actions">
          <Button to={ROUTES.search}>Find events</Button>
          <Button to={ROUTES.home} variant="secondary">
            Go to the homepage
          </Button>
        </div>
      </section>
    )
  }

  const { event } = result
  const hasDate = !Number.isNaN(new Date(event.startsAt).getTime())
  const date = hasDate ? getDateParts(event.startsAt) : null
  const priceLabel = formatPrice(event.price)
  const shareUrl = new URL(eventPath(event.id), window.location.origin).href

  // A cancelled or past event keeps its page, so old links still explain
  // what happened, but people can't register, save or share it.
  const isCancelled = event.status === 'cancelled'
  const hasEnded = hasDate && new Date(event.startsAt).getTime() < result.checkedAt
  const isActive = !isCancelled && !hasEnded

  // US-06: Check event eligibility
  const isFreeEvent =
    event.price !== null &&
    event.price !== undefined &&
    event.price !== '' &&
    Number(event.price) === 0

  const isBackendEvent =
    !String(event.id).startsWith('demo-') &&
    !sampleEvents.some(
      (sample) => String(sample.id) === String(event.id)
    )

  const canRegister =
    isActive &&
    isBackendEvent &&
    isFreeEvent &&
    event.status === 'published'

  return (
    <article className="event-details container" aria-labelledby="event-title">
      <Link to={ROUTES.search} className="event-details__back">
        See all events
      </Link>

      <header className="event-details__header">
        {date && (
          <time className="event-details__date" dateTime={event.startsAt}>
            <span className="event-details__month">{date.month}</span>
            <span className="event-details__day">{date.day}</span>
            <span className="event-details__weekday">{date.weekday}</span>
          </time>
        )}
        <div>
          {event.category && <p className="event-details__category">{event.category}</p>}
          <h1 id="event-title">{event.title}</h1>
        </div>
      </header>

      {!isActive && (
        <section
          className={`event-details__notice ${isCancelled ? '' : 'event-details__notice--ended'}`.trim()}
          aria-labelledby="notice-title"
        >
          <h2 id="notice-title">
            {isCancelled ? 'This event has been cancelled' : 'This event has already happened'}
          </h2>
          <p>
            {isCancelled
              ? "The organizer cancelled it, so it's no longer taking place."
              : 'Have a look at what else is coming up in Thunder Bay.'}
          </p>
          <Button to={ROUTES.search} variant="secondary" size="sm">
            Find other events
          </Button>
        </section>
      )}

      <dl className="event-details__facts">
        <div>
          <dt>When</dt>
          <dd>{date ? date.full : 'Date to be announced'}</dd>
        </div>
        <div>
          <dt>Where</dt>
          <dd>{event.location}</dd>
        </div>
        {priceLabel && (
          <div>
            <dt>Price</dt>
            <dd>{priceLabel}</dd>
          </div>
        )}
      </dl>

      {event.description && (
        <p className="event-details__description">{event.description}</p>
      )}

      {/* US-06: Free Event Registration */}
      {canRegister && (
        <section
          className="event-details__registration"
          aria-labelledby="registration-title"
        >
          <h2 id="registration-title">Event Registration</h2>

          <Button
            onClick={handleRegistration}
            disabled={registering || String(registeredEventId) === String(id)}
          >
            {registering
              ? 'Registering...'
              : String(registeredEventId) === String(id)
                ? 'Registered'
                : 'Register for Free'}
          </Button>

          {registrationMessage && (
            <p role="status">{registrationMessage}</p>
          )}

          {registrationError && (
            <p role="alert">{registrationError}</p>
          )}
        </section>
      )}

      {isActive && (
        <section className="event-details__calendar" aria-labelledby="calendar-title">
          <h2 id="calendar-title">Save this event</h2>
          <Add2Cal event={event} />
        </section>
      )}

      {isActive && (
        <section className="event-details__share" aria-labelledby="share-title">
          <h2 id="share-title">Share this event</h2>
          <ShareButton url={shareUrl} />
          <ShareLinks title={event.title} url={shareUrl} />
        </section>
      )}
    </article>
  )
}

export default EventDetails
