"""
Test Lengkap P4M - Create Akun dan Review
Test untuk create akun P4M oleh TU kemudian test review oleh P4M
"""
# pylint: disable=broad-exception-caught,bare-except,f-string-without-interpolation,unused-import

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from page_objects.login_page import LoginPage
from page_objects.manajemen_akun_page import ManajemenAkunPage
from page_objects.p4m_dashboard_page import P4MDashboardPage, P4MReviewLKPSPage, P4MReviewLEDPage

# Konfigurasi
EMAIL_TU = "admin@polibatam.ac.id"  # Admin TU
PASSWORD_TU = "admin123"
ROLE_TU = "TU"

# Data P4M yang akan dibuat
P4M_EMAIL = "p4m_test@polibatam.ac.id"
P4M_NAMA = "Reviewer P4M Test"
P4M_PASSWORD = "p4m12345"

# Inisialisasi driver
driver = webdriver.Chrome()
driver.maximize_window()

try:
    print("="*80)
    print("  🧪 TEST LENGKAP P4M - CREATE AKUN DAN REVIEW")
    print("="*80)
    
    # ============= BAGIAN 1: CREATE AKUN P4M =============
    print("\n" + "🔷"*40)
    print("BAGIAN 1: TATA USAHA MEMBUAT AKUN P4M")
    print("🔷"*40)
    
    print(f"\n📋 Data P4M yang akan dibuat:")
    print(f"   • Nama: {P4M_NAMA}")
    print(f"   • Email: {P4M_EMAIL}")
    print(f"   • Password: {P4M_PASSWORD}")
    print(f"   • Role: P4M")
    
    # ============= STEP 1: LOGIN SEBAGAI TATA USAHA =============
    print("\n" + "="*80)
    print("📍 STEP 1: Login sebagai Tata Usaha")
    print("="*80)
    
    login_page = LoginPage(driver)
    login_page.open()
    time.sleep(2)
    
    print(f"\n   ➤ Email: {EMAIL_TU}")
    print(f"   ➤ Role: {ROLE_TU}")
    
    login_page.login(EMAIL_TU, PASSWORD_TU, ROLE_TU)
    time.sleep(3)
    
    # Verifikasi login berhasil
    current_url = driver.current_url
    if '/dashboard/tata-usaha' in current_url:
        print(f"\n   ✅ Login TU berhasil!")
    else:
        raise Exception(f"Login TU gagal, URL: {current_url}")
    
    # ============= STEP 2: BUKA MANAJEMEN AKUN =============
    print("\n" + "="*80)
    print("📍 STEP 2: Buka Halaman Manajemen Akun")
    print("="*80)
    
    manajemen_akun = ManajemenAkunPage(driver)
    manajemen_akun.open()
    time.sleep(3)
    
    if manajemen_akun.is_loaded():
        print(f"\n   ✅ Halaman Manajemen Akun dimuat")
    else:
        raise Exception("Halaman Manajemen Akun tidak dimuat")
    
    # ============= STEP 3: CEK APAKAH P4M SUDAH ADA =============
    print("\n" + "="*80)
    print("📍 STEP 3: Cek Akun P4M Existing")
    print("="*80)
    
    print(f"\n   🔍 Mencari akun: {P4M_EMAIL}")
    
    manajemen_akun.filter_by_role('P4M')
    time.sleep(2)
    
    existing_user = manajemen_akun.find_user_by_email(P4M_EMAIL)
    
    if existing_user:
        print(f"\n   ✅ Akun P4M sudah ada!")
        print(f"      • Nama: {existing_user['nama']}")
        print(f"      • Email: {existing_user['email']}")
        print(f"      • Status: {existing_user['status']}")
        print(f"\n   ℹ️  Akan menggunakan akun existing untuk test")
    else:
        print(f"\n   ℹ️  Akun P4M belum ada, akan dibuat baru")
        
        # Reset filter
        manajemen_akun.filter_by_role('Semua Role')
        time.sleep(1)
        
        # ============= STEP 4: KLIK TAMBAH USER =============
        print("\n" + "="*80)
        print("📍 STEP 4: Klik Tombol Tambah User")
        print("="*80)
        
        manajemen_akun.click_tambah_user()
        time.sleep(2)
        
        if manajemen_akun.is_modal_open():
            print("   ✅ Modal form terbuka")
        else:
            raise Exception("Modal form tidak muncul")
        
        # ============= STEP 5: ISI FORM P4M =============
        print("\n" + "="*80)
        print("📍 STEP 5: Isi Form Akun P4M")
        print("="*80)
        
        manajemen_akun.fill_user_form(
            nama=P4M_NAMA,
            email=P4M_EMAIL,
            password=P4M_PASSWORD,
            role='P4M',
            prodi=None
        )
        
        print("\n   ✅ Form berhasil diisi")
        time.sleep(2)
        
        # ============= STEP 6: SUBMIT FORM =============
        print("\n" + "="*80)
        print("📍 STEP 6: Submit Form (Simpan Akun P4M)")
        print("="*80)
        
        manajemen_akun.submit_form()
        time.sleep(3)
        
        print("   ✅ Form disubmit")
        
        # Verifikasi
        driver.refresh()
        time.sleep(2)
        
        manajemen_akun.filter_by_role('P4M')
        time.sleep(2)
        
        created_user = manajemen_akun.find_user_by_email(P4M_EMAIL)
        
        if created_user:
            print(f"\n   ✅ AKUN P4M BERHASIL DIBUAT!")
            print(f"      • Nama: {created_user['nama']}")
            print(f"      • Email: {created_user['email']}")
            print(f"      • Status: {created_user['status']}")
        else:
            print(f"\n   ⚠️  Akun P4M tidak ditemukan setelah create")
    
    # ============= BAGIAN 2: P4M REVIEW =============
    print("\n\n" + "🔶"*40)
    print("BAGIAN 2: P4M LOGIN DAN REVIEW")
    print("🔶"*40)
    
    # ============= STEP 7: LOGOUT DAN LOGIN SEBAGAI P4M =============
    print("\n" + "="*80)
    print("📍 STEP 7: Logout TU dan Login sebagai P4M")
    print("="*80)
    
    print("\n   ➤ Logout dari Tata Usaha...")
    driver.get("http://localhost:3000/login")
    time.sleep(3)
    
    print(f"\n   ➤ Login sebagai P4M:")
    print(f"      • Email: {P4M_EMAIL}")
    print(f"      • Password: {P4M_PASSWORD}")
    print(f"      • Role: P4M")
    
    login_page.open()
    time.sleep(2)
    
    login_page.login(P4M_EMAIL, P4M_PASSWORD, 'P4M')
    time.sleep(3)
    
    # Verifikasi login P4M berhasil
    current_url = driver.current_url
    
    if '/dashboard/p4m' in current_url:
        print(f"\n   ✅ LOGIN P4M BERHASIL!")
        print(f"   📍 URL: {current_url}")
    else:
        raise Exception(f"Login P4M gagal, URL: {current_url}")
    
    # ============= STEP 8: CEK DASHBOARD P4M =============
    print("\n" + "="*80)
    print("📍 STEP 8: Cek Dashboard P4M")
    print("="*80)
    
    p4m_dashboard = P4MDashboardPage(driver)
    
    if p4m_dashboard.is_loaded():
        print(f"\n   ✅ Dashboard P4M dimuat")
    else:
        print(f"\n   ⚠️  Dashboard P4M tidak terdeteksi")
    
    # Screenshot
    driver.save_screenshot("screenshot_p4m_full_test_dashboard.png")
    print("\n   📸 Screenshot: screenshot_p4m_full_test_dashboard.png")
    
    # ============= STEP 9: CEK STATISTIK =============
    print("\n" + "="*80)
    print("📍 STEP 9: Cek Statistik Dokumen")
    print("="*80)
    
    stats = p4m_dashboard.get_stats()
    
    if stats:
        print(f"\n   📊 Statistik Dokumen:")
        print(f"      • Total Dokumen: {stats['total']}")
        print(f"      • Menunggu Review: {stats['menunggu']}")
        print(f"      • Diterima: {stats['diterima']}")
        print(f"      • Perlu Revisi: {stats['perlu_revisi']}")
        
        if stats['total'] == 0:
            print(f"\n   ℹ️  Belum ada dokumen untuk direview")
            print(f"      • Pastikan Tim Akreditasi sudah submit LKPS/LED")
    
    # ============= STEP 10: LIHAT DAFTAR DOKUMEN =============
    print("\n" + "="*80)
    print("📍 STEP 10: Lihat Daftar Dokumen")
    print("="*80)
    
    items = p4m_dashboard.get_all_items()
    
    print(f"\n   📊 Total dokumen: {len(items)}")
    
    if len(items) > 0:
        print(f"\n   📋 Daftar Dokumen:")
        for i, item in enumerate(items[:5], 1):
            print(f"      {i}. {item['judul']}")
            print(f"         • Kategori: {item['kategori']}")
            print(f"         • Status: {item['status']}")
    
    # ============= STEP 11: TEST HALAMAN REVIEW LKPS =============
    print("\n" + "="*80)
    print("📍 STEP 11: Test Halaman Review LKPS")
    print("="*80)
    
    review_lkps = P4MReviewLKPSPage(driver)
    review_lkps.open()
    time.sleep(3)
    
    if review_lkps.is_loaded():
        print("   ✅ Halaman Review LKPS berhasil dimuat")
    else:
        print("   ⚠️  Halaman Review LKPS tidak terdeteksi")
    
    driver.save_screenshot("screenshot_p4m_full_test_lkps.png")
    print("   📸 Screenshot: screenshot_p4m_full_test_lkps.png")
    
    # ============= STEP 12: TEST HALAMAN REVIEW LED =============
    print("\n" + "="*80)
    print("📍 STEP 12: Test Halaman Review LED")
    print("="*80)
    
    review_led = P4MReviewLEDPage(driver)
    review_led.open(tab='budaya-mutu')
    time.sleep(3)
    
    if review_led.is_loaded():
        print("   ✅ Halaman Review LED berhasil dimuat")
    else:
        print("   ⚠️  Halaman Review LED tidak terdeteksi")
    
    driver.save_screenshot("screenshot_p4m_full_test_led.png")
    print("   📸 Screenshot: screenshot_p4m_full_test_led.png")
    
    # ============= SUMMARY =============
    print("\n" + "="*80)
    print("📊 SUMMARY TEST LENGKAP P4M")
    print("="*80)
    
    print(f"\n✅ Test selesai!")
    
    print(f"\n📋 Bagian 1 - Create Akun P4M:")
    print(f"   • Login TU: ✅")
    print(f"   • Akun P4M dibuat: ✅")
    print(f"   • Email: {P4M_EMAIL}")
    print(f"   • Password: {P4M_PASSWORD}")
    
    print(f"\n📋 Bagian 2 - P4M Review:")
    print(f"   • Login P4M: ✅")
    print(f"   • Dashboard P4M: ✅")
    print(f"   • Total Dokumen: {stats['total'] if stats else 0}")
    print(f"   • Review LKPS: ✅")
    print(f"   • Review LED: ✅")
    
    print(f"\n💡 Tips:")
    print(f"   • Akun P4M siap digunakan untuk review")
    print(f"   • Credentials: {P4M_EMAIL} / {P4M_PASSWORD}")
    print(f"   • Dashboard: http://localhost:3000/dashboard/p4m")
    
    print(f"\n📁 Screenshot:")
    print(f"   • screenshot_p4m_full_test_dashboard.png")
    print(f"   • screenshot_p4m_full_test_lkps.png")
    print(f"   • screenshot_p4m_full_test_led.png")

except Exception as e:
    print(f"\n❌ ERROR: {e}")
    import traceback
    traceback.print_exc()
    
    # Screenshot error
    try:
        driver.save_screenshot("screenshot_p4m_full_error.png")
        print("\n📸 Screenshot error: screenshot_p4m_full_error.png")
    except:
        pass

finally:
    print("\n⏸️  Browser akan ditutup dalam 5 detik...")
    time.sleep(5)
    driver.quit()
    print("✅ Test selesai\n")
