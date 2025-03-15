from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api import teams, players
from .db.database import Base, engine

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="IPL Fantasy League API",
    description="API for managing IPL Fantasy League teams and players",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(teams.router, prefix="/api/teams", tags=["teams"])
app.include_router(players.router, prefix="/api/players", tags=["players"])

@app.get("/")
async def root():
    return {
        "message": "Welcome to IPL Fantasy League API",
        "docs_url": "/docs",
        "redoc_url": "/redoc"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"} 