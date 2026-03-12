# Streaming Platform

Full-stack streaming platform built in an Nx monorepo with:

- `PLATFORM`: user-facing Angular app
- `DASHBOARD`: admin Angular app
- `API`: NestJS backend

The workspace also contains shared Nx libraries for auth, API services, data models, UI components, and utilities.

## Stack

- Nx monorepo
- Angular 20 standalone apps
- NestJS 11 API
- TypeScript
- Tailwind CSS + SCSS
- RxJS
- JWT auth with `httpOnly` cookies
- Heroicons via `@semantic-icons/heroicons`

## Projects

- `apps/PLATFORM`
  - customer app for browsing movies, buying tickets, and watching content
- `apps/DASHBOARD`
  - admin app for managing movies, categories, users, plans, and IMDb imports
- `apps/API`
  - backend API for auth, catalog, purchases, admin data, and IMDb metadata import
- `libs/auth-lib`
  - auth store, guards, interceptor, session restore
- `libs/api-services`
  - Angular HTTP services for backend integration
- `libs/data-models`
  - shared TypeScript models
- `libs/ui-components`
  - shared UI elements
- `libs/utils`
  - shared helpers and formatters

## Requirements

- Node.js 20+
- npm 10+

## Installation

```bash
npm install
```

## Environment Setup

The API can import movie metadata by IMDb id through OMDb.

1. Create the API env file:

```bash
cp apps/API/.env.example apps/API/.env
```

2. Add your OMDb API key:

```env
OMDB_API_KEY=your_omdb_api_key
```

Without `OMDB_API_KEY`, the apps still run, but the dashboard IMDb import action will fail.

## How To Start

Start each project in a separate terminal.

### 1. Start the API

```bash
npm run start:api
```

API URL:

```text
http://localhost:3000/api
```

### 2. Start PLATFORM

```bash
npm run start:platform
```

Open:

```text
http://localhost:4200
```

### 3. Start DASHBOARD

```bash
npm run start:dashboard
```

Open:

```text
http://localhost:4201
```

The API is configured for local CORS access from `http://localhost:4200` and `http://localhost:4201`.

## Demo Credentials

### PLATFORM

- `ava@example.com / Password123!`
- `admin@example.com / Admin123!`

### DASHBOARD

- `admin@example.com / Admin123!`

## Main Features

### PLATFORM

- login and register
- JWT session restore on app reload
- movie list with search and category filters
- movie detail page with access gate
- ticket purchase and unlimited plan flow
- favorites with heart icons

### DASHBOARD

- admin-only login
- movie CRUD
- category management
- user management
- plan configuration
- analytics overview
- IMDb id field with metadata import into the movie form

### API

- auth with access token and refresh token cookies
- session validation and single-session enforcement
- movie, category, purchase, analytics, and admin endpoints
- seeded in-memory catalog and user data

## IMDb / OMDb Import

Movies can exist in two forms:

- IMDb-backed movies: save an `imdbId` and use the dashboard import action to populate fields
- custom movies: create them manually without an `imdbId`

Current implementation details:

- the seed catalog contains 50 movies with IMDb ids
- the dashboard fetches metadata through the Nest API
- the Nest API calls OMDb by IMDb id
- imported fields remain editable before saving

## Build Commands

```bash
npx nx build API --configuration=development
npx nx build PLATFORM --configuration=development
npx nx build DASHBOARD --configuration=development
```

## Notes

- The backend currently uses in-memory storage. Restarting the API resets users, sessions, movies, purchases, and configuration back to the seeded state.
- Auth is cookie-based. The frontend apps should run against the local API for login and session validation to work.
- If only one Angular app is running it will usually use `4200`. When both are running, the second one should be available on `4201`.
