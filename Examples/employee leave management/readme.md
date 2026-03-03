# 🗓️ Employee Leave Management — Example for OpenChoreo

A compact Employee Leave Management example that demonstrates:
- A Next.js frontend (Web Application)
- An Express.js backend API (Service)
- A PostgreSQL-managed stateful database
- A Scheduled Task (cron) component that sends leave reminders

This example focuses on wiring a scheduled task into your OpenChoreo project to send reminders to approvers and employees about upcoming leaves.

Project layout

```
employee leave management/
├── readme.md
├── frontend/
│   ├── package.json
│   ├── pages/
│   │   └── index.js
│   ├── public/
│   │   └── config.js
│   └── Dockerfile
├── backend/
│   ├── package.json
│   ├── src/
│   │   ├── index.js
│   │   ├── routes/leaves.js
│   │   └── db/client.js
│   └── Dockerfile
├── scheduler/
│   ├── package.json
│   ├── src/index.js
│   └── Dockerfile
└── database/
    └── init.sql
```

Quick overview
- The backend exposes `/api/v1/leaves` for CRUD and approval flows.
- The scheduler runs periodically (configurable) and sends reminders for upcoming leave start dates.
- The DB init script creates a `leaves` table with necessary fields.

Prerequisites
- OpenChoreo account and project
- A PostgreSQL instance (managed via OpenChoreo Stateful resources)
- Git repo to push the `frontend/`, `backend/`, and `scheduler/` directories

Database initialization
1. Provision a PostgreSQL database in OpenChoreo (name: `leave-db`).
2. Once active, run:

```bash
psql "postgres://<USER>:<PASSWORD>@<HOST>:<PORT>/<DBNAME>?sslmode=require" -f database/init.sql
```

Scheduler behavior
- The scheduler looks for leave requests in `APPROVED` status that are starting within the configured timeframe (default: next-day) and sends reminders to `approver_email` and optionally `employee_email`.
- In OpenChoreo, implement the scheduler as a Scheduled Task component and point it to the `scheduler/` directory. Configure environment variables (database connection + SMTP) via a Connection and Secrets.

Next steps
- Push `backend/`, `frontend/`, and `scheduler/` to your repository and create the components in OpenChoreo (Service, Web Application, Scheduled Task).
- Create a Connection from the Service and the Scheduled Task to the managed `leave-db` database.
- (Optional) Configure SMTP as a secret or use a 3rd-party email connection from the marketplace.

See the example code under each folder for implementation details.

Additional notes
- The backend includes an `openapi.yaml` file under `backend/` which you can attach to an API Proxy during component creation to provide an interactive API console.
- There's a simple smoke-test script at `backend/test.sh` that creates a sample leave request; it uses `jq` for pretty output (install via `brew install jq`).

---

**OpenChoreo Deployment (detailed)**

This section walks through deploying the example to OpenChoreo: creating the managed PostgreSQL database, creating components (Service, Web Application, Scheduled Task), wiring Connections and Secrets, and verifying the deployment.

- IMPORTANT: Follow the two-stage workflow — first push your code and implement everything in your repository (Development stage). Do NOT perform any destructive OpenChoreo operations unless you intend to deploy. Creating components in the OpenChoreo Console will generate `.choreo/component.yaml` files automatically. Do not create those files manually.

1) Prepare your repository

 - Push the `backend/`, `frontend/`, and `scheduler/` directories to a Git repository accessible by OpenChoreo (GitHub, GitLab, Bitbucket).
 - Ensure `backend/openapi.yaml` is present in the `backend/` directory (this will be used for API console and proxy configuration).

2) Provision the managed PostgreSQL database

 - Console: OpenChoreo Console → Your Project → Stateful → + Create → Select **PostgreSQL**
     - **Name:** `leave-db`
     - **Region:** choose appropriate
     - **Service Plan:** `startup-4` (dev) or `business-4` (prod)
 - Wait until the database status is **Active** (provisioning takes ~5–10 minutes).
 - Optional: Publish the database to the Marketplace (Stateful → leave-db → Publish to Marketplace) so it can be selected by other components.

3) Initialize the database schema

 - Retrieve connection info from the Console (Stateful → `leave-db` → Connection Info).
 - Run the SQL init script locally if desired or use the DB access method provided by the Console.

```bash
psql "postgres://<USER>:<PASSWORD>@<HOST>:<PORT>/<DBNAME>?sslmode=require" -f Examples/employee\ leave\ management/database/init.sql
```

4) Create the Service component (Express backend)

 - Console: OpenChoreo Console → Your Project → + Create Component → **Service**
     - **Name:** `leave-backend`
     - **Repository:** your repo URL
     - **Branch:** `main` (or branch name)
     - **Component Directory:** `Examples/employee leave management/backend/` (exact relative path)
     - **Buildpack / Build Method:** `Dockerfile`
 - After creation, OpenChoreo will auto-generate `.choreo/component.yaml` in your repo (do not hand-edit unless you understand the schema).
 - Verify the generated `.choreo/component.yaml` exposes the correct port (8080) and context path if needed.

