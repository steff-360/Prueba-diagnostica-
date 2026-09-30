-- PostgreSQL database schema and seed data
-- Execute this script against an existing PostgreSQL database.
-- Example:
-- psql -U postgres -d job_applications -f database.sql

BEGIN;

DROP TABLE IF EXISTS applications;
DROP TABLE IF EXISTS vacancies;
DROP TABLE IF EXISTS candidates;

CREATE TABLE candidates (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(254) NOT NULL UNIQUE,
    years_experience NUMERIC(4,1) NOT NULL DEFAULT 0,
    CONSTRAINT candidates_name_not_blank CHECK (btrim(name) <> ''),
    CONSTRAINT candidates_email_not_blank CHECK (btrim(email) <> ''),
    CONSTRAINT candidates_years_experience_valid CHECK (years_experience >= 0)
);

CREATE TABLE vacancies (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    min_years_experience NUMERIC(4,1) NOT NULL DEFAULT 0,
    status VARCHAR(10) NOT NULL DEFAULT 'OPEN',
    CONSTRAINT vacancies_title_not_blank CHECK (btrim(title) <> ''),
    CONSTRAINT vacancies_min_experience_valid CHECK (min_years_experience >= 0),
    CONSTRAINT vacancies_status_valid CHECK (status IN ('OPEN', 'CLOSED'))
);

CREATE TABLE applications (
    id BIGSERIAL PRIMARY KEY,
    candidate_id BIGINT NOT NULL,
    vacancy_id BIGINT NOT NULL,
    cover_letter TEXT NOT NULL,
    source VARCHAR(20) NOT NULL,
    score INTEGER NOT NULL,
    priority VARCHAR(10) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'RECEIVED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_status_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT applications_candidate_fk
        FOREIGN KEY (candidate_id)
        REFERENCES candidates(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT applications_vacancy_fk
        FOREIGN KEY (vacancy_id)
        REFERENCES vacancies(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT applications_cover_letter_not_blank CHECK (btrim(cover_letter) <> ''),
    CONSTRAINT applications_source_valid CHECK (
        source IN ('REFERRAL', 'INTERNAL', 'JOB_BOARD', 'OTHER')
    ),
    CONSTRAINT applications_score_valid CHECK (score >= 0),
    CONSTRAINT applications_priority_valid CHECK (
        priority IN ('LOW', 'MEDIUM', 'HIGH', 'TOP')
    ),
    CONSTRAINT applications_status_valid CHECK (
        status IN ('RECEIVED', 'IN_REVIEW', 'REJECTED', 'HIRED')
    )
);

CREATE INDEX idx_applications_candidate_id
    ON applications(candidate_id);

CREATE INDEX idx_applications_vacancy_id
    ON applications(vacancy_id);

CREATE INDEX idx_applications_status
    ON applications(status);

CREATE INDEX idx_applications_score_created_at
    ON applications(score DESC, created_at ASC);

CREATE INDEX idx_applications_candidate_vacancy
    ON applications(candidate_id, vacancy_id);

INSERT INTO candidates (name, email, years_experience) VALUES
    ('Ana López', 'ana.lopez@example.com', 4),
    ('Carlos Méndez', 'carlos.mendez@example.com', 2),
    ('María García', 'maria.garcia@example.com', 6);

INSERT INTO vacancies (title, min_years_experience, status) VALUES
    ('Backend Node.js Developer', 3, 'OPEN'),
    ('Database Support Specialist', 2, 'CLOSED');

COMMIT;
