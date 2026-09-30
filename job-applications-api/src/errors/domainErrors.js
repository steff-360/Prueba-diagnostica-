import { AppError } from './AppError.js';

export const errors = {
  candidateNotFound: () =>
    new AppError('CANDIDATE_NOT_FOUND', 'Candidate not found.', 404),

  vacancyNotFound: () =>
    new AppError('VACANCY_NOT_FOUND', 'Vacancy not found.', 404),

  vacancyClosed: () =>
    new AppError('VACANCY_CLOSED', 'The vacancy is closed and does not accept applications.', 409),

  applicationNotFound: () =>
    new AppError('APPLICATION_NOT_FOUND', 'Application not found.', 404),

  duplicateApplication: () =>
    new AppError('DUPLICATE_APPLICATION', 'The candidate cannot apply to this vacancy under the current application rules.', 409),

  finalApplicationStatus: () =>
    new AppError('FINAL_APPLICATION_STATUS', 'A REJECTED or HIRED application cannot change status.', 409),

  invalidSource: () =>
    new AppError('INVALID_SOURCE', 'The application source is invalid.', 400),

  invalidStatus: () =>
    new AppError('INVALID_STATUS', 'The application status is invalid.', 400),

  invalidRequest: (message) =>
    new AppError('INVALID_REQUEST', message, 400)
};
