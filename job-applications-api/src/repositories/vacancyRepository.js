export async function findVacancyById(client, vacancyId) {
  const result = await client.query(
    `SELECT id, title, min_years_experience, status
     FROM vacancies
     WHERE id = $1`,
    [vacancyId]
  );

  return result.rows[0] ?? null;
}
