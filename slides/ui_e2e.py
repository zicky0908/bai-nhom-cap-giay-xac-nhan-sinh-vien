"""Chạy kịch bản demo bằng giao diện web (như người trình bày bấm) và chụp màn hình cho slide."""
import json, time, urllib.request
from playwright.sync_api import sync_playwright

APP, MAIL = 'http://localhost:8000', 'http://localhost:8025'
def detail(cid): return json.load(urllib.request.urlopen(f'{APP}/api/requests/{cid}'))
def wait(cid, pred, what, t=60):
    end = time.time() + t
    while time.time() < end:
        d = detail(cid)
        if pred(d): print('OK:', what); return d
        time.sleep(1)
    r = d['request']; raise SystemExit(f'FAIL: {what} (status={r["status"]}, automation={r["automation_status"]})')

with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1440, 'height': 900}, device_scale_factor=1.5)
    pg.goto(APP + '/')
    pg.fill('input[name=student_id]', '25MSB43044'); pg.fill('input[name=full_name]', 'Nguyễn Văn An')
    pg.fill('input[name=email]', 'an.nguyen@example.edu.vn')
    pg.fill('textarea[name=purpose]', 'Nộp cho Ban chỉ huy quân sự phường để xin tạm hoãn nghĩa vụ quân sự')
    pg.screenshot(path='shots/student_form.png')
    pg.click('button:has-text("Gửi yêu cầu")'); pg.wait_for_load_state('networkidle')
    cid = pg.url.rstrip('/').split('/')[-1]; print('OK: nộp hồ sơ qua form ->', cid)
    wait(cid, lambda d: d['request']['status'] == 'PRECHECK_OK', 'n8n tiền kiểm PRECHECK_OK')
    pg.reload(); pg.wait_for_timeout(800); pg.screenshot(path='shots/student_status.png', full_page=True)
    for action in ('claim', 'approve', 'issue'):
        pg.goto(f'{APP}/staff/requests/{cid}'); pg.wait_for_load_state('networkidle')
        pg.locator(f'form[action$="/actions/{action}"] button').first.click(); pg.wait_for_load_state('networkidle')
        print('OK: cán bộ bấm', action)
    d = wait(cid, lambda d: d['request']['status'] == 'ISSUED' and d['request']['automation_status'] == 'SYNCED'
             and d['events'][-1]['activity'] == 'NOTIFY_SENT', 'thông báo cấp giấy SYNCED')
    pg.goto(f'{APP}/staff/requests/{cid}'); pg.wait_for_load_state('networkidle'); pg.wait_for_timeout(800)
    pg.screenshot(path='shots/staff_detail.png', full_page=True)
    pg.goto(APP + '/staff'); pg.wait_for_load_state('networkidle'); pg.screenshot(path='shots/staff_filled.png')
    msgs = json.load(urllib.request.urlopen(MAIL + '/api/v1/messages'))
    hits = [m for m in msgs['messages'] if cid in m.get('Subject', '') + json.dumps(m, ensure_ascii=False)]
    print(f'OK: Mailpit có {len(hits)} thư cho {cid}')
    pg.goto(MAIL + '/'); pg.wait_for_load_state('networkidle'); pg.wait_for_timeout(800); pg.screenshot(path='shots/mailpit.png')
    pg.goto(f'{MAIL}/view/{hits[0]["ID"]}'); pg.wait_for_load_state('networkidle'); pg.wait_for_timeout(1200)
    pg.screenshot(path='shots/mail_open.png')
    pg.goto(APP + '/analytics'); pg.wait_for_load_state('networkidle'); pg.wait_for_timeout(1500)
    pg.screenshot(path='shots/analytics.png', full_page=True)
    print('PASS UI E2E:', cid); b.close()
