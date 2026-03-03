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
