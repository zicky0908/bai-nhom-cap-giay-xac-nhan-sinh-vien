"""Vòng yêu cầu bổ sung qua giao diện: cán bộ yêu cầu bổ sung (có lý do) -> SV gửi lại -> n8n tiền kiểm lại."""
from ui_e2e_lib import *

with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1440, 'height': 900}, device_scale_factor=1.5)
    pg.goto(APP + '/')
    pg.fill('input[name=student_id]', '25MSB43051'); pg.fill('input[name=full_name]', 'Trần Thị Bình')
    pg.fill('input[name=email]', 'binh.tran@example.edu.vn'); pg.fill('textarea[name=purpose]', 'Bổ sung hồ sơ vay vốn ngân hàng chính sách')
    pg.click('button:has-text("Gửi yêu cầu")'); pg.wait_for_load_state('networkidle')
    cid = pg.url.rstrip('/').split('/')[-1]; print('OK: nộp', cid)
    wait(cid, lambda d: d['request']['status'] == 'PRECHECK_OK', 'tiền kiểm lần 1')
    pg.goto(f'{APP}/staff/requests/{cid}'); pg.locator('form[action$="/actions/claim"] button').click(); pg.wait_for_load_state('networkidle')
    pg.locator('summary:has-text("Yêu cầu bổ sung")').click()
    f = pg.locator('form[action$="/actions/request-supplement"]'); f.locator('textarea, input[name=reason]').first.fill('Thiếu xác nhận của ngân hàng về khoản vay')
    f.locator('button').click(); pg.wait_for_load_state('networkidle')
    wait(cid, lambda d: d['request']['status'] == 'NEED_SUPPLEMENT' and d['request']['automation_status'] == 'SYNCED', 'yêu cầu bổ sung + email SYNCED')
    pg.goto(f'{APP}/requests/{cid}'); pg.wait_for_load_state('networkidle'); pg.screenshot(path='shots/student_supplement.png', full_page=True)
    sf = pg.locator('form[action$="/actions/supplement"]')
    sf.locator('textarea[name=reason]').fill('Đã bổ sung giấy xác nhận khoản vay của ngân hàng')
    sf.locator('button').click(); pg.wait_for_load_state('networkidle')
    d = wait(cid, lambda d: d['request']['status'] == 'PRECHECK_OK' and d['request']['attempt_no'] == 2, 'SV gửi lại, attempt_no=2, tiền kiểm lại')
    print('PASS UI supplement:', cid, 'events', len(d['events'])); b.close()
