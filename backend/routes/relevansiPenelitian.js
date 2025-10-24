import express from 'express';
import { getData, createData, updateData, deleteData, importExcel } from '../controllers/relevansiPenelitianController.js';

const router = express.Router();

router.get('/', getData);                   // ?type=xxx
router.post('/', createData);
router.put('/:id', updateData);
router.delete('/:id', deleteData);
router.post('/import', importExcel);        // file: Excel, type: subtab

export default router;
