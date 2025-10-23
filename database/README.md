# Database Setup untuk Sistem Akreditasi Polibatam

## Overview
Database PostgreSQL untuk sistem akreditasi dengan tabel diferensiasi-misi untuk menyimpan data visi dan misi.

## Struktur Database

### Tabel: `diferensiasi_misi`
- `id` (SERIAL PRIMARY KEY) - ID unik auto increment
- `tipe_data` (VARCHAR(50)) - Tipe data: 'Visi' atau 'Misi'
- `unit_kerja` (VARCHAR(100)) - Unit kerja: 'Perguruan Tinggi', 'UPPS', atau 'Program Studi'
- `konten` (TEXT) - Konten visi atau misi
- `created_at` (TIMESTAMP) - Waktu pembuatan data
- `updated_at` (TIMESTAMP) - Waktu terakhir update data

## File Database

1. **`schema.sql`** - Schema database lengkap dengan tabel, index, trigger, dan view
2. **`migration.sql`** - File migration untuk update database
3. **`seed.sql`** - Data sample untuk testing
4. **`config.js`** - Konfigurasi koneksi database
5. **`setup.js`** - Script untuk setup database otomatis
6. **`env.example`** - Template file environment variables

## Setup Database

### 1. Install PostgreSQL
```bash
# Windows (dengan chocolatey)
choco install postgresql

# Atau download dari https://www.postgresql.org/download/windows/
```

### 2. Buat Database
```sql
-- Login ke PostgreSQL
psql -U postgres

-- Buat database
CREATE DATABASE akreditasi_polibatam;

-- Buat user (opsional)
CREATE USER akreditasi_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE akreditasi_polibatam TO akreditasi_user;
```

### 3. Setup Environment
```bash
# Copy file environment
cp database/env.example .env

# Edit file .env sesuai konfigurasi database Anda
```

### 4. Install Dependencies
```bash
npm install pg dotenv
```

### 5. Jalankan Setup
```bash
# Method 1: Menggunakan setup script
node database/setup.js

# Method 2: Manual
psql -U postgres -d akreditasi_polibatam -f database/schema.sql
psql -U postgres -d akreditasi_polibatam -f database/migration.sql
psql -U postgres -d akreditasi_polibatam -f database/seed.sql
```

## Koneksi dari Node.js

```javascript
const { query, testConnection } = require('./database/config');

// Test koneksi
testConnection();

// Query data
const result = await query('SELECT * FROM diferensiasi_misi WHERE tipe_data = $1', ['Visi']);
console.log(result.rows);
```

## Query Examples

### Select Data
```sql
-- Semua data
SELECT * FROM diferensiasi_misi;

-- Data berdasarkan tipe
SELECT * FROM diferensiasi_misi WHERE tipe_data = 'Visi';

-- Data berdasarkan unit kerja
SELECT * FROM diferensiasi_misi WHERE unit_kerja = 'Perguruan Tinggi';

-- Summary data
SELECT * FROM v_diferensiasi_misi_summary;
```

### Insert Data
```sql
INSERT INTO diferensiasi_misi (tipe_data, unit_kerja, konten) 
VALUES ('Visi', 'Program Studi', 'Menjadi program studi unggul...');
```

### Update Data
```sql
UPDATE diferensiasi_misi 
SET konten = 'Konten baru...', updated_at = CURRENT_TIMESTAMP 
WHERE id = 1;
```

### Delete Data
```sql
DELETE FROM diferensiasi_misi WHERE id = 1;
```

## Backup & Restore

### Backup
```bash
pg_dump -U postgres akreditasi_polibatam > backup_akreditasi.sql
```

### Restore
```bash
psql -U postgres akreditasi_polibatam < backup_akreditasi.sql
```

## Troubleshooting

### Error: "database does not exist"
```sql
CREATE DATABASE akreditasi_polibatam;
```

### Error: "permission denied"
```sql
GRANT ALL PRIVILEGES ON DATABASE akreditasi_polibatam TO your_username;
```

### Error: "connection refused"
- Pastikan PostgreSQL service running
- Cek port 5432 tidak digunakan aplikasi lain
- Cek firewall settings

## Monitoring

### Cek koneksi aktif
```sql
SELECT * FROM pg_stat_activity WHERE datname = 'akreditasi_polibatam';
```

### Cek ukuran database
```sql
SELECT pg_size_pretty(pg_database_size('akreditasi_polibatam'));
```

### Cek ukuran tabel
```sql
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'diferensiasi_misi';
```
