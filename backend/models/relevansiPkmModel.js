import pool from '../db.js';

export const findBySubtab = async (subtab) => {
  const result = await pool.query('SELECT * FROM relevansi_pkm WHERE subtab = $1 ORDER BY id ASC', [subtab]);
  return result.rows;
};

export const create = async (subtab, data) => {
  const columns = Object.keys(data).join(', ');
  const values = Object.values(data);
  const placeholders = values.map((_, i) => `$${i + 2}`).join(', ');
  const sql = `INSERT INTO relevansi_pkm (subtab, ${columns}) VALUES ($1, ${placeholders}) RETURNING *`;
  const result = await pool.query(sql, [subtab, ...values]);
  return result.rows[0];
};

export const updateById = async (id, data) => {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
  const sql = `UPDATE relevansi_pkm SET ${setClause} WHERE id = $${values.length + 1} RETURNING *`;
  const result = await pool.query(sql, [...values, id]);
  return result.rows[0];
};

export const deleteById = async (id) => {
  const result = await pool.query('DELETE FROM relevansi_pkm WHERE id = $1 RETURNING *', [id]);
  return result.rows[0];
};

export const importRows = async (subtab, rowsArray) => {
  let added = 0;
  for (const r of rowsArray) {
    const cols = Object.keys(r).join(', ');
    const vals = Object.values(r);
    const placeholders = vals.map((_, i) => `$${i + 2}`).join(', ');
    const sql = `INSERT INTO relevansi_pkm (subtab, ${cols}) VALUES ($1, ${placeholders})`;
    await pool.query(sql, [subtab, ...vals]);
    added++;
  }
  return { added };
};
