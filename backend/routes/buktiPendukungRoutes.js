import express from 'express';
import { createOrUpdateBuktiPendukung, getBuktiPendukungForUser } from '../controllers/buktiPendukungController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route   POST /api/bukti-pendukung
 * @desc    Membuat atau memperbarui entri bukti pendukung (misalnya, saat 'Save Draft')
 * @access  Private (memerlukan otentikasi)
 */
router.post('/', authenticateToken, createOrUpdateBuktiPendukung);

/**
 * @route   GET /api/bukti-pendukung
 * @desc    Mengambil semua data bukti pendukung untuk user yang sedang login
 * @access  Private
 */
router.get('/', authenticateToken, getBuktiPendukungForUser);


export default router;
