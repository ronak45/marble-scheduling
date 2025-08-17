from fastapi import FastAPI, HTTPException, Query, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List
from datetime import datetime
import uvicorn
import logging

from database import get_db
from models import Therapist, InsurancePayer, Availability, TherapistInsurance
from schemas import TherapistResponse, AvailabilityResponse
from sqlalchemy.orm import Session, joinedload

app = FastAPI(title="Therapist Scheduling API", version="1.0.0")
router = APIRouter(prefix="/api")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@router.get("/")
async def root():
    return {"message": "Therapist Scheduling API"}

@router.get("/health")
async def health_check():
    return {"status": "healthy", "message": "FastAPI server is running"}

@router.get("/availabilities", response_model=List[AvailabilityResponse])
async def get_availabilities(
    insurance: str,
):
    """Get availabilities"""
    
    logger.info(f"Received request for insurance: {insurance}")
    
    if not insurance:
        raise HTTPException(status_code=400, detail="Insurance parameter is required")
    
    db: Session = next(get_db())
    
    try:
        # Load therapist availabilities
        query = db.query(Availability).join(
            Therapist, Availability.therapist_id == Therapist.id
        ).join(
            TherapistInsurance, Therapist.id == TherapistInsurance.therapist_id
        ).join(
            InsurancePayer, TherapistInsurance.insurance_payer_id == InsurancePayer.id
        ).filter(
            InsurancePayer.id == insurance
        ).options(
            joinedload(Availability.therapist).joinedload(Therapist.insurance_payers).joinedload(TherapistInsurance.insurance_payer)
        )

        availabilities = query.all()
        
        logger.info(f"Found {len(availabilities)} availabilities")
        
        # Transform to response format
        result = []
        for availability in availabilities:
            therapist_data = {
                "id": availability.therapist.id,
                "name": availability.therapist.name,
                "insurancePayers": [
                    {
                        "id": ti.insurance_payer.id,
                        "name": ti.insurance_payer.name
                    }
                    for ti in availability.therapist.insurance_payers
                ]
            }
            
            result.append({
                "id": availability.id,
                "therapistId": availability.therapist_id,
                "startTime": availability.start_time.isoformat(),
                "endTime": availability.end_time.isoformat(),
                "therapist": therapist_data
            })
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching availabilities: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching availabilities: {str(e)}")
    finally:
        db.close()

@router.get("/insurance-payers")
async def get_insurance_payers():
    """Get all insurance payers"""
    db: Session = next(get_db())
    
    try:
        payers = db.query(InsurancePayer).order_by(InsurancePayer.name).all()
        return [{"id": payer.id, "name": payer.name} for payer in payers]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching insurance payers: {str(e)}")
    finally:
        db.close()

app.include_router(router)

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
