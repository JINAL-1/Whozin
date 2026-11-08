import { sampleEvents } from '../data/sampleEvents.js'
import { searchEvents } from './eventApi.js'

// Finds one event by its id. Resolves to null when no published event has that id.
export async function getEventById(id) {
  const matches = (event) => String(event.id) === String(id)

  // The homepage shows these sample events in every mode, so their pages
  // open without asking the server.
  const sample = sampleEvents.find(matches)
  if (sample) return sample

  // Other events come from the same list as the search page, so this works
  // in demo mode and with the backend without a separate endpoint.
  const events = await searchEvents()
  return events.find(matches) ?? null
}
