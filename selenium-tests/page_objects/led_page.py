"""
LED (Laporan Evaluasi Diri) Page Object
Halaman untuk mengisi data LED dengan berbagai tab (C.1 - C.6)
"""

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
from selenium.common.exceptions import TimeoutException, NoSuchElementException, ElementClickInterceptedException
import time

class LEDPage:
    """Page Object untuk halaman LED (Laporan Evaluasi Diri)"""
    
    # URL
    URL = "http://localhost:3000/dashboard/tim-akreditasi/led"
    
    # Locators
    HEADING = (By.XPATH, "//h1[contains(text(), 'Laporan Evaluasi Diri')]")
    
    # Tab buttons - 6 tabs: C.1 - C.6
    TAB_BUDAYA_MUTU = (By.XPATH, "//button[contains(., 'C.1 Budaya Mutu')]")
    TAB_RELEVANSI_PENDIDIKAN = (By.XPATH, "//button[contains(., 'C.2 Relevansi Pendidikan')]")
    TAB_RELEVANSI_PENELITIAN = (By.XPATH, "//button[contains(., 'C.3 Relevansi Penelitian')]")
    TAB_RELEVANSI_PKM = (By.XPATH, "//button[contains(., 'C.4 Relevansi PkM')]")
    TAB_AKUNTABILITAS = (By.XPATH, "//button[contains(., 'C.5 Akuntabilitas')]")
    TAB_DIFERENSIASI_MISI = (By.XPATH, "//button[contains(., 'C.6 Diferensiasi Misi')]")
    
    # Buttons
    BTN_SIMPAN_DRAFT = (By.XPATH, "//button[contains(., 'Draft')]")
    BTN_AJUKAN_REVIEW = (By.XPATH, "//button[contains(., 'Ajukan untuk Review')]")
    BTN_CATATAN_P4M = (By.XPATH, "//button[@title='Lihat Catatan P4M']")
    
    # Table sections - Penetapan
    BTN_TAMBAH_PENETAPAN_A = (By.XPATH, "//h4[contains(., 'Tabel A')]/following-sibling::div//button[contains(., 'Tambah Baris')]")
    BTN_DELETE_PENETAPAN_A = (By.XPATH, "//h4[contains(., 'Tabel A')]/following-sibling::div//button[@title='Hapus']")
    
    # Form fields - Penetapan Tabel A (2 kolom: pernyataan, keterlaksanaan)
    INPUT_PERNYATAAN = (By.XPATH, "//input[@placeholder='Isi pernyataan standar']")
    INPUT_KETERLAKSANAAN = (By.XPATH, "//input[@placeholder='Isi keterlaksanaan']")
    INPUT_PELAKSANAAN = (By.XPATH, "//input[@placeholder='Isi pelaksanaan']")
    INPUT_BUKTI_PENDUKUNG = (By.XPATH, "//input[@placeholder='Isi link bukti pendukung']")
    
    # Evaluation section (Tabel Evaluasi)
    BTN_TAMBAH_EVAL_A = (By.XPATH, "//h4[contains(., 'Evaluasi A')]/following-sibling::div//button[contains(., 'Tambah Baris')]")
    INPUT_EVALUASI = (By.XPATH, "//input[@placeholder='Isi evaluasi']")
    INPUT_TINDAK_LANJUT = (By.XPATH, "//input[@placeholder='Isi tindak lanjut']")
    INPUT_HASIL_OPTIMALISASI = (By.XPATH, "//input[@placeholder='Isi hasil optimalisasi']")
    
    # Success popup
    SUCCESS_POPUP = (By.XPATH, "//div[contains(@class, 'bg-green-50') or contains(@class, 'bg-blue-50')]")
    
    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, 10)
    
    def open(self):
        """Buka halaman LED"""
        self.driver.get(self.URL)
        time.sleep(2)
    
    def is_loaded(self):
        """Cek apakah halaman LED sudah dimuat"""
        try:
            # Cek heading atau URL
            try:
                self.wait.until(EC.presence_of_element_located(self.HEADING))
                return True
            except TimeoutException:
                # Fallback: cek URL
                return 'led' in self.driver.current_url.lower()
        except:
            return False
    
    def get_page_heading(self):
        """Ambil teks heading halaman"""
        try:
            heading = self.driver.find_element(*self.HEADING)
            return heading.text
        except:
            return "LED Page"
    
    def switch_to_tab(self, tab_name):
        """
        Switch ke tab tertentu
        Args:
            tab_name: 'budaya-mutu', 'relevansi-pendidikan', 'relevansi-penelitian', 
                     'relevansi-pkm', 'akuntabilitas', 'diferensiasi-misi'
        """
        tab_map = {
            'budaya-mutu': self.TAB_BUDAYA_MUTU,
            'relevansi-pendidikan': self.TAB_RELEVANSI_PENDIDIKAN,
            'relevansi-penelitian': self.TAB_RELEVANSI_PENELITIAN,
            'relevansi-pkm': self.TAB_RELEVANSI_PKM,
            'akuntabilitas': self.TAB_AKUNTABILITAS,
            'diferensiasi-misi': self.TAB_DIFERENSIASI_MISI,
        }
        
        locator = tab_map.get(tab_name)
        if not locator:
            raise ValueError(f"Tab tidak dikenal: {tab_name}")
        
        try:
            # Scroll ke atas dulu
            self.driver.execute_script("window.scrollTo(0, 0);")
            time.sleep(0.5)
            
            # Tunggu tombol tab clickable
            tab_btn = self.wait.until(EC.element_to_be_clickable(locator))
            
            # Try click dengan ActionChains
            try:
                ActionChains(self.driver).move_to_element(tab_btn).click().perform()
            except:
                # Fallback ke JS click
                self.driver.execute_script("arguments[0].click();", tab_btn)
            
            time.sleep(1.5)
            return True
        except Exception as e:
            print(f"Error switch tab: {e}")
            return False
    
    def click_tambah_baris_penetapan_a(self):
        """Klik tombol Tambah Baris di Penetapan Tabel A"""
        try:
            # Scroll ke bagian Penetapan
            penetapan_section = self.driver.find_element(By.XPATH, "//h3[contains(., 'Penetapan')]")
            self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", penetapan_section)
            time.sleep(0.5)
            
            # Tunggu tombol tambah baris
            btn = self.wait.until(EC.element_to_be_clickable(self.BTN_TAMBAH_PENETAPAN_A))
            
            # Scroll ke tombol
            self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", btn)
            time.sleep(0.3)
            
            # Click dengan multiple strategies
            try:
                btn.click()
            except ElementClickInterceptedException:
                self.driver.execute_script("arguments[0].click();", btn)
            
            time.sleep(1)
            return True
        except Exception as e:
            print(f"Error klik tambah baris: {e}")
            return False
    
    def fill_penetapan_row_simple(self, data):
        """
        Isi data row terakhir (row yang baru ditambah) di Penetapan Tabel A
        Versi simple: tidak pakai index, langsung cari semua input dan isi yang terakhir
        Args:
            data: dict dengan keys: pernyataan, keterlaksanaan, pelaksanaan, bukti_pendukung
        """
        try:
            # Tunggu lebih lama agar row benar-benar muncul
            time.sleep(2)
            
            # Scroll ke bagian tabel
            tabel_a_section = self.driver.find_element(By.XPATH, 
                "//h4[contains(., 'Tabel A')]")
            self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", tabel_a_section)
            time.sleep(1)
            
            # Cari semua input fields di Tabel A
            # Field pernyataan (placeholder: 'Isi pernyataan standar')
            if 'pernyataan' in data:
                inputs = self.driver.find_elements(By.XPATH, 
                    "//h4[contains(., 'Tabel A')]/following-sibling::div//input[@placeholder='Isi pernyataan standar']")
                if inputs:
                    last_input = inputs[-1]  # Ambil input terakhir (row baru)
                    self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", last_input)
                    time.sleep(0.3)
                    last_input.clear()
                    last_input.send_keys(data['pernyataan'])
                    print(f"      ✓ Pernyataan: {data['pernyataan']}")
            
            # Field keterlaksanaan (placeholder: 'Isi keterlaksanaan')
            if 'keterlaksanaan' in data:
                inputs = self.driver.find_elements(By.XPATH, 
                    "//h4[contains(., 'Tabel A')]/following-sibling::div//input[@placeholder='Isi keterlaksanaan']")
                if inputs:
                    last_input = inputs[-1]
                    self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", last_input)
                    time.sleep(0.3)
                    last_input.clear()
                    last_input.send_keys(data['keterlaksanaan'])
                    print(f"      ✓ Keterlaksanaan: {data['keterlaksanaan']}")
            
            # Field pelaksanaan (placeholder: 'Isi pelaksanaan')
            if 'pelaksanaan' in data:
                try:
                    inputs = self.driver.find_elements(By.XPATH, 
                        "//h4[contains(., 'Tabel A')]/following-sibling::div//input[@placeholder='Isi pelaksanaan']")
                    if inputs:
                        last_input = inputs[-1]
                        self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", last_input)
                        time.sleep(0.3)
                        last_input.clear()
                        last_input.send_keys(data['pelaksanaan'])
                        print(f"      ✓ Pelaksanaan: {data['pelaksanaan']}")
                except:
                    pass  # Field mungkin tidak ada
            
            # Field bukti pendukung (placeholder: 'Isi link bukti pendukung')
            if 'bukti_pendukung' in data:
                try:
                    inputs = self.driver.find_elements(By.XPATH, 
                        "//h4[contains(., 'Tabel A')]/following-sibling::div//input[@placeholder='Isi link bukti pendukung']")
                    if inputs:
                        last_input = inputs[-1]
                        self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", last_input)
                        time.sleep(0.3)
                        last_input.clear()
                        last_input.send_keys(data['bukti_pendukung'])
                        print(f"      ✓ Bukti Pendukung: {data['bukti_pendukung']}")
                except:
                    pass  # Field mungkin tidak ada
            
            return True
        except Exception as e:
            print(f"Error fill penetapan row: {e}")
            import traceback
            traceback.print_exc()
            return False
    
    def fill_penetapan_row(self, row_index, data):
        """
        Isi data row di Penetapan Tabel A (berdasarkan index)
        Args:
            row_index: index row (0-based, akan dikonversi ke 1-based untuk XPath)
            data: dict dengan keys: pernyataan, keterlaksanaan, pelaksanaan, bukti_pendukung
        
        NOTE: Untuk isi row yang baru ditambah, gunakan fill_penetapan_row_simple() lebih reliable
        """
        try:
            # Tunggu sebentar agar row muncul
            time.sleep(1.5)
            
            # Get all rows untuk verify ada berapa
            rows = self.driver.find_elements(By.XPATH, 
                "//h4[contains(., 'Tabel A')]/following-sibling::div//tr[contains(@class, 'border')]")
            
            print(f"   [DEBUG] Total rows: {len(rows)}, Target row_index: {row_index}")
            
            if row_index >= len(rows):
                print(f"   [ERROR] row_index {row_index} melebihi jumlah rows {len(rows)}")
                return False
            
            # Scroll ke section
            tabel_a_section = self.driver.find_element(By.XPATH, 
                "//h4[contains(., 'Tabel A')]")
            self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", tabel_a_section)
            time.sleep(0.5)
            
            # XPath menggunakan 1-based indexing
            xpath_index = row_index + 1
            row_xpath_base = f"(//h4[contains(., 'Tabel A')]/following-sibling::div//tr[contains(@class, 'border')])[{xpath_index}]"
            
            print(f"   [DEBUG] XPath base: {row_xpath_base}")
            
            # Field 1: Pernyataan
            if 'pernyataan' in data:
                pernyataan_input = self.driver.find_element(By.XPATH, 
                    f"{row_xpath_base}//td[1]//input")
                pernyataan_input.clear()
                pernyataan_input.send_keys(data['pernyataan'])
            
            # Field 2: Keterlaksanaan
            if 'keterlaksanaan' in data:
                keterlaksanaan_input = self.driver.find_element(By.XPATH, 
                    f"{row_xpath_base}//td[2]//input")
                keterlaksanaan_input.clear()
                keterlaksanaan_input.send_keys(data['keterlaksanaan'])
            
            # Field 3: Pelaksanaan (jika ada)
            if 'pelaksanaan' in data:
                try:
                    pelaksanaan_input = self.driver.find_element(By.XPATH, 
                        f"{row_xpath_base}//td[3]//input")
                    pelaksanaan_input.clear()
                    pelaksanaan_input.send_keys(data['pelaksanaan'])
                except:
                    pass  # Field mungkin tidak ada di semua tabel
            
            # Field 4: Bukti Pendukung (jika ada)
            if 'bukti_pendukung' in data:
                try:
                    bukti_input = self.driver.find_element(By.XPATH, 
                        f"{row_xpath_base}//td[4]//input")
                    bukti_input.clear()
                    bukti_input.send_keys(data['bukti_pendukung'])
                except:
                    pass  # Field mungkin tidak ada di semua tabel
            
            return True
        except Exception as e:
            print(f"Error fill penetapan row: {e}")
            import traceback
            traceback.print_exc()
            return False
    
    def get_row_count_penetapan_a(self):
        """Hitung jumlah rows di Penetapan Tabel A"""
        try:
            rows = self.driver.find_elements(By.XPATH, 
                "//h4[contains(., 'Tabel A')]/following-sibling::div//tr[contains(@class, 'border')]")
            return len(rows)
        except:
            return 0
    
    def click_delete_first_row_penetapan_a(self):
        """Klik tombol delete di row pertama Penetapan Tabel A"""
        try:
            # Scroll ke tabel
            tabel_section = self.driver.find_element(By.XPATH, "//h4[contains(., 'Tabel A')]")
            self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", tabel_section)
            time.sleep(0.5)
            
            # Cari tombol delete pertama
            delete_btn = self.wait.until(EC.element_to_be_clickable(
                (By.XPATH, "(//h4[contains(., 'Tabel A')]/following-sibling::div//button[@title='Hapus'])[1]")
            ))
            
            # Scroll ke button
            self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", delete_btn)
            time.sleep(0.3)
            
            # Click dengan multiple strategies
            try:
                delete_btn.click()
            except ElementClickInterceptedException:
                ActionChains(self.driver).move_to_element(delete_btn).click().perform()
            
            time.sleep(1)
            return True
        except Exception as e:
            print(f"Error delete row: {e}")
            return False
    
    def click_simpan_draft(self):
        """Klik tombol Simpan sebagai Draft"""
        try:
            # Scroll ke atas untuk akses tombol
            self.driver.execute_script("window.scrollTo(0, 0);")
            time.sleep(1)
            
            # Tunggu tombol clickable
            btn = self.wait.until(EC.element_to_be_clickable(self.BTN_SIMPAN_DRAFT))
            
            # Click dengan multiple strategies
            try:
                btn.click()
            except ElementClickInterceptedException:
                self.driver.execute_script("arguments[0].click();", btn)
            
            time.sleep(3)
            return True
        except Exception as e:
            print(f"Error klik simpan draft: {e}")
            return False
    
    def click_ajukan_review(self):
        """Klik tombol Ajukan untuk Review"""
        try:
            # Scroll ke atas untuk akses tombol
            self.driver.execute_script("window.scrollTo(0, 0);")
            time.sleep(1)
            
            # Tunggu tombol clickable
            btn = self.wait.until(EC.element_to_be_clickable(self.BTN_AJUKAN_REVIEW))
            
            # Click dengan multiple strategies
            try:
                btn.click()
            except ElementClickInterceptedException:
                self.driver.execute_script("arguments[0].click();", btn)
            
            time.sleep(3)
            return True
        except Exception as e:
            print(f"Error klik ajukan review: {e}")
            return False
    
    def is_redirected_to_bukti_pendukung(self):
        """Cek apakah sudah redirect ke halaman Bukti Pendukung"""
        try:
            current_url = self.driver.current_url
            return 'bukti-pendukung' in current_url.lower()
        except:
            return False
    
    def wait_for_popup_disappear(self, timeout=5):
        """Tunggu popup sukses hilang"""
        try:
            # Tunggu popup muncul dulu
            popup = WebDriverWait(self.driver, 3).until(
                EC.presence_of_element_located(self.SUCCESS_POPUP)
            )
            # Tunggu popup hilang
            WebDriverWait(self.driver, timeout).until(
                EC.invisibility_of_element(popup)
            )
        except TimeoutException:
            pass  # Popup mungkin sudah hilang atau tidak muncul
    
    def get_first_row_data_penetapan_a(self):
        """Ambil data row pertama dari Penetapan Tabel A"""
        try:
            row_xpath = "(//h4[contains(., 'Tabel A')]/following-sibling::div//tr[contains(@class, 'border')])[1]"
            
            data = {}
            
            # Ambil pernyataan
            try:
                pernyataan = self.driver.find_element(By.XPATH, f"{row_xpath}//td[1]//input").get_attribute('value')
                data['pernyataan'] = pernyataan
            except:
                data['pernyataan'] = ''
            
            # Ambil keterlaksanaan
            try:
                keterlaksanaan = self.driver.find_element(By.XPATH, f"{row_xpath}//td[2]//input").get_attribute('value')
                data['keterlaksanaan'] = keterlaksanaan
            except:
                data['keterlaksanaan'] = ''
            
            # Ambil pelaksanaan (jika ada)
            try:
                pelaksanaan = self.driver.find_element(By.XPATH, f"{row_xpath}//td[3]//input").get_attribute('value')
                data['pelaksanaan'] = pelaksanaan
            except:
                data['pelaksanaan'] = ''
            
            # Ambil bukti pendukung (jika ada)
            try:
                bukti = self.driver.find_element(By.XPATH, f"{row_xpath}//td[4]//input").get_attribute('value')
                data['bukti_pendukung'] = bukti
            except:
                data['bukti_pendukung'] = ''
            
            return data
        except Exception as e:
            print(f"Error get row data: {e}")
            return {}
    
    def click_catatan_p4m(self):
        """Klik tombol Catatan P4M"""
        try:
            btn = self.wait.until(EC.element_to_be_clickable(self.BTN_CATATAN_P4M))
            btn.click()
            time.sleep(1)
            return True
        except Exception as e:
            print(f"Error klik catatan P4M: {e}")
            return False
