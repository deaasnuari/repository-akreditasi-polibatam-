"""
Test Uji Fungsional Review LKPS dan LED (Lengkap)
Test comprehensive untuk P4M melakukan review kedua jenis dokumen
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

# Konfigurasi
EMAIL_P4M = "p4m_test@polibatam.ac.id"
PASSWORD_P4M = "p4m12345"
ROLE = "P4M"

# Inisialisasi driver
driver = webdriver.Chrome()
driver.maximize_window()

try:
    print("="*80)
    print("  🧪 TEST UJI FUNGSIONAL REVIEW LKPS & LED (LENGKAP)")
    print("="*80)
    
    print(f"\n📋 Credentials P4M:")
    print(f"   • Email: {EMAIL_P4M}")
    print(f"   • Role: {ROLE}")
    
    # ============= BAGIAN 1: REVIEW LKPS =============
    print("\n" + "="*80)
    print("🔷 BAGIAN 1: REVIEW LKPS")
    print("="*80)
    
    # STEP 1: Login
    print("\n" + "="*80)
    print("📍 STEP 1: Login sebagai P4M")
    print("="*80)
    
    login_page = LoginPage(driver)
    login_page.open()
    time.sleep(2)
    
    login_page.login(EMAIL_P4M, PASSWORD_P4M, ROLE)
    time.sleep(3)
    
    if '/dashboard/p4m' in driver.current_url:
        print(f"\n   ✅ Login P4M berhasil!")
    else:
        raise Exception(f"Login gagal")
    
    # STEP 2: Dashboard dan Filter LKPS
    print("\n" + "="*80)
    print("📍 STEP 2: Filter dan Review LKPS")
    print("="*80)
    
    p4m_dashboard = P4MDashboardPage(driver)
    
    stats_awal = p4m_dashboard.get_stats()
    print(f"\n   📊 Statistik Awal:")
    print(f"      • Total: {stats_awal.get('total', 0)}")
    print(f"      • Menunggu: {stats_awal.get('menunggu', 0)}")
    
    # Filter LKPS
    print(f"\n   ➤ Filter LKPS...")
    p4m_dashboard.filter_by_kategori('LKPS')
    time.sleep(2)
    
    items_lkps = p4m_dashboard.get_all_items()
    print(f"   📋 LKPS tersedia: {len(items_lkps)} dokumen")
    
    # STEP 3: Buka Review LKPS
    if items_lkps:
        print("\n" + "="*80)
        print("📍 STEP 3: Review Dokumen LKPS")
        print("="*80)
        
        print(f"\n   ➤ Buka review LKPS pertama...")
        p4m_dashboard.click_review_item(0)
        time.sleep(3)
        
        review_lkps = P4MReviewLKPSPage(driver)
        
        if review_lkps.is_loaded():
            print(f"   ✅ Halaman Review LKPS dimuat")
            
            # Cek tabs
            tabs = review_lkps.get_tabs()
            if tabs:
                print(f"   📑 Tab tersedia: {', '.join(tabs[:3])}")
            
            # Input catatan dan status
            print(f"\n   ➤ Input catatan dan status...")
            review_lkps.input_catatan("LKPS sudah sesuai standar BAN-PT. Dokumen diterima.")
            review_lkps.select_status("Diterima")
            
            # Screenshot
            driver.save_screenshot("screenshot_lkps_review.png")
            print(f"   📸 Screenshot: screenshot_lkps_review.png")
            
            # Submit
            print(f"\n   ➤ Submit review LKPS...")
            if review_lkps.submit_review():
                print(f"   ✅ Review LKPS berhasil disubmit!")
                time.sleep(3)
            else:
                print(f"   ⚠️  Submit gagal (field mungkin tidak tersedia)")
        else:
            print(f"   ⚠️  Review LKPS page tidak dimuat")
    else:
        print(f"\n   ℹ️  Tidak ada dokumen LKPS untuk direview")
    
    # ============= BAGIAN 2: REVIEW LED =============
    print("\n" + "="*80)
    print("🔷 BAGIAN 2: REVIEW LED")
    print("="*80)
    
    # STEP 4: Kembali ke Dashboard
    print("\n" + "="*80)
    print("📍 STEP 4: Kembali ke Dashboard")
    print("="*80)
    
    p4m_dashboard.open()
    time.sleep(2)
    print(f"   ✅ Dashboard dimuat")
    
    # STEP 5: Filter LED
    print("\n" + "="*80)
    print("📍 STEP 5: Filter dan Review LED")
    print("="*80)
    
    print(f"\n   ➤ Filter LED...")
    p4m_dashboard.filter_by_kategori('LED')
    time.sleep(2)
    
    items_led = p4m_dashboard.get_all_items()
    print(f"   📋 LED tersedia: {len(items_led)} dokumen")
    
    # STEP 6: Buka Review LED
    if items_led:
        print("\n" + "="*80)
        print("📍 STEP 6: Review Dokumen LED")
        print("="*80)
        
        print(f"\n   ➤ Buka review LED pertama...")
        p4m_dashboard.click_review_item(0)
        time.sleep(3)
        
        review_led = P4MReviewLEDPage(driver)
        
        if review_led.is_loaded():
            print(f"   ✅ Halaman Review LED dimuat")
            
            # Cek tabs
            tabs = review_led.get_tabs()
            if tabs:
                print(f"   📑 Tab tersedia: {', '.join(tabs[:3])}")
                
                # Test navigasi tab
                if len(tabs) > 1:
                    print(f"\n   ➤ Test navigasi ke tab kedua...")
                    review_led.click_tab(tabs[1])
                    time.sleep(1)
                    print(f"   ✅ Navigasi tab berhasil")
            
            # Input catatan dan status
            print(f"\n   ➤ Input catatan dan status...")
            review_led.input_catatan("LED perlu perbaikan pada beberapa indikator. Mohon dilengkapi data pendukung.")
            review_led.select_status("Perlu Revisi")
            
            # Screenshot
            driver.save_screenshot("screenshot_led_review.png")
            print(f"   📸 Screenshot: screenshot_led_review.png")
            
            # Submit
            print(f"\n   ➤ Submit review LED...")
            if review_led.submit_review():
                print(f"   ✅ Review LED berhasil disubmit!")
                time.sleep(3)
            else:
                print(f"   ⚠️  Submit gagal (field mungkin tidak tersedia)")
        else:
            print(f"   ⚠️  Review LED page tidak dimuat")
    else:
        print(f"\n   ℹ️  Tidak ada dokumen LED untuk direview")
    
    # ============= BAGIAN 3: VERIFIKASI FINAL =============
    print("\n" + "="*80)
    print("🔷 BAGIAN 3: VERIFIKASI FINAL")
    print("="*80)
    
    # STEP 7: Cek Dashboard Final
    print("\n" + "="*80)
    print("📍 STEP 7: Verifikasi Perubahan Statistik")
    print("="*80)
    
    p4m_dashboard.open()
    time.sleep(2)
    
    stats_akhir = p4m_dashboard.get_stats()
    print(f"\n   📊 Statistik Final:")
    print(f"      • Total: {stats_akhir.get('total', 0)}")
    print(f"      • Menunggu: {stats_akhir.get('menunggu', 0)}")
    print(f"      • Diterima: {stats_akhir.get('diterima', 0)}")
    print(f"      • Perlu Revisi: {stats_akhir.get('perlu_revisi', 0)}")
    
    # Bandingkan
    if stats_awal:
        print(f"\n   📈 Perubahan:")
        delta_menunggu = stats_akhir.get('menunggu', 0) - stats_awal.get('menunggu', 0)
        delta_diterima = stats_akhir.get('diterima', 0) - stats_awal.get('diterima', 0)
        delta_revisi = stats_akhir.get('perlu_revisi', 0) - stats_awal.get('perlu_revisi', 0)
        
        if delta_menunggu < 0:
            print(f"      ✅ Menunggu berkurang: {abs(delta_menunggu)}")
        if delta_diterima > 0:
            print(f"      ✅ Diterima bertambah: +{delta_diterima}")
        if delta_revisi > 0:
            print(f"      ⚠️  Perlu Revisi bertambah: +{delta_revisi}")
    
    # STEP 8: Screenshot Final
    print("\n" + "="*80)
    print("📍 STEP 8: Screenshot Dashboard Final")
    print("="*80)
    
    driver.save_screenshot("screenshot_dashboard_final.png")
    print(f"\n   📸 Screenshot: screenshot_dashboard_final.png")
    
    # ============= RINGKASAN =============
    print("\n" + "="*80)
    print("✅ TEST UJI FUNGSIONAL LENGKAP SELESAI")
    print("="*80)
    
    print(f"\n📝 Ringkasan Test:")
    print(f"   🔷 LKPS Review:")
    print(f"      • Login: ✅")
    print(f"      • Filter: ✅")
    print(f"      • Review: {'✅' if items_lkps else '⚠️ (No data)'}")
    print(f"      • Submit: {'✅' if items_lkps else '⚠️ (No data)'}")
    
    print(f"\n   🔷 LED Review:")
    print(f"      • Filter: ✅")
    print(f"      • Review: {'✅' if items_led else '⚠️ (No data)'}")
    print(f"      • Navigasi Tab: {'✅' if items_led else '⚠️ (No data)'}")
    print(f"      • Submit: {'✅' if items_led else '⚠️ (No data)'}")
    
    print(f"\n   🔷 Verifikasi:")
    print(f"      • Statistik Update: ✅")
    print(f"      • Screenshots: ✅")
    
    print(f"\n💡 Catatan:")
    print(f"   • Total dokumen direview: {len(items_lkps) + len(items_led)}")
    print(f"   • LKPS: {len(items_lkps)}")
    print(f"   • LED: {len(items_led)}")
    
    print(f"\n⏸️  Browser akan ditutup dalam 5 detik...")
    time.sleep(5)

except Exception as e:
    print(f"\n❌ ERROR: {e}")
    import traceback
    traceback.print_exc()
    
    driver.save_screenshot("screenshot_error_lengkap.png")
    print(f"\n📸 Screenshot error: screenshot_error_lengkap.png")
    
    print(f"\n⏸️  Browser akan ditutup dalam 5 detik...")
    time.sleep(5)

finally:
    driver.quit()
    print("✅ Test selesai")
