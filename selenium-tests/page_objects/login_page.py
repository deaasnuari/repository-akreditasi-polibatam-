"""
Page Object Model untuk halaman Login
Memisahkan logic test dari implementasi UI
"""

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select


class LoginPage:
    """Page Object untuk halaman login"""
    
    # Locators
    EMAIL_INPUT = (By.XPATH, "//input[@type='email']")
    PASSWORD_INPUT = (By.XPATH, "//input[@type='password']")
    ROLE_SELECT = (By.TAG_NAME, "select")
    SUBMIT_BUTTON = (By.XPATH, "//button[@type='submit']")
    ERROR_MESSAGE = (By.XPATH, "//div[contains(@class, 'bg-red-50')]")
    HEADING = (By.XPATH, "//h1[contains(text(), 'Login')]")
    
    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, 10)
    
    def open(self):
        """Buka halaman login"""
        self.driver.get("http://localhost:3000/login")
        return self
    
    def is_loaded(self):
        """Cek apakah halaman sudah dimuat"""
        try:
            self.wait.until(EC.presence_of_element_located(self.HEADING))
            return True
        except:
            return False
    
    def get_email_input(self):
        """Dapatkan element email input"""
        return self.wait.until(EC.presence_of_element_located(self.EMAIL_INPUT))
    
    def get_password_input(self):
        """Dapatkan element password input"""
        return self.driver.find_element(*self.PASSWORD_INPUT)
    
    def get_role_select(self):
        """Dapatkan element role select"""
        return self.driver.find_element(*self.ROLE_SELECT)
    
    def get_submit_button(self):
        """Dapatkan element submit button"""
        return self.driver.find_element(*self.SUBMIT_BUTTON)
    
    def enter_email(self, email):
        """Isi email"""
        email_input = self.get_email_input()
        email_input.clear()
        email_input.send_keys(email)
        return self
    
    def enter_password(self, password):
        """Isi password"""
        password_input = self.get_password_input()
        password_input.clear()
        password_input.send_keys(password)
        return self
    
    def select_role(self, role):
        """Pilih role"""
        role_select = self.get_role_select()
        select = Select(role_select)
        select.select_by_value(role)
        return self
    
    def click_submit(self):
        """Klik tombol submit"""
        submit_button = self.get_submit_button()
        submit_button.click()
        return self
    
    def login(self, email, password, role="TU"):
        """
        Perform login action
        Metode utama untuk login dengan satu pemanggilan
        """
        self.enter_email(email)
        self.enter_password(password)
        self.select_role(role)
        self.click_submit()
        return self
    
    def get_error_message(self):
        """Dapatkan error message jika ada"""
        try:
            error_element = self.driver.find_element(*self.ERROR_MESSAGE)
            return error_element.text
        except:
            return None
    
    def has_error(self):
        """Cek apakah ada error message"""
        return self.get_error_message() is not None
    
    def get_current_url(self):
        """Dapatkan URL saat ini"""
        return self.driver.current_url
    
    def is_redirected_to_dashboard(self):
        """Cek apakah redirect ke dashboard"""
        return "/dashboard" in self.get_current_url()
    
    def get_button_text(self):
        """Dapatkan teks tombol submit"""
        return self.get_submit_button().text
    
    def is_button_disabled(self):
        """Cek apakah tombol disabled"""
        return self.get_submit_button().get_attribute("disabled") is not None
    
    def get_available_roles(self):
        """Dapatkan daftar role yang tersedia"""
        role_select = self.get_role_select()
        select = Select(role_select)
        return [(option.get_attribute("value"), option.text) 
                for option in select.options]


class DashboardPage:
    """Page Object untuk halaman dashboard"""
    
    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, 10)
    
    def get_current_url(self):
        """Dapatkan URL dashboard saat ini"""
        return self.driver.current_url
    
    def is_tim_akreditasi_dashboard(self):
        """Cek apakah di dashboard Tim Akreditasi"""
        return "/dashboard/tim-akreditasi" in self.get_current_url()
    
    def is_p4m_dashboard(self):
        """Cek apakah di dashboard P4M"""
        return "/dashboard/p4m" in self.get_current_url()
    
    def is_tu_dashboard(self):
        """Cek apakah di dashboard Tata Usaha"""
        return "/dashboard/tata-usaha" in self.get_current_url()
