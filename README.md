# SprintSync

A lean internal tool for AI consultancy engineers to log work, track time, and get AI-powered planning assistance.

## Live Demo

🔗 [https://sprintsyncai.netlify.app/](https://sprintsyncai.netlify.app/)


## Video Demo

🔗 [Loom Video 1/](https://www.loom.com/share/4e0c8371640446e985c9aa06c1546726?sid=8616e123-523d-4bb7-848d-06848416f2f3)
🔗 [Loom Video 2/](https://www.loom.com/share/4af5201b49a94d7098aca848386012df?sid=185359c8-2f42-49b8-bb08-b54f47232276)


### API Docs
 🔗 [https://sprintsync-backend-mvtgfeo4pa-uc.a.run.app/docs](https://sprintsync-backend-mvtgfeo4pa-uc.a.run.app/docs)

**Demo Credentials:**
- Admin User: admin@example.com / admin123
- Regular User: john@example.com / demo123

## Tech Stack

- **Backend**: FastAPI + SQLAlchemy + PostgreSQL (Cloud SQL)
- **Frontend**: React + Vite + TypeScript + Redux Toolkit
- **Database**: PostgreSQL (SQLite)
- **Deployment**: 
  - Frontend: Netlify
  - Backend: Google Cloud Platform (Cloud Run)
- **AI Integration**: OpenAI API
- **Authentication**: JWT-based authentication
- **Styling**: Tailwind CSS

## Project Structure

```
SprintSync/
├── server/          # FastAPI backend
├── web/            # React frontend
├── docs/           # Documentation
└── README.md
```

## Quick Start

### Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn
- PostgreSQL (for production) or SQLite (for local development)

### Backend Setup

```bash
# Navigate to server directory
cd server

# Create virtual environment
python -m venv venv

# Activate virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Environment setup
# Copy the appropriate environment file:
# For local development: cp .env.local .env
# For production: cp .env.production .env
# Then edit the .env file with your configuration

# Run database migrations
alembic upgrade head

# Start the server
uvicorn app.main:app --reload
```

### Frontend Setup

```bash
# Navigate to web directory
cd ../web

# Install dependencies
npm install

# Start development server
npm run dev

# Or start with local backend
npm run dev:local

# Or start with production backend
npm run dev:prod
```

## Environment Configuration

### Backend

The project uses two environment files in the `server/` directory:
- `.env.local` - For local development
- `.env.production` - For production deployment

Copy the appropriate file to `server/.env` and configure the values for your environment.

**Key Environment Variables:**
- `DATABASE_URL` - Database connection string
- `SECRET_KEY` - JWT secret key (change in production!)
- `OPENAI_API_KEY` - OpenAI API key for AI features
- `ALLOWED_ORIGINS` - CORS allowed origins

### Frontend

The frontend uses Vite environment variables:
- `VITE_API_URL` - Backend API URL (set via npm scripts)

## Deployment

### Backend (Google Cloud Run)

1. Build and push Docker image:
   ```bash
   cd server
   gcloud builds submit --tag gcr.io/[PROJECT-ID]/sprintsync-backend
   ```

2. Deploy to Cloud Run:
   ```bash
   gcloud run deploy --image gcr.io/[PROJECT-ID]/sprintsync-backend --platform managed
   ```

### Frontend (Netlify)

1. Build the production version:
   ```bash
   cd web
   npm run build
   ```

2. Deploy to Netlify:
   - Connect your repository to Netlify
   - Set build command to: `npm run build`
   - Set publish directory to: `dist/`

## Development Scripts

### Backend

- `uvicorn app.main:app --reload` - Run development server with auto-reload
- `alembic revision --autogenerate -m "message"` - Create new migration
- `alembic upgrade head` - Apply migrations
- `python -m pytest` - Run tests

### Frontend

- `npm run dev` - Start development server
- `npm run dev:local` - Start with local backend
- `npm run dev:prod` - Start with production backend
- `npm run build` - Build for production
- `npm run lint` - Run ESLint

## Features

- **User Authentication**: JWT-based login and registration
- **Project Management**: Create and manage projects with team members
- **Task Management**: Create, assign, and track tasks with time logging
- **Team Collaboration**: View team members and their roles
- **AI Integration**: Generate task descriptions with AI assistance
- **Admin Dashboard**: Manage users and view analytics (admin only)
- **Responsive Design**: Works on desktop and mobile devices

## Database Schema

The application uses four main models:
- **User**: Authentication and profile information
- **Project**: Team projects with owners and members
- **ProjectMember**: Association between users and projects with roles
- **Task**: Work items with status tracking and time logging

## API Documentation

Once the backend is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Development Status

✅ **Completed** - Production ready

---

Built as part of the GenAI.Labs Challenge
