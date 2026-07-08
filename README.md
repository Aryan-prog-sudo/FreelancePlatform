# 🚀 FreelancePlatform

A full-stack freelance marketplace connecting **Customers**, **Freelancers**, and **Artists** — with project posting, bidding, contracts, escrow payments, disputes, and reviews baked into the data layer itself via MySQL triggers.

<p align="center">
  <img alt="Node.js" src="https://img.shields.io/badge/Node.js-Express%205-339933?logo=node.js&logoColor=white">
  <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black">
  <img alt="MySQL" src="https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql&logoColor=white">
  <img alt="License" src="https://img.shields.io/badge/license-ISC-lightgrey">
</p>

---

## 📖 Overview

FreelancePlatform is a role-based marketplace where:

- **Customers** post projects and review incoming bids
- **Freelancers** bid on projects, get hired, and get paid through escrow
- **Artists** showcase portfolios and build reputation

Once a bid is accepted, a `CONTRACT` row is inserted — and a database trigger automatically creates the corresponding `ESCROW_PAYMENT` record. If an escrow is ever refunded, another trigger automatically opens a `DISPUTE`. Business rules like "budget must be > 0" and "deadline can't be in the past" are enforced at the database level, not just in the API.

---

## 🏗️ Architecture

```
┌──────────────────────┐        REST/JSON        ┌──────────────────────┐        SQL        ┌──────────────────┐
│   React Frontend     │  ───────────────────▶   │   Express Backend    │  ─────────────▶   │   MySQL Database  │
│   (CRA, port 3000)   │  ◀───────────────────   │   (port 3001)         │  ◀─────────────   │  FreelancePlatform │
└──────────────────────┘        axios            └──────────────────────┘     mysql2/promise └──────────────────┘
```

- **Frontend** — Create React App, React Router v7, Axios. Role-based protected routes with `localStorage`-backed sessions.
- **Backend** — Express 5, modular route files per resource, a single shared MySQL connection pool (`db.js`).
- **Database** — Normalized MySQL schema (15 tables) plus 4 triggers that encode side-effect business logic.

---

## ✨ Features

| Area | Description |
|---|---|
| 🔐 **Auth** | Signup/login with `bcryptjs` password hashing (with legacy plaintext fallback for seed data), role-based redirect on login |
| 📋 **Projects** | Post projects, browse all projects, filter projects with no contract yet, filter upcoming deadlines |
| 💰 **Bids** | Submit bids, view all bids, view bids under budget, count bids per project |
| 📑 **Contracts** | Accept a bid → auto-generate contract + escrow, view full contract dashboard, view disputes, view transaction summaries |
| 🏦 **Escrow** | Auto-funded on contract signing (via trigger), manually release/refund via API |
| 🧑‍💻 **Freelancers** | Top freelancers by reputation, bio management, bid stats, review listings, average escrow by category |
| 🎨 **Artists** | Artist profiles, portfolio listings, bio management |
| 🖥️ **Dashboards** | Dedicated Customer, Freelancer, and Artist dashboards with tabs, notifications, and password change flows |

---

## 🗂️ Project Structure

```
FreelancePlatform/
├── backend/
│   ├── index.js              # Express app entry point + route mounting
│   ├── server.js             # (npm start entry — currently empty, see note below)
│   ├── db.js                 # MySQL connection pool (mysql2/promise)
│   ├── routes/
│   │   ├── projects.js       # /api/projects
│   │   ├── bids.js           # /api/bids
│   │   ├── contracts.js      # /api/contracts
│   │   ├── users.js          # /api/users
│   │   ├── freelancers.js    # /api/freelancers
│   │   └── artists.js        # /api/artists
│   ├── schema.sql            # Table definitions, indexes, seed data
│   ├── triggers.sql          # Escrow, dispute, profile, and validation triggers
│   ├── package.json
│   └── .env                  # DB_HOST, DB_USER, DB_PASS, DB_NAME (not committed)
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── App.js             # Router + role-protected routes
    │   ├── index.js
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── CustomerDashboard.jsx
    │   │   ├── FreelancerDashboard.jsx
    │   │   ├── ArtistDashboard.jsx
    │   │   ├── Projects.jsx
    │   │   ├── Bids.jsx
    │   │   ├── Contracts.jsx
    │   │   ├── Freelancers.jsx
    │   │   ├── Artists.jsx
    │   │   └── Users.jsx
    │   └── setupTests.js
    └── package.json
```

