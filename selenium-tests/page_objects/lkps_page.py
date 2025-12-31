"""
Page Object untuk halaman LKPS Tim Akreditasi
CRUD operations untuk berbagai sub-tab (Tupoksi, Pendanaan, dll)
"""

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
from selenium.common.exceptions import TimeoutException, NoSuchElementException
import time


class LKPSPage:
    """Page Object untuk halaman LKPS dengan CRUD operations"""
    
    def __init__(self, driver):
        self.driver = driver
        self.base_url = "http://localhost:3000/dashboard/tim-akreditasi/lkps"
        self.wait = WebDriverWait(driver, 10)
    
    # ============================================================
    # LOCATORS
    # ============================================================
    # Navigation
    HEADING = (By.XPATH, "//h1[contains(text(), 'Laporan Kinerja Program Studi')]")
    
    # Sub Tabs
    TAB_TUPOKSI = (By.XPATH, "//button[contains(text(), 'Tupoksi')]")
    TAB_PENDANAAN = (By.XPATH, "//button[contains(text(), 'Pendanaan')]")
    TAB_PENGGUNAAN_DANA = (By.XPATH, "//button[contains(text(), 'Penggunaan Dana')]")
    TAB_EWMP = (By.XPATH, "//button[contains(text(), 'EWMP')]")
    TAB_KTK = (By.XPATH, "//button[contains(text(), 'KTK')]")
    TAB_SPMI = (By.XPATH, "//button[contains(text(), 'SPMI')]")
    
    # Buttons
    BTN_TAMBAH_DATA = (By.XPATH, "//button[contains(@class, 'bg-blue-700') and contains(., 'Tambah Data')]")
    BTN_SIMPAN = (By.XPATH, "//button[contains(text(), 'Simpan') and contains(@class, 'bg-blue-900')]")
    BTN_BATAL = (By.XPATH, "//button[contains(text(), 'Batal') and contains(@class, 'bg-red-500')]")
    BTN_SIMPAN_DRAFT = (By.XPATH, "//button[contains(text(), 'Simpan Draft')]")
    BTN_AJUKAN_REVIEW = (By.XPATH, "//button[contains(text(), 'Ajukan untuk Review')]")
    
    # Form Modal
    FORM_MODAL = (By.XPATH, "//div[contains(@class, 'fixed')]//div[contains(@class, 'bg-white')]")
    
    # Table
    TABLE = (By.XPATH, "//table")
    TABLE_ROWS = (By.XPATH, "//table/tbody/tr[not(contains(., 'Belum ada data'))]")
    NO_DATA_MESSAGE = (By.XPATH, "//td[contains(text(), 'Belum ada data')]")
    
    # Action Buttons in Table
    BTN_EDIT = (By.XPATH, "//button[@title='Edit']")
    BTN_DELETE = (By.XPATH, "//button[@title='Hapus']")
    BTN_VIEW_NOTES = (By.XPATH, "//button[@title='Lihat Catatan P4M']")
    
    # Confirmation Modal
    CONFIRM_MODAL = (By.XPATH, "//div[contains(@class, 'fixed')]//h3[contains(text(), 'Konfirmasi')]")
    BTN_CONFIRM_YA = (By.XPATH, "//button[contains(text(), 'Ya')]")
    BTN_CONFIRM_TIDAK = (By.XPATH, "//button[contains(text(), 'Tidak')]")
    
    # Success/Error Popup
    POPUP_MESSAGE = (By.XPATH, "//div[contains(@class, 'bg-green-50') or contains(@class, 'bg-red-50') or contains(@class, 'bg-blue-50')]")
    
    # Search
    SEARCH_INPUT = (By.XPATH, "//input[@placeholder='Cari data...']")
    
    # ============================================================
    # PAGE ACTIONS
    # ============================================================
    
    def open(self):
        """Buka halaman LKPS"""
        self.driver.get(self.base_url)
        time.sleep(2)
        return self
    
    def is_loaded(self):
        """Cek apakah halaman sudah dimuat"""
        try:
            # Cek URL terlebih dahulu
            if '/dashboard/tim-akreditasi/lkps' not in self.driver.current_url:
                return False
            
            # Tunggu heading muncul
            self.wait.until(EC.presence_of_element_located(self.HEADING))
            return True
        except TimeoutException:
            # Fallback: cek apakah minimal URL benar
            return '/dashboard/tim-akreditasi/lkps' in self.driver.current_url
        except Exception as e:
            print(f"Error checking page load: {e}")
            return False
    
    def get_page_heading(self):
        """Ambil heading halaman"""
        try:
            heading = self.wait.until(EC.presence_of_element_located(self.HEADING))
            return heading.text
        except:
            return None
    
    # ============================================================
    # SUB TAB NAVIGATION
    # ============================================================
    
    def switch_to_tab(self, tab_name):
        """
        Switch ke sub-tab tertentu
        tab_name: 'tupoksi', 'pendanaan', 'penggunaan-dana', 'ewmp', 'ktk', 'spmi'
        """
        # Map tab name ke display text (capitalized)
        tab_display_map = {
            'tupoksi': 'Tupoksi',
            'pendanaan': 'Pendanaan',
            'penggunaan-dana': 'Penggunaan Dana',
            'ewmp': 'Ewmp',
            'ktk': 'Ktk',
            'spmi': 'Spmi'
        }
        
        display_text = tab_display_map.get(tab_name.lower())
        if not display_text:
            raise ValueError(f"Tab tidak valid: {tab_name}")
        
        try:
            # Tunggu form/modal tertutup jika ada
            self.wait_for_form_close(timeout=2)
            
            # Scroll ke atas untuk akses tab
            self.driver.execute_script("window.scrollTo(0, 0);")
            time.sleep(0.5)
            
            # Cari button dengan text yang sesuai
            tab_button = self.wait.until(
                EC.element_to_be_clickable((By.XPATH, f"//button[contains(text(), '{display_text}')]"))
            )
            
            # Scroll ke tab button
            self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", tab_button)
            time.sleep(0.5)
            
            # Try click dengan ActionChains
            try:
                actions = ActionChains(self.driver)
                actions.move_to_element(tab_button).click().perform()
            except:
                # Fallback ke JS click
                self.driver.execute_script("arguments[0].click();", tab_button)
            
            time.sleep(1.5)
            return True
        except Exception as e:
            print(f"Error switching tab: {e}")
            return False
    
    def is_tab_active(self, tab_name):
        """Cek apakah tab sedang aktif"""
        tab_display_map = {
            'tupoksi': 'Tupoksi',
            'pendanaan': 'Pendanaan',
            'penggunaan-dana': 'Penggunaan Dana',
            'ewmp': 'Ewmp',
            'ktk': 'Ktk',
            'spmi': 'Spmi'
        }
        
        display_text = tab_display_map.get(tab_name.lower())
        if not display_text:
            return False
        
        try:
            tab_button = self.driver.find_element(By.XPATH, f"//button[contains(text(), '{display_text}')]")
            # Cek class untuk mengetahui apakah aktif (bg-[#183A64])
            return 'bg-[#183A64]' in tab_button.get_attribute('class') or \
                   '#183A64' in tab_button.get_attribute('class')
        except:
            return False
    
    # ============================================================
    # CREATE - Tambah Data
    # ============================================================
    
    def click_tambah_data(self):
        """Klik tombol Tambah Data"""
        try:
            # Wait hingga button muncul
            btn = self.wait.until(
                EC.presence_of_element_located(self.BTN_TAMBAH_DATA)
            )
            
            # Scroll ke button
            self.driver.execute_script("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", btn)
            time.sleep(1)
            
            # Wait hingga clickable
            btn = self.wait.until(
                EC.element_to_be_clickable(self.BTN_TAMBAH_DATA)
            )
            
            print("   ℹ️  Tombol 'Tambah Data' ditemukan, mencoba klik...")
            
            # Try 1: ActionChains click
            try:
                actions = ActionChains(self.driver)
                actions.move_to_element(btn).click().perform()
                time.sleep(1)
                
                # Check if form opened
                if self.is_form_visible():
                    return True
            except Exception as e:
                print(f"   ℹ️  ActionChains gagal: {e}")
            
            # Try 2: Regular click
            try:
                btn.click()
                time.sleep(1)
                
                if self.is_form_visible():
                    return True
            except Exception as e:
                print(f"   ℹ️  Regular click gagal: {e}")
            
            # Try 3: JavaScript click
            try:
                print("   ℹ️  Mencoba JavaScript click...")
                btn = self.driver.find_element(*self.BTN_TAMBAH_DATA)
                self.driver.execute_script("arguments[0].click();", btn)
                time.sleep(1.5)
                
                if self.is_form_visible():
                    return True
            except Exception as e:
                print(f"   ℹ️  JS click gagal: {e}")
            
            return False
            
        except Exception as e:
            print(f"   ❌ Error: {e}")
            return False
    
    def is_form_visible(self):
        """Cek apakah form modal terlihat"""
        try:
            self.wait.until(EC.presence_of_element_located(self.FORM_MODAL))
            return True
        except:
            return False
    
    def wait_for_form_close(self, timeout=5):
        """Tunggu form modal tertutup"""
        try:
            WebDriverWait(self.driver, timeout).until(
                EC.invisibility_of_element_located(self.FORM_MODAL)
            )
            return True
        except:
            return False
    
    def fill_form_field(self, field_name, value):
        """
        Isi field pada form
        field_name: nama field (e.g., 'namaPimpinan', 'jabatan')
        value: nilai yang akan diisi
        """
        try:
            # Cari input dengan name attribute
            input_field = self.wait.until(
                EC.presence_of_element_located((By.XPATH, f"//input[@name='{field_name}']"))
            )
            
            # Clear dan isi
            input_field.clear()
            input_field.send_keys(value)
            time.sleep(0.3)
            return True
        except:
            return False
    
    def fill_tupoksi_form(self, data):
        """
        Isi form Tupoksi
        data: dict dengan keys: unitKerja, namaKetua, periode, pendidikanTerakhir, jabatanFungsional, tugasPokokDanFungsi
        """
        fields = ['unitKerja', 'namaKetua', 'periode', 'pendidikanTerakhir', 'jabatanFungsional', 'tugasPokokDanFungsi']
        
        for field in fields:
            if field in data:
                if not self.fill_form_field(field, data[field]):
                    return False
        
        return True
    
    def fill_pendanaan_form(self, data):
        """
        Isi form Pendanaan
        data: dict dengan keys: sumberPendanaan, ts2, ts1, ts, linkBukti
        """
        fields = ['sumberPendanaan', 'ts2', 'ts1', 'ts', 'linkBukti']
        
        for field in fields:
            if field in data:
                if not self.fill_form_field(field, data[field]):
                    return False
        
        return True
    
    def fill_ktk_form(self, data):
        """
        Isi form KTK (Kualifikasi Tenaga Kependidikan)
        data: dict dengan keys: jenisTenagaKependidikan, s3, s2, s1, d4, d3, d2, d1, sma, unitKerja
        """
        fields = ['jenisTenagaKependidikan', 's3', 's2', 's1', 'd4', 'd3', 'd2', 'd1', 'sma', 'unitKerja']
        
        for field in fields:
            if field in data:
                if not self.fill_form_field(field, data[field]):
                    return False
        
        return True
    
    def click_simpan(self):
        """Klik tombol Simpan pada form"""
        try:
            # Close modal validasi jika ada
            try:
                modal_validasi = self.driver.find_element(By.XPATH, "//h3[contains(text(), 'Data Tidak Lengkap')]")
                print("   ℹ️  Modal validasi terdeteksi, menutup...")
                close_btn = self.driver.find_element(By.XPATH, "//button[contains(text(), 'OK') or contains(@class, 'hover:text-gray-700')]")
                close_btn.click()
                time.sleep(1.5)
            except:
                pass  # Tidak ada modal validasi
            
            # Wait dan scroll ke tombol Simpan
            btn = self.wait.until(EC.presence_of_element_located(self.BTN_SIMPAN))
            self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", btn)
            time.sleep(0.5)
            
            # Wait hingga clickable
            btn = self.wait.until(EC.element_to_be_clickable(self.BTN_SIMPAN))
            
            # Try click dengan multiple strategies
            try:
                # Try 1: Regular click
                btn.click()
                print("   ℹ️  Proses menyimpan...")
            except:
                # Try 2: JavaScript click
                print("   ℹ️  Mencoba JS click...")
                self.driver.execute_script("arguments[0].click();", btn)
            
            time.sleep(4)  # Tunggu proses simpan dan validasi
            
            # Tunggu form tertutup (jika berhasil)
            self.wait_for_form_close(timeout=3)
            
            return True
        except Exception as e:
            print(f"   ⚠️  Error saat simpan: {e}")
            return False
    
    def click_batal(self):
        """Klik tombol Batal pada form"""
        try:
            # Try 1: Klik tombol Batal
            try:
                btn = self.wait.until(EC.element_to_be_clickable(self.BTN_BATAL))
                btn.click()
            except:
                # Try 2: Klik X button
                try:
                    x_btn = self.driver.find_element(By.XPATH, "//button[contains(@class, 'text-gray-500')]/*[name()='svg']")
                    x_btn.click()
                except:
                    # Try 3: Press ESC
                    from selenium.webdriver.common.keys import Keys
                    self.driver.find_element(By.TAG_NAME, 'body').send_keys(Keys.ESCAPE)
            
            # Tunggu form tertutup
            time.sleep(1)
            self.wait_for_form_close(timeout=3)
            print("   ✅ Form tertutup")
            
            return True
        except Exception as e:
            print(f"   ⚠️  Error menutup form: {e}")
            return False
    
    # ============================================================
    # READ - Lihat Data
    # ============================================================
    
    def is_table_visible(self):
        """Cek apakah tabel terlihat"""
        try:
            self.wait.until(EC.presence_of_element_located(self.TABLE))
            return True
        except:
            return False
    
    def get_table_row_count(self):
        """Hitung jumlah baris data dalam tabel"""
        try:
            # Cek apakah ada pesan "Belum ada data"
            try:
                self.driver.find_element(*self.NO_DATA_MESSAGE)
                return 0
            except:
                pass
            
            rows = self.driver.find_elements(*self.TABLE_ROWS)
            return len(rows)
        except:
            return 0
    
    def is_data_empty(self):
        """Cek apakah tabel kosong"""
        try:
            self.driver.find_element(*self.NO_DATA_MESSAGE)
            return True
        except:
            return False
    
    def get_first_row_data(self, column_index):
        """
        Ambil data dari kolom tertentu di baris pertama
        column_index: index kolom (1-based, skip kolom No)
        """
        try:
            cell = self.driver.find_element(
                By.XPATH, 
                f"//table/tbody/tr[1]/td[{column_index}]"
            )
            return cell.text
        except:
            return None
    
    def search_data(self, query):
        """Cari data dalam tabel"""
        try:
            search_input = self.wait.until(EC.presence_of_element_located(self.SEARCH_INPUT))
            search_input.clear()
            search_input.send_keys(query)
            time.sleep(1.5)  # Tunggu debounce search
            return True
        except:
            return False
    
    # ============================================================
    # UPDATE - Edit Data
    # ============================================================
    
    def click_edit_first_row(self):
        """Klik tombol Edit pada baris pertama"""
        try:
            # Scroll ke tabel
            self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight/2);")
            time.sleep(0.5)
            
            # Wait untuk tombol edit muncul
            edit_buttons = WebDriverWait(self.driver, 10).until(
                EC.presence_of_all_elements_located(self.BTN_EDIT)
            )
            
            if not edit_buttons:
                return False
            
            # Ambil tombol edit pertama
            first_edit = edit_buttons[0]
            
            # Scroll ke button
            self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", first_edit)
            time.sleep(0.5)
            
            # Wait hingga clickable
            first_edit = WebDriverWait(self.driver, 10).until(
                EC.element_to_be_clickable((By.XPATH, "(//button[@title='Edit'])[1]"))
            )
            
            # Try multiple click strategies
            try:
                # Try 1: ActionChains
                actions = ActionChains(self.driver)
                actions.move_to_element(first_edit).click().perform()
            except:
                # Try 2: JavaScript click
                self.driver.execute_script("arguments[0].click();", first_edit)
            
            time.sleep(1.5)
            return True
        except Exception as e:
            print(f"Error clicking edit: {e}")
            return False
    
    def update_form_field(self, field_name, new_value):
        """Update field pada form (sama seperti fill_form_field)"""
        return self.fill_form_field(field_name, new_value)
    
    # ============================================================
    # DELETE - Hapus Data
    # ============================================================
    
    def click_delete_first_row(self):
        """Klik tombol Delete pada baris pertama"""
        try:
            # Ambil semua tombol delete
            delete_buttons = self.driver.find_elements(*self.BTN_DELETE)
            
            if not delete_buttons:
                return False
            
            # Klik delete pertama
            first_delete = delete_buttons[0]
            
            # Scroll ke button
            self.driver.execute_script("arguments[0].scrollIntoView(true);", first_delete)
            time.sleep(0.5)
            
            # Klik dengan ActionChains
            actions = ActionChains(self.driver)
            actions.move_to_element(first_delete).click().perform()
            
            time.sleep(1)
            return True
        except Exception as e:
            print(f"Error clicking delete: {e}")
            return False
    
    def is_confirm_modal_visible(self):
        """Cek apakah modal konfirmasi hapus muncul"""
        try:
            self.wait.until(EC.presence_of_element_located(self.CONFIRM_MODAL))
            return True
        except:
            return False
    
    def click_confirm_yes(self):
        """Klik tombol Ya pada modal konfirmasi"""
        try:
            btn = self.wait.until(EC.element_to_be_clickable(self.BTN_CONFIRM_YA))
            btn.click()
            time.sleep(2)  # Tunggu proses hapus
            return True
        except:
            return False
    
    def click_confirm_no(self):
        """Klik tombol Tidak pada modal konfirmasi"""
        try:
            btn = self.wait.until(EC.element_to_be_clickable(self.BTN_CONFIRM_TIDAK))
            btn.click()
            time.sleep(0.5)
            return True
        except:
            return False
    
    # ============================================================
    # POPUP & NOTIFICATION
    # ============================================================
    
    def is_success_popup_visible(self):
        """Cek apakah popup sukses muncul"""
        try:
            popup = self.wait.until(EC.presence_of_element_located(self.POPUP_MESSAGE))
            # Cek apakah background hijau (success)
            return 'bg-green-50' in popup.get_attribute('class')
        except:
            return False
    
    def get_popup_message(self):
        """Ambil pesan dari popup"""
        try:
            popup = self.wait.until(EC.presence_of_element_located(self.POPUP_MESSAGE))
            return popup.text
        except:
            return None
    
    def wait_for_popup_disappear(self, timeout=5):
        """Tunggu popup hilang"""
        time.sleep(timeout)
    
    # ============================================================
    # DRAFT & SUBMIT
    # ============================================================
    
    def click_simpan_draft(self):
        """Klik tombol Simpan Draft"""
        try:
            btn = self.wait.until(EC.element_to_be_clickable(self.BTN_SIMPAN_DRAFT))
            btn.click()
            time.sleep(2)
            return True
        except:
            return False
    
    def click_ajukan_review(self):
        """Klik tombol Ajukan untuk Review"""
        try:
            btn = self.wait.until(EC.element_to_be_clickable(self.BTN_AJUKAN_REVIEW))
            btn.click()
            time.sleep(2)
            return True
        except:
            return False
