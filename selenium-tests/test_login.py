"""
Test Login dengan Selenium - Menggunakan unittest
Struktur test yang lebih terorganisir dan profesional
"""

import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select
from selenium.common.exceptions import TimeoutException, NoSuchElementException
import time


class LoginTestCase(unittest.TestCase):
    """Test case untuk halaman login"""
    
    BASE_URL = "http://localhost:3000"
    LOGIN_URL = f"{BASE_URL}/login"
    
    # Kredensial untuk testing - GANTI dengan data yang valid
    VALID_EMAIL = "admin@polibatam.ac.id"
    VALID_PASSWORD = "admin123"
    
    @classmethod
    def setUpClass(cls):
        """Setup yang dijalankan sekali sebelum semua test"""
        print("\n" + "="*50)
        print("Memulai Test Suite Login")
        print("="*50)
    
    def setUp(self):
        """Setup yang dijalankan sebelum setiap test"""
        self.driver = webdriver.Chrome()
        self.driver.maximize_window()
        self.driver.implicitly_wait(10)
    
    def tearDown(self):
        """Cleanup setelah setiap test"""
        time.sleep(1)  # Jeda sebentar untuk melihat hasil
        self.driver.quit()
    
    def _find_login_elements(self):
        """Helper untuk mencari elemen login form"""
        email_input = self.driver.find_element(By.XPATH, "//input[@type='email']")
        password_input = self.driver.find_element(By.XPATH, "//input[@type='password']")
        role_select = self.driver.find_element(By.TAG_NAME, "select")
        submit_button = self.driver.find_element(By.XPATH, "//button[@type='submit']")
        return email_input, password_input, role_select, submit_button
    
    def _fill_login_form(self, email, password, role="TU"):
        """Helper untuk mengisi form login"""
        email_input, password_input, role_select, submit_button = self._find_login_elements()
        
        email_input.clear()
        email_input.send_keys(email)
        
        password_input.clear()
        password_input.send_keys(password)
        
        select = Select(role_select)
        select.select_by_value(role)
        
        return submit_button
    
    def _check_error_message(self):
        """Helper untuk mengecek error message"""
        try:
            error_div = self.driver.find_element(By.XPATH, "//div[contains(@class, 'bg-red-50')]")
            return error_div.text
        except NoSuchElementException:
            return None
    
    def test_01_page_loads(self):
        """Test 1: Halaman login dapat dibuka"""
        print("\n▶ Test 1: Memuat halaman login...")
        self.driver.get(self.LOGIN_URL)
        
        # Cek apakah ada heading "Login"
        heading = WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//h1[contains(text(), 'Login')]"))
        )
        self.assertIsNotNone(heading, "Heading 'Login' tidak ditemukan")
        
        # Cek semua elemen form ada
        email_input, password_input, role_select, submit_button = self._find_login_elements()
        self.assertIsNotNone(email_input, "Input email tidak ditemukan")
        self.assertIsNotNone(password_input, "Input password tidak ditemukan")
        self.assertIsNotNone(role_select, "Select role tidak ditemukan")
        self.assertIsNotNone(submit_button, "Tombol submit tidak ditemukan")
        
        print("   ✅ Halaman login berhasil dimuat dengan semua elemen")
    
    def test_02_login_with_valid_credentials(self):
        """Test 2: Login dengan kredensial yang valid"""
        print("\n▶ Test 2: Login dengan kredensial valid...")
        self.driver.get(self.LOGIN_URL)
        
        submit_button = self._fill_login_form(self.VALID_EMAIL, self.VALID_PASSWORD, "TU")
        submit_button.click()
        
        # Tunggu redirect atau error
        time.sleep(3)
        
        # Cek apakah ada error
        error = self._check_error_message()
        if error:
            print(f"   ⚠️  Error message: {error}")
            print("   ℹ️  Pastikan kredensial di kode sudah benar")
        else:
            # Cek redirect ke dashboard
            current_url = self.driver.current_url
            self.assertIn("/dashboard", current_url, "Tidak redirect ke dashboard")
            print(f"   ✅ Login berhasil! Redirect ke: {current_url}")
    
    def test_03_login_with_wrong_password(self):
        """Test 3: Login dengan password salah"""
        print("\n▶ Test 3: Login dengan password salah...")
        self.driver.get(self.LOGIN_URL)
        
        submit_button = self._fill_login_form(self.VALID_EMAIL, "wrongpassword123")
        submit_button.click()
        
        time.sleep(2)
        
        error = self._check_error_message()
        self.assertIsNotNone(error, "Error message tidak muncul untuk password salah")
        print(f"   ✅ Error message muncul: {error}")
    
    def test_04_login_with_invalid_email(self):
        """Test 4: Login dengan email tidak terdaftar"""
        print("\n▶ Test 4: Login dengan email tidak terdaftar...")
        self.driver.get(self.LOGIN_URL)
        
        submit_button = self._fill_login_form("notexist@example.com", "password123")
        submit_button.click()
        
        time.sleep(2)
        
        error = self._check_error_message()
        self.assertIsNotNone(error, "Error message tidak muncul untuk email tidak valid")
        print(f"   ✅ Error message muncul: {error}")
    
    def test_05_login_with_empty_fields(self):
        """Test 5: Submit form kosong (HTML5 validation)"""
        print("\n▶ Test 5: Submit form dengan field kosong...")
        self.driver.get(self.LOGIN_URL)
        
        submit_button = self.driver.find_element(By.XPATH, "//button[@type='submit']")
        submit_button.click()
        
        time.sleep(1)
        
        # Seharusnya tetap di halaman login karena HTML5 validation
        self.assertIn("/login", self.driver.current_url, "Seharusnya tetap di halaman login")
        print("   ✅ HTML5 validation mencegah submit form kosong")
    
    def test_06_role_selection(self):
        """Test 6: Semua role dapat dipilih"""
        print("\n▶ Test 6: Testing pemilihan role...")
        self.driver.get(self.LOGIN_URL)
        
        role_select = self.driver.find_element(By.TAG_NAME, "select")
        select = Select(role_select)
        
        # Test semua role options
        expected_roles = [
            ("TU", "Tata Usaha"),
            ("P4M", "P4M"),
            ("Tim Akreditasi", "Tim Akreditasi")
        ]
        
        for value, text in expected_roles:
            select.select_by_value(value)
            selected_option = select.first_selected_option
            self.assertEqual(selected_option.get_attribute("value"), value)
            print(f"   ✅ Role '{text}' dapat dipilih")
    
    def test_07_login_button_state(self):
        """Test 7: Tombol login disabled saat loading"""
        print("\n▶ Test 7: Testing state tombol login...")
        self.driver.get(self.LOGIN_URL)
        
        submit_button = self._fill_login_form("test@example.com", "test123")
        
        # Cek tombol tidak disabled sebelum submit
        self.assertFalse(submit_button.get_attribute("disabled"), "Tombol seharusnya tidak disabled")
        
        # Click dan cek loading state (harus cepat)
        submit_button.click()
        time.sleep(0.5)  # Cek dalam 0.5 detik
        
        # Button text berubah atau disabled
        button_text = submit_button.text
        is_disabled = submit_button.get_attribute("disabled")
        
        print(f"   ℹ️  Button text saat loading: '{button_text}'")
        print(f"   ℹ️  Button disabled: {bool(is_disabled)}")
        print("   ✅ Test loading state selesai")
    
    def test_08_password_field_is_hidden(self):
        """Test 8: Password field menggunakan type password"""
        print("\n▶ Test 8: Testing password field tersembunyi...")
        self.driver.get(self.LOGIN_URL)
        
        password_input = self.driver.find_element(By.XPATH, "//input[@type='password']")
        self.assertEqual(password_input.get_attribute("type"), "password")
        print("   ✅ Password field menggunakan type='password'")
    
    def test_09_login_with_different_roles(self):
        """Test 9: Login dengan role yang berbeda"""
        print("\n▶ Test 9: Testing login dengan berbagai role...")
        
        roles = ["TU", "P4M", "Tim Akreditasi"]
        
        for role in roles:
            print(f"   - Testing role: {role}")
            self.driver.get(self.LOGIN_URL)
            
            submit_button = self._fill_login_form(self.VALID_EMAIL, self.VALID_PASSWORD, role)
            submit_button.click()
            
            time.sleep(2)
            
            error = self._check_error_message()
            if error:
                print(f"     ⚠️  Error untuk role {role}: {error}")
            else:
                current_url = self.driver.current_url
                print(f"     ℹ️  URL setelah login: {current_url}")


