from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    APP_NAME: str = "Cognitive Assist API"
    MONGODB_URL: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "cognitive_assist"

    # Self-hosted auth — credentials live in MongoDB, sessions are JWTs
    # signed with this secret. Override via env in any real deployment.
    JWT_SECRET_KEY: str = "change-me-to-a-long-random-string"
    JWT_ALGORITHM: str = "HS256"
    CAREGIVER_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day
    PATIENT_TOKEN_EXPIRE_DAYS: int = 365  # a paired tablet stays signed in long-term

    # Pillar 3 thresholds
    ALERT_ACCURACY_DROP_THRESHOLD: float = 0.25
    DRIFT_WINDOW_SHORT_DAYS: int = 7
    DRIFT_WINDOW_LONG_DAYS: int = 30

    # Pillar 1: performance score weights S = w1*Accuracy - w2*AvgLatency - w3*ErrorRate
    W1_ACCURACY: float = 1.0
    W2_LATENCY: float = 0.4
    W3_ERROR_RATE: float = 0.6
    S_LOW_THRESHOLD: float = 0.4
    S_HIGH_THRESHOLD: float = 0.8


settings = Settings()
