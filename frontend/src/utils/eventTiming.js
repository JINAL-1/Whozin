// Events only have a start time, so an event counts as finished once it
// has started. Finished events are hidden from the homepage and search,
// and can't be registered for, edited, saved or shared.

const startTime = (event) => new Date(event.startsAt).getTime()

// True once the event's start time has passed. Events without a valid
// date are never treated as finished.
export function hasStarted(event, now) {
  const startsAt = startTime(event)
  return !Number.isNaN(startsAt) && startsAt <= now
}

// Events that haven't started yet, soonest first, each listed once.
// Events without a valid date are left out.
export function upcomingOnly(events, now) {
  const byId = new Map()

  for (const event of events) {
    const startsAt = startTime(event)
    if (startsAt > now && !byId.has(String(event.id))) {
      byId.set(String(event.id), { event, startsAt })
    }
  }

  return [...byId.values()]
    .sort((a, b) => a.startsAt - b.startsAt)
    .map(({ event }) => event)
}
