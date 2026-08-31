import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class UserOut(BaseModel):
    id: uuid.UUID
    role: str
    name: str
    email: Optional[str] = None

    class Config:
        from_attributes = True


class CaregiverOut(BaseModel):
    id: uuid.UUID
    name: str
    email: EmailStr
    region_language: str

    class Config:
        from_attributes = True


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_at: datetime


class CaregiverRegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(min_length=8)
    region_language: str = "bn"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class OtpRequestRequest(BaseModel):
    email: EmailStr


class OtpVerifyRequest(BaseModel):
    email: EmailStr
    otp: str = Field(min_length=4, max_length=8)


class OtpRequestResponse(BaseModel):
    message: str
    email: EmailStr


class OtpVerifyResponse(BaseModel):
    """Matches authService.js's `verifyOtp()`, which reads `data.token` and
    comments that the response is `{ token, caregiver }`."""

    token: str
    caregiver: CaregiverOut


class LogoutResponse(BaseModel):
    success: bool = True


class PatientPairStartOut(BaseModel):
    pairing_token: str
    expires_at: datetime


class PatientPairCompleteRequest(BaseModel):
    pairing_token: str
    device_id: str
    patient_name: str


class PatientPairCompleteOut(BaseModel):
    patient_id: uuid.UUID
    token: TokenOut
