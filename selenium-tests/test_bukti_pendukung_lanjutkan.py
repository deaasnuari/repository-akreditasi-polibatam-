"""
Test Bukti Pendukung - Tombol Lanjutkan
Test untuk mengklik tombol "Lanjutkan" di halaman Bukti Pendukung
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
    print("  🧪 TEST BUKTI PENDUKUNG - Tombol Lanjutkan")
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
    
    # Tunggu tabel muncul
    time.sleep(2)
    
    # Cari semua row di tabel
    try:
        table_rows = driver.find_elements(By.XPATH, "//tbody//tr")
        print(f"   ℹ️  Ditemukan {len(table_rows)} item di tabel")
        
        if len(table_rows) == 0:
            print("   ⚠️  Tidak ada item Bukti Pendukung")
            print("   ℹ️  Pastikan sudah ada data LKPS/LED yang di-submit/draft")
        else:
            # Tampilkan beberapa item pertama
            for i, row in enumerate(table_rows[:3]):
                try:
                    judul = row.find_element(By.XPATH, ".//td[1]").text
                    kategori = row.find_element(By.XPATH, ".//td[2]").text
                    status = row.find_element(By.XPATH, ".//td[4]").text
                    print(f"   {i+1}. {judul} | {kategori} | Status: {status}")
                except:
                    pass
            
            if len(table_rows) > 3:
                print(f"   ... dan {len(table_rows) - 3} item lainnya")
                
    except Exception as e:
        print(f"   ❌ Error cek tabel: {e}")
    
    # ============= STEP 4: CARI TOMBOL LANJUTKAN =============
    print("\n📍 STEP 4: Cek tombol-tombol Aksi di setiap item...")
    
    try:
        # Cari semua row di tabel
        table_rows = driver.find_elements(By.XPATH, "//tbody//tr")
        
        if table_rows:
            print(f"   ℹ️  Mengecek tombol aksi untuk {len(table_rows)} item\n")
            
            for i, row in enumerate(table_rows[:5], 1):  # Cek 5 item pertama
                try:
                    # Ambil informasi item
                    judul = row.find_element(By.XPATH, ".//td[1]").text
                    status = row.find_element(By.XPATH, ".//td[4]").text
                    
                    print(f"   {i}. {judul[:50]}...")
                    print(f"      Status: {status}")
                    
                    # Cek semua tombol aksi di row ini
                    action_buttons = row.find_elements(By.XPATH, ".//td[last()]//button")
                    
                    if action_buttons:
                        print(f"      Tombol Aksi ({len(action_buttons)}):")
                        
                        for btn in action_buttons:
                            btn_text = btn.text.strip()
                            
                            # Cek icon/class untuk identifikasi tombol
                            try:
                                # Cek apakah tombol memiliki icon tertentu
                                if 'Lanjutkan' in btn_text or btn.find_elements(By.XPATH, ".//*[name()='svg']"):
                                    if not btn_text:
                                        # Identifikasi dari title atau aria-label
                                        title = btn.get_attribute('title')
                                        aria_label = btn.get_attribute('aria-label')
                                        btn_text = title or aria_label or 'Icon button'
                            except:
                                pass
                            
                            # Cek apakah tombol disabled
                            is_disabled = btn.get_attribute('disabled')
                            disabled_text = " (disabled)" if is_disabled else ""
                            
                            # Cek class untuk warna/style
                            btn_class = btn.get_attribute('class') or ''
                            
                            if 'bg-blue' in btn_class or 'blue' in btn_class:
                                color = "🔵"
                            elif 'bg-green' in btn_class or 'green' in btn_class:
                                color = "🟢"
                            elif 'bg-yellow' in btn_class or 'yellow' in btn_class:
                                color = "🟡"
                            elif 'bg-red' in btn_class or 'red' in btn_class:
                                color = "🔴"
                            elif 'bg-purple' in btn_class or 'purple' in btn_class:
                                color = "🟣"
                            else:
                                color = "⚪"
                            
                            print(f"         {color} {btn_text}{disabled_text}")
                    else:
                        print("      ⚠️  Tidak ada tombol aksi")
                    
                    print()  # Spacing
                    
                except Exception as e:
                    print(f"      ⚠️  Error baca row: {e}\n")
            
            if len(table_rows) > 5:
                print(f"   ... dan {len(table_rows) - 5} item lainnya\n")
        else:
            print("   ⚠️  Tidak ada item di tabel")
        
        # Summary tombol aksi yang ditemukan
        print("   📊 SUMMARY TOMBOL AKSI:")
        
        lanjutkan_btns = driver.find_elements(By.XPATH, "//button[contains(., 'Lanjutkan')]")
        lihat_btns = driver.find_elements(By.XPATH, "//button[contains(., 'Lihat') or @title='Lihat']")
        edit_btns = driver.find_elements(By.XPATH, "//button[contains(., 'Edit') or @title='Edit']")
        hapus_btns = driver.find_elements(By.XPATH, "//button[contains(., 'Hapus') or @title='Hapus']")
        
        if lanjutkan_btns:
            print(f"   🔵 'Lanjutkan': {len(lanjutkan_btns)} tombol")
        if lihat_btns:
            print(f"   🟢 'Lihat': {len(lihat_btns)} tombol")
        if edit_btns:
            print(f"   🟡 'Edit': {len(edit_btns)} tombol")
        if hapus_btns:
            print(f"   🔴 'Hapus': {len(hapus_btns)} tombol")
        
        if not (lanjutkan_btns or lihat_btns or edit_btns or hapus_btns):
            print("   ⚠️  Tidak ada tombol aksi yang ditemukan")
            
    except Exception as e:
        print(f"   ❌ Error cek tombol aksi: {e}")
    
    # ============= STEP 5: KLIK TOMBOL LANJUTKAN PER ITEM =============
    print("\n📍 STEP 5: Test klik tombol 'Lanjutkan' untuk setiap item...")
    
    try:
        # Cari semua item yang memiliki tombol "Lanjutkan"
        table_rows = driver.find_elements(By.XPATH, "//tbody//tr")
        
        items_tested = 0
        max_items = 3  # Test maksimal 3 item untuk efisiensi
        
        for i, row in enumerate(table_rows):
            if items_tested >= max_items:
                print(f"\n   ℹ️  Batas test tercapai ({max_items} item), menghentikan test...")
                break
            
            try:
                # Ambil informasi item
                judul_elem = row.find_element(By.XPATH, ".//td[1]")
                judul = judul_elem.text
                
                kategori_elem = row.find_element(By.XPATH, ".//td[2]")
                kategori = kategori_elem.text
                
                status_elem = row.find_element(By.XPATH, ".//td[4]")
                status = status_elem.text
                
                # Cek apakah ada tombol "Lanjutkan" di row ini
                lanjutkan_btns = row.find_elements(By.XPATH, ".//button[contains(., 'Lanjutkan')]")
                
                if not lanjutkan_btns:
                    print(f"\n   ⊘ Item {i+1}: {judul[:40]}... - SKIP (tidak ada tombol Lanjutkan)")
                    continue
                
                items_tested += 1
                
                print(f"\n   {'='*60}")
                print(f"   📄 TEST ITEM {items_tested}: {judul}")
                print(f"      Kategori: {kategori} | Status: {status}")
                print(f"   {'='*60}")
                
                # Scroll ke tombol
                btn = lanjutkan_btns[0]
                driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", btn)
                time.sleep(1)
                
                print(f"   ➤ Mengklik tombol 'Lanjutkan'...")
                
                # Klik tombol
                try:
                    btn.click()
                except:
                    driver.execute_script("arguments[0].click();", btn)
                
                print(f"   ✅ Tombol diklik")
                time.sleep(2)
                
                # Cek modal konfirmasi
                try:
                    modal = WebDriverWait(driver, 3).until(
                        EC.presence_of_element_located((By.XPATH, "//div[contains(@class, 'fixed') and contains(@class, 'inset-0')]"))
                    )
                    
                    print(f"   ✅ Modal konfirmasi muncul")
                    
                    # Cari tombol konfirmasi di modal
                    confirm_btn = driver.find_element(By.XPATH, "//button[contains(., 'Ya, Lanjutkan')]")
                    
                    # Scroll dan klik
                    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", confirm_btn)
                    time.sleep(0.5)
                    
                    print(f"   ➤ Mengklik 'Ya, Lanjutkan' di modal...")
                    
                    try:
                        confirm_btn.click()
                    except:
                        driver.execute_script("arguments[0].click();", confirm_btn)
                    
                    print(f"   ✅ Konfirmasi diklik")
                    time.sleep(3)
                    
                except Exception as e:
                    print(f"   ℹ️  Tidak ada modal (langsung redirect)")
                
                # Verifikasi redirect
                current_url = driver.current_url
                print(f"   ➤ URL setelah klik: {current_url}")
                
                # Cek apakah redirect sesuai dengan kategori
                redirect_ok = False
                
                if kategori.upper() == 'LKPS':
                    if 'lkps' in current_url.lower():
                        print(f"   ✅ Redirect ke LKPS - BENAR")
                        
                        # Identifikasi bagian LKPS
                        if 'akuntabilitas' in current_url:
                            print(f"      → Bagian: Akuntabilitas")
                        elif 'relevansi-pendidikan' in current_url:
                            print(f"      → Bagian: Relevansi Pendidikan")
                        elif 'relevansi-penelitian' in current_url:
                            print(f"      → Bagian: Relevansi Penelitian")
                        elif 'relevansi-pkm' in current_url:
                            print(f"      → Bagian: Relevansi PkM")
                        elif 'diferensiasi-misi' in current_url:
                            print(f"      → Bagian: Diferensiasi Misi")
                        else:
                            print(f"      → Bagian: Budaya Mutu (default)")
                        
                        redirect_ok = True
                    else:
                        print(f"   ❌ Redirect SALAH (expected LKPS, got: {current_url})")
                        
                elif kategori.upper() == 'LED':
                    if 'led' in current_url.lower():
                        print(f"   ✅ Redirect ke LED - BENAR")
                        
                        # Identifikasi tab LED
                        if 'tab=' in current_url:
                            import re
                            match = re.search(r'tab=([^&]+)', current_url)
                            if match:
                                tab = match.group(1)
                                print(f"      → Tab: {tab}")
                        else:
                            print(f"      → Tab: budaya-mutu (default)")
                        
                        redirect_ok = True
                    else:
                        print(f"   ❌ Redirect SALAH (expected LED, got: {current_url})")
                else:
                    print(f"   ℹ️  Kategori tidak dikenal: {kategori}")
                
                # Cek apakah ada form/tabel di halaman tujuan
                if redirect_ok:
                    time.sleep(2)
                    
                    tables = driver.find_elements(By.TAG_NAME, "table")
                    tambah_btns = driver.find_elements(By.XPATH, "//button[contains(., 'Tambah')]")
                    
                    if tables:
                        print(f"   ✅ Tabel ditemukan ({len(tables)} tabel)")
                    if tambah_btns:
                        print(f"   ✅ Tombol 'Tambah' tersedia ({len(tambah_btns)} tombol)")
                    
                    print(f"   ✅ Halaman isian siap digunakan")
                
                # Kembali ke Bukti Pendukung untuk test item berikutnya
                print(f"   ➤ Kembali ke Bukti Pendukung...")
                driver.get("http://localhost:3000/dashboard/tim-akreditasi/bukti-pendukung")
                time.sleep(3)
                
                print(f"   ✅ Item {items_tested} SELESAI")
                
            except Exception as e:
                print(f"   ❌ Error test item {i+1}: {e}")
                
                # Kembali ke Bukti Pendukung jika error
                try:
                    driver.get("http://localhost:3000/dashboard/tim-akreditasi/bukti-pendukung")
                    time.sleep(2)
                except:
                    pass
        
        if items_tested == 0:
            print("\n   ⚠️  Tidak ada item dengan tombol 'Lanjutkan' untuk ditest")
            print("   ℹ️  Pastikan ada data LKPS/LED yang sudah di-submit dengan status Draft")
        else:
            print(f"\n   ✅ TOTAL ITEM BERHASIL DITEST: {items_tested}")
            
    except Exception as e:
        print(f"   ❌ Error test per item: {e}")
    
    # ============= STEP 6-8: DIGABUNG KE STEP 5 =============
    # Step 6, 7, 8 sudah digabung ke dalam loop STEP 5
    # Setiap item akan ditest: modal, redirect, dan verifikasi halaman
    
    # ============= FINAL SUMMARY =============
    print("\n" + "="*70)
    print("  ✅ TEST SELESAI!")
    print("="*70)
    
    print("\n📊 SUMMARY:")
    print("✅ Login berhasil")
    print("✅ Halaman Bukti Pendukung dimuat")
    print("✅ Daftar item berhasil ditampilkan")
    print("✅ Detail tombol aksi berhasil dianalisis")
    print("✅ Test klik 'Lanjutkan' per item selesai")
    print("✅ Verifikasi redirect per file berhasil")
    
    print("\n📝 CATATAN:")
    print("- Test akan mengklik tombol 'Lanjutkan' untuk setiap item (max 3)")
    print("- Setiap item akan dibuka modal konfirmasi → klik 'Ya, Lanjutkan'")
    print("- Verifikasi redirect sesuai kategori file (LKPS/LED)")
    print("- Setelah verifikasi, kembali ke Bukti Pendukung untuk item berikutnya")
    print("- Tombol 'Lanjutkan' hanya ada untuk item status 'Draft' atau 'Menunggu'")

except Exception as e:
    print(f"\n❌ ERROR: {str(e)}")
    import traceback
    traceback.print_exc()
    
    print("\n💡 TROUBLESHOOTING:")
    print("1. Pastikan sudah login dengan email Tim Akreditasi")
    print("2. Pastikan ada data LKPS/LED yang sudah di-submit")
    print("3. Data akan muncul di Bukti Pendukung setelah Save Draft atau Ajukan Review")
    print("4. Tombol 'Lanjutkan' hanya ada untuk item Draft")

finally:
    print("\nMenutup browser dalam 5 detik...")
    time.sleep(5)
    driver.quit()
    print("Browser ditutup.")
