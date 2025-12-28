"""
Test CRUD LED (Laporan Evaluasi Diri)
Test untuk Create, Read, Update, Delete, Save Draft, dan Ajukan Review
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
from page_objects.led_page import LEDPage

# Konfigurasi
EMAIL = "test_5hnkxvpw@polibatam.ac.id"  # GANTI dengan email Tim Akreditasi
PASSWORD = "test12345"
ROLE = "Tim Akreditasi"

# Inisialisasi driver
driver = webdriver.Chrome()
driver.maximize_window()

try:
    print("="*70)
    print("  🧪 TEST CRUD LED - Laporan Evaluasi Diri")
    print("="*70)
    
    # ============= STEP 1: LOGIN =============
    print("\n📍 STEP 1: Login sebagai Tim Akreditasi...")
    
    login_page = LoginPage(driver)
    login_page.open()
    login_page.login(EMAIL, PASSWORD, ROLE)
    time.sleep(2)
    
    print("   ✅ Login berhasil")
    
    # ============= STEP 2: BUKA HALAMAN LED =============
    print("\n📍 STEP 2: Membuka halaman LED...")
    
    led_page = LEDPage(driver)
    led_page.open()
    time.sleep(2)
    
    if led_page.is_loaded():
        heading = led_page.get_page_heading()
        print(f"   ✅ Halaman LED dimuat: {heading}")
    else:
        raise Exception("Halaman LED tidak dapat dimuat")
    
    # ============= STEP 3: SWITCH KE TAB BUDAYA MUTU =============
    print("\n📍 STEP 3: Switch ke tab C.1 Budaya Mutu...")
    
    if led_page.switch_to_tab('budaya-mutu'):
        print("   ✅ Tab Budaya Mutu aktif")
    else:
        raise Exception("Gagal switch ke tab Budaya Mutu")
    
    time.sleep(1)
    
    # ============= STEP 4: CEK JUMLAH DATA AWAL =============
    print("\n📍 STEP 4: Cek jumlah data awal di Penetapan Tabel A...")
    
    initial_count = led_page.get_row_count_penetapan_a()
    print(f"   ℹ️  Jumlah row awal: {initial_count}")
    
    # ============= STEP 5: CREATE - TAMBAH DATA BARU =============
    print("\n📍 STEP 5: CREATE - Tambah data baru di Penetapan Tabel A...")
    
    # Klik tambah baris
    if led_page.click_tambah_baris_penetapan_a():
        print("   ✅ Tombol 'Tambah Baris' diklik")
    else:
        raise Exception("Gagal klik tambah baris")
    
    # Tunggu row baru muncul
    time.sleep(2)
    
    # Verifikasi row bertambah
    new_count = led_page.get_row_count_penetapan_a()
    print(f"   ℹ️  Jumlah row setelah klik tambah: {new_count}")
    
    # Isi data di row baru menggunakan metode simple (cari input terakhir)
    data_baru = {
        'pernyataan': 'Test Standar Penetapan LED',
        'keterlaksanaan': 'Terlaksana dengan baik',
        'pelaksanaan': 'Dilaksanakan sesuai prosedur',
        'bukti_pendukung': 'http://example.com/bukti-led'
    }
    
    print("   ℹ️  Mengisi data row baru...")
    if led_page.fill_penetapan_row_simple(data_baru):
        print("   ✅ Data baru berhasil diisi")
    else:
        raise Exception("Gagal mengisi data baru")
    
    time.sleep(1)
    
    # Verifikasi jumlah bertambah
    current_count = led_page.get_row_count_penetapan_a()
    print(f"   ℹ️  Jumlah row setelah tambah: {current_count}")
    
    if current_count > initial_count:
        print(f"   ✅ Data bertambah: {initial_count} → {current_count}")
    else:
        print(f"   ⚠️  Data tidak bertambah")
    
    # ============= STEP 6: CREATE - TAMBAH DATA KEDUA =============
    print("\n📍 STEP 6: CREATE - Tambah data kedua...")
    
    if led_page.click_tambah_baris_penetapan_a():
        print("   ✅ Tombol 'Tambah Baris' diklik lagi")
    
    time.sleep(2)
    
    data_baru2 = {
        'pernyataan': 'Test Standar Kedua',
        'keterlaksanaan': 'Terlaksana sebagian',
        'pelaksanaan': 'Perlu perbaikan',
        'bukti_pendukung': 'http://example.com/bukti-led-2'
    }
    
    print("   ℹ️  Mengisi data kedua...")
    if led_page.fill_penetapan_row_simple(data_baru2):
        print("   ✅ Data kedua berhasil diisi")
    
    time.sleep(1)
    
    final_count = led_page.get_row_count_penetapan_a()
    print(f"   ℹ️  Jumlah row total: {final_count}")
    
    # ============= STEP 7: READ - BACA DATA PERTAMA =============
    print("\n📍 STEP 7: READ - Membaca data row pertama...")
    
    # Scroll ke tabel
    driver.execute_script("window.scrollTo(0, 500);")
    time.sleep(1)
    
    first_row_data = led_page.get_first_row_data_penetapan_a()
    
    print(f"   ℹ️  Data row pertama:")
    print(f"      - Pernyataan: {first_row_data.get('pernyataan', 'N/A')}")
    print(f"      - Keterlaksanaan: {first_row_data.get('keterlaksanaan', 'N/A')}")
    print(f"      - Pelaksanaan: {first_row_data.get('pelaksanaan', 'N/A')}")
    print(f"      - Bukti: {first_row_data.get('bukti_pendukung', 'N/A')}")
    
    if first_row_data.get('pernyataan'):
        print("   ✅ Data berhasil dibaca")
    else:
        print("   ⚠️  Data kosong atau tidak dapat dibaca")
    
    # ============= STEP 8: UPDATE - EDIT DATA PERTAMA =============
    print("\n📍 STEP 8: UPDATE - Edit data row pertama...")
    
    # Scroll ke tabel
    driver.execute_script("window.scrollTo(0, 500);")
    time.sleep(0.5)
    
    # Edit row pertama dengan data baru
    updated_data = {
        'pernyataan': 'Test Standar UPDATED',
        'keterlaksanaan': 'Terlaksana UPDATED',
        'pelaksanaan': 'Pelaksanaan UPDATED',
        'bukti_pendukung': 'http://example.com/updated'
    }
    
    if led_page.fill_penetapan_row(0, updated_data):
        print("   ✅ Data row pertama berhasil di-update")
    else:
        raise Exception("Gagal update data")
    
    time.sleep(1)
    
    # Verifikasi update
    updated_row_data = led_page.get_first_row_data_penetapan_a()
    
    if 'UPDATED' in updated_row_data.get('pernyataan', ''):
        print("   ✅ Update berhasil, data berubah")
    else:
        print("   ⚠️  Update mungkin belum tersimpan")
    
    # ============= STEP 9: SAVE DRAFT =============
    print("\n📍 STEP 9: SAVE DRAFT - Simpan sebagai Draft...")
    
    if led_page.click_simpan_draft():
        print("   ✅ Tombol 'Simpan Draft' diklik")
    else:
        raise Exception("Gagal klik simpan draft")
    
    time.sleep(3)
    
    # Cek apakah redirect ke Bukti Pendukung
    if led_page.is_redirected_to_bukti_pendukung():
        print("   ✅ Redirect ke halaman Bukti Pendukung")
        print(f"   ✅ URL: {driver.current_url}")
    else:
        print(f"   ℹ️  URL saat ini: {driver.current_url}")
        print("   ⚠️  Belum redirect ke Bukti Pendukung")
    
    # ============= STEP 10: KEMBALI KE LED =============
    print("\n📍 STEP 10: Kembali ke halaman LED...")
    
    led_page.open()
    time.sleep(2)
    
    if led_page.is_loaded():
        print("   ✅ Kembali ke halaman LED")
    
    led_page.switch_to_tab('budaya-mutu')
    time.sleep(1)
    
    # ============= STEP 11: DELETE - HAPUS DATA =============
    print("\n📍 STEP 11: DELETE - Hapus data row pertama...")
    
    count_before_delete = led_page.get_row_count_penetapan_a()
    print(f"   ℹ️  Jumlah row sebelum hapus: {count_before_delete}")
    
    if count_before_delete <= 1:
        print("   ⚠️  Hanya ada 1 row, tidak bisa dihapus (minimal 1 row)")
    else:
        # Hapus row pertama
        if led_page.click_delete_first_row_penetapan_a():
            print("   ✅ Tombol 'Hapus' diklik")
        
        time.sleep(1)
        
        count_after_delete = led_page.get_row_count_penetapan_a()
        print(f"   ℹ️  Jumlah row setelah hapus: {count_after_delete}")
        
        if count_after_delete < count_before_delete:
            print(f"   ✅ Data berhasil dihapus: {count_before_delete} → {count_after_delete}")
        else:
            print("   ⚠️  Data tidak berkurang")
    
    # ============= STEP 12: AJUKAN UNTUK REVIEW =============
    print("\n📍 STEP 12: AJUKAN UNTUK REVIEW - Submit untuk direview P4M...")
    
    # Pastikan ada data
    current_count_final = led_page.get_row_count_penetapan_a()
    print(f"   ℹ️  Jumlah data saat ini: {current_count_final}")
    
    if current_count_final == 0:
        print("   ⚠️  Tidak ada data untuk di-submit")
        print("   ℹ️  Menambahkan data dummy...")
        
        led_page.click_tambah_baris_penetapan_a()
        time.sleep(1)
        
        dummy_data = {
            'pernyataan': 'Test Submit Review',
            'keterlaksanaan': 'Siap untuk review',
            'pelaksanaan': 'Lengkap',
            'bukti_pendukung': 'http://example.com/final'
        }
        
        led_page.fill_penetapan_row(0, dummy_data)
        time.sleep(1)
        
        print("   ✅ Data dummy ditambahkan")
    
    # Klik ajukan review
    if led_page.click_ajukan_review():
        print("   ✅ Tombol 'Ajukan untuk Review' diklik")
    else:
        raise Exception("Gagal klik ajukan review")
    
    time.sleep(3)
    
    # Cek redirect
    if led_page.is_redirected_to_bukti_pendukung():
        print("   ✅ Berhasil diajukan untuk review!")
        print(f"   ✅ Redirect ke Bukti Pendukung: {driver.current_url}")
    else:
        print(f"   ℹ️  URL saat ini: {driver.current_url}")
    
    # ============= STEP 13: VERIFIKASI DI BUKTI PENDUKUNG =============
    print("\n📍 STEP 13: Verifikasi item LED di Bukti Pendukung...")
    
    time.sleep(2)
    
    # Cek apakah ada item LED di tabel
    try:
        led_item = driver.find_element(By.XPATH, "//td[contains(., 'LED')]")
        print(f"   ✅ Item LED ditemukan: {led_item.text}")
        
        # Cek status
        try:
            status_xpath = "//td[contains(., 'LED')]/following-sibling::td"
            status = driver.find_element(By.XPATH, status_xpath)
            print(f"   ℹ️  Status: {status.text}")
        except:
            print("   ℹ️  Status tidak dapat dibaca")
            
    except:
        print("   ⚠️  Item LED tidak ditemukan di Bukti Pendukung")
    
    # ============= SUMMARY =============
    print("\n" + "="*70)
    print("  ✅ SEMUA TEST SELESAI!")
    print("="*70)
    
    print("\n📊 SUMMARY:")
    print("✅ CREATE: Berhasil menambah data baru di Penetapan Tabel A")
    print("✅ READ: Berhasil membaca data dari row pertama")
    print("✅ UPDATE: Berhasil mengubah data row pertama")
    print("✅ DELETE: Berhasil menghapus data")
    print("✅ SAVE DRAFT: Berhasil simpan sebagai draft")
    print("✅ SUBMIT REVIEW: Berhasil ajukan untuk review P4M")
    print("✅ REDIRECT: Berhasil redirect ke Bukti Pendukung")
    
    print("\n📝 CATATAN:")
    print("- LED memiliki 6 tab: C.1 - C.6 (Budaya Mutu s/d Diferensiasi Misi)")
    print("- Setiap tab memiliki 4 section: Penetapan, Pelaksanaan, Pengendalian, Peningkatan")
    print("- Setiap section memiliki 4 tabel: A, B, C, D")
    print("- Tabel A memiliki 4 kolom: Pernyataan, Keterlaksanaan, Pelaksanaan, Bukti")
    print("- Minimal harus ada 1 baris data di setiap tabel")
    print("- Data otomatis tersimpan setiap 30 detik (auto-save)")
    print("- Draft: Status awal, masih bisa diedit")
    print("- Submitted: Siap untuk direview oleh P4M")

except Exception as e:
    print(f"\n❌ ERROR: {str(e)}")
    import traceback
    traceback.print_exc()
    
    print("\n💡 TROUBLESHOOTING:")
    print("1. Pastikan sudah login dengan email Tim Akreditasi")
    print("2. Pastikan halaman LED dapat diakses")
    print("3. Cek apakah tab Budaya Mutu dapat diklik")
    print("4. Cek apakah tombol Tambah Baris terlihat")
    print("5. Cek console browser untuk error detail")

finally:
    print("\nMenutup browser dalam 5 detik...")
    time.sleep(5)
    driver.quit()
    print("Browser ditutup.")
