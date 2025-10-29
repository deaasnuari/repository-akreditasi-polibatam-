-- Data seed untuk tabel diferensiasi_misi
-- Jalankan setelah schema.sql

-- Insert data sample untuk testing
INSERT INTO diferensiasi_misi (tipe_data, unit_kerja, konten) VALUES
-- Data Visi Perguruan Tinggi
('Visi', 'Perguruan Tinggi', 'Menjadi perguruan tinggi yang unggul dalam pengembangan teknologi kelautan dan kemaritiman yang berdaya saing global pada tahun 2035.'),

-- Data Misi Perguruan Tinggi
('Misi', 'Perguruan Tinggi', 'Menyelenggarakan pendidikan tinggi yang berkualitas dalam bidang teknologi kelautan dan kemaritiman'),
('Misi', 'Perguruan Tinggi', 'Mengembangkan penelitian dan pengabdian masyarakat yang inovatif dan bermanfaat'),
('Misi', 'Perguruan Tinggi', 'Membangun kemitraan strategis dengan industri dan lembaga internasional'),
('Misi', 'Perguruan Tinggi', 'Mengembangkan sumber daya manusia yang profesional dan berkarakter'),

-- Data Visi UPPS
('Visi', 'UPPS', 'Menjadi unit pengelola program studi yang unggul dalam pengembangan teknologi kelautan dan kemaritiman yang berdaya saing regional'),

-- Data Misi UPPS
('Misi', 'UPPS', 'Menyelenggarakan program studi yang berkualitas dan relevan dengan kebutuhan industri'),
('Misi', 'UPPS', 'Mengembangkan kurikulum yang adaptif terhadap perkembangan teknologi'),
('Misi', 'UPPS', 'Meningkatkan kualitas pembelajaran dan pengajaran'),
('Misi', 'UPPS', 'Mengembangkan penelitian terapan yang mendukung pengembangan industri'),

-- Data Visi Program Studi
('Visi', 'Program Studi', 'Menjadi program studi yang unggul dalam menghasilkan lulusan yang kompeten di bidang teknologi kelautan dan kemaritiman'),

-- Data Misi Program Studi
('Misi', 'Program Studi', 'Menyelenggarakan pendidikan yang berorientasi pada kompetensi dan kebutuhan industri'),
('Misi', 'Program Studi', 'Mengembangkan pembelajaran yang inovatif dan berbasis teknologi'),
('Misi', 'Program Studi', 'Membangun kerjasama dengan industri dan lembaga terkait'),
('Misi', 'Program Studi', 'Mengembangkan penelitian dan pengabdian masyarakat yang relevan');

-- Update timestamp untuk data yang sudah ada
UPDATE diferensiasi_misi SET updated_at = CURRENT_TIMESTAMP;

-- Tampilkan data yang telah diinsert
SELECT 
    id,
    tipe_data,
    unit_kerja,
    LEFT(konten, 50) || '...' as konten_preview,
    created_at
FROM diferensiasi_misi 
ORDER BY tipe_data, unit_kerja, id;

