"""
Setup Helper untuk Selenium Tests
Otomatis install dependencies dan cek konfigurasi
"""

import subprocess
import sys
import os
from pathlib import Path


def print_header(text):
    """Print header dengan border"""
    print("\n" + "="*60)
    print(f"  {text}")
    print("="*60)


def print_step(number, text):
    """Print step dengan format"""
    print(f"\n[{number}] {text}")


def check_python_version():
    """Cek versi Python"""
    print_step("✓", "Checking Python version...")
    version = sys.version_info
    print(f"    Python {version.major}.{version.minor}.{version.micro}")
    
    if version.major < 3 or (version.major == 3 and version.minor < 7):
        print("    ⚠️  Warning: Python 3.7+ recommended")
    else:
        print("    ✅ Python version OK")


def install_dependencies():
    """Install dependencies dari requirements.txt"""
    print_step("📦", "Installing dependencies...")
    
    requirements_file = Path(__file__).parent / "requirements.txt"
    
    if not requirements_file.exists():
        print("    ❌ requirements.txt not found!")
        return False
    
    try:
        subprocess.check_call([
            sys.executable, "-m", "pip", "install", "-r", str(requirements_file)
        ])
        print("    ✅ Dependencies installed successfully")
        return True
    except subprocess.CalledProcessError:
        print("    ❌ Failed to install dependencies")
        return False


def check_chromedriver():
    """Cek apakah ChromeDriver tersedia"""
    print_step("🔍", "Checking ChromeDriver...")
    
    try:
        from selenium import webdriver
        from selenium.webdriver.chrome.service import Service
        
        # Try to create a driver
        options = webdriver.ChromeOptions()
        options.add_argument('--headless')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        
        driver = webdriver.Chrome(options=options)
        driver.quit()
        
        print("    ✅ ChromeDriver is available")
        return True
    except Exception as e:
        print(f"    ⚠️  ChromeDriver issue: {str(e)}")
        print("    💡 Tip: Install with 'pip install webdriver-manager'")
        return False


def check_server(url, name):
    """Cek apakah server berjalan"""
    try:
        import requests
        response = requests.get(url, timeout=2)
        if response.status_code < 500:
            print(f"    ✅ {name} is running at {url}")
            return True
    except:
        print(f"    ❌ {name} is NOT running at {url}")
        return False


def check_servers():
    """Cek apakah frontend dan backend berjalan"""
    print_step("🌐", "Checking servers...")
    
    frontend_ok = check_server("http://localhost:3000", "Frontend")
    backend_ok = check_server("http://localhost:5000", "Backend")
    
    if not frontend_ok or not backend_ok:
        print("\n    💡 Start servers before running tests:")
        print("       Terminal 1: cd frontend && npm run dev")
        print("       Terminal 2: cd backend && npm run dev")


def show_credentials_reminder():
    """Tampilkan reminder untuk update kredensial"""
    print_step("🔐", "Credentials Configuration")
    
    print("""
    ⚠️  IMPORTANT: Update test credentials!
    
    Edit these files and change:
        VALID_EMAIL = "your@email.com"
        VALID_PASSWORD = "yourpassword"
    
    Files to update:
        - test_login.py (line ~38)
        - test_login_pom.py (line ~18)
    
    Make sure these credentials exist in your database!
    """)


def show_run_instructions():
    """Tampilkan instruksi untuk menjalankan test"""
    print_step("🚀", "How to Run Tests")
    
    print("""
    Choose one of these commands:
    
    1. Basic test (for beginners):
       python ../test_selenium.py
    
    2. Unittest (structured):
       python test_login.py
    
    3. Page Object Pattern (advanced):
       python test_login_pom.py
    
    4. Run specific test:
       python -m unittest test_login.LoginTestCase.test_01_page_loads
    
    5. Verbose mode:
       python -m unittest test_login -v
    """)


def main():
    """Main setup function"""
    print_header("🔧 SELENIUM TESTS SETUP")
    
    # 1. Check Python version
    check_python_version()
    
    # 2. Install dependencies
    install_dependencies()
    
    # 3. Check ChromeDriver
    check_chromedriver()
    
    # 4. Check servers
    check_servers()
    
    # 5. Show credentials reminder
    show_credentials_reminder()
    
    # 6. Show run instructions
    show_run_instructions()
    
    print_header("✅ SETUP COMPLETE")
    print("""
    You're ready to run tests!
    
    Quick start:
        1. Make sure servers are running
        2. Update credentials in test files
        3. Run: python test_login.py
    
    Need help? Read QUICKSTART.md or README.md
    """)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n❌ Setup interrupted by user")
    except Exception as e:
        print(f"\n\n❌ Setup failed: {str(e)}")
        import traceback
        traceback.print_exc()
