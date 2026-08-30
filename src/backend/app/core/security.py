"""Self-hosted authentication.

Credentials never leave MongoDB: caregiver passwords are bcrypt-hashed and
stored on the `users` document (see models/user.py); there is no external
identity provider. Auth state is carried by a signed JWT — short-lived for
caregivers (interactive login), long-lived for patient devices (paired once,
then stays signed in).
"""
import uuid
from datetime import datetime, timedelta, timezone

import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

from app.config import settings
from app.models.user import RoleEnum, User

_bearer = HTTPBearer()


# ---- Password hashing (caregivers only) ------------------------------------

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))


# ---- JWT issuance ------------------------------------------------------

def _create_token(user_id: uuid.UUID, role: RoleEnum, expires_delta: timedelta) -> str:
    expire = datetime.now(timezone.utc) + expires_delta
    payload = {"sub": str(user_id), "role": role.value, "exp": expire}
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_caregiver_token(user_id: uuid.UUID) -> str:
    return _create_token(
        user_id, RoleEnum.caregiver, timedelta(minutes=settings.CAREGIVER_TOKEN_EXPIRE_MINUTES)
    )


def create_patient_device_token(user_id: uuid.UUID) -> str:
    return _create_token(
        user_id, RoleEnum.patient, timedelta(days=settings.PATIENT_TOKEN_EXPIRE_DAYS)
    )


# ---- Request-time verification ------------------------------------------------

async def get_current_user(creds: HTTPAuthorizationCredentials = Depends(_bearer)) -> User:
    try:
        payload = jwt.decode(
            creds.credentials, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
        )
        user_id = uuid.UUID(payload["sub"])
    except (JWTError, KeyError, ValueError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

    user = await User.get(user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


async def require_caregiver(user: User = Depends(get_current_user)) -> User:
    if user.role != RoleEnum.caregiver:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Caregiver access required")
    return user


async def require_patient(user: User = Depends(get_current_user)) -> User:
    if user.role != RoleEnum.patient:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Patient device access required")
    return user
