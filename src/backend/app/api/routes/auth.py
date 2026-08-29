"""Unified role-based auth. Caregivers register/log in through Firebase
(email/password, Google OAuth, or OTP). Patients never get credentials —
a caregiver pairs their tablet once via a short-lived QR/magic-link token."""
import uuid
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException

from app.core.security import get_current_user, require_caregiver
from app.models.user import DevicePairingToken, RoleEnum, User
from app.schemas.auth import PatientPairOut, PatientPairRequest, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/me", response_model=UserOut)
async def me(user: User = Depends(get_current_user)):
    return user


@router.post("/patient/pair/start", response_model=PatientPairOut)
async def start_pairing(caregiver: User = Depends(require_caregiver)):
    """Caregiver's app calls this to generate the token behind the QR code /
    magic link shown on the patient's tablet during first-time setup."""
    token = uuid.uuid4().hex
    pairing = DevicePairingToken(
        caregiver_id=caregiver.id,
        token=token,
        expires_at=datetime.utcnow() + timedelta(minutes=10),
    )
    await pairing.insert()
    return PatientPairOut(token=token, expires_at=pairing.expires_at)


@router.post("/patient/pair/complete")
async def complete_pairing(payload: PatientPairRequest):
    """Patient tablet calls this after scanning the QR / tapping the magic
    link to lock itself into Patient Mode."""
    pairing = await DevicePairingToken.find_one(
        DevicePairingToken.token == payload.token,
        DevicePairingToken.used == False,  # noqa: E712
    )
    if not pairing or pairing.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Pairing token invalid or expired")

    patient = User(
        firebase_uid=payload.device_firebase_uid,
        role=RoleEnum.patient,
        name=payload.patient_name,
        caregiver_id=pairing.caregiver_id,
        device_id=payload.device_id,
    )
    await patient.insert()

    pairing.used = True
    pairing.patient_id = patient.id
    await pairing.save()

    return {"patient_id": str(patient.id)}
