import uuid
from datetime import datetime
from enum import Enum
from typing import Optional, Annotated

from beanie import Document, Indexed
from pydantic import Field


class RoleEnum(str, Enum):
    caregiver = "caregiver"
    patient = "patient"


class User(Document):
    """Unified auth collection — this *is* the credential store. Caregivers
    register with email + password (bcrypt hash below, never the raw
    password). Patients hold no credentials of their own: `caregiver_id`
    links a patient doc back to the caregiver who paired the tablet, and
    `device_id` identifies the paired hardware."""

    id: uuid.UUID = Field(default_factory=uuid.uuid4)
    role: RoleEnum
    name: str

    email: Optional[Annotated[str, Indexed(unique=True, sparse=True)]] = None  # caregivers only
    hashed_password: Optional[str] = None  # caregivers only — bcrypt hash

    region_language: str = "bn"  # as / bn / mni ...
    caregiver_id: Optional[Annotated[uuid.UUID, Indexed()]] = None
    device_id: Optional[Annotated[str, Indexed(unique=True, sparse=True)]] = None

    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "users"


class DevicePairingToken(Document):
    """Short-lived, single-use token behind the caregiver's QR code / magic
    link, used to pair a patient's tablet into Patient Mode. Separate from
    the JWT the device is issued once pairing completes."""

    id: uuid.UUID = Field(default_factory=uuid.uuid4)
    caregiver_id: uuid.UUID
    patient_id: Optional[uuid.UUID] = None
    token: Annotated[str, Indexed(unique=True)]
    expires_at: datetime
    used: bool = False

    class Settings:
        name = "device_pairing_tokens"
