"""
Page Object untuk Dashboard P4M (Reviewer)
Halaman untuk review LKPS dan LED
"""

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select
from selenium.webdriver.common.action_chains import ActionChains
import time


class P4MDashboardPage:
    """
    Page Object untuk halaman Dashboard P4M
    URL: /dashboard/p4m
    """
    
    # URL
    URL = "http://localhost:3000/dashboard/p4m"
    
    # Locators - Header
    HEADING = (By.XPATH, "//h1[contains(text(), 'Dashboard P4M')]")
    
    # Locators - Statistik
    STAT_TOTAL = (By.XPATH, "//div[contains(., 'Total Dokumen')]//p[contains(@class, 'text-3xl')]")
    STAT_MENUNGGU = (By.XPATH, "//div[contains(., 'Menunggu')]//p[contains(@class, 'text-3xl')]")
    STAT_DITERIMA = (By.XPATH, "//div[contains(., 'Diterima')]//p[contains(@class, 'text-3xl')]")
    STAT_PERLU_REVISI = (By.XPATH, "//div[contains(., 'Perlu Revisi')]//p[contains(@class, 'text-3xl')]")
    
    # Locators - Filters
    FILTER_KATEGORI = (By.XPATH, "//select[.//option[contains(text(), 'Kategori')]]")
    FILTER_STATUS = (By.XPATH, "//select[.//option[contains(text(), 'Status')]]")
    SEARCH_INPUT = (By.XPATH, "//input[@type='text' and @placeholder]")
    
    # Locators - Items/Cards
    ITEM_CARDS = (By.XPATH, "//div[contains(@class, 'bg-white') and .//h3]")
    
    # Locators - Buttons
    BTN_REVIEW = (By.XPATH, "//button[contains(., 'Review') or contains(., 'Lihat')]")
    BTN_REVIEW_LKPS = (By.XPATH, "//a[contains(@href, '/reviewLKPS')]")
    BTN_REVIEW_LED = (By.XPATH, "//a[contains(@href, '/reviewLED')]")
    
    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, 10)
        self.actions = ActionChains(driver)
    
    def open(self):
        """Buka halaman Dashboard P4M"""
        self.driver.get(self.URL)
        time.sleep(2)
    
    def is_loaded(self):
        """Cek apakah halaman sudah dimuat"""
        try:
            self.wait.until(EC.presence_of_element_located(self.HEADING))
            return True
        except:
            return False
    
    def get_stats(self):
        """Ambil statistik dokumen"""
        try:
            stats = {
                'total': 0,
                'menunggu': 0,
                'diterima': 0,
                'perlu_revisi': 0
            }
            
            try:
                total = self.driver.find_element(*self.STAT_TOTAL)
                stats['total'] = int(total.text)
            except:
                pass
            
            try:
                menunggu = self.driver.find_element(*self.STAT_MENUNGGU)
                stats['menunggu'] = int(menunggu.text)
            except:
                pass
            
            try:
                diterima = self.driver.find_element(*self.STAT_DITERIMA)
                stats['diterima'] = int(diterima.text)
            except:
                pass
            
            try:
                perlu_revisi = self.driver.find_element(*self.STAT_PERLU_REVISI)
                stats['perlu_revisi'] = int(perlu_revisi.text)
            except:
                pass
            
            return stats
        except Exception as e:
            print(f"Error getting stats: {e}")
            return None
    
    def get_all_items(self):
        """
        Ambil semua item dokumen untuk review
        
        Returns:
            list: List of dict dengan info dokumen
        """
        try:
            items = []
            cards = self.driver.find_elements(*self.ITEM_CARDS)
            
            for card in cards:
                try:
                    # Ambil judul
                    title_elem = card.find_element(By.XPATH, ".//h3")
                    judul = title_elem.text.strip()
                    
                    # Ambil kategori (LKPS/LED)
                    try:
                        kategori_elem = card.find_element(By.XPATH, ".//span[contains(@class, 'bg-blue') or contains(@class, 'bg-green') or contains(@class, 'bg-purple')]")
                        kategori = kategori_elem.text.strip()
                    except:
                        kategori = 'Unknown'
                    
                    # Ambil status
                    try:
                        status_elem = card.find_element(By.XPATH, ".//span[contains(., 'Menunggu') or contains(., 'Diterima') or contains(., 'Perlu Revisi')]")
                        status = status_elem.text.strip()
                    except:
                        status = 'Unknown'
                    
                    # Ambil button review
                    try:
                        review_btn = card.find_element(By.XPATH, ".//button[contains(., 'Review')] | .//a[contains(., 'Review')]")
                    except:
                        review_btn = None
                    
                    items.append({
                        'judul': judul,
                        'kategori': kategori,
                        'status': status,
                        'card_element': card,
                        'review_button': review_btn
                    })
                    
                except Exception as e:
                    print(f"Error parsing card: {e}")
                    continue
            
            return items
            
        except Exception as e:
            print(f"Error getting items: {e}")
            return []
    
    def filter_by_kategori(self, kategori):
        """
        Filter dokumen berdasarkan kategori
        
        Args:
            kategori: Semua Kategori / LKPS / LED / Bukti Pendukung
        """
        try:
            select = Select(self.driver.find_element(*self.FILTER_KATEGORI))
            select.select_by_visible_text(kategori)
            time.sleep(1)
            return True
        except Exception as e:
            print(f"Error filtering by kategori: {e}")
            return False
    
    def filter_by_status(self, status):
        """
        Filter dokumen berdasarkan status
        
        Args:
            status: Semua Status / Menunggu / Diterima / Perlu Revisi
        """
        try:
            select = Select(self.driver.find_element(*self.FILTER_STATUS))
            select.select_by_visible_text(status)
            time.sleep(1)
            return True
        except Exception as e:
            print(f"Error filtering by status: {e}")
            return False
    
    def search_item(self, keyword):
        """Cari item berdasarkan keyword"""
        try:
            search_input = self.driver.find_element(*self.SEARCH_INPUT)
            search_input.clear()
            search_input.send_keys(keyword)
            time.sleep(1)
            return True
        except Exception as e:
            print(f"Error searching: {e}")
            return False
    
    def click_review_item(self, index=0):
        """
        Klik tombol review pada item tertentu
        
        Args:
            index: Index item (0-based)
        """
        try:
            items = self.get_all_items()
            
            if index >= len(items):
                print(f"Index {index} out of range")
                return False
            
            item = items[index]
            
            if item['review_button']:
                self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", item['review_button'])
                time.sleep(0.5)
                
                try:
                    item['review_button'].click()
                except:
                    self.driver.execute_script("arguments[0].click();", item['review_button'])
                
                time.sleep(2)
                return True
            else:
                print(f"Review button not found for item {index}")
                return False
                
        except Exception as e:
            print(f"Error clicking review: {e}")
            return False
    
    def get_item_count(self):
        """Hitung jumlah item yang tampil"""
        try:
            cards = self.driver.find_elements(*self.ITEM_CARDS)
            return len(cards)
        except:
            return 0


