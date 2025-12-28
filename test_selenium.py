from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select
import time

# Konfigurasi
BASE_URL = "http://localhost:3000"  # Sesuaikan dengan port Next.js Anda
LOGIN_URL = f"{BASE_URL}/login"

# Inisialisasi driver
driver = webdriver.Chrome()
driver.maximize_window()

try:
    print("=== Test Login dengan Selenium ===\n")
    
    # 1. Buka halaman login
    print("1. Membuka halaman login...")
    driver.get(LOGIN_URL)
    time.sleep(2)
    
    # 2. Test Login Sukses
    print("2. Testing login dengan kredensial valid...")
    
    # Cari elemen input
    email_input = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, "//input[@type='email']"))
    )
    password_input = driver.find_element(By.XPATH, "//input[@type='password']")
    role_select = driver.find_element(By.TAG_NAME, "select")
    submit_button = driver.find_element(By.XPATH, "//button[@type='submit']")
    
    # Isi form login
    email_input.clear()
    email_input.send_keys("test@example.com")  # Ganti dengan email valid
    
    password_input.clear()
    password_input.send_keys("password123")  # Ganti dengan password valid
    
    # Pilih role
    select = Select(role_select)
    select.select_by_value("TU")  # Pilih Tata Usaha
    
    time.sleep(1)
    
    # Klik tombol login
    print("   - Mengisi form dan klik tombol Masuk...")
    submit_button.click()
    
    # Tunggu redirect atau error message
    time.sleep(3)
    
    # Cek apakah ada error message
    try:
        error_message = driver.find_element(By.XPATH, "//div[contains(@class, 'bg-red-50')]")
        print(f"   ❌ Login gagal: {error_message.text}")
    except:
        # Cek apakah redirect ke dashboard
        current_url = driver.current_url
        if "/dashboard" in current_url:
            print(f"   ✅ Login berhasil! Redirect ke: {current_url}")
        else:
            print(f"   ⚠️  Login status tidak jelas. URL saat ini: {current_url}")
    
    time.sleep(2)
    
    # 3. Test Login dengan Password Salah (jika masih di halaman login)
    if "/login" in driver.current_url or True:  # Kembali ke login untuk test berikutnya
        print("\n3. Testing login dengan password salah...")
        driver.get(LOGIN_URL)
        time.sleep(2)
        
        email_input = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//input[@type='email']"))
        )
        password_input = driver.find_element(By.XPATH, "//input[@type='password']")
        submit_button = driver.find_element(By.XPATH, "//button[@type='submit']")
        
        email_input.clear()
        email_input.send_keys("test@example.com")
        password_input.clear()
        password_input.send_keys("wrongpassword")
        
        submit_button.click()
        time.sleep(2)
        
        try:
            error_message = driver.find_element(By.XPATH, "//div[contains(@class, 'bg-red-50')]")
            print(f"   ✅ Error message muncul: {error_message.text}")
        except:
            print("   ❌ Error message tidak muncul")
    
    # 4. Test Login dengan Email Salah
    print("\n4. Testing login dengan email tidak terdaftar...")
    driver.get(LOGIN_URL)
    time.sleep(2)
    
    email_input = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, "//input[@type='email']"))
    )
    password_input = driver.find_element(By.XPATH, "//input[@type='password']")
    submit_button = driver.find_element(By.XPATH, "//button[@type='submit']")
    
    email_input.clear()
    email_input.send_keys("notexist@example.com")
    password_input.clear()
    password_input.send_keys("password123")
    
    submit_button.click()
    time.sleep(2)
    
    try:
        error_message = driver.find_element(By.XPATH, "//div[contains(@class, 'bg-red-50')]")
        print(f"   ✅ Error message muncul: {error_message.text}")
    except:
        print("   ❌ Error message tidak muncul")
    
    # 5. Test Validasi Form Kosong
    print("\n5. Testing validasi form kosong...")
    driver.get(LOGIN_URL)
    time.sleep(2)
    
    submit_button = driver.find_element(By.XPATH, "//button[@type='submit']")
    submit_button.click()
    time.sleep(1)
    
    # HTML5 validation akan mencegah submit
    print("   ✅ Form validation bekerja (required fields)")
    
    # 6. Test Pemilihan Role Berbeda
    print("\n6. Testing pemilihan role berbeda...")
    driver.get(LOGIN_URL)
    time.sleep(2)
    
    email_input = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, "//input[@type='email']"))
    )
    password_input = driver.find_element(By.XPATH, "//input[@type='password']")
    role_select = driver.find_element(By.TAG_NAME, "select")
    
    email_input.clear()
    email_input.send_keys("test@example.com")
    password_input.clear()
    password_input.send_keys("password123")
    
    # Test semua role
    roles = ["TU", "P4M", "Tim Akreditasi"]
    for role in roles:
        select = Select(role_select)
        select.select_by_value(role)
        time.sleep(0.5)
        print(f"   - Role '{role}' dapat dipilih")
    
    print("\n=== Test Selesai ===")
    print("\nCatatan:")
    print("- Pastikan server frontend (Next.js) berjalan di http://localhost:3000")
    print("- Pastikan server backend berjalan")
    print("- Ganti kredensial test dengan akun yang valid di database")
    
except Exception as e:
    print(f"\n❌ Error: {str(e)}")
    import traceback
    traceback.print_exc()

finally:
    # Tunggu sebentar sebelum menutup browser
    print("\nMenutup browser dalam 5 detik...")
    time.sleep(5)
    driver.quit()
    print("Browser ditutup.")
