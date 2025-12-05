import express from 'express';
import {
  getData,
  createData,
  updateData,
  deleteData,
  importExcel,
  getDistinctProdi, // Import the new function
  saveDraft // NEW
} from '../controllers/relevansiPendidikanController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST — import Excel (HARUS PALING ATAS sebelum "/:id")
router.post('/import', authenticateToken, importExcel);

// GET unique prodi options
router.get('/distinct-prodi', authenticateToken, getDistinctProdi); // New route

// GET all data by subtab ?subtab=xxx
router.get('/', authenticateToken, getData);

// POST — tambah data baru
router.post('/', authenticateToken, createData);

// PUT — update data by ID
router.put('/:id', authenticateToken, updateData);

// DELETE — hapus data by ID
router.delete('/:id', authenticateToken, deleteData);

// === Draft Route ===
router.post("/draft", authenticateToken, saveDraft);

export default router;
