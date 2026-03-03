-- PostgreSQL schema for Course & Student Management Portal
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS courses (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code        VARCHAR(32)  UNIQUE NOT NULL,
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    instructor  VARCHAR(255),
    created_at  TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS students (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id  VARCHAR(64)  UNIQUE NOT NULL,
    first_name  VARCHAR(128) NOT NULL,
    last_name   VARCHAR(128) NOT NULL,
    email       VARCHAR(255) UNIQUE NOT NULL,
    created_at  TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS enrollments (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id  UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    grade      VARCHAR(4),
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (course_id, student_id)
);

-- Seed data
INSERT INTO courses (code, title, description, instructor) VALUES
  ('CS101', 'Intro to Computer Science', 'Fundamentals of programming and algorithms', 'Prof. Smith'),
  ('MATH201', 'Calculus I', 'Limits, derivatives, and integrals', 'Prof. Johnson'),
  ('ENG101', 'Academic Writing', 'Essay structure and research skills', 'Prof. Lee')
ON CONFLICT DO NOTHING;

INSERT INTO students (student_id, first_name, last_name, email) VALUES
  ('STU-001', 'Alice', 'Walker', 'alice@example.edu'),
  ('STU-002', 'Bob', 'Chen', 'bob@example.edu')
ON CONFLICT DO NOTHING;
