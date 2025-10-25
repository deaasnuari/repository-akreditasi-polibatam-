import express from 'express';
import {
  getData,
  createData,
  updateData,
  deleteData,
  importExcel
} from '../controllers/relevansiPenelitianController.js';

const router = express.Router();

// GET all data by subtab ?type=xxx
router.get('/', getData);

// POST — tambah data baru
router.post('/', createData);

// PUT — update data by ID
router.put('/:id', updateData);

// DELETE — hapus data by ID
router.delete('/:id', deleteData);

// POST — import Excel
router.post('/import', importExcel);

export default router;
