-- MySQL schema for expense-tracking
CREATE DATABASE IF NOT EXISTS expenses;
USE expenses;

CREATE TABLE IF NOT EXISTS expenses (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  employee_id VARCHAR(128) NOT NULL,
  description TEXT,
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(8) DEFAULT 'USD',
  incurred_at DATE NOT NULL,
  category VARCHAR(64),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO expenses (employee_id, description, amount, currency, incurred_at, category)
VALUES
  ('emp-1','Flight to conference', 1200.00,'USD','2026-01-10','Travel'),
  ('emp-2','Client dinner', 230.50,'USD','2026-02-12','Meals');
