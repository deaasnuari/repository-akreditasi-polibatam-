"""
Page Objects Module
Berisi page object classes untuk automated testing
"""

from .login_page import LoginPage, DashboardPage
from .manajemen_akun_page import ManajemenAkunPage
from .dashboard_tim_akreditasi_page import DashboardTimAkreditasiPage, LKPSPage, LEDPage, BuktiPendukungPage
from .lkps_page import LKPSPage as LKPSCRUDPage
from .led_page import LEDPage as LEDCRUDPage
from .matriks_penilaian_page import MatriksPenilaianPage
from .export_page import ExportPage
from .p4m_dashboard_page import P4MDashboardPage, P4MReviewLKPSPage, P4MReviewLEDPage

__all__ = [
    'LoginPage', 
    'DashboardPage', 
    'ManajemenAkunPage',
    'DashboardTimAkreditasiPage',
    'LKPSPage',
    'LEDPage',
    'BuktiPendukungPage',
    'LKPSCRUDPage',
    'LEDCRUDPage',
    'MatriksPenilaianPage',
    'ExportPage',
    'P4MDashboardPage',
    'P4MReviewLKPSPage',
    'P4MReviewLEDPage'
]
