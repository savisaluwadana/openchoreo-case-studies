# Course & Student Management Portal

A three-tier educational management application built with **Angular 17**, **Django 4.2 (Python)**, and **PostgreSQL**, deployed on [OpenChoreo](https://choreo.dev).

This example showcases how to deploy a Python (Django) backend as a **Service** component using a **Dockerfile** buildpack on OpenChoreo, connect it to a managed PostgreSQL database, and serve an Angular SPA as a **Web Application** component.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       OpenChoreo                            │
│                                                             │
│  ┌──────────────────┐       ┌───────────────────────────┐  │
│  │  Web Application │──────▶│     Service (Backend)     │  │
│  │  Angular 17 SPA  │       │  Django 4.2 + DRF + Gunicorn│ │
│  │  (port 8080)     │       │  (port 8080)              │  │
│  └──────────────────┘       └────────────┬──────────────┘  │
│                                          │ Connection       │
│                                 ┌────────▼──────────┐      │
│                                 │  Managed PostgreSQL │      │
│                                 │  (Aiven / Choreo)  │      │
│                                 └────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

| Layer    | Technology          | OpenChoreo Component |
|----------|---------------------|----------------------|
| Frontend | Angular 17          | Web Application      |
| Backend  | Django 4.2 + DRF    | Service              |
| Database | PostgreSQL 15       | Choreo-managed DB    |

---

## Features

- **Course management** — Create, list, and delete courses with code, title, instructor, and description
- **Student registry** — Register students with ID, name, and email
- **Enrollment** — Enroll students in courses; view enrolled students per course and courses per student
- **Grade management** — Update individual enrollment grades via REST API
- **Health endpoint** — `/api/v1/health/` for readiness probes
- **CORS-enabled API** — Ready for cross-origin Angular frontend consumption

---

## Project Structure

```
course-student-portal/
├── backend/
│   ├── portal/
│   │   ├── settings.py         # Django settings (reads Choreo env vars)
│   │   ├── urls.py             # Root URL routing
│   │   └── wsgi.py
│   ├── courses/
│   │   ├── models.py           # Course, Student, Enrollment models
│   │   ├── serializers.py      # DRF serializers
│   │   ├── views.py            # ViewSets + custom actions
│   │   └── urls.py             # Router + health endpoint
│   ├── manage.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── app.module.ts
│   │   │   ├── app.component.ts
│   │   │   ├── portal.service.ts       # HttpClient API calls
│   │   │   └── components/
│   │   │       ├── courses/            # Course list + enrollment UI
│   │   │       └── students/           # Student list + course view
│   │   ├── main.ts
│   │   ├── index.html
│   │   └── styles.css
│   ├── angular.json
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
└── database/
    └── init.sql                # Schema + seed data
```

---

## API Reference

Base URL: `https://<backend-invoke-url>/api/v1/`

### Courses

| Method | Path                        | Description                     |
|--------|-----------------------------|---------------------------------|
| GET    | `/courses/`                 | List all courses                |
| POST   | `/courses/`                 | Create a course                 |
| GET    | `/courses/{id}/`            | Get a single course             |
| PUT    | `/courses/{id}/`            | Update a course                 |
| DELETE | `/courses/{id}/`            | Delete a course                 |
| GET    | `/courses/{id}/students/`   | List students enrolled in course|

### Students

| Method | Path                         | Description                    |
|--------|------------------------------|--------------------------------|
| GET    | `/students/`                 | List all students              |
| POST   | `/students/`                 | Register a student             |
| GET    | `/students/{id}/`            | Get a single student           |
| PUT    | `/students/{id}/`            | Update student details         |
| DELETE | `/students/{id}/`            | Delete a student               |
| GET    | `/students/{id}/courses/`    | List courses a student attends |

### Enrollments

| Method | Path                              | Description           |
|--------|-----------------------------------|-----------------------|
| GET    | `/enrollments/`                   | List all enrollments  |
| POST   | `/enrollments/`                   | Enroll student        |
| GET    | `/enrollments/{id}/`              | Get enrollment        |
| DELETE | `/enrollments/{id}/`              | Remove enrollment     |
| PATCH  | `/enrollments/{id}/grade/`        | Update grade          |

### Health

| Method | Path          | Description       |
|--------|---------------|-------------------|
| GET    | `/health/`    | Readiness check   |

---

## Local Development

### Prerequisites
- Python 3.12+
- Node.js 20+
- PostgreSQL 15+
- Angular CLI: `npm install -g @angular/cli`

### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv && source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export CHOREO_PORTAL_DB_HOSTNAME=localhost
export CHOREO_PORTAL_DB_PORT=5432
export CHOREO_PORTAL_DB_DBNAME=portaldb
export CHOREO_PORTAL_DB_USERNAME=postgres
export CHOREO_PORTAL_DB_PASSWORD=password
export DJANGO_SECRET_KEY=dev-secret-key-change-in-production
export DEBUG=True
export ALLOWED_HOSTS=localhost,127.0.0.1

# Apply database schema
psql -U postgres -d portaldb -f ../database/init.sql

# Run migrations (Django auto-detects existing schema)
python manage.py migrate --run-syncdb

# Start development server
python manage.py runserver 8080
```

### Frontend

```bash
cd frontend

npm install

# Point to local backend
export NG_APP_API_URL=http://localhost:8080

ng serve --port 4200
```

Open `http://localhost:4200`.

---

## Deploy on OpenChoreo

### Step 1 — Fork / Push to GitHub

Push this repository to your GitHub account. Choreo requires a GitHub connection to pull source code.

### Step 2 — Create a Project

1. Log in to [console.choreo.dev](https://console.choreo.dev)
2. Click **+ Create Project**
3. Name it `course-portal` and click **Create**

### Step 3 — Provision PostgreSQL Database

1. In your project, go to **Dependencies → Databases**
2. Click **+ Create** → **PostgreSQL**
3. Name it `portal-db`, choose a region, and click **Create**
4. Wait until the status shows **Active** (takes 2–5 minutes)
5. Click **Publish to Marketplace** so the backend can connect to it

### Step 4 — Initialize the Database Schema

Use the Choreo **Cloud Shell** or a local `psql` client with the connection string from the database dashboard:

```bash
psql "postgresql://<user>:<password>@<host>:<port>/defaultdb?sslmode=require" \
  -f database/init.sql
```

### Step 5 — Create the Backend Service

1. In your project, click **+ Create Component**
2. Select **Service**
3. Fill in:
   - **Name**: `portal-backend`
   - **Repository**: your GitHub repo URL
   - **Branch**: `main`
   - **Component Directory**: `Examples/education/course-student-portal/backend`
   - **Build Pack**: **Dockerfile** (Choreo auto-detects the `Dockerfile`)
4. Click **Create**

> **Note:** Do NOT manually create `.choreo/component.yaml`. OpenChoreo generates this automatically when you create the component through the console.

### Step 6 — Connect Backend to Database

1. Select the `portal-backend` component
2. Go to **Dependencies → Connections**
3. Click **+ Add Connection**
4. Choose **Database → portal-db**
5. Accept the default connection name (e.g., `CHOREO_PORTAL_DB`)
6. Click **Add**

Choreo will inject these environment variables into the backend at runtime:
- `CHOREO_PORTAL_DB_HOSTNAME`
- `CHOREO_PORTAL_DB_PORT`
- `CHOREO_PORTAL_DB_DBNAME`
- `CHOREO_PORTAL_DB_USERNAME`
- `CHOREO_PORTAL_DB_PASSWORD`

### Step 7 — Set Backend Environment Variables

1. Go to **DevOps → Configs & Secrets** for `portal-backend`
2. Click **+ Create**
3. Add the following as **Config Map** (plain text):

| Key              | Value                     |
|------------------|---------------------------|
| `DEBUG`          | `False`                   |
| `ALLOWED_HOSTS`  | `*`                       |

4. Add the following as **Secret**:

| Key                | Value                                      |
|--------------------|--------------------------------------------|
| `DJANGO_SECRET_KEY`| *(generate with `openssl rand -hex 32`)*  |

5. Click **Save** → **Build & Deploy**

### Step 8 — Build and Deploy the Backend

1. Go to the **Build** tab of `portal-backend`
2. Click **Build Latest Commit**
3. Wait for the build to complete (watch the build logs for any errors)
4. Go to the **Deploy** tab → **Development** environment
5. Click **Deploy**
6. Wait for the status to show **Active**

### Step 9 — Note the Backend Invoke URL

1. In the **Deploy** tab, expand the **Development** endpoint
2. Copy the **Invoke URL** (e.g., `https://abc123-dev.choreoapps.dev`)
3. Keep it for the frontend configuration step

### Step 10 — Generate a Test Key (optional, for API testing)

1. Go to **Test → Swagger Console**
2. Click **Get Test Key**
3. Use the key in the `Test-Key` header when calling the API

### Step 11 — Create the Frontend Web Application

1. Click **+ Create Component** in the project
2. Select **Web Application**
3. Fill in:
   - **Name**: `portal-frontend`
   - **Repository**: same GitHub repo URL
   - **Branch**: `main`
   - **Component Directory**: `Examples/education/course-student-portal/frontend`
   - **Build Pack**: **Dockerfile**
4. Click **Create**

### Step 12 — Configure the Frontend API URL

The Angular frontend reads `window.configs.apiUrl` at runtime (injected by Choreo managed auth) or falls back to the `CHOREO_API_URL` environment variable.

1. Go to **DevOps → Configs & Secrets** for `portal-frontend`
2. Click **+ Create** → **Config Map** → **Environment Variables**
3. Add:

| Key               | Value                                      |
|-------------------|--------------------------------------------|
| `CHOREO_API_URL`  | *(Backend invoke URL from Step 9)*        |

4. Click **Save**

> **Tip:** If you enable **Managed Auth** on the web app, Choreo injects `window.configs.apiUrl` automatically and you don't need the env var.

### Step 13 — Build and Deploy the Frontend

1. Go to the **Build** tab of `portal-frontend`
2. Click **Build Latest Commit**
3. After the build succeeds, click **Deploy** in the **Deploy** tab
4. Once **Active**, copy the **Web App URL**

### Step 14 — Test the Application

Open the **Web App URL** in your browser. You should see the Course & Student Portal with navigation for Courses and Students.

Try:
1. Create a course (e.g., Code: `CS101`, Title: `Intro to CS`, Instructor: `Dr. Smith`)
2. Register a student (e.g., ID: `S2024001`, Jane Doe, `jane@uni.edu`)
3. Click **View Students** on the course → Enroll Jane → Confirm she appears

---

## Promote to Production

1. Open the **Deploy** tab for both `portal-backend` and `portal-frontend`
2. Click **Promote** → **Production**
3. Verify both components are **Active** in the Production environment

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| Build fails with `ModuleNotFoundError` | Missing package in `requirements.txt` | Add the package and rebuild |
| `500 Internal Server Error` on all API calls | DB connection env vars not set | Check **Connections** → verify DB is published and connected |
| `CORS` error in browser | `ALLOWED_HOSTS` or CORS misconfigured | Set `ALLOWED_HOSTS=*` and ensure `django-cors-headers` is installed |
| Angular build fails | `@angular/cli` not in devDependencies | Check `package.json` and `angular.json` output path |
| Frontend shows blank page | Nginx `try_files` misconfigured | Ensure Dockerfile `nginx.conf` has `try_files $uri /index.html` |
| `django.db.utils.OperationalError` | Wrong DB credentials or DB not ready | Wait for DB to become Active, recheck connection env vars |

---

## Key OpenChoreo Concepts Demonstrated

| Concept | Implementation |
|---------|---------------|
| **Python / Dockerfile buildpack** | Django app packaged with a `Dockerfile` using `python:3.12-slim` |
| **Service component** | Django REST Framework API exposed as an internal Service |
| **Web Application component** | Angular 17 SPA served via nginx on port 8080 |
| **Managed Database connection** | PostgreSQL connection injected as `CHOREO_PORTAL_DB_*` env vars |
| **Config Maps** | Non-sensitive config (`DEBUG`, `ALLOWED_HOSTS`) stored as Config Map |
| **Secrets** | `DJANGO_SECRET_KEY` stored as a Choreo Secret |
| **Endpoint visibility** | Backend Service exposed to the Web App within the same project |
