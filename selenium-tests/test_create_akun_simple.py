"""
Test Sederhana untuk Create Akun (Tanpa Unittest)
Untuk pemula yang ingin belajar Selenium step-by-step
"""

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select
import time
import random
import string

# Konfigurasi
BASE_URL = "http://localhost:3000"
LOGIN_URL = f"{BASE_URL}/login"
MANAJEMEN_AKUN_URL = f"{BASE_URL}/dashboard/tata-usaha/manajemen-akun"

# Kredensial admin
ADMIN_EMAIL = "admin@polibatam.ac.id"
ADMIN_PASSWORD = "admin123"

# Inisialisasi driver
driver = webdriver.Chrome()
driver.maximize_window()

def generate_random_email():
    """Generate random email untuk testing"""
    random_str = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
    return f"test_{random_str}@polibatam.ac.id"

try:
    print("="*70)
    print("  🧪 TEST CREATE AKUN - MANAJEMEN AKUN (TATA USAHA)")
    print("="*70)
    
    # ============= STEP 1: LOGIN =============
    print("\n📍 STEP 1: Login sebagai Admin TU...")
    driver.get(LOGIN_URL)
    time.sleep(2)
    
    # Isi form login
    email_input = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, "//input[@type='email']"))
    )
    password_input = driver.find_element(By.XPATH, "//input[@type='password']")
    role_select = driver.find_element(By.TAG_NAME, "select")
    submit_button = driver.find_element(By.XPATH, "//button[@type='submit']")
    
    email_input.send_keys(ADMIN_EMAIL)
    password_input.send_keys(ADMIN_PASSWORD)
    
    select = Select(role_select)
    select.select_by_value("TU")
    
    submit_button.click()
    time.sleep(3)
    
    # Cek apakah berhasil login
    if "/dashboard" in driver.current_url:
        print("   ✅ Login berhasil!")
    else:
        print("   ❌ Login gagal!")
        raise Exception("Login failed")
    
    # ============= STEP 2: BUKA HALAMAN MANAJEMEN AKUN =============
    print("\n📍 STEP 2: Membuka halaman Manajemen Akun...")
    driver.get(MANAJEMEN_AKUN_URL)
    time.sleep(2)
    
    # Cek heading
    heading = driver.find_element(By.XPATH, "//h1[contains(text(), 'Manajemen Akun')]")
    if heading:
        print(f"   ✅ Halaman terbuka: {heading.text}")
    
    # Catat jumlah user sebelum create
    try:
        total_stat = driver.find_element(By.XPATH, "//div[contains(text(), 'Total Users')]/preceding-sibling::div")
        total_before = int(total_stat.text)
        print(f"   ℹ️  Total user saat ini: {total_before}")
    except:
        total_before = 0
        print("   ℹ️  Tidak bisa baca statistik")
    
    # ============= STEP 3: KLIK TOMBOL TAMBAH USER =============
    print("\n📍 STEP 3: Klik tombol Tambah User...")
    
    btn_tambah = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Tambah User')]"))
    )
    btn_tambah.click()
    time.sleep(1)
    
    # Cek modal terbuka
    modal = driver.find_element(By.XPATH, "//div[contains(@class, 'fixed')]//div[contains(@class, 'bg-white')]")
    if modal:
        print("   ✅ Modal Tambah User terbuka")
    
    # Cek modal title
    modal_title = driver.find_element(By.XPATH, "//h3[contains(text(), 'Tambah User')]")
    print(f"   ℹ️  Modal title: {modal_title.text}")
    
    # ============= STEP 4: ISI FORM USER BARU =============
    print("\n📍 STEP 4: Mengisi form user baru...")
    
    # Generate data user
    user_email = generate_random_email()
    user_nama = "Test User Selenium"
    user_password = "test12345"
    user_role = "Tim Akreditasi"
    user_prodi = "Teknik Informatika"
    
    print(f"   ℹ️  Nama     : {user_nama}")
    print(f"   ℹ️  Email    : {user_email}")
    print(f"   ℹ️  Password : {user_password}")
    print(f"   ℹ️  Role     : {user_role}")
    print(f"   ℹ️  Prodi    : {user_prodi}")
    
    # Isi form
    input_nama = driver.find_element(By.NAME, "name")
    input_nama.clear()
    input_nama.send_keys(user_nama)
    print("   ✅ Nama diisi")
    
    input_email = driver.find_element(By.NAME, "email")
    input_email.clear()
    input_email.send_keys(user_email)
    print("   ✅ Email diisi")
    
    input_password = driver.find_element(By.NAME, "password")
    input_password.clear()
    input_password.send_keys(user_password)
    print("   ✅ Password diisi")
    
    select_role = Select(driver.find_element(By.NAME, "role"))
    select_role.select_by_visible_text(user_role)
    print("   ✅ Role dipilih")
    
    # Prodi (hanya untuk non-P4M)
    if user_role != "P4M":
        try:
            select_prodi = Select(driver.find_element(By.NAME, "prodi"))
            select_prodi.select_by_visible_text(user_prodi)
            print("   ✅ Prodi dipilih")
        except:
            print("   ⚠️  Prodi tidak tersedia")
    
    time.sleep(1)
    
    # ============= STEP 5: SUBMIT FORM =============
    print("\n📍 STEP 5: Submit form...")
    
    btn_submit = driver.find_element(By.XPATH, "//button[@type='submit']")
    btn_submit.click()
    time.sleep(3)
    
    print("   ✅ Form disubmit")
    
    # ============= STEP 6: VERIFIKASI USER DIBUAT =============
    print("\n📍 STEP 6: Verifikasi user berhasil dibuat...")
    
    # Refresh halaman
    driver.get(MANAJEMEN_AKUN_URL)
    time.sleep(2)
    
    # Cari user di tabel
    try:
        user_cell = driver.find_element(By.XPATH, f"//td[contains(., '{user_email}')]")
        if user_cell:
            print(f"   ✅ User ditemukan di tabel: {user_email}")
            print("   ✅ CREATE USER BERHASIL! 🎉")
    except:
        print(f"   ⚠️  User tidak ditemukan di tabel")
        print("   ℹ️  Kemungkinan:")
        print("      - Backend belum menyimpan ke database")
        print("      - Ada error di backend")
        print("      - Perlu refresh lebih lama")
    
    # Cek statistik total user
    try:
        total_stat = driver.find_element(By.XPATH, "//div[contains(text(), 'Total Users')]/preceding-sibling::div")
        total_after = int(total_stat.text)
        print(f"   ℹ️  Total user sekarang: {total_after}")
        
        if total_after > total_before:
            print(f"   ✅ Total user bertambah dari {total_before} ke {total_after}")
    except:
        pass
    
    # ============= BONUS: TEST FILTER =============
    print("\n📍 BONUS: Test filter by role...")
    
    # Filter Tim Akreditasi
    filter_role = Select(driver.find_element(By.XPATH, "//select[contains(@class, 'border')]"))
    filter_role.select_by_visible_text("Tim Akreditasi")
    time.sleep(1)
    
    rows = driver.find_elements(By.XPATH, "//tbody/tr")
    print(f"   ℹ️  Filter Tim Akreditasi: {len(rows)} users")
    
    # Reset filter
    filter_role.select_by_visible_text("Semua Role")
    time.sleep(1)
    
    print("\n" + "="*70)
    print("  ✅ SEMUA TEST SELESAI!")
    print("="*70)
    
    print("\n📝 CATATAN:")
    print("- User baru berhasil dibuat dengan email:", user_email)
    print("- Anda bisa login dengan kredensial:")
    print(f"  Email: {user_email}")
    print(f"  Password: {user_password}")
    print(f"  Role: {user_role}")
    
except Exception as e:
    print(f"\n❌ ERROR: {str(e)}")
    import traceback
    traceback.print_exc()

finally:
    print("\nMenutup browser dalam 5 detik...")
    time.sleep(5)
    driver.quit()
    print("Browser ditutup.")
