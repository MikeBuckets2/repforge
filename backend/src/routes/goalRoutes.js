import { Router } from 'express';
import { body, param } from 'express-validator';
import { createGoal, deleteGoal, listGoals, updateGoal } from '../controllers/goalController.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = Router();
const goalTypes = ['STRENGTH', 'MUSCLE_GAIN', 'FAT_LOSS', 'RUNNING_ENDURANCE', 'GENERAL_HEALTH'];

const goalValidators = (partial = false) => {
  const maybe = (chain) => (partial ? chain.optional() : chain);

  return [
    maybe(body('title')).trim().isLength({ min: 3, max: 120 }),
    maybe(body('type')).isIn(goalTypes),
    body('targetValue').optional({ nullable: true, checkFalsy: true }).isFloat({ min: 0 }),
    body('currentValue').optional({ nullable: true, checkFalsy: true }).isFloat({ min: 0 }),
    body('unit').optional({ nullable: true }).trim().isLength({ max: 30 }),
    body('deadline').optional({ nullable: true, checkFalsy: true }).isISO8601(),
    body('status').optional().isIn(['ACTIVE', 'COMPLETED', 'PAUSED']),
    body('milestones').optional({ nullable: true }).isArray({ max: 8 })
  ];
};

router.use(requireAuth);
router.get('/', asyncHandler(listGoals));
router.post('/', goalValidators(), validateRequest, asyncHandler(createGoal));
router.patch(
  '/:id',
  [param('id').isString().notEmpty(), ...goalValidators(true)],
  validateRequest,
  asyncHandler(updateGoal)
);
router.delete('/:id', [param('id').isString().notEmpty()], validateRequest, asyncHandler(deleteGoal));

export default router;
