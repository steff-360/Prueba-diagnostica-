import {
  createApplicationService,
  listApplicationsService,
  updateApplicationStatusService
} from '../services/applicationService.js';
import { errors } from '../errors/domainErrors.js';
import {
  validateApplicationFilters,
  validateCreateApplication,
  validateStatusUpdate
} from '../validators/applicationValidator.js';

export async function createApplicationController(req, res) {
  validateCreateApplication(req.body);

  const application = await createApplicationService({
    candidateId: Number(req.body.candidateId),
    vacancyId: Number(req.body.vacancyId),
    source: req.body.source,
    coverLetter: req.body.coverLetter
  });

  return res.status(201).json({
    data: application
  });
}

export async function listApplicationsController(req, res) {
  validateApplicationFilters(req.query);

  const applications = await listApplicationsService({
    status: req.query.status,
    vacancyId: req.query.vacancyId
      ? Number(req.query.vacancyId)
      : undefined
  });

  return res.status(200).json({
    data: applications
  });
}

export async function updateApplicationStatusController(req, res) {
  validateStatusUpdate(req.body);
  const applicationId = Number(req.params.id);

  if (!Number.isInteger(applicationId) || applicationId <= 0) {
    // Mensaje traducido al español
    throw errors.invalidRequest('El ID de la solicitud debe ser un entero positivo.');
  }

  const application = await updateApplicationStatusService(
    applicationId,
    req.body.status
  );

  return res.status(200).json({
    data: application
  });
}
