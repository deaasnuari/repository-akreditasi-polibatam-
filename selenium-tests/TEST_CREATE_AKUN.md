# 🧪 Test Create Akun - Manajemen Akun (Tata Usaha)

Automated testing untuk fitur **Create User** di halaman Manajemen Akun dashboard Tata Usaha.

## 📋 Deskripsi

Test ini mengotomasi proses pembuatan akun baru untuk:
- **Tim Akreditasi** - User dengan role akreditasi program studi
- **P4M** - User dengan role P4M (Penjaminan Mutu)
- **TU** - User dengan role Tata Usaha (admin)

## 🎯 Test Cases

### test_create_akun_simple.py (Basic)
**11 Test Scenarios:**
1. ✅ Halaman manajemen akun dapat dibuka
2. ✅ Tombol "Tambah User" berfungsi
3. ✅ Modal form terbuka dengan elemen lengkap
4. ✅ Create user dengan role Tim Akreditasi
5. ✅ Create user dengan role P4M
6. ✅ Validasi form kosong (password required)
7. ✅ Validasi duplicate email
8. ✅ Tutup modal dengan tombol "Batal"
9. ✅ Tutup modal dengan tombol X
10. ✅ Filter user berdasarkan role
11. ✅ Complete flow create user dengan semua field

### test_create_akun.py (Unittest - Advanced)
Sama dengan simple version tapi menggunakan unittest framework untuk:
- Test isolation
- Better assertions
- Test reports
- Setup/TearDown automation

## 🚀 Cara Menjalankan

### 1. Persiapan

```bash
# Pastikan di folder selenium-tests
cd selenium-tests

# Install dependencies jika belum
pip install -r requirements.txt
```

### 2. Jalankan Server

```bash
# Terminal 1 - Frontend
cd frontend
npm run dev

# Terminal 2 - Backend
cd backend
npm run dev
```

### 3. Login sebagai Admin TU

Test akan otomatis login dengan kredensial:
- **Email:** `admin@polibatam.ac.id`
- **Password:** `admin123`
- **Role:** `TU`

### 4. Run Test

**Opsi A: Test Sederhana (Recommended untuk pemula)**
```bash
python test_create_akun_simple.py
```

**Opsi B: Test dengan Unittest (Advanced)**
```bash
python test_create_akun.py
```

**Opsi C: Run test spesifik**
```bash
# Test create Tim Akreditasi
python -m unittest test_create_akun.CreateAkunTest.test_04_create_user_tim_akreditasi

# Test validasi
python -m unittest test_create_akun.CreateAkunTest.test_06_create_user_without_password
```

## 📊 Contoh Output

```
══════════════════════════════════════════════════════════════════
  🧪 TEST CREATE AKUN - MANAJEMEN AKUN (TATA USAHA)
══════════════════════════════════════════════════════════════════

📍 STEP 1: Login sebagai Admin TU...
   ✅ Login berhasil!

📍 STEP 2: Membuka halaman Manajemen Akun...
   ✅ Halaman terbuka: Manajemen Akun
   ℹ️  Total user saat ini: 5

📍 STEP 3: Klik tombol Tambah User...
   ✅ Modal Tambah User terbuka
   ℹ️  Modal title: Tambah User

📍 STEP 4: Mengisi form user baru...
   ℹ️  Nama     : Test User Selenium
   ℹ️  Email    : test_abc123@polibatam.ac.id
   ℹ️  Password : test12345
   ℹ️  Role     : Tim Akreditasi
   ℹ️  Prodi    : Teknik Informatika
   ✅ Nama diisi
   ✅ Email diisi
   ✅ Password diisi
   ✅ Role dipilih
   ✅ Prodi dipilih

📍 STEP 5: Submit form...
   ✅ Form disubmit

📍 STEP 6: Verifikasi user berhasil dibuat...
   ✅ User ditemukan di tabel: test_abc123@polibatam.ac.id
   ✅ CREATE USER BERHASIL! 🎉
   ℹ️  Total user sekarang: 6
   ✅ Total user bertambah dari 5 ke 6

📍 BONUS: Test filter by role...
   ℹ️  Filter Tim Akreditasi: 3 users

══════════════════════════════════════════════════════════════════
  ✅ SEMUA TEST SELESAI!
══════════════════════════════════════════════════════════════════
```

## 🎭 Page Object Pattern

File `manajemen_akun_page.py` menyediakan reusable methods:

```python
# Example usage
from page_objects.manajemen_akun_page import ManajemenAkunPage

akun_page = ManajemenAkunPage(driver)

# Buka halaman
akun_page.open()

# Create user dengan method chaining
akun_page.create_user(
    nama="John Doe",
    email="john@example.com",
    password="secret123",
    role="Tim Akreditasi",
    prodi="Teknik Informatika"
).click_submit()

# Filter dan search
akun_page.filter_by_role("P4M")
user_found = akun_page.search_user_in_table("john@example.com")
```

