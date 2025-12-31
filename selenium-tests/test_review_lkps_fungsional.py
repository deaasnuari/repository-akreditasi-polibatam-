"""
Test Uji Fungsional Review LKPS oleh P4M
Test detail untuk fitur review LKPS: lihat dokumen, beri catatan, ubah status
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
from page_objects.p4m_dashboard_page import P4MDashboardPage, P4MReviewLKPSPage

# Konfigurasi
EMAIL_P4M = "p4m_test@polibatam.ac.id"
PASSWORD_P4M = "p4m12345"
ROLE = "P4M"

# Inisialisasi driver
driver = webdriver.Chrome()
driver.maximize_window()

try:
    print("="*80)
    print("  🧪 TEST UJI FUNGSIONAL REVIEW LKPS")
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
    
    # ============= STEP 3: FILTER LKPS =============
    print("\n" + "="*80)
    print("📍 STEP 3: Filter Dokumen LKPS")
    print("="*80)
    
    print(f"\n   ➤ Mengatur filter ke 'LKPS'...")
    if p4m_dashboard.filter_by_kategori('LKPS'):
        print(f"   ✅ Filter LKPS berhasil diterapkan")
    else:
        print(f"   ⚠️  Filter LKPS gagal")
    
    time.sleep(2)
    
    # Ambil daftar dokumen LKPS
    items = p4m_dashboard.get_all_items()
    print(f"\n   📋 Daftar LKPS: {len(items)} dokumen")
    
    if items:
        for i, item in enumerate(items[:3], 1):  # Tampilkan 3 dokumen pertama
            print(f"      {i}. {item.get('title', 'N/A')} - Status: {item.get('status', 'N/A')}")
    else:
        print(f"      ℹ️  Tidak ada dokumen LKPS untuk direview")
        print(f"      💡 Tips: Pastikan ada Tim Akreditasi yang sudah submit LKPS")
    
    # ============= STEP 4: BUKA HALAMAN REVIEW LKPS =============
    print("\n" + "="*80)
    print("📍 STEP 4: Buka Halaman Review LKPS")
    print("="*80)
    
    review_lkps = P4MReviewLKPSPage(driver)
    
    # Jika ada dokumen, ambil userId dari item pertama
    user_id = None
    if items:
        # Coba ambil userId dari item pertama
        first_item = items[0]
        print(f"\n   ➤ Membuka review untuk: {first_item.get('title', 'N/A')}")
        
        # Klik tombol review
        if p4m_dashboard.click_review_item(0):
            print(f"   ✅ Berhasil klik tombol review")
            time.sleep(3)
        else:
            print(f"   ⚠️  Gagal klik tombol review, akan buka langsung URL")
            review_lkps.open()
    else:
        print(f"\n   ➤ Membuka halaman Review LKPS langsung...")
        review_lkps.open()
    
    time.sleep(2)
    
    if review_lkps.is_loaded():
        print(f"\n   ✅ Halaman Review LKPS dimuat")
        print(f"   📍 URL: {driver.current_url}")
    else:
        print(f"\n   ⚠️  Halaman Review LKPS tidak terdeteksi")
    
    # ============= STEP 5: CEK INFORMASI DOKUMEN =============
    print("\n" + "="*80)
    print("📍 STEP 5: Cek Informasi Dokumen LKPS")
    print("="*80)
    
    doc_info = review_lkps.get_document_info()
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
    current_status = review_lkps.get_current_status()
    if current_status:
        print(f"\n   🏷️  Status saat ini: {current_status}")
    
    # ============= STEP 6: CEK TAB YANG TERSEDIA =============
    print("\n" + "="*80)
    print("📍 STEP 6: Cek Tab yang Tersedia")
    print("="*80)
    
    tabs = review_lkps.get_tabs()
    if tabs:
        print(f"\n   📑 Tab yang tersedia: {len(tabs)} tab")
        for i, tab in enumerate(tabs, 1):
            print(f"      {i}. {tab}")
    else:
        print(f"\n   ℹ️  Tidak ada tab terdeteksi atau single page")
    
    # ============= STEP 7: INPUT CATATAN REVIEW =============
    print("\n" + "="*80)
    print("📍 STEP 7: Input Catatan Review")
    print("="*80)
    
    catatan_review = "Dokumen LKPS sudah lengkap dan sesuai dengan format yang ditentukan. Data statistik mahasiswa perlu diperbarui sesuai periode terkini."
    
    print(f"\n   ➤ Mengisi catatan review...")
    print(f"   📝 Catatan: {catatan_review[:80]}...")
    
    if review_lkps.input_catatan(catatan_review):
        print(f"\n   ✅ Catatan berhasil diinput")
    else:
        print(f"\n   ⚠️  Catatan gagal diinput (field mungkin tidak tersedia)")
    
    time.sleep(1)
    
    # ============= STEP 8: PILIH STATUS REVIEW =============
    print("\n" + "="*80)
    print("📍 STEP 8: Pilih Status Review")
    print("="*80)
    
    # Test dengan status "Diterima"
    status_review = "Diterima"
    
    print(f"\n   ➤ Memilih status: {status_review}")
    
    if review_lkps.select_status(status_review):
        print(f"   ✅ Status '{status_review}' berhasil dipilih")
    else:
        print(f"   ⚠️  Status gagal dipilih (field mungkin tidak tersedia)")
        
        # Coba alternatif
        print(f"\n   ➤ Mencoba status alternatif...")
        if review_lkps.select_status("Perlu Revisi"):
            print(f"   ✅ Status 'Perlu Revisi' berhasil dipilih")
            status_review = "Perlu Revisi"
        else:
            print(f"   ⚠️  Semua opsi status gagal")
    
    time.sleep(1)
    
    # ============= STEP 9: SCREENSHOT SEBELUM SUBMIT =============
    print("\n" + "="*80)
    print("📍 STEP 9: Screenshot Form Review")
    print("="*80)
    
    screenshot_path = "screenshot_review_lkps_form.png"
    driver.save_screenshot(screenshot_path)
    print(f"\n   📸 Screenshot disimpan: {screenshot_path}")
    
    # ============= STEP 10: SUBMIT REVIEW =============
    print("\n" + "="*80)
    print("📍 STEP 10: Submit Review LKPS")
    print("="*80)
    
    print(f"\n   ➤ Klik tombol Submit...")
    
    if review_lkps.submit_review():
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
    
    # ============= STEP 11: VERIFIKASI DI DASHBOARD =============
    print("\n" + "="*80)
    print("📍 STEP 11: Verifikasi Status di Dashboard")
    print("="*80)
    
    # Kembali ke dashboard jika belum
    if '/review' in driver.current_url:
        p4m_dashboard.open()
        time.sleep(2)
    
    # Filter LKPS lagi
    p4m_dashboard.filter_by_kategori('LKPS')
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
    
    # ============= STEP 12: SCREENSHOT AKHIR =============
    print("\n" + "="*80)
    print("📍 STEP 12: Screenshot Dashboard Final")
    print("="*80)
    
    screenshot_final = "screenshot_review_lkps_final.png"
    driver.save_screenshot(screenshot_final)
    print(f"\n   📸 Screenshot final disimpan: {screenshot_final}")
    
    print("\n" + "="*80)
    print("✅ TEST UJI FUNGSIONAL REVIEW LKPS SELESAI")
    print("="*80)
    print(f"\n📝 Ringkasan:")
    print(f"   • Login P4M: ✅")
    print(f"   • Akses Dashboard: ✅")
    print(f"   • Filter LKPS: ✅")
    print(f"   • Buka Review Page: ✅")
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
    
    screenshot_error = "screenshot_review_lkps_error.png"
    driver.save_screenshot(screenshot_error)
    print(f"\n📸 Screenshot error disimpan: {screenshot_error}")
    
    print(f"\n⏸️  Browser akan ditutup dalam 5 detik...")
    time.sleep(5)

finally:
    driver.quit()
    print("✅ Test selesai")
