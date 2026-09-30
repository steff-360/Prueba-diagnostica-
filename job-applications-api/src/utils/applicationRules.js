export function calculateScore({
  candidateYearsExperience,
  vacancyMinYearsExperience,
  source,
  coverLetter,
  activeApplicationsInOtherVacancies
}) {
  let score = 0;

  if (candidateYearsExperience >= vacancyMinYearsExperience) {
    score += 4;
  }

  if (source === 'REFERRAL') {
    score += 3;
  } else if (source === 'INTERNAL') {
    score += 2;
  }

  const normalizedCoverLetter = coverLetter.toLocaleLowerCase();
  const containsTechnicalKeyword = /\b(node|sql|api)\b/i.test(normalizedCoverLetter);

  if (containsTechnicalKeyword) {
    score += 2;
  }

  if (coverLetter.length > 500) {
    score += 1;
  }

  if (activeApplicationsInOtherVacancies >= 3) {
    score -= 2;
  }

  return Math.max(0, score);
}

export function calculatePriority(score) {
  if (score <= 2) {
    return 'LOW';
  }

  if (score <= 4) {
    return 'MEDIUM';
  }

  if (score <= 6) {
    return 'HIGH';
  }

  return 'TOP';
}