class P4MReviewLKPSPage:
    """Page Object untuk Review LKPS"""
    
    URL = "http://localhost:3000/dashboard/p4m/reviewLKPS"
    
    # Locators
    HEADING = (By.XPATH, "//h1[contains(text(), 'Review LKPS')]")
    TABS = (By.XPATH, "//button[contains(@class, 'tab') or @role='tab']")
    
    # Document info
    DOC_TITLE = (By.XPATH, "//h2 | //h3[contains(@class, 'text')]")
    DOC_SUBMITTER = (By.XPATH, "//*[contains(text(), 'Disubmit oleh') or contains(text(), 'Oleh')]")
    DOC_DATE = (By.XPATH, "//*[contains(text(), 'Tanggal') or contains(text(), 'Waktu')]")
    
    # Form review
    TEXTAREA_CATATAN = (By.XPATH, "//textarea[@placeholder or @name='catatan' or @name='komentar']")
    SELECT_STATUS = (By.XPATH, "//select[@name='status']")
    BTN_SUBMIT_REVIEW = (By.XPATH, "//button[contains(., 'Submit') or contains(., 'Kirim') or contains(., 'Simpan')]")
    
    # Status badge/label
    STATUS_BADGE = (By.XPATH, "//span[contains(@class, 'badge') or contains(@class, 'status')]")
    
    # Document content/preview
    DOC_CONTENT = (By.XPATH, "//div[contains(@class, 'content') or contains(@class, 'preview')]")
    
    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, 10)
        self.actions = ActionChains(driver)
    
    def open(self, user_id=None):
        """Buka halaman Review LKPS"""
        url = self.URL
        if user_id:
            url += f"?userId={user_id}"
        self.driver.get(url)
        time.sleep(2)
    
    def is_loaded(self):
        """Cek apakah halaman dimuat"""
        try:
            self.wait.until(EC.presence_of_element_located(self.HEADING))
            return True
        except:
            return False
    
    def get_document_info(self):
        """Dapatkan informasi dokumen yang sedang direview"""
        info = {}
        try:
            title = self.driver.find_element(*self.DOC_TITLE)
            info['title'] = title.text
        except:
            info['title'] = None
        
        try:
            submitter = self.driver.find_element(*self.DOC_SUBMITTER)
            info['submitter'] = submitter.text
        except:
            info['submitter'] = None
        
        try:
            date = self.driver.find_element(*self.DOC_DATE)
            info['date'] = date.text
        except:
            info['date'] = None
        
        return info
    
    def get_tabs(self):
        """Dapatkan daftar tab yang tersedia"""
        try:
            tabs = self.driver.find_elements(*self.TABS)
            return [tab.text for tab in tabs if tab.text]
        except:
            return []
    
    def click_tab(self, tab_name):
        """Klik tab tertentu"""
        try:
            tabs = self.driver.find_elements(*self.TABS)
            for tab in tabs:
                if tab_name.lower() in tab.text.lower():
                    tab.click()
                    time.sleep(1)
                    return True
            return False
        except Exception as e:
            print(f"Error clicking tab: {e}")
            return False
    
    def input_catatan(self, catatan):
        """Input catatan review"""
        try:
            textarea = self.wait.until(EC.presence_of_element_located(self.TEXTAREA_CATATAN))
            textarea.clear()
            textarea.send_keys(catatan)
            return True
        except Exception as e:
            print(f"Error input catatan: {e}")
            return False
    
    def select_status(self, status):
        """Pilih status review (Diterima/Perlu Revisi)"""
        try:
            select_elem = self.driver.find_element(*self.SELECT_STATUS)
            select = Select(select_elem)
            select.select_by_visible_text(status)
            return True
        except Exception as e:
            print(f"Error selecting status: {e}")
            return False
    
    def submit_review(self):
        """Submit review"""
        try:
            btn = self.wait.until(EC.element_to_be_clickable(self.BTN_SUBMIT_REVIEW))
            btn.click()
            time.sleep(2)
            return True
        except Exception as e:
            print(f"Error submitting review: {e}")
            return False
    
    def get_current_status(self):
        """Dapatkan status dokumen saat ini"""
        try:
            badge = self.driver.find_element(*self.STATUS_BADGE)
            return badge.text
        except:
            return None


