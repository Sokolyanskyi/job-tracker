# Job Tracker

A modern, full-stack job application tracking system built with Next.js, Express, and Docker. Features an intuitive Kanban board interface with drag-and-drop functionality, secure authentication, and responsive design.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?style=flat-square&logo=tailwindcss)
![Express](https://img.shields.io/badge/Express-5.0-000000?style=flat-square&logo=express)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker)

## Features

- **Kanban Board** — Drag-and-drop interface for organizing job applications across stages (Applied, Interview, Offer, Rejected)
- **Secure Authentication** — JWT-based auth system with password reset functionality
- **Responsive Design** — Fully responsive UI built with TailwindCSS
- **Real-time Updates** — Optimistic UI updates with React Query
- **Smooth Animations** — Powered by Framer Motion
- **Docker Containerization** — One-command local deployment

## Tech Stack

### Frontend
- Next.js 16 (App Router)
- React 19 + TypeScript
- TailwindCSS 4
- @dnd-kit (drag-and-drop)
- TanStack Query (React Query)
- Framer Motion

### Backend
- Express.js 5
- Better SQLite3 (embedded database)
- JWT Authentication (jsonwebtoken)
- bcryptjs (password hashing)

### DevOps
- Docker + Docker Compose
- Persistent volume for SQLite

## Quick Start

### Prerequisites
- Docker & Docker Compose

### Run with Docker

```bash
# Clone and navigate
git clone <repo-url>
cd job-tracker

# Start all services
docker-compose up -d

# App will be available at:
# Frontend: http://localhost:3000
# API:      http://localhost:5000
```

### Local Development

**Backend:**
```bash
cd server
npm install
npm run dev
```

**Frontend:**
```bash
cd client
npm install
npm run dev
```

## Project Structure

```
job-tracker/
├── client/                 # Next.js frontend
│   ├── app/               # App router pages
│   ├── components/        # React components
│   │   ├── KanbanBoard.tsx
│   │   └── KanbanCard.tsx
│   └── lib/              # Utilities & auth
├── server/                # Express backend
│   └── src/
│       ├── server.js     # Entry point
│       ├── controllers/  # Route handlers
│       └── routes/       # API routes
└── docker-compose.yml    # Container orchestration
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Authenticate user |
| POST | `/auth/forgot-password` | Request password reset |
| POST | `/auth/reset-password` | Reset password with token |
| GET | `/auth/validate` | Validate JWT token |

## Screenshots

*Kanban Board Interface*
> Drag and drop job cards between columns to track application progress

## Environment Variables

**Server:**
- `PORT` — API server port (default: 5000)
- `JWT_SECRET` — Secret key for JWT signing
- `NODE_ENV` — production/development mode

**Client:**
- `NEXT_PUBLIC_API_URL` — Backend API URL

## Why This Stack?

- **Next.js 16** — Latest features, App Router for better performance
- **SQLite** — Zero-config database, perfect for solo/small teams
- **Docker** — Consistent environment across machines
- **Dnd-kit** — Modern, accessible drag-and-drop primitives

## License

MIT

---

Built with care for job seekers everywhere.
