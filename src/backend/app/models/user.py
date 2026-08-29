import uuid
from datetime import datetime, timezone
from enum import Enum
from typing import Optional, Annotated

from beanie import Document, Indexed
from pydantic import Field


class RoleEnum(str, Enum):
    caregiver = "caregiver"
    patient = "patient"


class User(Document):
    """Unified auth collection. Caregivers get real accounts (Firebase
    email/OAuth/OTP). Patients are provisioned via device pairing and hold
    no credentials of their own — `caregiver_id` links a patient doc back
    to the caregiver who paired the tablet."""

    class User(Document):
        id: uuid.UUID = Field(default_factory=uuid.uuid4)
        firebase_uid: Annotated[str, Indexed(unique=True)]
        role: RoleEnum
        name: str
        email: Optional[Annotated[str, Indexed(unique=True, sparse=True)]] = None
        region_language: str = "bn"
        caregiver_id: Optional[Annotated[uuid.UUID, Indexed()]] = None
        device_id: Optional[Annotated[str, Indexed(unique=True, sparse=True)]] = None
        created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "users"


class DevicePairingToken(Document):
    """Short-lived token behind the caregiver's QR code / magic link used to
    lock a patient's tablet into Patient Mode."""

    id: uuid.UUID = Field(default_factory=uuid.uuid4)
    caregiver_id: uuid.UUID
    patient_id: Optional[uuid.UUID] = None
    token: Annotated[str, Indexed(unique=True)]
    expires_at: datetime
    used: bool = False

    class Settings:
        name = "device_pairing_tokens"
