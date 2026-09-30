import { calculatePriority, calculateScore } from '../src/utils/applicationRules.js';

describe('Application scoring rules', () => {
  test('adds experience, referral and technical keyword points', () => {
    const score = calculateScore({
      candidateYearsExperience: 4,
      vacancyMinYearsExperience: 3,
      source: 'REFERRAL',
      coverLetter: 'I build REST APIs with Node.js and SQL.',
      activeApplicationsInOtherVacancies: 0
    });

    expect(score).toBe(9);
    expect(calculatePriority(score)).toBe('TOP');
  });

  test('technical keyword rule is applied only once and is case-insensitive', () => {
    const score = calculateScore({
      candidateYearsExperience: 0,
      vacancyMinYearsExperience: 5,
      source: 'OTHER',
      coverLetter: 'NODE SQL api Node SQL API',
      activeApplicationsInOtherVacancies: 0
    });

    expect(score).toBe(2);
  });

  test('subtracts two points for three or more active applications in other vacancies', () => {
    const score = calculateScore({
      candidateYearsExperience: 3,
      vacancyMinYearsExperience: 3,
      source: 'OTHER',
      coverLetter: 'No technical keywords here.',
      activeApplicationsInOtherVacancies: 3
    });

    expect(score).toBe(2);
    expect(calculatePriority(score)).toBe('LOW');
  });

  test('never returns a negative score', () => {
    const score = calculateScore({
      candidateYearsExperience: 0,
      vacancyMinYearsExperience: 10,
      source: 'OTHER',
      coverLetter: 'Short',
      activeApplicationsInOtherVacancies: 10
    });

    expect(score).toBe(0);
    expect(calculatePriority(score)).toBe('LOW');
  });

  test('adds one point when the cover letter has more than 500 characters', () => {
    const coverLetter = 'a'.repeat(501);

    const score = calculateScore({
      candidateYearsExperience: 0,
      vacancyMinYearsExperience: 1,
      source: 'OTHER',
      coverLetter,
      activeApplicationsInOtherVacancies: 0
    });

    expect(score).toBe(1);
  });
});

describe('Priority ranges', () => {
  test.each([
    [0, 'LOW'],
    [2, 'LOW'],
    [3, 'MEDIUM'],
    [4, 'MEDIUM'],
    [5, 'HIGH'],
    [6, 'HIGH'],
    [7, 'TOP'],
    [20, 'TOP']
  ])('score %i maps to %s', (score, priority) => {
    expect(calculatePriority(score)).toBe(priority);
  });
});
