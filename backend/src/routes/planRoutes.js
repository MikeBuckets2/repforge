import { Router } from 'express';
import { body, param } from 'express-validator';
import { createPlan, deletePlan, listPlans, updatePlan } from '../controllers/planController.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = Router();
const goalTypes = ['STRENGTH', 'MUSCLE_GAIN', 'FAT_LOSS', 'RUNNING_ENDURANCE', 'GENERAL_HEALTH'];

const exerciseValidators = [
  body('exercises').isArray({ min: 1, max: 30 }),
  body('exercises.*.exerciseId').isString().notEmpty(),
  body('exercises.*.dayLabel').trim().isLength({ min: 2, max: 20 }),
  body('exercises.*.targetSets').optional({ nullable: true, checkFalsy: true }).isInt({ min: 1, max: 20 }),
  body('exercises.*.targetReps').optional({ nullable: true, checkFalsy: true }).isInt({ min: 1, max: 100 }),
  body('exercises.*.targetWeight').optional({ nullable: true, checkFalsy: true }).isFloat({ min: 0, max: 2000 }),
  body('exercises.*.targetDistance').optional({ nullable: true, checkFalsy: true }).isFloat({ min: 0, max: 500 }),
  body('exercises.*.targetDuration').optional({ nullable: true, checkFalsy: true }).isInt({ min: 0, max: 86400 })
];

const planValidators = [
  body('name').trim().isLength({ min: 3, max: 120 }),
  body('description').optional({ nullable: true }).trim().isLength({ max: 600 }),
  body('goalType').isIn(goalTypes),
  body('daysPerWeek').isInt({ min: 1, max: 7 }),
  body('active').optional().isBoolean(),
  ...exerciseValidators
];

router.use(requireAuth);
router.get('/', asyncHandler(listPlans));
router.post('/', planValidators, validateRequest, asyncHandler(createPlan));
router.put('/:id', [param('id').isString().notEmpty(), ...planValidators], validateRequest, asyncHandler(updatePlan));
router.delete('/:id', [param('id').isString().notEmpty()], validateRequest, asyncHandler(deletePlan));

export default router;