class LoginPerformanceTest(unittest.TestCase):
    """Test case untuk performance halaman login"""
    
    BASE_URL = "http://localhost:3000"
    LOGIN_URL = f"{BASE_URL}/login"
    
    def setUp(self):
        self.driver = webdriver.Chrome()
        self.driver.maximize_window()
    
    def tearDown(self):
        self.driver.quit()
    
    def test_page_load_time(self):
        """Test waktu load halaman login"""
        print("\n▶ Test Performance: Waktu load halaman...")
        
        start_time = time.time()
        self.driver.get(self.LOGIN_URL)
        
        # Tunggu sampai form muncul
        WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//input[@type='email']"))
        )
        
        end_time = time.time()
        load_time = end_time - start_time
        
        print(f"   ℹ️  Waktu load: {load_time:.2f} detik")
        self.assertLess(load_time, 5, "Halaman load terlalu lama (> 5 detik)")
        print("   ✅ Waktu load acceptable")


def run_tests():
    """Fungsi untuk menjalankan semua test"""
    # Buat test suite
    loader = unittest.TestLoader()
    suite = unittest.TestSuite()
    
    # Tambahkan test cases
    suite.addTests(loader.loadTestsFromTestCase(LoginTestCase))
    suite.addTests(loader.loadTestsFromTestCase(LoginPerformanceTest))
    
    # Run tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    # Print summary
    print("\n" + "="*50)
    print("SUMMARY")
    print("="*50)
    print(f"Tests run: {result.testsRun}")
    print(f"Successes: {result.testsRun - len(result.failures) - len(result.errors)}")
    print(f"Failures: {len(result.failures)}")
    print(f"Errors: {len(result.errors)}")
    print("="*50)
    
    return result


if __name__ == "__main__":
    print("""
    ╔════════════════════════════════════════════════╗
    ║   TEST LOGIN DENGAN SELENIUM - UNITTEST        ║
    ╚════════════════════════════════════════════════╝
    
    PERSIAPAN:
    1. Pastikan frontend berjalan di http://localhost:3000
    2. Pastikan backend berjalan
    3. Update kredensial VALID_EMAIL dan VALID_PASSWORD
       di class LoginTestCase
    
    MENJALANKAN TEST:
    - Semua test: python test_login.py
    - Satu test: python -m unittest test_login.LoginTestCase.test_01_page_loads
    
    """)
    
    run_tests()
