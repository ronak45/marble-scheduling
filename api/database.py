from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os

# Database URL - you can set this in environment variables
DATABASE_URL = os.getenv("DATABASE_URL", None)

if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set")

# Create engine
engine = create_engine(DATABASE_URL)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_tables():
    """Create all tables"""
    from models import Base
    Base.metadata.create_all(bind=engine)
