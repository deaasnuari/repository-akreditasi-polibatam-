Template Excel untuk import data

Folder ini berisi template CSV yang bisa dibuka di Microsoft Excel, Google Sheets, atau LibreOffice Calc.

Catatan singkat:
- Format file: .csv (UTF-8). Setelah membuka di Excel, kamu bisa menyimpan kembali sebagai .xlsx jika perlu.
- Baris pertama adalah header. Header memakai kunci internal yang digunakan aplikasi (mis. `namaDTPR`, `judulPenelitian`). Menggunakan header ini akan mempermudah mapping otomatis.
- Jika header kamu berbeda (mis. "Nama Dosen"), gunakan fitur Preview & Mapping di aplikasi: pilih file, lakukan preview, lalu map kolom Excel ke field internal.
- Contoh: untuk subtab "hibah-dan-pembiayaan", header default: `no,namaDTPR,judulPenelitian,jumlahMahasiswaTerlibat,jenisHibah,sumber,durasi,pendanaan_ts2,pendanaan_ts1,pendanaan_ts,linkBukti`.

Cara pakai singkat:
1. Download salah satu template CSV.
2. Buka di Excel/Sheets, isi data di bawah header.
3. Simpan (Opsional: simpan sebagai .xlsx).
4. Di aplikasi: pilih subtab yang sesuai → Import Excel → pilih file.
5. Lakukan preview, sesuaikan mapping bila perlu → Import dan Simpan.

Jika mau, saya juga bisa membuat versi .xlsx atau menambahkan validasi/format di template (tanggal, angka).