import { Router } from 'express';
import { body, param, query } from 'express-validator';
import {
  createWorkout,
  deleteWorkout,
  duplicateWorkout,
  getWorkout,
  listWorkouts,
  updateWorkout
} from '../controllers/workoutController.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = Router();

const workoutValidators = [
  body('title').trim().isLength({ min: 2, max: 120 }),
  body('planId').optional({ nullable: true }).isString(),
  body('status').optional().isIn(['PLANNED', 'COMPLETED', 'SKIPPED']),
  body('scheduledFor').optional({ nullable: true, checkFalsy: true }).isISO8601(),
  body('completedAt').optional({ nullable: true, checkFalsy: true }).isISO8601(),
  body('durationMinutes').optional({ nullable: true, checkFalsy: true }).isInt({ min: 0, max: 1440 }),
  body('perceivedExertion').optional({ nullable: true, checkFalsy: true }).isInt({ min: 1, max: 10 }),
  body('recoveryScore').optional({ nullable: true, checkFalsy: true }).isInt({ min: 1, max: 100 }),
  body('bodyWeight').optional({ nullable: true, checkFalsy: true }).isFloat({ min: 0, max: 1000 }),
  body('intensity').optional({ nullable: true }).isIn(['EASY', 'MODERATE', 'HARD', 'MAX']),
  body('note').optional({ nullable: true }).trim().isLength({ max: 1200 }),
  body('exercises').isArray({ min: 1, max: 40 }),
  body('exercises.*.exerciseId').isString().notEmpty(),
  body('exercises.*.notes').optional({ nullable: true }).trim().isLength({ max: 500 }),
  body('exercises.*.sets').isArray({ min: 1, max: 20 }),
  body('exercises.*.sets.*.setNumber').optional().isInt({ min: 1, max: 50 }),
  body('exercises.*.sets.*.reps').optional({ nullable: true, checkFalsy: true }).isInt({ min: 0, max: 1000 }),
  body('exercises.*.sets.*.weight').optional({ nullable: true, checkFalsy: true }).isFloat({ min: 0, max: 2000 }),
  body('exercises.*.sets.*.distance').optional({ nullable: true, checkFalsy: true }).isFloat({ min: 0, max: 500 }),
  body('exercises.*.sets.*.durationSeconds').optional({ nullable: true, checkFalsy: true }).isInt({ min: 0, max: 86400 }),
  body('exercises.*.sets.*.intensity').optional({ nullable: true }).isIn(['EASY', 'MODERATE', 'HARD', 'MAX']),
  body('exercises.*.sets.*.completed').optional().isBoolean()
];

router.use(requireAuth);
router.get('/', [query('limit').optional().isInt({ min: 1, max: 100 })], validateRequest, asyncHandler(listWorkouts));
router.get('/:id', [param('id').isString().notEmpty()], validateRequest, asyncHandler(getWorkout));
router.post('/', workoutValidators, validateRequest, asyncHandler(createWorkout));
router.put('/:id', [param('id').isString().notEmpty(), ...workoutValidators], validateRequest, asyncHandler(updateWorkout));
router.post('/:id/duplicate', [param('id').isString().notEmpty()], validateRequest, asyncHandler(duplicateWorkout));
router.delete('/:id', [param('id').isString().notEmpty()], validateRequest, asyncHandler(deleteWorkout));

export default router;
