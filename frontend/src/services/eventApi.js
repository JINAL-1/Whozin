import { sampleEvents } from '../data/sampleEvents.js'
import { filterEvents } from '../utils/filterEvents.js'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE !== 'false'
const DEMO_STORAGE_KEY = 'whozin-demo-events'

function getDemoEvents() {
  let createdEvents = []

  try {
    const saved = localStorage.getItem(DEMO_STORAGE_KEY)
    if (saved) createdEvents = JSON.parse(saved)
  } catch {
    createdEvents = []
  }

  return [
    ...createdEvents,
    ...sampleEvents.map((event) => ({ ...event, city: 'Thunder Bay' })),
  ]
}

function saveDemoEvent(event) {
  let createdEvents = []

  try {
    const saved = localStorage.getItem(DEMO_STORAGE_KEY)
    if (saved) createdEvents = JSON.parse(saved)
  } catch {
    createdEvents = []
  }

  localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify([event, ...createdEvents]))
}

function toSearchableEvent(eventData) {
  const startsAt = new Date(`${eventData.date}T${eventData.time}:00`).toISOString()

  return {
    ...eventData,
    id: `demo-${Date.now()}`,
    startsAt,
    category: eventData.category || 'Community',
    price: eventData.ticketType === 'free' ? 0 : undefined,
  }
}

export async function createEvent(eventData) {
  if (DEMO_MODE) {
    const event = toSearchableEvent(eventData)
    saveDemoEvent(event)

    return {
      demo: true,
      event,
    }
  }

  const response = await fetch(`${API_URL}/api/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(eventData),
  })

  let result

  try {
    result = await response.json()
  } catch {
    throw new Error('The server returned an invalid response.')
  }

  if (!response.ok) {
    throw new Error(result.message || 'Unable to publish event.')
  }

  return {
    demo: false,
    event: result.event || result,
  }
}

export async function searchEvents({ keyword = '', location = '' } = {}) {
  if (DEMO_MODE) {
    return filterEvents(getDemoEvents(), { keyword, location })
  }

  const params = new URLSearchParams()
  if (keyword.trim()) params.set('q', keyword.trim())
  if (location.trim()) params.set('location', location.trim())

  const query = params.toString()
  const url = `${API_URL}/api/events/search${query ? `?${query}` : ''}`
  const response = await fetch(url, {
    credentials: 'include',
  })

  let result

  try {
    result = await response.json()
  } catch {
    throw new Error('The server returned an invalid response.')
  }

  if (!response.ok) {
    throw new Error(result.message || 'Unable to search events.')
  }

  if (Array.isArray(result)) return result
  if (Array.isArray(result.events)) return result.events

  throw new Error('The server returned an invalid event list.')
}
