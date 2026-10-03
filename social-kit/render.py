# -*- coding: utf-8 -*-
"""
Рендер упаковки соцсетей в PNG точного размера.

Источник один — social-kit/index.html. Снимается каждый артборд с
атрибутом data-out, в натуральную величину (?bare=1, масштаб 1:1), так что
PNG не может разойтись с вёрсткой. Имя файла и папка площадки берутся из
data-out: out/vk/vk-cover-1920x768.png и т. д.

Запуск:
    python social-kit/render.py               # город по умолчанию
    python social-kit/render.py --city Ельца  # другой город в заголовках

Нужны playwright и chromium (в облачной среде — /opt/pw-browsers/chromium).
"""

import argparse
import os
from pathlib import Path
from urllib.parse import quote

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent
PAGE = ROOT / "index.html"
OUT = ROOT / "out"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--city")
    args = ap.parse_args()

    url = PAGE.as_uri() + "?bare=1"
    if args.city:
        url += "&city=" + quote(args.city)

    launch = {}
    if os.path.exists("/opt/pw-browsers/chromium"):
        launch["executable_path"] = "/opt/pw-browsers/chromium"

    with sync_playwright() as p:
        browser = p.chromium.launch(**launch)
        page = browser.new_page(viewport={"width": 2200, "height": 1200}, device_scale_factor=1)
        page.goto(url, wait_until="networkidle")
        page.evaluate("document.fonts.ready")
        page.wait_for_timeout(300)
        for el in page.query_selector_all("[data-out]"):
            name = el.get_attribute("data-out")
            path = OUT / (name + ".png")
            path.parent.mkdir(parents=True, exist_ok=True)
            el.screenshot(path=str(path))
            box = el.bounding_box()
            print(f"{path.relative_to(ROOT)}  {int(box['width'])}×{int(box['height'])}")
        browser.close()


if __name__ == "__main__":
    main()
