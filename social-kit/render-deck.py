# -*- coding: utf-8 -*-
"""
Рендер презентации для бизнеса: PDF и PNG каждого слайда 1920×1080.

Источник — social-kit/deck.html в режиме ?bare=1 (натуральная величина).
PDF — печатью страницы, по слайду на лист; PNG — снимком каждого слайда.

Запуск:
    python social-kit/render-deck.py                # город по умолчанию
    python social-kit/render-deck.py --city Ельца   # другой город
    python social-kit/render-deck.py --png          # только PNG, PDF не трогать
    python social-kit/render-deck.py --src deck-v2  # копия с правками → out/deck-v2/

Результат — out/deck/: vsekupony-deck.pdf и slide-01.png … slide-05.png.
Нужны playwright и chromium (в облачной среде — /opt/pw-browsers/chromium).
"""

import argparse
import io
import os
from pathlib import Path
from urllib.parse import quote

from PIL import Image
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--png", action="store_true", help="только PNG, без PDF")
    ap.add_argument("--city", help="город, родительный падеж: Ельца (если есть на слайдах)")
    ap.add_argument("--src", default="deck", help="страница без .html: deck или deck-v2")
    args = ap.parse_args()
    PAGE = ROOT / (args.src + ".html")
    OUT = ROOT / "out" / args.src

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
        if args.png:
            browser.close()
            return
        # PDF — из снимков слайдов в двойном разрешении, а не печатью страницы:
        # тени и фильтры в «векторном» PDF некоторые просмотрщики (Просмотр
        # на Mac, Figma) рисуют серыми плашками. Картинка выглядит везде одинаково.
        hi = browser.new_page(viewport={"width": 1920, "height": 1080}, device_scale_factor=2)
        hi.goto(url, wait_until="networkidle")
        hi.evaluate("document.fonts.ready")
        hi.wait_for_timeout(300)
        shots = []
        for el in hi.query_selector_all(".slide"):
            shots.append(Image.open(io.BytesIO(el.screenshot(type="jpeg", quality=92))).convert("RGB"))
        pdf = OUT / ("vsekupony-" + args.src + ".pdf")
        shots[0].save(pdf, save_all=True, append_images=shots[1:], resolution=144)
        print(pdf.relative_to(ROOT))
        browser.close()


if __name__ == "__main__":
    main()
