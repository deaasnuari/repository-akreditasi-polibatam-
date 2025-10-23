import express from 'express';
import { getLED, createLED, updateLED } from '../controllers/ledController.js';

const router = express.Router();

router.get('/', getLED);
router.post('/', createLED);
router.put('/:id', updateLED);

export default router;
