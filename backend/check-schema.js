import pkg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pkg;
dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'repository_polibatam',
  password: process.env.DB_PASSWORD || '1234',
  port: process.env.DB_PORT || 5432,
});

async function checkSchema() {
  try {
    const client = await pool.connect();

    console.log('\n=== RELEVANSI_PENELITIAN TABLE SCHEMA ===\n');
    const researchResult = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'relevansi_penelitian'
      ORDER BY ordinal_position;
    `);
    console.table(researchResult.rows);

    console.log('\n=== RELEVANSI_PKM TABLE SCHEMA ===\n');
    const pkmResult = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'relevansi_pkm'
      ORDER BY ordinal_position;
    `);
    console.table(pkmResult.rows);

    console.log('\n=== RELEVANSI_PENELITIAN TABLE SAMPLE DATA ===\n');
    const sampleResult = await client.query('SELECT * FROM relevansi_penelitian LIMIT 5;');
    console.log(`Total rows: ${sampleResult.rowCount}`);
    if (sampleResult.rowCount > 0) {
      console.table(sampleResult.rows);
    }

    client.release();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

checkSchema();
