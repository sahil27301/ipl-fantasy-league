from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

from app.db.database import engine, Base
import app.models as models  # Import all models to create tables

# Create all tables in the database
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="IPL Fantasy League API",
    description="API for managing IPL Fantasy League",
    version="0.1.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development, in production, specify origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to IPL Fantasy League API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"} 