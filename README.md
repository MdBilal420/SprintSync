# SprintSync

A lean internal tool for AI consultancy engineers to log work, track time, and get AI-powered planning assistance.

## Tech Stack

- **Backend**: FastAPI + SQLAlchemy + PostgreSQL (Cloud SQL)
- **Frontend**: React + Vite
- **Database**: PostgreSQL (Cloud SQL for both dev and prod)
- **Deployment**: Google Cloud Platform (Cloud Run)
- **AI Integration**: OpenAI API

## Project Structure

```
SprintSync/
├── server/          # FastAPI backend
├── web/            # React frontend
├── docs/           # Documentation
├── docker-compose.yml
└── README.md
```

## Quick Start

```bash
# Backend setup
cd server
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Frontend setup
cd ../web
npm install
npm run dev
```

## Development Status

🚧 **In Development** - Setting up project structure

## Live Demo

🔗 Coming soon...

---

Built as part of the GenAI.Labs Challenge