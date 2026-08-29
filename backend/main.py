import os
from datetime import datetime, timedelta, timezone

from dotenv import load_dotenv
load_dotenv()  # reads variables from a .env file in the same folder

import httpx
from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
import jwt  # PyJWT

# ── Config (fill these from environment variables — see notes below) ──
JWT_SECRET = os.getenv("JWT_SECRET_KEY")  # MUST be set in prod, no default
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "60"))
CLOUDFLARE_TURNSTILE_SECRET_KEY = os.getenv("CLOUDFLARE_TURNSTILE_SECRET_KEY")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "").split(",")  # comma-separated list

if not JWT_SECRET:
    raise RuntimeError("JWT_SECRET_KEY environment variable must be set")
if not CLOUDFLARE_TURNSTILE_SECRET_KEY:
    raise RuntimeError("CLOUDFLARE_TURNSTILE_SECRET_KEY environment variable must be set")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
bearer_scheme = HTTPBearer()

limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title="Cognitive Healthcare Security API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ── CORS: explicit origins only, never "*" when allow_credentials=True ──
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in ALLOWED_ORIGINS if o.strip()],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)

# ── Models ──
class CaregiverLogin(BaseModel):
    email: EmailStr
    password: str
    cf_turnstile_token: str

class GameLog(BaseModel):
    patient_id: str
    game_type: str
    score: int
    response_time_ms: float
    timestamp: datetime

# ── Fake user "database" — REPLACE with your real DB lookup ──
# In real code: query your Postgres/Mongo/etc table by email.
FAKE_USER_DB = {
    "caregiver@example.com": {
        "email": "caregiver@example.com",
        # Generate real hashes with pwd_context.hash("their_password")
        "hashed_password": pwd_context.hash("changeme123"),
        "caregiver_id": "cg_001",
    }
}

# ── Helpers ──
async def verify_turnstile(token: str, remote_ip: str | None = None) -> bool:
    data = {"secret": CLOUDFLARE_TURNSTILE_SECRET_KEY, "response": token}
    if remote_ip:
        data["remoteip"] = remote_ip

    async with httpx.AsyncClient(timeout=5.0) as client:
        try:
            response = await client.post(
                "https://challenges.cloudflare.com/turnstile/v0/siteverify",
                data=data,
            )
            response.raise_for_status()
        except httpx.HTTPError:
            return False
    return response.json().get("success", False)

def create_access_token(caregiver_id: str, email: str) -> str:
    payload = {
        "sub": caregiver_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=JWT_EXPIRE_MINUTES),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def get_current_caregiver(creds: HTTPAuthorizationCredentials = Depends(bearer_scheme)) -> dict:
    token = creds.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    return payload

# ── Routes ──
@app.get("/api/health")
@limiter.limit("30/minute")
async def health_check(request: Request):
    return {"status": "OK", "message": "FastAPI Security Server Running"}

@app.post("/api/auth/login")
@limiter.limit("5/minute")
async def login(request: Request, creds: CaregiverLogin):
    client_ip = get_remote_address(request)
    if not await verify_turnstile(creds.cf_turnstile_token, remote_ip=client_ip):
        raise HTTPException(status_code=400, detail="CAPTCHA verification failed.")

    user = FAKE_USER_DB.get(creds.email)  # REPLACE with real DB query
    if not user or not pwd_context.verify(creds.password, user["hashed_password"]):
        # Same error for "no such user" and "wrong password" — don't leak which
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    token = create_access_token(user["caregiver_id"], user["email"])
    return {"status": "Success", "access_token": token, "token_type": "bearer"}

@app.post("/api/patient/sync")
@limiter.limit("10/minute")
async def sync_patient_log(
    request: Request,
    log: GameLog,
    caregiver: dict = Depends(get_current_caregiver),
):
    # caregiver["sub"] / caregiver["email"] now available if you need
    # to verify this caregiver is actually authorized for this patient_id
    # (e.g. lookup in a caregiver_patient_links table) — REPLACE below:
    #
    # if not caregiver_authorized_for_patient(caregiver["sub"], log.patient_id):
    #     raise HTTPException(status_code=403, detail="Not authorized for this patient.")

    return {"status": "Success", "patient_id": log.patient_id}