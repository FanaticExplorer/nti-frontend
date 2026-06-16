# NTI Frontend

Vue 3 + PrimeVue frontend for the Nitrian Technology Incubator (NTI) platform.

## Prerequisites

- Node.js 18+
- NTI backend running at `http://localhost:8000`

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

The dev server starts at `http://localhost:5173`.

## Build

```bash
npm run build
npm run preview
```

## Environment

Copy `.env.example` to `.env` and adjust the API URL if needed:

```bash
cp .env.example .env
```

Default: `VITE_API_URL=http://localhost:8000`

## Project Structure

```
src/
├── main.js                  # App entry: Vue, PrimeVue, Router, Pinia
├── App.vue                  # Root: RouterView only
├── api/                     # Axios instance + per-module API functions
├── stores/                  # Pinia stores (auth, toast)
├── router/                  # Vue Router with role-based guards
├── layouts/                 # PublicLayout (navbar) + AppLayout (sidebar)
├── components/              # Reusable components (StatusBadge, RoleBadge)
└── views/                   # Pages organized by role/domain
```

## User Roles

| Role | Home | Access |
|---|---|---|
| student | /student/dashboard | student/* |
| team_leader | /student/dashboard | student/* |
| firm | /firm/dashboard | firm/* |
| mentor | /mentor/dashboard | mentor/* |
| evaluator | /evaluator/dashboard | evaluator/* |
| content_editor | /admin/content | admin/content*, admin/news* |
| nti_admin | /admin/dashboard | admin/* |
| super_admin | /admin/dashboard | admin/* + audit log |
