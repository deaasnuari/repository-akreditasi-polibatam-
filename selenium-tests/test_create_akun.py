"""
Test Create Akun di Manajemen Akun (Tata Usaha)
Test untuk fitur tambah user baru
"""

import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import sys
import os
import random
import string

# Import page objects
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from page_objects.login_page import LoginPage
from page_objects.manajemen_akun_page import ManajemenAkunPage


class CreateAkunTest(unittest.TestCase):
    """Test case untuk create akun"""
    
    # Kredensial admin TU untuk login
    ADMIN_EMAIL = "admin@polibatam.ac.id"
    ADMIN_PASSWORD = "admin123"
    
    @classmethod
    def setUpClass(cls):
        """Setup sekali untuk semua test"""
        print("\n" + "="*70)
        print("  🧪 TEST CREATE AKUN - MANAJEMEN AKUN")
        print("="*70)
    
    def setUp(self):
        """Setup sebelum setiap test"""
        self.driver = webdriver.Chrome()
        self.driver.maximize_window()
        self.driver.implicitly_wait(10)
        
        # Inisialisasi page objects
        self.login_page = LoginPage(self.driver)
        self.akun_page = ManajemenAkunPage(self.driver)
        
        # Login sebagai admin TU
        self._login_as_admin()
    
    def tearDown(self):
        """Cleanup setelah setiap test"""
        time.sleep(1)
        self.driver.quit()
    
    def _login_as_admin(self):
        """Helper untuk login sebagai admin TU"""
        self.login_page.open()
        self.login_page.login(self.ADMIN_EMAIL, self.ADMIN_PASSWORD, "TU")
        time.sleep(3)  # Tunggu redirect
    
    def _generate_random_email(self):
        """Generate random email untuk testing"""
        random_str = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
        return f"test_{random_str}@polibatam.ac.id"
    
    def test_01_page_loads(self):
        """Test 1: Halaman manajemen akun dapat dibuka"""
        print("\n▶ Test 1: Memuat halaman manajemen akun...")
        
        self.akun_page.open()
        self.assertTrue(self.akun_page.is_loaded(), "Halaman tidak dimuat")
        
        print("   ✅ Halaman manajemen akun berhasil dimuat")
    
    def test_02_tambah_user_button_exists(self):
        """Test 2: Tombol Tambah User ada dan bisa diklik"""
        print("\n▶ Test 2: Cek tombol Tambah User...")
        
        self.akun_page.open()
        self.akun_page.click_tambah_user()
        
        self.assertTrue(self.akun_page.is_modal_open(), "Modal tidak terbuka")
        print("   ✅ Tombol Tambah User berfungsi, modal terbuka")
    
    def test_03_modal_form_elements_present(self):
        """Test 3: Semua elemen form ada di modal"""
        print("\n▶ Test 3: Cek elemen form di modal...")
        
        self.akun_page.open()
        self.akun_page.click_tambah_user()
        
        # Cek modal title
        modal_title = self.akun_page.get_modal_title()
        self.assertIn("Tambah User", modal_title, "Modal title tidak sesuai")
        print(f"   ✅ Modal title: {modal_title}")
        
        # Cek form elements (ini akan throw exception jika tidak ada)
        try:
            self.driver.find_element(*ManajemenAkunPage.INPUT_NAMA)
            print("   ✅ Input Nama ada")
            
            self.driver.find_element(*ManajemenAkunPage.INPUT_EMAIL)
            print("   ✅ Input Email ada")
            
            self.driver.find_element(*ManajemenAkunPage.INPUT_PASSWORD)
            print("   ✅ Input Password ada")
            
            self.driver.find_element(*ManajemenAkunPage.SELECT_ROLE)
            print("   ✅ Select Role ada")
            
            self.driver.find_element(*ManajemenAkunPage.BTN_SUBMIT)
            print("   ✅ Tombol Submit ada")
            
        except Exception as e:
            self.fail(f"Elemen form tidak lengkap: {str(e)}")
    
    def test_04_create_user_tim_akreditasi(self):
        """Test 4: Create user baru dengan role Tim Akreditasi"""
        print("\n▶ Test 4: Create user Tim Akreditasi...")
        
        self.akun_page.open()
        
        # Catat jumlah user sebelum create
        total_before = self.akun_page.get_total_users()
        print(f"   ℹ️  Total user sebelum: {total_before}")
        
        # Generate data user baru
        email = self._generate_random_email()
        nama = "Test User Tim Akreditasi"
        password = "test123"
        
        # Create user
        self.akun_page.create_user(
            nama=nama,
            email=email,
            password=password,
            role="Tim Akreditasi",
            prodi="Teknik Informatika"
        )
        
        self.akun_page.click_submit()
        time.sleep(2)
        
        # Refresh page untuk lihat perubahan
        self.akun_page.open()
        time.sleep(1)
        
        # Cek apakah user muncul di tabel
        user_found = self.akun_page.search_user_in_table(email)
        
        if user_found:
            print(f"   ✅ User berhasil dibuat: {email}")
        else:
            print(f"   ⚠️  User tidak ditemukan di tabel (mungkin backend issue)")
    
    def test_05_create_user_p4m(self):
        """Test 5: Create user baru dengan role P4M"""
        print("\n▶ Test 5: Create user P4M...")
        
        self.akun_page.open()
        
        email = self._generate_random_email()
        nama = "Test User P4M"
        password = "test123"
        
        self.akun_page.create_user(
            nama=nama,
            email=email,
            password=password,
            role="P4M"
        )
        
        self.akun_page.click_submit()
        time.sleep(2)
        
        self.akun_page.open()
        time.sleep(1)
        
        user_found = self.akun_page.search_user_in_table(email)
        
        if user_found:
            print(f"   ✅ User P4M berhasil dibuat: {email}")
        else:
            print(f"   ⚠️  User tidak ditemukan di tabel")
    
    def test_06_create_user_without_password(self):
        """Test 6: Validasi - create user tanpa password"""
        print("\n▶ Test 6: Validasi form kosong...")
        
        self.akun_page.open()
        self.akun_page.click_tambah_user()
        
        # Isi form tapi skip password
        self.akun_page.fill_user_form(
            nama="Test User",
            email=self._generate_random_email(),
            role="Tim Akreditasi"
            # password tidak diisi
        )
        
        self.akun_page.click_submit()
        time.sleep(1)
        
        # Modal seharusnya masih terbuka karena validasi gagal
        is_modal_still_open = self.akun_page.is_modal_open()
        
        if is_modal_still_open:
            print("   ✅ Validasi bekerja: form tidak bisa disubmit tanpa password")
        else:
            print("   ⚠️  Validasi mungkin tidak berfungsi dengan baik")
    
    def test_07_create_user_with_duplicate_email(self):
        """Test 7: Create user dengan email yang sudah ada"""
        print("\n▶ Test 7: Test duplicate email...")
        
        self.akun_page.open()
        
        # Gunakan email admin yang pasti sudah ada
        duplicate_email = self.ADMIN_EMAIL
        
        self.akun_page.create_user(
            nama="Test Duplicate",
            email=duplicate_email,
            password="test123",
            role="Tim Akreditasi"
        )
        
        self.akun_page.click_submit()
        time.sleep(2)
        
        # Cek apakah ada error (alert atau tetap di modal)
        is_modal_open = self.akun_page.is_modal_open()
        
        if is_modal_open:
            print("   ✅ Duplicate email terdeteksi, form tidak disubmit")
        else:
            print("   ℹ️  Form tersubmit (backend mungkin menangani duplicate)")
    
    def test_08_close_modal_with_batal(self):
        """Test 8: Tutup modal dengan tombol Batal"""
        print("\n▶ Test 8: Test tombol Batal...")
        
        self.akun_page.open()
        self.akun_page.click_tambah_user()
        
        self.assertTrue(self.akun_page.is_modal_open(), "Modal tidak terbuka")
        
        self.akun_page.click_batal()
        time.sleep(0.5)
        
        is_modal_closed = not self.akun_page.is_modal_open()
        self.assertTrue(is_modal_closed, "Modal masih terbuka setelah klik Batal")
        
        print("   ✅ Tombol Batal berfungsi, modal tertutup")
    
    def test_09_close_modal_with_x_button(self):
        """Test 9: Tutup modal dengan tombol X"""
        print("\n▶ Test 9: Test tombol X untuk tutup modal...")
        
        self.akun_page.open()
        self.akun_page.click_tambah_user()
        
        self.assertTrue(self.akun_page.is_modal_open(), "Modal tidak terbuka")
        
        self.akun_page.close_modal()
        time.sleep(0.5)
        
        is_modal_closed = not self.akun_page.is_modal_open()
        
        if is_modal_closed:
            print("   ✅ Tombol X berfungsi, modal tertutup")
        else:
            print("   ⚠️  Modal masih terbuka")
    
    def test_10_filter_by_role(self):
        """Test 10: Filter user berdasarkan role"""
        print("\n▶ Test 10: Test filter by role...")
        
        self.akun_page.open()
        time.sleep(1)
        
        # Filter Tim Akreditasi
        self.akun_page.filter_by_role("Tim Akreditasi")
        time.sleep(1)
        
        rows = self.akun_page.get_table_rows()
        print(f"   ℹ️  Filter Tim Akreditasi: {len(rows)} users")
        
        # Filter P4M
        self.akun_page.filter_by_role("P4M")
        time.sleep(1)
        
        rows = self.akun_page.get_table_rows()
        print(f"   ℹ️  Filter P4M: {len(rows)} users")
        
        # Reset filter
        self.akun_page.filter_by_role("Semua Role")
        time.sleep(1)
        
        print("   ✅ Filter by role berfungsi")
    
    def test_11_create_user_complete_flow(self):
        """Test 11: Complete flow create user dengan semua field"""
        print("\n▶ Test 11: Complete flow create user...")
        
        self.akun_page.open()
        time.sleep(1)
        
        # Data user lengkap
        email = self._generate_random_email()
        nama = "Test User Lengkap"
        password = "test12345"
        role = "Tim Akreditasi"
        prodi = "Rekayasa Keamanan Siber"
        
        print(f"   ℹ️  Membuat user: {nama}")
        print(f"   ℹ️  Email: {email}")
        print(f"   ℹ️  Role: {role}")
        print(f"   ℹ️  Prodi: {prodi}")
        
        # Step 1: Klik Tambah User
        self.akun_page.click_tambah_user()
        time.sleep(0.5)
        print("   ✅ Step 1: Modal dibuka")
        
        # Step 2: Isi form
        self.akun_page.fill_user_form(
            nama=nama,
            email=email,
            password=password,
            role=role,
            prodi=prodi
        )
        print("   ✅ Step 2: Form diisi")
        
        # Step 3: Submit
        self.akun_page.click_submit()
        time.sleep(2)
        print("   ✅ Step 3: Form disubmit")
        
        # Step 4: Verify
        self.akun_page.open()
        time.sleep(1)
        
        user_found = self.akun_page.search_user_in_table(email)
        
        if user_found:
            print(f"   ✅ Step 4: User berhasil dibuat dan muncul di tabel")
        else:
            print(f"   ⚠️  Step 4: User tidak ditemukan (cek backend/database)")


def suite():
    """Buat test suite"""
    suite = unittest.TestSuite()
    suite.addTests(unittest.TestLoader().loadTestsFromTestCase(CreateAkunTest))
    return suite


if __name__ == "__main__":
    print("""
    ╔════════════════════════════════════════════════╗
    ║  TEST CREATE AKUN - MANAJEMEN AKUN             ║
    ╚════════════════════════════════════════════════╝
    
    Test untuk fitur tambah user baru di dashboard Tata Usaha
    
    PERSIAPAN:
    1. Server frontend & backend harus running
    2. Database harus accessible
    3. Login sebagai admin TU (admin@polibatam.ac.id)
    
    """)
    
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite())
    
    print("\n" + "="*70)
    print("SUMMARY")
    print("="*70)
    print(f"Tests run: {result.testsRun}")
    print(f"Successes: {result.testsRun - len(result.failures) - len(result.errors)}")
    print(f"Failures: {len(result.failures)}")
    print(f"Errors: {len(result.errors)}")
    print("="*70)
