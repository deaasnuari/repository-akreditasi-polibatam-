import express from 'express';
import { getData, createData, updateData, deleteData } from '../controllers/budayaMutuController.js';

const router = express.Router();

router.get('/', getData);          // ?type=tupoksi
router.post('/', createData);
router.put('/:id', updateData);
router.delete('/:id', deleteData);

export default router;
