import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

SECRET_KEY = os.getenv("SECRET_KEY", "django-insecure-aura-travel-dev-key-2026")
DEBUG = os.getenv("DEBUG", "True") == "True"
ALLOWED_HOSTS = ["*"]

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "corsheaders",
    "apps.core",
    "apps.trips",
    "apps.travel",
    "apps.ai",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"
WSGI_APPLICATION = "config.wsgi.application"

TEMPLATES = [{
    "BACKEND": "django.template.backends.django.DjangoTemplates",
    "DIRS": [],
    "APP_DIRS": True,
    "OPTIONS": {"context_processors": [
        "django.template.context_processors.debug",
        "django.template.context_processors.request",
        "django.contrib.auth.context_processors.auth",
        "django.contrib.messages.context_processors.messages",
    ]},
}]

DATABASES = {"default": {"ENGINE": "django.db.backends.sqlite3", "NAME": BASE_DIR / "db.sqlite3"}}
_db_url = os.getenv("DATABASE_URL", "sqlite")
if _db_url and _db_url.startswith("postgres"):
    import urllib.parse as _up
    _u = _up.urlparse(_db_url)
    DATABASES = {"default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": _u.path.lstrip("/"),
        "USER": _u.username, "PASSWORD": _u.password,
        "HOST": _u.hostname, "PORT": _u.port or 5432,
    }}

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_TZ = True
STATIC_URL = "static/"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [],
    "DEFAULT_PERMISSION_CLASSES": ("rest_framework.permissions.AllowAny",),
}

CORS_ALLOW_ALL_ORIGINS = True
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OSM_PLACES = os.getenv("OSM_PLACES", "0") == "1"
DEMO_MODE = not bool(os.getenv("OPENAI_API_KEY", "").strip())
