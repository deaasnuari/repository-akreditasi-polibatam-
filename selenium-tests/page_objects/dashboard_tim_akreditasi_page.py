"""
Page Object Model untuk Dashboard Tim Akreditasi
"""

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time


class DashboardTimAkreditasiPage:
    """Page Object untuk dashboard Tim Akreditasi"""
    
    # Locators
    PAGE_HEADING = (By.XPATH, "//h2[contains(text(), 'Repository Digital Data Akreditasi')]")
    INFO_BANNER = (By.XPATH, "//div[contains(@class, 'bg-blue-100')]")
    
    # Menu items
    MENU_DASHBOARD = (By.XPATH, "//span[contains(text(), 'Dashboard')]")
    MENU_LKPS = (By.XPATH, "//span[contains(text(), 'Laporan Kinerja Program Studi')]")
    MENU_LED = (By.XPATH, "//span[contains(text(), 'Laporan Evaluasi Diri')]")
    MENU_BUKTI = (By.XPATH, "//span[contains(text(), 'Bukti Pendukung')]")
    MENU_MATRIKS = (By.XPATH, "//span[contains(text(), 'Matriks Penilaian')]")
    MENU_EXPORT = (By.XPATH, "//span[contains(text(), 'Export')]")
    
    # Notification
    BTN_NOTIFICATION = (By.XPATH, "//button[@aria-label='Notifikasi']")
    NOTIFICATION_BADGE = (By.XPATH, "//span[contains(@class, 'bg-red-500')]")
    
    # Last login info
    LAST_LOGIN = (By.XPATH, "//p[contains(text(), 'Terakhir Login')]/following-sibling::p")
    
    # User menu
    USER_ICON = (By.XPATH, "//*[name()='svg' and contains(@class, 'lucide-user')]")
    LOGOUT_BUTTON = (By.XPATH, "//button[contains(., 'Logout') or contains(., 'Keluar')]")
    
    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, 10)
    
    def open(self):
        """Buka dashboard Tim Akreditasi"""
        self.driver.get("http://localhost:3000/dashboard/tim-akreditasi")
        return self
    
    def is_loaded(self):
        """Cek apakah halaman sudah dimuat"""
        try:
            self.wait.until(EC.presence_of_element_located(self.PAGE_HEADING))
            return True
        except:
            return False
    
    def is_on_dashboard(self):
        """Cek apakah berada di dashboard Tim Akreditasi"""
        return "/dashboard/tim-akreditasi" in self.driver.current_url
    
    def get_page_heading(self):
        """Dapatkan heading halaman"""
        try:
            element = self.driver.find_element(*self.PAGE_HEADING)
            return element.text
        except:
            return None
    
    def get_last_login_text(self):
        """Dapatkan teks terakhir login"""
        try:
            element = self.driver.find_element(*self.LAST_LOGIN)
            return element.text
        except:
            return None
    
    def has_notification_badge(self):
        """Cek apakah ada badge notifikasi"""
        try:
            self.driver.find_element(*self.NOTIFICATION_BADGE)
            return True
        except:
            return False
    
    def click_notification(self):
        """Klik tombol notifikasi"""
        btn = self.driver.find_element(*self.BTN_NOTIFICATION)
        btn.click()
        time.sleep(0.5)
        return self
    
    def is_menu_visible(self, menu_name):
        """Cek apakah menu tertentu visible"""
        menu_map = {
            "Dashboard": self.MENU_DASHBOARD,
            "LKPS": self.MENU_LKPS,
            "LED": self.MENU_LED,
            "Bukti Pendukung": self.MENU_BUKTI,
            "Matriks": self.MENU_MATRIKS,
            "Export": self.MENU_EXPORT,
        }
        
        if menu_name not in menu_map:
            return False
        
        try:
            self.driver.find_element(*menu_map[menu_name])
            return True
        except:
            return False
    
    def click_menu(self, menu_name):
        """Klik menu tertentu"""
        menu_map = {
            "Dashboard": self.MENU_DASHBOARD,
            "LKPS": self.MENU_LKPS,
            "LED": self.MENU_LED,
            "Bukti Pendukung": self.MENU_BUKTI,
            "Matriks": self.MENU_MATRIKS,
            "Export": self.MENU_EXPORT,
        }
        
        if menu_name in menu_map:
            element = self.wait.until(EC.element_to_be_clickable(menu_map[menu_name]))
            element.click()
            time.sleep(1)
        
        return self
    
    def get_current_url(self):
        """Dapatkan URL saat ini"""
        return self.driver.current_url
    
    def logout(self):
        """Logout dari dashboard"""
        try:
            # Cari tombol logout
            logout_btn = self.driver.find_element(*self.LOGOUT_BUTTON)
            logout_btn.click()
            time.sleep(1)
        except:
            # Alternative: bisa juga via URL
            self.driver.get("http://localhost:3000/login")
        return self


class LKPSPage:
    """Page Object untuk halaman LKPS"""
    
    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, 10)
    
    def is_loaded(self):
        """Cek apakah halaman LKPS sudah dimuat"""
        return "/lkps" in self.driver.current_url


class LEDPage:
    """Page Object untuk halaman LED"""
    
    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, 10)
    
    def is_loaded(self):
        """Cek apakah halaman LED sudah dimuat"""
        return "/led" in self.driver.current_url


class BuktiPendukungPage:
    """Page Object untuk halaman Bukti Pendukung"""
    
    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, 10)
    
    def is_loaded(self):
        """Cek apakah halaman Bukti Pendukung sudah dimuat"""
        return "/bukti-pendukung" in self.driver.current_url
