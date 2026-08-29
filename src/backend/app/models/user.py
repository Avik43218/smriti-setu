import uuid
from datetime import datetime
from enum import Enum
from typing import Optional

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

    id: uuid.UUID = Field(default_factory=uuid.uuid4)
    firebase_uid: Indexed(str, unique=True)
    role: RoleEnum
    name: str
    email: Optional[Indexed(str, unique=True, sparse=True)] = None  # caregivers only
    region_language: str = "bn"  # as / bn / mni ...
    caregiver_id: Optional[Indexed(uuid.UUID)] = None  # set on patient docs
    device_id: Optional[Indexed(str, unique=True, sparse=True)] = None  # patient tablet pairing
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "users"


class DevicePairingToken(Document):
    """Short-lived token behind the caregiver's QR code / magic link used to
    lock a patient's tablet into Patient Mode."""

    id: uuid.UUID = Field(default_factory=uuid.uuid4)
    caregiver_id: uuid.UUID
    patient_id: Optional[uuid.UUID] = None
    token: Indexed(str, unique=True)
    expires_at: datetime
    used: bool = False

    class Settings:
        name = "device_pairing_tokens"
