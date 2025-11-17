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

-- ===== MIGRATION 2.0.0: Tabel relevansi_penelitian =====
DO $$
BEGIN
    -- Buat tabel relevansi_penelitian jika belum ada
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'relevansi_penelitian') THEN
        CREATE TABLE relevansi_penelitian (
            id SERIAL PRIMARY KEY,
            subtab VARCHAR(50) NOT NULL,
            namaprasarana VARCHAR(255),
            dayatampung VARCHAR(100),
            luasruang VARCHAR(100),
            status VARCHAR(50),
            lisensi VARCHAR(50),
            perangkat VARCHAR(255),
            linkbukti VARCHAR(500),
            namadtpr VARCHAR(255),
            judulpenelitian VARCHAR(500),
            jumlahmahasiswaterlibat VARCHAR(100),
            jenishibah VARCHAR(100),
            sumber VARCHAR(100),
            durasi VARCHAR(50),
            pendanaan VARCHAR(100),
            tahun VARCHAR(20),
            jenispengembangan VARCHAR(100),
            tahunakademik VARCHAR(20),
            judulkerjasama VARCHAR(500),
            mitra VARCHAR(255),
            judulpublikasi VARCHAR(500),
            jenispublikasi VARCHAR(100),
            judul VARCHAR(500),
            jenishki VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        RAISE NOTICE 'Tabel relevansi_penelitian berhasil dibuat';
    ELSE
        RAISE NOTICE 'Tabel relevansi_penelitian sudah ada';
    END IF;
END $$;

-- Buat index untuk relevansi_penelitian
CREATE INDEX IF NOT EXISTS idx_relevansi_penelitian_subtab ON relevansi_penelitian(subtab);
CREATE INDEX IF NOT EXISTS idx_relevansi_penelitian_created ON relevansi_penelitian(created_at);

-- Buat trigger update timestamp untuk relevansi_penelitian
DROP TRIGGER IF EXISTS update_relevansi_penelitian_updated_at ON relevansi_penelitian;
CREATE TRIGGER update_relevansi_penelitian_updated_at 
    BEFORE UPDATE ON relevansi_penelitian 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Log migration
INSERT INTO migration_log (version, description, executed_at) 
VALUES ('2.0.0', 'Buat tabel relevansi_penelitian', CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

-- ===== MIGRATION 3.0.0: Tabel relevansi_pendidikan =====
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'relevansi_pendidikan') THEN
        CREATE TABLE relevansi_pendidikan (
            id SERIAL PRIMARY KEY,
            type VARCHAR(50) NOT NULL,
            tahun VARCHAR(20),
            daya_tampung INTEGER,
            pendaftar INTEGER,
            diterima INTEGER,
            aktif INTEGER,
            calon_reguler_diterima INTEGER,
            calon_reguler_afirmasi INTEGER,
            calon_rpl_diterima INTEGER,
            calon_rpl_afirmasi INTEGER,
            calon_kebutuhan_khusus INTEGER,
            baru_reguler_diterima INTEGER,
            baru_reguler_afirmasi INTEGER,
            baru_rpl_diterima INTEGER,
            baru_rpl_afirmasi INTEGER,
            baru_kebutuhan_khusus INTEGER,
            aktif_reguler_diterima INTEGER,
            aktif_reguler_afirmasi INTEGER,
            aktif_rpl_diterima INTEGER,
            aktif_rpl_afirmasi INTEGER,
            aktif_kebutuhan_khusus INTEGER,
            asalMahasiswa TEXT,
            ts2 INTEGER,
            ts1 INTEGER,
            ts INTEGER,
            jumlah INTEGER,
            linkBukti TEXT,
            mata_kuliah TEXT,
            sks INTEGER,
            semester INTEGER,
            profil_lulusan TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        RAISE NOTICE 'Tabel relevansi_pendidikan berhasil dibuat';
    ELSE
        RAISE NOTICE 'Tabel relevansi_pendidikan sudah ada';
    END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_relevansi_pendidikan_type ON relevansi_pendidikan(type);
CREATE INDEX IF NOT EXISTS idx_relevansi_pendidikan_created ON relevansi_pendidikan(created_at);

-- Trigger update timestamp
DROP TRIGGER IF EXISTS update_relevansi_pendidikan_updated_at ON relevansi_pendidikan;
CREATE TRIGGER update_relevansi_pendidikan_updated_at
    BEFORE UPDATE ON relevansi_pendidikan
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Log migration
INSERT INTO migration_log (version, description, executed_at) 
VALUES ('3.0.0', 'Buat tabel relevansi_pendidikan', CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

