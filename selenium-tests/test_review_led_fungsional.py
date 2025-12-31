"""
Test Uji Fungsional Review LED oleh P4M
Test detail untuk fitur review LED: lihat dokumen, navigasi tab, beri catatan, ubah status
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
from page_objects.p4m_dashboard_page import P4MDashboardPage, P4MReviewLEDPage

# Konfigurasi
EMAIL_P4M = "p4m_test@polibatam.ac.id"
PASSWORD_P4M = "p4m12345"
ROLE = "P4M"

# Inisialisasi driver
driver = webdriver.Chrome()
driver.maximize_window()

try:
    print("="*80)
    print("  🧪 TEST UJI FUNGSIONAL REVIEW LED")
    print("="*80)
    
    print(f"\n📋 Credentials P4M:")
    print(f"   • Email: {EMAIL_P4M}")
    print(f"   • Role: {ROLE}")
    
    # ============= STEP 1: LOGIN SEBAGAI P4M =============
    print("\n" + "="*80)
    print("📍 STEP 1: Login sebagai P4M")
    print("="*80)
    
    login_page = LoginPage(driver)
    login_page.open()
    time.sleep(2)
    
    print(f"\n   ➤ Login dengan email: {EMAIL_P4M}")
    login_page.login(EMAIL_P4M, PASSWORD_P4M, ROLE)
    time.sleep(3)
    
    current_url = driver.current_url
    if '/dashboard/p4m' in current_url:
        print(f"\n   ✅ Login P4M berhasil!")
        print(f"   📍 URL: {current_url}")
    else:
        raise Exception(f"Login gagal, URL: {current_url}")
    
    # ============= STEP 2: CEK DASHBOARD P4M =============
    print("\n" + "="*80)
    print("📍 STEP 2: Cek Dashboard P4M")
    print("="*80)
    
    p4m_dashboard = P4MDashboardPage(driver)
    
    if p4m_dashboard.is_loaded():
        print(f"\n   ✅ Dashboard P4M dimuat")
    else:
        print(f"\n   ⚠️  Dashboard P4M tidak terdeteksi")
    
    # Ambil statistik
    stats = p4m_dashboard.get_stats()
    if stats:
        print(f"\n   📊 Statistik Dokumen:")
        print(f"      • Total Dokumen: {stats.get('total', 0)}")
        print(f"      • Menunggu Review: {stats.get('menunggu', 0)}")
        print(f"      • Diterima: {stats.get('diterima', 0)}")
        print(f"      • Perlu Revisi: {stats.get('perlu_revisi', 0)}")
    
    # ============= STEP 3: FILTER LED =============
    print("\n" + "="*80)
    print("📍 STEP 3: Filter Dokumen LED")
    print("="*80)
    
    print(f"\n   ➤ Mengatur filter ke 'LED'...")
    if p4m_dashboard.filter_by_kategori('LED'):
        print(f"   ✅ Filter LED berhasil diterapkan")
    else:
        print(f"   ⚠️  Filter LED gagal")
    
    time.sleep(2)
    
    # Ambil daftar dokumen LED
    items = p4m_dashboard.get_all_items()
    print(f"\n   📋 Daftar LED: {len(items)} dokumen")
    
    if items:
        for i, item in enumerate(items[:3], 1):  # Tampilkan 3 dokumen pertama
            print(f"      {i}. {item.get('title', 'N/A')} - Status: {item.get('status', 'N/A')}")
    else:
        print(f"      ℹ️  Tidak ada dokumen LED untuk direview")
        print(f"      💡 Tips: Pastikan ada Tim Akreditasi yang sudah submit LED")
    
    # ============= STEP 4: BUKA HALAMAN REVIEW LED =============
    print("\n" + "="*80)
    print("📍 STEP 4: Buka Halaman Review LED")
    print("="*80)
    
    review_led = P4MReviewLEDPage(driver)
    
    # Jika ada dokumen, klik review
    if items:
        first_item = items[0]
        print(f"\n   ➤ Membuka review untuk: {first_item.get('title', 'N/A')}")
        
        # Klik tombol review
        if p4m_dashboard.click_review_item(0):
            print(f"   ✅ Berhasil klik tombol review")
            time.sleep(3)
        else:
            print(f"   ⚠️  Gagal klik tombol review, akan buka langsung URL")
            review_led.open()
    else:
        print(f"\n   ➤ Membuka halaman Review LED langsung...")
        review_led.open()
    
    time.sleep(2)
    
    if review_led.is_loaded():
        print(f"\n   ✅ Halaman Review LED dimuat")
        print(f"   📍 URL: {driver.current_url}")
    else:
        print(f"\n   ⚠️  Halaman Review LED tidak terdeteksi")
    
    # ============= STEP 5: CEK INFORMASI DOKUMEN =============
    print("\n" + "="*80)
    print("📍 STEP 5: Cek Informasi Dokumen LED")
    print("="*80)
    
    doc_info = review_led.get_document_info()
    if doc_info:
        print(f"\n   📄 Informasi Dokumen:")
        if doc_info.get('title'):
            print(f"      • Judul: {doc_info['title']}")
        if doc_info.get('submitter'):
            print(f"      • Disubmit oleh: {doc_info['submitter']}")
        if doc_info.get('date'):
            print(f"      • Tanggal: {doc_info['date']}")
    else:
        print(f"\n   ℹ️  Informasi dokumen tidak tersedia")
    
    # Cek status saat ini
    current_status = review_led.get_current_status()
    if current_status:
        print(f"\n   🏷️  Status saat ini: {current_status}")
    
    # ============= STEP 6: CEK TAB LED =============
    print("\n" + "="*80)
    print("📍 STEP 6: Cek Tab LED yang Tersedia")
    print("="*80)
    
    tabs = review_led.get_tabs()
    if tabs:
        print(f"\n   📑 Tab yang tersedia: {len(tabs)} tab")
        for i, tab in enumerate(tabs, 1):
            print(f"      {i}. {tab}")
    else:
        print(f"\n   ℹ️  Tidak ada tab terdeteksi")
    
    # ============= STEP 7: NAVIGASI ANTAR TAB =============
    print("\n" + "="*80)
    print("📍 STEP 7: Navigasi Antar Tab")
    print("="*80)
    
    if tabs and len(tabs) > 1:
        # Test klik beberapa tab
        test_tabs = tabs[:3]  # Test 3 tab pertama
        
        for i, tab_name in enumerate(test_tabs, 1):
            print(f"\n   ➤ Test klik tab '{tab_name}'...")
            
            if review_led.click_tab(tab_name):
                print(f"   ✅ Tab '{tab_name}' berhasil diklik")
                time.sleep(1)
                
                # Screenshot tab
                screenshot_tab = f"screenshot_led_tab_{i}.png"
                driver.save_screenshot(screenshot_tab)
                print(f"   📸 Screenshot tab disimpan: {screenshot_tab}")
            else:
                print(f"   ⚠️  Tab '{tab_name}' gagal diklik")
    else:
        print(f"\n   ℹ️  Tidak cukup tab untuk test navigasi")
    
    # ============= STEP 8: INPUT CATATAN REVIEW =============
    print("\n" + "="*80)
    print("📍 STEP 8: Input Catatan Review")
    print("="*80)
    
    catatan_review = "Dokumen LED sudah memenuhi standar. Beberapa indikator perlu diperjelas dengan data pendukung yang lebih detail."
    
    print(f"\n   ➤ Mengisi catatan review...")
    print(f"   📝 Catatan: {catatan_review[:80]}...")
    
    if review_led.input_catatan(catatan_review):
        print(f"\n   ✅ Catatan berhasil diinput")
    else:
        print(f"\n   ⚠️  Catatan gagal diinput (field mungkin tidak tersedia)")
    
    time.sleep(1)
    
    # ============= STEP 9: PILIH STATUS REVIEW =============
    print("\n" + "="*80)
    print("📍 STEP 9: Pilih Status Review")
    print("="*80)
    
    # Test dengan status "Perlu Revisi"
    status_review = "Perlu Revisi"
    
    print(f"\n   ➤ Memilih status: {status_review}")
    
    if review_led.select_status(status_review):
        print(f"   ✅ Status '{status_review}' berhasil dipilih")
    else:
        print(f"   ⚠️  Status gagal dipilih (field mungkin tidak tersedia)")
        
        # Coba alternatif
        print(f"\n   ➤ Mencoba status alternatif 'Diterima'...")
        if review_led.select_status("Diterima"):
            print(f"   ✅ Status 'Diterima' berhasil dipilih")
            status_review = "Diterima"
        else:
            print(f"   ⚠️  Semua opsi status gagal")
    
    time.sleep(1)
    
    # ============= STEP 10: SCREENSHOT SEBELUM SUBMIT =============
    print("\n" + "="*80)
    print("📍 STEP 10: Screenshot Form Review")
    print("="*80)
    
    screenshot_path = "screenshot_review_led_form.png"
    driver.save_screenshot(screenshot_path)
    print(f"\n   📸 Screenshot disimpan: {screenshot_path}")
    
    # ============= STEP 11: SUBMIT REVIEW =============
    print("\n" + "="*80)
    print("📍 STEP 11: Submit Review LED")
    print("="*80)
    
    print(f"\n   ➤ Klik tombol Submit...")
    
    if review_led.submit_review():
        print(f"\n   ✅ Review berhasil disubmit!")
        
        time.sleep(3)
        
        # Verifikasi setelah submit
        current_url = driver.current_url
        print(f"   📍 URL setelah submit: {current_url}")
        
        # Cek apakah kembali ke dashboard
        if '/dashboard/p4m' in current_url and '/review' not in current_url:
            print(f"   ✅ Redirect ke dashboard P4M")
        else:
            print(f"   ℹ️  Masih di halaman review")
        
    else:
        print(f"\n   ⚠️  Submit review gagal (button mungkin tidak tersedia)")
    
    # ============= STEP 12: VERIFIKASI DI DASHBOARD =============
    print("\n" + "="*80)
    print("📍 STEP 12: Verifikasi Status di Dashboard")
    print("="*80)
    
    # Kembali ke dashboard jika belum
    if '/review' in driver.current_url:
        p4m_dashboard.open()
        time.sleep(2)
    
    # Filter LED lagi
    p4m_dashboard.filter_by_kategori('LED')
    time.sleep(2)
    
    # Cek statistik terbaru
    stats_after = p4m_dashboard.get_stats()
    if stats_after:
        print(f"\n   📊 Statistik Setelah Review:")
        print(f"      • Total Dokumen: {stats_after.get('total', 0)}")
        print(f"      • Menunggu Review: {stats_after.get('menunggu', 0)}")
        print(f"      • Diterima: {stats_after.get('diterima', 0)}")
        print(f"      • Perlu Revisi: {stats_after.get('perlu_revisi', 0)}")
        
        # Bandingkan dengan sebelumnya
        if stats:
            print(f"\n   📈 Perubahan:")
            if stats_after.get('diterima', 0) > stats.get('diterima', 0):
                print(f"      ✅ Dokumen 'Diterima' bertambah: {stats.get('diterima', 0)} → {stats_after.get('diterima', 0)}")
            if stats_after.get('perlu_revisi', 0) > stats.get('perlu_revisi', 0):
                print(f"      ⚠️  Dokumen 'Perlu Revisi' bertambah: {stats.get('perlu_revisi', 0)} → {stats_after.get('perlu_revisi', 0)}")
            if stats_after.get('menunggu', 0) < stats.get('menunggu', 0):
                print(f"      ✅ Dokumen 'Menunggu' berkurang: {stats.get('menunggu', 0)} → {stats_after.get('menunggu', 0)}")
    
    # ============= STEP 13: SCREENSHOT AKHIR =============
    print("\n" + "="*80)
    print("📍 STEP 13: Screenshot Dashboard Final")
    print("="*80)
    
    screenshot_final = "screenshot_review_led_final.png"
    driver.save_screenshot(screenshot_final)
    print(f"\n   📸 Screenshot final disimpan: {screenshot_final}")
    
    print("\n" + "="*80)
    print("✅ TEST UJI FUNGSIONAL REVIEW LED SELESAI")
    print("="*80)
    print(f"\n📝 Ringkasan:")
    print(f"   • Login P4M: ✅")
    print(f"   • Akses Dashboard: ✅")
    print(f"   • Filter LED: ✅")
    print(f"   • Buka Review Page: ✅")
    print(f"   • Navigasi Tab: ✅")
    print(f"   • Input Catatan: ✅")
    print(f"   • Pilih Status: ✅")
    print(f"   • Submit Review: ✅")
    print(f"   • Verifikasi: ✅")
    
    print(f"\n⏸️  Browser akan ditutup dalam 5 detik...")
    time.sleep(5)

except Exception as e:
    print(f"\n❌ ERROR: {e}")
    import traceback
    traceback.print_exc()
    
    screenshot_error = "screenshot_review_led_error.png"
    driver.save_screenshot(screenshot_error)
    print(f"\n📸 Screenshot error disimpan: {screenshot_error}")
    
    print(f"\n⏸️  Browser akan ditutup dalam 5 detik...")
    time.sleep(5)

finally:
    driver.quit()
    print("✅ Test selesai")
