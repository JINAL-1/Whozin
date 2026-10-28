# Whozin design guidelines

Shared visual rules for every Whozin page, so screens built on different branches look like one product.

## Logo

The wordmark is lowercase "whozin" drawn as rounded single-weight strokes. The dot of the "i" is a map pin, which ties the name ("who's in") to the idea of local, in-person events.

| File | Use |
|---|---|
| `frontend/public/brand/whozin-logo.svg` | Wordmark on light backgrounds |
| `frontend/public/brand/whozin-logo-light.svg` | Wordmark on dark or purple backgrounds |
| `frontend/public/brand/whozin-mark.svg` | Square app icon, social avatar |
| `frontend/public/favicon.svg` | Browser tab icon (same as the mark) |

In React, use the `Logo` component (`src/components/brand/Logo.jsx`) instead of an image tag. It follows the current text colour, so it works on any background.

Rules:

- Keep clear space around the logo of at least the height of the pin.
- Don't stretch, rotate, outline or recolour the letters. The pin is always amethyst.
- Smallest size: 20px tall for the wordmark, 16px for the mark.
- Text alternative: the logo's accessible name is "Whozin". When it links home, the link is labelled "Whozin home".

Use rights: the logo and mark are original artwork drawn for this project. They don't use any font outlines, stock icons or third-party artwork, so the team can use them freely in the project, report and demo.

## Colour

Amethyst is the accent colour. It's Ontario's official mineral and is mined around Thunder Bay, so it gives the brand a local root without leaning on lake-and-pine imagery. Everything else stays neutral so event content stands out.

| Token | Value | Use |
|---|---|---|
| `--color-brand` | `#5b2a8c` | Primary buttons, links, active nav |
| `--color-brand-strong` | `#461f6d` | Hover states, date text on cards |
| `--color-brand-soft` | `#ede4f6` | Date stub, secondary button hover |
| `--color-ink` | `#1d1a24` | Headings, strong text |
| `--color-text` | `#4a4554` | Body text |
| `--color-muted` | `#6c6676` | Hints, categories, footer note |
| `--color-bg` | `#ffffff` | Page background |
| `--color-surface` | `#f6f3f9` | Hero, footer, hover backgrounds |
| `--color-card` | `#ffffff` | Event cards |
| `--color-line` | `#e2dce9` | Borders, dividers |
| `--color-field-border` | `#8b8495` | Input borders (3:1 against the page) |
| `--color-success` | `#1f6b52` | "Free" price, success messages |
| `--color-error` | `#b3261e` | Form errors |

Always use the tokens (`var(--color-brand)`), never the hex values, so colours stay consistent and can change in one place. Body text and button colours meet WCAG 2.1 AA contrast (NFR-07).

The site is light-only for now. Dark mode can be added later by redefining these tokens, once every page uses them instead of fixed colours.

## Typography

| Role | Typeface | Notes |
|---|---|---|
| Headings, numbers on cards | Bricolage Grotesque (variable) | Bold, slightly condensed, poster-like |
| Body, labels, buttons | Atkinson Hyperlegible | Designed for readability, supports NFR-07 |

Both fonts are installed through npm (`@fontsource`) and served with the app, so there are no external font requests. Both use the SIL Open Font License.

Type scale (`--text-*` tokens): `sm` 14px, `base` 17px, `lg` 20px, `xl` 25px, `2xl` 31px, and a fluid `hero` size for the homepage headline only. Use sentence case for headings, buttons and labels.

## Spacing and layout

- Spacing tokens follow a 4px base: `--space-1` (4px) to `--space-16` (64px).
- Content is capped at 1120px inside `.container`, with side padding that shrinks on phones.
- Radius: `--radius-sm` (6px) for buttons and inputs, `--radius-md` (12px) for cards and panels.
- Touch targets are at least 44px tall.
- Breakpoints: 960px (hero stacks), 760px (mobile menu, single-column grids), 480px.

## Shared components

| Component | Path | What it's for |
|---|---|---|
| `Layout` | `components/layout/Layout.jsx` | Navbar, skip link, page content, footer |
| `Navbar` | `components/layout/Navbar.jsx` | Main links, account buttons, mobile menu |
| `Button` | `components/ui/Button.jsx` | All buttons and button-style links |
| `FormField` | `components/ui/FormField.jsx` | Labelled input, textarea or select with hint and error |
| `EventCard` | `components/events/EventCard.jsx` | Ticket-stub card for an event |

Event cards are drawn as ticket stubs: date on the left, a perforated edge, then details. Use `EventCard` anywhere events are listed so search results, the homepage and organizer pages match.

## Writing style

- Name buttons by what they do: "Create an event", "Search events", "Log in".
- Keep the same word through a flow. If the button says "Create event", the success message says "Event created".
- Error messages say what went wrong and how to fix it, e.g. "Enter an email address like name@example.com".

## Layout checks

Check these by hand in the browser before each demo (Chrome dev tools device toolbar works).

| Check | Width | Expected |
|---|---|---|
| No sideways scrolling on any page | 360px, 375px | Page fits the screen |
| Menu button opens and closes the menu | 375px | Links stack, menu closes after a link is tapped or Escape is pressed |
| Search form stacks | 375px | Fields and button full width |
| Event grid | 375px / 1280px | One column / two columns |
| Keyboard only | any | Tab reaches every link and button with a visible focus ring; "Skip to main content" shows on first Tab |
