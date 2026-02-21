import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "FleetFlow API"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "Smart Fleet Management Backend"

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./fleetflow.db")

    # JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "fleetflow-super-secret-key-change-in-production-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # CORS
    CORS_ORIGINS: list = ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"]

    # Predictive Maintenance Thresholds
    OIL_CHANGE_KM: int = 10000
    TIRE_ROTATION_KM: int = 15000
    BRAKE_CHECK_KM: int = 25000
    FULL_INSPECTION_KM: int = 50000

settings = Settings()
