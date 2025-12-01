import express from 'express';
import { getAllLEDData, saveLEDTab, deleteLEDTab } from '../controllers/ledController.js';

const router = express.Router();

// GET /api/led/:user_id - ambil semua data LED untuk user tertentu
router.get('/:user_id', getAllLEDData);

// POST /api/led/:user_id - save/update LED tab untuk user tertentu
router.post('/:user_id', saveLEDTab);

// DELETE /api/led/:user_id/:subtab - hapus LED tab untuk user tertentu
router.delete('/:user_id/:subtab', deleteLEDTab);

export default router;
