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
  pages/               Home, Login, Signup, CreateEvent, MyEvents, EventDetails, NotFound
  services/            API calls (eventApi.js)
  styles/              Page styles for auth and create event
  data/                Sample events for demo mode
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
| `/events/mine` | My events: edit or cancel your events (US-03) | Done |
| `/events/:id` | Event details, with Copy link and share to email, WhatsApp, Facebook and X (US-10) | Done |
| `/login` | Log in (US-01) | Done |
| `/signup` | Sign up (US-01) | Done |
| anything else | Page not found | Done |

To add a page, import it in `App.jsx` and add a route inside the `Layout` route, for example:

```jsx
<Route path={ROUTES.search} element={<SearchEvents />} />
```

The navbar and footer only show links the visitor can use: logged-out visitors see Find events and Create event, attendees see Find events, and organizers also see My events. The list is `MAIN_NAV` in `routes.js`. When someone is logged in, the navbar shows their email, their role and a Log out button. `useSession()` in `services/session.js` returns the logged-in user (or `null`), and `endSession()` logs them out. A login whose token has expired is cleared automatically.

Every page is wrapped in `Layout`, so it gets the navbar and footer automatically. Use `ROUTES` from `routes.js` for links instead of typing paths. To link to one event, use `eventPath(event.id)`, for example `<EventCard event={event} to={eventPath(event.id)} />`.

The homepage loads real events from the backend. It leaves out events that have already started, puts the next two in the hero and the four after those under Happening soon, so no event is listed twice. While events load it shows grey placeholders, and if the server can't be reached it shows a Try again button.

The event page loads one event with `getEventById(id)` in `services/getEvent.js`, which calls `GET /api/events/:id`. A cancelled or past event still opens, with a notice at the top, but without Register, Add to Calendar or Share. In demo mode (`VITE_DEMO_MODE=true`) the event comes from the demo list instead, so an event created in one browser only opens in that browser.

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

**ShareLinks**: Email, WhatsApp, Facebook and X buttons that open those apps with the event link filled in. Where the browser has a share menu (mostly phones), it also shows **More options**, which opens the device's own share menu. The links are built by `getShareLinks({ title, url })` in `utils/shareLinks.js`.

```jsx
<ShareLinks title={event.title} url={shareUrl} />
```

## Tests

Tests live in `src/tests/`. `navigation.test.jsx` covers routing, the navbar (including logging in and out), the mobile menu and the homepage search; `homepage.test.jsx` covers the homepage events; `components.test.jsx` covers Button, FormField, EventCard, the formatters and the logo; `CreateEvent.test.jsx` covers the create event form; `SearchEvents.test.jsx` covers search; `shareEvent.test.jsx` covers the event page and the share link. Tests that need event data use the fake backend in `src/tests/fakeBackend.js`, which replaces `fetch`, so they don't need the real server and pass whatever `.env.local` says. Add new test files as `*.test.jsx`; the jsdom environment and jest-dom matchers are already set up.

Design rules and manual layout checks are in `../docs/design-guidelines.md`.

## Known gaps

- Search still lists events that have already happened, because `GET /api/events` returns them. The homepage filters them out.
- `vercel.json` sends every page path to `index.html` on Vercel, so a shared `/events/<id>` link or a page refresh opens the right page. Other hosts need the same rule, or they show their own 404 page.
