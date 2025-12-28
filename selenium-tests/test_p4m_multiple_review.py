"""
Test P4M - Review Multiple Dokumen Sekaligus
Test untuk menguji P4M review beberapa dokumen berturut-turut
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
from page_objects.p4m_dashboard_page import P4MDashboardPage, P4MReviewLKPSPage, P4MReviewLEDPage

# Konfigurasi
EMAIL_P4M = "p4m_test@polibatam.ac.id"
PASSWORD_P4M = "p4m12345"
ROLE = "P4M"

# Jumlah dokumen yang akan direview
JUMLAH_REVIEW = 3

# Inisialisasi driver
driver = webdriver.Chrome()
driver.maximize_window()

try:
    print("="*80)
    print("  🧪 TEST P4M - REVIEW MULTIPLE DOKUMEN")
    print("="*80)
    
    print(f"\n📋 Konfigurasi:")
    print(f"   • Email: {EMAIL_P4M}")
    print(f"   • Target review: {JUMLAH_REVIEW} dokumen")
    
    # ============= STEP 1: LOGIN =============
    print("\n" + "="*80)
    print("📍 STEP 1: Login sebagai P4M")
    print("="*80)
    
    login_page = LoginPage(driver)
    login_page.open()
    time.sleep(2)
    
    login_page.login(EMAIL_P4M, PASSWORD_P4M, ROLE)
    time.sleep(3)
    
    if '/dashboard/p4m' in driver.current_url:
        print(f"\n   ✅ Login berhasil!")
    else:
        raise Exception("Login gagal")
    
    # ============= STEP 2: CEK DOKUMEN TERSEDIA =============
    print("\n" + "="*80)
    print("📍 STEP 2: Cek Dokumen yang Perlu Direview")
    print("="*80)
    
    dashboard = P4MDashboardPage(driver)
    
    stats = dashboard.get_stats()
    if stats:
        print(f"\n   📊 Statistik:")
        print(f"      • Total Dokumen: {stats.get('total', 0)}")
        print(f"      • Menunggu Review: {stats.get('menunggu', 0)}")
    
    # Filter dokumen yang menunggu
    print(f"\n   ➤ Filter dokumen 'Menunggu Review'...")
    dashboard.filter_by_status('Menunggu')
    time.sleep(2)
    
    items_menunggu = dashboard.get_all_items()
    print(f"\n   📋 Dokumen Menunggu: {len(items_menunggu)}")
    
    if not items_menunggu:
        print(f"\n   ⚠️  Tidak ada dokumen yang perlu direview")
        print(f"   💡 Tips: Submit dokumen dari Tim Akreditasi terlebih dahulu")
        
        # Coba semua dokumen
        print(f"\n   ➤ Mencoba review dokumen dengan status apapun...")
        dashboard.filter_by_status('Semua')
        time.sleep(2)
        items_menunggu = dashboard.get_all_items()
        print(f"   📋 Total dokumen tersedia: {len(items_menunggu)}")
    
    if not items_menunggu:
        raise Exception("Tidak ada dokumen untuk direview")
    
    # Batasi jumlah review
    items_to_review = items_menunggu[:JUMLAH_REVIEW]
    print(f"\n   ✅ Akan review {len(items_to_review)} dokumen")
    
    # Tampilkan daftar
    print(f"\n   📄 Daftar dokumen:")
    for i, item in enumerate(items_to_review, 1):
        print(f"      {i}. {item.get('title', 'N/A')[:60]}")
        print(f"         Kategori: {item.get('kategori', 'N/A')} | Status: {item.get('status', 'N/A')}")
    
    # ============= STEP 3-N: REVIEW DOKUMEN =============
    review_results = []
    
    for idx, item in enumerate(items_to_review, 1):
        step_num = idx + 2
        
        print("\n" + "="*80)
        print(f"📍 STEP {step_num}: Review Dokumen #{idx}")
        print("="*80)
        
        title = item.get('title', 'N/A')
        kategori = item.get('kategori', 'LKPS')  # Default LKPS
        
        print(f"\n   📄 Dokumen: {title[:60]}")
        print(f"   📁 Kategori: {kategori}")
        
        try:
            # Klik tombol review
            print(f"\n   ➤ Buka halaman review...")
            
            # Kembali ke dashboard dulu (jika belum)
            if '/review' in driver.current_url:
                dashboard.open()
                time.sleep(2)
                dashboard.filter_by_status('Menunggu')
                time.sleep(1)
            
            # Klik review item
            if dashboard.click_review_item(0):  # Selalu klik item pertama karena list berkurang
                print(f"   ✅ Halaman review terbuka")
                time.sleep(3)
                
                # Tentukan page object berdasarkan kategori
                if 'led' in kategori.lower():
                    review_page = P4MReviewLEDPage(driver)
                else:
                    review_page = P4MReviewLKPSPage(driver)
                
                if review_page.is_loaded():
                    print(f"   ✅ Review page dimuat")
                    
                    # Input review
                    catatan = f"Review dokumen #{idx}. Dokumen telah diperiksa dan memenuhi standar."
                    
                    # Alternating status: Diterima, Perlu Revisi, Diterima, ...
                    if idx % 2 == 1:
                        status = "Diterima"
                    else:
                        status = "Perlu Revisi"
                        catatan += " Namun perlu beberapa perbaikan minor."
                    
                    print(f"\n   ➤ Input review...")
                    print(f"   📝 Status: {status}")
                    
                    review_page.input_catatan(catatan)
                    review_page.select_status(status)
                    
                    time.sleep(1)
                    
                    # Screenshot
                    screenshot = f"screenshot_review_{idx}.png"
                    driver.save_screenshot(screenshot)
                    print(f"   📸 Screenshot: {screenshot}")
                    
                    # Submit
                    print(f"\n   ➤ Submit review...")
                    if review_page.submit_review():
                        print(f"   ✅ Review #{idx} berhasil disubmit!")
                        
                        review_results.append({
                            'index': idx,
                            'title': title,
                            'status': status,
                            'success': True
                        })
                        
                        time.sleep(2)
                    else:
                        print(f"   ⚠️  Submit gagal")
                        review_results.append({
                            'index': idx,
                            'title': title,
                            'status': status,
                            'success': False
                        })
                else:
                    print(f"   ⚠️  Review page tidak dimuat")
                    review_results.append({
                        'index': idx,
                        'title': title,
                        'success': False
                    })
            else:
                print(f"   ⚠️  Gagal klik tombol review")
                review_results.append({
                    'index': idx,
                    'title': title,
                    'success': False
                })
        
        except Exception as e:
            print(f"   ❌ Error review dokumen #{idx}: {str(e)[:50]}")
            review_results.append({
                'index': idx,
                'title': title,
                'success': False,
                'error': str(e)[:50]
            })
        
        # Jeda antar review
        if idx < len(items_to_review):
            print(f"\n   ⏳ Jeda 2 detik sebelum review berikutnya...")
            time.sleep(2)
    
    # ============= STEP FINAL: VERIFIKASI DAN RINGKASAN =============
    final_step = len(items_to_review) + 3
    
    print("\n" + "="*80)
    print(f"📍 STEP {final_step}: Verifikasi dan Ringkasan")
    print("="*80)
    
    # Kembali ke dashboard
    dashboard.open()
    time.sleep(2)
    
    # Cek statistik final
    stats_final = dashboard.get_stats()
    if stats_final:
        print(f"\n   📊 Statistik Final:")
        print(f"      • Total Dokumen: {stats_final.get('total', 0)}")
        print(f"      • Menunggu Review: {stats_final.get('menunggu', 0)}")
        print(f"      • Diterima: {stats_final.get('diterima', 0)}")
        print(f"      • Perlu Revisi: {stats_final.get('perlu_revisi', 0)}")
        
        # Bandingkan
        if stats:
            print(f"\n   📈 Perubahan:")
            delta_menunggu = stats_final.get('menunggu', 0) - stats.get('menunggu', 0)
            delta_diterima = stats_final.get('diterima', 0) - stats.get('diterima', 0)
            delta_revisi = stats_final.get('perlu_revisi', 0) - stats.get('perlu_revisi', 0)
            
            if delta_menunggu < 0:
                print(f"      ✅ Menunggu berkurang: {abs(delta_menunggu)}")
            if delta_diterima > 0:
                print(f"      ✅ Diterima bertambah: +{delta_diterima}")
            if delta_revisi > 0:
                print(f"      📝 Perlu Revisi bertambah: +{delta_revisi}")
    
    # Screenshot final
    driver.save_screenshot("screenshot_multiple_review_final.png")
    print(f"\n   📸 Screenshot final: screenshot_multiple_review_final.png")
    
    # Ringkasan hasil review
    print("\n" + "="*80)
    print("📊 RINGKASAN HASIL REVIEW")
    print("="*80)
    
    success_count = sum(1 for r in review_results if r.get('success'))
    failed_count = len(review_results) - success_count
    
    print(f"\n   📈 Total Review: {len(review_results)}")
    print(f"   ✅ Berhasil: {success_count}")
    print(f"   ❌ Gagal: {failed_count}")
    
    print(f"\n   📋 Detail Review:")
    for result in review_results:
        status_icon = "✅" if result.get('success') else "❌"
        title = result.get('title', 'N/A')[:50]
        review_status = result.get('status', 'N/A')
        
        print(f"      {status_icon} #{result['index']}. {title}")
        if result.get('success'):
            print(f"         Status: {review_status}")
        else:
            error = result.get('error', 'Unknown error')
            print(f"         Error: {error}")
    
    print("\n" + "="*80)
    print("✅ TEST REVIEW MULTIPLE DOKUMEN SELESAI")
    print("="*80)
    
    print(f"\n⏸️  Browser akan ditutup dalam 5 detik...")
    time.sleep(5)

except Exception as e:
    print(f"\n❌ ERROR: {e}")
    import traceback
    traceback.print_exc()
    
    driver.save_screenshot("screenshot_error_multiple.png")
    print(f"\n📸 Screenshot error: screenshot_error_multiple.png")
    
    print(f"\n⏸️  Browser akan ditutup dalam 5 detik...")
    time.sleep(5)

finally:
    driver.quit()
    print("✅ Test selesai")
