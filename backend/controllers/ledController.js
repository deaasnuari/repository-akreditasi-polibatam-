
import pool from '../db.js';

/**
 * GET semua data LED (ambil data terbaru)
 */
export const getLED = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM led ORDER BY created_at DESC LIMIT 1'
    );
    res.json(result.rows);
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

    const result = await pool.query(
      'INSERT INTO led (tabs) VALUES ($1) RETURNING *',
      [JSON.stringify(tabs)]
    );

    res.json({ data: result.rows[0] });
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

    const result = await pool.query(
      'UPDATE led SET tabs = $1 WHERE id = $2 RETURNING *',
      [JSON.stringify(tabs), id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: 'Data not found' });
    }

    res.json({ data: result.rows[0] });
  } catch (err) {
    console.error('updateLED error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
