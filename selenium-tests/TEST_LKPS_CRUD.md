# 🧪 Test CRUD LKPS - Budaya Mutu

Test lengkap untuk operasi **CRUD (Create, Read, Update, Delete)** pada halaman LKPS Budaya Mutu.

## 📋 Deskripsi

Test ini memverifikasi semua operasi CRUD untuk berbagai sub-tab di LKPS:

### 🎯 Sub-Tab yang Ditest:
1. **Tupoksi** - Tabel Pimpinan dan Tupoksi UPPS dan PS
2. **Pendanaan** - Sumber Pendanaan UPPS/PS
3. **Penggunaan Dana** - Penggunaan Dana UPPS/PS
4. **EWMP** - Rata-rata Beban DTPR per semester
5. **KTK** - Kualifikasi Tenaga Kependidikan
6. **SPMI** - Unit SPMI dan SDM

### ✅ Operasi yang Ditest:
- **CREATE** - Tambah data baru
- **READ** - Lihat dan baca data dari tabel
- **UPDATE** - Edit data existing
- **DELETE** - Hapus data
- **SEARCH** - Cari/filter data

## 🚀 Cara Menjalankan

### Persiapan:

```bash
cd selenium-tests
```

### 1. Test Sederhana (Step-by-Step)

```bash
python test_lkps_crud_simple.py
```

**Output:**
- 11 steps dengan penjelasan detail
- Mudah dipahami untuk pemula
- Test CREATE, READ, UPDATE, DELETE satu per satu

### 2. Test dengan Unittest (12 Test Cases)

```bash
python test_lkps_crud.py
```

**Output:**
- 12 test cases terpisah
- Professional testing dengan assertions
- Hasil test terstruktur

## 📊 Test Scenarios

### Test Sederhana (11 Steps):

| Step | Test | Deskripsi |
|------|------|-----------|
| 1 | Login | Login sebagai Tim Akreditasi |
| 2 | Open LKPS | Buka halaman LKPS |
| 3 | Check Tabs | Cek semua sub-tabs tersedia |
| 4 | Initial Data | Cek jumlah data awal |
| 5 | **CREATE** Tupoksi | Tambah data Tupoksi baru |
| 6 | **CREATE** Pendanaan | Tambah data Pendanaan baru |
| 7 | **READ** Data | Baca data dari tabel |
| 8 | **SEARCH** Data | Cari data dengan keyword |
| 9 | **UPDATE** Tupoksi | Edit data Tupoksi |
| 10 | **DELETE** Pendanaan | Hapus data Pendanaan |
| 11 | Final Check | Cek data akhir |

### Test Unittest (12 Tests):

1. `test_01_page_loads` - Halaman LKPS dapat dimuat
2. `test_02_switch_tabs` - Switch antar sub-tabs
3. `test_03_table_visible` - Tabel data terlihat
4. `test_04_open_form` - Buka form tambah data
5. `test_05_create_tupoksi` - **CREATE** data Tupoksi
6. `test_06_create_pendanaan` - **CREATE** data Pendanaan
7. `test_07_read_data` - **READ** data dari tabel
8. `test_08_search_data` - **SEARCH** data
9. `test_09_open_edit_form` - Buka form edit
10. `test_10_update_data` - **UPDATE** data
11. `test_11_open_delete_confirmation` - Buka modal delete
12. `test_12_delete_data` - **DELETE** data

## 📝 Data yang Digunakan

### Tupoksi (Test Create & Update):
```python
{
    'namaPimpinan': 'Dr. Selenium Test',
    'jabatan': 'Ketua Program Studi',
    'namaUnitKerja': 'Program Studi Teknik Informatika',
    'tugasPokok': 'Memimpin dan mengelola program studi',
    'fungsi': 'Pengelolaan akademik dan administrasi'
}
```

### Pendanaan (Test Create & Delete):
```python
{
    'sumber': 'APBN',
    'jumlahTS2': '1000000000',
    'jumlahTS1': '1200000000',
    'jumlahTS': '1500000000'
}
```

## 💻 Expected Output

