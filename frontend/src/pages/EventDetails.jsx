import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import Button from '../components/ui/Button.jsx'
import { ROUTES } from '../routes.js'
import { getEventById } from '../services/getEvent.js'
import { formatPrice, getDateParts } from '../utils/formatEvent.js'
import './EventDetails.css'
import './StatusPage.css'

function EventDetails() {
  const { id } = useParams()
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState({ key: null, event: null, error: '' })

  // A new key on each load (or retry), so the page knows when it is still loading.
  const requestKey = `${id}:${attempt}`

  useEffect(() => {
    let active = true

    getEventById(id)
      .then((event) => {
        if (active) setResult({ key: requestKey, event, error: '' })
      })
      .catch((requestError) => {
        if (active) {
          setResult({
            key: requestKey,
            event: null,
            error: requestError.message || 'Unable to load this event.',
          })
        }
      })

    return () => {
      active = false
    }
  }, [id, requestKey])

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
  const date = getDateParts(event.startsAt)
  const priceLabel = formatPrice(event.price)

  return (
    <article className="event-details container" aria-labelledby="event-title">
      <Link to={ROUTES.search} className="event-details__back">
        See all events
      </Link>

      <header className="event-details__header">
        <time className="event-details__date" dateTime={event.startsAt}>
          <span className="event-details__month">{date.month}</span>
          <span className="event-details__day">{date.day}</span>
          <span className="event-details__weekday">{date.weekday}</span>
        </time>
        <div>
          {event.category && <p className="event-details__category">{event.category}</p>}
          <h1 id="event-title">{event.title}</h1>
        </div>
      </header>

      <dl className="event-details__facts">
        <div>
          <dt>When</dt>
          <dd>{date.full}</dd>
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
    </article>
  )
}

export default EventDetails
