
import prisma from '../prismaClient.js';

/**
 * GET semua data LED untuk user tertentu
 */
export const getAllLEDData = async (req, res) => {
  try {
    const { user_id } = req.params;
    const parsedUserId = Number(user_id);
    if (Number.isNaN(parsedUserId)) {
      return res.status(400).json({ message: 'Invalid user_id' });
    }

    const rows = await prisma.led.findMany({
      where: { user_id: parsedUserId },
      orderBy: { updated_at: 'desc' },
    });

    // Transform ke format FE: { subtab: data }
    const result = {};
    rows.forEach(row => {
      result[row.subtab] = row.data;
    });

    res.json(result);
  } catch (err) {
    console.error('getAllLEDData error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * POST save/update LED tab untuk user tertentu
 */
export const saveLEDTab = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { subtab, data } = req.body;

    const parsedUserId = Number(user_id);
    if (Number.isNaN(parsedUserId)) {
      return res.status(400).json({ message: 'Invalid user_id' });
    }

    if (!subtab || !data) {
      return res.status(400).json({ message: 'subtab and data are required' });
    }

    // Upsert: update jika ada, create jika tidak
    const upserted = await prisma.led.upsert({
      where: {
        user_id_subtab: {
          user_id: parsedUserId,
          subtab: subtab,
        },
      },
      update: { data },
      create: {
        user_id: parsedUserId,
        subtab,
        data,
      },
    });

    res.json({ data: upserted });
  } catch (err) {
    console.error('saveLEDTab error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * DELETE hapus LED tab untuk user tertentu
 */
export const deleteLEDTab = async (req, res) => {
  try {
    const { user_id, subtab } = req.params;
    const parsedUserId = Number(user_id);
    if (Number.isNaN(parsedUserId)) {
      return res.status(400).json({ message: 'Invalid user_id' });
    }

    if (!subtab) {
      return res.status(400).json({ message: 'subtab is required' });
    }

    await prisma.led.deleteMany({
      where: {
        user_id: parsedUserId,
        subtab: subtab,
      },
    });

    res.json({ success: true });
  } catch (err) {
    console.error('deleteLEDTab error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
