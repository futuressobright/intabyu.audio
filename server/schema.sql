-- schema.sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email CHARACTER VARYING,
    google_id CHARACTER VARYING,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name CHARACTER VARYING,
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_modified TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES categories(id),
    text TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE recordings (
    id SERIAL PRIMARY KEY,
    question_id INTEGER REFERENCES questions(id),
    audio_url TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_modified TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    duration NUMERIC
);

-- Add indexes
CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_questions_category_id ON questions(category_id);
CREATE INDEX idx_recordings_question_id ON recordings(question_id);
