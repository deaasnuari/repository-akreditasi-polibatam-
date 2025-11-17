import pool from '../db.js';

// Use existing pg pool for queries (keeps same behavior as original controllers)
export const findBySubtab = async (subtab) => {
  const result = await pool.query('SELECT * FROM relevansi_penelitian WHERE subtab = $1 ORDER BY id ASC', [subtab]);
  return result.rows;
};

export const create = async (subtab, data) => {
  const columns = Object.keys(data).join(', ');
  const values = Object.values(data);
  const placeholders = values.map((_, i) => `$${i + 2}`).join(', ');
  const sql = `INSERT INTO relevansi_penelitian (subtab, ${columns}) VALUES ($1, ${placeholders}) RETURNING *`;
  const params = [subtab, ...values];
  const result = await pool.query(sql, params);
  return result.rows[0];
};

export const updateById = async (id, data) => {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
  const sql = `UPDATE relevansi_penelitian SET ${setClause} WHERE id = $${values.length + 1} RETURNING *`;
  const result = await pool.query(sql, [...values, id]);
  return result.rows[0];
};

export const deleteById = async (id) => {
  const result = await pool.query('DELETE FROM relevansi_penelitian WHERE id = $1 RETURNING *', [id]);
  return result.rows[0];
};

export const importRows = async (subtab, rowsArray, mappingFn) => {
  let added = 0;
  for (const r of rowsArray) {
    const mapped = mappingFn ? mappingFn(r) : r;
    const cols = Object.keys(mapped).join(', ');
    const vals = Object.values(mapped);
    const placeholders = vals.map((_, i) => `$${i + 2}`).join(', ');
    const sql = `INSERT INTO relevansi_penelitian (subtab, ${cols}) VALUES ($1, ${placeholders})`;
    await pool.query(sql, [subtab, ...vals]);
    added++;
  }
  return { added };
};
