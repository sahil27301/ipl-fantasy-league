# IPL Fantasy League Management Console

A comprehensive solution for managing an IPL Fantasy League among friends. This application provides tools for conducting player auctions and tracking player performance across IPL matches.

## Project Overview

This application consists of two main components:
1. **FastAPI Backend**: Handles data persistence, business logic, and API endpoints
2. **Lovable.dev Frontend**: Provides a beautiful and intuitive user interface

## Key Features

### Auction Management
- Track player purchases by teams
- Manage team purse balances
- Record player prices during auction
- Filter available/unsold players

### Score Management
- Update player scores after each match
- Track player performance over time
- Calculate team standings based on player scores
- Generate performance statistics

## Quick Start

### Prerequisites
- Python 3.9+
- Node.js 16+
- Git

### Setup & Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   cd ipl-fantasy-league
   ```

2. Setup backend:
   ```
   cd backend
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```

3. Setup frontend:
   ```
   cd frontend
   npm install
   npm start
   ```

## Documentation

For detailed documentation, please refer to the following guides:

- [Backend Implementation Plan](docs/backend_plan.md)
- [Frontend Implementation Plan](docs/frontend_plan.md)

## Project Structure

```
ipl-fantasy-league/
├── backend/               # FastAPI backend
│   ├── app/               # Application code
│   │   ├── api/           # API endpoints
│   │   ├── core/          # Core functionality
│   │   ├── db/            # Database models and migrations
│   │   ├── schemas/       # Pydantic schemas
│   │   └── services/      # Business logic
│   ├── tests/             # Test cases
│   └── requirements.txt   # Python dependencies
├── frontend/              # Lovable.dev frontend
│   ├── public/            # Static assets
│   ├── src/               # Source code
│   │   ├── components/    # UI components
│   │   ├── pages/         # Application pages
│   │   ├── services/      # API service modules
│   │   └── utils/         # Utility functions
│   └── package.json       # Node.js dependencies
├── docs/                  # Documentation
└── README.md              # Project overview
```

## Contributing

This project is designed for personal use but contributions are welcome. Please feel free to fork the repository and submit pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 