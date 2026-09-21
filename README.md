# Whozin – Who's In

**COMP 3415 – Software Engineering Project**

> A centralized event discovery and promotion platform designed for the Thunder Bay community.

## Team

**Team Name:** Whozin (Who's In)

| Team Member  | Email |
|------|---|
| Pranavv Patel |   ppate218@lakeheadu.ca |
| Jinal Parekh |   jparekh5@lakeheadu.ca |
| Dean Facho |  dfacho@lakeheadu.ca |
| Julia Petterle |  jgpetter@lakeheadu.ca |

---

##  Project Description

### Problem

Event information in Thunder Bay is fragmented across social media, posters, and individual organization websites. As a result, residents and students may have difficulty discovering local events, while organizers have limited centralized platforms for promoting their events.

### Proposed System

**Whozin (Who's In)** is a centralized event discovery and promotion platform designed specifically for the Thunder Bay community.

The system will allow **event organizers, businesses, student organizations, and content creators** to publish and promote events. Users will be able to discover and interact with events through a **social-media-style interface**.

---

##  Core Functionality

The platform will provide:

- User and organizer accounts
- Event creation and management
- Event discovery and search
- Category and date-based filtering
- Event calendar
- Online ticket purchasing
- Digital tickets
- Notifications and reminders
- Social posts
- Short promotional videos
- Likes and comments
- Save/bookmark events
- Event and post sharing
- Following organizers and content creators
- Personalized event feed
- Event engagement and ticket information

---

## Value

Whozin will provide Thunder Bay with a centralized and engaging way to discover local events while giving organizers a more effective method of reaching their target audience.

By combining **event management, ticketing, and social promotion**, the system aims to improve local event visibility and community participation.

---

## Primary Users and Roles

### Event Attendee / User

Users will be able to:

- Create and manage a personal account
- Discover and search for local events
- View event details
- Save and share events
- Purchase tickets
- Access digital tickets
- Receive notifications and reminders
- Like and comment on event posts
- Follow organizers and content creators

###  Event Organizer

Organizers will be able to:

- Create, edit, and manage events
- Upload promotional content
- Manage ticket availability and pricing
- View registered attendees
- Send event-related updates
- Monitor event engagement
- View ticket-related information

### Content Creator / Promoter

Content creators and promoters will be able to:

- Create promotional content for events
- Share event-related posts and videos
- Collaborate with event organizers
- Promote events to users
- Interact with event communities

###  Administrator

Administrators will be responsible for:

- Managing users and organizers
- Managing events
- Managing reported content
- Verifying or removing events and content when necessary
- Managing user permissions
- Monitoring overall platform activity
- Maintaining platform security and appropriate usage

---

##  Technology Stack

### Programming Languages

- TypeScript
- JavaScript
- HTML
- CSS

### Frontend / Mobile

- **React Native** – Mobile application and responsive social-media-style interface

### Backend

- **Node.js**
- **Express.js**
- REST APIs
- Authentication and authorization
- Event management
- Ticketing
- User interactions

### Database

- **PostgreSQL**

PostgreSQL will store:

- User accounts
- Events
- Tickets
- Posts
- Comments
- Follows
- Saved events
- Other application data

### APIs & External Services

- **Google Maps API** – Event locations and mapping
- **Firebase Cloud Messaging** – Push notifications
- **Stripe** – Online ticket payments

### Authentication

The project may use:

- **Firebase Authentication**

or

- **JWT-based authentication**

for secure login and role-based access control.

### Media Storage

Promotional images and videos may be stored using:

- **Firebase Storage**
- Cloud-based object storage

### AI / Machine Learning

An AI-based recommendation system may be explored to recommend events based on:

- User interests
- Previous interactions
- Saved events
- Followed organizers
- Event engagement

### Deployment

Potential deployment technologies include:

- **Docker** – Application containerization
- **Render**
- **AWS**
- **Microsoft Azure**

### Version Control

- **Git**
- **GitHub**

Git and GitHub will be used for source-code management, collaboration, and version tracking.

---

##  System Overview

The proposed system will consist of several major components:

```text
                    ┌─────────────────────┐
                    │     Whozin App      │
                    │   React Native UI   │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │    REST API Layer   │
                    │ Node.js + Express.js │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
       ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
       │ PostgreSQL  │  │   Firebase  │  │ External    │
       │  Database   │  │ Auth/Storage│  │ APIs/Stripe │
       └─────────────┘  └─────────────┘  └─────────────┘

