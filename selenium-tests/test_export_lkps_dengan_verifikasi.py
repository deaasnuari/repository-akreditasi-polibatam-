"""
Test Export LKPS dengan Verifikasi Download
Test untuk export LKPS ke Excel dan Word dengan verifikasi file yang di-download
"""

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import sys
import os
import glob

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from page_objects.login_page import LoginPage
from page_objects.export_page import ExportPage

# Konfigurasi
EMAIL = "test_5hnkxvpw@polibatam.ac.id"
PASSWORD = "test12345"
ROLE = "Tim Akreditasi"

# Download folder (Chrome default)
DOWNLOAD_DIR = os.path.join(os.path.expanduser("~"), "Downloads")

def wait_for_download(download_dir, timeout=30, extension=None):
    """
    Tunggu sampai file selesai di-download
    
    Args:
        download_dir: Direktori download
        timeout: Timeout dalam detik
        extension: Extension file yang diharapkan (misal: '.xlsx', '.doc')
    
    Returns:
        str: Path file yang di-download, atau None jika timeout
    """
    print(f"   ⏳ Menunggu file download di: {download_dir}")
    
    # Ambil daftar file sebelum download
    files_before = set(os.listdir(download_dir))
    
    # Tunggu sampai ada file baru
    seconds_waited = 0
    while seconds_waited < timeout:
        time.sleep(1)
        seconds_waited += 1
        
        files_after = set(os.listdir(download_dir))
        new_files = files_after - files_before
        
        # Filter file yang sedang di-download (.crdownload)
        completed_files = [f for f in new_files if not f.endswith('.crdownload') and not f.endswith('.tmp')]
        
        if completed_files:
            # Jika ada extension filter, filter berdasarkan extension
            if extension:
                completed_files = [f for f in completed_files if f.endswith(extension)]
            
            if completed_files:
                downloaded_file = completed_files[0]
                file_path = os.path.join(download_dir, downloaded_file)
                file_size = os.path.getsize(file_path)
                
                print(f"   ✅ File downloaded: {downloaded_file}")
                print(f"   📊 Ukuran file: {file_size:,} bytes ({file_size/1024:.2f} KB)")
                
                return file_path
        
        if seconds_waited % 5 == 0:
            print(f"   ⏳ Masih menunggu... ({seconds_waited}/{timeout}s)")
    
    print(f"   ❌ Timeout: File tidak ditemukan setelah {timeout} detik")
    return None

def clear_recent_downloads(download_dir, extensions=['.xlsx', '.doc', '.pdf']):
    """
    Hapus file download terbaru dengan extension tertentu
    """
    try:
        for ext in extensions:
            pattern = os.path.join(download_dir, f"*{ext}")
            files = glob.glob(pattern)
            
            # Urutkan berdasarkan waktu modifikasi (terbaru dulu)
            files.sort(key=os.path.getmtime, reverse=True)
            
            # Hapus 3 file terbaru untuk setiap extension
            for file in files[:3]:
                try:
                    os.remove(file)
                    print(f"   🗑️  Dihapus: {os.path.basename(file)}")
                except:
                    pass
    except Exception as e:
        print(f"   ⚠️  Error clearing downloads: {e}")

# Inisialisasi driver
driver = webdriver.Chrome()
driver.maximize_window()

