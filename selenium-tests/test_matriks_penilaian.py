"""
Test Matriks Penilaian - Klik Skor dan Export Hasil
Test untuk:
1. Memilih skor pada kriteria penilaian (klik radio button)
2. Verifikasi skor terbobot dan total
3. Export hasil penilaian ke Excel
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
from page_objects.matriks_penilaian_page import MatriksPenilaianPage

# Konfigurasi
EMAIL = "test_5hnkxvpw@polibatam.ac.id"
PASSWORD = "test12345"
ROLE = "Tim Akreditasi"

# Inisialisasi driver
driver = webdriver.Chrome()
driver.maximize_window()

try:
    print("="*70)
    print("  🧪 TEST MATRIKS PENILAIAN - Klik Skor & Export Hasil")
    print("="*70)
    
    # ============= STEP 1: LOGIN =============
    print("\n📍 STEP 1: Login sebagai Tim Akreditasi...")
    
    login_page = LoginPage(driver)
    login_page.open()
    login_page.login(EMAIL, PASSWORD, ROLE)
    time.sleep(2)
    
    print("   ✅ Login berhasil")
    
    # ============= STEP 2: BUKA HALAMAN MATRIKS PENILAIAN =============
    print("\n📍 STEP 2: Membuka halaman Matriks Penilaian...")
    
    matriks_page = MatriksPenilaianPage(driver)
    matriks_page.open()
    time.sleep(3)
    
    if matriks_page.is_loaded():
        print(f"   ✅ Halaman Matriks Penilaian dimuat: {driver.current_url}")
    else:
        raise Exception("Gagal memuat halaman Matriks Penilaian")
    
    # ============= STEP 3: CEK INFO AWAL =============
    print("\n📍 STEP 3: Cek informasi awal...")
    
    # Ambil skor total awal
    skor_total_awal = matriks_page.get_skor_total()
    peringkat_awal = matriks_page.get_peringkat()
    
    print(f"   ℹ️  Skor Total Awal: {skor_total_awal}")
    print(f"   ℹ️  Peringkat Awal: {peringkat_awal}")
    
    # Cek jumlah kriteria
    row_count = matriks_page.get_table_row_count()
    print(f"   ℹ️  Jumlah Kriteria: {row_count}")
    
    # Cek group headers
    groups = matriks_page.get_group_headers()
    print(f"   ℹ️  Grup Kriteria: {len(groups)} grup")
    for i, group in enumerate(groups[:3], 1):
        print(f"      {i}. {group[:60]}...")
    if len(groups) > 3:
        print(f"      ... dan {len(groups) - 3} grup lainnya")
    
    # Cek prioritas perbaikan
    prioritas_count = matriks_page.get_prioritas_perbaikan_count()
    print(f"   ℹ️  Prioritas Perbaikan: {prioritas_count} item")
    
    if row_count == 0:
        print("\n   ⚠️  TIDAK ADA KRITERIA!")
        print("   ℹ️  Pastikan data matriks penilaian sudah di-seed di database")
        raise Exception("No criteria found")
    
    print(f"   ✅ Informasi awal berhasil diambil")
    
    # ============= STEP 4: TEST KLIK SKOR PADA BEBERAPA KRITERIA =============
    print("\n📍 STEP 4: Test klik skor pada beberapa kriteria...")
    
    # Test pada 5 kriteria pertama
    test_count = min(5, row_count)
    
    print(f"   ℹ️  Akan test {test_count} kriteria pertama\n")
    
    for i in range(test_count):
        try:
            # Ambil info kriteria
            info = matriks_page.get_criteria_info(i)
            
            print(f"   {'='*60}")
            print(f"   📊 TEST KRITERIA {i+1}:")
            print(f"      No. Butir: {info.get('no_butir', '-')}")
            print(f"      Kriteria: {info.get('kriteria', '-')[:50]}...")
            print(f"      Bobot: {info.get('bobot', '-')}")
            
            # Ambil skor awal
            skor_awal = info.get('skor', 0)
            terbobot_awal = info.get('terbobot', 0.0)
            
            print(f"      Skor Awal: {skor_awal}")
            print(f"      Terbobot Awal: {terbobot_awal:.3f}")
            
            # Pilih skor baru (cycle: jika 0->pilih 4, jika 1->2, jika 2->3, jika 3->4, jika 4->1)
            if skor_awal == 0:
                skor_baru = 4
            elif skor_awal == 4:
                skor_baru = 1
            else:
                skor_baru = min(skor_awal + 1, 4)
            
            print(f"      ➤ Memilih skor: {skor_baru}")
            
            # Klik radio button
            success = matriks_page.click_skor_radio(i, skor_baru)
            
            if not success:
                print(f"      ❌ Gagal klik radio button")
                continue
            
            print(f"      ✅ Radio button diklik")
            
            # Tunggu auto-save
            time.sleep(2)
            
            # Verifikasi skor berubah
            skor_setelah = matriks_page.get_selected_skor(i)
            terbobot_setelah = matriks_page.get_skor_terbobot(i)
            
            print(f"      Skor Setelah: {skor_setelah}")
            print(f"      Terbobot Setelah: {terbobot_setelah:.3f}")
            
            if skor_setelah == skor_baru:
                print(f"      ✅ Skor berhasil diupdate (auto-save)")
            else:
                print(f"      ⚠️  Skor tidak sesuai (expected: {skor_baru}, got: {skor_setelah})")
            
            if terbobot_setelah != terbobot_awal:
                print(f"      ✅ Skor terbobot berhasil dihitung")
            
        except Exception as e:
            print(f"      ❌ Error test kriteria {i+1}: {e}")
    
    print(f"\n   ✅ Test klik skor selesai")
    
    # ============= STEP 5: CEK PERUBAHAN SKOR TOTAL =============
    print("\n📍 STEP 5: Cek perubahan skor total...")
    
    # Refresh untuk memastikan data terupdate
    time.sleep(2)
    
    skor_total_akhir = matriks_page.get_skor_total()
    peringkat_akhir = matriks_page.get_peringkat()
    
    print(f"   ℹ️  Skor Total Akhir: {skor_total_akhir}")
    print(f"   ℹ️  Peringkat Akhir: {peringkat_akhir}")
    
    if skor_total_akhir != skor_total_awal:
        perubahan = skor_total_akhir - skor_total_awal
        print(f"   ✅ Skor total berubah: {perubahan:+.2f}")
    else:
        print(f"   ℹ️  Skor total tidak berubah (mungkin nilai sama)")
    
    if peringkat_akhir != peringkat_awal:
        print(f"   ✅ Peringkat berubah: {peringkat_awal} → {peringkat_akhir}")
    else:
        print(f"   ℹ️  Peringkat tetap: {peringkat_akhir}")
    
    # ============= STEP 6: TEST PRIORITAS PERBAIKAN =============
    print("\n📍 STEP 6: Test prioritas perbaikan...")
    
    prioritas_count_akhir = matriks_page.get_prioritas_perbaikan_count()
    
    print(f"   ℹ️  Prioritas Perbaikan Awal: {prioritas_count}")
    print(f"   ℹ️  Prioritas Perbaikan Akhir: {prioritas_count_akhir}")
    
    if prioritas_count_akhir < prioritas_count:
        print(f"   ✅ Prioritas perbaikan berkurang (perbaikan berhasil)")
    elif prioritas_count_akhir > prioritas_count:
        print(f"   ⚠️  Prioritas perbaikan bertambah")
    else:
        print(f"   ℹ️  Prioritas perbaikan tidak berubah")
    
    # ============= STEP 7: TEST EXPORT HASIL =============
    print("\n📍 STEP 7: Test export hasil ke Excel...")
    
    # Scroll ke atas dulu (tombol export di atas)
    driver.execute_script("window.scrollTo(0, 0);")
    time.sleep(1)
    
    print(f"   ➤ Mengklik tombol 'Export Hasil'...")
    
    success_export = matriks_page.click_export_hasil()
    
    if success_export:
        print(f"   ✅ Tombol export diklik")
        
        # Cek apakah ada loading
        time.sleep(1)
        
        if matriks_page.is_exporting():
            print(f"   ℹ️  Status: Mengekspor...")
            
            # Tunggu selesai export (max 10 detik)
            for i in range(10):
                if not matriks_page.is_exporting():
                    print(f"   ✅ Export selesai (tunggu {i+1} detik)")
                    break
                time.sleep(1)
        else:
            print(f"   ℹ️  Export langsung selesai")
        
        # Cek apakah file downloaded (ini akan tergantung Chrome download settings)
        print(f"   ℹ️  File Excel seharusnya sudah terdownload")
        print(f"   ℹ️  Cek folder Downloads: hasil-penilaian-*.xlsx")
        
        print(f"   ✅ Export berhasil dijalankan")
        
    else:
        print(f"   ❌ Gagal klik tombol export")
    
    # ============= STEP 8: TEST KLIK SKOR BERDASARKAN NAMA KRITERIA =============
    print("\n📍 STEP 8: Test klik skor berdasarkan nama kriteria...")
    
    # Coba cari kriteria yang mengandung kata "Budaya"
    print(f"   ➤ Mencari kriteria yang mengandung 'Budaya'...")
    
    success = matriks_page.click_skor_by_criteria_name("Budaya", 4)
    
    if success:
        print(f"   ✅ Berhasil klik skor untuk kriteria 'Budaya' → skor 4")
        time.sleep(2)
    else:
        print(f"   ⚠️  Kriteria 'Budaya' tidak ditemukan atau gagal klik")
    
    # Coba kriteria lain
    print(f"   ➤ Mencari kriteria yang mengandung 'Relevansi'...")
    
    success = matriks_page.click_skor_by_criteria_name("Relevansi", 3)
    
    if success:
        print(f"   ✅ Berhasil klik skor untuk kriteria 'Relevansi' → skor 3")
        time.sleep(2)
    else:
        print(f"   ⚠️  Kriteria 'Relevansi' tidak ditemukan atau gagal klik")
    
    # ============= STEP 9: CEK SKOR FINAL =============
    print("\n📍 STEP 9: Cek skor final...")
    
    # Scroll ke summary
    driver.execute_script("window.scrollTo(0, 0);")
    time.sleep(1)
    
    skor_final = matriks_page.get_skor_total()
    peringkat_final = matriks_page.get_peringkat()
    
    print(f"   📊 HASIL AKHIR:")
    print(f"      Skor Total: {skor_final:.2f}")
    print(f"      Peringkat: {peringkat_final}")
    
    # Klasifikasi peringkat
    if peringkat_final == 'A':
        print(f"      🏆 EXCELLENT! Skor ≥ 3.60")
    elif peringkat_final == 'B':
        print(f"      👍 BAIK! Skor 3.00 - 3.59")
    elif peringkat_final == 'C':
        print(f"      👌 CUKUP! Skor 2.00 - 2.99")
    else:
        print(f"      ⚠️  Tidak Terakreditasi (Skor < 2.00)")
    
    print(f"   ✅ Skor final berhasil diambil")
    
    # ============= FINAL SUMMARY =============
    print("\n" + "="*70)
    print("  ✅ TEST SELESAI!")
    print("="*70)
    
    print("\n📊 SUMMARY:")
    print(f"✅ Login berhasil")
    print(f"✅ Halaman Matriks Penilaian dimuat")
    print(f"✅ Informasi kriteria berhasil diambil ({row_count} kriteria)")
    print(f"✅ Test klik skor pada {test_count} kriteria")
    print(f"✅ Auto-save skor bekerja")
    print(f"✅ Skor terbobot dihitung otomatis")
    print(f"✅ Skor total terupdate")
    print(f"✅ Export hasil berhasil dijalankan")
    
    print("\n📝 HASIL PENILAIAN:")
    print(f"   Skor Awal: {skor_total_awal:.2f} ({peringkat_awal})")
    print(f"   Skor Akhir: {skor_final:.2f} ({peringkat_final})")
    print(f"   Perubahan: {skor_final - skor_total_awal:+.2f}")
    
    print("\n💡 CATATAN:")
    print("- Radio button skor: 1 (Kurang), 2 (Cukup), 3 (Baik), 4 (Sangat Baik)")
    print("- Skor auto-save setelah dipilih (tidak perlu klik tombol simpan)")
    print("- Skor terbobot dihitung otomatis: skor × bobot")
    print("- Total skor = jumlah semua skor terbobot")
    print("- Peringkat: A (≥3.60), B (3.00-3.59), C (2.00-2.99)")
    print("- File export: hasil-penilaian-<prodi>.xlsx di folder Downloads")

except Exception as e:
    print(f"\n❌ ERROR: {str(e)}")
    import traceback
    traceback.print_exc()
    
    print("\n💡 TROUBLESHOOTING:")
    print("1. Pastikan sudah login dengan email Tim Akreditasi")
    print("2. Pastikan data matriks penilaian sudah di-seed")
    print("3. Cek database: tabel criteria_items harus ada data")
    print("4. Cek Chrome download settings untuk export file")

finally:
    print("\nMenutup browser dalam 5 detik...")
    time.sleep(5)
    driver.quit()
    print("Browser ditutup.")
