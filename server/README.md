# SprintSync Backend

FastAPI backend server for SprintSync.

## Structure

```
server/
├── app/
│   ├── models/         # SQLAlchemy models
│   ├── schemas/        # Pydantic schemas
│   ├── crud/          # Database operations
│   ├── api/           # API endpoints
│   ├── core/          # Core configuration
│   ├── database/      # Database setup
│   └── main.py        # FastAPI app entry point
├── tests/             # Test files
├── requirements.txt   # Python dependencies
└── Dockerfile        # Docker configuration
```

## Setup

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```