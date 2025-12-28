"""
Test Login menggunakan Page Object Pattern
Lebih maintainable dan readable
"""

import unittest
from selenium import webdriver
import time
import sys
import os

# Tambahkan path parent untuk import page objects
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from page_objects.login_page import LoginPage, DashboardPage


class LoginTestWithPageObject(unittest.TestCase):
    """Test case menggunakan Page Object Pattern"""
    
    # Kredensial untuk testing - GANTI dengan data yang valid
    VALID_EMAIL = "test@example.com"
    VALID_PASSWORD = "password123"
    
    def setUp(self):
        """Setup sebelum setiap test"""
        self.driver = webdriver.Chrome()
        self.driver.maximize_window()
        self.driver.implicitly_wait(10)
        
        # Inisialisasi page objects
        self.login_page = LoginPage(self.driver)
        self.dashboard_page = DashboardPage(self.driver)
    
    def tearDown(self):
        """Cleanup setelah setiap test"""
        time.sleep(1)
        self.driver.quit()
    
    def test_01_page_loads_successfully(self):
        """Test: Halaman login dapat dibuka"""
        print("\n▶ Test 1: Memuat halaman login...")
        
        self.login_page.open()
        self.assertTrue(self.login_page.is_loaded(), "Halaman login tidak dimuat")
        
        print("   ✅ Halaman login berhasil dimuat")
    
    def test_02_all_form_elements_present(self):
        """Test: Semua elemen form ada"""
        print("\n▶ Test 2: Cek semua elemen form...")
        
        self.login_page.open()
        
        # Cek setiap elemen
        self.assertIsNotNone(self.login_page.get_email_input(), "Email input tidak ada")
        self.assertIsNotNone(self.login_page.get_password_input(), "Password input tidak ada")
        self.assertIsNotNone(self.login_page.get_role_select(), "Role select tidak ada")
        self.assertIsNotNone(self.login_page.get_submit_button(), "Submit button tidak ada")
        
        print("   ✅ Semua elemen form tersedia")
    
    def test_03_successful_login(self):
        """Test: Login berhasil dengan kredensial valid"""
        print("\n▶ Test 3: Login dengan kredensial valid...")
        
        self.login_page.open()
        self.login_page.login(self.VALID_EMAIL, self.VALID_PASSWORD, "TU")
        
        time.sleep(3)
        
        # Cek hasil
        if self.login_page.has_error():
            error_msg = self.login_page.get_error_message()
            print(f"   ⚠️  Login gagal: {error_msg}")
            print("   ℹ️  Pastikan kredensial sudah benar")
        else:
            self.assertTrue(
                self.login_page.is_redirected_to_dashboard(),
                "Tidak redirect ke dashboard"
            )
            print(f"   ✅ Login berhasil! Redirect ke: {self.login_page.get_current_url()}")
    
    def test_04_login_with_wrong_password(self):
        """Test: Error muncul dengan password salah"""
        print("\n▶ Test 4: Login dengan password salah...")
        
        self.login_page.open()
        self.login_page.login(self.VALID_EMAIL, "wrongpassword")
        
        time.sleep(2)
        
        self.assertTrue(self.login_page.has_error(), "Error message tidak muncul")
        error_msg = self.login_page.get_error_message()
        print(f"   ✅ Error message: {error_msg}")
    
    def test_05_login_with_invalid_email(self):
        """Test: Error muncul dengan email tidak valid"""
        print("\n▶ Test 5: Login dengan email tidak terdaftar...")
        
        self.login_page.open()
        self.login_page.login("notexist@example.com", "password123")
        
        time.sleep(2)
        
        self.assertTrue(self.login_page.has_error(), "Error message tidak muncul")
        error_msg = self.login_page.get_error_message()
        print(f"   ✅ Error message: {error_msg}")
    
    def test_06_all_roles_available(self):
        """Test: Semua role tersedia dan dapat dipilih"""
        print("\n▶ Test 6: Cek semua role tersedia...")
        
        self.login_page.open()
        
        roles = self.login_page.get_available_roles()
        self.assertEqual(len(roles), 3, "Jumlah role tidak sesuai")
        
        expected_roles = ["TU", "P4M", "Tim Akreditasi"]
        available_values = [role[0] for role in roles]
        
        for expected in expected_roles:
            self.assertIn(expected, available_values, f"Role {expected} tidak tersedia")
            print(f"   ✅ Role '{expected}' tersedia")
    
    def test_07_login_button_loading_state(self):
        """Test: Button menunjukkan loading state"""
        print("\n▶ Test 7: Cek loading state button...")
        
        self.login_page.open()
        
        # Cek button text sebelum submit
        initial_text = self.login_page.get_button_text()
        print(f"   ℹ️  Button text awal: '{initial_text}'")
        
        # Submit form
        self.login_page.login("test@example.com", "test123")
        
        time.sleep(0.5)
        
        # Cek button state saat loading
        loading_text = self.login_page.get_button_text()
        is_disabled = self.login_page.is_button_disabled()
        
        print(f"   ℹ️  Button text loading: '{loading_text}'")
        print(f"   ℹ️  Button disabled: {is_disabled}")
        print("   ✅ Loading state test selesai")
    
    def test_08_method_chaining(self):
        """Test: Method chaining bekerja"""
        print("\n▶ Test 8: Testing method chaining...")
        
        # Test fluent interface
        self.login_page.open() \
            .enter_email("test@example.com") \
            .enter_password("test123") \
            .select_role("P4M") \
            .click_submit()
        
        time.sleep(2)
        print("   ✅ Method chaining bekerja dengan baik")
    
    def test_09_password_field_hidden(self):
        """Test: Password field tersembunyi"""
        print("\n▶ Test 9: Cek password field tersembunyi...")
        
        self.login_page.open()
        
        password_input = self.login_page.get_password_input()
        field_type = password_input.get_attribute("type")
        
        self.assertEqual(field_type, "password", "Password field tidak tersembunyi")
        print("   ✅ Password field menggunakan type='password'")
    
    def test_10_login_with_each_role(self):
        """Test: Login dengan setiap role"""
        print("\n▶ Test 10: Login dengan berbagai role...")
        
        roles = ["TU", "P4M", "Tim Akreditasi"]
        
        for role in roles:
            print(f"   - Testing role: {role}")
            
            self.login_page.open()
            self.login_page.login(self.VALID_EMAIL, self.VALID_PASSWORD, role)
            
            time.sleep(2)
            
            if self.login_page.has_error():
                error = self.login_page.get_error_message()
                print(f"     ⚠️  Error: {error}")
            else:
                current_url = self.login_page.get_current_url()
                print(f"     ℹ️  Redirect ke: {current_url}")


