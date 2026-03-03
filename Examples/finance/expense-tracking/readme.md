# 💳 Expense Tracking & Reporting — Example for OpenChoreo

This example demonstrates a JVM-based backend (Spring Boot), a Vue.js frontend, and a MySQL stateful database on OpenChoreo. It shows how to model expense CRUD, basic reporting, and how to wire a MySQL Connection in OpenChoreo.

Structure

```
expense-tracking/
├── readme.md
├── backend/
│   ├── pom.xml
│   ├── src/
│   │   └── main/java/com/example/expense/  (Spring Boot app)
│   └── Dockerfile
├── frontend/
│   ├── package.json
│   ├── src/
│   │   ├── main.js
│   │   └── App.vue
│   └── Dockerfile
└── database/
    └── init.sql
```

Quickstart (local)

1. Start MySQL locally and initialize schema (example credentials used below):

```bash
docker run -d --name expense-mysql -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=expenses -e MYSQL_USER=expense_user -e MYSQL_PASSWORD=expense_pass -p 3306:3306 mysql:8
sleep 6
mysql -h 127.0.0.1 -P 3306 -u root -proot expenses < Examples/finance/expense-tracking/database/init.sql
```

2. Build and run the Spring Boot backend (env vars point to MySQL):

```bash
cd Examples/finance/expense-tracking/backend
# build with maven
mvn -q package -DskipTests
# run with env vars
export SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/expenses
export SPRING_DATASOURCE_USERNAME=expense_user
export SPRING_DATASOURCE_PASSWORD=expense_pass
java -jar target/expense-backend-1.0.0.jar
```

3. Run frontend (Vue):

```bash
cd Examples/finance/expense-tracking/frontend
npm install
export VITE_API_URL=http://localhost:8080
npm run dev
```

OpenChoreo notes

- Push this folder to your repo and create:
  - A MySQL stateful database (name: `expenses-db`)
  - A Service component for the backend (`expense-backend`) — use the `backend/` directory and Dockerfile
  - A Web Application component for the frontend (`expense-frontend`) — use the `frontend/` directory and Dockerfile
- Create a Connection from `expense-backend` and `expense-frontend` to the managed MySQL database so the backend receives DB credentials via injected env vars.
- Use `networkVisibility: Project` for internal-only APIs.

Files of interest
- `backend/src/main/java/.../ExpenseController.java` — CRUD and reporting endpoints
- `database/init.sql` — creates `expenses` table and seed data
