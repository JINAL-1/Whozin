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