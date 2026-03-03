#!/usr/bin/env bash
# Simple smoke tests for the leave backend. Ensure backend is running on $1 or http://localhost:8080
BASE=${1:-http://localhost:8080}
echo "Using base URL: $BASE"

echo "GET /api/v1/leaves"
curl -sS -X GET "$BASE/api/v1/leaves" | jq || true

echo "POST /api/v1/leaves (create)"
PAYLOAD=$(cat <<JSON
{
  "employee_id": "emp-123",
  "employee_email": "employee@example.com",
  "start_date": "2026-04-01",
  "end_date": "2026-04-05",
  "reason": "Vacation",
  "approver_email": "manager@example.com"
}
JSON
)
curl -sS -X POST -H "Content-Type: application/json" -d "$PAYLOAD" "$BASE/api/v1/leaves" | jq || true

echo "Done. Use the returned id to call other endpoints manually."
