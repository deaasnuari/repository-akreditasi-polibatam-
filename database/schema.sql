-- Database schema untuk sistem akreditasi polibatam
-- Tabel diferensiasi-misi

-- Buat database jika belum ada
CREATE DATABASE IF NOT EXISTS akreditasi_polibatam;

-- Gunakan database
\c akreditasi_polibatam;

-- Buat tabel diferensiasi_misi
CREATE TABLE IF NOT EXISTS diferensiasi_misi (
    id SERIAL PRIMARY KEY,
    tipe_data VARCHAR(50) NOT NULL CHECK (tipe_data IN ('Visi', 'Misi')),
    unit_kerja VARCHAR(100) NOT NULL CHECK (unit_kerja IN ('Perguruan Tinggi', 'UPPS', 'Program Studi')),
    konten TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Buat index untuk optimasi query
CREATE INDEX IF NOT EXISTS idx_diferensiasi_misi_tipe ON diferensiasi_misi(tipe_data);
CREATE INDEX IF NOT EXISTS idx_diferensiasi_misi_unit ON diferensiasi_misi(unit_kerja);
CREATE INDEX IF NOT EXISTS idx_diferensiasi_misi_created ON diferensiasi_misi(created_at);

-- Buat trigger untuk update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_diferensiasi_misi_updated_at 
    BEFORE UPDATE ON diferensiasi_misi 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Buat view untuk data yang sering diakses
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

-- Komentar tabel dan kolom
COMMENT ON TABLE diferensiasi_misi IS 'Tabel untuk menyimpan data visi dan misi diferensiasi';
COMMENT ON COLUMN diferensiasi_misi.id IS 'Primary key auto increment';
COMMENT ON COLUMN diferensiasi_misi.tipe_data IS 'Tipe data: Visi atau Misi';
COMMENT ON COLUMN diferensiasi_misi.unit_kerja IS 'Unit kerja: Perguruan Tinggi, UPPS, atau Program Studi';
COMMENT ON COLUMN diferensiasi_misi.konten IS 'Konten visi atau misi';
COMMENT ON COLUMN diferensiasi_misi.created_at IS 'Timestamp pembuatan data';
COMMENT ON COLUMN diferensiasi_misi.updated_at IS 'Timestamp terakhir update data';
