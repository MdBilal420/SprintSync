# SprintSync Development Documentation

## Architecture Decisions

### Database Choice: Cloud SQL PostgreSQL
- **Decision**: Use Cloud SQL PostgreSQL for both development and production
- **Reasoning**: Environment parity, production-ready patterns, evaluation criteria alignment
- **Alternative considered**: Supabase (rejected for better system design demonstration)

### Tech Stack
- **Backend**: FastAPI + SQLAlchemy + PostgreSQL
- **Frontend**: React + Vite + TypeScript
- **Deployment**: Google Cloud Platform (Cloud Run)
- **AI**: OpenAI API with fallback mechanism

### Project Structure
- **Monorepo**: Single repository with separate server/ and web/ folders
- **Backend**: Clean architecture with models, schemas, crud, api layers
- **Frontend**: Component-based React with services layer for API calls

## Development Process
- Task-based development with status tracking
- Meaningful git commits with milestone tagging
- Time estimation and tracking in estimates.csv
- Regular documentation updates