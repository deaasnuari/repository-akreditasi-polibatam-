// import mysql from "mysql2/promise";

// const db = mysql.createPool({
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "repository_db",
// });

// export default db;


import pkg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '030104',
  database: process.env.DB_NAME || 'repository_polibatam',
});

pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL');
});

export default pool;
