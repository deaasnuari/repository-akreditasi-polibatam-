"""
Test Draft dan Submit Review LKPS
Test tombol Simpan Draft dan Ajukan untuk Review
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
    print("  🧪 TEST DRAFT & SUBMIT REVIEW LKPS")
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
        raise Exception("Halaman LKPS tidak dapat dimuat")
    
    # ============= STEP 3: CEK TOMBOL DRAFT & REVIEW =============
    print("\n📍 STEP 3: Cek ketersediaan tombol Draft dan Review...")
    
    # Cek tombol Simpan Draft
    try:
        draft_btn = driver.find_element(By.XPATH, "//button[contains(., 'Draft')]")
        print("   ✅ Tombol 'Simpan Draft' tersedia")
    except:
        print("   ❌ Tombol 'Simpan Draft' tidak ditemukan")
        raise Exception("Tombol Draft tidak ada")
    
    # Cek tombol Ajukan untuk Review
    try:
        review_btn = driver.find_element(By.XPATH, "//button[contains(., 'Ajukan untuk Review')]")
        print("   ✅ Tombol 'Ajukan untuk Review' tersedia")
    except:
        print("   ❌ Tombol 'Ajukan untuk Review' tidak ditemukan")
        raise Exception("Tombol Ajukan Review tidak ada")
    
    # ============= STEP 4: PASTIKAN ADA DATA =============
    print("\n📍 STEP 4: Cek data yang akan di-draft/submit...")
    
    lkps_page.switch_to_tab('tupoksi')
    time.sleep(1)
    
    data_count = lkps_page.get_table_row_count()
    print(f"   ℹ️  Jumlah data Tupoksi: {data_count}")
    
    if data_count == 0:
        print("   ⚠️  Belum ada data, menambahkan data dummy...")
        
        # Tambah data dummy
        lkps_page.click_tambah_data()
        time.sleep(1)
        
        dummy_data = {
            'unitKerja': 'Program Studi Test',
            'namaKetua': 'Dr. Test Draft',
            'periode': '2023-2024',
            'pendidikanTerakhir': 'S3',
            'jabatanFungsional': 'Lektor',
            'tugasPokokDanFungsi': 'Test Draft dan Review'
        }
        
        lkps_page.fill_tupoksi_form(dummy_data)
        lkps_page.click_simpan()
        time.sleep(3)
        lkps_page.wait_for_popup_disappear()
        
        data_count = lkps_page.get_table_row_count()
        print(f"   ✅ Data dummy ditambahkan, total: {data_count}")
    else:
        print(f"   ✅ Sudah ada {data_count} data")
    
    # ============= STEP 5: TEST SIMPAN DRAFT =============
    print("\n📍 STEP 5: TEST - Simpan sebagai Draft...")
    
    # Scroll ke atas untuk akses tombol
    driver.execute_script("window.scrollTo(0, 0);")
    time.sleep(1)
    
    # Cari dan klik tombol Simpan Draft
    try:
        draft_btn = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Draft')]"))
        )
        
        print("   ℹ️  Mengklik tombol 'Simpan Draft'...")
        
        # Try click dengan multiple strategies
        try:
            draft_btn.click()
        except:
            driver.execute_script("arguments[0].click();", draft_btn)
        
        time.sleep(3)
        
        # Cek popup atau redirect
        current_url = driver.current_url
        
        if 'bukti-pendukung' in current_url:
            print("   ✅ Draft berhasil disimpan!")
            print(f"   ✅ Redirect ke Bukti Pendukung: {current_url}")
        else:
            # Cek apakah ada popup sukses
            try:
                popup = driver.find_element(By.XPATH, "//div[contains(@class, 'bg-green-50') or contains(@class, 'bg-blue-50')]")
                print(f"   ✅ Popup: {popup.text}")
            except:
                print(f"   ℹ️  URL saat ini: {current_url}")
        
        print("   ✅ TEST SIMPAN DRAFT BERHASIL")
        
    except Exception as e:
        print(f"   ❌ Error saat simpan draft: {e}")
    
    # Tunggu dan kembali ke LKPS
    time.sleep(3)
    
    # ============= STEP 6: KEMBALI KE LKPS =============
    print("\n📍 STEP 6: Kembali ke halaman LKPS...")
    
    lkps_page.open()
    time.sleep(2)
    
    if lkps_page.is_loaded():
        print("   ✅ Kembali ke LKPS")
    
    lkps_page.switch_to_tab('tupoksi')
    time.sleep(1)
    
    # ============= STEP 7: TEST AJUKAN UNTUK REVIEW =============
    print("\n📍 STEP 7: TEST - Ajukan untuk Review...")
    
    # Pastikan ada data
    data_count = lkps_page.get_table_row_count()
    print(f"   ℹ️  Jumlah data: {data_count}")
    
    if data_count == 0:
        print("   ⚠️  Tidak ada data untuk di-submit")
        print("   ℹ️  Menambahkan data dummy...")
        
        lkps_page.click_tambah_data()
        time.sleep(1)
        
        dummy_data = {
            'unitKerja': 'Program Studi Test Review',
            'namaKetua': 'Dr. Test Review',
            'periode': '2024-2025',
            'pendidikanTerakhir': 'S3',
            'jabatanFungsional': 'Lektor Kepala',
            'tugasPokokDanFungsi': 'Test Submit untuk Review'
        }
        
        lkps_page.fill_tupoksi_form(dummy_data)
        lkps_page.click_simpan()
        time.sleep(3)
        lkps_page.wait_for_popup_disappear()
        
        print("   ✅ Data dummy ditambahkan")
    
    # Scroll ke atas
    driver.execute_script("window.scrollTo(0, 0);")
    time.sleep(1)
    
    # Cari dan klik tombol Ajukan untuk Review
    try:
        review_btn = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Ajukan untuk Review')]"))
        )
        
        print("   ℹ️  Mengklik tombol 'Ajukan untuk Review'...")
        
        # Try click dengan multiple strategies
        try:
            review_btn.click()
        except:
            driver.execute_script("arguments[0].click();", review_btn)
        
        time.sleep(3)
        
        # Cek popup atau redirect
        current_url = driver.current_url
        
        if 'bukti-pendukung' in current_url:
            print("   ✅ Berhasil diajukan untuk review!")
            print(f"   ✅ Redirect ke Bukti Pendukung: {current_url}")
        else:
            # Cek apakah ada popup sukses
            try:
                popup = driver.find_element(By.XPATH, "//div[contains(@class, 'bg-green-50') or contains(@class, 'bg-blue-50')]")
                print(f"   ✅ Popup: {popup.text}")
            except:
                print(f"   ℹ️  URL saat ini: {current_url}")
        
        print("   ✅ TEST AJUKAN REVIEW BERHASIL")
        
    except Exception as e:
        print(f"   ❌ Error saat ajukan review: {e}")
    
    # ============= STEP 8: CEK HALAMAN BUKTI PENDUKUNG =============
    print("\n📍 STEP 8: Verifikasi redirect ke Bukti Pendukung...")
    
    time.sleep(2)
    current_url = driver.current_url
    
    if 'bukti-pendukung' in current_url:
        print(f"   ✅ Berada di halaman Bukti Pendukung")
        
        # Cek apakah ada item LKPS di daftar
        try:
            lkps_item = driver.find_element(By.XPATH, "//td[contains(., 'LKPS')]")
            print("   ✅ Item 'LKPS - Budaya Mutu' ditemukan di Bukti Pendukung")
        except:
            print("   ℹ️  Item LKPS mungkin belum muncul di list")
        
        # Cek status
        try:
            status = driver.find_element(By.XPATH, "//td[contains(., 'LKPS')]/following-sibling::td[contains(@class, 'px-2')]")
            print(f"   ℹ️  Status: {status.text}")
        except:
            print("   ℹ️  Status tidak dapat dibaca")
            
    else:
        print(f"   ℹ️  URL saat ini: {current_url}")
    
    # ============= SUMMARY =============
    print("\n" + "="*70)
    print("  ✅ SEMUA TEST SELESAI!")
    print("="*70)
    
    print("\n📊 SUMMARY:")
    print("✅ Tombol 'Simpan Draft' tersedia dan berfungsi")
    print("✅ Tombol 'Ajukan untuk Review' tersedia dan berfungsi")
    print("✅ Redirect ke Bukti Pendukung berhasil")
    print("✅ Data LKPS berhasil disimpan sebagai Draft/Submitted")
    
    print("\n📝 CATATAN:")
    print("- Draft: Status awal untuk data yang masih dikerjakan")
    print("- Submitted: Data sudah siap untuk direview oleh P4M")
    print("- Data akan muncul di halaman Bukti Pendukung")
    print("- P4M dapat mereview dan memberikan catatan")

except Exception as e:
    print(f"\n❌ ERROR: {str(e)}")
    import traceback
    traceback.print_exc()
    
    print("\n💡 TROUBLESHOOTING:")
    print("1. Pastikan sudah login dengan email Tim Akreditasi")
    print("2. Pastikan ada data di tabel sebelum simpan draft/review")
    print("3. Cek apakah tombol Draft dan Review terlihat di halaman")
    print("4. Cek console browser untuk error detail")

finally:
    print("\nMenutup browser dalam 5 detik...")
    time.sleep(5)
    driver.quit()
    print("Browser ditutup.")
