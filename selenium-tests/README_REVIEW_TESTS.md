# Test Uji Fungsional Review LKPS dan LED

## Deskripsi

Test Selenium untuk menguji fungsionalitas review LKPS dan LED oleh P4M (Reviewer). Test ini mencakup skenario lengkap dari login P4M hingga submit review dengan catatan dan status.

## Test Files

### 1. `test_review_lkps_fungsional.py`
**Fokus:** Review LKPS secara detail

**Steps:**
1. Login sebagai P4M
2. Cek Dashboard P4M
3. Filter Dokumen LKPS
4. Buka Halaman Review LKPS
5. Cek Informasi Dokumen LKPS
6. Cek Tab yang Tersedia
7. Input Catatan Review
8. Pilih Status Review (Diterima/Perlu Revisi)
9. Screenshot Form Review
10. Submit Review LKPS
11. Verifikasi Status di Dashboard
12. Screenshot Dashboard Final

**Output:**
- `screenshot_review_lkps_form.png` - Form review sebelum submit
- `screenshot_review_lkps_final.png` - Dashboard setelah review

### 2. `test_review_led_fungsional.py`
**Fokus:** Review LED dengan navigasi tab

**Steps:**
1. Login sebagai P4M
2. Cek Dashboard P4M
3. Filter Dokumen LED
4. Buka Halaman Review LED
5. Cek Informasi Dokumen LED
6. Cek Tab LED yang Tersedia
7. Navigasi Antar Tab (test multiple tabs)
8. Input Catatan Review
9. Pilih Status Review (Diterima/Perlu Revisi)
10. Screenshot Form Review
11. Submit Review LED
12. Verifikasi Status di Dashboard
13. Screenshot Dashboard Final

**Output:**
- `screenshot_led_tab_1.png` - Tab pertama
- `screenshot_led_tab_2.png` - Tab kedua (jika ada)
- `screenshot_led_tab_3.png` - Tab ketiga (jika ada)
- `screenshot_review_led_form.png` - Form review sebelum submit
- `screenshot_review_led_final.png` - Dashboard setelah review

### 3. `test_review_lkps_led_lengkap.py`
**Fokus:** Test comprehensive review LKPS dan LED

**Steps:**
- **Bagian 1: REVIEW LKPS**
  1. Login sebagai P4M
  2. Filter dan Review LKPS
  3. Review Dokumen LKPS (input catatan, pilih status "Diterima")
  
- **Bagian 2: REVIEW LED**
  4. Kembali ke Dashboard
  5. Filter dan Review LED
  6. Review Dokumen LED (input catatan, pilih status "Perlu Revisi", test navigasi tab)
  
- **Bagian 3: VERIFIKASI FINAL**
  7. Verifikasi Perubahan Statistik
  8. Screenshot Dashboard Final

**Output:**
- `screenshot_lkps_review.png` - Review LKPS
- `screenshot_led_review.png` - Review LED
- `screenshot_dashboard_final.png` - Dashboard final dengan statistik update

## Prerequisites

### 1. Akun P4M
Pastikan akun P4M sudah dibuat:
```bash
python test_create_akun_p4m.py
```

**Default credentials:**
- Email: `p4m_test@polibatam.ac.id`
- Password: `p4m12345`

### 2. Data Dokumen
Pastikan ada dokumen LKPS dan LED yang sudah disubmit oleh Tim Akreditasi:
- Login sebagai Tim Akreditasi
- Submit dokumen di menu Bukti Pendukung (LKPS/LED)

### 3. Backend dan Frontend Running
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## Cara Menjalankan Test

### Test Individual

**Test Review LKPS:**
```bash
cd selenium-tests
python test_review_lkps_fungsional.py
```

**Test Review LED:**
```bash
cd selenium-tests
python test_review_led_fungsional.py
```

**Test Lengkap (LKPS + LED):**
```bash
cd selenium-tests
python test_review_lkps_led_lengkap.py
```

## Fitur yang Diuji

### ✅ Review LKPS
- [x] Login P4M
- [x] Akses dashboard
- [x] Filter dokumen LKPS
- [x] Buka halaman review LKPS
- [x] Lihat informasi dokumen
- [x] Cek tab yang tersedia
- [x] Input catatan review
- [x] Pilih status (Diterima/Perlu Revisi)
- [x] Submit review
- [x] Verifikasi perubahan statistik

### ✅ Review LED
- [x] Login P4M
- [x] Akses dashboard
- [x] Filter dokumen LED
- [x] Buka halaman review LED
- [x] Lihat informasi dokumen
- [x] Navigasi antar tab LED
- [x] Input catatan review
- [x] Pilih status (Diterima/Perlu Revisi)
- [x] Submit review
- [x] Verifikasi perubahan statistik

