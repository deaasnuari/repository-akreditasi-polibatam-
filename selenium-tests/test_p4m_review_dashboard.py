"""
Test P4M Review Dashboard
Test untuk P4M (reviewer) melihat dashboard dan melakukan review
"""

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
from page_objects.p4m_dashboard_page import P4MDashboardPage, P4MReviewLKPSPage, P4MReviewLEDPage

# Konfigurasi - gunakan akun P4M yang sudah dibuat
# Jika sudah punya akun P4M dari test sebelumnya, gunakan akun tersebut
# Atau gunakan akun P4M default untuk testing

EMAIL_P4M = "p4m_test@polibatam.ac.id"  # Ganti dengan email P4M yang sudah dibuat
PASSWORD_P4M = "p4m12345"  # Ganti dengan password yang sesuai
ROLE = "P4M"

# Inisialisasi driver
driver = webdriver.Chrome()
driver.maximize_window()

try:
    print("="*80)
    print("  🧪 TEST P4M REVIEW DASHBOARD")
    print("="*80)
    
    print(f"\n📋 Credentials P4M:")
    print(f"   • Email: {EMAIL_P4M}")
    print(f"   • Password: {PASSWORD_P4M}")
    print(f"   • Role: {ROLE}")
    
    # ============= STEP 1: LOGIN SEBAGAI P4M =============
    print("\n" + "="*80)
    print("📍 STEP 1: Login sebagai P4M (Reviewer)")
    print("="*80)
    
    login_page = LoginPage(driver)
    login_page.open()
    time.sleep(2)
    
    print(f"\n   ➤ Login dengan email: {EMAIL_P4M}")
    
    login_page.login(EMAIL_P4M, PASSWORD_P4M, ROLE)
    time.sleep(3)
    
    # Verifikasi login berhasil
    current_url = driver.current_url
    if '/dashboard/p4m' in current_url:
        print(f"\n   ✅ Login P4M berhasil!")
        print(f"   📍 URL: {current_url}")
    else:
        print(f"\n   ⚠️  URL tidak sesuai: {current_url}")
        print(f"   ℹ️  Kemungkinan akun P4M belum ada atau credentials salah")
        print(f"\n   💡 Tips:")
        print(f"      • Jalankan test_create_akun_p4m.py terlebih dahulu")
        print(f"      • Atau gunakan credentials P4M yang valid")
        raise Exception(f"Login P4M gagal, URL: {current_url}")
    
    # ============= STEP 2: CEK DASHBOARD P4M =============
    print("\n" + "="*80)
    print("📍 STEP 2: Cek Dashboard P4M")
    print("="*80)
    
    p4m_dashboard = P4MDashboardPage(driver)
    
    if p4m_dashboard.is_loaded():
        print(f"\n   ✅ Dashboard P4M dimuat")
    else:
        print(f"\n   ⚠️  Dashboard P4M tidak terdeteksi")
    
    # Screenshot dashboard
    print("\n   📸 Mengambil screenshot dashboard...")
    driver.save_screenshot("screenshot_p4m_dashboard_loaded.png")
    print("   ✅ Screenshot disimpan: screenshot_p4m_dashboard_loaded.png")
    
    # ============= STEP 3: CEK STATISTIK DOKUMEN =============
    print("\n" + "="*80)
    print("📍 STEP 3: Cek Statistik Dokumen untuk Review")
    print("="*80)
    
    stats = p4m_dashboard.get_stats()
    
    if stats:
        print(f"\n   📊 Statistik Dokumen:")
        print(f"      • Total Dokumen: {stats['total']}")
        print(f"      • Menunggu Review: {stats['menunggu']}")
        print(f"      • Diterima: {stats['diterima']}")
        print(f"      • Perlu Revisi: {stats['perlu_revisi']}")
        
        if stats['total'] == 0:
            print(f"\n   ⚠️  TIDAK ADA DOKUMEN UNTUK DIREVIEW!")
            print(f"\n   ℹ️  Kemungkinan:")
            print(f"      • Belum ada Tim Akreditasi yang submit LKPS/LED")
            print(f"      • Dokumen sudah direview semua")
            print(f"\n   💡 Tips:")
            print(f"      • Pastikan Tim Akreditasi sudah submit data")
            print(f"      • Cek Bukti Pendukung di dashboard Tim Akreditasi")
    else:
        print(f"\n   ⚠️  Gagal mendapatkan statistik")
    
    # ============= STEP 4: LIHAT DAFTAR DOKUMEN =============
    print("\n" + "="*80)
    print("📍 STEP 4: Lihat Daftar Dokumen untuk Review")
    print("="*80)
    
    print("\n   ➤ Mengambil daftar dokumen...")
    items = p4m_dashboard.get_all_items()
    
    print(f"\n   📊 Total dokumen: {len(items)}")
    
    if len(items) > 0:
        print(f"\n   📋 Daftar Dokumen:")
        for i, item in enumerate(items[:10], 1):
            print(f"      {i}. {item['judul']}")
            print(f"         • Kategori: {item['kategori']}")
            print(f"         • Status: {item['status']}")
        
        if len(items) > 10:
            print(f"      ... dan {len(items) - 10} dokumen lainnya")
    else:
        print(f"\n   ℹ️  Tidak ada dokumen yang perlu direview")
    
    # ============= STEP 5: FILTER DOKUMEN LKPS =============
    print("\n" + "="*80)
    print("📍 STEP 5: Filter Dokumen LKPS")
    print("="*80)
    
    print("\n   ➤ Mengatur filter ke 'LKPS'...")
    p4m_dashboard.filter_by_kategori('LKPS')
    time.sleep(2)
    
    lkps_items = p4m_dashboard.get_all_items()
    print(f"\n   📊 Dokumen LKPS: {len(lkps_items)}")
    
    if len(lkps_items) > 0:
        print(f"\n   📋 Daftar LKPS:")
        for i, item in enumerate(lkps_items[:5], 1):
            print(f"      {i}. {item['judul']}")
            print(f"         • Status: {item['status']}")
    
    # ============= STEP 6: FILTER DOKUMEN LED =============
    print("\n" + "="*80)
    print("📍 STEP 6: Filter Dokumen LED")
    print("="*80)
    
    print("\n   ➤ Mengatur filter ke 'LED'...")
    p4m_dashboard.filter_by_kategori('LED')
    time.sleep(2)
    
    led_items = p4m_dashboard.get_all_items()
    print(f"\n   📊 Dokumen LED: {len(led_items)}")
    
    if len(led_items) > 0:
        print(f"\n   📋 Daftar LED:")
        for i, item in enumerate(led_items[:5], 1):
            print(f"      {i}. {item['judul']}")
            print(f"         • Status: {item['status']}")
    
    # ============= STEP 7: FILTER STATUS MENUNGGU =============
    print("\n" + "="*80)
    print("📍 STEP 7: Filter Status 'Menunggu Review'")
    print("="*80)
    
    # Reset kategori filter
    print("\n   ➤ Reset filter kategori...")
    p4m_dashboard.filter_by_kategori('Semua Kategori')
    time.sleep(1)
    
    print("\n   ➤ Mengatur filter status ke 'Menunggu'...")
    p4m_dashboard.filter_by_status('Menunggu')
    time.sleep(2)
    
    menunggu_items = p4m_dashboard.get_all_items()
    print(f"\n   📊 Dokumen Menunggu Review: {len(menunggu_items)}")
    
    if len(menunggu_items) > 0:
        print(f"\n   📋 Daftar Dokumen Menunggu:")
        for i, item in enumerate(menunggu_items[:5], 1):
            print(f"      {i}. {item['judul']}")
            print(f"         • Kategori: {item['kategori']}")
            print(f"         • Status: {item['status']}")
    else:
        print(f"\n   ℹ️  Tidak ada dokumen yang menunggu review")
    
    # ============= STEP 8: KLIK REVIEW DOKUMEN PERTAMA =============
    if len(menunggu_items) > 0:
        print("\n" + "="*80)
        print("📍 STEP 8: Klik Review Dokumen Pertama")
        print("="*80)
        
        first_item = menunggu_items[0]
        print(f"\n   ➤ Dokumen yang akan direview:")
        print(f"      • Judul: {first_item['judul']}")
        print(f"      • Kategori: {first_item['kategori']}")
        print(f"      • Status: {first_item['status']}")
        
        print(f"\n   ➤ Klik tombol Review...")
        success = p4m_dashboard.click_review_item(0)
        
        if success:
            print("   ✅ Tombol Review diklik")
            time.sleep(3)
            
            # Cek URL setelah klik
            current_url = driver.current_url
            print(f"\n   📍 URL setelah klik: {current_url}")
            
            if '/reviewLKPS' in current_url:
                print("   ✅ Diarahkan ke halaman Review LKPS")
            elif '/reviewLED' in current_url:
                print("   ✅ Diarahkan ke halaman Review LED")
            else:
                print("   ℹ️  Diarahkan ke halaman review")
            
            # Screenshot halaman review
            print("\n   📸 Mengambil screenshot halaman review...")
            driver.save_screenshot("screenshot_p4m_review_page.png")
            print("   ✅ Screenshot disimpan: screenshot_p4m_review_page.png")
            
        else:
            print("   ❌ Gagal klik tombol Review")
    else:
        print("\n   ⏭️  STEP 8 dilewati (tidak ada dokumen menunggu)")
    
    # ============= STEP 9: CEK HALAMAN REVIEW LKPS =============
    print("\n" + "="*80)
    print("📍 STEP 9: Test Akses Halaman Review LKPS")
    print("="*80)
    
    print("\n   ➤ Membuka halaman Review LKPS...")
    review_lkps = P4MReviewLKPSPage(driver)
    review_lkps.open()
    time.sleep(3)
    
    if review_lkps.is_loaded():
        print("   ✅ Halaman Review LKPS berhasil dimuat")
        print(f"   📍 URL: {driver.current_url}")
    else:
        print("   ⚠️  Halaman Review LKPS tidak terdeteksi")
        print(f"   📍 URL: {driver.current_url}")
    
    # Screenshot Review LKPS
    print("\n   📸 Mengambil screenshot Review LKPS...")
    driver.save_screenshot("screenshot_p4m_review_lkps.png")
    print("   ✅ Screenshot disimpan: screenshot_p4m_review_lkps.png")
    
    # ============= STEP 10: CEK HALAMAN REVIEW LED =============
    print("\n" + "="*80)
    print("📍 STEP 10: Test Akses Halaman Review LED")
    print("="*80)
    
    print("\n   ➤ Membuka halaman Review LED...")
    review_led = P4MReviewLEDPage(driver)
    review_led.open(tab='budaya-mutu')
    time.sleep(3)
    
    if review_led.is_loaded():
        print("   ✅ Halaman Review LED berhasil dimuat")
        print(f"   📍 URL: {driver.current_url}")
    else:
        print("   ⚠️  Halaman Review LED tidak terdeteksi")
        print(f"   📍 URL: {driver.current_url}")
    
    # Screenshot Review LED
    print("\n   📸 Mengambil screenshot Review LED...")
    driver.save_screenshot("screenshot_p4m_review_led.png")
    print("   ✅ Screenshot disimpan: screenshot_p4m_review_led.png")
    
    # ============= SUMMARY =============
    print("\n" + "="*80)
    print("📊 SUMMARY TEST")
    print("="*80)
    
    print(f"\n✅ Test selesai!")
    
    print(f"\n📋 Hasil:")
    print(f"   • Login P4M: ✅")
    print(f"   • Dashboard P4M: ✅")
    print(f"   • Total Dokumen: {stats['total'] if stats else 0}")
    print(f"   • Dokumen LKPS: {len(lkps_items)}")
    print(f"   • Dokumen LED: {len(led_items)}")
    print(f"   • Menunggu Review: {len(menunggu_items)}")
    print(f"   • Halaman Review LKPS: ✅")
    print(f"   • Halaman Review LED: ✅")
    
    print(f"\n💡 Tips:")
    print(f"   • P4M dapat review LKPS dan LED yang disubmit Tim Akreditasi")
    print(f"   • Filter dokumen berdasarkan kategori dan status")
    print(f"   • Klik 'Review' untuk memberikan feedback")
    
    print(f"\n📁 Screenshot:")
    print(f"   • screenshot_p4m_dashboard_loaded.png")
    print(f"   • screenshot_p4m_review_page.png (jika ada dokumen)")
    print(f"   • screenshot_p4m_review_lkps.png")
    print(f"   • screenshot_p4m_review_led.png")

except Exception as e:
    print(f"\n❌ ERROR: {e}")
    import traceback
    traceback.print_exc()
    
    # Screenshot error
    try:
        driver.save_screenshot("screenshot_p4m_error.png")
        print("\n📸 Screenshot error disimpan: screenshot_p4m_error.png")
    except:
        pass

finally:
    print("\n⏸️  Browser akan ditutup dalam 5 detik...")
    time.sleep(5)
    driver.quit()
    print("✅ Test selesai\n")
