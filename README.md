# Smriti Setu

An offline-first, voice-enabled cognitive & memory assistance platform for
elderly users — built around adaptive brain-training games, conversational
daily check-ins, and caregiver-facing decline detection. Designed for
low-connectivity regions (initial focus: India's North Eastern Region) with
support for regional languages (Assamese, Bengali, Manipuri).

Full technical design lives in [`ARCHITECTURE.md`](./ARCHITECTURE.md); this
README is the map of the repo and how to get the backend running.

## How it works

Two users, one app, two experiences:

- **Caregiver** — a real account (email/password, Google OAuth, or OTP via
  Firebase Auth). Sees longitudinal cognitive-performance charts, task
  completion rates, and alerts through the Caregiver Portal.
- **Patient** — no credentials. A caregiver pairs the patient's tablet once
  via QR code / magic link, which locks it into a simplified, high-contrast
  "Patient Mode" for games and voice check-ins.

Everything the patient does is written locally first (SQLite/IndexedDB) and
synced to the backend in batches whenever connectivity allows, so the app
never hangs offline.

### The 3 AI Pillars

| Pillar | What it does | Where |
|---|---|---|
| **1. Dynamic Difficulty** | A UCB1 multi-armed bandit picks each game's difficulty (grid size, timer, distractors) from a running performance score, so challenge level adapts automatically instead of using fixed levels. | [`backend/app/core/bandit.py`](./backend/app/core/bandit.py) |
| **2. Voice AI** | On-device VAD + STT capture speech; the backend extracts structured `{Task, Time, Status}` intent from the transcript for daily recall and reminiscence check-ins. | [`backend/app/core/nlu.py`](./backend/app/core/nlu.py) |
| **3. Predictive Analytics** | Rolling 7-/30-day linear regression tracks cognitive drift; anomaly detection flags same-day accuracy drops or hesitation spikes and raises caregiver alerts. | [`backend/app/core/drift.py`](./backend/app/core/drift.py) |

### Games

Cultural Pattern Matcher (visual memory), Voice Reminiscence & Daily Recall
(episodic memory), Audio-Visual Sound Hunt (auditory processing), and
Sequential Path Tracker (executive function) — see `ARCHITECTURE.md` for
details on each.

## Repo structure

```
cognitive-assist/
  ARCHITECTURE.md          Full system design: data flow, algorithms, auth, tech stack
  docs/
    architecture-diagram.png
  backend/                 FastAPI + MongoDB backend — see backend/README.md
    app/
      main.py, config.py, database.py
      models/               Beanie Documents (Mongo schema)
      schemas/              Pydantic request/response models
      core/                 Pillar 1/2/3 algorithms + auth + alerts (pure logic, DB-agnostic)
      services/             Glue between routes and core/ + DB
      api/routes/           auth, sync, difficulty, voice, analytics, caregiver
    tests/                  Unit tests for the 3 pillars' algorithms
    requirements.txt
    .env.example
```

## Status

| Component | Status |
|---|---|
| Backend API (auth, sync, all 3 pillars, caregiver portal API) | ✅ Scaffolded — see [`backend/README.md`](./backend/README.md) for what's real vs. stubbed |
| Edge app (Flutter/React Native, local SQLite/IndexedDB, background sync worker, on-device VAD/STT/TTS, accessibility UI) | ⏳ Not yet built |
| Caregiver Portal frontend (web dashboard) | ⏳ Not yet built — the API it will call already exists (`GET /caregiver/dashboard/{id}`) |

## Getting started

The backend is the only piece currently implemented:

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # set MONGODB_URL, MONGODB_DB_NAME, FIREBASE_CREDENTIALS_PATH
uvicorn app.main:app --reload
```

Full setup, endpoint list, schema notes, and the stubbed-vs-real breakdown
are in [`backend/README.md`](./backend/README.md).

## Tech stack

- **Backend:** FastAPI, MongoDB (Motor + Beanie), Firebase Auth
- **Client (planned):** Flutter or React Native, SQLite/IndexedDB, Whisper.cpp / cloud STT, regional-accented TTS
- **Algorithms:** UCB1 multi-armed bandit, linear regression drift detection, rule-based NLU (swappable for a trained classifier)

## Next up

1. Scaffold the Flutter/React Native edge app against the sync + difficulty APIs
2. Replace the keyword-based NLU with a trained/cloud intent classifier
3. Build the Caregiver Portal web dashboard
4. Move Pillar 3 recompute off the request path and onto a scheduled worker

