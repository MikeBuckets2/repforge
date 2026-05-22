import { Router } from 'express';
import { body } from 'express-validator';
import { getProfile, updateProfile } from '../controllers/profileController.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = Router();

router.use(requireAuth);
router.get('/', asyncHandler(getProfile));
router.patch(
  '/',
  [
    body('name').optional().trim().isLength({ min: 2, max: 80 }),
    body('experienceLevel').optional().isIn(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
    body('preferredUnits').optional().isIn(['imperial', 'metric']),
    body('trainingDays').optional().isArray({ max: 7 }),
    body('goalFocus').optional().isIn(['STRENGTH', 'MUSCLE_GAIN', 'FAT_LOSS', 'RUNNING_ENDURANCE', 'GENERAL_HEALTH']),
    body('heightCm').optional({ nullable: true, checkFalsy: true }).isFloat({ min: 50, max: 260 }),
    body('weightKg').optional({ nullable: true, checkFalsy: true }).isFloat({ min: 20, max: 350 })
  ],
  validateRequest,
  asyncHandler(updateProfile)
);

export default router;
