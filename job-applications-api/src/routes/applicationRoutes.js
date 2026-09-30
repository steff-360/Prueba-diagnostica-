import { Router } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import {
  createApplicationController,
  listApplicationsController,
  updateApplicationStatusController
} from '../controllers/applicationController.js';

const router = Router();

router.post('/applications', asyncHandler(createApplicationController));
router.get('/applications', asyncHandler(listApplicationsController));
router.put(
  '/applications/:id/status',
  asyncHandler(updateApplicationStatusController)
);

export default router;
