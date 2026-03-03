-- MySQL schema for invoices
CREATE DATABASE IF NOT EXISTS invoices;
USE invoices;

CREATE TABLE IF NOT EXISTS invoices (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  invoice_number VARCHAR(64) NOT NULL,
  customer_name VARCHAR(255),
  customer_email VARCHAR(255),
  amount DECIMAL(12,2) NOT NULL,
  due_date DATE,
  status VARCHAR(32) DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO invoices (invoice_number, customer_name, customer_email, amount, due_date)
VALUES ('INV-1001','ACME Corp','acct@acme.example', 1200.00, '2026-04-15');
