from .base import *  # noqa: F403,F401

CORS_ALLOW_ALL_ORIGINS = False

CORS_ORIGIN_WHITELIST = (
    "http://localhost:5173",
    "capacitor://localhost",
    "http://localhost",
)

CSRF_TRUSTED_ORIGINS = (
    "http://localhost:5173",
    "capacitor://localhost",
    "http://localhost",
)
