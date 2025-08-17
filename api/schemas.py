from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class InsurancePayerBase(BaseModel):
    id: str
    name: str

class InsurancePayerResponse(InsurancePayerBase):
    class Config:
        from_attributes = True

class TherapistBase(BaseModel):
    id: str
    name: str

class TherapistResponse(TherapistBase):
    insurancePayers: List[InsurancePayerResponse]
    
    class Config:
        from_attributes = True

class AvailabilityBase(BaseModel):
    id: str
    therapistId: str
    startTime: str
    endTime: str

class AvailabilityResponse(AvailabilityBase):
    therapist: TherapistResponse
    
    class Config:
        from_attributes = True

class SearchRequest(BaseModel):
    insurance: str