## 📝 Form Fields

### Create User Form:
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Nama Lengkap | Text | ✅ | Nama lengkap user |
| Email | Email | ✅ | Unique, format email valid |
| Password | Password | ✅ | Min 6 karakter (untuk user baru) |
| Role | Select | ✅ | Tim Akreditasi / P4M / TU |
| Prodi | Select | ❌ | Hanya untuk non-P4M |
| Status | Select | ❌ | Default: Aktif (untuk edit) |

### Role Options:
- **Tim Akreditasi** - User prodi dengan akses form akreditasi
- **P4M** - User P4M dengan akses review
- **TU** - User admin dengan full access

### Prodi Options:
1. Teknik Informatika
2. Teknologi Geomatika
3. Animasi
4. Teknologi Rekayasa Multimedia
5. Rekayasa Keamanan Siber
6. Rekayasa Perangkat Lunak
7. Teknologi Permainan
8. Teknik Komputer / Rekayasa Komputer

## ✅ Test Coverage

### Functional Tests:
- ✅ Page load & navigation
- ✅ Modal open/close
- ✅ Form validation (required fields)
- ✅ Create user dengan berbagai role
- ✅ Duplicate email detection
- ✅ Filter by role & status
- ✅ Table display & search

### UI Tests:
- ✅ Button functionality
- ✅ Form elements present
- ✅ Modal interactions
- ✅ Statistics update

### Data Tests:
- ✅ Random email generation
- ✅ User count verification
- ✅ Table row verification

## 🔍 Troubleshooting

### User tidak muncul di tabel?
```python
# Cek:
1. Backend server running?
2. Database connection OK?
3. Browser console ada error?
4. Network tab di DevTools
```

### Modal tidak terbuka?
```python
# Tambahkan explicit wait
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

modal = WebDriverWait(driver, 10).until(
    EC.presence_of_element_located((By.CLASS_NAME, "modal"))
)
```

### Form tidak bisa disubmit?
```python
# Cek validasi HTML5
# Pastikan semua required fields terisi
# Cek console browser untuk error
```

### Test terlalu cepat?
```python
# Tambahkan delay
import time
time.sleep(2)  # Tunggu 2 detik
```

## 🎯 Best Practices

1. **Random Data Generation**
   ```python
   # Generate unique email setiap test run
   email = f"test_{random_string}@polibatam.ac.id"
   ```

2. **Explicit Waits**
   ```python
   # Gunakan WebDriverWait, bukan time.sleep
   WebDriverWait(driver, 10).until(
       EC.element_to_be_clickable((By.ID, "submit"))
   )
   ```

3. **Page Object Pattern**
   ```python
   # Pisahkan UI logic dari test logic
   # Maintainable & reusable
   ```

4. **Test Isolation**
   ```python
   # Setiap test harus independen
   # Setup di setUp(), cleanup di tearDown()
   ```

5. **Verify After Action**
   ```python
   # Selalu verify hasil action
   akun_page.click_submit()
   assert akun_page.search_user_in_table(email)
   ```

## 📚 Related Files

- **Page Object:** [manajemen_akun_page.py](page_objects/manajemen_akun_page.py)
- **Login Page:** [login_page.py](page_objects/login_page.py)
- **Backend Controller:** [../backend/controllers/manajemenAkunController.js](../backend/controllers/manajemenAkunController.js)
- **Frontend Page:** [../frontend/src/app/dashboard/tata-usaha/manajemen-akun/page.tsx](../frontend/src/app/dashboard/tata-usaha/manajemen-akun/page.tsx)

## 🚧 TODO / Future Improvements

- [ ] Test edit user functionality
- [ ] Test delete user functionality
- [ ] Test upload photo
- [ ] Test change password
- [ ] Test role-based access control
- [ ] Test batch create users
- [ ] Test export users to CSV
- [ ] Performance test (create 100 users)
- [ ] Screenshot on failure
- [ ] Integrate with CI/CD

## 💡 Tips

1. **Jalankan test sekali dulu** untuk familiarisasi
2. **Lihat browser automation** untuk understand flow
3. **Cek database** setelah test untuk verify data
4. **Use Page Object** untuk test yang kompleks
5. **Generate random data** untuk avoid duplicate

## 🔗 Dependencies

```txt
selenium==4.16.0
webdriver-manager==4.0.1
```

## 📞 Support

Jika ada issue:
1. Cek [README.md](README.md) untuk troubleshooting umum
2. Cek [QUICKSTART.md](QUICKSTART.md) untuk setup
3. Lihat [DATA_USER.md](DATA_USER.md) untuk info kredensial

---

**Happy Testing! 🎉**

*Test ini dibuat untuk memastikan fitur create akun berfungsi dengan baik dan mencegah regression bugs.*
