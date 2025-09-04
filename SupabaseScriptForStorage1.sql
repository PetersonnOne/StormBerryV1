-- Education tables
CREATE TABLE education_lessons (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  level INTEGER,
  topic TEXT,
  timestamp BIGINT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE education_quizzes (
  id SERIAL PRIMARY KEY,
  questions JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Story tables
CREATE TABLE stories (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  title TEXT,
  genre TEXT,
  synopsis TEXT,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE characters (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT,
  description TEXT,
  background TEXT,
  personality TEXT,
  image_url TEXT,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE worlds (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  history TEXT,
  magic_system TEXT,
  technology TEXT,
  locations JSONB,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Workflow tables
CREATE TABLE workflows (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  steps JSONB NOT NULL,
  data JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE document_analyses (
  id SERIAL PRIMARY KEY,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  analysis_result JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE transcripts (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE transcript_summaries (
  id SERIAL PRIMARY KEY,
  transcript_id INTEGER REFERENCES transcripts(id),
  summary_result JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);