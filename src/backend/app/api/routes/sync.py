"""Sync & Queue Layer (backend side): ingest the batched JSON payload the
edge app's background sync manager pushes once connectivity returns.
Idempotent on client_session_id; kicks off Pillar 1 + Pillar 3 processing
inline after each batch."""
from fastapi import APIRouter, Depends

from app.core.bandit import performance_score
from app.core.nlu import classify
from app.core.security import require_patient
from app.models.session import GameSession, VoiceInteraction
from app.models.user import User
from app.schemas.sync import SyncBatchIn, SyncBatchOut
from app.services.analytics_service import run_anomaly_check
from app.services.difficulty_service import update_bandit

router = APIRouter(prefix="/sync", tags=["sync"])


@router.post("/batch", response_model=SyncBatchOut)
async def sync_batch(payload: SyncBatchIn, patient: User = Depends(require_patient)):
    accepted_sessions = 0
    for s in payload.game_sessions:
        if await GameSession.find_one(GameSession.client_session_id == s.client_session_id):
            continue  # already synced — client_session_id makes this idempotent

        score = performance_score(
            accuracy=s.accuracy,
            avg_latency_norm=min(s.avg_latency_ms / 5000, 1.0),
            error_rate=s.error_rate,
        )
        await GameSession(
            patient_id=patient.id,
            client_session_id=s.client_session_id,
            game_type=s.game_type,
            difficulty_level=s.difficulty_level,
            accuracy=s.accuracy,
            avg_latency_ms=s.avg_latency_ms,
            error_rate=s.error_rate,
            performance_score=score,
            client_timestamp=s.client_timestamp,
            raw_payload=s.raw_payload,
        ).insert()
        accepted_sessions += 1
        await update_bandit(patient.id, s.game_type, s.difficulty_level, score)

    accepted_voice = 0
    for v in payload.voice_interactions:
        if await VoiceInteraction.find_one(VoiceInteraction.client_session_id == v.client_session_id):
            continue
        nlu = classify(v.transcript or "")
        await VoiceInteraction(
            patient_id=patient.id,
            client_session_id=v.client_session_id,
            transcript=v.transcript,
            language=v.language,
            intent=nlu["intent"],
            entities=nlu["entities"],
            confidence=nlu["confidence"],
            client_timestamp=v.client_timestamp,
        ).insert()
        accepted_voice += 1

    alerts_triggered = await run_anomaly_check(patient.id)

    return SyncBatchOut(
        accepted_game_sessions=accepted_sessions,
        accepted_voice_interactions=accepted_voice,
        alerts_triggered=alerts_triggered,
    )
