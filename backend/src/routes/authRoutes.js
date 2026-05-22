import { Router } from 'express';
import { body } from 'express-validator';
import { signup, login, guestLogin, me } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { authRateLimiter } from '../middleware/rateLimiters.js';

const router = Router();

const profileValidators = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('name').trim().isLength({ min: 2, max: 80 }).withMessage('Name must be between 2 and 80 characters'),
  body('password').isLength({ min: 8, max: 128 }).withMessage('Password must be at least 8 characters'),
  body('experienceLevel').optional().isIn(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  body('goalFocus').optional().isIn(['STRENGTH', 'MUSCLE_GAIN', 'FAT_LOSS', 'RUNNING_ENDURANCE', 'GENERAL_HEALTH']),
  body('preferredUnits').optional().isIn(['imperial', 'metric']),
  body('trainingDays').optional().isArray({ max: 7 })
];

router.post('/signup', authRateLimiter, profileValidators, validateRequest, asyncHandler(signup));
router.post(
  '/login',
  authRateLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 1, max: 128 }).withMessage('Password is required')
  ],
  validateRequest,
  asyncHandler(login)
);
router.post('/guest', authRateLimiter, asyncHandler(guestLogin));
router.get('/me', requireAuth, asyncHandler(me));

export default router;
