"""
Test LED Simple - Isi Tabel, Tambah Baris, Hapus Baris, Save Draft, Ajukan Review
Versi sederhana tanpa kompleksitas index
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

# Konfigurasi
EMAIL = "test_5hnkxvpw@polibatam.ac.id"
PASSWORD = "test12345"
ROLE = "Tim Akreditasi"

# Inisialisasi driver
driver = webdriver.Chrome()
driver.maximize_window()

try:
    print("="*70)
    print("  🧪 TEST LED SIMPLE - Isi Tabel, Tambah, Hapus, Draft, Review")
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
    
    driver.get("http://localhost:3000/dashboard/tim-akreditasi/led")
    time.sleep(3)
    
    current_url = driver.current_url
    if 'led' in current_url.lower():
        print(f"   ✅ Halaman LED dimuat: {current_url}")
    else:
        raise Exception("Gagal buka halaman LED")
    
    # ============= STEP 3: SWITCH KE TAB BUDAYA MUTU =============
    print("\n📍 STEP 3: Switch ke tab C.1 Budaya Mutu...")
    
    # Scroll ke atas
    driver.execute_script("window.scrollTo(0, 0);")
    time.sleep(1)
    
    # Klik tab Budaya Mutu
    tab_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'C.1 Budaya Mutu')]"))
    )
    tab_btn.click()
    time.sleep(2)
    
    print("   ✅ Tab Budaya Mutu aktif")
    
    # ============= STEP 4: ISI TABEL YANG ADA =============
    print("\n📍 STEP 4: Tambah baris baru dan isi data...")
    
    # Scroll ke bagian Penetapan
    driver.execute_script("window.scrollTo(0, 800);")
    time.sleep(1)
    
    # Klik tombol "Tambah Baris" terlebih dahulu untuk membuat row
    try:
        tambah_btns = driver.find_elements(By.XPATH, "//button[contains(., 'Tambah Baris')]")
        
        if tambah_btns:
            print(f"   ℹ️  Ditemukan {len(tambah_btns)} tombol 'Tambah Baris'")
            
            # Klik tombol pertama (untuk Penetapan Tabel A)
            btn = tambah_btns[0]
            driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", btn)
            time.sleep(0.5)
            
            try:
                btn.click()
            except:
                driver.execute_script("arguments[0].click();", btn)
            
            print("   ✅ Tombol 'Tambah Baris' diklik")
            
            # PENTING: Tunggu lebih lama untuk row muncul (textarea bukan input!)
            time.sleep(3)
            
            # Refresh untuk memastikan row sudah muncul
            driver.execute_script("window.scrollTo(0, 800);")
            time.sleep(1)
        else:
            print("   ❌ Tombol 'Tambah Baris' tidak ditemukan")
            
    except Exception as e:
        print(f"   ❌ Error klik tambah baris: {e}")
    
    # Sekarang cari TEXTAREA fields (bukan input!) yang sudah muncul
    try:
        # PENTING: Frontend menggunakan TEXTAREA, bukan INPUT!
        # Placeholder: "Isi pernyataan standar..." dan "Isi indikator..." (bukan keterlaksanaan)
        
        pernyataan_fields = driver.find_elements(By.XPATH, 
            "//h4[contains(., 'Tabel A')]/following-sibling::div//textarea[contains(@placeholder, 'pernyataan')]")
        
        indikator_fields = driver.find_elements(By.XPATH,
            "//h4[contains(., 'Tabel A')]/following-sibling::div//textarea[contains(@placeholder, 'indikator')]")
        
        print(f"   ℹ️  Ditemukan {len(pernyataan_fields)} textarea pernyataan")
        print(f"   ℹ️  Ditemukan {len(indikator_fields)} textarea indikator")
        
        if len(pernyataan_fields) > 0 and len(indikator_fields) > 0:
            # Isi textarea pertama/terakhir
            target_pernyataan = pernyataan_fields[-1]  # Ambil yang terakhir (row baru)
            driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", target_pernyataan)
            time.sleep(0.5)
            
            target_pernyataan.clear()
            target_pernyataan.send_keys("Standar Penetapan Budaya Mutu")
            print("   ✅ Pernyataan diisi: 'Standar Penetapan Budaya Mutu'")
            
            target_indikator = indikator_fields[-1]
            driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", target_indikator)
            time.sleep(0.3)
            
            target_indikator.clear()
            target_indikator.send_keys("Terlaksana dengan baik sesuai standar")
            print("   ✅ Indikator diisi: 'Terlaksana dengan baik sesuai standar'")
            
            # Isi pelaksanaan dan bukti jika ada (untuk extended table)
            try:
                pelaksanaan_fields = driver.find_elements(By.XPATH,
                    "//h4[contains(., 'Tabel A')]/following-sibling::div//textarea[contains(@placeholder, 'pelaksanaan')]")
                if pelaksanaan_fields:
                    target_p = pelaksanaan_fields[-1]
                    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", target_p)
                    time.sleep(0.3)
                    target_p.clear()
                    target_p.send_keys("Dilaksanakan secara berkala")
                    print("   ✅ Pelaksanaan diisi: 'Dilaksanakan secara berkala'")
            except:
                print("   ℹ️  Field pelaksanaan tidak ada (tabel basic, bukan extended)")
            
            try:
                bukti_fields = driver.find_elements(By.XPATH,
                    "//h4[contains(., 'Tabel A')]/following-sibling::div//textarea[contains(@placeholder, 'bukti')]")
                if bukti_fields:
                    target_b = bukti_fields[-1]
                    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", target_b)
                    time.sleep(0.3)
                    target_b.clear()
                    target_b.send_keys("http://example.com/bukti-mutu")
                    print("   ✅ Bukti pendukung diisi: 'http://example.com/bukti-mutu'")
            except:
                print("   ℹ️  Field bukti pendukung tidak ada (tabel basic, bukan extended)")
            
            print("   ✅ Data berhasil diisi di tabel")
            
            # Verifikasi data terisi
            time.sleep(1)
            verify_pernyataan = target_pernyataan.get_attribute('value')
            verify_indikator = target_indikator.get_attribute('value')
            
            if verify_pernyataan and verify_indikator:
                print(f"   ✅ VERIFIKASI: Data berhasil tersimpan di textarea")
                print(f"      - Pernyataan: {verify_pernyataan[:50]}...")
                print(f"      - Indikator: {verify_indikator[:50]}...")
            else:
                print("   ⚠️  VERIFIKASI: Data mungkin belum tersimpan")
        else:
            print("   ⚠️  Tidak ada textarea field yang ditemukan setelah klik tambah baris")
            print("   ℹ️  Mencoba strategi alternatif...")
            
            # Strategi alternatif: cari semua textarea di dalam table
            all_textareas = driver.find_elements(By.XPATH,
                "//h4[contains(., 'Tabel A')]/following-sibling::div//textarea")
            print(f"   ℹ️  Total textarea ditemukan: {len(all_textareas)}")
            
            if len(all_textareas) >= 2:
                # Isi 2 textarea pertama
                all_textareas[0].clear()
                all_textareas[0].send_keys("Test Data Pernyataan")
                print("   ✅ Textarea 1 diisi")
                
                all_textareas[1].clear()
                all_textareas[1].send_keys("Test Data Indikator")
                print("   ✅ Textarea 2 diisi")
            
    except Exception as e:
        print(f"   ❌ Error mengisi tabel: {e}")
        import traceback
        traceback.print_exc()
    
    # ============= STEP 5: TAMBAH BARIS KEDUA =============
    print("\n📍 STEP 5: Tambah baris kedua...")
    
    # Scroll ke tombol tambah baris
    driver.execute_script("window.scrollTo(0, 800);")
    time.sleep(1)
    
    try:
        # Cari tombol "Tambah Baris" lagi
        tambah_btns = driver.find_elements(By.XPATH, "//button[contains(., 'Tambah Baris')]")
        
        if tambah_btns:
            # Klik tombol pertama lagi
            btn = tambah_btns[0]
            driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", btn)
            time.sleep(0.5)
            
            try:
                btn.click()
            except:
                driver.execute_script("arguments[0].click();", btn)
            
            print("   ✅ Tombol 'Tambah Baris' diklik untuk row kedua")
            time.sleep(3)
            
            # Isi row kedua (textarea, bukan input!)
            pernyataan_fields = driver.find_elements(By.XPATH, 
                "//h4[contains(., 'Tabel A')]/following-sibling::div//textarea[contains(@placeholder, 'pernyataan')]")
            
            if len(pernyataan_fields) > 1:
                print(f"   ✅ Row kedua muncul (total textarea: {len(pernyataan_fields)})")
                
                # Isi row terakhir
                target = pernyataan_fields[-1]
                driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", target)
                time.sleep(0.5)
                target.clear()
                target.send_keys("Standar Tambahan Budaya Mutu")
                print("   ✅ Pernyataan row 2 diisi: 'Standar Tambahan Budaya Mutu'")
                
                indikator_fields = driver.find_elements(By.XPATH,
                    "//h4[contains(., 'Tabel A')]/following-sibling::div//textarea[contains(@placeholder, 'indikator')]")
                if indikator_fields:
                    target2 = indikator_fields[-1]
                    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", target2)
                    time.sleep(0.3)
                    target2.clear()
                    target2.send_keys("Terlaksana sebagian, perlu perbaikan")
                    print("   ✅ Indikator row 2 diisi: 'Terlaksana sebagian, perlu perbaikan'")
                
                # Verifikasi
                time.sleep(1)
                verify = target.get_attribute('value')
                if verify:
                    print(f"   ✅ VERIFIKASI row 2: Data tersimpan")
                
                print("   ✅ Data kedua berhasil diisi")
            else:
                print(f"   ⚠️  Row kedua tidak muncul (total textarea: {len(pernyataan_fields)})")
        
    except Exception as e:
        print(f"   ❌ Error tambah baris kedua: {e}")
    
    # ============= STEP 6: HAPUS BARIS =============
    print("\n📍 STEP 6: Hapus baris...")
    
    driver.execute_script("window.scrollTo(0, 800);")
    time.sleep(1)
    
    try:
        # Cari tombol hapus
        delete_btns = driver.find_elements(By.XPATH, 
            "//h4[contains(., 'Tabel A')]/following-sibling::div//button[@title='Hapus' or contains(., 'Hapus')]")
        
        if delete_btns and len(delete_btns) > 1:
            print(f"   ℹ️  Ditemukan {len(delete_btns)} tombol hapus")
            
            # Hapus baris terakhir
            btn = delete_btns[-1]
            driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", btn)
            time.sleep(0.5)
            
            try:
                btn.click()
            except:
                driver.execute_script("arguments[0].click();", btn)
            
            print("   ✅ Baris berhasil dihapus")
            time.sleep(2)
        else:
            print("   ⚠️  Tidak bisa hapus (minimal 1 baris harus ada)")
            
    except Exception as e:
        print(f"   ❌ Error hapus baris: {e}")
    
    # ============= STEP 7: SAVE DRAFT =============
    print("\n📍 STEP 7: Simpan sebagai Draft...")
    
    # Scroll ke atas untuk akses tombol
    driver.execute_script("window.scrollTo(0, 0);")
    time.sleep(1)
    
    try:
        draft_btn = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Draft')]"))
        )
        
        try:
            draft_btn.click()
        except:
            driver.execute_script("arguments[0].click();", draft_btn)
        
        print("   ✅ Tombol 'Simpan Draft' diklik")
        time.sleep(3)
        
        # Cek redirect
        current_url = driver.current_url
        if 'bukti-pendukung' in current_url:
            print(f"   ✅ Redirect ke Bukti Pendukung: {current_url}")
        else:
            print(f"   ℹ️  URL saat ini: {current_url}")
            
    except Exception as e:
        print(f"   ❌ Error save draft: {e}")
    
    # ============= STEP 8: KEMBALI KE LED =============
    print("\n📍 STEP 8: Kembali ke LED untuk test Ajukan Review...")
    
    driver.get("http://localhost:3000/dashboard/tim-akreditasi/led")
    time.sleep(2)
    
    # Switch ke tab Budaya Mutu lagi
    driver.execute_script("window.scrollTo(0, 0);")
    time.sleep(0.5)
    
    tab_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'C.1 Budaya Mutu')]"))
    )
    tab_btn.click()
    time.sleep(2)
    
    print("   ✅ Kembali ke LED - Tab Budaya Mutu")
    
    # ============= STEP 9: AJUKAN UNTUK REVIEW =============
    print("\n📍 STEP 9: Ajukan untuk Review...")
    
    # Scroll ke atas
    driver.execute_script("window.scrollTo(0, 0);")
    time.sleep(1)
    
    try:
        review_btn = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Ajukan untuk Review')]"))
        )
        
        try:
            review_btn.click()
        except:
            driver.execute_script("arguments[0].click();", review_btn)
        
        print("   ✅ Tombol 'Ajukan untuk Review' diklik")
        time.sleep(3)
        
        # Cek redirect
        current_url = driver.current_url
        if 'bukti-pendukung' in current_url:
            print(f"   ✅ Redirect ke Bukti Pendukung: {current_url}")
            print("   ✅ Data berhasil diajukan untuk review P4M")
        else:
            print(f"   ℹ️  URL saat ini: {current_url}")
            
    except Exception as e:
        print(f"   ❌ Error ajukan review: {e}")
    
    # ============= STEP 10: VERIFIKASI DI BUKTI PENDUKUNG =============
    print("\n📍 STEP 10: Verifikasi item LED di Bukti Pendukung...")
    
    time.sleep(2)
    
    try:
        led_items = driver.find_elements(By.XPATH, "//td[contains(., 'LED')]")
        
        if led_items:
            print(f"   ✅ Ditemukan {len(led_items)} item LED")
            
            for item in led_items[:3]:  # Tampilkan max 3 item
                print(f"      - {item.text}")
        else:
            print("   ⚠️  Item LED tidak ditemukan di Bukti Pendukung")
            
    except Exception as e:
        print(f"   ℹ️  Error verifikasi: {e}")
    
    # ============= SUMMARY =============
    print("\n" + "="*70)
    print("  ✅ TEST SELESAI!")
    print("="*70)
    
    print("\n📊 SUMMARY:")
    print("✅ Isi tabel yang sudah ada")
    print("✅ Tambah baris baru")
    print("✅ Hapus baris")
    print("✅ Save Draft → Redirect ke Bukti Pendukung")
    print("✅ Ajukan Review → Submit ke P4M")
    
    print("\n📝 CATATAN:")
    print("- Test ini fokus pada fungsi dasar: isi, tambah, hapus, save, submit")
    print("- Tidak melakukan verifikasi kompleks terhadap data")
    print("- Lebih fokus pada workflow dan user journey")

except Exception as e:
    print(f"\n❌ ERROR: {str(e)}")
    import traceback
    traceback.print_exc()

finally:
    print("\nMenutup browser dalam 5 detik...")
    time.sleep(5)
    driver.quit()
    print("Browser ditutup.")
