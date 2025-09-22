#!/bin/bash

# SprintSync Demo Initialization Script
# This script initializes the database with demo data

set -e  # Exit on any error

echo "🚀 Initializing SprintSync Demo"
echo "============================="

# Set environment to development (uses SQLite) and enable demo seeding
export ENVIRONMENT=development
export SEED_DEMO_DATA=true

# Reset database if it exists
if [ -f "./sprintsync.db" ]; then
    echo "🗑️  Removing existing database file..."
    rm ./sprintsync.db
fi

# Initialize database tables
echo "🔧 Initializing database tables..."
python -m alembic upgrade head

# Seed database using management command
echo "🌱 Seeding database with demo data..."
cd $(dirname "$0")/..
python -c "
from app.database.connection import get_db
from app.database.seeder import force_seed_database
from sqlalchemy.orm import Session

db_gen = get_db()
db: Session = next(db_gen)
try:
    force_seed_database(db)
finally:
    try:
        next(db_gen)
    except StopIteration:
        pass
"

echo "✅ Demo initialization completed!"
echo ""
echo "Demo Credentials:"
echo "Admin User - Email: admin@example.com, Password: admin123"
echo "Regular User - Email: john@example.com, Password: demo123"
echo ""
echo "To start the server, run: uvicorn app.main:app --reload"