export async function findCandidateById(client, candidateId) {
  const result = await client.query(
    `SELECT id, name, email, years_experience
     FROM candidates
     WHERE id = $1`,
    [candidateId]
  );

  return result.rows[0] ?? null;
}
