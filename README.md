# Marketplace Clone

A fullstack marketplace app with a React frontend, Express API, authentication, listing creation, filters, and a hosted-database-ready backend.

## Stack

- React + Vite frontend
- Express backend
- PostgreSQL database
- JWT authentication

## Features

- Browse listings by category
- Search by title or description
- Filter by location, condition, and price
- Sticky selected-listing detail panel
- Register and log in
- Create listings through the API
- Responsive navbar, auth modal, and post-listing modal

## Project Structure

```text
marketplace clone/
  client/
  server/
  render.yaml
  package.json
```

## Local Development

### 1. Install dependencies

```bash
npm install
npm install --prefix server
npm install --prefix client
```

### 2. Configure environment files

Server env in `server/.env`:

```env
DATABASE_URL=postgresql://user:password@host:5432/database
DB_SSL=false
JWT_SECRET=change-this-secret
```

Client env in `client/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000
```

### 3. Start the app

```bash
npm run dev
```

### 4. Open the app

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## Deployment Plan

### Backend (Vercel)

Deploy the `server/` folder as a separate Vercel project.

Set these environment variables in Vercel:

```env
DATABASE_URL=postgresql://...
DB_SSL=true
JWT_SECRET=your-secret
```

The backend serverless entrypoint is `server/api/[...all].js`.

### Frontend (GitHub Pages)

Frontend is deployed from GitHub Actions to Pages.

Set this GitHub repository secret:

```env
VITE_API_BASE_URL=https://your-vercel-backend-url.vercel.app
```

Then run the Pages workflow again to publish with the live API URL.

### Database

Use hosted PostgreSQL, for example:

- Neon
- Supabase

## API Endpoints

- `GET /api/health`
- `GET /api/categories`
- `GET /api/listings`
- `GET /api/listings/:id`
- `POST /api/listings`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

## Portfolio Notes

This project is portfolio-ready because it demonstrates:

- frontend product UI work
- authentication flow
- API integration
- persistent database-backed data
- responsive UX decisions
- deployment-ready fullstack structure
