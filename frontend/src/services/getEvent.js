import { searchEvents } from './eventApi.js'

// Finds one event by its id. It uses the same event list as the search page,
// so it works in demo mode and with the backend without a separate endpoint.
// Resolves to null when no published event has that id.
export async function getEventById(id) {
  const events = await searchEvents()
  return events.find((event) => String(event.id) === String(id)) ?? null
}
