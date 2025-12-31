# 🚀 Quick Start - Selenium Tests

Panduan cepat untuk menjalankan automated test login.

## ⚡ Instalasi Cepat

### 1. Install Dependencies
```bash
cd selenium-tests
pip install -r requirements.txt
```

### 2. Update Kredensial
Edit file test yang akan dijalankan dan ubah:
```python
VALID_EMAIL = "admin@polibatam.ac.id"      # Email valid di database
VALID_PASSWORD = "admin123"                # Password yang benar
```

### 3. Jalankan Server
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

## 🎯 Cara Menjalankan Test

### Opsi 1: Test Sederhana (Untuk Pemula)
```bash
# Dari root project
python test_selenium.py
```

**Output:**
```
=== Test Login dengan Selenium ===

1. Membuka halaman login...
2. Testing login dengan kredensial valid...
   - Mengisi form dan klik tombol Masuk...
   ✅ Login berhasil! Redirect ke: http://localhost:3000/dashboard/tata-usaha
...
```

### Opsi 2: Test dengan Unittest (Lebih Terstruktur)
```bash
cd selenium-tests
python test_login.py
```

**Jalankan test tertentu:**
```bash
# Test halaman loads
python -m unittest test_login.LoginTestCase.test_01_page_loads

# Test login sukses
python -m unittest test_login.LoginTestCase.test_02_login_with_valid_credentials
```

### Opsi 3: Test dengan Page Object Pattern (Paling Maintainable)
```bash
cd selenium-tests
python test_login_pom.py
```

## 📋 Daftar Test Available

### test_selenium.py (Basic)
- ✅ Login dengan kredensial valid
- ✅ Login dengan password salah
- ✅ Login dengan email tidak terdaftar
- ✅ Validasi form kosong
- ✅ Pemilihan role berbeda

### test_login.py (Unittest)
**9 Functional Tests + 1 Performance Test:**
1. Halaman login dapat dibuka
2. Login dengan kredensial valid
3. Login dengan password salah
4. Login dengan email tidak terdaftar
5. Submit form kosong (HTML5 validation)
6. Semua role dapat dipilih
7. Tombol loading state
8. Password field tersembunyi
9. Login dengan berbagai role
10. Waktu load halaman

### test_login_pom.py (Page Object Pattern)
**11 Tests dengan struktur lebih maintainable:**
- Semua test dari unittest
- Plus: Method chaining test
- Plus: Complete user flow test

## 🔧 Troubleshooting Cepat

### ❌ "ChromeDriver not found"
```bash
pip install webdriver-manager
```

Atau download manual:
1. Cek versi Chrome: `chrome://version/`
2. Download ChromeDriver: https://chromedriver.chromium.org/
3. Letakkan di PATH atau folder project

### ❌ "Connection refused"
Server belum jalan! Jalankan:
```bash
# Terminal 1
cd frontend && npm run dev

# Terminal 2
cd backend && npm run dev
```

### ❌ "Login failed"
Update kredensial di file test:
```python
VALID_EMAIL = "email@yang.ada.di.database"
VALID_PASSWORD = "password_yang_benar"
```

### ❌ "Element not found"
Tambahkan delay:
```python
import time
time.sleep(2)  # Tunggu 2 detik
```

## 📊 Contoh Output Sukses

```
▶ Test 1: Memuat halaman login...
   ✅ Halaman login berhasil dimuat dengan semua elemen

▶ Test 2: Login dengan kredensial valid...
   ✅ Login berhasil! Redirect ke: http://localhost:3000/dashboard/tata-usaha

▶ Test 3: Login dengan password salah...
   ✅ Error message muncul: Login gagal, periksa kembali data Anda.

...

====================================
SUMMARY
====================================
Tests run: 10
Successes: 10
Failures: 0
Errors: 0
====================================
```

## 💡 Tips

1. **Jalankan satu test dulu** untuk memastikan setup benar
2. **Update kredensial** dengan akun yang ada di database
3. **Pastikan server jalan** sebelum test
4. **Gunakan Page Object Pattern** untuk test yang kompleks
5. **Screenshot** saat debug: `driver.save_screenshot('debug.png')`

## 🎓 Pilih Test Yang Mana?

| Test | Untuk Siapa | Kapan Digunakan |
|------|-------------|-----------------|
| `test_selenium.py` | Pemula | Belajar Selenium pertama kali |
| `test_login.py` | Intermediate | Project kecil, test cepat |
| `test_login_pom.py` | Advanced | Project besar, maintainability |

## 📚 Baca Lebih Lanjut

- [README.md](README.md) - Dokumentasi lengkap
- [page_objects/](page_objects/) - Page Object Pattern implementation

## ⚡ One-Liner untuk Quick Test

```bash
# Install, update kredensial manual, lalu:
cd selenium-tests && python test_login.py
```

---

**Happy Testing! 🎉**
