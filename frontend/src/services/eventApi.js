import { sampleEvents } from '../data/sampleEvents.js'
import { filterEvents } from '../utils/filterEvents.js'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true'
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

  // Get the JWT saved when the organizer logged in.
  const token = localStorage.getItem('token')

  if (!token) {
    throw new Error(
      'You must log in as an organizer to create an event.'
    )
  }

  // Translate the frontend fields into the backend format.
  const payload = {
    title: eventData.title,
    description: eventData.description,
    event_date: eventData.date,
    event_time: eventData.time,
    location: eventData.location,
    image_url: eventData.image || null,
    ticket_price: 0,
    capacity: null,
  }

  const response = await fetch(`${API_URL}/api/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  let result

  try {
    result = await response.json()
  } catch {
    throw new Error('The server returned an invalid response.')
  }

  if (!response.ok) {
    const validationErrors = result.errors
      ?.map((error) => error.msg)
      .join(', ')

    throw new Error(
      validationErrors ||
      result.error ||
      result.message ||
      'Unable to publish event.'
    )
  }

  return {
    demo: false,
    event: {
      ...eventData,
      id: result.eventId,
    },
  }
}


export async function searchEvents({
  keyword = '',
  location = '',
} = {}) {
  if (DEMO_MODE) {
    return filterEvents(getDemoEvents(), {
      keyword,
      location,
    })
  }

  const params = new URLSearchParams()

  if (keyword.trim()) {
    params.set('keyword', keyword.trim())
  }

  if (location.trim()) {
    params.set('location', location.trim())
  }

  const query = params.toString()
  const url = `${API_URL}/api/events${query ? `?${query}` : ''}`

  const response = await fetch(url)

  let result

  try {
    result = await response.json()
  } catch {
    throw new Error('The server returned an invalid response.')
  }

  if (!response.ok) {
    throw new Error(
      result.error ||
      result.message ||
      'Unable to search events.'
    )
  }

  if (!Array.isArray(result.events)) {
    throw new Error('The server returned an invalid event list.')
  }

  // Convert backend events to the format EventCard expects.
  return result.events.map((event) => {
    const date = event.event_date.slice(0, 10)
    const time = event.event_time.slice(0, 8)

    return {
      ...event,
      startsAt: `${date}T${time}`,
      category: 'Community',
      price: Number(event.ticket_price),
    }
  })
}

// Request helper for organizer event management
async function organizerRequest(path, options = {}) {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Please log in as an organizer first.');
  }

  const response = await fetch(`${API_URL}/api/events${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Unable to complete request.');
  }

  return result;
}

export async function getMyEvents() {
  return (await organizerRequest('/mine')).events;
}

export async function updateEvent(id, form) {
  return organizerRequest(`/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      title: form.title,
      description: form.description,
      event_date: form.date,
      event_time: form.time,
      location: form.location,
      image_url: form.image || null,
      ticket_price: 0,
      capacity: null,
    }),
  });
}

export async function cancelEvent(id) {
  return organizerRequest(`/${id}/cancel`, {
    method: 'PATCH',
  });
}
