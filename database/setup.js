#!/usr/bin/env node

/**
 * Setup script untuk database PostgreSQL
 * Menjalankan schema, migration, dan seed data
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Konfigurasi database
const dbConfig = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'akreditasi_polibatam',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
};

async function setupDatabase() {
  const pool = new Pool(dbConfig);
  
  try {
    console.log('🚀 Memulai setup database...');
    
    // Test koneksi
    console.log('📡 Testing koneksi database...');
    await pool.query('SELECT NOW()');
    console.log('✅ Koneksi database berhasil');
    
    // Baca dan jalankan schema
    console.log('📋 Menjalankan schema...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf8');
      await pool.query(schema);
      console.log('✅ Schema berhasil dijalankan');
    } else {
      console.log('⚠️  File schema.sql tidak ditemukan');
    }
    
    // Baca dan jalankan migration
    console.log('🔄 Menjalankan migration...');
    const migrationPath = path.join(__dirname, 'migration.sql');
    if (fs.existsSync(migrationPath)) {
      const migration = fs.readFileSync(migrationPath, 'utf8');
      await pool.query(migration);
      console.log('✅ Migration berhasil dijalankan');
    } else {
      console.log('⚠️  File migration.sql tidak ditemukan');
    }
    
    // Baca dan jalankan seed data
    console.log('🌱 Menjalankan seed data...');
    const seedPath = path.join(__dirname, 'seed.sql');
    if (fs.existsSync(seedPath)) {
      const seed = fs.readFileSync(seedPath, 'utf8');
      await pool.query(seed);
      console.log('✅ Seed data berhasil dijalankan');
    } else {
      console.log('⚠️  File seed.sql tidak ditemukan');
    }
    
    // Cek data yang sudah diinsert
    console.log('📊 Mengecek data...');
    const result = await pool.query('SELECT COUNT(*) as total FROM diferensiasi_misi');
    console.log(`✅ Total data: ${result.rows[0].total} records`);
    
    console.log('🎉 Setup database selesai!');
    
  } catch (error) {
    console.error('❌ Error setup database:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Jalankan setup jika script dipanggil langsung
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };

