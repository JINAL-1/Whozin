// Shared route paths. Import these instead of typing paths by hand
// so links keep working if a path changes.
export const ROUTES = {
  home: '/',
  search: '/search',
  createEvent: '/events/new',
  login: '/login',
  signup: '/signup',
}

export const MAIN_NAV = [
  { to: ROUTES.search, label: 'Find events' },
  { to: ROUTES.createEvent, label: 'Create event' },
]
