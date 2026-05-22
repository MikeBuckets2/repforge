import { Router } from 'express';
import { getProgress, getRecords, getSummary } from '../controllers/analyticsController.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

router.use(requireAuth);
router.get('/summary', asyncHandler(getSummary));
router.get('/progress', asyncHandler(getProgress));
router.get('/records', asyncHandler(getRecords));

export default router;
