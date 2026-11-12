
// Shared route paths. Import these instead of typing paths by hand
// so links keep working if a path changes.
export const ROUTES = {
  home: '/',
  search: '/search',
  createEvent: '/events/new',
  myEvents: '/events/mine',
  event: '/events/:id',
  login: '/login',
  signup: '/signup',
}

// Link to one event's page, e.g. eventPath(42) -> '/events/42'
export function eventPath(id) {
  return `/events/${encodeURIComponent(id)}`
}

// Who sees each link: 'guest' (logged out), 'attendee' or 'organizer'.
// Only organizers can create and manage events, so attendees don't see
// links to pages that would turn them away.
export const MAIN_NAV = [
  { to: ROUTES.search, label: 'Find events', for: ['guest', 'attendee', 'organizer'] },
  { to: ROUTES.createEvent, label: 'Create event', for: ['guest', 'organizer'] },
  { to: ROUTES.myEvents, label: 'My events', for: ['organizer'] },
]

export function navLinksFor(session) {
  const role = session?.user?.role
  const audience = role === 'attendee' || role === 'organizer' ? role : 'guest'
  return MAIN_NAV.filter((item) => item.for.includes(audience))
}
