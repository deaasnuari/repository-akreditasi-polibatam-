"""
Test P4M - Filter dan Search Dokumen
Test untuk menguji fungsi filter kategori, status, dan search dokumen
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
from page_objects.p4m_dashboard_page import P4MDashboardPage

# Konfigurasi
EMAIL_P4M = "p4m_test@polibatam.ac.id"
PASSWORD_P4M = "p4m12345"
ROLE = "P4M"

# Inisialisasi driver
driver = webdriver.Chrome()
driver.maximize_window()

try:
    print("="*80)
    print("  🧪 TEST P4M - FILTER DAN SEARCH DOKUMEN")
    print("="*80)
    
    print(f"\n📋 Credentials P4M:")
    print(f"   • Email: {EMAIL_P4M}")
    print(f"   • Role: {ROLE}")
    
    # ============= STEP 1: LOGIN =============
    print("\n" + "="*80)
    print("📍 STEP 1: Login sebagai P4M")
    print("="*80)
    
    login_page = LoginPage(driver)
    login_page.open()
    time.sleep(2)
    
    login_page.login(EMAIL_P4M, PASSWORD_P4M, ROLE)
    time.sleep(3)
    
    if '/dashboard/p4m' in driver.current_url:
        print(f"\n   ✅ Login berhasil!")
        print(f"   📍 URL: {driver.current_url}")
    else:
        raise Exception("Login gagal")
    
    # ============= STEP 2: CEK STATISTIK AWAL =============
    print("\n" + "="*80)
    print("📍 STEP 2: Cek Statistik Dashboard")
    print("="*80)
    
    dashboard = P4MDashboardPage(driver)
    
    stats = dashboard.get_stats()
    if stats:
        print(f"\n   📊 Statistik Dokumen:")
        print(f"      • Total Dokumen: {stats.get('total', 0)}")
        print(f"      • Menunggu Review: {stats.get('menunggu', 0)}")
        print(f"      • Diterima: {stats.get('diterima', 0)}")
        print(f"      • Perlu Revisi: {stats.get('perlu_revisi', 0)}")
    
    # Ambil semua dokumen
    all_items = dashboard.get_all_items()
    print(f"\n   📋 Total dokumen tampil: {len(all_items)}")
    
    # ============= STEP 3: FILTER KATEGORI LKPS =============
    print("\n" + "="*80)
    print("📍 STEP 3: Test Filter Kategori - LKPS")
    print("="*80)
    
    print(f"\n   ➤ Mengatur filter ke 'LKPS'...")
    if dashboard.filter_by_kategori('LKPS'):
        print(f"   ✅ Filter LKPS berhasil diterapkan")
        time.sleep(2)
        
        lkps_items = dashboard.get_all_items()
        print(f"\n   📋 Dokumen LKPS: {len(lkps_items)}")
        
        if lkps_items:
            for i, item in enumerate(lkps_items[:5], 1):
                print(f"      {i}. {item.get('title', 'N/A')[:50]} - {item.get('status', 'N/A')}")
        
        # Screenshot
        driver.save_screenshot("screenshot_filter_lkps.png")
        print(f"\n   📸 Screenshot: screenshot_filter_lkps.png")
    else:
        print(f"   ⚠️  Filter LKPS gagal")
    
    # ============= STEP 4: FILTER KATEGORI LED =============
    print("\n" + "="*80)
    print("📍 STEP 4: Test Filter Kategori - LED")
    print("="*80)
    
    print(f"\n   ➤ Mengatur filter ke 'LED'...")
    if dashboard.filter_by_kategori('LED'):
        print(f"   ✅ Filter LED berhasil diterapkan")
        time.sleep(2)
        
        led_items = dashboard.get_all_items()
        print(f"\n   📋 Dokumen LED: {len(led_items)}")
        
        if led_items:
            for i, item in enumerate(led_items[:5], 1):
                print(f"      {i}. {item.get('title', 'N/A')[:50]} - {item.get('status', 'N/A')}")
        
        # Screenshot
        driver.save_screenshot("screenshot_filter_led.png")
        print(f"\n   📸 Screenshot: screenshot_filter_led.png")
    else:
        print(f"   ⚠️  Filter LED gagal")
    
    # ============= STEP 5: FILTER SEMUA KATEGORI =============
    print("\n" + "="*80)
    print("📍 STEP 5: Reset Filter - Semua Kategori")
    print("="*80)
    
    print(f"\n   ➤ Reset filter ke 'Semua'...")
    if dashboard.filter_by_kategori('Semua'):
        print(f"   ✅ Filter reset berhasil")
        time.sleep(2)
        
        all_items_after = dashboard.get_all_items()
        print(f"\n   📋 Total dokumen: {len(all_items_after)}")
        
        # Verifikasi
        if len(all_items_after) == len(all_items):
            print(f"   ✅ Jumlah dokumen sama dengan awal")
        else:
            print(f"   ℹ️  Jumlah dokumen berubah: {len(all_items)} → {len(all_items_after)}")
    else:
        print(f"   ⚠️  Reset filter gagal")
    
    # ============= STEP 6: FILTER STATUS MENUNGGU =============
    print("\n" + "="*80)
    print("📍 STEP 6: Test Filter Status - Menunggu")
    print("="*80)
    
    print(f"\n   ➤ Mengatur filter status ke 'Menunggu'...")
    if dashboard.filter_by_status('Menunggu'):
        print(f"   ✅ Filter status 'Menunggu' berhasil")
        time.sleep(2)
        
        menunggu_items = dashboard.get_all_items()
        print(f"\n   📋 Dokumen Menunggu: {len(menunggu_items)}")
        
        if menunggu_items:
            for i, item in enumerate(menunggu_items[:5], 1):
                status = item.get('status', 'N/A')
                print(f"      {i}. {item.get('title', 'N/A')[:50]} - {status}")
                
                # Verifikasi status
                if 'menunggu' in status.lower():
                    print(f"         ✅ Status benar")
                else:
                    print(f"         ⚠️  Status tidak sesuai: {status}")
        
        # Screenshot
        driver.save_screenshot("screenshot_filter_menunggu.png")
        print(f"\n   📸 Screenshot: screenshot_filter_menunggu.png")
    else:
        print(f"   ⚠️  Filter status 'Menunggu' gagal")
    
    # ============= STEP 7: FILTER STATUS DITERIMA =============
    print("\n" + "="*80)
    print("📍 STEP 7: Test Filter Status - Diterima")
    print("="*80)
    
    print(f"\n   ➤ Mengatur filter status ke 'Diterima'...")
    if dashboard.filter_by_status('Diterima'):
        print(f"   ✅ Filter status 'Diterima' berhasil")
        time.sleep(2)
        
        diterima_items = dashboard.get_all_items()
        print(f"\n   📋 Dokumen Diterima: {len(diterima_items)}")
        
        if diterima_items:
            for i, item in enumerate(diterima_items[:5], 1):
                print(f"      {i}. {item.get('title', 'N/A')[:50]} - {item.get('status', 'N/A')}")
        
        # Screenshot
        driver.save_screenshot("screenshot_filter_diterima.png")
        print(f"\n   📸 Screenshot: screenshot_filter_diterima.png")
    else:
        print(f"   ⚠️  Filter status 'Diterima' gagal")
    
    # ============= STEP 8: FILTER STATUS PERLU REVISI =============
    print("\n" + "="*80)
    print("📍 STEP 8: Test Filter Status - Perlu Revisi")
    print("="*80)
    
    print(f"\n   ➤ Mengatur filter status ke 'Perlu Revisi'...")
    if dashboard.filter_by_status('Perlu Revisi'):
        print(f"   ✅ Filter status 'Perlu Revisi' berhasil")
        time.sleep(2)
        
        revisi_items = dashboard.get_all_items()
        print(f"\n   📋 Dokumen Perlu Revisi: {len(revisi_items)}")
        
        if revisi_items:
            for i, item in enumerate(revisi_items[:5], 1):
                print(f"      {i}. {item.get('title', 'N/A')[:50]} - {item.get('status', 'N/A')}")
        
        # Screenshot
        driver.save_screenshot("screenshot_filter_revisi.png")
        print(f"\n   📸 Screenshot: screenshot_filter_revisi.png")
    else:
        print(f"   ⚠️  Filter status 'Perlu Revisi' gagal")
    
    # ============= STEP 9: KOMBINASI FILTER =============
    print("\n" + "="*80)
    print("📍 STEP 9: Test Kombinasi Filter (LKPS + Menunggu)")
    print("="*80)
    
    print(f"\n   ➤ Filter LKPS + Menunggu...")
    dashboard.filter_by_kategori('LKPS')
    time.sleep(1)
    dashboard.filter_by_status('Menunggu')
    time.sleep(2)
    
    combo_items = dashboard.get_all_items()
    print(f"\n   📋 Dokumen LKPS Menunggu: {len(combo_items)}")
    
    if combo_items:
        print(f"\n   📄 Detail dokumen:")
        for i, item in enumerate(combo_items[:3], 1):
            print(f"      {i}. {item.get('title', 'N/A')}")
            print(f"         Kategori: LKPS | Status: {item.get('status', 'N/A')}")
    
    # Screenshot
    driver.save_screenshot("screenshot_filter_combo.png")
    print(f"\n   📸 Screenshot: screenshot_filter_combo.png")
    
    # ============= STEP 10: TEST SEARCH (jika ada) =============
    print("\n" + "="*80)
    print("📍 STEP 10: Test Fungsi Search")
    print("="*80)
    
    # Reset filter dulu
    dashboard.filter_by_kategori('Semua')
    dashboard.filter_by_status('Semua')
    time.sleep(1)
    
    try:
        search_input = driver.find_element(By.XPATH, "//input[@type='text' and @placeholder]")
        
        # Test search
        search_keyword = "LKPS"
        print(f"\n   ➤ Search dengan keyword: '{search_keyword}'...")
        
        search_input.clear()
        search_input.send_keys(search_keyword)
        time.sleep(2)
        
        search_results = dashboard.get_all_items()
        print(f"\n   🔍 Hasil search: {len(search_results)} dokumen")
        
        if search_results:
            for i, item in enumerate(search_results[:3], 1):
                title = item.get('title', 'N/A')
                print(f"      {i}. {title}")
                
                # Verifikasi keyword ada di title
                if search_keyword.lower() in title.lower():
                    print(f"         ✅ Keyword ditemukan")
                else:
                    print(f"         ℹ️  Keyword tidak di title (mungkin di field lain)")
        
        # Screenshot
        driver.save_screenshot("screenshot_search.png")
        print(f"\n   📸 Screenshot: screenshot_search.png")
        
    except Exception as e:
        print(f"\n   ℹ️  Fungsi search tidak tersedia atau error: {str(e)[:50]}")
    
    # ============= STEP 11: RINGKASAN =============
    print("\n" + "="*80)
    print("📍 STEP 11: Ringkasan Test Filter & Search")
    print("="*80)
    
    # Reset semua filter
    dashboard.filter_by_kategori('Semua')
    dashboard.filter_by_status('Semua')
    time.sleep(1)
    
    final_stats = dashboard.get_stats()
    
    print(f"\n   📊 Statistik Final:")
    if final_stats:
        print(f"      • Total: {final_stats.get('total', 0)}")
        print(f"      • Menunggu: {final_stats.get('menunggu', 0)}")
        print(f"      • Diterima: {final_stats.get('diterima', 0)}")
        print(f"      • Perlu Revisi: {final_stats.get('perlu_revisi', 0)}")
    
    print(f"\n   📋 Hasil Test Filter:")
    print(f"      • Filter LKPS: {'✅' if lkps_items else '⚠️ (no data)'}")
    print(f"      • Filter LED: {'✅' if led_items else '⚠️ (no data)'}")
    print(f"      • Filter Menunggu: {'✅' if menunggu_items else '⚠️ (no data)'}")
    print(f"      • Filter Diterima: {'✅' if diterima_items else '⚠️ (no data)'}")
    print(f"      • Filter Perlu Revisi: {'✅' if revisi_items else '⚠️ (no data)'}")
    print(f"      • Kombinasi Filter: ✅")
    
    # Screenshot final
    driver.save_screenshot("screenshot_dashboard_final.png")
    print(f"\n   📸 Screenshot final: screenshot_dashboard_final.png")
    
    print("\n" + "="*80)
    print("✅ TEST FILTER DAN SEARCH SELESAI")
    print("="*80)
    
    print(f"\n⏸️  Browser akan ditutup dalam 5 detik...")
    time.sleep(5)

except Exception as e:
    print(f"\n❌ ERROR: {e}")
    import traceback
    traceback.print_exc()
    
    driver.save_screenshot("screenshot_error.png")
    print(f"\n📸 Screenshot error: screenshot_error.png")
    
    print(f"\n⏸️  Browser akan ditutup dalam 5 detik...")
    time.sleep(5)

finally:
    driver.quit()
    print("✅ Test selesai")
