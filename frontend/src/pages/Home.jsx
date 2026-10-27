import { useState } from 'react'
import { useNavigate } from 'react-router'
import EventCard from '../components/events/EventCard.jsx'
import Button from '../components/ui/Button.jsx'
import FormField from '../components/ui/FormField.jsx'
import { sampleEvents } from '../data/sampleEvents.js'
import { ROUTES } from '../routes.js'
import './Home.css'

const heroEvents = sampleEvents.slice(0, 2)
const upcomingEvents = sampleEvents.slice(2, 6)

function Home() {
  const navigate = useNavigate()
  const [keyword, setKeyword] = useState('')
  const [location, setLocation] = useState('Thunder Bay')

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
        <div className="container hero__inner">
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

          <div className="hero__tickets" aria-hidden="true">
            {heroEvents.map((event) => (
              <EventCard key={event.id} event={event} className="hero__ticket" />
            ))}
          </div>
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
          <ul className="event-grid">
            {upcomingEvents.map((event) => (
              <li key={event.id}>
                <EventCard event={event} />
              </li>
            ))}
          </ul>
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
