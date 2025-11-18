
import prisma from '../prismaClient.js';

/**
 * GET semua data LED (ambil data terbaru)
 */
export const getLED = async (req, res) => {
  try {
    // Beberapa DB mungkin tidak punya created_at, jadi urutkan berdasarkan id yang pasti ada
    const row = await prisma.led.findFirst({
      orderBy: { id: 'desc' },
    });
    res.json(row ? [row] : []);
  } catch (err) {
    console.error('getLED error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * POST create baru LED
 */
export const createLED = async (req, res) => {
  try {
    const { tabs } = req.body;

    if (!tabs) {
      return res.status(400).json({ message: 'tabs is required' });
    }

    const created = await prisma.led.create({
      data: { tabs },
    });

    res.json({ data: created });
  } catch (err) {
    console.error('createLED error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * PUT update LED
 */
export const updateLED = async (req, res) => {
  try {
    const { id } = req.params;
    const { tabs } = req.body;

    if (!tabs) {
      return res.status(400).json({ message: 'tabs is required' });
    }

    const parsedId = Number(id);
    if (Number.isNaN(parsedId)) {
      return res.status(400).json({ message: 'Invalid id' });
    }

    const updated = await prisma.led.update({
      where: { id: parsedId },
      data: { tabs },
    });

    res.json({ data: updated });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ message: 'Data not found' });
    }
    console.error('updateLED error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * DELETE hapus LED by id
 */
export const deleteLED = async (req, res) => {
  try {
    const { id } = req.params;
    const parsedId = Number(id);
    if (Number.isNaN(parsedId)) {
      return res.status(400).json({ message: 'Invalid id' });
    }

    await prisma.led.delete({ where: { id: parsedId } });
    res.json({ success: true });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ message: 'Data not found' });
    }
    console.error('deleteLED error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