> **Note:** `package.json`'s `start` script points to `server.js`, but all backend logic currently lives in `index.js`, and `server.js` is empty. Either point `start` at `index.js`, or move the app code into `server.js`, before deploying.

---

## 🧬 Database Schema

15 tables model the full marketplace lifecycle:

**Identity & Profiles**
`ROLE` → `USER` → `CUSTOMER_PROFILE` / `FREELANCER_PROFILE` / `ARTIST_PROFILE`

**Work & Catalog**
`CATEGORY`, `SKILLS`, `PORTFOLIO`, `PROJECT`

**Deal Flow**
`BID` → `CONTRACT` → `ESCROW_PAYMENT` → `TRANSACTION`

**Trust & Safety**
`DISPUTE`, `REVIEW`

Every foreign key has a supporting index, and every primary key is separately indexed for lookup performance.

### ⚡ Triggers (`triggers.sql`)

| Trigger | Fires On | Effect |
|---|---|---|
| `auto_create_escrow` | `AFTER INSERT ON CONTRACT` | If the new contract is `'Signed'`, automatically inserts a `Pending` escrow payment sized to the winning bid (or falls back to project budget) |
| `auto_open_dispute` | `AFTER UPDATE ON ESCROW_PAYMENT` | If an escrow's status changes to `'Refunded'`, automatically opens a `Dispute` flagged for review |
| `auto_create_profile` | `AFTER INSERT ON USER` | Automatically creates the matching `CUSTOMER_PROFILE`, `FREELANCER_PROFILE`, or `ARTIST_PROFILE` row based on `role_id` |
| `validate_project_budget` | `BEFORE INSERT ON PROJECT` | Rejects projects with a budget ≤ 0 or a deadline in the past via `SIGNAL SQLSTATE '45000'` |

---

## 🔌 API Reference

Base URL: `http://localhost:3001/api`

### Users — `/users`
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | List all users with role name |
| `POST` | `/login` | Login with email, password, and role |
| `POST` | `/signup` | Create a new account (self-service) |
| `POST` | `/` | Create a user directly (admin-style) |
| `POST` | `/change-password` | Change password given old + new |

### Projects — `/projects`
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | All projects with client name & category |
| `GET` | `/no-contract` | Projects that haven't been contracted yet |
| `GET` | `/upcoming` | Projects with a 2026 deadline, soonest first |
| `POST` | `/` | Create a new project |

### Bids — `/bids`
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | All bids with freelancer & project names |
| `GET` | `/under-budget` | Bids below the project's budget, with savings |
| `GET` | `/count-per-project` | Bid count per project |
| `POST` | `/` | Submit a new bid |

### Contracts — `/contracts`
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Full contract dashboard (client, freelancer, escrow, payment status) |
| `GET` | `/disputed` | Contracts with open disputes |
| `GET` | `/transactions-summary` | Total transacted amount per contract |
| `GET` | `/bids/:project_id` | All bids for a specific project |
| `POST` | `/accept-bid` | Accept a bid → creates contract → escrow auto-funds via trigger |
| `GET` | `/escrow` | Escrow status across all contracts |
| `POST` | `/escrow/update` | Release or refund an escrow payment |

### Freelancers — `/freelancers`
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | All freelancers |
| `GET` | `/top` | Top 5 freelancers by reputation |
| `GET` | `/avg-escrow-by-category` | Average escrow amount grouped by category |
| `GET` | `/reviewed` | Freelancers with their reviews, sorted by rating |
| `GET` | `/funded` | Freelancers with currently funded escrow |
| `GET` | `/bid-stats` | Bid count & average bid amount per freelancer |
| `PUT` | `/bio` | Update a freelancer's bio |

