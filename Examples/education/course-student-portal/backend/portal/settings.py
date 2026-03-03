"""
Django settings for the Course & Student Management Portal.
Reads configuration from environment variables (injected by OpenChoreo Connections/Secrets).
"""
from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', 'change-me-in-production')
DEBUG = os.environ.get('DEBUG', 'False') == 'True'
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '*').split(',')

INSTALLED_APPS = [
    'django.contrib.contenttypes',
    'django.contrib.auth',
    'corsheaders',
    'rest_framework',
    'courses',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
]

ROOT_URLCONF = 'portal.urls'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        # OpenChoreo injects these env vars when a DB Connection is added
        'HOST':     os.environ.get('CHOREO_PORTAL_DB_HOSTNAME', 'localhost'),
        'PORT':     os.environ.get('CHOREO_PORTAL_DB_PORT', '5432'),
        'NAME':     os.environ.get('CHOREO_PORTAL_DB_DBNAME', 'portal'),
        'USER':     os.environ.get('CHOREO_PORTAL_DB_USERNAME', 'postgres'),
        'PASSWORD': os.environ.get('CHOREO_PORTAL_DB_PASSWORD', ''),
        'OPTIONS':  {'sslmode': 'require'},
    }
}

REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': ['rest_framework.renderers.JSONRenderer'],
}

CORS_ALLOW_ALL_ORIGINS = True
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
