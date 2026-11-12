import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import EventCard from '../components/events/EventCard.jsx'
import Button from '../components/ui/Button.jsx'
import FormField from '../components/ui/FormField.jsx'
import { ROUTES, eventPath } from '../routes.js'
import { searchEvents } from '../services/eventApi.js'
import './Home.css'

const NEXT_UP_COUNT = 2
const SOON_COUNT = 4

// Events that haven't started yet, soonest first, each listed once.
function upcomingOnly(events, now) {
  const byId = new Map()

  for (const event of events) {
    const startsAt = new Date(event.startsAt).getTime()
    if (startsAt >= now && !byId.has(String(event.id))) {
      byId.set(String(event.id), { event, startsAt })
    }
  }

  return [...byId.values()]
    .sort((a, b) => a.startsAt - b.startsAt)
    .map(({ event }) => event)
}

function CardPlaceholder() {
  return <div className="card-placeholder" />
}

function Home() {
  const navigate = useNavigate()
  const [keyword, setKeyword] = useState('')
  const [location, setLocation] = useState('Thunder Bay')
  const [attempt, setAttempt] = useState(0)
  const [feed, setFeed] = useState({ attempt: null, events: [], failed: false })

  useEffect(() => {
    let active = true

    searchEvents()
      .then((events) => {
        if (active) setFeed({ attempt, events: upcomingOnly(events, Date.now()), failed: false })
      })
      .catch(() => {
        if (active) setFeed({ attempt, events: [], failed: true })
      })

    return () => {
      active = false
    }
  }, [attempt])

  const loading = feed.attempt !== attempt
  const failed = !loading && feed.failed
  // The next two events sit in the hero and the four after them are listed
  // below, so no event shows up twice.
  const nextUp = loading ? [] : feed.events.slice(0, NEXT_UP_COUNT)
  const soon = loading ? [] : feed.events.slice(NEXT_UP_COUNT, NEXT_UP_COUNT + SOON_COUNT)
  const showTickets = loading || nextUp.length > 0

  const handleSearch = (event) => {
    event.preventDefault()
    const params = new URLSearchParams()
    if (keyword.trim()) params.set('q', keyword.trim())
    if (location.trim()) params.set('location', location.trim())
    const query = params.toString()
    navigate(query ? `${ROUTES.search}?${query}` : ROUTES.search)
  }

  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <div className={`container hero__inner ${showTickets ? '' : 'hero__inner--solo'}`.trim()}>
          <div className="hero__copy">
            <h1 id="hero-title" className="hero__title">
              See what's on in Thunder Bay, and who's in.
            </h1>
            <p className="hero__lead">
              Concerts, markets, campus nights and community events in one place,
              instead of scattered across posters and group chats.
            </p>

            <form className="hero__search" role="search" onSubmit={handleSearch}>
              <FormField
                label="What"
                name="q"
                type="search"
                placeholder="Trivia, markets, music"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
              <FormField
                label="Where"
                name="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
              <Button type="submit" size="lg" className="hero__search-button">
                Search events
              </Button>
            </form>
          </div>

          {loading && (
            <div className="hero__tickets" aria-hidden="true">
              <ul>
                <li className="hero__ticket">
                  <CardPlaceholder />
                </li>
                <li className="hero__ticket">
                  <CardPlaceholder />
                </li>
              </ul>
            </div>
          )}

          {nextUp.length > 0 && (
            <section className="hero__tickets" aria-labelledby="next-up-title">
              <h2 id="next-up-title" className="visually-hidden">
                Next up
              </h2>
              <ul>
                {nextUp.map((event) => (
                  <li key={event.id} className="hero__ticket">
                    <EventCard event={event} to={eventPath(event.id)} />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </section>

      <section className="home-section" aria-labelledby="upcoming-title">
        <div className="container">
          <div className="home-section__header">
            <h2 id="upcoming-title">Happening soon</h2>
            <Button to={ROUTES.search} variant="secondary" size="sm">
              See all events
            </Button>
          </div>

          {loading && (
            <>
              <p className="visually-hidden" role="status">
                Loading events...
              </p>
              <ul className="event-grid" aria-hidden="true">
                {Array.from({ length: SOON_COUNT }, (_, index) => (
                  <li key={index}>
                    <CardPlaceholder />
                  </li>
                ))}
              </ul>
            </>
          )}

          {failed && (
            <div className="home-state" role="alert">
              <h3>We couldn't load events right now</h3>
              <p>The server might be busy or offline. Please try again in a moment.</p>
              <Button variant="secondary" onClick={() => setAttempt((count) => count + 1)}>
                Try again
              </Button>
            </div>
          )}

          {!loading && !failed && feed.events.length === 0 && (
            <div className="home-state">
              <h3>No upcoming events yet</h3>
              <p>New events will show up here as soon as they're posted.</p>
            </div>
          )}

          {soon.length > 0 && (
            <ul className="event-grid">
              {soon.map((event) => (
                <li key={event.id}>
                  <EventCard event={event} to={eventPath(event.id)} />
                </li>
              ))}
            </ul>
          )}

          {!loading && nextUp.length > 0 && soon.length === 0 && (
            <p className="home-state home-state--note">
              That's everything coming up for now. Check back soon for more.
            </p>
          )}
        </div>
      </section>

      <section className="organizer" aria-labelledby="organizer-title">
        <div className="container organizer__inner">
          <div>
            <h2 id="organizer-title">Hosting something?</h2>
            <p>
              Post your event once and people can find it by keyword, date and
              neighbourhood.
            </p>
          </div>
          <Button to={ROUTES.createEvent} size="lg">
            Create an event
          </Button>
        </div>
      </section>
    </>
  )
}

export default Home
