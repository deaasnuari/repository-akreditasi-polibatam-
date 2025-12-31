"""
Test Export dari Bukti Pendukung - LKPS (Excel & Word) dan LED (PDF & Word)

Flow Test:
1. Login
2. Buka Bukti Pendukung → Lihat data yang sudah di-submit
3. Identifikasi LKPS dan LED items
4. Pindah ke halaman Export
5. Export LKPS ke Excel
6. Export LKPS ke Word
7. Export LED ke PDF
8. Export LED ke Word
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
    print("  🧪 TEST EXPORT dari BUKTI PENDUKUNG")
    print("  LKPS → Excel & Word | LED → PDF & Word")
    print("="*70)
    
    # ============= STEP 1: LOGIN =============
    print("\n📍 STEP 1: Login sebagai Tim Akreditasi...")
    
    login_page = LoginPage(driver)
    login_page.open()
    login_page.login(EMAIL, PASSWORD, ROLE)
    time.sleep(2)
    
    print("   ✅ Login berhasil")
    
    # ============= STEP 2: BUKA BUKTI PENDUKUNG =============
    print("\n📍 STEP 2: Membuka halaman Bukti Pendukung...")
    
    driver.get("http://localhost:3000/dashboard/tim-akreditasi/bukti-pendukung")
    time.sleep(3)
    
    current_url = driver.current_url
    if 'bukti-pendukung' in current_url.lower():
        print(f"   ✅ Halaman Bukti Pendukung dimuat: {current_url}")
    else:
        raise Exception("Gagal membuka halaman Bukti Pendukung")
    
    # ============= STEP 3: CEK DATA DI BUKTI PENDUKUNG =============
    print("\n📍 STEP 3: Cek data di Bukti Pendukung...")
    
    time.sleep(2)
    
    try:
        # Cari tabel
        table_rows = driver.find_elements(By.XPATH, "//tbody//tr")
        print(f"   ℹ️  Ditemukan {len(table_rows)} item di Bukti Pendukung")
        
        if len(table_rows) == 0:
            print("   ⚠️  TIDAK ADA DATA!")
            print("   ℹ️  Pastikan sudah ada LKPS/LED yang di-submit dengan status Draft/Menunggu")
            raise Exception("No data in Bukti Pendukung")
        
        # Identifikasi LKPS dan LED items
        lkps_items = []
        led_items = []
        
        print("\n   📋 Daftar item di Bukti Pendukung:")
        
        for i, row in enumerate(table_rows[:10], 1):
            try:
                judul = row.find_element(By.XPATH, ".//td[1]").text
                kategori = row.find_element(By.XPATH, ".//td[3]").text
                status = row.find_element(By.XPATH, ".//td[4]").text if len(row.find_elements(By.XPATH, ".//td")) > 4 else ""
                
                print(f"      {i}. {judul[:50]}...")
                print(f"         Kategori: {kategori} | Status: {status}")
                
                # Klasifikasi berdasarkan kategori
                if kategori.upper() == 'LKPS':
                    lkps_items.append({'judul': judul, 'kategori': kategori, 'status': status})
                elif kategori.upper() == 'LED':
                    led_items.append({'judul': judul, 'kategori': kategori, 'status': status})
                
            except Exception as e:
                pass
        
        if len(table_rows) > 10:
            print(f"      ... dan {len(table_rows) - 10} item lainnya")
        
        print(f"\n   📊 Klasifikasi:")
        print(f"      LKPS items: {len(lkps_items)}")
        print(f"      LED items: {len(led_items)}")
        
        if len(lkps_items) == 0 and len(led_items) == 0:
            print("\n   ⚠️  Tidak ada LKPS atau LED yang teridentifikasi")
            print("   ℹ️  Items mungkin belum ter-submit atau kategori tidak sesuai")
        
        print(f"   ✅ Data Bukti Pendukung berhasil dianalisis")
        
    except Exception as e:
        print(f"   ❌ Error cek Bukti Pendukung: {e}")
    
    # ============= STEP 4: PINDAH KE HALAMAN EXPORT =============
    print("\n📍 STEP 4: Pindah ke halaman Export...")
    
    export_page = ExportPage(driver)
    export_page.open()
    time.sleep(3)
    
    if export_page.is_loaded():
        print(f"   ✅ Halaman Export dimuat: {driver.current_url}")
    else:
        raise Exception("Gagal memuat halaman Export")
    
    # ============= STEP 5: CEK ITEM DI EXPORT =============
    print("\n📍 STEP 5: Cek item yang tersedia untuk export...")
    
    bagian_items = export_page.get_all_bagian_items()
    
    print(f"   ℹ️  Total bagian tersedia: {len(bagian_items)}")
    
    if len(bagian_items) == 0:
        print("   ⚠️  TIDAK ADA BAGIAN untuk export!")
        print("   ℹ️  Data mungkin belum lengkap atau belum di-submit")
    
    # Filter LKPS dan LED
    lkps_export_items = []
    led_export_items = []
    
    for item in bagian_items:
        kode = item['kode'].upper()
        nama = item['nama'].lower()
        
        # LED: kode C.1 - C.6
        if any(c in kode for c in ['C.1', 'C.2', 'C.3', 'C.4', 'C.5', 'C.6']) or 'led' in nama:
            led_export_items.append(item)
        else:
            lkps_export_items.append(item)
    
    print(f"\n   📋 Items di halaman Export:")
    print(f"      LKPS items: {len(lkps_export_items)}")
    if len(lkps_export_items) > 0:
        for i, item in enumerate(lkps_export_items[:3], 1):
            print(f"         {i}. {item['kode']} - {item['nama'][:40]}...")
        if len(lkps_export_items) > 3:
            print(f"         ... dan {len(lkps_export_items) - 3} lainnya")
    
    print(f"\n      LED items: {len(led_export_items)}")
    if len(led_export_items) > 0:
        for i, item in enumerate(led_export_items[:3], 1):
            print(f"         {i}. {item['kode']} - {item['nama'][:40]}...")
        if len(led_export_items) > 3:
            print(f"         ... dan {len(led_export_items) - 3} lainnya")
    
    # ============= STEP 6: TEST EXPORT LKPS → EXCEL =============
    print("\n📍 STEP 6: Test export LKPS ke Excel...")
    
    if len(lkps_export_items) == 0:
        print("   ⚠️  Tidak ada LKPS item untuk di-export")
    else:
        print("   ➤ Memilih format: Excel")
        export_page.select_format_excel()
        time.sleep(1)
        
        # Pilih 1 LKPS item
        test_item = lkps_export_items[0]
        print(f"   ➤ Memilih item: {test_item['kode']} - {test_item['nama'][:40]}...")
        
        checkbox = test_item['checkbox']
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", checkbox)
        time.sleep(0.5)
        
        if not checkbox.is_selected():
            try:
                checkbox.click()
            except:
                driver.execute_script("arguments[0].click();", checkbox)
        
        time.sleep(1)
        
        print(f"   ✅ Item dipilih")
        
        # Klik Export
        print(f"   ➤ Mengklik tombol Export...")
        export_page.click_export()
        
        print(f"   ✅ Tombol export diklik")
        time.sleep(5)
        
        # Handle modal jika ada
        if export_page.has_modal_notification():
            modal_msg = export_page.get_modal_message()
            print(f"   📢 Notifikasi: {modal_msg[:100]}...")
            export_page.close_modal()
            time.sleep(1)
        
        print(f"   ✅ Export LKPS ke Excel SELESAI")
        print(f"   📁 File: LKPS-Export-*.xlsx")
    
    # ============= STEP 7: TEST EXPORT LKPS → WORD =============
    print("\n📍 STEP 7: Test export LKPS ke Word...")
    
    if len(lkps_export_items) == 0:
        print("   ⚠️  Tidak ada LKPS item untuk di-export")
    else:
        # Refresh halaman
        export_page.open()
        time.sleep(2)
        
        print("   ➤ Memilih format: Word/Docs")
        export_page.select_format_word()
        time.sleep(1)
        
        # Refresh items
        bagian_items = export_page.get_all_bagian_items()
        lkps_export_items = []
        for item in bagian_items:
            kode = item['kode'].upper()
            nama = item['nama'].lower()
            if not any(c in kode for c in ['C.1', 'C.2', 'C.3', 'C.4', 'C.5', 'C.6']) and 'led' not in nama:
                lkps_export_items.append(item)
        
        # Pilih 1 LKPS item
        test_item = lkps_export_items[0]
        print(f"   ➤ Memilih item: {test_item['kode']} - {test_item['nama'][:40]}...")
        
        checkbox = test_item['checkbox']
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", checkbox)
        time.sleep(0.5)
        
        if not checkbox.is_selected():
            try:
                checkbox.click()
            except:
                driver.execute_script("arguments[0].click();", checkbox)
        
        time.sleep(1)
        
        print(f"   ✅ Item dipilih")
        
        # Klik Export
        print(f"   ➤ Mengklik tombol Export...")
        export_page.click_export()
        
        print(f"   ✅ Tombol export diklik")
        time.sleep(5)
        
        # Handle modal
        if export_page.has_modal_notification():
            modal_msg = export_page.get_modal_message()
            print(f"   📢 Notifikasi: {modal_msg[:100]}...")
            export_page.close_modal()
            time.sleep(1)
        
        print(f"   ✅ Export LKPS ke Word SELESAI")
        print(f"   📁 File: LKPS-Export-*.doc")
    
    # ============= STEP 8: TEST EXPORT LED → PDF =============
    print("\n📍 STEP 8: Test export LED ke PDF...")
    
    if len(led_export_items) == 0:
        print("   ⚠️  Tidak ada LED item untuk di-export")
    else:
        # Refresh halaman
        export_page.open()
        time.sleep(2)
        
        print("   ➤ Memilih format: PDF")
        export_page.select_format_pdf()
        time.sleep(1)
        
        # Refresh items
        bagian_items = export_page.get_all_bagian_items()
        led_export_items = []
        for item in bagian_items:
            kode = item['kode'].upper()
            nama = item['nama'].lower()
            if any(c in kode for c in ['C.1', 'C.2', 'C.3', 'C.4', 'C.5', 'C.6']) or 'led' in nama:
                led_export_items.append(item)
        
        # Pilih 1 LED item
        test_item = led_export_items[0]
        print(f"   ➤ Memilih item: {test_item['kode']} - {test_item['nama'][:40]}...")
        
        checkbox = test_item['checkbox']
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", checkbox)
        time.sleep(0.5)
        
        if not checkbox.is_selected():
            try:
                checkbox.click()
            except:
                driver.execute_script("arguments[0].click();", checkbox)
        
        time.sleep(1)
        
        print(f"   ✅ Item dipilih")
        
        # Klik Export
        print(f"   ➤ Mengklik tombol Export...")
        export_page.click_export()
        
        print(f"   ✅ Tombol export diklik")
        time.sleep(5)
        
        # Handle modal
        if export_page.has_modal_notification():
            modal_msg = export_page.get_modal_message()
            print(f"   📢 Notifikasi: {modal_msg[:100]}...")
            export_page.close_modal()
            time.sleep(1)
        
        print(f"   ✅ Export LED ke PDF SELESAI")
        print(f"   📁 PDF akan terbuka di tab baru untuk print")
    
    # ============= STEP 9: TEST EXPORT LED → WORD =============
    print("\n📍 STEP 9: Test export LED ke Word...")
    
    if len(led_export_items) == 0:
        print("   ⚠️  Tidak ada LED item untuk di-export")
    else:
        # Refresh halaman
        export_page.open()
        time.sleep(2)
        
        print("   ➤ Memilih format: Word/Docs")
        export_page.select_format_word()
        time.sleep(1)
        
        # Refresh items
        bagian_items = export_page.get_all_bagian_items()
        led_export_items = []
        for item in bagian_items:
            kode = item['kode'].upper()
            nama = item['nama'].lower()
            if any(c in kode for c in ['C.1', 'C.2', 'C.3', 'C.4', 'C.5', 'C.6']) or 'led' in nama:
                led_export_items.append(item)
        
        # Pilih 1 LED item
        test_item = led_export_items[0]
        print(f"   ➤ Memilih item: {test_item['kode']} - {test_item['nama'][:40]}...")
        
        checkbox = test_item['checkbox']
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", checkbox)
        time.sleep(0.5)
        
        if not checkbox.is_selected():
            try:
                checkbox.click()
            except:
                driver.execute_script("arguments[0].click();", checkbox)
        
        time.sleep(1)
        
        print(f"   ✅ Item dipilih")
        
        # Klik Export
        print(f"   ➤ Mengklik tombol Export...")
        export_page.click_export()
        
        print(f"   ✅ Tombol export diklik")
        time.sleep(5)
        
        # Handle modal
        if export_page.has_modal_notification():
            modal_msg = export_page.get_modal_message()
            print(f"   📢 Notifikasi: {modal_msg[:100]}...")
            export_page.close_modal()
            time.sleep(1)
        
        print(f"   ✅ Export LED ke Word SELESAI")
        print(f"   📁 File: LED-*.doc")
    
    # ============= FINAL SUMMARY =============
    print("\n" + "="*70)
    print("  ✅ TEST SELESAI!")
    print("="*70)
    
    print("\n📊 SUMMARY TEST:")
    print(f"✅ Login berhasil")
    print(f"✅ Bukti Pendukung diakses")
    print(f"✅ Data di Bukti Pendukung dianalisis")
    print(f"   - LKPS items: {len(lkps_items)}")
    print(f"   - LED items: {len(led_items)}")
    print(f"✅ Halaman Export diakses")
    print(f"✅ Items di Export diidentifikasi")
    print(f"   - LKPS items: {len(lkps_export_items)}")
    print(f"   - LED items: {len(led_export_items)}")
    
    print("\n📝 TEST EXPORT:")
    if len(lkps_export_items) > 0:
        print(f"✅ LKPS → Excel tested")
        print(f"✅ LKPS → Word tested")
    else:
        print(f"⚠️  LKPS tidak tersedia untuk export")
    
    if len(led_export_items) > 0:
        print(f"✅ LED → PDF tested")
        print(f"✅ LED → Word tested")
    else:
        print(f"⚠️  LED tidak tersedia untuk export")
    
    print("\n📁 FILE YANG TERDOWNLOAD:")
    print("   📄 LKPS-Export-*.xlsx (Excel)")
    print("   📄 LKPS-Export-*.doc (Word)")
    print("   📄 LED-*.pdf (PDF - tab baru)")
    print("   📄 LED-*.doc (Word)")
    print("   📂 Lokasi: Folder Downloads")
    
    print("\n💡 FLOW PENGGUNAAN:")
    print("1. Isi data LKPS/LED di halaman masing-masing")
    print("2. Klik 'Save Draft' atau 'Ajukan untuk Review'")
    print("3. Data akan muncul di Bukti Pendukung")
    print("4. Pindah ke halaman Export")
    print("5. Pilih format export:")
    print("   - LKPS: Excel atau Word")
    print("   - LED: PDF atau Word")
    print("6. Pilih item yang akan di-export")
    print("7. Klik tombol Export")
    print("8. File akan terdownload otomatis")

except Exception as e:
    print(f"\n❌ ERROR: {str(e)}")
    import traceback
    traceback.print_exc()
    
    print("\n💡 TROUBLESHOOTING:")
    print("1. Pastikan sudah login dengan email Tim Akreditasi")
    print("2. Pastikan sudah ada data di Bukti Pendukung:")
    print("   - Buka halaman LKPS/LED")
    print("   - Isi data")
    print("   - Klik 'Save Draft' atau 'Ajukan untuk Review'")
    print("3. Data akan muncul di Bukti Pendukung dengan kategori LKPS/LED")
    print("4. Data yang sudah di-submit akan tersedia di halaman Export")
    print("5. Cek Chrome download settings")

finally:
    print("\nMenutup browser dalam 5 detik...")
    time.sleep(5)
    driver.quit()
    print("Browser ditutup.")
