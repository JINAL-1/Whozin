# Whozin – Who's In

**COMP 3415 – Software Engineering Project | Lakehead University**

> A centralized event discovery and promotion platform for the Thunder Bay community.

## Team

**Team Name:** Whozin (Who's In)

| Team Member | Email |
|---|---|
| Pranavv Patel | ppate218@lakeheadu.ca |
| Jinal Parekh | jparekh5@lakeheadu.ca |
| Dean Facho | dfacho@lakeheadu.ca |
| Julia Petterle | jgpetter@lakeheadu.ca |
| Krishi Patel | kpate176@lakeheadu.ca |

## Project Overview

Event information in Thunder Bay is spread across social media, posters, and individual organization websites. Whozin aims to make local events easier to discover and promote through a centralized platform for attendees and organizers.

**P2 milestone:** This repository contains an initial working web application, not the finished product. The current milestone focuses on account registration and login, organizer event creation, event search, database integration, and automated frontend testing.

### Implemented for P2

- React website with navigation, registration, login, create-event, and search pages.
- Account registration and login through the Express API, with JWT-based authentication.
- Attendee and organizer roles; event creation requires an organizer's authentication token.
- Event creation persisted in MySQL through the backend API.
- Event retrieval and keyword/location search through the backend API.
- Frontend automated tests, linting, and production build.

### Planned / not yet complete

The broader product vision includes event editing and management, category/date filters, calendars, ticket purchasing and digital tickets, notifications, promotional posts/videos, comments, bookmarks, sharing, following, personalized feeds, and administrator tools. These should **not** be treated as completed P2 features. In particular, paid-ticket pricing is not yet fully integrated; the current create-event API submission sends a price of zero.

## Technology Stack

| Layer | Technology | Responsibility |
|---|---|---|
| Frontend | React, Vite, JavaScript, HTML, CSS | Browser UI and user interaction |
| Backend | Node.js, Express | REST endpoints, validation, authentication and authorization |
| Database | MySQL | Persist users and events |
| Authentication | JWT | Authenticate API requests and restrict organizer actions |
| Testing | Vitest, React Testing Library | Frontend unit/component tests and mocked API tests |
| Collaboration | Git, GitHub | Version control, branches, pull requests, and reviews |

### Current architecture

```text
Browser
  |
  v
React + Vite frontend (frontend/)
  | HTTP / JSON; JWT bearer token for protected requests
  v
Node.js + Express REST API (backend/)
  | SQL queries
  v
MySQL database (initialized from backend/schema.sql)
```

The frontend displays and collects event information; the backend handles account authentication, authorization, and data access; MySQL stores persistent records. External payment, media, and notification integrations are future work, not dependencies of the current P2 demonstration.

## Run WHOZIN Locally (TA Setup)

> **The project is not automatically hosted by GitHub.** These instructions run it on your own computer. Keep the backend and frontend running in separate terminals.

### Prerequisites

- Git
- Node.js and npm (Node.js 20 or newer recommended; use a version compatible with the project's Vite installation)
- MySQL Server and a MySQL account with permission to create/import the project's schema

### 1. Clone and install dependencies

```bash
git clone https://github.com/JINAL-1/Whozin.git
cd Whozin

cd backend
npm install
cd ../frontend
npm install
cd ..
```

If the repository is private, the TA will need GitHub access before cloning.

### 2. Initialize the MySQL database

Start MySQL and import the database schema from `backend/schema.sql`. The script creates the `whozin` database if needed, selects it, and creates the `users` and `events` tables.

For example, from the repository root:

```bash
mysql -u root -p < backend/schema.sql
```

Enter your local MySQL password when prompted. Use `DB_NAME=whozin` in the backend configuration. The MySQL account needs permission to create the database and tables. Re-running the script will not overwrite existing tables, but it also will not migrate their structure.

### 3. Configure backend environment variables

Create `backend/.env` locally. The database variable names below are confirmed by `backend/src/db.js`. The JWT and port settings should be checked against the authentication and server files before the TA demonstration:



```dotenv
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_local_mysql_password
DB_NAME=whozin
JWT_SECRET=replace_with_a_long_random_secret  # verify variable name in auth code
PORT=3001  # verify server configuration
```

`DB_SOCKET` is optional; leave it unset for a standard TCP connection. If MySQL requires a local socket, set `DB_SOCKET` to the socket path. Never commit `.env`, real database passwords, or JWT secrets. Each developer/TA should use their own local credentials.

### 4. Configure frontend environment variables

Create `frontend/.env.local`:

```dotenv
VITE_API_URL=http://localhost:3001
VITE_DEMO_MODE=false
```

Setting demo mode to `false` makes the frontend use the Express API rather than locally stored sample events.

### 5. Start the backend (Terminal 1)

From the repository root:

```bash
cd backend
npm start
```

The backend is expected at `http://localhost:3001`. Keep this terminal open.

### 6. Start the frontend (Terminal 2)

From the repository root, in a **new** terminal:

```bash
cd frontend
npm run dev
```

Open the local URL printed by Vite (typically `http://localhost:5173`, but it may use another port if that one is occupied).

### 7. Verify the running application

1. Open the frontend URL in your browser.
2. Register an account with the **organizer** role.
3. Log in with that account.
4. Open **Create Event** and enter a title, description, date, time, and location.
5. Submit the event and confirm the success message.
6. Open **Search Events** and search for the event title or location.
7. Confirm the newly created event appears. To inspect the API response directly, open `http://localhost:3001/api/events`.

The demo uses a local database: events created on one teammate's computer will not automatically appear on another computer unless they share a database or import equivalent records.

## Automated Tests and Build

From the repository root:

```bash
cd frontend
npm install
npx vitest run
npm run lint
npm run build
```

During local integration verification on October 28, 2026, the frontend reported **39/39 passing tests across four test files**, with successful ESLint and Vite production build checks. Results should be rerun against the latest repository commit before the TA demonstration.

| Test file | Passing tests in that run |
|---|---:|
| `CreateEvent.test.jsx` | 5 |
| `components.test.jsx` | 13 |
| `SearchEvents.test.jsx` | 8 |
| `navigation.test.jsx` | 13 |

**Testing scope:** Some frontend tests mock API responses and do not require a live MySQL database. The team also manually verified a real browser → Express API → MySQL → search workflow. Automated frontend tests should not be described as full end-to-end database tests.

## API Overview (P2)

| Method | Route | Purpose |
|---|---|---|
| `POST` | `/api/auth/register` | Register attendee or organizer |
| `POST` | `/api/auth/login` | Log in and receive JWT |
| `POST` | `/api/events` | Create event (organizer JWT required) |
| `GET` | `/api/events` | Retrieve/search events; supports `keyword` and `location` query parameters |

## P2 Demonstration Checklist

- [ ] Start MySQL, backend, and frontend.
- [ ] Demonstrate organizer registration and login.
- [ ] Create an event and show its success confirmation.
- [ ] Search for the event and show its card.
- [ ] Show the corresponding event in the API response or database.
- [ ] Run `npx vitest run` and explain the testing scope.
- [ ] Show `npm run lint` and `npm run build` results.
- [ ] Show GitHub commit history, pull requests, and team contributions.
- [ ] Explain the architecture and the updated P2 product backlog.

## Project Structure

```text
Whozin/
├── backend/              # Express API, routes, database schema
│   └── schema.sql
├── frontend/             # React + Vite application
│   └── src/
│       ├── pages/
│       ├── services/
│       ├── components/
│       └── tests/
├── docs/                 # Project documentation and design guidelines
└── README.md
```

See `frontend/README.md` for additional frontend information.

## Design and Branding

- Logo assets: `frontend/public/brand/` and `frontend/public/favicon.svg`.
- Design guidelines: [`docs/design-guidelines.md`](docs/design-guidelines.md).

## Version Control and Evaluation

The project uses Git and GitHub for collaborative development. The TA may review the repository, branch/commit history, pull requests, implementation, automated tests, and a live local demonstration. The repository must remain accessible to the instructor and TAs.

## Future Work

The next iteration can expand event management, improve pricing and ticket functionality, add richer filtering and event details, strengthen backend/integration tests, and continue the broader social/event-discovery features described in P1.
