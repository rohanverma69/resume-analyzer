import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))


class Config:
    """Base application configuration."""
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-careerai-super-secret-key-replace-in-production-32chars")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-careerai-jwt-secret-key-replace-in-production-32c")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=int(os.getenv("JWT_EXPIRY_HOURS", "24")))

    # Database
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        f"sqlite:///{os.path.join(BASE_DIR, 'careerai.db')}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_recycle": 280,
        "pool_pre_ping": True,
    } if not SQLALCHEMY_DATABASE_URI.startswith("sqlite") else {}

    # File uploads
    MAX_CONTENT_LENGTH = 5 * 1024 * 1024  # 5 MB maximum
    ALLOWED_EXTENSIONS = {"pdf", "docx"}

    # CORS & Security
    CORS_ORIGINS = [
        origin.strip()
        for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000").split(",")
        if origin.strip()
    ]

    # Rate Limiting
    RATELIMIT_DEFAULT = os.getenv("RATELIMIT_DEFAULT", "200 per day;50 per hour")
    RATELIMIT_STORAGE_URI = os.getenv("RATELIMIT_STORAGE_URI", "memory://")
    RATELIMIT_STRATEGY = "fixed-window"

    # Environment
    ENV = os.getenv("FLASK_ENV", "development")
    DEBUG = False
    TESTING = False


class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG = True
    ENV = "development"
    RATELIMIT_ENABLED = False


class TestingConfig(Config):
    """Testing configuration."""
    TESTING = True
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    RATELIMIT_ENABLED = False
    SECRET_KEY = "test-secret-key-careerai-testing-mode-only"
    JWT_SECRET_KEY = "test-jwt-secret-key-careerai-testing-mode-only"


class ProductionConfig(Config):
    """Production configuration with strict security validations."""
    DEBUG = False
    TESTING = False
    ENV = "production"

    @classmethod
    def validate(cls):
        """Enforce strict production checks."""
        insecure_keys = {
            "dev-careerai-super-secret-key-replace-in-production-32chars",
            "dev-careerai-jwt-secret-key-replace-in-production-32c",
            "secret", "changeme", "password", "123456"
        }
        secret = os.getenv("SECRET_KEY")
        if not secret or secret in insecure_keys or len(secret) < 32:
            raise ValueError(
                "CRITICAL SECURITY CONFIGURATION ERROR: "
                "In production mode, SECRET_KEY must be set in the environment and must be at least 32 characters long."
            )

        jwt_secret = os.getenv("JWT_SECRET_KEY")
        if not jwt_secret or jwt_secret in insecure_keys or len(jwt_secret) < 32:
            raise ValueError(
                "CRITICAL SECURITY CONFIGURATION ERROR: "
                "In production mode, JWT_SECRET_KEY must be set in the environment and must be at least 32 characters long."
            )


config_by_name = {
    "development": DevelopmentConfig,
    "testing": TestingConfig,
    "production": ProductionConfig,
}
