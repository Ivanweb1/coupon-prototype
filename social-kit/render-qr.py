# -*- coding: utf-8 -*-
"""
PNG QR-билетов: qr-coupons.html?bare=1 → out/qr/qr-a.png … (1080×1350, ×2).

Запуск:  python social-kit/render-qr.py
"""

import os
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "out" / "qr"


def main():
    launch = {}
    if os.path.exists("/opt/pw-browsers/chromium"):
        launch["executable_path"] = "/opt/pw-browsers/chromium"
    OUT.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(**launch)
        page = browser.new_page(viewport={"width": 1080, "height": 1350}, device_scale_factor=2)
        page.goto((ROOT / "qr-coupons.html").as_uri() + "?bare=1", wait_until="networkidle")
        page.evaluate("document.fonts.ready")
        page.wait_for_timeout(400)
        for el in page.query_selector_all(".tile"):
            path = OUT / (el.get_attribute("data-name") + ".png")
            el.screenshot(path=str(path))
            print(path.relative_to(ROOT))
        browser.close()


if __name__ == "__main__":
    main()
