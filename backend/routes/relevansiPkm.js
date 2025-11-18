import express from 'express';
import {
  getData,
  createData,
  updateData,
  deleteData,
  importExcel
} from '../controllers/relevansiPkmController.js'; // pastikan ini controller PKM
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST — import Excel (HARUS PALING ATAS sebelum "/:id")
router.post('/import', authenticateToken, importExcel);

// GET data per subtab ?subtab=xxx
router.get('/', authenticateToken, getData);

// POST — tambah data baru
router.post('/', authenticateToken, createData);

// PUT — update data by ID
router.put('/:id', authenticateToken, updateData);

// DELETE — hapus data by ID
router.delete('/:id', authenticateToken, deleteData);

export default router;
