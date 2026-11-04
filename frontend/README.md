# Whozin frontend

React + Vite website for Whozin, with React Router for pages and Vitest + Testing Library for tests.

## Setup

```bash
npm install
npm run dev
```

On Windows PowerShell, use `npm.cmd` if `npm` is blocked (for example `npm.cmd run dev`).

| Command | What it does |
|---|---|
| `npm run dev` | Starts the dev server at http://localhost:5173 |
| `npm test` | Runs all tests once |
| `npm run test:watch` | Re-runs tests when files change |
| `npm run lint` | Runs ESLint |
| `npm run build` | Builds the site into `dist/` |

## Folder structure

```text
src/
  App.jsx              Route list
  routes.js            Shared route paths and main nav links
  index.css            Design tokens and base styles
  components/
    layout/            Layout, Navbar, Footer
    brand/             Logo
    ui/                Button, FormField
    events/            EventCard
  pages/               Home, Login, Signup, CreateEvent, NotFound, ComingSoon
  services/            API calls (eventApi.js)
  styles/              Page styles for auth and create event
  data/                Sample events for the homepage
  utils/               Date and price formatting
  tests/               Test setup and test files
public/
  favicon.svg
  brand/               Logo files
```

## Routes

| Path | Page | Status |
|---|---|---|
| `/` | Home | Done |
| `/search` | Search events (US-05) | Done |
| `/events/new` | Create event (US-02) | Done |
| `/events/:id` | Event details, with a Copy link button for sharing (US-10) | Done |
| `/login` | Log in (US-01) | Done |
| `/signup` | Sign up (US-01) | Done |
| anything else | Page not found | Done |

To plug in a page, import it in `App.jsx` and replace the matching `<ComingSoon />`, for example:

```jsx
<Route path={ROUTES.search} element={<SearchEvents />} />
```

Every page is wrapped in `Layout`, so it gets the navbar and footer automatically. Use `ROUTES` from `routes.js` for links instead of typing paths. To link to one event, use `eventPath(event.id)`, for example `<EventCard event={event} to={eventPath(event.id)} />`.

The event page finds the event with `getEventById(id)` in `services/getEvent.js`. It uses the same list as search, so in demo mode an event created in one browser can only be opened in that browser. With the backend running, a shared link works on any device.

The homepage search sends people to `/search?q=<keyword>&location=<place>`. The search page can read these with `useSearchParams()` from `react-router`.

## Shared components

```jsx
import Button from '../components/ui/Button.jsx'
import FormField from '../components/ui/FormField.jsx'
import EventCard from '../components/events/EventCard.jsx'
```

**Button**: `variant` is `primary` (default), `secondary` or `ghost`; `size` is `sm`, `md` or `lg`. Pass `to` to make it a link. Buttons default to `type="button"`, so set `type="submit"` in forms.

```jsx
<Button type="submit" fullWidth>Create account</Button>
<Button to={ROUTES.login} variant="secondary">Log in</Button>
```

**FormField**: label, control, optional `hint` and `error`. It sets `aria-invalid` and `aria-describedby` for you. Use `as="textarea"` or `as="select"` for other controls; every other prop goes to the control.

```jsx
<FormField
  label="Email"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={errors.email}
  required
/>
```

**EventCard**: expects an event shaped like this, and an optional `to` link for the title.

```js
{
  id: '42',
  title: 'Open mic night',
  startsAt: '2026-11-14T00:30:00Z', // ISO date string
  location: 'Lakehead University, the Agora',
  category: 'Music',  // optional
  price: 0,           // optional, 0 shows "Free"
}
```

Dates are always shown in Thunder Bay time (America/Toronto). If the API uses different field names, map them to this shape before passing the event in.

**ShareButton**: a Copy link button that copies `url` and shows "Link copied". If the browser blocks copying, it shows the link in a field so it can be copied by hand.

```jsx
<ShareButton url={new URL(eventPath(event.id), window.location.origin).href} />
```

## Tests

Tests live in `src/tests/`. `navigation.test.jsx` covers routing, the navbar, the mobile menu and the homepage search; `components.test.jsx` covers Button, FormField, EventCard, the formatters and the logo; `CreateEvent.test.jsx` covers the create event form; `SearchEvents.test.jsx` covers search; `shareEvent.test.jsx` covers the event page and the share link. Add new test files as `*.test.jsx`; the jsdom environment and jest-dom matchers are already set up.

Design rules and manual layout checks are in `../docs/design-guidelines.md`.

## Known gaps

- The homepage shows sample events from `src/data/sampleEvents.js` until the events API is ready.
- The event page loads the event from the search list. A dedicated `GET /api/events/:id` endpoint would be faster once there are many events, and would let a shared link to a cancelled event say it was cancelled instead of "Event not found".
- When the site is deployed, the host must send every page path to `index.html`, or a shared `/events/<id>` link will show the host's own 404 page.