### Test Sederhana:
```
======================================================================
  🧪 TEST CRUD LKPS - BUDAYA MUTU
======================================================================

📍 STEP 1: Login sebagai Tim Akreditasi...
   ✅ Login berhasil

📍 STEP 2: Membuka halaman LKPS...
   ✅ Halaman LKPS dimuat: Laporan Kinerja Program Studi

📍 STEP 3: Cek sub-tabs yang tersedia...
   ✅ Tab 'tupoksi' tersedia
   ✅ Tab 'pendanaan' tersedia
   ✅ Tab 'penggunaan-dana' tersedia
   ✅ Tab 'ewmp' tersedia
   ✅ Tab 'ktk' tersedia
   ✅ Tab 'spmi' tersedia
   ℹ️  Total tabs tersedia: 6/6

📍 STEP 4: Cek data awal di tabel...
   ℹ️  Jumlah data awal: 0
   ℹ️  Tabel masih kosong

📍 STEP 5: CREATE - Tambah data Tupoksi...
   ✅ Form tambah data muncul
   ℹ️  Mengisi form dengan data:
      - namaPimpinan: Dr. Selenium Test...
      - jabatan: Ketua Program Studi...
      - namaUnitKerja: Program Studi Teknik Informatika...
      - tugasPokok: Memimpin dan mengelola program studi sesuai visi...
      - fungsi: Pengelolaan akademik, administrasi, dan pengembang...
   ✅ Form berhasil diisi
   ℹ️  Menyimpan data...
   ✅ Data berhasil disimpan
   ℹ️  Jumlah data setelah create: 1
   ✅ Data Tupoksi berhasil ditambahkan!

📍 STEP 6: CREATE - Tambah data Pendanaan...
   ℹ️  Jumlah data Pendanaan awal: 0
   ℹ️  Mengisi form Pendanaan:
      - sumber: APBN
      - jumlahTS2: 1000000000
      - jumlahTS1: 1200000000
      - jumlahTS: 1500000000
   ℹ️  Menyimpan data Pendanaan...
   ✅ Data Pendanaan berhasil disimpan
   ℹ️  Jumlah data Pendanaan sekarang: 1
   ✅ Data Pendanaan berhasil ditambahkan!

📍 STEP 7: READ - Cek data yang baru ditambahkan...
   ℹ️  Data baris pertama:
      - Nama Pimpinan: Dr. Selenium Test
      - Jabatan: Ketua Program Studi
   ✅ Data berhasil dibaca dari tabel

📍 STEP 8: SEARCH - Cari data di tabel...
   ℹ️  Mencari data dengan keyword: 'Selenium'
   ℹ️  Hasil pencarian: 1 data
   ✅ Data ditemukan dengan search

📍 STEP 9: UPDATE - Edit data Tupoksi...
   ✅ Form edit muncul
   ℹ️  Mengupdate jabatan menjadi: Wakil Ketua Program Studi (Updated)
   ℹ️  Menyimpan update...
   ✅ Data berhasil diupdate
   ℹ️  Jabatan setelah update: Wakil Ketua Program Studi (Updated)
   ✅ Data berhasil diupdate di tabel!

📍 STEP 10: DELETE - Hapus data Pendanaan...
   ℹ️  Jumlah data Pendanaan: 1
   ✅ Modal konfirmasi hapus muncul
   ℹ️  Modal konfirmasi terlihat
   ℹ️  Mengkonfirmasi hapus...
   ✅ Data berhasil dihapus
   ℹ️  Jumlah data setelah delete: 0
   ✅ Data Pendanaan berhasil dihapus dari tabel!

📍 STEP 11: Cek data akhir setelah CRUD...
   ℹ️  Data Tupoksi: 0 → 1
   ℹ️  Data Pendanaan: 0 → 0

======================================================================
  ✅ SEMUA TEST CRUD SELESAI!
======================================================================

📊 SUMMARY:
✅ CREATE: Data Tupoksi dan Pendanaan berhasil ditambahkan
✅ READ: Data berhasil dibaca dari tabel
✅ UPDATE: Data Tupoksi berhasil diupdate
✅ DELETE: Data Pendanaan berhasil dihapus
✅ SEARCH: Fitur search berfungsi

📝 HASIL AKHIR:
- Total data Tupoksi: 1
- Total data Pendanaan: 0
```

## 🔑 Kredensial

```python
EMAIL = "test_5hnkxvpw@polibatam.ac.id"  # GANTI dengan email Tim Akreditasi
PASSWORD = "test12345"
ROLE = "Tim Akreditasi"
```

## 🎭 Page Object Features

```python
from page_objects.lkps_page import LKPSPage

# Initialize
lkps = LKPSPage(driver)
lkps.open()

# Navigation
lkps.switch_to_tab('tupoksi')
lkps.is_tab_active('tupoksi')

# CREATE
lkps.click_tambah_data()
lkps.fill_tupoksi_form({
    'namaPimpinan': 'Dr. Test',
    'jabatan': 'Ketua',
    'namaUnitKerja': 'Prodi TI',
    'tugasPokok': 'Memimpin',
    'fungsi': 'Pengelolaan'
})
lkps.click_simpan()

# READ
count = lkps.get_table_row_count()
data = lkps.get_first_row_data(2)

# SEARCH
lkps.search_data('keyword')

# UPDATE
lkps.click_edit_first_row()
lkps.update_form_field('jabatan', 'Wakil Ketua')
lkps.click_simpan()

# DELETE
lkps.click_delete_first_row()
lkps.is_confirm_modal_visible()
lkps.click_confirm_yes()
```

## 🔍 Troubleshooting

### Form tidak muncul?

**Cek:**
- Button "Tambah Data" clickable
- Wait time cukup
- JavaScript error di console

**Solusi:**
```python
# Tambah explicit wait
lkps.click_tambah_data()
time.sleep(2)  # Tunggu form muncul
```

