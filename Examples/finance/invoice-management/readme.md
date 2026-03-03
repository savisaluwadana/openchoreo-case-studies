# 🧾 Invoice Management System — Example for OpenChoreo

This example demonstrates invoice creation, PDF generation, and a scheduled payment reminder job. It uses a Node.js backend (Express + PDFKit), a Vue.js frontend, a MySQL database, and a scheduler (node-cron) to trigger reminders.

Structure

```
invoice-management/
├── readme.md
├── backend/
│   ├── package.json
   ├── src/
   │   ├── index.js
   │   └── routes/invoices.js
   └── Dockerfile
├── scheduler/
│   ├── package.json
│   └── src/index.js
├── frontend/
│   ├── package.json
│   └── src/
│       ├── main.js
│       └── App.vue
└── database/
    └── init.sql
```

Quickstart (local)

1. Start MySQL and initialize schema:

```bash
docker run -d --name invoice-mysql -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=invoices -e MYSQL_USER=invoice_user -e MYSQL_PASSWORD=invoice_pass -p 3307:3306 mysql:8
sleep 6
mysql -h 127.0.0.1 -P 3307 -u root -proot invoices < Examples/finance/invoice-management/database/init.sql
```

2. Run backend:

```bash
cd Examples/finance/invoice-management/backend
npm install
export DB_HOST=localhost
export DB_PORT=3307
export DB_NAME=invoices
export DB_USER=invoice_user
export DB_PASSWORD=invoice_pass
node src/index.js
```

3. Run scheduler (will stub emails if SMTP not configured):

```bash
cd Examples/finance/invoice-management/scheduler
npm install
export DB_HOST=localhost
export DB_PORT=3307
export DB_NAME=invoices
export DB_USER=invoice_user
export DB_PASSWORD=invoice_pass
node src/index.js
```

OpenChoreo notes

- Create a MySQL stateful DB (`invoices-db`), push this folder and create components:
  - `invoice-backend` (Service)
  - `invoice-frontend` (WebApp)
  - `invoice-reminder-scheduler` (Scheduled Task)
- Connect `invoice-backend` and `invoice-reminder-scheduler` to the MySQL database via Connections; create Secret for SMTP if you want real emails.
