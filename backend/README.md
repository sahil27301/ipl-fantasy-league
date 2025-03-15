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