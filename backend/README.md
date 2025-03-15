# IPL Fantasy League Backend

Backend API for the IPL Fantasy League management console, built with FastAPI and SQLite.

## Setup

1. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Run the development server:
   ```
   cd backend
   uvicorn app.main:app --reload
   ```

3. Access the API documentation:
   - Swagger UI: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

## Database Migrations

The application uses Alembic for database migrations. Follow these steps to set up your database:

1. Initialize the database with all tables:
   ```bash
   # Make sure you're in the backend directory
   cd backend
   
   # Run all migrations
   alembic upgrade head
   ```

2. Check migration status:
   ```bash
   alembic current  # Shows current migration version
   alembic history  # Shows migration history
   ```

3. If you need to rollback:
   ```bash
   alembic downgrade -1  # Rollback one migration
   alembic downgrade base  # Rollback all migrations
   ```

4. After making model changes:
   ```bash
   # Create a new migration
   alembic revision --autogenerate -m "Description of changes"
   
   # Apply the new migration
   alembic upgrade head
   ```

## Database

The application uses SQLite for data storage. The database file `fantasy_league.db` will be created automatically in the backend directory when the application starts.

## API Endpoints

The API provides endpoints for:
- Team management
- Player management
- Auction management
- Match management
- Player score management
- Dashboard analytics 