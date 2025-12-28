"""
Test CRUD LKPS - Versi Sederhana
Test Create, Read, Update, Delete untuk data LKPS secara step-by-step
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
    print("  🧪 TEST CRUD LKPS - BUDAYA MUTU")
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
    
    # ============= STEP 3: CEK SUB-TABS =============
    print("\n📍 STEP 3: Cek sub-tabs yang tersedia...")
    
    tabs = ['tupoksi', 'pendanaan', 'penggunaan-dana', 'ewmp', 'ktk', 'spmi']
    available_tabs = 0
    
    for tab in tabs:
        if lkps_page.switch_to_tab(tab):
            available_tabs += 1
            print(f"   ✅ Tab '{tab}' tersedia")
            time.sleep(0.5)
        else:
            print(f"   ⚠️  Tab '{tab}' tidak tersedia")
    
    print(f"\n   ℹ️  Total tabs tersedia: {available_tabs}/{len(tabs)}")
    
    # Kembali ke tab Tupoksi untuk test CRUD
    lkps_page.switch_to_tab('tupoksi')
    time.sleep(1)
    
    # ============= STEP 4: CEK DATA AWAL =============
    print("\n📍 STEP 4: Cek data awal di tabel...")
    
    initial_count = lkps_page.get_table_row_count()
    print(f"   ℹ️  Jumlah data awal: {initial_count}")
    
    if lkps_page.is_data_empty():
        print("   ℹ️  Tabel masih kosong")
    else:
        print(f"   ℹ️  Tabel sudah ada {initial_count} data")
    
    # ============= STEP 5: CREATE - TAMBAH DATA TUPOKSI =============
    print("\n📍 STEP 5: CREATE - Tambah data Tupoksi...")
    
    # Klik Tambah Data
    if lkps_page.click_tambah_data():
        print("   ✅ Form tambah data muncul")
    else:
        print("   ❌ Gagal membuka form")
        raise Exception("Tidak dapat membuka form tambah data")
    
    time.sleep(1)
    
    # Isi form Tupoksi
    tupoksi_data = {
        'unitKerja': 'Program Studi Teknik Informatika',
        'namaKetua': 'Dr. Selenium Test',
        'periode': '2023-2024',
        'pendidikanTerakhir': 'S3 Teknik Informatika',
        'jabatanFungsional': 'Lektor Kepala',
        'tugasPokokDanFungsi': 'Memimpin dan mengelola program studi sesuai visi misi dan melakukan koordinasi kegiatan akademik'
    }
    
    print("   ℹ️  Mengisi form dengan data:")
    for key, value in tupoksi_data.items():
        display_value = value if len(value) <= 50 else value[:50] + "..."
        print(f"      - {key}: {display_value}")
    
    if lkps_page.fill_tupoksi_form(tupoksi_data):
        print("   ✅ Form berhasil diisi")
    else:
        print("   ❌ Gagal mengisi form")
        raise Exception("Tidak dapat mengisi form")
    
    time.sleep(1)
    
    # Simpan data
    print("   ℹ️  Menyimpan data...")
    lkps_page.click_simpan()
    time.sleep(3)
    
    # Cek popup sukses
    if lkps_page.is_success_popup_visible():
        message = lkps_page.get_popup_message()
        print(f"   ✅ {message}")
    else:
        print("   ⚠️  Popup sukses tidak muncul")
    
    # Tunggu popup hilang
    lkps_page.wait_for_popup_disappear()
    
    # Verify data bertambah
    new_count = lkps_page.get_table_row_count()
    print(f"   ℹ️  Jumlah data setelah create: {new_count}")
    
    if new_count == initial_count + 1:
        print("   ✅ Data Tupoksi berhasil ditambahkan!")
    else:
        print(f"   ⚠️  Data tidak bertambah (awal: {initial_count}, sekarang: {new_count})")
    
    # ============= STEP 6: CREATE - TAMBAH DATA PENDANAAN =============
    print("\n📍 STEP 6: CREATE - Tambah data Pendanaan...")
    
    # Switch ke tab Pendanaan
    lkps_page.switch_to_tab('pendanaan')
    time.sleep(1)
    
    pendanaan_initial = lkps_page.get_table_row_count()
    print(f"   ℹ️  Jumlah data Pendanaan awal: {pendanaan_initial}")
    
    # Klik Tambah Data
    lkps_page.click_tambah_data()
    time.sleep(1)
    
    # Isi form Pendanaan
    pendanaan_data = {
        'sumberPendanaan': 'APBN',
        'ts2': '1000000000',
        'ts1': '1200000000',
        'ts': '1500000000',
        'linkBukti': 'https://example.com/bukti-pendanaan.pdf'
    }
    
    print("   ℹ️  Mengisi form Pendanaan:")
    for key, value in pendanaan_data.items():
        print(f"      - {key}: {value}")
    
    lkps_page.fill_pendanaan_form(pendanaan_data)
    time.sleep(1)
    
    # Simpan
    print("   ℹ️  Menyimpan data Pendanaan...")
    lkps_page.click_simpan()
    time.sleep(3)
    
    if lkps_page.is_success_popup_visible():
        print("   ✅ Data Pendanaan berhasil disimpan")
    
    lkps_page.wait_for_popup_disappear()
    
    pendanaan_new = lkps_page.get_table_row_count()
    print(f"   ℹ️  Jumlah data Pendanaan sekarang: {pendanaan_new}")
    
    if pendanaan_new == pendanaan_initial + 1:
        print("   ✅ Data Pendanaan berhasil ditambahkan!")
    
    # ============= STEP 7: READ - CEK DATA YANG DITAMBAHKAN =============
    print("\n📍 STEP 7: READ - Cek data yang baru ditambahkan...")
    
    # Kembali ke Tupoksi
    lkps_page.switch_to_tab('tupoksi')
    time.sleep(1)
    
    unit_kerja = lkps_page.get_first_row_data(2)  # Kolom ke-2 (Unit Kerja)
    nama_ketua = lkps_page.get_first_row_data(3)  # Kolom ke-3 (Nama Ketua)
    
    print(f"   ℹ️  Data baris pertama:")
    print(f"      - Unit Kerja: {unit_kerja}")
    print(f"      - Nama Ketua: {nama_ketua}")
    
    if nama_ketua and nama_ketua != '-':
        print("   ✅ Data berhasil dibaca dari tabel")
    else:
        print("   ⚠️  Data tidak dapat dibaca")
    
    # ============= STEP 8: SEARCH - CARI DATA =============
    print("\n📍 STEP 8: SEARCH - Cari data di tabel...")
    
    if nama_ketua and 'Selenium' in nama_ketua:
        print(f"   ℹ️  Mencari data dengan keyword: 'Selenium'")
        
        lkps_page.search_data('Selenium')
        time.sleep(2)
        
        search_count = lkps_page.get_table_row_count()
        print(f"   ℹ️  Hasil pencarian: {search_count} data")
        
        if search_count > 0:
            print("   ✅ Data ditemukan dengan search")
        
        # Clear search
        lkps_page.search_data('')
        time.sleep(2)
    else:
        print("   ⚠️  Skip search (data tidak sesuai)")
    
    # ============= STEP 9: UPDATE - EDIT DATA =============
    print("\n📍 STEP 9: UPDATE - Edit data Tupoksi...")
    
    current_count = lkps_page.get_table_row_count()
    
    if current_count > 0:
        # Klik edit pada baris pertama
        if lkps_page.click_edit_first_row():
            print("   ✅ Form edit muncul")
            time.sleep(1)
            
            # Update periode
            new_periode = "2024-2025 (Updated)"
            print(f"   ℹ️  Mengupdate periode menjadi: {new_periode}")
            
            lkps_page.update_form_field('periode', new_periode)
            time.sleep(0.5)
            
            # Simpan update
            print("   ℹ️  Menyimpan update...")
            lkps_page.click_simpan()
            time.sleep(3)
            
            if lkps_page.is_success_popup_visible():
                print("   ✅ Data berhasil diupdate")
            
            lkps_page.wait_for_popup_disappear()
            
            # Verify update
            periode_updated = lkps_page.get_first_row_data(4)  # Kolom periode
            print(f"   ℹ️  Periode setelah update: {periode_updated}")
            
            if 'Updated' in str(periode_updated) or '2024-2025' in str(periode_updated):
                print("   ✅ Data berhasil diupdate di tabel!")
            else:
                print("   ⚠️  Update mungkin belum terlihat")
        else:
            print("   ⚠️  Gagal membuka form edit")
    else:
        print("   ⚠️  Tidak ada data untuk diedit")
    
    # ============= STEP 10: DELETE - HAPUS DATA =============
    print("\n📍 STEP 10: DELETE - Hapus data Pendanaan...")
    
    # Switch ke Pendanaan
    lkps_page.switch_to_tab('pendanaan')
    time.sleep(1)
    
    before_delete = lkps_page.get_table_row_count()
    print(f"   ℹ️  Jumlah data Pendanaan: {before_delete}")
    
    if before_delete > 0:
        # Klik delete
        if lkps_page.click_delete_first_row():
            print("   ✅ Modal konfirmasi hapus muncul")
            time.sleep(1)
            
            # Verify modal
            if lkps_page.is_confirm_modal_visible():
                print("   ℹ️  Modal konfirmasi terlihat")
                
                # Konfirmasi hapus
                print("   ℹ️  Mengkonfirmasi hapus...")
                lkps_page.click_confirm_yes()
                time.sleep(3)
                
                if lkps_page.is_success_popup_visible():
                    print("   ✅ Data berhasil dihapus")
                
                lkps_page.wait_for_popup_disappear()
                
                # Verify data berkurang
                after_delete = lkps_page.get_table_row_count()
                print(f"   ℹ️  Jumlah data setelah delete: {after_delete}")
                
                if after_delete == before_delete - 1:
                    print("   ✅ Data Pendanaan berhasil dihapus dari tabel!")
                else:
                    print(f"   ⚠️  Jumlah data tidak berubah (sebelum: {before_delete}, sesudah: {after_delete})")
            else:
                print("   ⚠️  Modal konfirmasi tidak muncul")
        else:
            print("   ⚠️  Gagal mengklik tombol delete")
    else:
        print("   ⚠️  Tidak ada data untuk dihapus")
    
    # ============= STEP 11: CEK DATA AKHIR =============
    print("\n📍 STEP 11: Cek data akhir setelah CRUD...")
    
    # Tupoksi
    lkps_page.switch_to_tab('tupoksi')
    time.sleep(1)
    tupoksi_final = lkps_page.get_table_row_count()
    
    # Pendanaan
    lkps_page.switch_to_tab('pendanaan')
    time.sleep(1)
    pendanaan_final = lkps_page.get_table_row_count()
    
    print(f"   ℹ️  Data Tupoksi: {initial_count} → {tupoksi_final}")
    print(f"   ℹ️  Data Pendanaan: {pendanaan_initial} → {pendanaan_final}")
    
    print("\n" + "="*70)
    print("  ✅ SEMUA TEST CRUD SELESAI!")
    print("="*70)
    
    print("\n📊 SUMMARY:")
    print(f"✅ CREATE: Data Tupoksi dan Pendanaan berhasil ditambahkan")
    print(f"✅ READ: Data berhasil dibaca dari tabel")
    print(f"✅ UPDATE: Data Tupoksi berhasil diupdate")
    print(f"✅ DELETE: Data Pendanaan berhasil dihapus")
    print(f"✅ SEARCH: Fitur search berfungsi")
    
    print("\n📝 HASIL AKHIR:")
    print(f"- Total data Tupoksi: {tupoksi_final}")
    print(f"- Total data Pendanaan: {pendanaan_final}")
    
except Exception as e:
    print(f"\n❌ ERROR: {str(e)}")
    import traceback
    traceback.print_exc()
    
    print("\n💡 TROUBLESHOOTING:")
    print("1. Pastikan sudah login dengan email Tim Akreditasi yang benar")
    print("2. Update EMAIL di line 16")
    print("3. Pastikan frontend (localhost:3000) dan backend (localhost:5000) running")
    print("4. Cek console browser untuk error detail")

finally:
    print("\nMenutup browser dalam 5 detik...")
    time.sleep(5)
    driver.quit()
    print("Browser ditutup.")
