"""
Page Object Model untuk Manajemen Akun (Tata Usaha)
Halaman untuk create, edit, dan delete user
"""
# pylint: disable=broad-exception-caught,bare-except

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select
import time


class ManajemenAkunPage:
    """Page Object untuk halaman Manajemen Akun"""
    
    # Locators
    PAGE_HEADING = (By.XPATH, "//h1[contains(text(), 'Manajemen Akun')]")
    BTN_TAMBAH_USER = (By.XPATH, "//button[contains(., 'Tambah User')]")
    
    # Modal elements
    MODAL = (By.XPATH, "//div[contains(@class, 'fixed')]//div[contains(@class, 'bg-white')]")
    MODAL_TITLE = (By.XPATH, "//h3[contains(text(), 'Tambah User') or contains(text(), 'Edit User')]")
    MODAL_CLOSE = (By.XPATH, "//button[@title='Close' or contains(@class, 'text-gray-500')]")
    
    # Form inputs
    INPUT_NAMA = (By.NAME, "name")
    INPUT_EMAIL = (By.NAME, "email")
    INPUT_PASSWORD = (By.NAME, "password")
    SELECT_PRODI = (By.NAME, "prodi")
    SELECT_ROLE = (By.NAME, "role")
    SELECT_STATUS = (By.NAME, "status")
    
    # Form buttons
    BTN_BATAL = (By.XPATH, "//button[contains(text(), 'Batal')]")
    BTN_SUBMIT = (By.XPATH, "//button[@type='submit' and (contains(text(), 'Tambah User') or contains(text(), 'Simpan'))]")
    
    # Table elements
    TABLE = (By.TAG_NAME, "table")
    TABLE_ROWS = (By.XPATH, "//tbody/tr")
    
    # Filter elements
    FILTER_ROLE = (By.XPATH, "//select[contains(@class, 'border')]")
    FILTER_STATUS = (By.XPATH, "(//select[contains(@class, 'border')])[2]")
    
    # Action buttons in table
    BTN_EDIT = (By.XPATH, "//button[@title='Edit User']")
    BTN_DELETE = (By.XPATH, "//button[@title='Hapus User']")
    
    # Statistics boxes
    STAT_TOTAL = (By.XPATH, "//div[contains(text(), 'Total Users')]/preceding-sibling::div")
    STAT_AKTIF = (By.XPATH, "//div[contains(text(), 'Aktif')]/preceding-sibling::div")
    
    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, 10)
    
    def open(self):
        """Buka halaman manajemen akun"""
        self.driver.get("http://localhost:3000/dashboard/tata-usaha/manajemen-akun")
        return self
    
    def is_loaded(self):
        """Cek apakah halaman sudah dimuat"""
        try:
            self.wait.until(EC.presence_of_element_located(self.PAGE_HEADING))
            return True
        except:
            return False
    
    def get_stats(self):
        """Ambil statistik user dari dashboard"""
        try:
            stats = {
                'total': 0,
                'aktif': 0,
                'tim_akreditasi': 0,
                'p4m': 0,
                'tu': 0
            }
            
            # Cari semua stat boxes
            try:
                # Total Users
                total_elem = self.driver.find_element(By.XPATH, "//div[contains(., 'Total Users')]//p[contains(@class, 'text-2xl') or contains(@class, 'font-bold')]")
                stats['total'] = int(total_elem.text.strip())
            except:
                pass
            
            try:
                # Aktif
                aktif_elem = self.driver.find_element(By.XPATH, "//div[contains(., 'Aktif') and not(contains(., 'Tidak'))]//p[contains(@class, 'text-2xl') or contains(@class, 'font-bold')]")
                stats['aktif'] = int(aktif_elem.text.strip())
            except:
                pass
            
            try:
                # Tim Akreditasi
                ta_elem = self.driver.find_element(By.XPATH, "//div[contains(., 'Tim Akreditasi')]//p[contains(@class, 'text-2xl') or contains(@class, 'font-bold')]")
                stats['tim_akreditasi'] = int(ta_elem.text.strip())
            except:
                pass
            
            try:
                # P4M
                p4m_elem = self.driver.find_element(By.XPATH, "//div[contains(., 'P4M')]//p[contains(@class, 'text-2xl') or contains(@class, 'font-bold')]")
                stats['p4m'] = int(p4m_elem.text.strip())
            except:
                pass
            
            try:
                # TU
                tu_elem = self.driver.find_element(By.XPATH, "//div[contains(., 'TU') and not(contains(., 'Mutu'))]//p[contains(@class, 'text-2xl') or contains(@class, 'font-bold')]")
                stats['tu'] = int(tu_elem.text.strip())
            except:
                pass
            
            return stats
        except Exception as e:
            print(f"Error getting stats: {e}")
            return None
    
    def get_all_users(self):
        """Ambil semua user dari tabel"""
        users = []
        try:
            rows = self.driver.find_elements(*self.TABLE_ROWS)
            for row in rows:
                try:
                    cells = row.find_elements(By.TAG_NAME, "td")
                    if len(cells) >= 4:
                        # Extract user info dari cells
                        user_info = cells[0].text.strip().split('\n')
                        nama = user_info[0] if len(user_info) > 0 else ''
                        email = user_info[1] if len(user_info) > 1 else ''
                        role = cells[1].text.strip()
                        prodi = cells[2].text.strip()
                        status = cells[3].text.strip()
                        
                        users.append({
                            'nama': nama,
                            'email': email,
                            'role': role,
                            'prodi': prodi,
                            'status': status,
                            'row_element': row
                        })
                except:
                    continue
            return users
        except Exception as e:
            print(f"Error getting users: {e}")
            return []
    
    def find_user_by_email(self, email):
        """Cari user berdasarkan email"""
        users = self.get_all_users()
        for user in users:
            if user['email'].lower() == email.lower():
                return user
        return None
    
    def filter_by_role(self, role):
        """Filter user berdasarkan role"""
        try:
            select = Select(self.driver.find_element(*self.FILTER_ROLE))
            select.select_by_visible_text(role)
            time.sleep(1)
            return True
        except Exception as e:
            print(f"Error filtering by role: {e}")
            return False
    
    def filter_by_status(self, status):
        """Filter user berdasarkan status"""
        try:
            select = Select(self.driver.find_element(*self.FILTER_STATUS))
            select.select_by_visible_text(status)
            time.sleep(1)
            return True
        except Exception as e:
            print(f"Error filtering by status: {e}")
            return False
    
    def is_modal_open(self):
        """Cek apakah modal terbuka"""
        try:
            self.driver.find_element(*self.MODAL)
            return True
        except:
            return False
    
    def click_tambah_user(self):
        """Klik tombol Tambah User"""
        try:
            btn = self.wait.until(EC.element_to_be_clickable(self.BTN_TAMBAH_USER))
            btn.click()
            # Tunggu modal muncul
            time.sleep(1)
            self.wait.until(EC.presence_of_element_located(self.MODAL))
            return True
        except Exception as e:
            print(f"Error clicking Tambah User: {e}")
            return False
    
    def get_modal_title(self):
        """Dapatkan title modal"""
        try:
            element = self.driver.find_element(*self.MODAL_TITLE)
            return element.text
        except:
            return None
    
    def fill_user_form(self, nama=None, email=None, password=None, prodi=None, role=None, status=None):
        """Isi form user"""
        if nama:
            input_nama = self.wait.until(EC.presence_of_element_located(self.INPUT_NAMA))
            input_nama.clear()
            input_nama.send_keys(nama)
        
        if email:
            input_email = self.driver.find_element(*self.INPUT_EMAIL)
            input_email.clear()
            input_email.send_keys(email)
        
        if password:
            input_password = self.driver.find_element(*self.INPUT_PASSWORD)
            input_password.clear()
            input_password.send_keys(password)
        
        if prodi:
            select_prodi = Select(self.driver.find_element(*self.SELECT_PRODI))
            select_prodi.select_by_visible_text(prodi)
        
        if role:
            select_role = Select(self.driver.find_element(*self.SELECT_ROLE))
            select_role.select_by_visible_text(role)
        
        if status:
            try:
                select_status = Select(self.driver.find_element(*self.SELECT_STATUS))
                select_status.select_by_visible_text(status)
            except:
                pass  # Status field mungkin tidak ada untuk create
        
        return self
    
    def create_user(self, nama, email, password, role="Tim Akreditasi", prodi=None):
        """
        Lengkap flow untuk create user baru
        """
        self.click_tambah_user()
        time.sleep(0.5)
        self.fill_user_form(nama=nama, email=email, password=password, role=role, prodi=prodi)
        return self
    
    def click_submit(self):
        """Klik tombol submit form"""
        btn = self.driver.find_element(*self.BTN_SUBMIT)
        btn.click()
        time.sleep(1)  # Tunggu proses submit
        return self
    
    def submit_form(self):
        """Submit form dan return status berhasil/tidak"""
        try:
            # Klik tombol submit
            btn = self.wait.until(EC.element_to_be_clickable(self.BTN_SUBMIT))
            btn.click()
            
            # Tunggu proses submit
            time.sleep(2)
            
            # Cek apakah modal masih terbuka (berarti ada error)
            if self.is_modal_open():
                return False
            
            # Modal tertutup berarti submit berhasil
            return True
        except Exception as e:
            print(f"Error submitting form: {e}")
            return False
    
    def click_batal(self):
        """Klik tombol batal"""
        btn = self.driver.find_element(*self.BTN_BATAL)
        btn.click()
        return self
    
    def close_modal(self):
        """Tutup modal dengan klik X"""
        try:
            btn = self.driver.find_element(*self.MODAL_CLOSE)
            btn.click()
            time.sleep(0.5)
        except:
            pass
        return self
    
    def get_table_rows(self):
        """Dapatkan semua baris tabel"""
        try:
            rows = self.driver.find_elements(*self.TABLE_ROWS)
            return rows
        except:
            return []
    
    def get_total_users(self):
        """Dapatkan jumlah total users dari statistik"""
        try:
            element = self.driver.find_element(*self.STAT_TOTAL)
            return int(element.text)
        except:
            return 0
    
    def search_user_in_table(self, email):
        """Cari user berdasarkan email di tabel"""
        try:
            xpath = f"//td[contains(., '{email}')]"
            self.driver.find_element(By.XPATH, xpath)
            return True
        except:
            return False
    
    def click_edit_user(self, index=0):
        """Klik tombol edit user (index 0 = user pertama)"""
        buttons = self.driver.find_elements(*self.BTN_EDIT)
        if buttons and len(buttons) > index:
            buttons[index].click()
            self.wait.until(EC.presence_of_element_located(self.MODAL))
        return self
    
    def click_delete_user(self, index=0):
        """Klik tombol delete user (index 0 = user pertama)"""
        buttons = self.driver.find_elements(*self.BTN_DELETE)
        if buttons and len(buttons) > index:
            buttons[index].click()
            time.sleep(0.5)
        return self
    
    def confirm_alert(self):
        """Confirm alert dialog"""
        try:
            alert = self.driver.switch_to.alert
            alert.accept()
            time.sleep(1)
        except:
            pass
        return self
    
    def dismiss_alert(self):
        """Dismiss alert dialog"""
        try:
            alert = self.driver.switch_to.alert
            alert.dismiss()
            time.sleep(0.5)
        except:
            pass
        return self
    
    def get_success_message(self):
        """Cek apakah ada success message (implementasi tergantung UI)"""
        # Jika ada notifikasi toast atau alert
        try:
            # Contoh: cari elemen success message
            msg = self.driver.find_element(By.XPATH, "//div[contains(@class, 'success') or contains(@class, 'green')]")
            return msg.text
        except:
            return None
    
    def get_error_message(self):
        """Cek apakah ada error message"""
        try:
            msg = self.driver.find_element(By.XPATH, "//div[contains(@class, 'error') or contains(@class, 'red')]")
            return msg.text
        except:
            return None
