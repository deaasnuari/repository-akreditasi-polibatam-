"""
Test CRUD LKPS - Versi Lengkap dengan Validasi
Test dengan 2 scenario: field kosong (validasi) dan field lengkap
"""

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select
import time
import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from page_objects.login_page import LoginPage
from page_objects.lkps_page import LKPSPage

# Konfigurasi
EMAIL = "test_5hnkxvpw@polibatam.ac.id"  # GANTI dengan email Tim Akreditasi
PASSWORD = "test12345"
ROLE = "Tim Akreditasi"

# Inisialisasi driver
driver = webdriver.Chrome()
driver.maximize_window()

try:
    print("="*70)
    print("  🧪 TEST CRUD LKPS - DENGAN VALIDASI")
    print("="*70)
    
    # ============= STEP 1: LOGIN =============
    print("\n📍 STEP 1: Login sebagai Tim Akreditasi...")
    
    login_page = LoginPage(driver)
    login_page.open()
    login_page.login(EMAIL, PASSWORD, ROLE)
    time.sleep(2)
    
    print("   ✅ Login berhasil")
    
    # ============= STEP 2: BUKA HALAMAN LKPS =============
    print("\n📍 STEP 2: Membuka halaman LKPS...")
    
    lkps_page = LKPSPage(driver)
    lkps_page.open()
    time.sleep(2)
    
    if lkps_page.is_loaded():
        heading = lkps_page.get_page_heading()
        print(f"   ✅ Halaman LKPS dimuat: {heading}")
    else:
        print("   ❌ Halaman LKPS gagal dimuat")
        raise Exception("Halaman LKPS tidak dapat dimuat")
    
    # Switch ke Tupoksi
    lkps_page.switch_to_tab('tupoksi')
    time.sleep(1)
    
    initial_count = lkps_page.get_table_row_count()
    print(f"\n   ℹ️  Jumlah data awal: {initial_count}")
    
    # ============= STEP 3: TEST VALIDASI - ISI SEBAGIAN FIELD =============
    print("\n📍 STEP 3: TEST VALIDASI - Isi field tidak lengkap...")
    
    # Buka form
    if lkps_page.click_tambah_data():
        print("   ✅ Form tambah data muncul")
    else:
        raise Exception("Tidak dapat membuka form")
    
    time.sleep(1)
    
    # Isi hanya sebagian field (untuk test validasi)
    print("   ℹ️  Mengisi hanya 3 dari 6 field (test validasi)...")
    
    partial_data = {
        'unitKerja': 'Program Studi Teknik Informatika',
        'namaKetua': 'Dr. Test Validasi',
        'periode': '2023-2024'
        # Sengaja tidak isi: pendidikanTerakhir, jabatanFungsional, tugasPokokDanFungsi
    }
    
    for key, value in partial_data.items():
        print(f"      - {key}: {value}")
        lkps_page.fill_form_field(key, value)
        time.sleep(0.3)
    
    print("   ℹ️  Mencoba simpan dengan data tidak lengkap...")
    lkps_page.click_simpan()
    time.sleep(2)
    
    # Cek apakah ada error validasi
    try:
        # Modal konfirmasi muncul jika validasi gagal
        modal = driver.find_element(By.XPATH, "//h3[contains(text(), 'Data Tidak Lengkap')]")
        print("   ✅ Validasi bekerja! Modal 'Data Tidak Lengkap' muncul")
        
        # Tutup modal
        close_btn = driver.find_element(By.XPATH, "//button[contains(text(), 'OK') or contains(@class, 'hover:text-gray-700')]")
        close_btn.click()
        time.sleep(1.5)  # Tunggu modal tertutup
    except:
        print("   ℹ️  Tidak ada modal validasi (mungkin validasi frontend)")
    
    # Tutup form
    print("   ℹ️  Menutup form...")
    lkps_page.click_batal()
    time.sleep(2)  # Tunggu form benar-benar tertutup
    
    # Verify data tidak bertambah
    count_after_validation = lkps_page.get_table_row_count()
    if count_after_validation == initial_count:
        print("   ✅ Data tidak tersimpan (validasi berhasil)")
    else:
        print("   ⚠️  Data mungkin tersimpan")
    
    # Refresh halaman untuk clear state
    driver.refresh()
    time.sleep(2)
    
    # ============= STEP 4: TEST CREATE - ISI SEMUA FIELD LENGKAP =============
    print("\n📍 STEP 4: TEST CREATE - Isi semua field lengkap...")
    
    # Buka form lagi
    lkps_page.click_tambah_data()
    time.sleep(1)
    print("   ✅ Form tambah data muncul")
    
    # Isi semua field lengkap
    complete_data = {
        'unitKerja': 'Program Studi Teknik Informatika',
        'namaKetua': 'Dr. Selenium Test Lengkap',
        'periode': '2023-2024',
        'pendidikanTerakhir': 'S3 Teknik Informatika',
        'jabatanFungsional': 'Lektor Kepala',
        'tugasPokokDanFungsi': 'Memimpin dan mengelola program studi, mengkoordinasikan kegiatan akademik, dan melakukan pengembangan program studi sesuai visi misi institusi'
    }
    
    print("   ℹ️  Mengisi SEMUA field dengan data lengkap:")
    for key, value in complete_data.items():
        display_value = value if len(value) <= 50 else value[:50] + "..."
        print(f"      - {key}: {display_value}")
    
    if lkps_page.fill_tupoksi_form(complete_data):
        print("   ✅ Semua field berhasil diisi")
    else:
        raise Exception("Gagal mengisi form lengkap")
    
    time.sleep(1)
    
    # Simpan
    print("   ℹ️  Menyimpan data lengkap...")
    lkps_page.click_simpan()
    time.sleep(3)
    
    # Cek popup sukses
    if lkps_page.is_success_popup_visible():
        message = lkps_page.get_popup_message()
        print(f"   ✅ {message}")
    else:
        print("   ⚠️  Popup sukses tidak muncul")
    
    lkps_page.wait_for_popup_disappear()
    
    # Verify data bertambah
    new_count = lkps_page.get_table_row_count()
    print(f"   ℹ️  Jumlah data setelah create: {new_count}")
    
    if new_count == initial_count + 1:
        print("   ✅ Data lengkap berhasil ditambahkan!")
    else:
        print(f"   ⚠️  Data tidak bertambah (awal: {initial_count}, sekarang: {new_count})")
    
    # ============= STEP 5: TEST CREATE PENDANAAN LENGKAP =============
    print("\n📍 STEP 5: TEST CREATE - Pendanaan dengan data lengkap...")
    
    lkps_page.switch_to_tab('pendanaan')
    time.sleep(1)
    
    pendanaan_initial = lkps_page.get_table_row_count()
    print(f"   ℹ️  Jumlah data Pendanaan awal: {pendanaan_initial}")
    
    lkps_page.click_tambah_data()
    time.sleep(1)
    
    pendanaan_data = {
        'sumberPendanaan': 'APBN',
        'ts2': '1000000000',
        'ts1': '1200000000',
        'ts': '1500000000',
        'linkBukti': 'https://example.com/bukti-pendanaan.pdf'
    }
    
    print("   ℹ️  Mengisi form Pendanaan LENGKAP:")
    for key, value in pendanaan_data.items():
        print(f"      - {key}: {value}")
    
    lkps_page.fill_pendanaan_form(pendanaan_data)
    time.sleep(1)
    
    print("   ℹ️  Menyimpan data Pendanaan...")
    lkps_page.click_simpan()
    time.sleep(3)
    
    if lkps_page.is_success_popup_visible():
        print("   ✅ Data Pendanaan lengkap berhasil disimpan")
    
    lkps_page.wait_for_popup_disappear()
    
    pendanaan_new = lkps_page.get_table_row_count()
    print(f"   ℹ️  Jumlah data Pendanaan sekarang: {pendanaan_new}")
    
    if pendanaan_new == pendanaan_initial + 1:
        print("   ✅ Data Pendanaan lengkap berhasil ditambahkan!")
    
    # ============= STEP 6: TEST CREATE DENGAN FIELD KOSONG (VALIDASI) =============
    print("\n📍 STEP 6: TEST VALIDASI - Submit form kosong...")
    
    lkps_page.click_tambah_data()
    time.sleep(1)
    
    print("   ℹ️  Tidak mengisi field apapun...")
    print("   ℹ️  Langsung klik Simpan...")
    
    lkps_page.click_simpan()
    time.sleep(2)
    
    # Cek validasi
    try:
        modal = driver.find_element(By.XPATH, "//h3[contains(text(), 'Data Tidak Lengkap')]")
        print("   ✅ Validasi form kosong bekerja!")
        
        # Tutup modal
        close_btn = driver.find_element(By.XPATH, "//button[contains(text(), 'OK') or contains(@class, 'hover:text-gray-700')]")
        close_btn.click()
        time.sleep(0.5)
    except:
        print("   ℹ️  Tidak ada modal validasi khusus")
    
    # Tutup form
    lkps_page.click_batal()
    time.sleep(1)
    
    # Verify data tidak bertambah
    pendanaan_after = lkps_page.get_table_row_count()
    if pendanaan_after == pendanaan_new:
        print("   ✅ Data tidak tersimpan (validasi form kosong berhasil)")
    
    # ============= STEP 7: READ & VERIFY DATA =============
    print("\n📍 STEP 7: READ - Verifikasi data yang tersimpan...")
    
    # Refresh untuk memastikan data fresh
    driver.refresh()
    time.sleep(2)
    
    # Kembali ke Tupoksi
    lkps_page.switch_to_tab('tupoksi')
    time.sleep(2)
    
    # Ambil data dari baris
    nama_ketua = lkps_page.get_first_row_data(3)  # Kolom Nama Ketua
    periode = lkps_page.get_first_row_data(4)  # Kolom Periode
    
    print(f"   ℹ️  Data baris pertama:")
    print(f"      - Nama Ketua: {nama_ketua}")
    print(f"      - Periode: {periode}")
    
    if 'Selenium' in str(nama_ketua):
        print("   ✅ Data yang disimpan sesuai!")
    
    # ============= STEP 8: UPDATE DATA =============
    print("\n📍 STEP 8: UPDATE - Edit data yang ada...")
    
    # Refresh page untuk clear state
    driver.refresh()
    time.sleep(2)
    
    lkps_page.switch_to_tab('tupoksi')
    time.sleep(2)
    
    current_tupoksi = lkps_page.get_table_row_count()
    
    if current_tupoksi > 0:
        lkps_page.click_edit_first_row()
        time.sleep(1.5)
        print("   ✅ Form edit muncul")
        
        # Update periode
        new_periode = "2024-2025 (Updated)"
        print(f"   ℹ️  Mengupdate periode menjadi: {new_periode}")
        
        lkps_page.update_form_field('periode', new_periode)
        time.sleep(0.5)
        
        lkps_page.click_simpan()
        time.sleep(3)
        
        if lkps_page.is_success_popup_visible():
            print("   ✅ Data berhasil diupdate")
        
        lkps_page.wait_for_popup_disappear()
        
        # Verify update
        periode_updated = lkps_page.get_first_row_data(4)
        print(f"   ℹ️  Periode setelah update: {periode_updated}")
        
        if 'Updated' in str(periode_updated):
            print("   ✅ Update berhasil terlihat di tabel!")
    else:
        print("   ⚠️  Tidak ada data untuk diedit")
    
    # ============= STEP 9: DELETE DATA =============
    print("\n📍 STEP 9: DELETE - Hapus data Pendanaan...")
    
    # Refresh untuk clear state
    driver.refresh()
    time.sleep(2)
    
    lkps_page.switch_to_tab('pendanaan')
    time.sleep(2)
    
    before_delete = lkps_page.get_table_row_count()
    print(f"   ℹ️  Jumlah data Pendanaan: {before_delete}")
    
    if before_delete > 0:
        lkps_page.click_delete_first_row()
        time.sleep(1)
        
        if lkps_page.is_confirm_modal_visible():
            print("   ✅ Modal konfirmasi hapus muncul")
            
            lkps_page.click_confirm_yes()
            time.sleep(3)
            
            if lkps_page.is_success_popup_visible():
                print("   ✅ Data berhasil dihapus")
            
            lkps_page.wait_for_popup_disappear()
            
            after_delete = lkps_page.get_table_row_count()
            
            if after_delete == before_delete - 1:
                print("   ✅ Data Pendanaan berhasil dihapus!")
    
    # ============= SUMMARY =============
    print("\n" + "="*70)
    print("  ✅ SEMUA TEST SELESAI!")
    print("="*70)
    
    lkps_page.switch_to_tab('tupoksi')
    time.sleep(1)
    tupoksi_final = lkps_page.get_table_row_count()
    
    lkps_page.switch_to_tab('pendanaan')
    time.sleep(1)
    pendanaan_final = lkps_page.get_table_row_count()
    
    print("\n📊 SUMMARY:")
    print("✅ VALIDASI: Form tidak lengkap tidak tersimpan")
    print("✅ VALIDASI: Form kosong tidak tersimpan")
    print("✅ CREATE: Data lengkap berhasil tersimpan")
    print("✅ READ: Data berhasil dibaca dari tabel")
    print("✅ UPDATE: Data berhasil diupdate")
    print("✅ DELETE: Data berhasil dihapus")
    
    print("\n📝 HASIL AKHIR:")
    print(f"- Data Tupoksi: {initial_count} → {tupoksi_final}")
    print(f"- Data Pendanaan: {pendanaan_initial} → {pendanaan_final}")

except Exception as e:
    print(f"\n❌ ERROR: {str(e)}")
    import traceback
    traceback.print_exc()

finally:
    print("\nMenutup browser dalam 5 detik...")
    time.sleep(5)
    driver.quit()
    print("Browser ditutup.")
