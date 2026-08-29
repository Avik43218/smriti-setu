"""Caregiver Portal API: patient roster + the dashboard chart data
(daily task completion rate, longitudinal performance), computed with a
Mongo aggregation pipeline rather than pulling every session into Python."""
import uuid
from typing import List

from fastapi import APIRouter, Depends

from app.core.security import require_caregiver
from app.models.session import GameSession
from app.models.user import User
from app.schemas.auth import UserOut

router = APIRouter(prefix="/caregiver", tags=["caregiver"])


@router.get("/patients", response_model=List[UserOut])
async def list_patients(caregiver: User = Depends(require_caregiver)):
    return await User.find(User.caregiver_id == caregiver.id).to_list()


@router.get("/dashboard/{patient_id}")
async def dashboard(patient_id: uuid.UUID, caregiver: User = Depends(require_caregiver)):
    pipeline = [
        {"$match": {"patient_id": patient_id}},
        {
            "$group": {
                "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$client_timestamp"}},
                "avg_score": {"$avg": "$performance_score"},
                "sessions": {"$sum": 1},
            }
        },
        {"$sort": {"_id": 1}},
    ]
    rows = await GameSession.find(GameSession.patient_id == patient_id).aggregate(pipeline).to_list()
    return [{"day": r["_id"], "avg_score": r["avg_score"], "sessions": r["sessions"]} for r in rows]
