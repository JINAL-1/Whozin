import { searchEvents } from './eventApi.js'

// Read at call time so tests can switch modes with vi.stubEnv.
const isDemoMode = () => import.meta.env.VITE_DEMO_MODE === 'true'
const apiUrl = () => import.meta.env.VITE_API_URL || 'http://localhost:3001'

// Event ids from the database are positive whole numbers.
const DATABASE_ID = /^[1-9]\d*$/

// The backend sends the date and time as separate MySQL columns.
function fromApi(event) {
  const date = String(event.event_date).slice(0, 10)
  const time = String(event.event_time).slice(0, 8)

  return {
    ...event,
    startsAt: `${date}T${time}`,
    price: Number(event.ticket_price),
  }
}

// Finds one event by its id. Resolves to null when there is no such event.
// Cancelled events are returned too, with status 'cancelled'.
export async function getEventById(id) {
  if (isDemoMode()) {
    // Demo mode keeps events in the browser, so look through the same list
    // the search page shows (sample events plus ones created in the demo).
    const events = await searchEvents()
    return events.find((event) => String(event.id) === String(id)) ?? null
  }

  // Anything else can't be an event, so there is no need to ask the server.
  if (!DATABASE_ID.test(String(id))) return null

  let response

  try {
    response = await fetch(`${apiUrl()}/api/events/${id}`)
  } catch {
    throw new Error("We couldn't reach the server. Check your connection and try again.")
  }

  if (response.status === 404) return null

  let result

  try {
    result = await response.json()
  } catch {
    throw new Error('The server returned an invalid response.')
  }

  if (!response.ok || !result.event) {
    throw new Error(result.error || 'Unable to load this event.')
  }

  return fromApi(result.event)
}
