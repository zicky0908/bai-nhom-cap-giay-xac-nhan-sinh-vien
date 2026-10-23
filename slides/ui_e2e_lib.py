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

