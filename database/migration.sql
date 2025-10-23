-- Migration file untuk diferensiasi_misi
-- Versi: 1.0.0
-- Tanggal: 2024-01-01
-- Deskripsi: Initial migration untuk tabel diferensiasi_misi

-- Cek apakah tabel sudah ada
DO $$
BEGIN
    -- Buat tabel jika belum ada
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'diferensiasi_misi') THEN
        CREATE TABLE diferensiasi_misi (
            id SERIAL PRIMARY KEY,
            tipe_data VARCHAR(50) NOT NULL CHECK (tipe_data IN ('Visi', 'Misi')),
            unit_kerja VARCHAR(100) NOT NULL CHECK (unit_kerja IN ('Perguruan Tinggi', 'UPPS', 'Program Studi')),
            konten TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        RAISE NOTICE 'Tabel diferensiasi_misi berhasil dibuat';
    ELSE
        RAISE NOTICE 'Tabel diferensiasi_misi sudah ada';
    END IF;
END $$;

-- Buat index jika belum ada
CREATE INDEX IF NOT EXISTS idx_diferensiasi_misi_tipe ON diferensiasi_misi(tipe_data);
CREATE INDEX IF NOT EXISTS idx_diferensiasi_misi_unit ON diferensiasi_misi(unit_kerja);
CREATE INDEX IF NOT EXISTS idx_diferensiasi_misi_created ON diferensiasi_misi(created_at);

-- Buat function untuk update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Buat trigger jika belum ada
DROP TRIGGER IF EXISTS update_diferensiasi_misi_updated_at ON diferensiasi_misi;
CREATE TRIGGER update_diferensiasi_misi_updated_at 
    BEFORE UPDATE ON diferensiasi_misi 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Buat view untuk summary
CREATE OR REPLACE VIEW v_diferensiasi_misi_summary AS
SELECT 
    tipe_data,
    unit_kerja,
    COUNT(*) as total_data,
    MAX(created_at) as last_created,
    MAX(updated_at) as last_updated
FROM diferensiasi_misi 
GROUP BY tipe_data, unit_kerja
ORDER BY tipe_data, unit_kerja;

-- Log migration
INSERT INTO migration_log (version, description, executed_at) 
VALUES ('1.0.0', 'Initial migration untuk diferensiasi_misi', CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

-- Buat tabel migration_log jika belum ada
CREATE TABLE IF NOT EXISTS migration_log (
    id SERIAL PRIMARY KEY,
    version VARCHAR(20) UNIQUE NOT NULL,
    description TEXT,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
