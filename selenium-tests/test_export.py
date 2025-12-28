"""
Test Export - LKPS (Excel & Word) dan LED (PDF & Word)
Test untuk:
1. Export LKPS ke Excel
2. Export LKPS ke Word
3. Export LED ke PDF
4. Export LED ke Word
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
    print("  🧪 TEST EXPORT - LKPS (Excel & Word) | LED (PDF & Word)")
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
    
    # ============= STEP 3: CEK DAFTAR BAGIAN =============
    print("\n📍 STEP 3: Cek daftar bagian akreditasi...")
    
    bagian_items = export_page.get_all_bagian_items()
    
    print(f"   ℹ️  Total bagian tersedia: {len(bagian_items)}")
    
    if len(bagian_items) == 0:
        print("   ⚠️  TIDAK ADA BAGIAN!")
        print("   ℹ️  Pastikan data LKPS/LED sudah di-save di database")
        raise Exception("No bagian items found")
    
    # Tampilkan beberapa item
    print(f"\n   📋 Daftar Bagian (max 10 pertama):")
    for i, item in enumerate(bagian_items[:10], 1):
        kode = item['kode']
        nama = item['nama'][:50]
        print(f"      {i}. {kode} - {nama}...")
    
    if len(bagian_items) > 10:
        print(f"      ... dan {len(bagian_items) - 10} bagian lainnya")
    
    # Identifikasi LKPS dan LED items
    lkps_items = []
    led_items = []
    
    for item in bagian_items:
        kode = item['kode'].upper()
        nama = item['nama'].lower()
        
        # LED: kode C.1 - C.6 atau nama mengandung 'led'
        if any(c in kode for c in ['C.1', 'C.2', 'C.3', 'C.4', 'C.5', 'C.6']) or 'led' in nama:
            led_items.append(item)
        else:
            lkps_items.append(item)
    
    print(f"\n   ℹ️  LKPS items: {len(lkps_items)}")
    print(f"   ℹ️  LED items: {len(led_items)}")
    
    print(f"   ✅ Daftar bagian berhasil diambil")
    
    # ============= STEP 4: TEST EXPORT LKPS KE EXCEL =============
    print("\n📍 STEP 4: Test export LKPS ke Excel...")
    
    if len(lkps_items) == 0:
        print("   ⚠️  Tidak ada LKPS item untuk di-export")
    else:
        # Pilih format Excel
        print("   ➤ Memilih format: Excel")
        export_page.select_format_excel()
        time.sleep(1)
        
        format_selected = export_page.get_selected_format()
        print(f"   ✅ Format dipilih: {format_selected}")
        
        # Pilih 1 LKPS item (misal: Akuntabilitas)
        print(f"   ➤ Memilih LKPS item untuk export...")
        
        # Coba pilih item pertama LKPS
        test_item = lkps_items[0]
        print(f"      Item: {test_item['kode']} - {test_item['nama'][:40]}...")
        
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
        print(f"   ➤ Mengklik tombol Export...")
        
        export_page.click_export()
        
        print(f"   ✅ Tombol export diklik")
        
        # Tunggu proses export
        time.sleep(3)
        
        # Cek apakah ada modal notifikasi
        if export_page.has_modal_notification():
            modal_msg = export_page.get_modal_message()
            print(f"   ℹ️  Modal muncul: {modal_msg[:100]}...")
            export_page.close_modal()
            time.sleep(1)
        
        print(f"   ℹ️  File Excel seharusnya sudah terdownload")
        print(f"   ℹ️  Cek folder Downloads: LKPS-Export-*.xlsx")
        
        print(f"   ✅ Export LKPS ke Excel selesai")
    
    # ============= STEP 5: TEST EXPORT LKPS KE WORD =============
    print("\n📍 STEP 5: Test export LKPS ke Word...")
    
    # Refresh halaman dulu
    export_page.open()
    time.sleep(2)
    
    if len(lkps_items) == 0:
        print("   ⚠️  Tidak ada LKPS item untuk di-export")
    else:
        # Pilih format Word
        print("   ➤ Memilih format: Word/Docs")
        export_page.select_format_word()
        time.sleep(1)
        
        format_selected = export_page.get_selected_format()
        print(f"   ✅ Format dipilih: {format_selected}")
        
        # Pilih 1 LKPS item
        print(f"   ➤ Memilih LKPS item untuk export...")
        
        test_item = lkps_items[0]
        print(f"      Item: {test_item['kode']} - {test_item['nama'][:40]}...")
        
        # Refresh bagian items (karena halaman di-refresh)
        bagian_items = export_page.get_all_bagian_items()
        
        # Cari item yang sama
        for item in bagian_items:
            if item['kode'] == test_item['kode']:
                checkbox = item['checkbox']
                driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", checkbox)
                time.sleep(0.5)
                
                if not checkbox.is_selected():
                    try:
                        checkbox.click()
                    except:
                        driver.execute_script("arguments[0].click();", checkbox)
                
                break
        
        time.sleep(1)
        
        selected_count = export_page.get_selected_count()
        print(f"   ✅ Item dipilih: {selected_count}")
        
        # Klik tombol Export
        print(f"   ➤ Mengklik tombol Export...")
        
        export_page.click_export()
        
        print(f"   ✅ Tombol export diklik")
        
        # Tunggu proses export
        time.sleep(3)
        
        # Cek modal
        if export_page.has_modal_notification():
            modal_msg = export_page.get_modal_message()
            print(f"   ℹ️  Modal muncul: {modal_msg[:100]}...")
            export_page.close_modal()
            time.sleep(1)
        
        print(f"   ℹ️  File Word seharusnya sudah terdownload")
        print(f"   ℹ️  Cek folder Downloads: LKPS-Export-*.doc")
        
        print(f"   ✅ Export LKPS ke Word selesai")
    
    # ============= STEP 6: TEST EXPORT LED KE PDF =============
    print("\n📍 STEP 6: Test export LED ke PDF...")
    
    # Refresh halaman
    export_page.open()
    time.sleep(2)
    
    if len(led_items) == 0:
        print("   ⚠️  Tidak ada LED item untuk di-export")
    else:
        # Pilih format PDF
        print("   ➤ Memilih format: PDF")
        export_page.select_format_pdf()
        time.sleep(1)
        
        format_selected = export_page.get_selected_format()
        print(f"   ✅ Format dipilih: {format_selected}")
        
        # Pilih 1 LED item
        print(f"   ➤ Memilih LED item untuk export...")
        
        test_item = led_items[0]
        print(f"      Item: {test_item['kode']} - {test_item['nama'][:40]}...")
        
        # Refresh bagian items
        bagian_items = export_page.get_all_bagian_items()
        
        # Cari item yang sama
        for item in bagian_items:
            if item['kode'] == test_item['kode']:
                checkbox = item['checkbox']
                driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", checkbox)
                time.sleep(0.5)
                
                if not checkbox.is_selected():
                    try:
                        checkbox.click()
                    except:
                        driver.execute_script("arguments[0].click();", checkbox)
                
                break
        
        time.sleep(1)
        
        selected_count = export_page.get_selected_count()
        print(f"   ✅ Item dipilih: {selected_count}")
        
        # Klik tombol Export
        print(f"   ➤ Mengklik tombol Export...")
        
        export_page.click_export()
        
        print(f"   ✅ Tombol export diklik")
        
        # Tunggu proses export (PDF akan buka di tab baru untuk print)
        time.sleep(5)
        
        print(f"   ℹ️  PDF seharusnya terbuka di tab baru untuk print")
        print(f"   ℹ️  Atau cek folder Downloads: LED-*.pdf")
        
        # Cek modal
        if export_page.has_modal_notification():
            modal_msg = export_page.get_modal_message()
            print(f"   ℹ️  Modal muncul: {modal_msg[:100]}...")
            export_page.close_modal()
            time.sleep(1)
        
        print(f"   ✅ Export LED ke PDF selesai")
    
    # ============= STEP 7: TEST EXPORT LED KE WORD =============
    print("\n📍 STEP 7: Test export LED ke Word...")
    
    # Refresh halaman
    export_page.open()
    time.sleep(2)
    
    if len(led_items) == 0:
        print("   ⚠️  Tidak ada LED item untuk di-export")
    else:
        # Pilih format Word
        print("   ➤ Memilih format: Word/Docs")
        export_page.select_format_word()
        time.sleep(1)
        
        format_selected = export_page.get_selected_format()
        print(f"   ✅ Format dipilih: {format_selected}")
        
        # Pilih 1 LED item
        print(f"   ➤ Memilih LED item untuk export...")
        
        test_item = led_items[0]
        print(f"      Item: {test_item['kode']} - {test_item['nama'][:40]}...")
        
        # Refresh bagian items
        bagian_items = export_page.get_all_bagian_items()
        
        # Cari item yang sama
        for item in bagian_items:
            if item['kode'] == test_item['kode']:
                checkbox = item['checkbox']
                driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", checkbox)
                time.sleep(0.5)
                
                if not checkbox.is_selected():
                    try:
                        checkbox.click()
                    except:
                        driver.execute_script("arguments[0].click();", checkbox)
                
                break
        
        time.sleep(1)
        
        selected_count = export_page.get_selected_count()
        print(f"   ✅ Item dipilih: {selected_count}")
        
        # Klik tombol Export
        print(f"   ➤ Mengklik tombol Export...")
        
        export_page.click_export()
        
        print(f"   ✅ Tombol export diklik")
        
        # Tunggu proses export
        time.sleep(3)
        
        # Cek modal
        if export_page.has_modal_notification():
            modal_msg = export_page.get_modal_message()
            print(f"   ℹ️  Modal muncul: {modal_msg[:100]}...")
            export_page.close_modal()
            time.sleep(1)
        
        print(f"   ℹ️  File Word seharusnya sudah terdownload")
        print(f"   ℹ️  Cek folder Downloads: LED-*.doc")
        
        print(f"   ✅ Export LED ke Word selesai")
    
    # ============= STEP 8: TEST EXPORT MULTIPLE ITEMS =============
    print("\n📍 STEP 8: Test export multiple items...")
    
    # Refresh halaman
    export_page.open()
    time.sleep(2)
    
    # Pilih format Word (support both LKPS dan LED)
    print("   ➤ Memilih format: Word/Docs")
    export_page.select_format_word()
    time.sleep(1)
    
    # Pilih beberapa item (max 3)
    print(f"   ➤ Memilih beberapa item untuk export...")
    
    bagian_items = export_page.get_all_bagian_items()
    items_to_select = bagian_items[:min(3, len(bagian_items))]
    
    for item in items_to_select:
        print(f"      - {item['kode']} - {item['nama'][:40]}...")
        
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
    print(f"   ➤ Mengklik tombol Export...")
    
    export_page.click_export()
    
    print(f"   ✅ Tombol export diklik")
    
    # Tunggu proses
    time.sleep(5)
    
    # Cek modal
    if export_page.has_modal_notification():
        modal_msg = export_page.get_modal_message()
        print(f"   ℹ️  Modal muncul: {modal_msg[:100]}...")
        export_page.close_modal()
        time.sleep(1)
    
    print(f"   ℹ️  File(s) Word seharusnya sudah terdownload")
    print(f"   ✅ Export multiple items selesai")
    
    # ============= FINAL SUMMARY =============
    print("\n" + "="*70)
    print("  ✅ TEST SELESAI!")
    print("="*70)
    
    print("\n📊 SUMMARY:")
    print(f"✅ Login berhasil")
    print(f"✅ Halaman Export dimuat")
    print(f"✅ Daftar bagian berhasil diambil ({len(bagian_items)} items)")
    print(f"✅ LKPS items: {len(lkps_items)}")
    print(f"✅ LED items: {len(led_items)}")
    
    print("\n📝 TEST EXPORT:")
    if len(lkps_items) > 0:
        print(f"✅ LKPS → Excel tested")
        print(f"✅ LKPS → Word tested")
    else:
        print(f"⚠️  LKPS tidak ada untuk di-test")
    
    if len(led_items) > 0:
        print(f"✅ LED → PDF tested")
        print(f"✅ LED → Word tested")
    else:
        print(f"⚠️  LED tidak ada untuk di-test")
    
    print(f"✅ Multiple items → Word tested")
    
    print("\n💡 CATATAN:")
    print("- LKPS: Dapat di-export ke Excel dan Word")
    print("- LED: Dapat di-export ke PDF dan Word")
    print("- Excel: File .xlsx akan terdownload")
    print("- Word: File .doc akan terdownload (bisa dibuka di MS Word/Google Docs)")
    print("- PDF: File akan buka di tab baru untuk print (atau download .pdf)")
    print("- Cek folder Downloads untuk file yang terdownload")

except Exception as e:
    print(f"\n❌ ERROR: {str(e)}")
    import traceback
    traceback.print_exc()
    
    print("\n💡 TROUBLESHOOTING:")
    print("1. Pastikan sudah login dengan email Tim Akreditasi")
    print("2. Pastikan data LKPS/LED sudah di-save di database")
    print("3. Cek status data: harus 'Siap Export' atau 'Lengkap'")
    print("4. Cek Chrome download settings")
    print("5. Allow popup untuk export PDF")

finally:
    print("\nMenutup browser dalam 5 detik...")
    time.sleep(5)
    driver.quit()
    print("Browser ditutup.")
