"""
Page Object untuk Matriks Penilaian
Halaman untuk input skor penilaian akreditasi dan export hasil
"""

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
import time


class MatriksPenilaianPage:
    """
    Page Object untuk halaman Matriks Penilaian
    URL: /dashboard/tim-akreditasi/matriks-penilaian
    """
    
    # URL
    URL = "http://localhost:3000/dashboard/tim-akreditasi/matriks-penilaian"
    
    # Locators - Header & Info
    HEADING = (By.XPATH, "//h1[contains(text(), 'Matriks Penilaian')]")
    SUBTITLE = (By.XPATH, "//p[contains(text(), 'Tabel rubrik LAM')]")
    
    # Locators - Hasil Penilaian Summary
    SKOR_TOTAL = (By.XPATH, "//p[contains(text(), 'Skor Total')]/following-sibling::p")
    PERINGKAT = (By.XPATH, "//p[contains(text(), 'Peringkat')]/following-sibling::span")
    PROGRESS_BAR = (By.XPATH, "//div[contains(@class, 'bg-blue-600') and contains(@class, 'rounded-full')]")
    
    # Locators - Action Buttons
    BTN_RESET = (By.XPATH, "//button[contains(., 'Reset Semua')]")
    BTN_EXPORT = (By.XPATH, "//button[contains(., 'Export Hasil')]")
    
    # Locators - Table
    TABLE = (By.XPATH, "//table")
    TABLE_HEADERS = (By.XPATH, "//thead//th")
    TABLE_ROWS = (By.XPATH, "//tbody//tr[not(contains(@class, 'bg-gray-200'))]")  # Exclude group headers
    GROUP_HEADERS = (By.XPATH, "//tbody//tr[contains(@class, 'bg-gray-200')]")
    
    # Locators - Prioritas Perbaikan
    PRIORITAS_PERBAIKAN = (By.XPATH, "//h3[contains(text(), 'Prioritas Perbaikan')]")
    PRIORITAS_CARDS = (By.XPATH, "//div[contains(@class, 'bg-yellow-50')]")
    
    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, 10)
        self.actions = ActionChains(driver)
    
    def open(self):
        """Buka halaman Matriks Penilaian"""
        self.driver.get(self.URL)
        time.sleep(2)
    
    def is_loaded(self):
        """Cek apakah halaman sudah dimuat"""
        try:
            self.wait.until(EC.presence_of_element_located(self.HEADING))
            return True
        except:
            return False
    
    def get_skor_total(self):
        """Ambil nilai skor total"""
        try:
            element = self.driver.find_element(*self.SKOR_TOTAL)
            return float(element.text)
        except:
            return 0.0
    
    def get_peringkat(self):
        """Ambil peringkat akreditasi (A/B/C/Tidak Terakreditasi)"""
        try:
            element = self.driver.find_element(*self.PERINGKAT)
            return element.text.strip()
        except:
            return ""
    
    def get_table_row_count(self):
        """Hitung jumlah baris kriteria (exclude group headers)"""
        try:
            rows = self.driver.find_elements(*self.TABLE_ROWS)
            return len(rows)
        except:
            return 0
    
    def get_group_headers(self):
        """Ambil semua group headers (Kriteria 1, 2, dst)"""
        try:
            headers = self.driver.find_elements(*self.GROUP_HEADERS)
            return [h.text.strip() for h in headers]
        except:
            return []
    
    def click_skor_radio(self, row_index, skor_value):
        """
        Klik radio button skor pada baris tertentu
        
        Args:
            row_index: Index baris (0-based)
            skor_value: Nilai skor (1, 2, 3, atau 4)
        """
        try:
            # Cari semua baris (exclude group headers)
            rows = self.driver.find_elements(*self.TABLE_ROWS)
            
            if row_index >= len(rows):
                raise Exception(f"Row index {row_index} out of range (total: {len(rows)})")
            
            row = rows[row_index]
            
            # Cari radio button dengan value sesuai skor_value
            # XPath: //input[@type='radio' and @value='4']
            radio = row.find_element(By.XPATH, f".//input[@type='radio' and @value='{skor_value}']")
            
            # Scroll ke radio button
            self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", radio)
            time.sleep(0.5)
            
            # Klik radio button
            try:
                radio.click()
            except:
                # Fallback dengan JavaScript
                self.driver.execute_script("arguments[0].click();", radio)
            
            time.sleep(1)  # Wait for auto-save
            
            return True
            
        except Exception as e:
            print(f"Error clicking radio: {e}")
            return False
    
    def click_skor_by_criteria_name(self, criteria_name, skor_value):
        """
        Klik radio button skor berdasarkan nama kriteria
        
        Args:
            criteria_name: Sebagian nama kriteria (akan dicari dengan contains)
            skor_value: Nilai skor (1, 2, 3, atau 4)
        """
        try:
            # Cari row yang mengandung criteria_name
            row = self.driver.find_element(
                By.XPATH, 
                f"//tbody//tr[.//td[contains(., '{criteria_name}')]]"
            )
            
            # Cari radio button dengan value sesuai skor_value
            radio = row.find_element(By.XPATH, f".//input[@type='radio' and @value='{skor_value}']")
            
            # Scroll dan klik
            self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", radio)
            time.sleep(0.5)
            
            try:
                radio.click()
            except:
                self.driver.execute_script("arguments[0].click();", radio)
            
            time.sleep(1)
            
            return True
            
        except Exception as e:
            print(f"Error clicking radio by criteria name: {e}")
            return False
    
    def get_selected_skor(self, row_index):
        """
        Ambil nilai skor yang sedang dipilih pada baris tertentu
        
        Args:
            row_index: Index baris (0-based)
            
        Returns:
            int: Nilai skor yang dipilih (1-4) atau 0 jika tidak ada yang dipilih
        """
        try:
            rows = self.driver.find_elements(*self.TABLE_ROWS)
            
            if row_index >= len(rows):
                return 0
            
            row = rows[row_index]
            
            # Cari radio button yang checked
            checked_radio = row.find_elements(By.XPATH, ".//input[@type='radio' and @checked]")
            
            if not checked_radio:
                # Coba cari dengan JavaScript (kadang checked attribute tidak update di DOM)
                radios = row.find_elements(By.XPATH, ".//input[@type='radio']")
                for radio in radios:
                    if radio.is_selected():
                        return int(radio.get_attribute('value'))
                return 0
            
            return int(checked_radio[0].get_attribute('value'))
            
        except:
            return 0
    
    def get_skor_terbobot(self, row_index):
        """
        Ambil nilai skor terbobot pada baris tertentu
        
        Args:
            row_index: Index baris (0-based)
            
        Returns:
            float: Nilai skor terbobot
        """
        try:
            rows = self.driver.find_elements(*self.TABLE_ROWS)
            
            if row_index >= len(rows):
                return 0.0
            
            row = rows[row_index]
            
            # Cari text "Terbobot: " di kolom terakhir
            terbobot_text = row.find_element(By.XPATH, ".//span[contains(., 'Terbobot')]").text
            
            # Extract number dari "Terbobot: 0.123"
            import re
            match = re.search(r'Terbobot:\s*([\d.]+)', terbobot_text)
            if match:
                return float(match.group(1))
            
            return 0.0
            
        except:
            return 0.0
    
    def click_export_hasil(self):
        """Klik tombol 'Export Hasil'"""
        try:
            button = self.wait.until(
                EC.element_to_be_clickable(self.BTN_EXPORT)
            )
            
            # Scroll ke tombol
            self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", button)
            time.sleep(0.5)
            
            # Klik
            try:
                button.click()
            except:
                self.driver.execute_script("arguments[0].click();", button)
            
            time.sleep(2)  # Wait for download to start
            
            return True
            
        except Exception as e:
            print(f"Error clicking export: {e}")
            return False
    
    def is_exporting(self):
        """Cek apakah sedang proses export (ada loading)"""
        try:
            # Cek apakah tombol berubah jadi "Mengekspor..."
            button = self.driver.find_element(*self.BTN_EXPORT)
            return "Mengekspor" in button.text
        except:
            return False
    
    def click_reset(self):
        """Klik tombol 'Reset Semua' (dengan konfirmasi alert)"""
        try:
            button = self.wait.until(
                EC.element_to_be_clickable(self.BTN_RESET)
            )
            
            # Scroll dan klik
            self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", button)
            time.sleep(0.5)
            
            button.click()
            time.sleep(1)
            
            # Handle alert konfirmasi
            try:
                alert = self.driver.switch_to.alert
                alert.accept()  # Klik OK
                time.sleep(2)
                return True
            except:
                # Tidak ada alert atau sudah ditutup
                return False
                
        except Exception as e:
            print(f"Error clicking reset: {e}")
            return False
    
    def get_prioritas_perbaikan_count(self):
        """Hitung jumlah prioritas perbaikan yang ditampilkan"""
        try:
            cards = self.driver.find_elements(*self.PRIORITAS_CARDS)
            return len(cards)
        except:
            return 0
    
    def get_criteria_info(self, row_index):
        """
        Ambil informasi lengkap dari satu baris kriteria
        
        Args:
            row_index: Index baris (0-based)
            
        Returns:
            dict: Informasi kriteria {jenis, no_urut, no_butir, bobot, kriteria, skor, terbobot}
        """
        try:
            rows = self.driver.find_elements(*self.TABLE_ROWS)
            
            if row_index >= len(rows):
                return {}
            
            row = rows[row_index]
            
            # Ambil data dari setiap kolom
            cells = row.find_elements(By.TAG_NAME, "td")
            
            info = {
                'jenis': cells[0].text.strip() if len(cells) > 0 else '-',
                'no_urut': cells[1].text.strip() if len(cells) > 1 else '-',
                'no_butir': cells[2].text.strip() if len(cells) > 2 else '-',
                'bobot': cells[3].text.strip() if len(cells) > 3 else '-',
                'kriteria': cells[4].text.strip() if len(cells) > 4 else '-',
                'deskriptor': cells[5].text.strip() if len(cells) > 5 else '-',
                'skor': self.get_selected_skor(row_index),
                'terbobot': self.get_skor_terbobot(row_index)
            }
            
            return info
            
        except Exception as e:
            print(f"Error getting criteria info: {e}")
            return {}