### Artists — `/artists`
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | All artists with bio & reputation |
| `GET` | `/portfolios` | Artists with their portfolio descriptions |
| `PUT` | `/bio` | Update an artist's bio |

---

## 🖥️ Frontend

Built with **Create React App** + **React Router v7**.

- **`Login.jsx`** — Combined login/signup screen with a visual role picker (Customer / Freelancer / Artist), inline validation, and show/hide password toggle.
- **Role-based routing** — `App.js` guards `/customer`, `/freelancer`, and `/artist` routes via a `ProtectedRoute` wrapper that checks `localStorage.user.role_id`.
- **Dashboards** — Each role gets a dedicated sidebar-driven dashboard (`CustomerDashboard.jsx`, `FreelancerDashboard.jsx`, `ArtistDashboard.jsx`) with tabs for profile, activity, and settings (including in-app password change).
- **Simple resource pages** — `Projects.jsx`, `Bids.jsx`, `Contracts.jsx`, `Freelancers.jsx`, `Artists.jsx`, `Users.jsx` render straightforward tables against their matching API endpoint, some with inline "create" forms (Bids, Users).

> Session is stored in `localStorage` under the key `user` (no `password` field, set by the backend before responding). There is no token/JWT layer yet — routes trust the presence and shape of this object.

---

## 🛠️ Tech Stack

**Backend**
- [Express 5](https://expressjs.com/) — HTTP server & routing
- [mysql2](https://github.com/sidorares/node-mysql2) (promise API) — MySQL driver
- [bcryptjs](https://github.com/dcodeIO/bcrypt.js) — password hashing
- [cors](https://github.com/expressjs/cors) — cross-origin requests from the frontend
- [dotenv](https://github.com/motdotla/dotenv) — environment config

**Frontend**
- [React 19](https://react.dev/) via Create React App
- [React Router 7](https://reactrouter.com/)
- [Axios](https://axios-http.com/)

**Database**
- MySQL 8

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js (v18+ recommended)
- MySQL Server (v8+)

### 1. Clone the repo
```bash
git clone <your-repo-url>
cd FreelancePlatform
```

### 2. Set up the database
```bash
mysql -u root -p < backend/schema.sql
mysql -u root -p < backend/triggers.sql
```
This creates the `FreelancePlatform` database, all tables, indexes, and seed data, then attaches the four business-logic triggers.

### 3. Configure the backend
```bash
cd backend
npm install
```
Create a `.env` file in `backend/`:
```env
DB_HOST=localhost
DB_USER=root
DB_PASS=your_mysql_password
DB_NAME=FreelancePlatform
```
Run the server:
```bash
node index.js
# ✅ Backend running at http://localhost:3001
```

### 4. Configure the frontend
```bash
cd frontend
npm install
npm start
```
The app opens at `http://localhost:3000` and talks to the backend at `http://localhost:3001/api`.

---

## 🧪 Sample Login

The schema seeds one customer and one freelancer:

| Role | Email | Password |
|---|---|---|
| Customer | `alice@gmail.com` | `pass1` |
| Freelancer | `bob@test.com` | `pass2` |

These are stored as **plaintext** in the seed data; the login route detects non-bcrypt hashes (`$2...`) and falls back to a direct string comparison, so these seed accounts work out of the box. Any account created via signup gets a proper bcrypt hash.

---

## 🗺️ Roadmap / Known Gaps

- [ ] Fix `package.json` `start` script vs. empty `server.js`
- [ ] Add JWT or session-based auth instead of trusting `localStorage`
- [ ] Add server-side authorization checks (currently role gating is frontend-only)
- [ ] Migrate seed passwords to bcrypt hashes
- [ ] Add a `SKILLS`-to-freelancer/project join table (table exists in schema but isn't wired to any route yet)
- [ ] Add automated tests for API routes

---

## 📄 License

MIT LICENSE