try:
    print("="*80)
    print("  🧪 TEST EXPORT LKPS DENGAN VERIFIKASI DOWNLOAD")
    print("="*80)
    
    # Clear download sebelumnya
    print("\n🧹 Membersihkan file download lama...")
    clear_recent_downloads(DOWNLOAD_DIR)
    
    # ============= STEP 1: LOGIN =============
    print("\n📍 STEP 1: Login sebagai Tim Akreditasi...")
    
    login_page = LoginPage(driver)
    login_page.open()
    login_page.login(EMAIL, PASSWORD, ROLE)
    time.sleep(2)
    
    print("   ✅ Login berhasil")
    
    # ============= STEP 2: BUKA HALAMAN EXPORT =============
    print("\n📍 STEP 2: Membuka halaman Export...")
    
    export_page = ExportPage(driver)
    export_page.open()
    time.sleep(3)
    
    if export_page.is_loaded():
        print(f"   ✅ Halaman Export dimuat: {driver.current_url}")
    else:
        raise Exception("Gagal memuat halaman Export")
    
    # ============= STEP 3: IDENTIFIKASI ITEM LKPS =============
    print("\n📍 STEP 3: Identifikasi item LKPS...")
    
    bagian_items = export_page.get_all_bagian_items()
    
    print(f"   ℹ️  Total bagian tersedia: {len(bagian_items)}")
    
    if len(bagian_items) == 0:
        print("   ⚠️  TIDAK ADA BAGIAN!")
        print("   ℹ️  Pastikan data LKPS sudah di-save di database")
        raise Exception("No bagian items found")
    
    # Filter hanya LKPS items (exclude LED items yang kodenya C.1 - C.6)
    lkps_items = []
    led_items = []
    
    for item in bagian_items:
        kode = item['kode'].upper()
        nama = item['nama'].lower()
        
        # Cek apakah LED item (kode C.1 - C.6)
        is_led = any(c in kode for c in ['C.1', 'C.2', 'C.3', 'C.4', 'C.5', 'C.6'])
        
        if is_led:
            led_items.append(item)
        else:
            lkps_items.append(item)
    
    print(f"\n   📋 Items yang ditemukan:")
    print(f"      • LKPS Items: {len(lkps_items)}")
    print(f"      • LED Items: {len(led_items)}")
    
    if len(lkps_items) > 0:
        print(f"\n   📄 LKPS Items:")
        for i, item in enumerate(lkps_items[:5], 1):
            kode = item['kode']
            nama = item['nama'][:50]
            print(f"      {i}. {kode} - {nama}...")
    
    if len(led_items) > 0:
        print(f"\n   📄 LED Items:")
        for i, item in enumerate(led_items[:5], 1):
            kode = item['kode']
            nama = item['nama'][:50]
            print(f"      {i}. {kode} - {nama}...")
    
    if len(lkps_items) == 0:
        print("\n   ⚠️  TIDAK ADA LKPS ITEMS!")
        print("   ℹ️  Pastikan data LKPS (Akuntabilitas, Relevansi, dll) sudah di-save")
    
    if len(led_items) == 0:
        print("\n   ⚠️  TIDAK ADA LED ITEMS!")
        print("   ℹ️  Pastikan data LED (C.1-C.6) sudah di-save")
    
    # ============= STEP 4: TEST EXPORT LKPS → EXCEL =============
    if len(lkps_items) > 0:
        print("\n" + "="*80)
        print("📍 STEP 4: Test Export LKPS → Excel")
        print("="*80)
        
        # Refresh halaman untuk reset state
        export_page.open()
        time.sleep(3)
        
        print("\n   1️⃣ Pilih format Excel...")
        success = export_page.select_format_excel()
        if success:
            print("   ✅ Format Excel dipilih")
        else:
            print("   ❌ Gagal memilih format Excel")
        
        time.sleep(1)
        
        # Pilih 1 item LKPS
        print(f"\n   2️⃣ Pilih item LKPS: {lkps_items[0]['kode']}...")
        selected = export_page.select_bagian_by_kode(lkps_items[0]['kode'])
        if selected:
            print(f"   ✅ Item dipilih: {lkps_items[0]['kode']} - {lkps_items[0]['nama'][:50]}...")
        else:
            print(f"   ❌ Gagal memilih item")
        
        time.sleep(2)
        
        # Cek format yang terpilih
        current_format = export_page.get_selected_format()
        print(f"\n   📊 Format yang terpilih: {current_format}")
        
        # Cek jumlah item yang dipilih
        selected_count = export_page.get_selected_count()
        print(f"   📊 Jumlah item dipilih: {selected_count}")
        
        print("\n   3️⃣ Klik tombol Export...")
        
        # Ambil daftar file sebelum download
        files_before = set(os.listdir(DOWNLOAD_DIR))
        
        export_page.click_export()
        time.sleep(2)
        
        # Tunggu modal muncul
        if export_page.has_modal_notification():
            print("   ℹ️  Modal notifikasi muncul")
            time.sleep(1)
            export_page.close_modal()
            print("   ✅ Modal ditutup")
        
        # Tunggu file download
        print("\n   4️⃣ Verifikasi download...")
        downloaded_file = wait_for_download(DOWNLOAD_DIR, timeout=30, extension='.xlsx')
        
        if downloaded_file:
            print(f"\n   ✅ LKPS → Excel BERHASIL!")
            print(f"   📁 File: {os.path.basename(downloaded_file)}")
            print(f"   📂 Lokasi: {downloaded_file}")
            
            # Cek isi file (buka di Excel jika perlu)
            print(f"\n   💡 Tips: Buka file di Excel untuk verifikasi isi data")
        else:
            print(f"\n   ❌ LKPS → Excel GAGAL!")
            print(f"   ℹ️  File tidak ditemukan di folder Downloads")
            
            # Debug: tampilkan file terbaru
            print(f"\n   🔍 File terbaru di Downloads:")
            files_after = set(os.listdir(DOWNLOAD_DIR))
            new_files = files_after - files_before
            for f in list(new_files)[:5]:
                print(f"      • {f}")
        
        time.sleep(3)
    
    # ============= STEP 5: TEST EXPORT LKPS → WORD =============
    if len(lkps_items) > 0:
        print("\n" + "="*80)
        print("📍 STEP 5: Test Export LKPS → Word")
        print("="*80)
        
        # Refresh halaman untuk reset state
        export_page.open()
        time.sleep(3)
        
        print("\n   1️⃣ Pilih format Word...")
        success = export_page.select_format_word()
        if success:
            print("   ✅ Format Word dipilih")
        else:
            print("   ❌ Gagal memilih format Word")
        
        time.sleep(1)
        
        # Pilih 1 item LKPS (bisa yang berbeda)
        item_index = min(1, len(lkps_items) - 1)
        print(f"\n   2️⃣ Pilih item LKPS: {lkps_items[item_index]['kode']}...")
        selected = export_page.select_bagian_by_kode(lkps_items[item_index]['kode'])
        if selected:
            print(f"   ✅ Item dipilih: {lkps_items[item_index]['kode']} - {lkps_items[item_index]['nama'][:50]}...")
        else:
            print(f"   ❌ Gagal memilih item")
        
        time.sleep(2)
        
        # Cek format yang terpilih
        current_format = export_page.get_selected_format()
        print(f"\n   📊 Format yang terpilih: {current_format}")
        
        # Cek jumlah item yang dipilih
        selected_count = export_page.get_selected_count()
        print(f"   📊 Jumlah item dipilih: {selected_count}")
        
        print("\n   3️⃣ Klik tombol Export...")
        
        # Ambil daftar file sebelum download
        files_before = set(os.listdir(DOWNLOAD_DIR))
        
        export_page.click_export()
        time.sleep(2)
        
        # Tunggu modal muncul
        if export_page.has_modal_notification():
            print("   ℹ️  Modal notifikasi muncul")
            time.sleep(1)
            export_page.close_modal()
            print("   ✅ Modal ditutup")
        
        # Tunggu file download
        print("\n   4️⃣ Verifikasi download...")
        downloaded_file = wait_for_download(DOWNLOAD_DIR, timeout=30, extension='.doc')
        
        if downloaded_file:
            print(f"\n   ✅ LKPS → Word BERHASIL!")
            print(f"   📁 File: {os.path.basename(downloaded_file)}")
            print(f"   📂 Lokasi: {downloaded_file}")
            
            # Cek isi file (buka di Word jika perlu)
            print(f"\n   💡 Tips: Buka file di Word/Google Docs untuk verifikasi isi data")
        else:
            print(f"\n   ❌ LKPS → Word GAGAL!")
            print(f"   ℹ️  File tidak ditemukan di folder Downloads")
            
            # Debug: tampilkan file terbaru
            print(f"\n   🔍 File terbaru di Downloads:")
            files_after = set(os.listdir(DOWNLOAD_DIR))
            new_files = files_after - files_before
            for f in list(new_files)[:5]:
                print(f"      • {f}")
        
        time.sleep(3)
    
    # ============= STEP 6: TEST EXPORT LED → PDF =============
    if len(led_items) > 0:
        print("\n" + "="*80)
        print("📍 STEP 6: Test Export LED → PDF")
        print("="*80)
        
        # Refresh halaman untuk reset state
        export_page.open()
        time.sleep(3)
        
        print("\n   1️⃣ Pilih format PDF...")
        success = export_page.select_format_pdf()
        if success:
            print("   ✅ Format PDF dipilih")
        else:
            print("   ❌ Gagal memilih format PDF")
        
        time.sleep(1)
        
        # Pilih 1 item LED
        print(f"\n   2️⃣ Pilih item LED: {led_items[0]['kode']}...")
        selected = export_page.select_bagian_by_kode(led_items[0]['kode'])
        if selected:
            print(f"   ✅ Item dipilih: {led_items[0]['kode']} - {led_items[0]['nama'][:50]}...")
        else:
            print(f"   ❌ Gagal memilih item")
        
        time.sleep(2)
        
        # Cek format yang terpilih
        current_format = export_page.get_selected_format()
        print(f"\n   📊 Format yang terpilih: {current_format}")
        
        # Cek jumlah item yang dipilih
        selected_count = export_page.get_selected_count()
        print(f"   📊 Jumlah item dipilih: {selected_count}")
        
        print("\n   3️⃣ Klik tombol Export...")
        print("   ℹ️  PDF akan dibuka di tab baru untuk print")
        
        # Simpan handle window saat ini
        main_window = driver.current_window_handle
        
        export_page.click_export()
        time.sleep(3)
        
        # Cek apakah ada window baru (popup PDF)
        all_windows = driver.window_handles
        
        if len(all_windows) > 1:
            print(f"\n   ✅ Popup PDF terdeteksi!")
            print(f"   📊 Jumlah window: {len(all_windows)}")
            
            # Switch ke window baru
            for window in all_windows:
                if window != main_window:
                    driver.switch_to.window(window)
                    print(f"   🔍 URL popup: {driver.current_url}")
                    time.sleep(2)
                    
                    # Tutup popup
                    driver.close()
                    print("   ✅ Popup PDF ditutup")
                    break
            
            # Kembali ke main window
            driver.switch_to.window(main_window)
            print("   ✅ Kembali ke halaman utama")
            
            print(f"\n   ✅ LED → PDF BERHASIL!")
            print(f"   ℹ️  PDF dibuka di tab baru untuk print")
        else:
            print(f"\n   ⚠️  Popup PDF tidak terdeteksi")
            print(f"   ℹ️  Mungkin popup diblokir oleh browser")
        
        time.sleep(2)
    
    # ============= STEP 7: TEST EXPORT LED → WORD =============
    if len(led_items) > 0:
        print("\n" + "="*80)
        print("📍 STEP 7: Test Export LED → Word")
        print("="*80)
        
        # Refresh halaman untuk reset state
        export_page.open()
        time.sleep(3)
        
        print("\n   1️⃣ Pilih format Word...")
        success = export_page.select_format_word()
        if success:
            print("   ✅ Format Word dipilih")
        else:
            print("   ❌ Gagal memilih format Word")
        
        time.sleep(1)
        
        # Pilih 1 item LED (bisa yang berbeda)
        item_index = min(1, len(led_items) - 1)
        print(f"\n   2️⃣ Pilih item LED: {led_items[item_index]['kode']}...")
        selected = export_page.select_bagian_by_kode(led_items[item_index]['kode'])
        if selected:
            print(f"   ✅ Item dipilih: {led_items[item_index]['kode']} - {led_items[item_index]['nama'][:50]}...")
        else:
            print(f"   ❌ Gagal memilih item")
        
        time.sleep(2)
        
        # Cek format yang terpilih
        current_format = export_page.get_selected_format()
        print(f"\n   📊 Format yang terpilih: {current_format}")
        
        # Cek jumlah item yang dipilih
        selected_count = export_page.get_selected_count()
        print(f"   📊 Jumlah item dipilih: {selected_count}")
        
        print("\n   3️⃣ Klik tombol Export...")
        
        # Ambil daftar file sebelum download
        files_before = set(os.listdir(DOWNLOAD_DIR))
        
        export_page.click_export()
        time.sleep(2)
        
        # Tunggu modal muncul
        if export_page.has_modal_notification():
            print("   ℹ️  Modal notifikasi muncul")
            time.sleep(1)
            export_page.close_modal()
            print("   ✅ Modal ditutup")
        
        # Tunggu file download
        print("\n   4️⃣ Verifikasi download...")
        downloaded_file = wait_for_download(DOWNLOAD_DIR, timeout=30, extension='.doc')
        
        if downloaded_file:
            print(f"\n   ✅ LED → Word BERHASIL!")
            print(f"   📁 File: {os.path.basename(downloaded_file)}")
            print(f"   📂 Lokasi: {downloaded_file}")
            
            # Cek isi file (buka di Word jika perlu)
            print(f"\n   💡 Tips: Buka file di Word/Google Docs untuk verifikasi isi data")
        else:
            print(f"\n   ❌ LED → Word GAGAL!")
            print(f"   ℹ️  File tidak ditemukan di folder Downloads")
            
            # Debug: tampilkan file terbaru
            print(f"\n   🔍 File terbaru di Downloads:")
            files_after = set(os.listdir(DOWNLOAD_DIR))
            new_files = files_after - files_before
            for f in list(new_files)[:5]:
                print(f"      • {f}")
        
        time.sleep(3)
    
    # ============= SUMMARY =============
    print("\n" + "="*80)
    print("📊 SUMMARY TEST EXPORT")
    print("="*80)
    print(f"\n✅ Test selesai!")
    print(f"\n📋 Hasil:")
    print(f"   • LKPS Items: {len(lkps_items)}")
    print(f"   • LED Items: {len(led_items)}")
    print(f"\n📁 Lokasi download: {DOWNLOAD_DIR}")
    print(f"\n💡 Tips:")
    print(f"   • Cek folder Downloads untuk melihat file yang di-export")
    print(f"   • Buka file Excel/Word untuk verifikasi data")
    print(f"   • Format yang sesuai:")
    print(f"     - LKPS → Excel atau Word ✅")
    print(f"     - LED → PDF atau Word ✅")
    print(f"     - LKPS → PDF ❌ (tidak bisa)")
    print(f"     - LED → Excel ❌ (tidak bisa)")

except Exception as e:
    print(f"\n❌ ERROR: {e}")
    import traceback
    traceback.print_exc()

finally:
    print("\n⏸️  Browser akan ditutup dalam 5 detik...")
    time.sleep(5)
    driver.quit()
    print("✅ Test selesai\n")
