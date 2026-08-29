import uuid
from datetime import datetime
from typing import Any, Dict, Optional

from beanie import Document, Indexed
from pydantic import Field


class GameSession(Document):
    """One document per completed cognitive-game round, synced up from the
    edge app's SQLite/IndexedDB queue. Feeds Pillar 1 (difficulty) and
    Pillar 3 (drift / anomaly detection)."""

    id: uuid.UUID = Field(default_factory=uuid.uuid4)
    patient_id: Indexed(uuid.UUID)
    client_session_id: Indexed(str, unique=True)  # idempotency key for sync

    game_type: str  # pattern_matcher | sound_hunt | path_tracker | recall
    difficulty_level: str  # e.g. "3x2", "4x4"

    accuracy: float
    avg_latency_ms: float
    error_rate: float
    performance_score: Optional[float] = None  # computed S

    client_timestamp: datetime
    synced_at: datetime = Field(default_factory=datetime.utcnow)
    raw_payload: Optional[Dict[str, Any]] = None

    class Settings:
        name = "game_sessions"


class VoiceInteraction(Document):
    """One document per voice check-in / reminiscence exchange. transcript
    arrives from edge-side STT; intent/entities are filled in server-side
    by Pillar 2's NLU classifier at sync time."""

    id: uuid.UUID = Field(default_factory=uuid.uuid4)
    patient_id: Indexed(uuid.UUID)
    client_session_id: Indexed(str, unique=True)

    transcript: Optional[str] = None
    language: str = "bn"
    intent: Optional[str] = None
    entities: Optional[Dict[str, Any]] = None  # {Task, Time, Status}
    confidence: Optional[float] = None

    client_timestamp: datetime
    synced_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "voice_interactions"
