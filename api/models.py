from sqlalchemy import Column, String, DateTime, ForeignKey, Table
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

Base = declarative_base()

def generate_cuid():
    """Generate a CUID-like string"""
    return str(uuid.uuid4())

class InsurancePayer(Base):
    __tablename__ = "insurance_payers"
    
    id = Column(String, primary_key=True, default=generate_cuid)
    name = Column(String, nullable=False)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationship to therapists through junction table
    therapists = relationship("TherapistInsurance", back_populates="insurance_payer")

class Therapist(Base):
    __tablename__ = "therapists"
    
    id = Column(String, primary_key=True, default=generate_cuid)
    name = Column(String, nullable=False)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    insurance_payers = relationship("TherapistInsurance", back_populates="therapist")
    availabilities = relationship("Availability", back_populates="therapist")

class TherapistInsurance(Base):
    __tablename__ = "therapist_insurance"
    
    therapist_id = Column(String, ForeignKey("therapists.id", ondelete="CASCADE"), primary_key=True)
    insurance_payer_id = Column(String, ForeignKey("insurance_payers.id", ondelete="CASCADE"), primary_key=True)
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    therapist = relationship("Therapist", back_populates="insurance_payers")
    insurance_payer = relationship("InsurancePayer", back_populates="therapists")

class Availability(Base):
    __tablename__ = "availabilities"
    
    id = Column(String, primary_key=True, default=generate_cuid)
    therapist_id = Column(String, ForeignKey("therapists.id", ondelete="CASCADE"), nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationship
    therapist = relationship("Therapist", back_populates="availabilities")
