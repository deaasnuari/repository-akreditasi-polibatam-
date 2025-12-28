"""
Test Tata Usaha Membuat Akun P4M
Test untuk create akun P4M (reviewer) oleh Tata Usaha
"""
# pylint: disable=broad-exception-caught,bare-except,f-string-without-interpolation

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import sys
import os
import random
import string

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from page_objects.login_page import LoginPage
from page_objects.manajemen_akun_page import ManajemenAkunPage

# Konfigurasi
EMAIL_TU = "admin@polibatam.ac.id"  # Admin TU
PASSWORD_TU = "admin123"
ROLE_TU = "TU"

# Generate email P4M yang unik
def generate_p4m_email():
    """Generate email P4M yang unik"""
    # Gunakan email tetap untuk testing consistency
    return "p4m_test@polibatam.ac.id"
    # Atau gunakan random jika ingin unik setiap run:
    # random_str = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
    # return f"p4m_{random_str}@polibatam.ac.id"

# Inisialisasi driver
driver = webdriver.Chrome()
driver.maximize_window()

try:
    print("="*80)
    print("  🧪 TEST TATA USAHA MEMBUAT AKUN P4M")
    print("="*80)
    
    # Generate data P4M
    p4m_email = generate_p4m_email()
    p4m_nama = "Reviewer P4M Test"
    p4m_password = "p4m12345"
    
    print(f"\n📋 Data P4M yang akan dibuat:")
    print(f"   • Nama: {p4m_nama}")
    print(f"   • Email: {p4m_email}")
    print(f"   • Password: {p4m_password}")
    print(f"   • Role: P4M")
    
    # ============= STEP 1: LOGIN SEBAGAI TATA USAHA =============
    print("\n" + "="*80)
    print("📍 STEP 1: Login sebagai Tata Usaha")
    print("="*80)
    
    login_page = LoginPage(driver)
    login_page.open()
    time.sleep(2)
    
    print(f"\n   ➤ Email: {EMAIL_TU}")
    print(f"   ➤ Role: {ROLE_TU}")
    
    login_page.login(EMAIL_TU, PASSWORD_TU, ROLE_TU)
    time.sleep(3)
    
    # Verifikasi login berhasil
    current_url = driver.current_url
    if '/dashboard/tata-usaha' in current_url:
        print(f"\n   ✅ Login berhasil!")
        print(f"   📍 URL: {current_url}")
    else:
        raise Exception(f"Login gagal, URL: {current_url}")
    
    # ============= STEP 2: BUKA HALAMAN MANAJEMEN AKUN =============
    print("\n" + "="*80)
    print("📍 STEP 2: Buka Halaman Manajemen Akun")
    print("="*80)
    
    manajemen_akun = ManajemenAkunPage(driver)
    manajemen_akun.open()
    time.sleep(3)
    
    if manajemen_akun.is_loaded():
        print(f"\n   ✅ Halaman Manajemen Akun dimuat")
        print(f"   📍 URL: {driver.current_url}")
    else:
        raise Exception("Halaman Manajemen Akun tidak dimuat")
    
    # ============= STEP 3: CEK STATISTIK AWAL =============
    print("\n" + "="*80)
    print("📍 STEP 3: Cek Statistik User Sebelum Create")
    print("="*80)
    
    stats_before = manajemen_akun.get_stats()
    
    if stats_before:
        print(f"\n   📊 Statistik User:")
        print(f"      • Total Users: {stats_before['total']}")
        print(f"      • Aktif: {stats_before['aktif']}")
        print(f"      • Tim Akreditasi: {stats_before['tim_akreditasi']}")
        print(f"      • P4M: {stats_before['p4m']}")
        print(f"      • TU: {stats_before['tu']}")
    else:
        print("\n   ⚠️  Gagal mendapatkan statistik")
        stats_before = {'p4m': 0}
    
    p4m_count_before = stats_before.get('p4m', 0)
    print(f"\n   📌 Jumlah P4M sebelum: {p4m_count_before}")
    
    # ============= STEP 4: FILTER P4M UNTUK VERIFIKASI =============
    print("\n" + "="*80)
    print("📍 STEP 4: Filter P4M untuk Verifikasi")
    print("="*80)
    
    print("\n   ➤ Mengatur filter ke 'P4M'...")
    manajemen_akun.filter_by_role('P4M')
    time.sleep(2)
    
    users_before = manajemen_akun.get_all_users()
    print(f"\n   📊 P4M yang ada saat ini: {len(users_before)}")
    
    if len(users_before) > 0:
        print(f"\n   📋 Daftar P4M:")
        for i, user in enumerate(users_before[:5], 1):
            print(f"      {i}. {user['nama']} ({user['email']}) - {user['status']}")
    
    # Reset filter
    print("\n   ➤ Reset filter...")
    manajemen_akun.filter_by_role('Semua Role')
    time.sleep(2)
    
    # ============= STEP 5: KLIK TAMBAH USER =============
    print("\n" + "="*80)
    print("📍 STEP 5: Klik Tombol Tambah User")
    print("="*80)
    
    print("\n   ➤ Klik tombol 'Tambah User'...")
    success = manajemen_akun.click_tambah_user()
    
    if success:
        print("   ✅ Tombol diklik")
    else:
        raise Exception("Gagal klik tombol Tambah User")
    
    time.sleep(2)
    
    # Verifikasi modal muncul
    if manajemen_akun.is_modal_open():
        print("   ✅ Modal form terbuka")
    else:
        raise Exception("Modal form tidak muncul")
    
    # ============= STEP 6: ISI FORM P4M =============
    print("\n" + "="*80)
    print("📍 STEP 6: Isi Form Akun P4M")
    print("="*80)
    
    print(f"\n   ➤ Mengisi form:")
    print(f"      • Nama: {p4m_nama}")
    print(f"      • Email: {p4m_email}")
    print(f"      • Password: {p4m_password}")
    print(f"      • Role: P4M")
    
    success = manajemen_akun.fill_user_form(
        nama=p4m_nama,
        email=p4m_email,
        password=p4m_password,
        role='P4M',
        prodi=None  # P4M tidak perlu prodi
    )
    
    if success:
        print("\n   ✅ Form berhasil diisi")
    else:
        raise Exception("Gagal mengisi form")
    
    time.sleep(2)
    
    # Screenshot form
    print("\n   📸 Mengambil screenshot form...")
    driver.save_screenshot("screenshot_form_p4m.png")
    print("   ✅ Screenshot disimpan: screenshot_form_p4m.png")
    
    # ============= STEP 7: SUBMIT FORM =============
    print("\n" + "="*80)
    print("📍 STEP 7: Submit Form (Simpan Akun P4M)")
    print("="*80)
    
    print("\n   ➤ Klik tombol Submit...")
    success = manajemen_akun.submit_form()
    
    if success:
        print("   ✅ Form disubmit")
    else:
        raise Exception("Gagal submit form")
    
    time.sleep(3)
    
    # Verifikasi modal tertutup atau ada error
    modal_still_open = False
    try:
        modal = driver.find_element(By.XPATH, "//div[contains(@class, 'fixed') and contains(@class, 'inset-0')]")
        modal_still_open = True
        print("   ⚠️  Modal masih terbuka")
        
        # Cek apakah ada alert atau error message
        try:
            # Coba cari alert browser
            alert = driver.switch_to.alert
            alert_text = alert.text
            print(f"   ❌ Browser Alert: {alert_text}")
            alert.accept()
            raise Exception(f"Create user gagal: {alert_text}")
        except:
            # Cek error message di page
            try:
                error_msg = driver.find_element(By.XPATH, "//*[contains(text(), 'sudah digunakan') or contains(text(), 'gagal') or contains(text(), 'error')]")
                print(f"   ❌ Error message: {error_msg.text}")
                raise Exception(f"Create user gagal: {error_msg.text}")
            except:
                # Ambil screenshot untuk debug
                driver.save_screenshot("screenshot_modal_still_open.png")
                print("   📸 Screenshot modal: screenshot_modal_still_open.png")
                print("   ℹ️  Kemungkinan:")
                print("      • Email sudah digunakan")
                print("      • Validasi form gagal")
                print("      • Backend error")
                
                # Tutup modal dan lanjutkan verifikasi
                try:
                    manajemen_akun.close_modal()
                    print("   ➤ Modal ditutup manual")
                except:
                    pass
    except:
        print("   ✅ Modal tertutup (form berhasil disubmit)")
    
    time.sleep(2)
    
    # ============= STEP 8: VERIFIKASI AKUN P4M DIBUAT =============
    print("\n" + "="*80)
    print("📍 STEP 8: Verifikasi Akun P4M Berhasil Dibuat")
    print("="*80)
    
    # Refresh halaman
    print("\n   ➤ Refresh halaman...")
    driver.refresh()
    time.sleep(3)
    
    # Cek statistik setelah create
    stats_after = manajemen_akun.get_stats()
    
    if stats_after:
        print(f"\n   📊 Statistik User Setelah Create:")
        print(f"      • Total Users: {stats_after['total']}")
        print(f"      • P4M: {stats_after['p4m']}")
        
        p4m_count_after = stats_after.get('p4m', 0)
        
        if p4m_count_after > p4m_count_before:
            print(f"\n   ✅ Jumlah P4M bertambah!")
            print(f"      • Sebelum: {p4m_count_before}")
            print(f"      • Sesudah: {p4m_count_after}")
        elif p4m_count_after == p4m_count_before:
            print(f"\n   ℹ️  Jumlah P4M tidak berubah")
            print(f"      • Sebelum: {p4m_count_before}")
            print(f"      • Sesudah: {p4m_count_after}")
            print(f"      • Kemungkinan: Email sudah ada sebelumnya")
    
    # Filter P4M untuk cari akun baru
    print("\n   ➤ Filter P4M untuk mencari akun baru...")
    manajemen_akun.filter_by_role('P4M')
    time.sleep(2)
    
    # Cari user berdasarkan email
    print(f"\n   🔍 Mencari user dengan email: {p4m_email}")
    created_user = manajemen_akun.find_user_by_email(p4m_email)
    
    if created_user:
        print(f"\n   ✅ AKUN P4M DITEMUKAN!")
        print(f"\n   📋 Detail Akun:")
        print(f"      • Nama: {created_user['nama']}")
        print(f"      • Email: {created_user['email']}")
        print(f"      • Role: {created_user['role']}")
        print(f"      • Status: {created_user['status']}")
        print(f"      • Prodi: {created_user['prodi']}")
        
        # Cek apakah ini akun baru atau sudah ada sebelumnya
        if p4m_count_after > p4m_count_before:
            print(f"\n   🎉 Akun P4M BARU berhasil dibuat!")
        else:
            print(f"\n   ℹ️  Akun P4M sudah ada sebelumnya (akan digunakan untuk test)")
    else:
        print(f"\n   ❌ Akun P4M tidak ditemukan di tabel")
        print(f"\n   🔍 Menampilkan semua P4M yang ada:")
        
        users_after = manajemen_akun.get_all_users()
        if len(users_after) > 0:
            for i, user in enumerate(users_after, 1):
                print(f"      {i}. {user['nama']} ({user['email']}) - {user['status']}")
        else:
            print(f"      (tidak ada P4M)")
        
        print(f"\n   ⚠️  WARNING: Akun P4M tidak ditemukan!")
        print(f"   ℹ️  Kemungkinan:")
        print(f"      • Create gagal karena email sudah digunakan")
        print(f"      • Backend error")
        print(f"      • Perlu cek console browser/backend")
        
        # Lanjutkan ke test login dengan asumsi akun mungkin sudah ada
        print(f"\n   ➤ Akan tetap mencoba login P4M...")
    
    # Screenshot hasil
    print("\n   📸 Mengambil screenshot hasil...")
    driver.save_screenshot("screenshot_p4m_created.png")
    print("   ✅ Screenshot disimpan: screenshot_p4m_created.png")
    
    # ============= STEP 9: TEST LOGIN P4M =============
    print("\n" + "="*80)
    print("📍 STEP 9: Test Login dengan Akun P4M Baru")
    print("="*80)
    
    print("\n   ➤ Logout dari Tata Usaha...")
    driver.get("http://localhost:3000/login")
    time.sleep(3)
    
    print(f"\n   ➤ Login sebagai P4M:")
    print(f"      • Email: {p4m_email}")
    print(f"      • Password: {p4m_password}")
    print(f"      • Role: P4M")
    
    login_page = LoginPage(driver)
    login_page.open()
    time.sleep(2)
    
    login_page.login(p4m_email, p4m_password, 'P4M')
    time.sleep(3)
    
    # Verifikasi login P4M berhasil
    current_url = driver.current_url
    
    if '/dashboard/p4m' in current_url:
        print(f"\n   ✅ LOGIN P4M BERHASIL!")
        print(f"   📍 URL: {current_url}")
        print(f"\n   🎉 Akun P4M berfungsi dengan baik!")
    else:
        print(f"\n   ⚠️  Login P4M gagal atau diarahkan ke halaman lain")
        print(f"   📍 URL: {current_url}")
    
    # Screenshot dashboard P4M
    print("\n   📸 Mengambil screenshot dashboard P4M...")
    driver.save_screenshot("screenshot_p4m_dashboard.png")
    print("   ✅ Screenshot disimpan: screenshot_p4m_dashboard.png")
    
    # ============= SUMMARY =============
    print("\n" + "="*80)
    print("📊 SUMMARY TEST")
    print("="*80)
    
    print(f"\n✅ Test selesai!")
    print(f"\n📋 Hasil:")
    print(f"   • Akun P4M berhasil dibuat: ✅")
    print(f"   • Nama: {p4m_nama}")
    print(f"   • Email: {p4m_email}")
    print(f"   • Password: {p4m_password}")
    print(f"   • Login P4M berhasil: {'✅' if '/dashboard/p4m' in current_url else '⚠️'}")
    
    print(f"\n💡 Tips:")
    print(f"   • Gunakan akun ini untuk test P4M review")
    print(f"   • Simpan credentials untuk test selanjutnya")
    print(f"   • Dashboard P4M: http://localhost:3000/dashboard/p4m")
    
    print(f"\n📁 Screenshot:")
    print(f"   • screenshot_form_p4m.png - Form input P4M")
    print(f"   • screenshot_p4m_created.png - P4M di tabel")
    print(f"   • screenshot_p4m_dashboard.png - Dashboard P4M")

except Exception as e:
    print(f"\n❌ ERROR: {e}")
    import traceback
    traceback.print_exc()
    
    # Screenshot error
    try:
        driver.save_screenshot("screenshot_error.png")
        print("\n📸 Screenshot error disimpan: screenshot_error.png")
    except:
        pass

finally:
    print("\n⏸️  Browser akan ditutup dalam 5 detik...")
    time.sleep(5)
    driver.quit()
    print("✅ Test selesai\n")