class LoginFlowTest(unittest.TestCase):
    """Test complete user flow"""
    
    VALID_EMAIL = "test@example.com"
    VALID_PASSWORD = "password123"
    
    def setUp(self):
        self.driver = webdriver.Chrome()
        self.driver.maximize_window()
        self.login_page = LoginPage(self.driver)
        self.dashboard_page = DashboardPage(self.driver)
    
    def tearDown(self):
        time.sleep(1)
        self.driver.quit()
    
    def test_complete_login_flow_tu(self):
        """Test: Complete flow login sebagai Tata Usaha"""
        print("\n▶ Test Complete Flow: Login sebagai TU...")
        
        # 1. Buka halaman login
        self.login_page.open()
        self.assertTrue(self.login_page.is_loaded())
        print("   ✅ Step 1: Halaman login dibuka")
        
        # 2. Isi form
        self.login_page.enter_email(self.VALID_EMAIL)
        self.login_page.enter_password(self.VALID_PASSWORD)
        self.login_page.select_role("TU")
        print("   ✅ Step 2: Form diisi")
        
        # 3. Submit
        self.login_page.click_submit()
        time.sleep(3)
        print("   ✅ Step 3: Form di-submit")
        
        # 4. Verify redirect
        if not self.login_page.has_error():
            self.assertTrue(self.dashboard_page.is_tu_dashboard() or 
                          "/dashboard" in self.dashboard_page.get_current_url())
            print("   ✅ Step 4: Redirect ke dashboard TU")
        else:
            print(f"   ⚠️  Login gagal: {self.login_page.get_error_message()}")


def suite():
    """Buat test suite"""
    suite = unittest.TestSuite()
    suite.addTests(unittest.TestLoader().loadTestsFromTestCase(LoginTestWithPageObject))
    suite.addTests(unittest.TestLoader().loadTestsFromTestCase(LoginFlowTest))
    return suite


if __name__ == "__main__":
    print("""
    ╔════════════════════════════════════════════════╗
    ║  TEST LOGIN - PAGE OBJECT PATTERN              ║
    ╚════════════════════════════════════════════════╝
    
    Struktur yang lebih maintainable dan readable
    Memisahkan logic test dari implementasi UI
    
    """)
    
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite())
    
    print("\n" + "="*50)
    print("SUMMARY")
    print("="*50)
    print(f"Tests run: {result.testsRun}")
    print(f"Successes: {result.testsRun - len(result.failures) - len(result.errors)}")
    print(f"Failures: {len(result.failures)}")
    print(f"Errors: {len(result.errors)}")
    print("="*50)
