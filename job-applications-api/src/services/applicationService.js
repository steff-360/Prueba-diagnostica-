import { pool } from '../config/database.js';
import {
  findCandidateById
} from '../repositories/candidateRepository.js';
import {
  findVacancyById
} from '../repositories/vacancyRepository.js';
import {
  findBlockingApplication,
  findLatestRejectedApplication,
  countActiveApplicationsInOtherVacancies,
  createApplication,
  findApplicationById,
  updateApplicationStatus,
  listApplications,
  lockCandidateVacancyPair
} from '../repositories/applicationRepository.js';
import { calculatePriority, calculateScore } from '../utils/applicationRules.js';
import { FINAL_APPLICATION_STATUSES } from '../utils/constants.js';
import { errors } from '../errors/domainErrors.js';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

function canReapplyAfterRejection(rejectedAt, now = Date.now()) {
  return now - new Date(rejectedAt).getTime() >= THIRTY_DAYS_MS;
}

export async function createApplicationService(input) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const candidate = await findCandidateById(client, input.candidateId);

    if (!candidate) {
      throw errors.candidateNotFound();
    }

    const vacancy = await findVacancyById(client, input.vacancyId);

    if (!vacancy) {
      throw errors.vacancyNotFound();
    }

    if (vacancy.status !== 'OPEN') {
      throw errors.vacancyClosed();
    }

    await lockCandidateVacancyPair(client, input.candidateId, input.vacancyId);

    const blockingApplication = await findBlockingApplication(
      client,
      input.candidateId,
      input.vacancyId
    );

    if (blockingApplication) {
      throw errors.duplicateApplication();
    }

    const latestRejectedApplication = await findLatestRejectedApplication(
      client,
      input.candidateId,
      input.vacancyId
    );

    if (
      latestRejectedApplication &&
      !canReapplyAfterRejection(latestRejectedApplication.updated_status_at)
    ) {
      throw errors.duplicateApplication();
    }

    const activeApplicationsInOtherVacancies =
      await countActiveApplicationsInOtherVacancies(
        client,
        input.candidateId,
        input.vacancyId
      );

    const score = calculateScore({
      candidateYearsExperience: Number(candidate.years_experience),
      vacancyMinYearsExperience: Number(vacancy.min_years_experience),
      source: input.source,
      coverLetter: input.coverLetter,
      activeApplicationsInOtherVacancies
    });

    const priority = calculatePriority(score);

    const application = await createApplication(client, {
      ...input,
      score,
      priority
    });

    await client.query('COMMIT');

    return application;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function listApplicationsService(filters) {
  const client = await pool.connect();

  try {
    return await listApplications(client, filters);
  } finally {
    client.release();
  }
}

export async function updateApplicationStatusService(applicationId, status) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const application = await findApplicationById(client, applicationId);

    if (!application) {
      throw errors.applicationNotFound();
    }

    if (FINAL_APPLICATION_STATUSES.includes(application.status)) {
      throw errors.finalApplicationStatus();
    }

    const updated = await updateApplicationStatus(
      client,
      applicationId,
      status
    );

    await client.query('COMMIT');

    return updated;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
