import { Link } from 'react-router'
import { formatPrice, getDateParts } from '../../utils/formatEvent.js'
import './EventCard.css'

// event: { id, title, startsAt (ISO date string), location, category?, price? }
// to: optional link for the title, e.g. an event details page
function EventCard({ event, to, headingLevel = 3, className = '' }) {
  const { title, startsAt, location, category, price } = event
  const date = getDateParts(startsAt)
  const priceLabel = formatPrice(price)
  const Heading = `h${headingLevel}`

  return (
    <article className={`event-card ${className}`.trim()}>
      <div className="event-card__ticket">
        <time className="event-card__date" dateTime={startsAt} title={date.full}>
          <span className="event-card__month">{date.month}</span>
          <span className="event-card__day">{date.day}</span>
          <span className="event-card__weekday">{date.weekday}</span>
        </time>

        <div className="event-card__body">
          {category && <p className="event-card__category">{category}</p>}
          <Heading className="event-card__title">
            {to ? <Link to={to}>{title}</Link> : title}
          </Heading>
          <p className="event-card__meta">
            <span className="visually-hidden">Starts at </span>
            {date.time}
          </p>
          <p className="event-card__meta">
            <span className="visually-hidden">Location: </span>
            {location}
          </p>
          {priceLabel && (
            <p className={`event-card__price ${priceLabel === 'Free' ? 'is-free' : ''}`.trim()}>
              {priceLabel}
            </p>
          )}
        </div>
      </div>
    </article>
  )
}

export default EventCard
