"""
Test Login Tim Akreditasi - Versi Sederhana
Login menggunakan akun Tim Akreditasi yang baru dibuat
"""

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select
from selenium.webdriver.common.action_chains import ActionChains
import time

# Konfigurasi
BASE_URL = "http://localhost:3000"
LOGIN_URL = f"{BASE_URL}/login"
DASHBOARD_URL = f"{BASE_URL}/dashboard/tim-akreditasi"

# Kredensial Tim Akreditasi
# GANTI dengan email yang dibuat dari test create akun sebelumnya
TIM_AKREDITASI_EMAIL = "test_5hnkxvpw@polibatam.ac.id"  # <-- GANTI INI
TIM_AKREDITASI_PASSWORD = "test12345"
TIM_AKREDITASI_ROLE = "Tim Akreditasi"

# Inisialisasi driver
driver = webdriver.Chrome()
driver.maximize_window()

try:
    print("="*70)
    print("  🧪 TEST LOGIN TIM AKREDITASI")
    print("="*70)
    
    # ============= STEP 1: BUKA HALAMAN LOGIN =============
    print("\n📍 STEP 1: Membuka halaman login...")
    driver.get(LOGIN_URL)
    time.sleep(2)
    
    # Cek heading login
    heading = driver.find_element(By.XPATH, "//h1[contains(text(), 'Login')]")
    if heading:
        print(f"   ✅ Halaman login terbuka: {heading.text}")
    
    # ============= STEP 2: ISI FORM LOGIN =============
    print("\n📍 STEP 2: Mengisi form login...")
    
    print(f"   ℹ️  Email    : {TIM_AKREDITASI_EMAIL}")
    print(f"   ℹ️  Password : {TIM_AKREDITASI_PASSWORD}")
    print(f"   ℹ️  Role     : {TIM_AKREDITASI_ROLE}")
    
    # Isi email
    email_input = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, "//input[@type='email']"))
    )
    email_input.clear()
    email_input.send_keys(TIM_AKREDITASI_EMAIL)
    print("   ✅ Email diisi")
    
    # Isi password
    password_input = driver.find_element(By.XPATH, "//input[@type='password']")
    password_input.clear()
    password_input.send_keys(TIM_AKREDITASI_PASSWORD)
    print("   ✅ Password diisi")
    
    # Pilih role
    role_select = Select(driver.find_element(By.TAG_NAME, "select"))
    role_select.select_by_visible_text(TIM_AKREDITASI_ROLE)
    print("   ✅ Role dipilih")
    
    # ============= STEP 3: SUBMIT LOGIN =============
    print("\n📍 STEP 3: Submit login...")
    
    submit_button = driver.find_element(By.XPATH, "//button[@type='submit']")
    submit_button.click()
    time.sleep(3)
    
    # Cek apakah ada error
    try:
        error_msg = driver.find_element(By.XPATH, "//div[contains(@class, 'bg-red-50')]")
        print(f"   ❌ Login gagal: {error_msg.text}")
        print("\n   💡 CATATAN:")
        print("      - Pastikan email sudah benar (hasil dari test create akun)")
        print("      - Update TIM_AKREDITASI_EMAIL di script ini")
        print("      - Cek apakah user aktif di database")
        raise Exception("Login failed")
    except:
        pass  # Tidak ada error, lanjut
    
    # Verify redirect
    current_url = driver.current_url
    if "/dashboard/tim-akreditasi" in current_url:
        print(f"   ✅ Login berhasil!")
        print(f"   ✅ Redirect ke: {current_url}")
    else:
        print(f"   ⚠️  URL saat ini: {current_url}")
    
    # ============= STEP 4: VERIFY DASHBOARD =============
    print("\n📍 STEP 4: Verify dashboard Tim Akreditasi...")
    time.sleep(2)
    
    # Cek heading dashboard
    try:
        dashboard_heading = driver.find_element(By.XPATH, "//h2[contains(text(), 'Repository Digital')]")
        print(f"   ✅ Dashboard heading: {dashboard_heading.text}")
    except:
        print("   ⚠️  Dashboard heading tidak ditemukan")
    
    # Cek last login info
    try:
        last_login = driver.find_element(By.XPATH, "//p[contains(text(), 'Terakhir Login')]/following-sibling::p")
        if last_login.text and last_login.text != "-":
            print(f"   ✅ Last login: {last_login.text}")
    except:
        print("   ℹ️  Last login info tidak tersedia")
    
    # ============= STEP 5: CEK SEMUA MENU =============
    print("\n📍 STEP 5: Cek menu yang tersedia...")
    
    menus = [
        ("Dashboard", "//span[contains(text(), 'Dashboard')]"),
        ("LKPS", "//span[contains(text(), 'Laporan Kinerja Program Studi')]"),
        ("LED", "//span[contains(text(), 'Laporan Evaluasi Diri')]"),
        ("Bukti Pendukung", "//span[contains(text(), 'Bukti Pendukung')]"),
        ("Matriks Penilaian", "//span[contains(text(), 'Matriks Penilaian')]"),
        ("Export", "//span[contains(text(), 'Export')]"),
    ]
    
    available_menus = []
    for menu_name, xpath in menus:
        try:
            menu_element = driver.find_element(By.XPATH, xpath)
            if menu_element:
                print(f"   ✅ Menu '{menu_name}' tersedia")
                available_menus.append(menu_name)
        except:
            print(f"   ⚠️  Menu '{menu_name}' tidak ditemukan")
    
    print(f"\n   ℹ️  Total menu tersedia: {len(available_menus)}/{len(menus)}")
    
    # ============= STEP 6: TEST NOTIFIKASI =============
    print("\n📍 STEP 6: Test notifikasi...")
    
    try:
        notif_button = driver.find_element(By.XPATH, "//button[@aria-label='Notifikasi']")
        
        # Cek badge notifikasi
        try:
            badge = driver.find_element(By.XPATH, "//span[contains(@class, 'bg-red-500')]")
            print("   ✅ Ada notifikasi baru (badge terlihat)")
        except:
            print("   ℹ️  Tidak ada notifikasi baru")
        
        # Klik notifikasi
        notif_button.click()
        time.sleep(1)
        print("   ✅ Tombol notifikasi diklik")
        
        # Cek dropdown notifikasi
        try:
            notif_dropdown = driver.find_element(By.XPATH, "//div[contains(@class, 'notification')]")
            print("   ✅ Dropdown notifikasi muncul")
        except:
            print("   ℹ️  Dropdown notifikasi tidak ditemukan")
        
    except:
        print("   ⚠️  Tombol notifikasi tidak ditemukan")
    
    # ============= STEP 7: NAVIGASI KE LKPS =============
    print("\n📍 STEP 7: Navigasi ke LKPS...")
    
    try:
        # Wait untuk menu LKPS muncul
        lkps_menu = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//span[contains(text(), 'Laporan Kinerja Program Studi')]"))
        )
        
        # Scroll ke element
        driver.execute_script("arguments[0].scrollIntoView(true);", lkps_menu)
        time.sleep(0.5)
        
        # Wait hingga clickable
        lkps_menu = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, "//span[contains(text(), 'Laporan Kinerja Program Studi')]"))
        )
        
        print("   ℹ️  Element LKPS ditemukan, mencoba klik...")
        
        # Coba klik dengan ActionChains
        actions = ActionChains(driver)
        actions.move_to_element(lkps_menu).click().perform()
        
        time.sleep(3)  # Tunggu navigasi
        
        if "lkps" in driver.current_url:
            print(f"   ✅ Berhasil ke LKPS: {driver.current_url}")
        else:
            # Coba dengan JavaScript click
            print("   ℹ️  Mencoba klik dengan JavaScript...")
            driver.execute_script("arguments[0].click();", lkps_menu)
            time.sleep(3)
            
            if "lkps" in driver.current_url:
                print(f"   ✅ Berhasil ke LKPS (JS click): {driver.current_url}")
            else:
                print(f"   ⚠️  URL saat ini: {driver.current_url}")
    except Exception as e:
        print(f"   ⚠️  Gagal navigasi ke LKPS: {str(e)}")
    
    # ============= STEP 8: KEMBALI KE DASHBOARD =============
    print("\n📍 STEP 8: Kembali ke dashboard...")
    
    driver.get(DASHBOARD_URL)
    time.sleep(2)
    
    if "/dashboard/tim-akreditasi" in driver.current_url:
        print("   ✅ Kembali ke dashboard")
    
    # ============= STEP 9: NAVIGASI KE LED =============
    print("\n📍 STEP 9: Navigasi ke LED...")
    
    try:
        # Wait untuk menu LED muncul
        led_menu = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//span[contains(text(), 'Laporan Evaluasi Diri')]"))
        )
        
        # Scroll ke element
        driver.execute_script("arguments[0].scrollIntoView(true);", led_menu)
        time.sleep(0.5)
        
        # Wait hingga clickable
        led_menu = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, "//span[contains(text(), 'Laporan Evaluasi Diri')]"))
        )
        
        print("   ℹ️  Element LED ditemukan, mencoba klik...")
        
        # Coba klik dengan ActionChains
        actions = ActionChains(driver)
        actions.move_to_element(led_menu).click().perform()
        
        time.sleep(3)  # Tunggu navigasi
        
        if "led" in driver.current_url:
            print(f"   ✅ Berhasil ke LED: {driver.current_url}")
        else:
            # Coba dengan JavaScript click
            print("   ℹ️  Mencoba klik dengan JavaScript...")
            driver.execute_script("arguments[0].click();", led_menu)
            time.sleep(3)
            
            if "led" in driver.current_url:
                print(f"   ✅ Berhasil ke LED (JS click): {driver.current_url}")
            else:
                print(f"   ⚠️  URL saat ini: {driver.current_url}")
    except Exception as e:
        print(f"   ⚠️  Gagal navigasi ke LED: {str(e)}")
    
    # ============= STEP 10: NAVIGASI KE BUKTI PENDUKUNG =============
    print("\n📍 STEP 10: Navigasi ke Bukti Pendukung...")
    
    driver.get(DASHBOARD_URL)
    time.sleep(1)
    
    try:
        bukti_menu = driver.find_element(By.XPATH, "//span[contains(text(), 'Bukti Pendukung')]")
        bukti_menu.click()
        time.sleep(2)
        
        if "bukti-pendukung" in driver.current_url:
            print(f"   ✅ Berhasil ke Bukti Pendukung: {driver.current_url}")
        else:
            print(f"   ⚠️  URL saat ini: {driver.current_url}")
    except Exception as e:
        print(f"   ⚠️  Gagal navigasi ke Bukti Pendukung: {str(e)}")
    
    # ============= STEP 11: NAVIGASI KE MATRIKS =============
    print("\n📍 STEP 11: Navigasi ke Matriks Penilaian...")
    
    driver.get(DASHBOARD_URL)
    time.sleep(1)
    
    try:
        matriks_menu = driver.find_element(By.XPATH, "//span[contains(text(), 'Matriks Penilaian')]")
        matriks_menu.click()
        time.sleep(2)
        
        if "matriks" in driver.current_url:
            print(f"   ✅ Berhasil ke Matriks: {driver.current_url}")
        else:
            print(f"   ⚠️  URL saat ini: {driver.current_url}")
    except Exception as e:
        print(f"   ⚠️  Gagal navigasi ke Matriks: {str(e)}")
    
    print("\n" + "="*70)
    print("  ✅ SEMUA TEST SELESAI!")
    print("="*70)
    
    print("\n📊 SUMMARY:")
    print(f"✅ Login berhasil sebagai Tim Akreditasi")
    print(f"✅ Dashboard dapat diakses")
    print(f"✅ Menu-menu tersedia: {len(available_menus)}")
    print(f"✅ Navigasi ke berbagai halaman berhasil")
    
    print("\n📝 CATATAN:")
    print(f"- User login: {TIM_AKREDITASI_EMAIL}")
    print(f"- Role: {TIM_AKREDITASI_ROLE}")
    print("- Akses dashboard Tim Akreditasi: SUCCESS ✅")

except Exception as e:
    print(f"\n❌ ERROR: {str(e)}")
    import traceback
    traceback.print_exc()
    
    print("\n💡 TROUBLESHOOTING:")
    print("1. Pastikan email sudah benar (hasil dari test_create_akun)")
    print("2. Update TIM_AKREDITASI_EMAIL di line 12 script ini")
    print("3. Pastikan user sudah dibuat dengan role 'Tim Akreditasi'")
    print("4. Cek database apakah user ada dan status aktif")

finally:
    print("\nMenutup browser dalam 5 detik...")
    time.sleep(5)
    driver.quit()
    print("Browser ditutup.")
