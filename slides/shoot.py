"""Chụp màn hình prototype staging cho slide (1440x900)."""
import sys
from playwright.sync_api import sync_playwright

PAGES = dict(student='http://localhost:8000/', staff='http://localhost:8000/staff',
             analytics='http://localhost:8000/analytics', mailpit='http://localhost:8025/',
             n8n='http://localhost:5678/')
only = sys.argv[1:] or list(PAGES)
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 1440, 'height': 900}, device_scale_factor=1.5)
    for name in only:
        pg.goto(PAGES[name], wait_until='networkidle', timeout=30000)
        pg.wait_for_timeout(1500)
        pg.screenshot(path=f'shots/{name}.png', full_page=name == 'analytics')
        print(name, pg.title())
    b.close()
