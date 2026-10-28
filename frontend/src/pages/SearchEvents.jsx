import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import EventCard from '../components/events/EventCard.jsx'
import Button from '../components/ui/Button.jsx'
import FormField from '../components/ui/FormField.jsx'
import { searchEvents } from '../services/eventApi.js'
import './SearchEvents.css'

function SearchEvents() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [keyword, setKeyword] = useState(searchParams.get('q') ?? '')
  const [location, setLocation] = useState(searchParams.get('location') ?? '')
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const query = searchParams.get('q') ?? ''
  const place = searchParams.get('location') ?? ''

  useEffect(() => {
    let active = true

    async function loadEvents() {
      setLoading(true)
      setError('')

      try {
        const results = await searchEvents({ keyword: query, location: place })
        if (active) setEvents(results)
      } catch (requestError) {
        if (active) {
          setEvents([])
          setError(requestError.message || 'Unable to load events.')
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    loadEvents()

    return () => {
      active = false
    }
  }, [query, place])

  function handleSubmit(event) {
    event.preventDefault()

    const nextParams = new URLSearchParams()
    if (keyword.trim()) nextParams.set('q', keyword.trim())
    if (location.trim()) nextParams.set('location', location.trim())
    setSearchParams(nextParams)
  }

  return (
    <div className="search-page">
      <section className="search-header">
        <div className="container search-header__inner">
          <div>
            <p className="search-header__eyebrow">WHOZIN EVENTS</p>
            <h1>Find events</h1>
            <p className="search-header__lead">
              Search events by keyword or location to find something happening nearby.
            </p>
          </div>

          <form className="search-form" role="search" onSubmit={handleSubmit}>
            <FormField
              label="Keyword"
              name="q"
              type="search"
              placeholder="Music, markets, sports"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
            />
            <FormField
              label="Location"
              name="location"
              placeholder="Thunder Bay"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
            />
            <Button type="submit" size="lg" className="search-form__button">
              Search
            </Button>
          </form>
        </div>
      </section>

      <section className="search-results" aria-labelledby="search-results-title">
        <div className="container">
          <div className="search-results__heading">
            <h2 id="search-results-title">Search results</h2>
            {!loading && !error && (
              <p aria-live="polite">
                {events.length} {events.length === 1 ? 'event' : 'events'} found
              </p>
            )}
          </div>

          {loading && <p className="search-state">Loading events...</p>}

          {!loading && error && (
            <div className="search-state search-state--error" role="alert">
              <h3>We could not load events</h3>
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && events.length === 0 && (
            <div className="search-state">
              <h3>No events found</h3>
              <p>Try a different keyword or a broader location.</p>
            </div>
          )}

          {!loading && !error && events.length > 0 && (
            <ul className="search-results__grid">
              {events.map((event) => (
                <li key={event.id}>
                  <EventCard event={event} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  )
}

export default SearchEvents