class P4MReviewLEDPage:
    """Page Object untuk Review LED"""
    
    URL = "http://localhost:3000/dashboard/p4m/reviewLED"
    
    # Locators
    HEADING = (By.XPATH, "//h1[contains(text(), 'Review LED')]")
    TABS = (By.XPATH, "//button[contains(@class, 'tab') or @role='tab']")
    
    # Document info
    DOC_TITLE = (By.XPATH, "//h2 | //h3[contains(@class, 'text')]")
    DOC_SUBMITTER = (By.XPATH, "//*[contains(text(), 'Disubmit oleh') or contains(text(), 'Oleh')]")
    DOC_DATE = (By.XPATH, "//*[contains(text(), 'Tanggal') or contains(text(), 'Waktu')]")
    
    # Form review
    TEXTAREA_CATATAN = (By.XPATH, "//textarea[@placeholder or @name='catatan' or @name='komentar']")
    SELECT_STATUS = (By.XPATH, "//select[@name='status']")
    BTN_SUBMIT_REVIEW = (By.XPATH, "//button[contains(., 'Submit') or contains(., 'Kirim') or contains(., 'Simpan')]")
    
    # Status badge/label
    STATUS_BADGE = (By.XPATH, "//span[contains(@class, 'badge') or contains(@class, 'status')]")
    
    # Document content/preview
    DOC_CONTENT = (By.XPATH, "//div[contains(@class, 'content') or contains(@class, 'preview')]")
    
    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, 10)
        self.actions = ActionChains(driver)
    
    def open(self, tab=None, user_id=None):
        """Buka halaman Review LED"""
        url = self.URL
        params = []
        if tab:
            params.append(f"tab={tab}")
        if user_id:
            params.append(f"userId={user_id}")
        
        if params:
            url += "?" + "&".join(params)
        
        self.driver.get(url)
        time.sleep(2)
    
    def is_loaded(self):
        """Cek apakah halaman dimuat"""
        try:
            self.wait.until(EC.presence_of_element_located(self.HEADING))
            return True
        except:
            return False
    
    def get_document_info(self):
        """Dapatkan informasi dokumen yang sedang direview"""
        info = {}
        try:
            title = self.driver.find_element(*self.DOC_TITLE)
            info['title'] = title.text
        except:
            info['title'] = None
        
        try:
            submitter = self.driver.find_element(*self.DOC_SUBMITTER)
            info['submitter'] = submitter.text
        except:
            info['submitter'] = None
        
        try:
            date = self.driver.find_element(*self.DOC_DATE)
            info['date'] = date.text
        except:
            info['date'] = None
        
        return info
    
    def get_tabs(self):
        """Dapatkan daftar tab yang tersedia"""
        try:
            tabs = self.driver.find_elements(*self.TABS)
            return [tab.text for tab in tabs if tab.text]
        except:
            return []
    
    def click_tab(self, tab_name):
        """Klik tab tertentu"""
        try:
            tabs = self.driver.find_elements(*self.TABS)
            for tab in tabs:
                if tab_name.lower() in tab.text.lower():
                    tab.click()
                    time.sleep(1)
                    return True
            return False
        except Exception as e:
            print(f"Error clicking tab: {e}")
            return False
    
    def input_catatan(self, catatan):
        """Input catatan review"""
        try:
            textarea = self.wait.until(EC.presence_of_element_located(self.TEXTAREA_CATATAN))
            textarea.clear()
            textarea.send_keys(catatan)
            return True
        except Exception as e:
            print(f"Error input catatan: {e}")
            return False
    
    def select_status(self, status):
        """Pilih status review (Diterima/Perlu Revisi)"""
        try:
            select_elem = self.driver.find_element(*self.SELECT_STATUS)
            select = Select(select_elem)
            select.select_by_visible_text(status)
            return True
        except Exception as e:
            print(f"Error selecting status: {e}")
            return False
    
    def submit_review(self):
        """Submit review"""
        try:
            btn = self.wait.until(EC.element_to_be_clickable(self.BTN_SUBMIT_REVIEW))
            btn.click()
            time.sleep(2)
            return True
        except Exception as e:
            print(f"Error submitting review: {e}")
            return False
    
    def get_current_status(self):
        """Dapatkan status dokumen saat ini"""
        try:
            badge = self.driver.find_element(*self.STATUS_BADGE)
            return badge.text
        except:
            return None
