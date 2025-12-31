# 🎓 Test Login Tim Akreditasi

Test untuk login dan navigasi dashboard menggunakan akun **Tim Akreditasi** yang baru dibuat.

## 📋 Deskripsi

Test ini memverifikasi bahwa user dengan role **Tim Akreditasi** dapat:
1. ✅ Login dengan kredensial yang benar
2. ✅ Akses dashboard Tim Akreditasi
3. ✅ Melihat menu-menu yang sesuai dengan role
4. ✅ Navigasi ke berbagai halaman (LKPS, LED, Bukti Pendukung, dll)
5. ✅ Menerima notifikasi
6. ✅ Menggunakan fitur-fitur yang tersedia

## 🚀 Cara Menjalankan

### 1. Persiapan - Create User Tim Akreditasi

**PENTING:** Jalankan test create akun dulu untuk membuat user:

```bash
cd selenium-tests
python test_create_akun_simple.py
```

Catat email yang dibuat, contoh: `test_abc123@polibatam.ac.id`

### 2. Update Kredensial

**Edit file test:**
- [test_login_tim_akreditasi_simple.py](test_login_tim_akreditasi_simple.py#L12)
- [test_login_tim_akreditasi.py](test_login_tim_akreditasi.py#L19)

```python
# Ganti dengan email dari hasil test create akun
TIM_AKREDITASI_EMAIL = "test_abc123@polibatam.ac.id"  # <-- UPDATE INI
TIM_AKREDITASI_PASSWORD = "test12345"
```

### 3. Jalankan Test

**Opsi A: Test Sederhana**
```bash
python test_login_tim_akreditasi_simple.py
```

**Opsi B: Test dengan Unittest**
```bash
python test_login_tim_akreditasi.py
```

## 📊 Test Scenarios

### Test Sederhana (11 Steps):
1. ✅ Buka halaman login
2. ✅ Isi form login (email, password, role)
3. ✅ Submit dan verify redirect
4. ✅ Verify dashboard loaded
5. ✅ Cek semua menu tersedia
6. ✅ Test notifikasi button
7. ✅ Navigasi ke LKPS
8. ✅ Kembali ke dashboard
9. ✅ Navigasi ke LED
10. ✅ Navigasi ke Bukti Pendukung
11. ✅ Navigasi ke Matriks Penilaian

### Test Unittest (10 Tests):
1. `test_01_login_successful` - Login berhasil
2. `test_02_dashboard_loads` - Dashboard dimuat
3. `test_03_last_login_displayed` - Info last login
4. `test_04_all_menus_visible` - Semua menu tersedia
5. `test_05_notification_exists` - Notifikasi ada
6. `test_06_navigate_to_lkps` - Navigate LKPS
7. `test_07_navigate_to_led` - Navigate LED
8. `test_08_navigate_to_bukti_pendukung` - Navigate Bukti
9. `test_09_navigate_to_matriks` - Navigate Matriks
10. `test_10_complete_user_flow` - Complete flow

## 🎯 Menu yang Ditest

Dashboard Tim Akreditasi memiliki menu:

| Menu | URL | Deskripsi |
|------|-----|-----------|
| **Dashboard** | `/dashboard/tim-akreditasi` | Halaman utama |
| **LKPS** | `/dashboard/tim-akreditasi/lkps` | Laporan Kinerja Program Studi |
| **LED** | `/dashboard/tim-akreditasi/led` | Laporan Evaluasi Diri |
| **Bukti Pendukung** | `/dashboard/tim-akreditasi/bukti-pendukung` | Upload bukti |
| **Matriks Penilaian** | `/dashboard/tim-akreditasi/matriks-penilaian` | Penilaian akreditasi |
| **Export** | `/dashboard/tim-akreditasi/export` | Export data |

## 📝 Expected Output

```
══════════════════════════════════════════════════════════════════
  🧪 TEST LOGIN TIM AKREDITASI
══════════════════════════════════════════════════════════════════

📍 STEP 1: Membuka halaman login...
   ✅ Halaman login terbuka: Login

📍 STEP 2: Mengisi form login...
   ℹ️  Email    : test_abc123@polibatam.ac.id
   ℹ️  Password : test12345
   ℹ️  Role     : Tim Akreditasi
   ✅ Email diisi
   ✅ Password diisi
   ✅ Role dipilih

📍 STEP 3: Submit login...
   ✅ Login berhasil!
   ✅ Redirect ke: http://localhost:3000/dashboard/tim-akreditasi

📍 STEP 4: Verify dashboard Tim Akreditasi...
   ✅ Dashboard heading: Repository Digital Data Akreditasi
   ✅ Last login: Sabtu, 28 Desember 2025, 14:30 WIB

📍 STEP 5: Cek menu yang tersedia...
   ✅ Menu 'Dashboard' tersedia
   ✅ Menu 'LKPS' tersedia
   ✅ Menu 'LED' tersedia
   ✅ Menu 'Bukti Pendukung' tersedia
   ✅ Menu 'Matriks Penilaian' tersedia
   ✅ Menu 'Export' tersedia
   ℹ️  Total menu tersedia: 6/6

📍 STEP 6: Test notifikasi...
   ✅ Ada notifikasi baru (badge terlihat)
   ✅ Tombol notifikasi diklik
   ✅ Dropdown notifikasi muncul

📍 STEP 7: Navigasi ke LKPS...
   ✅ Berhasil ke LKPS: http://localhost:3000/dashboard/tim-akreditasi/lkps

...

══════════════════════════════════════════════════════════════════
  ✅ SEMUA TEST SELESAI!
══════════════════════════════════════════════════════════════════

📊 SUMMARY:
✅ Login berhasil sebagai Tim Akreditasi
✅ Dashboard dapat diakses
✅ Menu-menu tersedia: 6
✅ Navigasi ke berbagai halaman berhasil
```

## 🔑 Kredensial

### Default (dari test create akun):
```
Email    : test_[random]@polibatam.ac.id
Password : test12345
Role     : Tim Akreditasi
Prodi    : Teknik Informatika (atau prodi lain)
Status   : Aktif
```

### Admin TU (untuk create user):
```
Email    : admin@polibatam.ac.id
Password : admin123
Role     : TU
```

## 🎭 Page Object Features

```python
from page_objects.dashboard_tim_akreditasi_page import DashboardTimAkreditasiPage

# Create page object
dashboard = DashboardTimAkreditasiPage(driver)

# Open dashboard
dashboard.open()

# Check if loaded
if dashboard.is_loaded():
    print("Dashboard loaded!")

# Get info
heading = dashboard.get_page_heading()
last_login = dashboard.get_last_login_text()

# Check menu
if dashboard.is_menu_visible("LKPS"):
    print("LKPS menu available")

# Navigate
dashboard.click_menu("LKPS")

# Notification
if dashboard.has_notification_badge():
    dashboard.click_notification()
```

## 🔍 Troubleshooting

### Login gagal dengan error?

**Kemungkinan penyebab:**
1. Email salah - update dengan email hasil create akun
2. Password salah - pastikan `test12345`
3. User tidak ada - jalankan create akun dulu
4. User tidak aktif - cek status di database

**Solusi:**
```bash
# 1. Jalankan create akun dulu
python test_create_akun_simple.py

# 2. Catat email yang dibuat
# Output: test_abc123@polibatam.ac.id

# 3. Update di test file
TIM_AKREDITASI_EMAIL = "test_abc123@polibatam.ac.id"

# 4. Jalankan test login
python test_login_tim_akreditasi_simple.py
```

### Dashboard tidak dimuat?

**Cek:**
- Frontend server running di `http://localhost:3000`
- URL redirect ke `/dashboard/tim-akreditasi`
- Browser console untuk error

### Menu tidak ditemukan?

**Kemungkinan:**
- Sidebar collapsed (mobile view)
- JavaScript belum load
- Role tidak sesuai

**Solusi:**
```python
# Tunggu lebih lama
time.sleep(3)

# Atau maximize window
driver.maximize_window()
```

### Navigasi gagal?

**Cek:**
- Menu element clickable
- Wait time cukup
- URL berubah setelah klik

```python
# Tambah explicit wait
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

menu = WebDriverWait(driver, 10).until(
    EC.element_to_be_clickable((By.XPATH, "//span[text()='LKPS']"))
)
menu.click()
```

## 📚 Related Files

### Test Files:
- [test_login_tim_akreditasi.py](test_login_tim_akreditasi.py) - Unittest version
- [test_login_tim_akreditasi_simple.py](test_login_tim_akreditasi_simple.py) - Simple version

### Page Objects:
- [dashboard_tim_akreditasi_page.py](page_objects/dashboard_tim_akreditasi_page.py) - Dashboard page object
- [login_page.py](page_objects/login_page.py) - Login page object

### Frontend:
- [../frontend/src/app/dashboard/tim-akreditasi/page.tsx](../frontend/src/app/dashboard/tim-akreditasi/page.tsx)

## 🔗 Test Flow Diagram

```
┌─────────────────────────────────────────────┐
│  Create User Tim Akreditasi                 │
│  (test_create_akun.py)                      │
└──────────────┬──────────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────────┐
│  Login as Tim Akreditasi                    │
│  - Email: test_xxx@polibatam.ac.id          │
│  - Password: test12345                      │
│  - Role: Tim Akreditasi                     │
└──────────────┬──────────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────────┐
│  Verify Dashboard                           │
│  - URL: /dashboard/tim-akreditasi           │
│  - Heading: "Repository Digital..."         │
│  - Last login displayed                     │
└──────────────┬──────────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────────┐
│  Check Menus                                │
│  - Dashboard ✓                              │
│  - LKPS ✓                                   │
│  - LED ✓                                    │
│  - Bukti Pendukung ✓                        │
│  - Matriks ✓                                │
│  - Export ✓                                 │
└──────────────┬──────────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────────┐
│  Navigate to Pages                          │
│  - LKPS → /lkps ✓                           │
│  - LED → /led ✓                             │
│  - Bukti → /bukti-pendukung ✓               │
│  - Matriks → /matriks-penilaian ✓           │
└──────────────┬──────────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────────┐
│  ✅ Test Complete!                          │
└─────────────────────────────────────────────┘
```

## 💡 Best Practices

1. **Always create user first:**
   ```bash
   python test_create_akun_simple.py
   # Then update email in login test
   ```

2. **Use Page Objects:**
   ```python
   # Reusable & maintainable
   dashboard = DashboardTimAkreditasiPage(driver)
   dashboard.open().click_menu("LKPS")
   ```

3. **Verify after each action:**
   ```python
   dashboard.click_menu("LKPS")
   assert "lkps" in driver.current_url
   ```

4. **Add appropriate waits:**
   ```python
   time.sleep(1)  # After navigation
   WebDriverWait(driver, 10).until(...)  # For dynamic content
   ```

## 🎯 Next Steps

Setelah test ini berhasil, bisa lanjut:

1. **Test LKPS Forms** - Test isi form LKPS
2. **Test LED** - Test Laporan Evaluasi Diri
3. **Test Upload Bukti** - Test upload file
4. **Test Matriks** - Test penilaian matriks
5. **Test Export** - Test export data

## 📞 Support

Jika ada masalah:
- Cek [README.md](README.md) untuk info umum
- Lihat [TEST_CREATE_AKUN.md](TEST_CREATE_AKUN.md) untuk create user
- Review [QUICKSTART.md](QUICKSTART.md) untuk setup

---

**🎉 Happy Testing!**

*Test ini memastikan user Tim Akreditasi dapat login dan mengakses semua fitur yang sesuai dengan rolenya.*
