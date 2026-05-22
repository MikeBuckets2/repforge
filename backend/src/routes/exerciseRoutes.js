import { Router } from 'express';
import { body, query } from 'express-validator';
import { createExercise, listExercises } from '../controllers/exerciseController.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = Router();

router.use(requireAuth);
router.get(
  '/',
  [
    query('search').optional().trim().isLength({ max: 80 }),
    query('category').optional().isIn(['STRENGTH', 'CARDIO', 'MOBILITY', 'RECOVERY']),
    query('muscle').optional().trim().isLength({ max: 60 }),
    query('equipment').optional().trim().isLength({ max: 60 })
  ],
  validateRequest,
  asyncHandler(listExercises)
);
router.post(
  '/',
  [
    body('name').trim().isLength({ min: 2, max: 120 }),
    body('category').isIn(['STRENGTH', 'CARDIO', 'MOBILITY', 'RECOVERY']),
    body('primaryMuscle').trim().isLength({ min: 2, max: 80 }),
    body('equipment').trim().isLength({ min: 2, max: 80 }),
    body('instructions').optional().trim().isLength({ max: 800 })
  ],
  validateRequest,
  asyncHandler(createExercise)
);

export default router;
