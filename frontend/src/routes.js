
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

export const MAIN_NAV = [
  { to: ROUTES.search, label: 'Find events' },
  { to: ROUTES.createEvent, label: 'Create event' },
  { to: ROUTES.myEvents, label: 'My events' },
]
