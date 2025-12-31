"""
Test CRUD LKPS - Versi Unittest
Test Create, Read, Update, Delete untuk data LKPS
"""

import unittest
from selenium import webdriver
from selenium.webdriver.support.ui import Select
import time
import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from page_objects.login_page import LoginPage
from page_objects.lkps_page import LKPSPage


class TestLKPSCRUD(unittest.TestCase):
    """Test CRUD operations untuk LKPS"""
    
    # Kredensial
    EMAIL = "test_5hnkxvpw@polibatam.ac.id"  # GANTI dengan email Tim Akreditasi
    PASSWORD = "test12345"
    ROLE = "Tim Akreditasi"
    
    @classmethod
    def setUpClass(cls):
        """Setup yang dijalankan sekali sebelum semua test"""
        cls.driver = webdriver.Chrome()
        cls.driver.maximize_window()
        
        # Login
        login_page = LoginPage(cls.driver)
        login_page.open()
        login_page.login(cls.EMAIL, cls.PASSWORD, cls.ROLE)
        time.sleep(2)
        
        # Initialize LKPS page
        cls.lkps_page = LKPSPage(cls.driver)
        cls.lkps_page.open()
        time.sleep(2)
    
    @classmethod
    def tearDownClass(cls):
        """Cleanup setelah semua test selesai"""
        print("\n⏳ Menutup browser dalam 5 detik...")
        time.sleep(5)
        cls.driver.quit()
    
    def setUp(self):
        """Setup sebelum setiap test"""
        # Refresh halaman untuk memastikan state bersih
        self.lkps_page.open()
        time.sleep(1)
    
    # ============================================================
    # TEST 01-03: Halaman & Navigation
    # ============================================================
    
    def test_01_page_loads(self):
        """Test: Halaman LKPS dapat dimuat"""
        print("\n📍 Test 1: Memuat halaman LKPS...")
        
        self.assertTrue(self.lkps_page.is_loaded(), "Halaman LKPS gagal dimuat")
        
        heading = self.lkps_page.get_page_heading()
        self.assertIsNotNone(heading, "Heading tidak ditemukan")
        
        print(f"   ✅ Halaman LKPS dimuat: {heading}")
    
    def test_02_switch_tabs(self):
        """Test: Switch antar sub-tabs"""
        print("\n📍 Test 2: Switch antar sub-tabs...")
        
        tabs = ['tupoksi', 'pendanaan', 'penggunaan-dana', 'ewmp', 'ktk', 'spmi']
        
        for tab in tabs:
            result = self.lkps_page.switch_to_tab(tab)
            self.assertTrue(result, f"Gagal switch ke tab {tab}")
            
            is_active = self.lkps_page.is_tab_active(tab)
            self.assertTrue(is_active, f"Tab {tab} tidak aktif")
            
            print(f"   ✅ Tab '{tab}' aktif")
        
        print("   ✅ Semua tab dapat diakses")
    
    def test_03_table_visible(self):
        """Test: Tabel data terlihat"""
        print("\n📍 Test 3: Tabel data terlihat...")
        
        self.lkps_page.switch_to_tab('tupoksi')
        time.sleep(1)
        
        is_visible = self.lkps_page.is_table_visible()
        self.assertTrue(is_visible, "Tabel tidak terlihat")
        
        print("   ✅ Tabel data terlihat")
    
    # ============================================================
    # TEST 04-06: CREATE - Tambah Data
    # ============================================================
    
    def test_04_open_form(self):
        """Test: Buka form tambah data"""
        print("\n📍 Test 4: Buka form tambah data...")
        
        self.lkps_page.switch_to_tab('tupoksi')
        time.sleep(1)
        
        # Klik Tambah Data
        result = self.lkps_page.click_tambah_data()
        self.assertTrue(result, "Tombol Tambah Data tidak dapat diklik")
        
        # Cek form muncul
        is_visible = self.lkps_page.is_form_visible()
        self.assertTrue(is_visible, "Form tidak muncul")
        
        print("   ✅ Form tambah data muncul")
        
        # Tutup form
        self.lkps_page.click_batal()
        time.sleep(1)
    
    def test_05_create_tupoksi(self):
        """Test: Create data Tupoksi"""
        print("\n📍 Test 5: Create data Tupoksi...")
        
        self.lkps_page.switch_to_tab('tupoksi')
        time.sleep(1)
        
        # Ambil jumlah data awal
        initial_count = self.lkps_page.get_table_row_count()
        print(f"   ℹ️  Jumlah data awal: {initial_count}")
        
        # Klik Tambah Data
        self.lkps_page.click_tambah_data()
        time.sleep(1)
        
        # Isi form
        data = {
            'namaPimpinan': 'Dr. Test Selenium',
            'jabatan': 'Ketua Program Studi',
            'namaUnitKerja': 'Program Studi Teknik Informatika',
            'tugasPokok': 'Memimpin dan mengelola program studi',
            'fungsi': 'Pengelolaan akademik dan administrasi'
        }
        
        result = self.lkps_page.fill_tupoksi_form(data)
        self.assertTrue(result, "Gagal mengisi form")
        print("   ✅ Form berhasil diisi")
        
        # Simpan
        self.lkps_page.click_simpan()
        time.sleep(2)
        
        # Cek popup sukses
        is_success = self.lkps_page.is_success_popup_visible()
        self.assertTrue(is_success, "Popup sukses tidak muncul")
        print("   ✅ Data berhasil disimpan")
        
        # Tunggu popup hilang
        self.lkps_page.wait_for_popup_disappear()
        
        # Cek jumlah data bertambah
        new_count = self.lkps_page.get_table_row_count()
        print(f"   ℹ️  Jumlah data setelah create: {new_count}")
        
        self.assertEqual(new_count, initial_count + 1, "Jumlah data tidak bertambah")
        print("   ✅ Data Tupoksi berhasil ditambahkan")
    
    def test_06_create_pendanaan(self):
        """Test: Create data Pendanaan"""
        print("\n📍 Test 6: Create data Pendanaan...")
        
        self.lkps_page.switch_to_tab('pendanaan')
        time.sleep(1)
        
        # Ambil jumlah data awal
        initial_count = self.lkps_page.get_table_row_count()
        print(f"   ℹ️  Jumlah data awal: {initial_count}")
        
        # Klik Tambah Data
        self.lkps_page.click_tambah_data()
        time.sleep(1)
        
        # Isi form
        data = {
            'sumber': 'APBN',
            'jumlahTS2': '1000000000',
            'jumlahTS1': '1200000000',
            'jumlahTS': '1500000000'
        }
        
        result = self.lkps_page.fill_pendanaan_form(data)
        self.assertTrue(result, "Gagal mengisi form")
        print("   ✅ Form Pendanaan berhasil diisi")
        
        # Simpan
        self.lkps_page.click_simpan()
        time.sleep(2)
        
        # Cek popup sukses
        is_success = self.lkps_page.is_success_popup_visible()
        self.assertTrue(is_success, "Popup sukses tidak muncul")
        print("   ✅ Data Pendanaan berhasil disimpan")
        
        # Tunggu popup hilang
        self.lkps_page.wait_for_popup_disappear()
        
        # Cek jumlah data bertambah
        new_count = self.lkps_page.get_table_row_count()
        print(f"   ℹ️  Jumlah data setelah create: {new_count}")
        
        self.assertEqual(new_count, initial_count + 1, "Jumlah data tidak bertambah")
        print("   ✅ Data Pendanaan berhasil ditambahkan")
    
    # ============================================================
    # TEST 07-08: READ - Lihat & Cari Data
    # ============================================================
    
    def test_07_read_data(self):
        """Test: Read data dari tabel"""
        print("\n📍 Test 7: Read data dari tabel...")
        
        self.lkps_page.switch_to_tab('tupoksi')
        time.sleep(1)
        
        # Cek apakah ada data
        row_count = self.lkps_page.get_table_row_count()
        print(f"   ℹ️  Jumlah data: {row_count}")
        
        if row_count > 0:
            # Ambil data kolom pertama (nama pimpinan)
            nama = self.lkps_page.get_first_row_data(2)  # Kolom ke-2 (setelah No)
            self.assertIsNotNone(nama, "Gagal membaca data")
            
            print(f"   ✅ Data berhasil dibaca: {nama}")
        else:
            print("   ⚠️  Belum ada data untuk dibaca")
    
    def test_08_search_data(self):
        """Test: Search/filter data"""
        print("\n📍 Test 8: Search data...")
        
        self.lkps_page.switch_to_tab('tupoksi')
        time.sleep(1)
        
        # Cek jumlah data awal
        initial_count = self.lkps_page.get_table_row_count()
        
        if initial_count > 0:
            # Ambil nama dari baris pertama untuk dicari
            nama = self.lkps_page.get_first_row_data(2)
            
            if nama and nama != '-':
                # Search dengan nama tersebut
                self.lkps_page.search_data(nama)
                time.sleep(2)
                
                # Cek hasil search
                result_count = self.lkps_page.get_table_row_count()
                self.assertGreater(result_count, 0, "Search tidak menemukan data")
                
                print(f"   ✅ Search berhasil: {result_count} data ditemukan")
                
                # Clear search
                self.lkps_page.search_data('')
                time.sleep(2)
            else:
                print("   ⚠️  Data tidak valid untuk search")
        else:
            print("   ⚠️  Belum ada data untuk di-search")
    
    # ============================================================
    # TEST 09-10: UPDATE - Edit Data
    # ============================================================
    
    def test_09_open_edit_form(self):
        """Test: Buka form edit"""
        print("\n📍 Test 9: Buka form edit...")
        
        self.lkps_page.switch_to_tab('tupoksi')
        time.sleep(1)
        
        row_count = self.lkps_page.get_table_row_count()
        
        if row_count > 0:
            # Klik edit pada baris pertama
            result = self.lkps_page.click_edit_first_row()
            self.assertTrue(result, "Tombol Edit tidak dapat diklik")
            
            # Cek form muncul
            is_visible = self.lkps_page.is_form_visible()
            self.assertTrue(is_visible, "Form edit tidak muncul")
            
            print("   ✅ Form edit muncul")
            
            # Tutup form
            self.lkps_page.click_batal()
            time.sleep(1)
        else:
            print("   ⚠️  Tidak ada data untuk diedit")
            self.skipTest("Tidak ada data untuk test edit")
    
    def test_10_update_data(self):
        """Test: Update data existing"""
        print("\n📍 Test 10: Update data...")
        
        self.lkps_page.switch_to_tab('tupoksi')
        time.sleep(1)
        
        row_count = self.lkps_page.get_table_row_count()
        
        if row_count > 0:
            # Klik edit
            self.lkps_page.click_edit_first_row()
            time.sleep(1)
            
            # Update field
            new_jabatan = "Wakil Ketua Program Studi"
            result = self.lkps_page.update_form_field('jabatan', new_jabatan)
            self.assertTrue(result, "Gagal update field")
            print(f"   ✅ Field 'jabatan' diupdate: {new_jabatan}")
            
            # Simpan
            self.lkps_page.click_simpan()
            time.sleep(2)
            
            # Cek popup sukses
            is_success = self.lkps_page.is_success_popup_visible()
            self.assertTrue(is_success, "Popup sukses tidak muncul")
            print("   ✅ Data berhasil diupdate")
            
            # Tunggu popup hilang
            self.lkps_page.wait_for_popup_disappear()
        else:
            print("   ⚠️  Tidak ada data untuk diupdate")
            self.skipTest("Tidak ada data untuk test update")
    
    # ============================================================
    # TEST 11-12: DELETE - Hapus Data
    # ============================================================
    
    def test_11_open_delete_confirmation(self):
        """Test: Buka modal konfirmasi hapus"""
        print("\n📍 Test 11: Buka modal konfirmasi hapus...")
        
        self.lkps_page.switch_to_tab('tupoksi')
        time.sleep(1)
        
        row_count = self.lkps_page.get_table_row_count()
        
        if row_count > 0:
            # Klik delete
            result = self.lkps_page.click_delete_first_row()
            self.assertTrue(result, "Tombol Delete tidak dapat diklik")
            
            # Cek modal konfirmasi muncul
            is_visible = self.lkps_page.is_confirm_modal_visible()
            self.assertTrue(is_visible, "Modal konfirmasi tidak muncul")
            
            print("   ✅ Modal konfirmasi hapus muncul")
            
            # Klik Tidak (batal)
            self.lkps_page.click_confirm_no()
            time.sleep(1)
        else:
            print("   ⚠️  Tidak ada data untuk dihapus")
            self.skipTest("Tidak ada data untuk test delete")
    
    def test_12_delete_data(self):
        """Test: Hapus data"""
        print("\n📍 Test 12: Hapus data...")
        
        self.lkps_page.switch_to_tab('pendanaan')
        time.sleep(1)
        
        # Ambil jumlah data awal
        initial_count = self.lkps_page.get_table_row_count()
        print(f"   ℹ️  Jumlah data awal: {initial_count}")
        
        if initial_count > 0:
            # Klik delete
            self.lkps_page.click_delete_first_row()
            time.sleep(1)
            
            # Cek modal konfirmasi
            is_visible = self.lkps_page.is_confirm_modal_visible()
            self.assertTrue(is_visible, "Modal konfirmasi tidak muncul")
            
            # Klik Ya (konfirmasi hapus)
            self.lkps_page.click_confirm_yes()
            time.sleep(2)
            
            # Cek popup sukses
            is_success = self.lkps_page.is_success_popup_visible()
            self.assertTrue(is_success, "Popup sukses tidak muncul")
            print("   ✅ Data berhasil dihapus")
            
            # Tunggu popup hilang
            self.lkps_page.wait_for_popup_disappear()
            
            # Cek jumlah data berkurang
            new_count = self.lkps_page.get_table_row_count()
            print(f"   ℹ️  Jumlah data setelah delete: {new_count}")
            
            self.assertEqual(new_count, initial_count - 1, "Jumlah data tidak berkurang")
            print("   ✅ Data berhasil dihapus dari tabel")
        else:
            print("   ⚠️  Tidak ada data untuk dihapus")
            self.skipTest("Tidak ada data untuk test delete")


if __name__ == '__main__':
    print("="*70)
    print("  🧪 TEST CRUD LKPS")
    print("="*70)
    print("\n📝 CATATAN:")
    print("- Pastikan sudah login dengan akun Tim Akreditasi")
    print("- Update EMAIL di line 18 dengan email Tim Akreditasi yang valid")
    print("- Frontend dan backend harus running")
    print("\n" + "="*70)
    
    # Run tests
    unittest.main(verbosity=2)
