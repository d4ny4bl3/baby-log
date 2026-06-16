from .base import *  # noqa: F403,F401

# --- CORS (mobilní Capacitor app, žádný webový frontend) ---

CORS_ALLOW_ALL_ORIGINS = False

CORS_ALLOWED_ORIGINS = [
    "https://localhost",      # Android (androidScheme: https)
    "capacitor://localhost",  # iOS
]

# --- CSRF (jen Django admin přes HTTPS; API jede na JWT) ---

CSRF_TRUSTED_ORIGINS = [
    "https://babylog.cz",
]

# --- HTTPS / proxy (TLS terminuje reverse proxy, např. nginx) ---

SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_SSL_REDIRECT = True

SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
