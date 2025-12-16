import express from 'express';
import { getAllLEDData, saveLEDTab, deleteLEDTab, saveDraft, exportCombinedLED } from '../controllers/ledController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/led/export?userId=...&role=... - export gabungan LED untuk user tertentu
router.get('/export', exportCombinedLED);

// GET /api/led/:user_id - ambil semua data LED untuk user tertentu
router.get('/:user_id', getAllLEDData);

// POST /api/led/savedraft - save draft and link to Bukti Pendukung
// Note: Keep static routes before dynamic parameter routes to avoid accidental matches
router.post('/savedraft', authenticateToken, saveDraft);

// POST /api/led/:user_id - save/update LED tab untuk user tertentu
router.post('/:user_id', saveLEDTab);

// DELETE /api/led/:user_id/:subtab - hapus LED tab untuk user tertentu
router.delete('/:user_id/:subtab', deleteLEDTab);

export default router;
