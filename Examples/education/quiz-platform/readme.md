# Quiz & Assessment Platform

A real-time quiz platform built with **Angular 17**, **Node.js + WebSocket (`ws`)**, and **PostgreSQL**, deployed on [OpenChoreo](https://choreo.dev).

This example demonstrates how to deploy a **WebSocket Service** component on OpenChoreo — a Node.js server that handles both standard HTTP REST endpoints and a persistent WebSocket connection for real-time quiz scoring, all on the same port.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         OpenChoreo                              │
│                                                                 │
│  ┌──────────────────┐         ┌─────────────────────────────┐  │
│  │  Web Application │─ REST ─▶│    Service (Backend)        │  │
│  │  Angular 17 SPA  │─ WS ──▶ │  Express + ws WebSocket     │  │
│  │  (port 8080)     │         │  (port 8080)                │  │
│  └──────────────────┘         └──────────────┬──────────────┘  │
│                                              │ Connection       │
│                                     ┌────────▼──────────┐      │
│                                     │  Managed PostgreSQL │      │
│                                     │  (Aiven / Choreo)  │      │
│                                     └────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

| Layer    | Technology                  | OpenChoreo Component |
|----------|-----------------------------|----------------------|
| Frontend | Angular 17                  | Web Application      |
| Backend  | Node.js 20 + Express + `ws` | Service (WebSocket)  |
| Database | PostgreSQL 15               | Choreo-managed DB    |

---

## Features

- **Quiz lobby** — Browse all available quizzes
- **Session creation** — Each participant gets a unique session via REST API
- **Real-time Q&A** — Questions are answered over a persistent WebSocket connection
- **Live scoring** — Score is updated and broadcast after every answer
- **Instant feedback** — Correct/incorrect highlighted immediately after submission
- **Result screen** — Final score displayed when the quiz is finished
- **Multiple participants** — Multiple clients can join the same session; all see score updates

---

## WebSocket Protocol

The backend exposes WebSocket on `ws://<host>/ws`. All messages are JSON.

### Client → Server

| Message type     | Fields                                         | Description                            |
|------------------|------------------------------------------------|----------------------------------------|
| `JOIN`           | `sessionId`, `quizId`                          | Join an existing session               |
| `SUBMIT_ANSWER`  | `sessionId`, `questionId`, `answerIdx` (0-based)| Submit an answer to the current question|
| `FINISH`         | `sessionId`                                    | Mark the session as finished           |

### Server → Client (broadcast to all session participants)

| Message type    | Fields                                                    | Description                 |
|-----------------|-----------------------------------------------------------|-----------------------------|
| `QUIZ_STATE`    | `quiz`, `session`, `currentQuestionIndex`                 | Full quiz state on JOIN     |
| `ANSWER_RESULT` | `correct`, `pointsEarned`, `totalScore`, `participant`    | Result after each answer    |
| `FINISHED`      | `session`                                                 | Quiz completed              |
| `ERROR`         | `message`                                                 | Error response              |

---

## REST API Reference

Base URL: `https://<backend-invoke-url>/api/v1/`

| Method | Path                             | Description                      |
|--------|----------------------------------|----------------------------------|
| GET    | `/quizzes`                       | List all quizzes                 |
| GET    | `/quizzes/:id`                   | Get quiz with questions          |
| POST   | `/quizzes`                       | Create a quiz                    |
| POST   | `/quizzes/:id/sessions`          | Create a participant session     |
| GET    | `/quizzes/:id/sessions`          | List sessions for a quiz         |
| GET    | `/health`                        | Health check                     |

---

## Project Structure

```
quiz-platform/
├── backend/
│   ├── src/
│   │   ├── index.js           # Express + ws server (port 8080)
│   │   ├── db.js              # pg Pool (reads CHOREO_QUIZ_DB_* env vars)
│   │   ├── routes/
│   │   │   └── quizzes.js     # REST routes: quizzes, sessions
│   │   └── ws/
│   │       └── handler.js     # WebSocket message handlers
│   ├── package.json
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── app.module.ts
│   │   │   ├── app.component.ts
│   │   │   ├── quiz.service.ts    # WebSocket client + REST calls
│   │   │   └── components/
│   │   │       └── quiz/
│   │   │           └── quiz.component.ts  # Full quiz UI
│   │   ├── main.ts
│   │   ├── index.html
│   │   └── styles.css
│   ├── angular.json
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
└── database/
    └── init.sql           # quizzes, questions, sessions schema + seed data
```

---

## Local Development

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- Angular CLI: `npm install -g @angular/cli`

### Backend

```bash
cd backend

npm install

export CHOREO_QUIZ_DB_HOSTNAME=localhost
export CHOREO_QUIZ_DB_PORT=5432
export CHOREO_QUIZ_DB_DBNAME=quizdb
export CHOREO_QUIZ_DB_USERNAME=postgres
export CHOREO_QUIZ_DB_PASSWORD=password

# Initialize DB
psql -U postgres -d quizdb -f ../database/init.sql

npm start
# REST: http://localhost:8080/api/v1/quizzes
# WS:   ws://localhost:8080/ws
```

### Frontend

```bash
cd frontend

npm install

# Point to local backend
export CHOREO_API_URL=http://localhost:8080
export CHOREO_WS_URL=ws://localhost:8080

ng serve --port 4200
```

Open `http://localhost:4200`.

---

## Deploy on OpenChoreo

### Step 1 — Fork / Push to GitHub

Push this repository to your GitHub account. OpenChoreo requires a GitHub connection to pull source code.

### Step 2 — Create a Project

1. Log in to [console.choreo.dev](https://console.choreo.dev)
2. Click **+ Create Project**
3. Name it `quiz-platform` and click **Create**

### Step 3 — Provision PostgreSQL Database

1. In your project, go to **Dependencies → Databases**
2. Click **+ Create** → **PostgreSQL**
3. Name it `quiz-db`, select a region, and click **Create**
4. Wait until status shows **Active** (2–5 minutes)
5. Click **Publish to Marketplace**

### Step 4 — Initialize the Database Schema

Use the Choreo Cloud Shell or a local `psql` with the connection string from the database dashboard:

```bash
psql "postgresql://<user>:<password>@<host>:<port>/defaultdb?sslmode=require" \
  -f database/init.sql
```

This creates the `quizzes`, `questions`, and `sessions` tables and inserts seed quiz data.

### Step 5 — Create the Backend Service

1. In your project, click **+ Create Component**
2. Select **Service**
3. Fill in:
   - **Name**: `quiz-backend`
   - **Repository**: your GitHub repo URL
   - **Branch**: `main`
   - **Component Directory**: `Examples/education/quiz-platform/backend`
   - **Build Pack**: **Dockerfile**
4. Click **Create**

> **Important — WebSocket endpoint configuration:**
> After the component is created, go to **Manage → Endpoints**. You will see an endpoint auto-detected on port 8080. Edit it and set **Endpoint Type** to **WebSocket**. This ensures Choreo's API gateway handles the WebSocket upgrade correctly and injects `window.configs.wsUrl` into the frontend.

> **Note:** Do NOT manually create `.choreo/component.yaml`. OpenChoreo generates this automatically.

### Step 6 — Connect Backend to Database

1. Select the `quiz-backend` component
2. Go to **Dependencies → Connections**
3. Click **+ Add Connection** → **Database → quiz-db**
4. Accept the default connection name

Choreo injects these env vars:
- `CHOREO_QUIZ_DB_HOSTNAME`
- `CHOREO_QUIZ_DB_PORT`
- `CHOREO_QUIZ_DB_DBNAME`
- `CHOREO_QUIZ_DB_USERNAME`
- `CHOREO_QUIZ_DB_PASSWORD`

### Step 7 — Build and Deploy the Backend

1. Go to the **Build** tab of `quiz-backend`
2. Click **Build Latest Commit**
3. After the build succeeds, go to **Deploy** → **Development**
4. Click **Deploy** and wait for **Active**
5. Copy the **Invoke URL** from the endpoint details

### Step 8 — Test the WebSocket API

Generate a test key and connect to the WebSocket endpoint:

```bash
# Install wscat if needed
npm install -g wscat

# Connect (replace URL and key)
wscat -c "wss://<invoke-url>/ws" -H "Test-Key: <your-test-key>"

# In the wscat prompt, send:
{"type":"JOIN","sessionId":"<session-id>","quizId":"<quiz-id>"}
```

You can create a session via REST first:

```bash
curl -H "Test-Key: <key>" \
  https://<invoke-url>/api/v1/quizzes
```

### Step 9 — Create the Frontend Web Application

1. Click **+ Create Component** → **Web Application**
2. Fill in:
   - **Name**: `quiz-frontend`
   - **Repository**: same GitHub repo URL
   - **Branch**: `main`
   - **Component Directory**: `Examples/education/quiz-platform/frontend`
   - **Build Pack**: **Dockerfile**
3. Click **Create**

### Step 10 — Configure Frontend Environment Variables

1. Go to **DevOps → Configs & Secrets** for `quiz-frontend`
2. Add a **Config Map** with environment variables:

| Key               | Value                                          |
|-------------------|------------------------------------------------|
| `CHOREO_API_URL`  | *(Backend HTTP invoke URL from Step 7)*       |
| `CHOREO_WS_URL`   | *(Backend WS URL — replace `https://` with `wss://`)* |

> **Tip:** If you enable **Managed Auth** on the web app and configure the backend connection, Choreo automatically injects `window.configs.apiUrl` and `window.configs.wsUrl` at runtime — no manual env vars needed.

### Step 11 — Build and Deploy the Frontend

1. Go to the **Build** tab of `quiz-frontend`
2. Click **Build Latest Commit**
3. After success, go to **Deploy** → **Development** → **Deploy**
4. Copy the **Web App URL** once status is **Active**

### Step 12 — Test the Application

1. Open the **Web App URL** in your browser
2. You should see the quiz lobby with the seeded quiz
3. Click **Start**, enter your name, click **Join Quiz**
4. Answer the questions — see real-time score updates
5. Complete the quiz to view the results screen

Open the same URL in a second browser tab to see multiplayer score broadcasting in action.

---

## Promote to Production

1. Go to the **Deploy** tab for both `quiz-backend` and `quiz-frontend`
2. Click **Promote** → **Production**
3. Verify both are **Active** in the Production environment

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| WebSocket connection fails in browser | HTTPS/WSS mismatch | Ensure frontend uses `wss://` not `ws://` in production |
| `404` on `/ws` upgrade | Wrong endpoint type | Set endpoint type to **WebSocket** in Choreo Manage → Endpoints |
| Questions don't load | DB not seeded | Run `init.sql` against the Choreo PostgreSQL instance |
| `ANSWER_RESULT` not received | Client disconnected mid-session | Reconnect and send `JOIN` again |
| Build fails with `npm ERR!` | Missing dependency | Check `package.json` and rebuild |
| Score shows `0` after correct answer | `answer_idx` mismatch in DB | Verify `init.sql` `answer_idx` values are 0-based integers |

---

## Key OpenChoreo Concepts Demonstrated

| Concept | Implementation |
|---------|---------------|
| **WebSocket Service component** | Node.js `ws` server co-located with Express REST on port 8080 |
| **HTTP + WS on same port** | `http.createServer(app)` + `WebSocketServer({ server })` |
| **Real-time broadcast** | Server maintains `sessionId → Set<WebSocket>` map and broadcasts to all clients |
| **Managed Database connection** | PostgreSQL credentials injected as `CHOREO_QUIZ_DB_*` env vars |
| **Angular WebSocket client** | `QuizService` manages native `WebSocket`, exposes RxJS `Subject<WsMessage>` |
| **Runtime URL injection** | Frontend reads `window.configs.wsUrl` (Choreo-injected) with env var fallback |
| **Web Application component** | Angular SPA served via multi-stage Docker build → nginx on port 8080 |