5) Attach the OpenAPI spec (optional but recommended)

 - In the Service component settings, attach or upload `backend/openapi.yaml` so OpenChoreo can show an interactive API Console and use it when creating API Proxies.

6) Create the Web Application component (Next.js frontend)

 - Console: OpenChoreo Console → Your Project → + Create Component → **Web Application**
     - **Name:** `leave-frontend`
     - **Repository:** your repo URL
     - **Branch:** `main`
     - **Component Directory:** `Examples/employee leave management/frontend/`
     - **Buildpack / Build Method:** `Dockerfile`
     - **Port:** `8080` (matches Dockerfile)
     - **Enable Managed Authentication:** enable if you plan to protect the app with Choreo-managed auth (recommended for real demos)

7) Create the Scheduled Task component (scheduler)

 - Console: OpenChoreo Console → Your Project → + Create Component → **Scheduled Task**
     - **Name:** `leave-reminder-scheduler`
     - **Repository:** your repo URL
     - **Branch:** `main`
     - **Component Directory:** `Examples/employee leave management/scheduler/`
     - **Buildpack / Build Method:** `Dockerfile`
     - **Schedule / Cron Expression:** set to the desired schedule (example: run daily at 08:00 `0 8 * * *`)

8) Create Connections (DB) and Secrets (SMTP)

 - In the OpenChoreo Console, open the `leave-backend` component → **Connections → + Add Connection** → choose the `leave-db` database from the Marketplace and save. This injects env vars like `CHOREO_LEAVE_DB_HOSTNAME`, `CHOREO_LEAVE_DB_USERNAME`, `CHOREO_LEAVE_DB_PASSWORD`, etc.
 - Repeat the same for the `leave-reminder-scheduler` component so the scheduler can access the database.
 - For SMTP credentials (if using real email): create a **Secret** or use a Marketplace email integration. Add env vars to the scheduler component:

    - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_SECURE` (true/false), `NOTIFY_FROM`

 - If you prefer to stub emails for testing, leave SMTP unset and the scheduler will log messages to the container output.

9) Build & Deploy

 - For each component (Service, Web App, Scheduled Task):
     - Open the component → **Build & Deploy** → click **Build**
     - After the build completes, click **Deploy** to the **Development** environment
 - Verify each component shows an **Active** deployment in the Deployments tab.

10) Generate Test Keys and Verify

 - For the Service, generate a Test Key: `leave-backend` → Test → Generate Test Key. Use the `Test-Key` header to call the API from outside the project for initial verification.

Example health check curl (replace with your invoke URL):

```bash
curl -H "Test-Key: <your-test-key>" https://<backend-invoke-url>/health
# Expected: {"status":"ok"}
```

Example API call (create a leave):

```bash
curl -X POST https://<backend-invoke-url>/api/v1/leaves \
    -H "Content-Type: application/json" \
    -H "Test-Key: <your-test-key>" \
    -d '{"employee_id":"emp-1","start_date":"2026-04-01","end_date":"2026-04-03","approver_email":"manager@example.com"}'
```

11) Frontend runtime configuration

 - The frontend reads the backend URL from `window.configs.apiUrl` which OpenChoreo injects at runtime when you create a WebApp Connection to the backend service. After creating a Connection from `leave-frontend` → Connections → + Add Connection → choose **Services → leave-backend**, the runtime config script will be populated automatically.

12) Promoting to Production

 - Once validated in Development, promote builds to Production via the Console (each component → Build & Deploy → Promote).
 - For production workloads, provision a separate production database (e.g., `leave-db-prod`) and create a new Connection scoped to the Production environment. Do not reuse your Development database for production traffic.

13) Troubleshooting checklist

 - Backend pod crashes on startup: verify the Connection is present and env vars are injected; redeploy the component.
 - `ECONNREFUSED` to DB: ensure `CHOREO_LEAVE_DB_HOSTNAME` is set to the Choreo-provided hostname (not `localhost`).
 - Scheduler not sending emails: verify SMTP secrets or check logs for stubbed message output.
 - OpenAPI console not available: ensure `backend/openapi.yaml` is attached to the Service component and re-deploy.

14) Security & best practices

 - Store all sensitive credentials (DB passwords, SMTP creds) as Secrets — do not hardcode them in code or config files.
 - Use `networkVisibility: Project` for internal services to avoid exposing internal APIs publicly.
 - Enable Managed Authentication for the WebApp if the app requires user login; follow the Managed Auth checklist in the main OpenChoreo docs (redirect URIs, script tag for `public/config.js`, login/logout paths).

If you'd like, I can generate a step-by-step OpenChoreo Console walkthrough (screenshots and exact menu clicks), or prepare CI pipeline snippets to automatically build and deploy these components from GitHub Actions.

