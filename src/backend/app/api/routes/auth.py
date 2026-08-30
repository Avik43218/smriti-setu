"""Self-hosted, unified role-based auth.

Caregivers register with email + password; the password is bcrypt-hashed
and the hash is stored on their `User` document in MongoDB — no external
identity provider is involved. Patients never hold credentials: a caregiver
pairs the tablet once via a short-lived one-time token, and at that point
the device itself is issued a long-lived JWT to stay signed in.
"""
import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException

from app.config import settings
from app.core.security import (
    create_caregiver_token,
    create_patient_device_token,
    get_current_user,
    hash_password,
    require_caregiver,
    verify_password,
)
from app.models.user import DevicePairingToken, RoleEnum, User
from app.schemas.auth import (
    CaregiverAuthOut,
    CaregiverLoginRequest,
    CaregiverRegisterRequest,
    PatientPairCompleteOut,
    PatientPairCompleteRequest,
    PatientPairStartOut,
    TokenOut,
    UserOut,
)

router = APIRouter(prefix="/auth", tags=["auth"])


def _caregiver_token(user: User) -> TokenOut:
    return TokenOut(
        access_token=create_caregiver_token(user.id),
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=settings.CAREGIVER_TOKEN_EXPIRE_MINUTES),
    )


@router.post("/caregiver/register", response_model=CaregiverAuthOut, status_code=201)
async def register_caregiver(payload: CaregiverRegisterRequest):
    if await User.find_one(User.email == payload.email):
        raise HTTPException(status_code=409, detail="An account with that email already exists")

    user = User(
        role=RoleEnum.caregiver,
        name=payload.name,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        region_language=payload.region_language,
    )
    await user.insert()
    return CaregiverAuthOut(user=UserOut.model_validate(user), token=_caregiver_token(user))


@router.post("/caregiver/login", response_model=CaregiverAuthOut)
async def login_caregiver(payload: CaregiverLoginRequest):
    user = await User.find_one(User.email == payload.email, User.role == RoleEnum.caregiver)
    if not user or not user.hashed_password or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    return CaregiverAuthOut(user=UserOut.model_validate(user), token=_caregiver_token(user))


@router.get("/me", response_model=UserOut)
async def me(user: User = Depends(get_current_user)):
    return user


@router.post("/patient/pair/start", response_model=PatientPairStartOut)
async def start_pairing(caregiver: User = Depends(require_caregiver)):
    """Caregiver's app calls this to generate the token behind the QR code /
    magic link shown on the patient's tablet during first-time setup."""
    pairing = DevicePairingToken(
        caregiver_id=caregiver.id,
        token=uuid.uuid4().hex,
        expires_at=datetime.utcnow() + timedelta(minutes=10),
    )
    await pairing.insert()
    return PatientPairStartOut(pairing_token=pairing.token, expires_at=pairing.expires_at)


@router.post("/patient/pair/complete", response_model=PatientPairCompleteOut)
async def complete_pairing(payload: PatientPairCompleteRequest):
    """Patient tablet calls this after scanning the QR / tapping the magic
    link. No password is ever set for a patient — the tablet is issued a
    long-lived device token instead, which it stores locally and sends as
    a Bearer token on every subsequent request."""
    pairing = await DevicePairingToken.find_one(
        DevicePairingToken.token == payload.pairing_token,
        DevicePairingToken.used == False,  # noqa: E712
    )
    if not pairing or pairing.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Pairing token invalid or expired")

    if await User.find_one(User.device_id == payload.device_id):
        raise HTTPException(status_code=409, detail="This device is already paired")

    patient = User(
        role=RoleEnum.patient,
        name=payload.patient_name,
        caregiver_id=pairing.caregiver_id,
        device_id=payload.device_id,
    )
    await patient.insert()

    pairing.used = True
    pairing.patient_id = patient.id
    await pairing.save()

    token = TokenOut(
        access_token=create_patient_device_token(patient.id),
        expires_at=datetime.now(timezone.utc) + timedelta(days=settings.PATIENT_TOKEN_EXPIRE_DAYS),
    )
    return PatientPairCompleteOut(patient_id=patient.id, token=token)
