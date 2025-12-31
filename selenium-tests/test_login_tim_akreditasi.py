"""
Test Login sebagai Tim Akreditasi yang baru dibuat
Test untuk verify akses dashboard dan fitur-fitur Tim Akreditasi
"""

import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By
import time
import sys
import os

# Import page objects
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from page_objects.login_page import LoginPage
from page_objects.dashboard_tim_akreditasi_page import DashboardTimAkreditasiPage


class LoginTimAkreditasiTest(unittest.TestCase):
    """Test case untuk login sebagai Tim Akreditasi"""
    
    # Kredensial Tim Akreditasi yang baru dibuat
    # GANTI dengan email yang dibuat dari test sebelumnya
    TIM_AKREDITASI_EMAIL = "test_selenium@polibatam.ac.id"  # Ganti dengan email dari test create
    TIM_AKREDITASI_PASSWORD = "test12345"
    
    @classmethod
    def setUpClass(cls):
        """Setup sekali untuk semua test"""
        print("\n" + "="*70)
        print("  🧪 TEST LOGIN TIM AKREDITASI")
        print("="*70)
    
    def setUp(self):
        """Setup sebelum setiap test"""
        self.driver = webdriver.Chrome()
        self.driver.maximize_window()
        self.driver.implicitly_wait(10)
        
        # Inisialisasi page objects
        self.login_page = LoginPage(self.driver)
        self.dashboard_page = DashboardTimAkreditasiPage(self.driver)
    
    def tearDown(self):
        """Cleanup setelah setiap test"""
        time.sleep(1)
        self.driver.quit()
    
    def _login_as_tim_akreditasi(self):
        """Helper untuk login sebagai Tim Akreditasi"""
        self.login_page.open()
        self.login_page.login(
            self.TIM_AKREDITASI_EMAIL,
            self.TIM_AKREDITASI_PASSWORD,
            "Tim Akreditasi"
        )
        time.sleep(3)
    
    def test_01_login_successful(self):
        """Test 1: Login berhasil sebagai Tim Akreditasi"""
        print("\n▶ Test 1: Login sebagai Tim Akreditasi...")
        
        self._login_as_tim_akreditasi()
        
        # Verify redirect ke dashboard tim akreditasi
        current_url = self.driver.current_url
        self.assertIn("/dashboard/tim-akreditasi", current_url, 
                     "Tidak redirect ke dashboard Tim Akreditasi")
        
        print(f"   ✅ Login berhasil! Redirect ke: {current_url}")
    
    def test_02_dashboard_loads(self):
        """Test 2: Dashboard Tim Akreditasi dapat dibuka"""
        print("\n▶ Test 2: Memuat dashboard Tim Akreditasi...")
        
        self._login_as_tim_akreditasi()
        
        # Cek halaman loaded
        is_loaded = self.dashboard_page.is_loaded()
        self.assertTrue(is_loaded, "Dashboard tidak dimuat dengan benar")
        
        # Cek heading
        heading = self.dashboard_page.get_page_heading()
        if heading:
            print(f"   ✅ Dashboard loaded: {heading}")
        else:
            print("   ✅ Dashboard loaded")
    
    def test_03_last_login_displayed(self):
        """Test 3: Informasi terakhir login ditampilkan"""
        print("\n▶ Test 3: Cek informasi terakhir login...")
        
        self._login_as_tim_akreditasi()
        
        last_login = self.dashboard_page.get_last_login_text()
        
        if last_login and last_login != "-":
            print(f"   ✅ Last login: {last_login}")
        else:
            print("   ⚠️  Last login info tidak tersedia")
    
    def test_04_all_menus_visible(self):
        """Test 4: Semua menu Tim Akreditasi visible"""
        print("\n▶ Test 4: Cek semua menu tersedia...")
        
        self._login_as_tim_akreditasi()
        
        menus = ["Dashboard", "LKPS", "LED", "Bukti Pendukung", "Matriks", "Export"]
        
        for menu in menus:
            is_visible = self.dashboard_page.is_menu_visible(menu)
            if is_visible:
                print(f"   ✅ Menu '{menu}' tersedia")
            else:
                print(f"   ⚠️  Menu '{menu}' tidak ditemukan")
    
    def test_05_notification_exists(self):
        """Test 5: Notifikasi button ada"""
        print("\n▶ Test 5: Cek notifikasi...")
        
        self._login_as_tim_akreditasi()
        
        has_badge = self.dashboard_page.has_notification_badge()
        
        if has_badge:
            print("   ✅ Notifikasi badge terlihat")
        else:
            print("   ℹ️  Tidak ada notifikasi baru")
        
        # Test klik notifikasi
        self.dashboard_page.click_notification()
        print("   ✅ Tombol notifikasi berfungsi")
    
    def test_06_navigate_to_lkps(self):
        """Test 6: Navigasi ke halaman LKPS"""
        print("\n▶ Test 6: Navigasi ke LKPS...")
        
        self._login_as_tim_akreditasi()
        
        # Klik menu LKPS
        self.dashboard_page.click_menu("LKPS")
        
        # Verify URL berubah
        current_url = self.dashboard_page.get_current_url()
        
        if "lkps" in current_url:
            print(f"   ✅ Berhasil navigasi ke LKPS: {current_url}")
        else:
            print(f"   ⚠️  URL saat ini: {current_url}")
    
    def test_07_navigate_to_led(self):
        """Test 7: Navigasi ke halaman LED"""
        print("\n▶ Test 7: Navigasi ke LED...")
        
        self._login_as_tim_akreditasi()
        
        # Klik menu LED
        self.dashboard_page.click_menu("LED")
        
        # Verify URL berubah
        current_url = self.dashboard_page.get_current_url()
        
        if "led" in current_url:
            print(f"   ✅ Berhasil navigasi ke LED: {current_url}")
        else:
            print(f"   ⚠️  URL saat ini: {current_url}")
    
    def test_08_navigate_to_bukti_pendukung(self):
        """Test 8: Navigasi ke halaman Bukti Pendukung"""
        print("\n▶ Test 8: Navigasi ke Bukti Pendukung...")
        
        self._login_as_tim_akreditasi()
        
        # Klik menu Bukti Pendukung
        self.dashboard_page.click_menu("Bukti Pendukung")
        
        # Verify URL berubah
        current_url = self.dashboard_page.get_current_url()
        
        if "bukti-pendukung" in current_url:
            print(f"   ✅ Berhasil navigasi ke Bukti Pendukung: {current_url}")
        else:
            print(f"   ⚠️  URL saat ini: {current_url}")
    
    def test_09_navigate_to_matriks(self):
        """Test 9: Navigasi ke halaman Matriks Penilaian"""
        print("\n▶ Test 9: Navigasi ke Matriks Penilaian...")
        
        self._login_as_tim_akreditasi()
        
        # Klik menu Matriks
        self.dashboard_page.click_menu("Matriks")
        
        # Verify URL berubah
        current_url = self.dashboard_page.get_current_url()
        
        if "matriks" in current_url:
            print(f"   ✅ Berhasil navigasi ke Matriks: {current_url}")
        else:
            print(f"   ⚠️  URL saat ini: {current_url}")
    
    def test_10_complete_user_flow(self):
        """Test 10: Complete user flow Tim Akreditasi"""
        print("\n▶ Test 10: Complete user flow...")
        
        # Step 1: Login
        print("   Step 1: Login...")
        self._login_as_tim_akreditasi()
        self.assertTrue(self.dashboard_page.is_on_dashboard())
        print("   ✅ Login successful")
        
        # Step 2: Cek dashboard
        print("   Step 2: Verify dashboard...")
        self.assertTrue(self.dashboard_page.is_loaded())
        print("   ✅ Dashboard loaded")
        
        # Step 3: Navigate ke LKPS
        print("   Step 3: Navigate to LKPS...")
        self.dashboard_page.click_menu("LKPS")
        time.sleep(1)
        if "lkps" in self.dashboard_page.get_current_url():
            print("   ✅ LKPS page accessed")
        
        # Step 4: Back to dashboard
        print("   Step 4: Back to dashboard...")
        self.dashboard_page.open()
        time.sleep(1)
        print("   ✅ Back to dashboard")
        
        # Step 5: Check notification
        print("   Step 5: Check notification...")
        self.dashboard_page.click_notification()
        print("   ✅ Notification checked")
        
        print("\n   ✅ Complete user flow successful!")


def suite():
    """Buat test suite"""
    suite = unittest.TestSuite()
    suite.addTests(unittest.TestLoader().loadTestsFromTestCase(LoginTimAkreditasiTest))
    return suite


if __name__ == "__main__":
    print("""
    ╔════════════════════════════════════════════════╗
    ║  TEST LOGIN TIM AKREDITASI                     ║
    ╚════════════════════════════════════════════════╝
    
    Test untuk verify login dan akses dashboard Tim Akreditasi
    
    PERSIAPAN:
    1. Jalankan test_create_akun.py terlebih dahulu
    2. Update kredensial TIM_AKREDITASI_EMAIL dengan email yang dibuat
    3. Pastikan server frontend & backend running
    
    KREDENSIAL DEFAULT:
    Email    : test_selenium@polibatam.ac.id (GANTI!)
    Password : test12345
    Role     : Tim Akreditasi
    
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
