"""
Test Bukti Pendukung - Semua Tombol Aksi
Test untuk mengklik semua tombol aksi di halaman Bukti Pendukung:
- Lanjutkan (open form untuk lanjutkan pengisian)
- Lihat (view-only mode)
- Edit (edit data yang sudah disubmit)
- Hapus (delete item)
"""

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
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
    print("  🧪 TEST BUKTI PENDUKUNG - Semua Tombol Aksi")
    print("="*70)
    
    # ============= STEP 1: LOGIN =============
    print("\n📍 STEP 1: Login sebagai Tim Akreditasi...")
    
    login_page = LoginPage(driver)
    login_page.open()
    login_page.login(EMAIL, PASSWORD, ROLE)
    time.sleep(2)
    
    print("   ✅ Login berhasil")
    
    # ============= STEP 2: BUKA HALAMAN BUKTI PENDUKUNG =============
    print("\n📍 STEP 2: Membuka halaman Bukti Pendukung...")
    
    driver.get("http://localhost:3000/dashboard/tim-akreditasi/bukti-pendukung")
    time.sleep(3)
    
    current_url = driver.current_url
    if 'bukti-pendukung' in current_url.lower():
        print(f"   ✅ Halaman Bukti Pendukung dimuat: {current_url}")
    else:
        raise Exception("Gagal buka halaman Bukti Pendukung")
    
    # ============= STEP 3: CEK DAFTAR ITEM =============
    print("\n📍 STEP 3: Cek daftar item Bukti Pendukung...")
    
    time.sleep(2)
    
    try:
        table_rows = driver.find_elements(By.XPATH, "//tbody//tr")
        print(f"   ℹ️  Ditemukan {len(table_rows)} item di tabel")
        
        if len(table_rows) == 0:
            print("   ⚠️  Tidak ada item Bukti Pendukung")
            print("   ℹ️  Pastikan sudah ada data LKPS/LED yang di-submit/draft")
        else:
            for i, row in enumerate(table_rows[:3]):
                try:
                    judul = row.find_element(By.XPATH, ".//td[1]").text
                    kategori = row.find_element(By.XPATH, ".//td[2]").text
                    status = row.find_element(By.XPATH, ".//td[4]").text
                    print(f"   {i+1}. {judul[:50]}... | {kategori} | {status}")
                except:
                    pass
            
            if len(table_rows) > 3:
                print(f"   ... dan {len(table_rows) - 3} item lainnya")
                
    except Exception as e:
        print(f"   ❌ Error cek tabel: {e}")
    
    # ============= STEP 4: ANALISIS TOMBOL AKSI =============
    print("\n📍 STEP 4: Analisis tombol-tombol aksi...")
    
    try:
        table_rows = driver.find_elements(By.XPATH, "//tbody//tr")
        
        if table_rows:
            print(f"   ℹ️  Menganalisis tombol untuk {min(len(table_rows), 5)} item pertama\n")
            
            for i, row in enumerate(table_rows[:5], 1):
                try:
                    judul = row.find_element(By.XPATH, ".//td[1]").text
                    status = row.find_element(By.XPATH, ".//td[4]").text
                    
                    print(f"   {i}. {judul[:45]}...")
                    print(f"      Status: {status}")
                    
                    # Cek tombol "Lanjutkan"
                    lanjutkan_btns = row.find_elements(By.XPATH, ".//button[contains(., 'Lanjutkan')]")
                    if lanjutkan_btns:
                        print(f"      🔵 Lanjutkan: ADA")
                    
                    # Cek tombol "Lihat" (icon mata/eye)
                    lihat_btns = row.find_elements(By.XPATH, ".//button[@title='Lihat' or contains(@aria-label, 'Lihat')]")
                    if lihat_btns:
                        print(f"      🟢 Lihat: ADA")
                    
                    # Cek tombol "Edit" (icon pensil/edit)
                    edit_btns = row.find_elements(By.XPATH, ".//button[@title='Edit' or contains(@aria-label, 'Edit')]")
                    if edit_btns:
                        print(f"      🟡 Edit: ADA")
                    
                    # Cek tombol "Hapus" (icon trash/delete)
                    hapus_btns = row.find_elements(By.XPATH, ".//button[@title='Hapus' or contains(@aria-label, 'Hapus')]")
                    if hapus_btns:
                        print(f"      🔴 Hapus: ADA")
                    
                    print()
                    
                except Exception as e:
                    print(f"      ⚠️  Error: {e}\n")
            
            if len(table_rows) > 5:
                print(f"   ... dan {len(table_rows) - 5} item lainnya\n")
        
        # Summary
        print("   📊 SUMMARY TOMBOL:")
        lanjutkan_count = len(driver.find_elements(By.XPATH, "//button[contains(., 'Lanjutkan')]"))
        lihat_count = len(driver.find_elements(By.XPATH, "//button[@title='Lihat' or contains(@aria-label, 'Lihat')]"))
        edit_count = len(driver.find_elements(By.XPATH, "//button[@title='Edit' or contains(@aria-label, 'Edit')]"))
        hapus_count = len(driver.find_elements(By.XPATH, "//button[@title='Hapus' or contains(@aria-label, 'Hapus')]"))
        
        if lanjutkan_count > 0:
            print(f"   🔵 Lanjutkan: {lanjutkan_count} tombol")
        if lihat_count > 0:
            print(f"   🟢 Lihat: {lihat_count} tombol")
        if edit_count > 0:
            print(f"   🟡 Edit: {edit_count} tombol")
        if hapus_count > 0:
            print(f"   🔴 Hapus: {hapus_count} tombol")
            
    except Exception as e:
        print(f"   ❌ Error analisis: {e}")
    
    # ============= STEP 5: TEST TOMBOL LANJUTKAN =============
    print("\n📍 STEP 5: Test tombol 'Lanjutkan'...")
    
    test_lanjutkan_success = False
    
    try:
        # Refresh untuk memastikan state clean
        driver.get("http://localhost:3000/dashboard/tim-akreditasi/bukti-pendukung")
        time.sleep(2)
        
        # Cari item dengan tombol "Lanjutkan"
        lanjutkan_btns = driver.find_elements(By.XPATH, "//tbody//tr//button[contains(., 'Lanjutkan')]")
        
        if lanjutkan_btns:
            print(f"   ℹ️  Ditemukan {len(lanjutkan_btns)} tombol 'Lanjutkan'")
            
            # Ambil row parent untuk info
            btn = lanjutkan_btns[0]
            row = btn.find_element(By.XPATH, "./ancestor::tr")
            
            judul = row.find_element(By.XPATH, ".//td[1]").text
            kategori = row.find_element(By.XPATH, ".//td[2]").text
            status = row.find_element(By.XPATH, ".//td[4]").text
            
            print(f"\n   📄 Test Item: {judul[:50]}...")
            print(f"      Kategori: {kategori} | Status: {status}")
            
            # Scroll ke tombol
            driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", btn)
            time.sleep(1)
            
            print(f"   ➤ Mengklik tombol 'Lanjutkan'...")
            
            try:
                btn.click()
            except:
                driver.execute_script("arguments[0].click();", btn)
            
            time.sleep(2)
            
            # Cek modal
            try:
                modal = WebDriverWait(driver, 3).until(
                    EC.presence_of_element_located((By.XPATH, "//div[contains(@class, 'fixed') and contains(@class, 'inset-0')]"))
                )
                
                print(f"   ✅ Modal konfirmasi muncul")
                
                # Klik "Ya, Lanjutkan"
                confirm_btn = driver.find_element(By.XPATH, "//button[contains(., 'Ya, Lanjutkan')]")
                driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", confirm_btn)
                time.sleep(0.5)
                
                try:
                    confirm_btn.click()
                except:
                    driver.execute_script("arguments[0].click();", confirm_btn)
                
                print(f"   ✅ Konfirmasi diklik")
                time.sleep(3)
                
            except:
                print(f"   ℹ️  Tidak ada modal (langsung redirect)")
            
            # Verifikasi redirect
            current_url = driver.current_url
            
            if 'lkps' in current_url.lower() or 'led' in current_url.lower():
                print(f"   ✅ Redirect ke halaman isian: {current_url}")
                
                # Cek form tersedia
                time.sleep(2)
                tables = driver.find_elements(By.TAG_NAME, "table")
                if tables:
                    print(f"   ✅ Form/tabel tersedia ({len(tables)} tabel)")
                
                test_lanjutkan_success = True
            else:
                print(f"   ❌ Redirect tidak sesuai: {current_url}")
            
            # Kembali ke Bukti Pendukung
            driver.get("http://localhost:3000/dashboard/tim-akreditasi/bukti-pendukung")
            time.sleep(2)
            
        else:
            print("   ⚠️  Tidak ada tombol 'Lanjutkan'")
            print("   ℹ️  Tombol ini hanya ada untuk item status 'Draft'")
            
    except Exception as e:
        print(f"   ❌ Error test Lanjutkan: {e}")
    
    # ============= STEP 6: TEST TOMBOL LIHAT =============
    print("\n📍 STEP 6: Test tombol 'Lihat'...")
    
    test_lihat_success = False
    
    try:
        # Refresh
        driver.get("http://localhost:3000/dashboard/tim-akreditasi/bukti-pendukung")
        time.sleep(2)
        
        # Cari tombol "Lihat" (icon mata)
        lihat_btns = driver.find_elements(By.XPATH, "//tbody//tr//button[@title='Lihat' or contains(@aria-label, 'Lihat')]")
        
        if lihat_btns:
            print(f"   ℹ️  Ditemukan {len(lihat_btns)} tombol 'Lihat'")
            
            # Ambil tombol pertama
            btn = lihat_btns[0]
            row = btn.find_element(By.XPATH, "./ancestor::tr")
            
            judul = row.find_element(By.XPATH, ".//td[1]").text
            kategori = row.find_element(By.XPATH, ".//td[2]").text
            status = row.find_element(By.XPATH, ".//td[4]").text
            
            print(f"\n   📄 Test Item: {judul[:50]}...")
            print(f"      Kategori: {kategori} | Status: {status}")
            
            # Scroll dan klik
            driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", btn)
            time.sleep(1)
            
            print(f"   ➤ Mengklik tombol 'Lihat' (View)...")
            
            try:
                btn.click()
            except:
                driver.execute_script("arguments[0].click();", btn)
            
            time.sleep(3)
            
            # Verifikasi redirect ke view page
            current_url = driver.current_url
            
            if 'lkps' in current_url.lower() or 'led' in current_url.lower():
                print(f"   ✅ Redirect ke halaman view: {current_url}")
                
                # Cek mode view (tabel/form ada tapi read-only)
                time.sleep(2)
                
                # Cek apakah ada tabel
                tables = driver.find_elements(By.TAG_NAME, "table")
                if tables:
                    print(f"   ✅ Data ditampilkan ({len(tables)} tabel)")
                
                # Cek apakah input disabled/readonly
                inputs = driver.find_elements(By.XPATH, "//input[@disabled or @readonly] | //textarea[@disabled or @readonly]")
                if inputs:
                    print(f"   ✅ Mode READ-ONLY (input disabled)")
                else:
                    print(f"   ℹ️  Mode read-only mungkin diatur dengan cara lain")
                
                # Cek tidak ada tombol "Simpan" atau "Submit"
                simpan_btns = driver.find_elements(By.XPATH, "//button[contains(., 'Simpan') or contains(., 'Submit')]")
                if not simpan_btns:
                    print(f"   ✅ Tidak ada tombol 'Simpan' (mode view)")
                else:
                    print(f"   ℹ️  Ada tombol simpan ({len(simpan_btns)} tombol) - mungkin bukan mode view murni")
                
                test_lihat_success = True
            else:
                print(f"   ❌ Redirect tidak sesuai: {current_url}")
            
            # Kembali
            driver.get("http://localhost:3000/dashboard/tim-akreditasi/bukti-pendukung")
            time.sleep(2)
            
        else:
            print("   ⚠️  Tidak ada tombol 'Lihat'")
            print("   ℹ️  Tombol ini biasanya ada untuk semua item")
            
    except Exception as e:
        print(f"   ❌ Error test Lihat: {e}")
    
    # ============= STEP 7: TEST TOMBOL EDIT =============
    print("\n📍 STEP 7: Test tombol 'Edit'...")
    
    test_edit_success = False
    
    try:
        # Refresh
        driver.get("http://localhost:3000/dashboard/tim-akreditasi/bukti-pendukung")
        time.sleep(2)
        
        # Cari tombol "Edit" (icon pensil)
        edit_btns = driver.find_elements(By.XPATH, "//tbody//tr//button[@title='Edit' or contains(@aria-label, 'Edit')]")
        
        if edit_btns:
            print(f"   ℹ️  Ditemukan {len(edit_btns)} tombol 'Edit'")
            
            # Ambil tombol pertama
            btn = edit_btns[0]
            row = btn.find_element(By.XPATH, "./ancestor::tr")
            
            judul = row.find_element(By.XPATH, ".//td[1]").text
            kategori = row.find_element(By.XPATH, ".//td[2]").text
            status = row.find_element(By.XPATH, ".//td[4]").text
            
            print(f"\n   📄 Test Item: {judul[:50]}...")
            print(f"      Kategori: {kategori} | Status: {status}")
            
            # Scroll dan klik
            driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", btn)
            time.sleep(1)
            
            print(f"   ➤ Mengklik tombol 'Edit'...")
            
            try:
                btn.click()
            except:
                driver.execute_script("arguments[0].click();", btn)
            
            time.sleep(3)
            
            # Verifikasi redirect ke edit page
            current_url = driver.current_url
            
            if 'lkps' in current_url.lower() or 'led' in current_url.lower():
                print(f"   ✅ Redirect ke halaman edit: {current_url}")
                
                # Cek mode edit (tabel/form ada dan editable)
                time.sleep(2)
                
                # Cek tabel
                tables = driver.find_elements(By.TAG_NAME, "table")
                if tables:
                    print(f"   ✅ Form tersedia ({len(tables)} tabel)")
                
                # Cek input editable (tidak disabled)
                inputs = driver.find_elements(By.XPATH, "//input[not(@disabled)] | //textarea[not(@disabled)]")
                if inputs:
                    print(f"   ✅ Input dapat diedit ({len(inputs)} input aktif)")
                
                # Cek ada tombol "Simpan" atau "Update"
                simpan_btns = driver.find_elements(By.XPATH, "//button[contains(., 'Simpan') or contains(., 'Update') or contains(., 'Perbarui')]")
                if simpan_btns:
                    print(f"   ✅ Tombol simpan tersedia (mode edit)")
                
                test_edit_success = True
            else:
                print(f"   ❌ Redirect tidak sesuai: {current_url}")
            
            # Kembali
            driver.get("http://localhost:3000/dashboard/tim-akreditasi/bukti-pendukung")
            time.sleep(2)
            
        else:
            print("   ⚠️  Tidak ada tombol 'Edit'")
            print("   ℹ️  Tombol ini mungkin hanya ada untuk item tertentu (Draft/Ditolak)")
            
    except Exception as e:
        print(f"   ❌ Error test Edit: {e}")
    
    # ============= STEP 8: TEST TOMBOL HAPUS =============
    print("\n📍 STEP 8: Test tombol 'Hapus' (tanpa konfirmasi delete)...")
    
    test_hapus_success = False
    
    try:
        # Refresh
        driver.get("http://localhost:3000/dashboard/tim-akreditasi/bukti-pendukung")
        time.sleep(2)
        
        # Cari tombol "Hapus" (icon trash)
        hapus_btns = driver.find_elements(By.XPATH, "//tbody//tr//button[@title='Hapus' or contains(@aria-label, 'Hapus')]")
        
        if hapus_btns:
            print(f"   ℹ️  Ditemukan {len(hapus_btns)} tombol 'Hapus'")
            
            # Ambil tombol terakhir (safer - delete last item)
            btn = hapus_btns[-1]
            row = btn.find_element(By.XPATH, "./ancestor::tr")
            
            judul = row.find_element(By.XPATH, ".//td[1]").text
            kategori = row.find_element(By.XPATH, ".//td[2]").text
            status = row.find_element(By.XPATH, ".//td[4]").text
            
            print(f"\n   📄 Test Item: {judul[:50]}...")
            print(f"      Kategori: {kategori} | Status: {status}")
            
            # Hitung jumlah item sebelum hapus
            rows_before = len(driver.find_elements(By.XPATH, "//tbody//tr"))
            print(f"   ℹ️  Jumlah item sebelum: {rows_before}")
            
            # Scroll dan klik
            driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", btn)
            time.sleep(1)
            
            print(f"   ➤ Mengklik tombol 'Hapus'...")
            
            try:
                btn.click()
            except:
                driver.execute_script("arguments[0].click();", btn)
            
            time.sleep(2)
            
            # Cek modal konfirmasi hapus
            try:
                modal = WebDriverWait(driver, 3).until(
                    EC.presence_of_element_located((By.XPATH, "//div[contains(@class, 'fixed') and contains(@class, 'inset-0')]"))
                )
                
                print(f"   ✅ Modal konfirmasi hapus muncul")
                
                # UNTUK TEST INI, KITA TIDAK KONFIRMASI DELETE (CANCEL)
                # Cari tombol Cancel/Batal
                cancel_btns = driver.find_elements(By.XPATH, "//button[contains(., 'Batal') or contains(., 'Cancel')]")
                
                if cancel_btns:
                    cancel_btn = cancel_btns[0]
                    print(f"   ➤ Mengklik 'Batal' (tidak jadi hapus)...")
                    
                    try:
                        cancel_btn.click()
                    except:
                        driver.execute_script("arguments[0].click();", cancel_btn)
                    
                    time.sleep(2)
                    
                    # Verifikasi item tidak terhapus
                    rows_after = len(driver.find_elements(By.XPATH, "//tbody//tr"))
                    print(f"   ℹ️  Jumlah item setelah: {rows_after}")
                    
                    if rows_after == rows_before:
                        print(f"   ✅ Item TIDAK terhapus (cancel berhasil)")
                        test_hapus_success = True
                    else:
                        print(f"   ⚠️  Jumlah item berubah (unexpected)")
                else:
                    print(f"   ⚠️  Tombol Cancel tidak ditemukan")
                    
                    # Tutup modal dengan ESC atau klik outside
                    try:
                        from selenium.webdriver.common.keys import Keys
                        driver.find_element(By.TAG_NAME, "body").send_keys(Keys.ESCAPE)
                        time.sleep(1)
                        print(f"   ℹ️  Modal ditutup dengan ESC")
                    except:
                        pass
                    
            except:
                print(f"   ⚠️  Tidak ada modal konfirmasi")
                print(f"   ℹ️  Item mungkin langsung terhapus atau ada error")
            
        else:
            print("   ⚠️  Tidak ada tombol 'Hapus'")
            print("   ℹ️  Tombol ini mungkin hanya ada untuk item Draft atau yang belum direview")
            
    except Exception as e:
        print(f"   ❌ Error test Hapus: {e}")
    
    # ============= FINAL SUMMARY =============
    print("\n" + "="*70)
    print("  ✅ TEST SELESAI!")
    print("="*70)
    
    print("\n📊 HASIL TEST TOMBOL AKSI:")
    print(f"   🔵 Lanjutkan: {'✅ BERHASIL' if test_lanjutkan_success else '⚠️  TIDAK DITEST/GAGAL'}")
    print(f"   🟢 Lihat:     {'✅ BERHASIL' if test_lihat_success else '⚠️  TIDAK DITEST/GAGAL'}")
    print(f"   🟡 Edit:      {'✅ BERHASIL' if test_edit_success else '⚠️  TIDAK DITEST/GAGAL'}")
    print(f"   🔴 Hapus:     {'✅ BERHASIL' if test_hapus_success else '⚠️  TIDAK DITEST/GAGAL'}")
    
    print("\n📝 CATATAN:")
    print("- 'Lanjutkan': Membuka form untuk melanjutkan pengisian (status Draft)")
    print("- 'Lihat': Membuka halaman view (read-only) untuk melihat data")
    print("- 'Edit': Membuka halaman edit untuk mengubah data")
    print("- 'Hapus': Membuka modal konfirmasi untuk menghapus item")
    print("\n💡 Availability tombol bergantung pada status item:")
    print("- Draft: Lanjutkan, Lihat, Edit, Hapus")
    print("- Menunggu Review: Lihat")
    print("- Diterima: Lihat")
    print("- Ditolak: Lihat, Edit")

except Exception as e:
    print(f"\n❌ ERROR: {str(e)}")
    import traceback
    traceback.print_exc()
    
    print("\n💡 TROUBLESHOOTING:")
    print("1. Pastikan sudah login dengan email Tim Akreditasi")
    print("2. Pastikan ada data LKPS/LED yang sudah di-submit")
    print("3. Availability tombol bergantung status item")
    print("4. Beberapa tombol mungkin tidak ada jika tidak ada item dengan status tertentu")

finally:
    print("\nMenutup browser dalam 5 detik...")
    time.sleep(5)
    driver.quit()
    print("Browser ditutup.")
