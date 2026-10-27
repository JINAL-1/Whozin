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
| `/search` | Search events (US-05) | Placeholder |
| `/events/new` | Create event (US-02) | Done |
| `/login` | Log in (US-01) | Done |
| `/signup` | Sign up (US-01) | Done |
| anything else | Page not found | Done |

To plug in a page, import it in `App.jsx` and replace the matching `<ComingSoon />`, for example:

```jsx
<Route path={ROUTES.search} element={<SearchEvents />} />
```

Every page is wrapped in `Layout`, so it gets the navbar and footer automatically. Use `ROUTES` from `routes.js` for links instead of typing paths.

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

## Tests

Tests live in `src/tests/`. `navigation.test.jsx` covers routing, the navbar, the mobile menu and the homepage search; `components.test.jsx` covers Button, FormField, EventCard, the formatters and the logo; `CreateEvent.test.jsx` covers the create event form. Add new test files as `*.test.jsx`; the jsdom environment and jest-dom matchers are already set up.

Design rules and manual layout checks are in `../docs/design-guidelines.md`.

## Known gaps

- The homepage shows sample events from `src/data/sampleEvents.js` until the events API is ready.
- Search shows a placeholder page until that feature is merged.
