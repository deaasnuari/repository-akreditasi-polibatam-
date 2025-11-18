import express from 'express';
import { getLED, createLED, updateLED, deleteLED } from '../controllers/ledController.js';

const router = express.Router();

router.get('/', getLED);
router.post('/', createLED);
router.put('/:id', updateLED);
router.delete('/:id', deleteLED);

export default router;
