FROM python:3.12-slim AS base
WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Collect static (no-op here since we have none, but good practice)
RUN python manage.py collectstatic --noinput 2>/dev/null || true

EXPOSE 8080
# Use gunicorn for production; OpenChoreo will route traffic on port 8080
CMD ["gunicorn", "--bind", "0.0.0.0:8080", "--workers", "2", "portal.wsgi:application"]
