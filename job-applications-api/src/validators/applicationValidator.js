import {
  APPLICATION_SOURCES,
  APPLICATION_STATUSES
} from '../utils/constants.js';
import { errors } from '../errors/domainErrors.js';
import { isNonEmptyString, isValidId } from '../utils/validation.js';

export function validateCreateApplication(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw errors.invalidRequest('Request body must be a JSON object.');
  }

  const { candidateId, vacancyId, source, coverLetter } = body;

  if (!isValidId(candidateId)) {
    throw errors.invalidRequest('candidateId must be a positive integer.');
  }

  if (!isValidId(vacancyId)) {
    throw errors.invalidRequest('vacancyId must be a positive integer.');
  }

  if (!APPLICATION_SOURCES.includes(source)) {
    throw errors.invalidSource();
  }

  if (!isNonEmptyString(coverLetter)) {
    throw errors.invalidRequest('coverLetter is required and cannot be empty.');
  }
}

export function validateStatusUpdate(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw errors.invalidRequest('Request body must be a JSON object.');
  }

  if (!APPLICATION_STATUSES.includes(body.status)) {
    throw errors.invalidStatus();
  }
}

export function validateApplicationFilters(query) {
  const { status, vacancyId } = query;

  if (status !== undefined && !APPLICATION_STATUSES.includes(status)) {
    throw errors.invalidStatus();
  }

  if (vacancyId !== undefined && !isValidId(vacancyId)) {
    throw errors.invalidRequest('vacancyId must be a positive integer.');
  }
}
