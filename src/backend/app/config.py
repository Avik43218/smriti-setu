from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    APP_NAME: str = "Cognitive Assist API"
    MONGODB_URL: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "cognitive_assist"
    FIREBASE_CREDENTIALS_PATH: str = "firebase-service-account.json"

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
