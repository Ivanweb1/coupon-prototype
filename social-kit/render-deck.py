# -*- coding: utf-8 -*-
"""
Рендер презентации для бизнеса: PDF и PNG каждого слайда 1920×1080.

Источник — social-kit/deck.html в режиме ?bare=1 (натуральная величина).
PDF — печатью страницы, по слайду на лист; PNG — снимком каждого слайда.

Запуск:
    python social-kit/render-deck.py                # город по умолчанию
    python social-kit/render-deck.py --city Ельца   # другой город

Результат — out/deck/: vsekupony-deck.pdf и slide-01.png … slide-05.png.
Нужны playwright и chromium (в облачной среде — /opt/pw-browsers/chromium).
"""

import argparse
import os
from pathlib import Path
from urllib.parse import quote

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent
PAGE = ROOT / "deck.html"
OUT = ROOT / "out" / "deck"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--city", help="город, родительный падеж: Ельца (если есть на слайдах)")
    args = ap.parse_args()

    url = PAGE.as_uri() + "?bare=1"
    if args.city:
        url += "&city=" + quote(args.city)

    launch = {}
    if os.path.exists("/opt/pw-browsers/chromium"):
        launch["executable_path"] = "/opt/pw-browsers/chromium"

    OUT.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(**launch)
        page = browser.new_page(viewport={"width": 1920, "height": 1080}, device_scale_factor=1)
        page.goto(url, wait_until="networkidle")
        page.evaluate("document.fonts.ready")
        page.wait_for_timeout(300)
        for i, el in enumerate(page.query_selector_all(".slide"), 1):
            path = OUT / f"slide-{i:02d}.png"
            el.screenshot(path=str(path))
            print(path.relative_to(ROOT))
        pdf = OUT / "vsekupony-deck.pdf"
        page.pdf(path=str(pdf), width="1920px", height="1080px", print_background=True,
                 margin={"top": "0", "right": "0", "bottom": "0", "left": "0"})
        print(pdf.relative_to(ROOT))
        browser.close()


if __name__ == "__main__":
    main()
