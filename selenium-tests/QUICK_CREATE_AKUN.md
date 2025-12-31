# 🚀 Quick Guide - Test Create Akun

Panduan cepat untuk menjalankan test create akun.

## ⚡ Super Quick Start

```bash
# 1. Pastikan server running
# Frontend: http://localhost:3000
# Backend: http://localhost:5000

# 2. Masuk ke folder selenium-tests
cd selenium-tests

# 3. Jalankan test sederhana
python test_create_akun_simple.py

# Atau versi unittest
python test_create_akun.py
```

## 📝 Apa yang Ditest?

✅ **Create User Baru** dengan berbagai role:
- Tim Akreditasi (dengan prodi)
- P4M (tanpa prodi)
- TU (admin)

✅ **Validasi Form:**
- Required fields (nama, email, password)
- Email unique
- Format email valid

✅ **UI Interactions:**
- Buka/tutup modal
- Filter by role
- Search user di tabel

## 🎬 Test Flow

```
1. Login as Admin TU
   ↓
2. Buka Manajemen Akun
   ↓
3. Klik "Tambah User"
   ↓
4. Isi Form User Baru
   ↓
5. Submit Form
   ↓
6. Verify User Muncul di Tabel
   ↓
7. ✅ SUCCESS!
```

## 📊 Expected Output

```
══════════════════════════════════════════════════════════════════
  🧪 TEST CREATE AKUN - MANAJEMEN AKUN (TATA USAHA)
══════════════════════════════════════════════════════════════════

📍 STEP 1: Login sebagai Admin TU...
   ✅ Login berhasil!

📍 STEP 2: Membuka halaman Manajemen Akun...
   ✅ Halaman terbuka: Manajemen Akun

📍 STEP 3: Klik tombol Tambah User...
   ✅ Modal Tambah User terbuka

📍 STEP 4: Mengisi form user baru...
   ✅ Semua field diisi

📍 STEP 5: Submit form...
   ✅ Form disubmit

📍 STEP 6: Verifikasi user berhasil dibuat...
   ✅ User ditemukan di tabel
   ✅ CREATE USER BERHASIL! 🎉

══════════════════════════════════════════════════════════════════
  ✅ SEMUA TEST SELESAI!
══════════════════════════════════════════════════════════════════
```

## 🔑 Kredensial

**Admin TU (untuk login):**
```
Email    : admin@polibatam.ac.id
Password : admin123
Role     : TU
```

**User Baru (yang dibuat oleh test):**
```
Email    : test_random@polibatam.ac.id  (random generated)
Password : test12345
Role     : Tim Akreditasi / P4M / TU
```

## 🛠️ Troubleshooting

### Test gagal di login?
```bash
# Cek kredensial di file test
ADMIN_EMAIL = "admin@polibatam.ac.id"
ADMIN_PASSWORD = "admin123"
```

### Modal tidak terbuka?
```python
# Tunggu lebih lama
time.sleep(2)
```

### User tidak muncul di tabel?
```python
# Cek:
1. Backend running?
2. Database OK?
3. Browser console errors?
```

### Browser tidak muncul?
```bash
# Install ChromeDriver
pip install webdriver-manager
```

## 📚 Files Created

```
selenium-tests/
├── page_objects/
│   ├── __init__.py
│   ├── login_page.py
│   └── manajemen_akun_page.py        ← NEW!
├── test_create_akun.py               ← NEW!
├── test_create_akun_simple.py        ← NEW!
├── TEST_CREATE_AKUN.md               ← NEW!
└── QUICK_CREATE_AKUN.md              ← This file
```

## 🎯 Test Scenarios

| # | Test Scenario | Status |
|---|---------------|--------|
| 1 | Page loads successfully | ✅ |
| 2 | "Tambah User" button works | ✅ |
| 3 | Modal opens with all fields | ✅ |
| 4 | Create Tim Akreditasi user | ✅ |
| 5 | Create P4M user | ✅ |
| 6 | Validation: empty password | ✅ |
| 7 | Validation: duplicate email | ✅ |
| 8 | Close modal with "Batal" | ✅ |
| 9 | Close modal with X button | ✅ |
| 10 | Filter by role works | ✅ |
| 11 | Complete flow success | ✅ |

## 💡 Next Steps

Setelah test ini berhasil, Anda bisa:

1. **Test Edit User** - Update data user existing
2. **Test Delete User** - Hapus user dari sistem
3. **Test Upload Photo** - Upload foto profil
4. **Test Change Password** - Ganti password user
5. **Test Role Access** - Verify role-based permissions

## 🔗 Learn More

- [README.md](README.md) - Full documentation
- [QUICKSTART.md](QUICKSTART.md) - Setup guide
- [TEST_CREATE_AKUN.md](TEST_CREATE_AKUN.md) - Detailed docs

---

**🎉 Happy Testing!**

*Test create akun berhasil dibuat dan ready to use!*
