-- PostgreSQL schema for Quiz & Assessment Platform
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS quizzes (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    created_at  TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS questions (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id    UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    text       TEXT NOT NULL,
    options    JSONB NOT NULL,      -- ["Option A","Option B","Option C","Option D"]
    answer_idx INTEGER NOT NULL,    -- index into options array
    points     INTEGER DEFAULT 1,
    position   INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS sessions (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id      UUID NOT NULL REFERENCES quizzes(id),
    participant  VARCHAR(128) NOT NULL,
    score        INTEGER DEFAULT 0,
    total        INTEGER DEFAULT 0,
    finished     BOOLEAN DEFAULT FALSE,
    started_at   TIMESTAMPTZ DEFAULT NOW(),
    finished_at  TIMESTAMPTZ
);

-- Seed
INSERT INTO quizzes (id, title, description) VALUES
  ('11111111-1111-1111-1111-111111111111', 'General Knowledge', 'A quick GK quiz')
ON CONFLICT DO NOTHING;

INSERT INTO questions (quiz_id, text, options, answer_idx, points, position) VALUES
  ('11111111-1111-1111-1111-111111111111', 'What is the capital of France?',
   '["Berlin","Madrid","Paris","Rome"]', 2, 1, 0),
  ('11111111-1111-1111-1111-111111111111', 'Which planet is closest to the Sun?',
   '["Venus","Mercury","Earth","Mars"]', 1, 1, 1)
ON CONFLICT DO NOTHING;
