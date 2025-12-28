"""
Page Object untuk Export Akreditasi
Halaman untuk export LKPS (Excel & Word) dan LED (PDF & Word)
"""

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
import time


class ExportPage:
    """
    Page Object untuk halaman Export Akreditasi
    URL: /dashboard/tim-akreditasi/export
    """
    
    # URL
    URL = "http://localhost:3000/dashboard/tim-akreditasi/export"
    
    # Locators - Header & Stats
    HEADING = (By.XPATH, "//h1[contains(text(), 'Export')]")
    TOTAL_BAGIAN = (By.XPATH, "//p[contains(text(), 'Total Bagian')]")
    SIAP_EXPORT = (By.XPATH, "//p[contains(text(), 'Siap Export')]")
    
    # Locators - Format Selection (Dropdown)
    FORMAT_DROPDOWN = (By.XPATH, "//select")
    FORMAT_OPTION_EXCEL = (By.XPATH, "//option[@value='EXCEL']")
    FORMAT_OPTION_WORD = (By.XPATH, "//option[@value='DOCS']")
    FORMAT_OPTION_PDF = (By.XPATH, "//option[@value='PDF']")
    
    # Locators - Checkboxes
    CHECKBOXES_BAGIAN = (By.XPATH, "//input[@type='checkbox']")
    
    # Locators - Buttons
    BTN_EXPORT = (By.XPATH, "//button[contains(., 'Export')]")
    BTN_PILIH_SEMUA = (By.XPATH, "//button[contains(., 'Pilih Semua')]")
    BTN_HAPUS_PILIHAN = (By.XPATH, "//button[contains(., 'Hapus')]")
    
    # Locators - List Items
    LIST_ITEMS = (By.XPATH, "//div[contains(@class, 'bg-white') and .//input[@type='checkbox']]")
    
    # Locators - Filter
    FILTER_SELECT = (By.XPATH, "//select")
    SEARCH_INPUT = (By.XPATH, "//input[@placeholder='Cari bagian...']")
    
    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, 10)
        self.actions = ActionChains(driver)
    
    def open(self):
        """Buka halaman Export"""
        self.driver.get(self.URL)
        time.sleep(2)
    
    def is_loaded(self):
        """Cek apakah halaman sudah dimuat"""
        try:
            self.wait.until(EC.presence_of_element_located(self.HEADING))
            return True
        except:
            return False
    
    def select_format_excel(self):
        """Pilih format Excel dari dropdown"""
        try:
            dropdown = self.wait.until(EC.element_to_be_clickable(self.FORMAT_DROPDOWN))
            
            # Scroll ke dropdown
            self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", dropdown)
            time.sleep(0.5)
            
            # Pilih option Excel
            from selenium.webdriver.support.ui import Select
            select = Select(dropdown)
            select.select_by_value('EXCEL')
            
            time.sleep(1)
            print("✅ Format Excel dipilih dari dropdown")
            return True
        except Exception as e:
            print(f"Error selecting Excel: {e}")
            return False
    
    def select_format_word(self):
        """Pilih format Word/Docs dari dropdown"""
        try:
            dropdown = self.wait.until(EC.element_to_be_clickable(self.FORMAT_DROPDOWN))
            
            self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", dropdown)
            time.sleep(0.5)
            
            from selenium.webdriver.support.ui import Select
            select = Select(dropdown)
            select.select_by_value('DOCS')
            
            time.sleep(1)
            print("✅ Format Word dipilih dari dropdown")
            return True
        except Exception as e:
            print(f"Error selecting Word: {e}")
            return False
    
    def select_format_pdf(self):
        """Pilih format PDF dari dropdown"""
        try:
            dropdown = self.wait.until(EC.element_to_be_clickable(self.FORMAT_DROPDOWN))
            
            self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", dropdown)
            time.sleep(0.5)
            
            from selenium.webdriver.support.ui import Select
            select = Select(dropdown)
            select.select_by_value('PDF')
            
            time.sleep(1)
            print("✅ Format PDF dipilih dari dropdown")
            return True
        except Exception as e:
            print(f"Error selecting PDF: {e}")
            return False
    
    def get_selected_format(self):
        """Ambil format yang sedang dipilih dari dropdown"""
        try:
            dropdown = self.wait.until(EC.presence_of_element_located(self.FORMAT_DROPDOWN))
            from selenium.webdriver.support.ui import Select
            select = Select(dropdown)
            selected_option = select.first_selected_option
            return selected_option.get_attribute('value')
        except:
            return None
    
    def get_all_bagian_items(self):
        """
        Ambil semua item bagian akreditasi
        
        Returns:
            list: List of dict dengan info setiap item
        """
        try:
            items = []
            checkboxes = self.driver.find_elements(*self.CHECKBOXES_BAGIAN)
            
            for checkbox in checkboxes:
                try:
                    # Ambil parent div item
                    item_div = checkbox.find_element(By.XPATH, "./ancestor::div[contains(@class, 'bg-white')]")
                    
                    # Ambil info dari item
                    text_content = item_div.text
                    
                    # Extract kode dan nama
                    lines = text_content.split('\n')
                    kode = lines[0] if len(lines) > 0 else ""
                    nama = lines[1] if len(lines) > 1 else ""
                    
                    items.append({
                        'checkbox': checkbox,
                        'kode': kode,
                        'nama': nama,
                        'element': item_div
                    })
                except:
                    pass
            
            return items
        except Exception as e:
            print(f"Error getting bagian items: {e}")
            return []
    
    def select_bagian_by_kode(self, kode):
        """
        Pilih item bagian berdasarkan kode (misal: 'A', 'C.1', 'C.2')
        
        Args:
            kode: Kode bagian
        """
        try:
            # Cari checkbox dengan label yang mengandung kode
            checkbox = self.driver.find_element(
                By.XPATH,
                f"//label[contains(., '{kode}')]//input[@type='checkbox']"
            )
            
            # Scroll ke checkbox
            self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", checkbox)
            time.sleep(0.5)
            
            # Klik jika belum checked
            if not checkbox.is_selected():
                try:
                    checkbox.click()
                except:
                    self.driver.execute_script("arguments[0].click();", checkbox)
            
            time.sleep(0.5)
            return True
            
        except Exception as e:
            print(f"Error selecting bagian {kode}: {e}")
            return False
    
    def select_bagian_by_name(self, name):
        """
        Pilih item bagian berdasarkan nama (contains search)
        
        Args:
            name: Sebagian nama bagian
        """
        try:
            items = self.get_all_bagian_items()
            
            for item in items:
                if name.lower() in item['nama'].lower():
                    checkbox = item['checkbox']
                    
                    # Scroll ke checkbox
                    self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", checkbox)
                    time.sleep(0.5)
                    
                    # Klik jika belum checked
                    if not checkbox.is_selected():
                        try:
                            checkbox.click()
                        except:
                            self.driver.execute_script("arguments[0].click();", checkbox)
                    
                    time.sleep(0.5)
                    return True
            
            return False
            
        except Exception as e:
            print(f"Error selecting bagian by name: {e}")
            return False
    
    def get_selected_count(self):
        """Hitung jumlah item yang dipilih"""
        try:
            checkboxes = self.driver.find_elements(*self.CHECKBOXES_BAGIAN)
            selected = [cb for cb in checkboxes if cb.is_selected()]
            return len(selected)
        except:
            return 0
    
    def click_pilih_semua(self):
        """Klik tombol 'Pilih Semua'"""
        try:
            button = self.wait.until(EC.element_to_be_clickable(self.BTN_PILIH_SEMUA))
            
            self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", button)
            time.sleep(0.5)
            
            try:
                button.click()
            except:
                self.driver.execute_script("arguments[0].click();", button)
            
            time.sleep(1)
            return True
        except Exception as e:
            print(f"Error clicking pilih semua: {e}")
            return False
    
    def click_export(self):
        """Klik tombol 'Export'"""
        try:
            button = self.wait.until(EC.element_to_be_clickable(self.BTN_EXPORT))
            
            self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", button)
            time.sleep(0.5)
            
            try:
                button.click()
            except:
                self.driver.execute_script("arguments[0].click();", button)
            
            time.sleep(2)  # Wait for export to start
            return True
        except Exception as e:
            print(f"Error clicking export: {e}")
            return False
    
    def is_exporting(self):
        """Cek apakah sedang proses export (button loading)"""
        try:
            button = self.driver.find_element(*self.BTN_EXPORT)
            # Cek apakah button disabled atau ada loading text
            return button.get_attribute('disabled') is not None
        except:
            return False
    
    def has_modal_notification(self):
        """Cek apakah ada modal notifikasi"""
        try:
            modal = self.driver.find_element(
                By.XPATH,
                "//div[contains(@class, 'fixed') and contains(@class, 'inset-0')]"
            )
            return modal.is_displayed()
        except:
            return False
    
    def get_modal_message(self):
        """Ambil pesan dari modal notifikasi"""
        try:
            modal = self.driver.find_element(
                By.XPATH,
                "//div[contains(@class, 'fixed') and contains(@class, 'inset-0')]"
            )
            return modal.text
        except:
            return ""
    
    def close_modal(self):
        """Tutup modal notifikasi"""
        try:
            # Cari tombol close (X atau OK)
            close_buttons = self.driver.find_elements(
                By.XPATH,
                "//button[contains(., 'OK') or contains(., 'Tutup') or contains(@class, 'close')]"
            )
            
            if close_buttons:
                button = close_buttons[0]
                try:
                    button.click()
                except:
                    self.driver.execute_script("arguments[0].click();", button)
                
                time.sleep(1)
                return True
            
            return False
        except Exception as e:
            print(f"Error closing modal: {e}")
            return False