### ✅ Navigasi dan UI
- [x] Dashboard P4M loading
- [x] Statistik dokumen (Total, Menunggu, Diterima, Perlu Revisi)
- [x] Filter kategori (LKPS/LED)
- [x] Filter status (Menunggu/Diterima/Perlu Revisi)
- [x] Tombol review dokumen
- [x] Form review (textarea, select, button)
- [x] Tab navigation (untuk LED)

## Page Objects

### P4MDashboardPage
**Methods:**
- `open()` - Buka dashboard P4M
- `is_loaded()` - Cek apakah halaman dimuat
- `get_stats()` - Ambil statistik dokumen
- `get_all_items()` - Ambil semua dokumen
- `filter_by_kategori(kategori)` - Filter LKPS/LED
- `filter_by_status(status)` - Filter berdasarkan status
- `click_review_item(index)` - Klik tombol review

### P4MReviewLKPSPage
**Methods:**
- `open(user_id)` - Buka halaman review LKPS
- `is_loaded()` - Cek halaman dimuat
- `get_document_info()` - Ambil info dokumen
- `get_tabs()` - Ambil daftar tab
- `click_tab(tab_name)` - Klik tab tertentu
- `input_catatan(catatan)` - Input catatan review
- `select_status(status)` - Pilih status review
- `submit_review()` - Submit review
- `get_current_status()` - Ambil status saat ini

### P4MReviewLEDPage
**Methods:**
- `open(tab, user_id)` - Buka halaman review LED
- `is_loaded()` - Cek halaman dimuat
- `get_document_info()` - Ambil info dokumen
- `get_tabs()` - Ambil daftar tab
- `click_tab(tab_name)` - Klik tab tertentu
- `input_catatan(catatan)` - Input catatan review
- `select_status(status)` - Pilih status review
- `submit_review()` - Submit review
- `get_current_status()` - Ambil status saat ini

## Expected Results

### Sukses ✅
- Login P4M berhasil
- Dashboard dimuat dengan statistik
- Filter LKPS/LED berfungsi
- Form review dapat diisi
- Status dapat dipilih (Diterima/Perlu Revisi)
- Submit review berhasil
- Statistik berubah setelah review
- Screenshots tersimpan

### Warning ⚠️
- Tidak ada dokumen untuk direview (perlu submit dari Tim Akreditasi)
- Field form tidak tersedia (UI berbeda dari expected)
- Tab tidak terdeteksi (single page atau struktur berbeda)

### Error ❌
- Login gagal (credentials salah atau akun tidak ada)
- Page tidak dimuat (backend/frontend tidak running)
- Element tidak ditemukan (locator perlu update)

## Troubleshooting

### 1. Login P4M Gagal
**Solusi:**
```bash
# Buat akun P4M dulu
python test_create_akun_p4m.py
```

### 2. Tidak Ada Dokumen
**Solusi:**
- Login sebagai Tim Akreditasi
- Submit dokumen LKPS/LED di menu Bukti Pendukung

### 3. Element Not Found
**Solusi:**
- Cek apakah frontend sudah running di `localhost:3000`
- Cek apakah struktur UI berubah (update locators di page objects)

### 4. Submit Review Gagal
**Kemungkinan:**
- Field catatan atau status tidak diisi
- Validasi form gagal
- Button submit tidak clickable
- Permission denied (bukan role P4M)

## Notes

- Test ini menggunakan **fixed credentials** untuk P4M
- Test bersifat **idempotent** - dapat dijalankan berkali-kali
- Screenshots otomatis disimpan di folder `selenium-tests/`
- Browser akan otomatis close setelah 5 detik
- Test dapat berjalan tanpa data (akan menampilkan warning)

## Struktur Test

```
selenium-tests/
├── test_review_lkps_fungsional.py      # Review LKPS (12 steps)
├── test_review_led_fungsional.py       # Review LED (13 steps)
├── test_review_lkps_led_lengkap.py     # Review LKPS + LED (8 steps)
├── page_objects/
│   ├── p4m_dashboard_page.py           # P4MDashboardPage
│   └── ...
└── screenshots/                         # Output screenshots
    ├── screenshot_review_lkps_form.png
    ├── screenshot_review_led_form.png
    └── screenshot_dashboard_final.png
```

## Related Tests

- `test_create_akun_p4m.py` - Membuat akun P4M
- `test_p4m_review_dashboard.py` - Basic P4M dashboard test
- `test_p4m_lengkap.py` - Create P4M + Review (combined)

## Author

Test ini dibuat untuk sistem akreditasi Polibatam dengan fokus pada pengujian fungsional review dokumen oleh P4M reviewer.
