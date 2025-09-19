# SprintSync Frontend

Frontend for SprintSync - A lean task management tool for AI consultancy engineers.

## Tech Stack

- React 18 with TypeScript
- Vite for fast development and building
- Tailwind CSS for styling
- Redux Toolkit for state management
- Axios for HTTP requests
- React Router for navigation

## Prerequisites

- Node.js 16+
- npm or yarn

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

## Development

### Available Scripts

```bash
# Start development server with default API (localhost:8000)
npm run dev

# Start development server with local API
npm run dev:local

# Start development server with production API
npm run dev:prod

# Build for production
npm run build

# Build for local environment
npm run build:local

# Build for production environment
npm run build:prod

# Lint the code
npm run lint

# Preview the production build
npm run preview
```

### Environment Variables

The frontend can connect to different backend APIs based on environment variables:

- `VITE_API_URL`: Backend API URL
  - For local development: `http://localhost:8000`
  - For production: `https://sprintsync-backend-mvtgfeo4pa-uc.a.run.app`

You can switch between APIs by:
1. Setting the `VITE_API_URL` in your `.env` file
2. Using the specific npm scripts (`npm run dev:local` or `npm run dev:prod`)
3. Setting the environment variable when running the command:
   ```bash
   VITE_API_URL=http://localhost:8000 npm run dev
   ```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── controllers/    # API service wrappers
├── models/         # Redux store, slices, and API hooks
├── pages/          # Page components
├── types/          # TypeScript interfaces and types
└── utils/          # Utility functions
```