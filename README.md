# RepForge

RepForge is a production-style full-stack fitness progression platform for planning workouts, logging training sessions, tracking records, and reviewing consistency over time. It is built as a resume-ready product surface with a React/Vite frontend, Express API, JWT auth, PostgreSQL, Prisma, secure middleware, polished UI states, charts, and guest access for recruiters.

## Features

- Landing page with a polished product story and instant guest login
- Signup, login, logout, JWT auth, protected dashboard routes
- User profile for goals, experience level, units, body metrics, and training days
- Workout plan builder with target sets, reps, load, distance, and duration
- Workout logging with exercises, sets, reps, weight, distance, time, effort, recovery, and notes
- Exercise library with search, filters, seeded movements, and custom exercise creation
- Progress analytics with volume charts, session trends, goals, records, and consistency map
- Personal records for best weight, best set volume, and longest distance
- Adaptive workout suggestions, weekly summary, badges, today’s workout, duplicate past workout
- Loading, empty, and error states across the app
- Netlify, Render, and Neon-ready configuration

## Tech Stack

Frontend:

- React, Vite, React Router, hooks, functional components
- Recharts for analytics
- Lucide React icons only
- Modular CSS split by concerns

Backend:

- Express in JavaScript
- PostgreSQL with Prisma
- JWT authentication
- bcrypt password hashing
- express-validator input validation
- Helmet, CORS, rate limiting, sanitized inputs, centralized errors

## Project Structure

```text
repforge/
  backend/
    prisma/
      schema.prisma
      seed.js
    src/
      config/
      controllers/
      middleware/
      routes/
      utils/
      app.js
      server.js
  frontend/
    public/
      _redirects
    src/
      components/
      context/
      hooks/
      pages/
      services/
      styles/
      utils/
      App.jsx
      main.jsx
  render.yaml
```

## Local Setup

Requirements:

- Node 20+
- PostgreSQL database, local or Neon

Optional local PostgreSQL with Docker:

```bash
docker compose up -d
```

For that local database, use:

```bash
DATABASE_URL="postgresql://repforge:repforge@localhost:5432/repforge"
```

Install dependencies:

```bash
npm run install:all
```

Create backend env:

```bash
cp backend/.env.example backend/.env
```

Set `backend/.env`:

```bash
NODE_ENV=development
PORT=5001
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/repforge?sslmode=require"
JWT_SECRET="replace-with-a-long-random-secret"
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
CLIENT_ORIGIN=http://localhost:5173
```

Create frontend env:

```bash
cp frontend/.env.example frontend/.env
```

Set `frontend/.env`:

```bash
VITE_API_URL=http://localhost:5001/api
```

Prepare the database:

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

Run both apps:

```bash
npm run dev
```

Local URLs:

- Frontend: `http://localhost:5173`
- Backend health check: `http://localhost:5001/api/health`

## API Overview

Auth:

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/guest`
- `GET /api/auth/me`

Protected resources:

- `GET/PATCH /api/profile`
- `GET/POST/PATCH/DELETE /api/goals`
- `GET/POST /api/exercises`
- `GET/POST/PUT/DELETE /api/plans`
- `GET/POST/PUT/DELETE /api/workouts`
- `POST /api/workouts/:id/duplicate`
- `GET /api/analytics/summary`
- `GET /api/analytics/progress`
- `GET /api/analytics/records`

## Security Notes

- Passwords are hashed with bcrypt before storage
- JWTs are required for protected routes
- Users can only access their own profile, goals, plans, workouts, records, and metrics
- Auth routes are rate-limited
- Helmet sets secure HTTP headers
- CORS is limited to `CLIENT_ORIGIN`
- Inputs are sanitized and validated on create/update endpoints
- Secrets live in `.env` and are ignored by git

## Deployment

### Neon

1. Create a Neon PostgreSQL project.
2. Copy the pooled connection string.
3. Use it as `DATABASE_URL` in Render.

### Render Backend

This repo includes `render.yaml`.

Set these Render environment variables:

- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN=7d`
- `BCRYPT_ROUNDS=12`
- `CLIENT_ORIGIN=https://your-netlify-site.netlify.app`
- `NODE_ENV=production`

Render build command:

```bash
npm install && npx prisma generate && npx prisma migrate deploy
```

Render start command:

```bash
npm start
```

### Netlify Frontend

Use `frontend` as the base directory.

Set Netlify environment variables:

- `VITE_API_URL=https://your-render-api.onrender.com/api`

Build settings:

- Build command: `npm run build`
- Publish directory: `dist`

The frontend includes `frontend/public/_redirects` and `frontend/netlify.toml` for client-side routing.

## Resume Stretch Ideas

- Add Playwright end-to-end tests for auth, guest flow, workout creation, and goal completion
- Add Prisma migrations checked into source after connecting the production database
- Add email verification and password reset flows
- Add shareable public progress snapshots
- Add AI-assisted plan generation after enough workout history exists
- Add CSV export for training logs
