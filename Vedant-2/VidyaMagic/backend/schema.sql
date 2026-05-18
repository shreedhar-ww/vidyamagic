-- VidyaMagic database schema
-- Run: psql -d vidyamagic -f schema.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── USERS (parents) ──
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email       TEXT UNIQUE NOT NULL,
  phone       TEXT,
  password    TEXT NOT NULL,
  plan        TEXT DEFAULT 'free',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── KIDS ──
CREATE TABLE IF NOT EXISTS kids (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  age             INT,
  grade           INT,
  theme           TEXT DEFAULT 'magic',
  current_streak  INT DEFAULT 0,
  total_stars     INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── PROGRESS (per kid × topic aggregate) ──
CREATE TABLE IF NOT EXISTS progress (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kid_id          UUID REFERENCES kids(id) ON DELETE CASCADE,
  subject         TEXT NOT NULL,
  topic           TEXT NOT NULL,
  current_level   INT DEFAULT 1,
  sections        JSONB DEFAULT '{"learn": false, "stories": false, "quiz": false}'::jsonb,
  stars           INT DEFAULT 0,
  last_played     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(kid_id, subject, topic)
);

-- ── SKILL STATE (adaptive per kid × skill) ──
CREATE TABLE IF NOT EXISTS skill_state (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kid_id          UUID REFERENCES kids(id) ON DELETE CASCADE,
  skill           TEXT NOT NULL,
  difficulty      INT DEFAULT 1,
  mastery         REAL DEFAULT 0,
  streak          INT DEFAULT 0,
  last_results    JSONB DEFAULT '[]'::jsonb,
  total_attempts  INT DEFAULT 0,
  total_correct   INT DEFAULT 0,
  weak_spots      JSONB DEFAULT '[]'::jsonb,
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(kid_id, skill)
);

-- ── ATTEMPTS (every answered question) ──
CREATE TABLE IF NOT EXISTS attempts (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kid_id        UUID REFERENCES kids(id) ON DELETE CASCADE,
  subject       TEXT NOT NULL,
  topic         TEXT NOT NULL,
  skill         TEXT NOT NULL,
  difficulty    INT,
  question      TEXT,
  answer_given  TEXT,
  is_correct    BOOLEAN,
  time_taken    REAL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── PAYMENTS ──
CREATE TABLE IF NOT EXISTS payments (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  amount       INT,                    -- in paise
  plan         TEXT,
  razorpay_id  TEXT,
  status       TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── INDEXES ──
CREATE INDEX IF NOT EXISTS idx_attempts_kid_skill ON attempts(kid_id, skill, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_progress_kid ON progress(kid_id);
CREATE INDEX IF NOT EXISTS idx_skill_state_kid ON skill_state(kid_id);
