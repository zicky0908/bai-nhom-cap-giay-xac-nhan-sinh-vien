from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':1440,'height':900},device_scale_factor=1.5)
    for name,url in [('staff_filled','http://localhost:8000/staff'),('mailpit','http://localhost:8025/')]:
        pg.goto(url,wait_until='networkidle'); pg.wait_for_timeout(1200); pg.screenshot(path=f'shots/{name}.png')
    pg.goto('http://localhost:8025/',wait_until='networkidle'); pg.wait_for_timeout(800)
    pg.locator('a.message, .message, [class*=message]').first.click(); pg.wait_for_timeout(1500); pg.screenshot(path='shots/mail_open.png')
    pg.goto('http://localhost:8000/staff',wait_until='networkidle'); pg.locator('table a').first.click(); pg.wait_for_load_state('networkidle'); pg.wait_for_timeout(1000)
    pg.screenshot(path='shots/staff_detail.png',full_page=True); print(pg.url)
    b.close()
