"""Firebase-backed unified auth. Both caregivers (real accounts: email/OAuth/OTP)
and patients (device-paired) live in the same Firebase Auth pool and the same
`users` collection; a DB row (and, optionally, a custom claim) decides which
UX branch loads."""
import firebase_admin
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from firebase_admin import auth as firebase_auth, credentials

from app.config import settings
from app.models.user import RoleEnum, User

_bearer = HTTPBearer()

try:
    _cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
    firebase_admin.initialize_app(_cred)
except Exception:
    # Allows importing this module in local dev / tests without real creds.
    pass


async def get_current_user(creds: HTTPAuthorizationCredentials = Depends(_bearer)) -> User:
    try:
        decoded = firebase_auth.verify_id_token(creds.credentials)
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

    user = await User.find_one(User.firebase_uid == decoded["uid"])
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not provisioned")
    return user


async def require_caregiver(user: User = Depends(get_current_user)) -> User:
    if user.role != RoleEnum.caregiver:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Caregiver access required")
    return user


async def require_patient(user: User = Depends(get_current_user)) -> User:
    if user.role != RoleEnum.patient:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Patient device access required")
    return user
