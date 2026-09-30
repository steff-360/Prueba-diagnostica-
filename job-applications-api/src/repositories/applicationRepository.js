export async function findBlockingApplication(client, candidateId, vacancyId) {
  const result = await client.query(
    `SELECT id, status, created_at, updated_status_at
     FROM applications
     WHERE candidate_id = $1
       AND vacancy_id = $2
       AND status IN ('RECEIVED', 'IN_REVIEW', 'HIRED')
     ORDER BY created_at DESC
     LIMIT 1`,
    [candidateId, vacancyId]
  );

  return result.rows[0] ?? null;
}

export async function findLatestRejectedApplication(client, candidateId, vacancyId) {
  const result = await client.query(
    `SELECT id, status, created_at, updated_status_at
     FROM applications
     WHERE candidate_id = $1
       AND vacancy_id = $2
       AND status = 'REJECTED'
     ORDER BY updated_status_at DESC
     LIMIT 1`,
    [candidateId, vacancyId]
  );

  return result.rows[0] ?? null;
}

export async function countActiveApplicationsInOtherVacancies(client, candidateId, vacancyId) {
  const result = await client.query(
    `SELECT COUNT(*)::int AS count
     FROM applications
     WHERE candidate_id = $1
       AND vacancy_id <> $2
       AND status IN ('RECEIVED', 'IN_REVIEW')`,
    [candidateId, vacancyId]
  );

  return result.rows[0].count;
}

export async function createApplication(client, {
  candidateId,
  vacancyId,
  coverLetter,
  source,
  score,
  priority
}) {
  const result = await client.query(
    `INSERT INTO applications (
       candidate_id,
       vacancy_id,
       cover_letter,
       source,
       score,
       priority,
       status
     )
     VALUES ($1, $2, $3, $4, $5, $6, 'RECEIVED')
     RETURNING
       id,
       candidate_id,
       vacancy_id,
       cover_letter,
       source,
       score,
       priority,
       status,
       created_at,
       updated_status_at`,
    [candidateId, vacancyId, coverLetter, source, score, priority]
  );

  return result.rows[0];
}

export async function findApplicationById(client, applicationId) {
  const result = await client.query(
    `SELECT
       a.id,
       a.candidate_id,
       a.vacancy_id,
       a.cover_letter,
       a.source,
       a.score,
       a.priority,
       a.status,
       a.created_at,
       a.updated_status_at,
       c.name AS candidate_name,
       c.email AS candidate_email,
       v.title AS vacancy_title
     FROM applications a
     INNER JOIN candidates c ON c.id = a.candidate_id
     INNER JOIN vacancies v ON v.id = a.vacancy_id
     WHERE a.id = $1`,
    [applicationId]
  );

  return result.rows[0] ?? null;
}

export async function updateApplicationStatus(client, applicationId, status) {
  const result = await client.query(
    `UPDATE applications
     SET status = $2,
         updated_status_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING
       id,
       candidate_id,
       vacancy_id,
       cover_letter,
       source,
       score,
       priority,
       status,
       created_at,
       updated_status_at`,
    [applicationId, status]
  );

  return result.rows[0] ?? null;
}

export async function listApplications(client, { status, vacancyId }) {
  const values = [];
  const conditions = [];

  if (status) {
    values.push(status);
    conditions.push(`a.status = $${values.length}`);
  }

  if (vacancyId) {
    values.push(vacancyId);
    conditions.push(`a.vacancy_id = $${values.length}`);
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(' AND ')}`
    : '';

  const result = await client.query(
    `SELECT
       a.id,
       a.candidate_id,
       a.vacancy_id,
       a.cover_letter,
       a.source,
       a.score,
       a.priority,
       a.status,
       a.created_at,
       a.updated_status_at,
       c.name AS candidate_name,
       c.email AS candidate_email,
       v.title AS vacancy_title
     FROM applications a
     INNER JOIN candidates c ON c.id = a.candidate_id
     INNER JOIN vacancies v ON v.id = a.vacancy_id
     ${whereClause}
     ORDER BY a.score DESC, a.created_at ASC`,
    values
  );

  return result.rows;
}

export async function lockCandidateVacancyPair(client, candidateId, vacancyId) {
  // Lock the candidate row so concurrent requests for the same candidate
  // serialize duplicate validation even when no application row exists yet.
  await client.query(
    `SELECT id
     FROM candidates
     WHERE id = $1
     FOR UPDATE`,
    [candidateId]
  );

  // Keep the vacancy in the method signature because the lock belongs to
  // the candidate/vacancy business operation and the duplicate query follows.
  void vacancyId;
}
