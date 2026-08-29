from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class UserOut(BaseModel):
    id: UUID
    role: str
    name: str
    email: Optional[str] = None

    class Config:
        from_attributes = True


class PatientPairOut(BaseModel):
    token: str
    expires_at: datetime


class PatientPairRequest(BaseModel):
    token: str
    device_id: str
    device_firebase_uid: str
    patient_name: str
