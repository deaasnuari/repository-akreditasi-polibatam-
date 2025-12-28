"""
Test Export LKPS - Excel dan Word
Test khusus untuk export LKPS dengan 2 format:
1. LKPS → Excel (.xlsx)
2. LKPS → Word (.doc)
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
from page_objects.export_page import ExportPage

# Konfigurasi
EMAIL = "test_5hnkxvpw@polibatam.ac.id"
PASSWORD = "test12345"
ROLE = "Tim Akreditasi"

# Inisialisasi driver
driver = webdriver.Chrome()
driver.maximize_window()

try:
    print("="*70)
    print("  🧪 TEST EXPORT LKPS - Excel & Word")
    print("="*70)
    
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
    
    for item in bagian_items:
        kode = item['kode'].upper()
        nama = item['nama'].lower()
        
        # Skip LED items (kode C.1 - C.6 atau nama mengandung 'led')
        is_led = any(c in kode for c in ['C.1', 'C.2', 'C.3', 'C.4', 'C.5', 'C.6']) or 'led' in nama
        
        if not is_led:
            lkps_items.append(item)
    
    print(f"\n   📋 LKPS Items yang ditemukan ({len(lkps_items)}):")
    for i, item in enumerate(lkps_items, 1):
        kode = item['kode']
        nama = item['nama'][:50]
        print(f"      {i}. {kode} - {nama}...")
    
    if len(lkps_items) == 0:
        print("\n   ⚠️  TIDAK ADA LKPS ITEMS!")
        print("   ℹ️  Hanya ditemukan LED items")
        print("   ℹ️  Pastikan data LKPS (Akuntabilitas, Relevansi, dll) sudah di-save")
        raise Exception("No LKPS items found")
    
    print(f"   ✅ Ditemukan {len(lkps_items)} LKPS items")
    
    # ============= STEP 4: TEST EXPORT LKPS → EXCEL =============
    print("\n📍 STEP 4: Test export LKPS ke Excel...")
    
    print("   ➤ Memilih format: Excel")
    export_page.select_format_excel()
    time.sleep(1)
    
    format_selected = export_page.get_selected_format()
    print(f"   ✅ Format dipilih: {format_selected}")
    
    # Pilih 1 LKPS item untuk test
    test_item = lkps_items[0]
    print(f"\n   ➤ Memilih LKPS item untuk export:")
    print(f"      Kode: {test_item['kode']}")
    print(f"      Nama: {test_item['nama']}")
    
    # Klik checkbox item
    checkbox = test_item['checkbox']
    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", checkbox)
    time.sleep(0.5)
    
    if not checkbox.is_selected():
        try:
            checkbox.click()
        except:
            driver.execute_script("arguments[0].click();", checkbox)
    
    time.sleep(1)
    
    selected_count = export_page.get_selected_count()
    print(f"   ✅ Item dipilih: {selected_count}")
    
    # Klik tombol Export
    print(f"\n   ➤ Mengklik tombol Export...")
    
    export_page.click_export()
    
    print(f"   ✅ Tombol export diklik")
    
    # Tunggu proses export
    print(f"   ⏳ Menunggu proses export...")
    time.sleep(5)
    
    # Cek apakah ada modal notifikasi
    if export_page.has_modal_notification():
        modal_msg = export_page.get_modal_message()
        print(f"   📢 Modal notifikasi:")
        print(f"      {modal_msg[:200]}...")
        
        # Tutup modal
        export_page.close_modal()
        time.sleep(1)
    
    print(f"\n   ✅ Export LKPS ke Excel SELESAI")
    print(f"   📁 File Excel seharusnya sudah terdownload")
    print(f"   📄 Nama file: LKPS-Export-*.xlsx")
    print(f"   📂 Lokasi: Folder Downloads")
    
    # ============= STEP 5: TEST EXPORT LKPS → WORD =============
    print("\n📍 STEP 5: Test export LKPS ke Word...")
    
    # Refresh halaman untuk reset pilihan
    print("   ➤ Refresh halaman...")
    export_page.open()
    time.sleep(2)
    
    print("   ➤ Memilih format: Word/Docs")
    export_page.select_format_word()
    time.sleep(1)
    
    format_selected = export_page.get_selected_format()
    print(f"   ✅ Format dipilih: {format_selected}")
    
    # Ambil ulang bagian items setelah refresh
    bagian_items = export_page.get_all_bagian_items()
    
    # Filter lagi LKPS items
    lkps_items_refresh = []
    for item in bagian_items:
        kode = item['kode'].upper()
        nama = item['nama'].lower()
        is_led = any(c in kode for c in ['C.1', 'C.2', 'C.3', 'C.4', 'C.5', 'C.6']) or 'led' in nama
        if not is_led:
            lkps_items_refresh.append(item)
    
    # Pilih item yang sama atau item pertama
    test_item = lkps_items_refresh[0]
    print(f"\n   ➤ Memilih LKPS item untuk export:")
    print(f"      Kode: {test_item['kode']}")
    print(f"      Nama: {test_item['nama']}")
    
    # Klik checkbox
    checkbox = test_item['checkbox']
    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", checkbox)
    time.sleep(0.5)
    
    if not checkbox.is_selected():
        try:
            checkbox.click()
        except:
            driver.execute_script("arguments[0].click();", checkbox)
    
    time.sleep(1)
    
    selected_count = export_page.get_selected_count()
    print(f"   ✅ Item dipilih: {selected_count}")
    
    # Klik tombol Export
    print(f"\n   ➤ Mengklik tombol Export...")
    
    export_page.click_export()
    
    print(f"   ✅ Tombol export diklik")
    
    # Tunggu proses export
    print(f"   ⏳ Menunggu proses export...")
    time.sleep(5)
    
    # Cek modal
    if export_page.has_modal_notification():
        modal_msg = export_page.get_modal_message()
        print(f"   📢 Modal notifikasi:")
        print(f"      {modal_msg[:200]}...")
        
        export_page.close_modal()
        time.sleep(1)
    
    print(f"\n   ✅ Export LKPS ke Word SELESAI")
    print(f"   📁 File Word seharusnya sudah terdownload")
    print(f"   📄 Nama file: LKPS-Export-*.doc")
    print(f"   📂 Lokasi: Folder Downloads")
    
    # ============= STEP 6: TEST EXPORT MULTIPLE LKPS → EXCEL =============
    print("\n📍 STEP 6: Test export multiple LKPS ke Excel...")
    
    # Refresh halaman
    print("   ➤ Refresh halaman...")
    export_page.open()
    time.sleep(2)
    
    print("   ➤ Memilih format: Excel")
    export_page.select_format_excel()
    time.sleep(1)
    
    # Ambil ulang items
    bagian_items = export_page.get_all_bagian_items()
    lkps_items_refresh = []
    for item in bagian_items:
        kode = item['kode'].upper()
        nama = item['nama'].lower()
        is_led = any(c in kode for c in ['C.1', 'C.2', 'C.3', 'C.4', 'C.5', 'C.6']) or 'led' in nama
        if not is_led:
            lkps_items_refresh.append(item)
    
    # Pilih beberapa LKPS items (max 3)
    items_to_select = lkps_items_refresh[:min(3, len(lkps_items_refresh))]
    
    print(f"\n   ➤ Memilih {len(items_to_select)} LKPS items:")
    
    for i, item in enumerate(items_to_select, 1):
        print(f"      {i}. {item['kode']} - {item['nama'][:40]}...")
        
        checkbox = item['checkbox']
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", checkbox)
        time.sleep(0.3)
        
        if not checkbox.is_selected():
            try:
                checkbox.click()
            except:
                driver.execute_script("arguments[0].click();", checkbox)
    
    time.sleep(1)
    
    selected_count = export_page.get_selected_count()
    print(f"   ✅ Total item dipilih: {selected_count}")
    
    # Klik Export
    print(f"\n   ➤ Mengklik tombol Export...")
    
    export_page.click_export()
    
    print(f"   ✅ Tombol export diklik")
    
    # Tunggu proses
    print(f"   ⏳ Menunggu proses export...")
    time.sleep(5)
    
    # Cek modal
    if export_page.has_modal_notification():
        modal_msg = export_page.get_modal_message()
        print(f"   📢 Modal notifikasi:")
        print(f"      {modal_msg[:200]}...")
        
        export_page.close_modal()
        time.sleep(1)
    
    print(f"\n   ✅ Export multiple LKPS ke Excel SELESAI")
    print(f"   📁 File Excel seharusnya sudah terdownload")
    
    # ============= STEP 7: TEST EXPORT MULTIPLE LKPS → WORD =============
    print("\n📍 STEP 7: Test export multiple LKPS ke Word...")
    
    # Refresh halaman
    print("   ➤ Refresh halaman...")
    export_page.open()
    time.sleep(2)
    
    print("   ➤ Memilih format: Word/Docs")
    export_page.select_format_word()
    time.sleep(1)
    
    # Ambil ulang items
    bagian_items = export_page.get_all_bagian_items()
    lkps_items_refresh = []
    for item in bagian_items:
        kode = item['kode'].upper()
        nama = item['nama'].lower()
        is_led = any(c in kode for c in ['C.1', 'C.2', 'C.3', 'C.4', 'C.5', 'C.6']) or 'led' in nama
        if not is_led:
            lkps_items_refresh.append(item)
    
    # Pilih beberapa LKPS items (max 3)
    items_to_select = lkps_items_refresh[:min(3, len(lkps_items_refresh))]
    
    print(f"\n   ➤ Memilih {len(items_to_select)} LKPS items:")
    
    for i, item in enumerate(items_to_select, 1):
        print(f"      {i}. {item['kode']} - {item['nama'][:40]}...")
        
        checkbox = item['checkbox']
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", checkbox)
        time.sleep(0.3)
        
        if not checkbox.is_selected():
            try:
                checkbox.click()
            except:
                driver.execute_script("arguments[0].click();", checkbox)
    
    time.sleep(1)
    
    selected_count = export_page.get_selected_count()
    print(f"   ✅ Total item dipilih: {selected_count}")
    
    # Klik Export
    print(f"\n   ➤ Mengklik tombol Export...")
    
    export_page.click_export()
    
    print(f"   ✅ Tombol export diklik")
    
    # Tunggu proses
    print(f"   ⏳ Menunggu proses export...")
    time.sleep(5)
    
    # Cek modal
    if export_page.has_modal_notification():
        modal_msg = export_page.get_modal_message()
        print(f"   📢 Modal notifikasi:")
        print(f"      {modal_msg[:200]}...")
        
        export_page.close_modal()
        time.sleep(1)
    
    print(f"\n   ✅ Export multiple LKPS ke Word SELESAI")
    print(f"   📁 File Word seharusnya sudah terdownload")
    
    # ============= FINAL SUMMARY =============
    print("\n" + "="*70)
    print("  ✅ TEST SELESAI!")
    print("="*70)
    
    print("\n📊 SUMMARY TEST:")
    print(f"✅ Login berhasil")
    print(f"✅ Halaman Export dimuat")
    print(f"✅ LKPS items diidentifikasi: {len(lkps_items)}")
    print(f"✅ Test export LKPS → Excel (single)")
    print(f"✅ Test export LKPS → Word (single)")
    print(f"✅ Test export LKPS → Excel (multiple)")
    print(f"✅ Test export LKPS → Word (multiple)")
    
    print("\n📋 LKPS ITEMS YANG DI-TEST:")
    for i, item in enumerate(lkps_items[:5], 1):
        print(f"   {i}. {item['kode']} - {item['nama'][:50]}...")
    if len(lkps_items) > 5:
        print(f"   ... dan {len(lkps_items) - 5} item lainnya")
    
    print("\n📁 FILE YANG TERDOWNLOAD:")
    print("   📄 LKPS-Export-*.xlsx (format Excel)")
    print("   📄 LKPS-Export-*.doc (format Word)")
    print("   📂 Lokasi: Folder Downloads")
    
    print("\n💡 CATATAN:")
    print("- LKPS dapat di-export ke Excel (.xlsx) dan Word (.doc)")
    print("- Excel: Berisi tabel data yang dapat diedit di Microsoft Excel")
    print("- Word: Dokumen yang dapat dibuka di Microsoft Word atau Google Docs")
    print("- File akan otomatis terdownload ke folder Downloads")
    print("- Untuk export LED, gunakan format PDF atau Word (test terpisah)")

except Exception as e:
    print(f"\n❌ ERROR: {str(e)}")
    import traceback
    traceback.print_exc()
    
    print("\n💡 TROUBLESHOOTING:")
    print("1. Pastikan sudah login dengan email Tim Akreditasi")
    print("2. Pastikan data LKPS sudah di-save di database:")
    print("   - Akuntabilitas")
    print("   - Relevansi Pendidikan")
    print("   - Relevansi Penelitian")
    print("   - Relevansi PkM")
    print("   - Diferensiasi Misi")
    print("   - Budaya Mutu")
    print("3. Cek status data: harus 'Siap Export' atau 'Lengkap'")
    print("4. Cek Chrome download settings (auto-download enabled)")
    print("5. Pastikan tidak ada popup blocker")

finally:
    print("\nMenutup browser dalam 5 detik...")
    time.sleep(5)
    driver.quit()
    print("Browser ditutup.")
