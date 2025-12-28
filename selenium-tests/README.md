# Selenium Tests - Automated Testing Suite

Automated testing untuk aplikasi akreditasi Polibatam menggunakan Selenium WebDriver.

## 📋 Test Suites Available

### 1. 🔐 Login Tests
- [test_login.py](test_login.py) - Unittest version (10 tests)
- [test_login_pom.py](test_login_pom.py) - Page Object Pattern (11 tests)
- [test_selenium.py](../test_selenium.py) - Basic version (6 tests)

### 2. 👥 Create Akun Tests (NEW!)
- [test_create_akun.py](test_create_akun.py) - Unittest version (11 tests)
- [test_create_akun_simple.py](test_create_akun_simple.py) - Basic version
- [TEST_CREATE_AKUN.md](TEST_CREATE_AKUN.md) - Documentation

## 🎯 Quick Links

- **[QUICKSTART.md](QUICKSTART.md)** - Panduan cepat memulai
- **[DATA_USER.md](DATA_USER.md)** - Info kredensial & data user
- **[TEST_CREATE_AKUN.md](TEST_CREATE_AKUN.md)** - Dokumentasi test create akun

# Selenium Tests - Login & Manajemen Akun

Automated testing untuk halaman login dan manajemen akun menggunakan Selenium WebDriver.

## 📋 Persiapan

### 1. Install Dependencies

```bash
cd selenium-tests
pip install -r requirements.txt
```

### 2. Download ChromeDriver

Selenium memerlukan ChromeDriver untuk mengontrol browser Chrome.

**Opsi A: Install otomatis dengan webdriver-manager** (Sudah termasuk di requirements.txt)
```python
from selenium import webdriver
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service

service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service)
```

**Opsi B: Download manual**
1. Download ChromeDriver dari https://chromedriver.chromium.org/
2. Sesuaikan dengan versi Chrome yang terinstal
3. Tambahkan ke PATH atau letakkan di folder project

### 3. Jalankan Server

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 4. Update Kredensial Test

Edit file `test_login.py` dan ubah kredensial:

```python
VALID_EMAIL = "test@example.com"      # Email valid di database
VALID_PASSWORD = "password123"        # Password yang benar
```

## 🚀 Menjalankan Test

### Test Sederhana (test_selenium.py)

```bash
python test_selenium.py
```

Test ini akan:
- ✅ Buka halaman login
- ✅ Test login dengan kredensial valid
- ✅ Test login dengan password salah
- ✅ Test login dengan email tidak terdaftar
- ✅ Test validasi form kosong
- ✅ Test pemilihan role berbeda

### Test dengan Unittest (test_login.py)

**Jalankan semua test:**
```bash
cd selenium-tests
python test_login.py
```

**Jalankan test tertentu:**
```bash
python -m unittest test_login.LoginTestCase.test_01_page_loads
python -m unittest test_login.LoginTestCase.test_02_login_with_valid_credentials
```

**Jalankan dengan verbose:**
```bash
python -m unittest test_login -v
```

## 📝 Daftar Test Cases

### Functional Tests (LoginTestCase)

1. **test_01_page_loads** - Halaman login dapat dibuka dengan semua elemen
2. **test_02_login_with_valid_credentials** - Login berhasil dengan kredensial valid
3. **test_03_login_with_wrong_password** - Error muncul dengan password salah
4. **test_04_login_with_invalid_email** - Error muncul dengan email tidak terdaftar
5. **test_05_login_with_empty_fields** - HTML5 validation mencegah submit kosong
6. **test_06_role_selection** - Semua role dapat dipilih (TU, P4M, Tim Akreditasi)
7. **test_07_login_button_state** - Tombol loading state saat submit
8. **test_08_password_field_is_hidden** - Password field tersembunyi
9. **test_09_login_with_different_roles** - Login dengan berbagai role

### Performance Tests (LoginPerformanceTest)

1. **test_page_load_time** - Waktu load halaman < 5 detik

## 🎯 Test Scenarios

### ✅ Success Case
- Email: valid
- Password: valid
- Role: sesuai dengan akun
- Result: Redirect ke dashboard sesuai role

### ❌ Error Cases
- Password salah → Error message muncul
- Email tidak terdaftar → Error message muncul
- Role tidak sesuai → Error message muncul
- Form kosong → HTML5 validation mencegah submit

## 🔍 Debugging

### Browser Tidak Muncul?
```python
# Pastikan ChromeDriver sudah terinstall
# Cek versi Chrome: chrome://version/
# Download ChromeDriver yang sesuai
```

### Test Gagal?
```python
# 1. Cek server berjalan
# Frontend: http://localhost:3000
# Backend: http://localhost:5000 (atau port yang sesuai)

# 2. Cek kredensial di database
# Pastikan VALID_EMAIL dan VALID_PASSWORD benar

# 3. Cek network
# Buka DevTools → Network saat test berjalan
```

### Element Not Found?
```python
# Tambahkan explicit wait
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

element = WebDriverWait(driver, 10).until(
    EC.presence_of_element_located((By.XPATH, "//input[@type='email']"))
)
```

## 📊 Best Practices

1. **Gunakan Explicit Waits**
   ```python
   WebDriverWait(driver, 10).until(EC.presence_of_element_located(...))
   ```

2. **Isolasi Test**
   - Setiap test harus independen
   - Gunakan setUp() dan tearDown()
   - Jangan bergantung pada urutan test

3. **Clean Up**
   ```python
   try:
       # test code
   finally:
       driver.quit()
   ```

4. **Descriptive Names**
   ```python
   def test_login_with_valid_credentials():  # ✅ Good
   def test_01():                            # ❌ Bad
   ```

5. **Use Page Object Pattern** (untuk test yang kompleks)
   ```python
   class LoginPage:
       def __init__(self, driver):
           self.driver = driver
       
       def login(self, email, password):
           # implementation
   ```

## 🛠️ Troubleshooting

### Chrome Version Mismatch
```bash
# Install webdriver-manager untuk auto update
pip install webdriver-manager

# Gunakan di code:
from webdriver_manager.chrome import ChromeDriverManager
driver = webdriver.Chrome(ChromeDriverManager().install())
```

### Permission Denied
```bash
# Windows: Run as Administrator
# Linux/Mac: chmod +x chromedriver
```

### Port Already in Use
```python
# Ubah BASE_URL di test file
BASE_URL = "http://localhost:3001"  # Port yang berbeda
```

## 📚 Referensi

- [Selenium Documentation](https://www.selenium.dev/documentation/)
- [Python unittest](https://docs.python.org/3/library/unittest.html)
- [WebDriver Wait](https://selenium-python.readthedocs.io/waits.html)

## 💡 Tips

- Gunakan `driver.maximize_window()` untuk konsistensi
- Tambahkan `time.sleep()` untuk debugging (hapus di production)
- Screenshot saat error: `driver.save_screenshot('error.png')`
- Log semua action untuk debugging
- Jalankan test di CI/CD pipeline

## 📝 TODO

- [ ] Tambah test untuk "Remember Me" (jika ada)
- [ ] Tambah test untuk "Forgot Password" (jika ada)
- [ ] Tambah test untuk timeout session
- [ ] Tambah test untuk concurrent login
- [ ] Tambah screenshot saat error
- [ ] Integrate dengan CI/CD