### Data tidak tersimpan?

**Kemungkinan:**
- Validasi form gagal
- Backend error
- Koneksi terputus

**Solusi:**
```python
# Cek popup error
if not lkps.is_success_popup_visible():
    message = lkps.get_popup_message()
    print(f"Error: {message}")
```

### Edit/Delete button tidak ditemukan?

**Kemungkinan:**
- Tabel kosong
- Element belum load
- Scroll position salah

**Solusi:**
```python
# Cek jumlah data dulu
if lkps.get_table_row_count() > 0:
    lkps.click_edit_first_row()
else:
    print("Tidak ada data")
```

### Modal konfirmasi tidak muncul?

**Solusi:**
```python
# Tambah wait setelah klik delete
lkps.click_delete_first_row()
time.sleep(1.5)  # Tunggu modal muncul

if lkps.is_confirm_modal_visible():
    lkps.click_confirm_yes()
```

## 📚 Related Files

### Test Files:
- [test_lkps_crud.py](test_lkps_crud.py) - Unittest version (12 tests)
- [test_lkps_crud_simple.py](test_lkps_crud_simple.py) - Simple version (11 steps)

### Page Objects:
- [lkps_page.py](page_objects/lkps_page.py) - LKPS Page Object dengan CRUD methods
- [login_page.py](page_objects/login_page.py) - Login Page Object

### Frontend:
- [../frontend/src/app/dashboard/tim-akreditasi/lkps/page.tsx](../frontend/src/app/dashboard/tim-akreditasi/lkps/page.tsx)

## 🔗 CRUD Flow Diagram

```
┌─────────────────────────────────────────────┐
│  Login Tim Akreditasi                       │
└──────────────┬──────────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────────┐
│  Open LKPS Page                             │
│  - /dashboard/tim-akreditasi/lkps           │
└──────────────┬──────────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────────┐
│  CREATE - Tambah Data                       │
│  1. Klik "Tambah Data"                      │
│  2. Isi form (Tupoksi/Pendanaan/dll)        │
│  3. Klik "Simpan"                           │
│  4. Verify popup sukses                     │
│  5. Cek data di tabel                       │
└──────────────┬──────────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────────┐
│  READ - Lihat Data                          │
│  1. Cek jumlah row di tabel                 │
│  2. Ambil data dari kolom tertentu          │
│  3. Verify data sesuai                      │
└──────────────┬──────────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────────┐
│  SEARCH - Cari Data                         │
│  1. Input keyword di search box             │
│  2. Tunggu debounce (1.5s)                  │
│  3. Verify hasil pencarian                  │
└──────────────┬──────────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────────┐
│  UPDATE - Edit Data                         │
│  1. Klik tombol "Edit" di row               │
│  2. Update field yang diinginkan            │
│  3. Klik "Simpan"                           │
│  4. Verify popup sukses                     │
│  5. Cek data terupdate di tabel             │
└──────────────┬──────────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────────┐
│  DELETE - Hapus Data                        │
│  1. Klik tombol "Hapus" di row              │
│  2. Verify modal konfirmasi muncul          │
│  3. Klik "Ya" untuk konfirmasi              │
│  4. Verify popup sukses                     │
│  5. Cek data terhapus dari tabel            │
└──────────────┬──────────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────────┐
│  ✅ CRUD Complete!                          │
└─────────────────────────────────────────────┘
```

## 💡 Best Practices

1. **Always login first:**
   ```python
   login_page = LoginPage(driver)
   login_page.login(EMAIL, PASSWORD, ROLE)
   ```

2. **Switch to correct tab:**
   ```python
   lkps.switch_to_tab('tupoksi')
   time.sleep(1)  # Tunggu tab load
   ```

3. **Check data count before/after:**
   ```python
   before = lkps.get_table_row_count()
   # ... perform action ...
   after = lkps.get_table_row_count()
   assert after == before + 1
   ```

4. **Wait for popup to disappear:**
   ```python
   lkps.click_simpan()
   time.sleep(2)
   lkps.wait_for_popup_disappear()  # Tunggu popup hilang
   ```

5. **Handle empty table:**
   ```python
   if lkps.get_table_row_count() > 0:
       lkps.click_edit_first_row()
   else:
       print("Tidak ada data untuk diedit")
   ```

## 🎯 Next Steps

Setelah test CRUD LKPS Budaya Mutu berhasil:

1. **Test CRUD sub-tab lain** - Penggunaan Dana, EWMP, KTK, SPMI
2. **Test LKPS tabs lain** - Relevansi Pendidikan, Penelitian, PKM
3. **Test Simpan Draft** - Simpan sebagai draft
4. **Test Ajukan Review** - Submit untuk review P4M
5. **Test Import Excel** - Import data dari Excel
6. **Test View Notes** - Lihat catatan dari P4M

---

**🎉 Happy Testing!**

*Test CRUD LKPS memastikan semua operasi Create, Read, Update, Delete berfungsi dengan baik.*
