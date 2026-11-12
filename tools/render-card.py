# -*- coding: utf-8 -*-
"""
Рендер визиток из assets/brand/card/index.html.

На каждую сторону (a-front, a-back, b-..., c-...):
  · PDF в натуральный размер с вылетами (94×54 или 54×94 мм) — в типографию;
  · PNG 300 dpi с вылетами — для просмотра/согласования.
Плюс overview.png — вся страница вариантов, как её видит заказчик.

Запуск:  python tools/render-card.py           (сервер не нужен, file://)
Результат: assets/brand/card/out/
"""

from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
PAGE = (ROOT / "assets" / "brand" / "card" / "index.html").as_uri()
OUT = ROOT / "assets" / "brand" / "card" / "out"

SIDES = {
    "a-front": (94, 54), "a-back": (94, 54),
    "b-front": (94, 54), "b-back": (94, 54),
    "c-front": (54, 94), "c-back": (54, 94),
}
DPI_SCALE = 300 / 96


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p:
        b = p.chromium.launch()

        ov = b.new_page(viewport={"width": 1140, "height": 900}, device_scale_factor=2)
        ov.goto(PAGE)
        ov.wait_for_load_state("networkidle")
        ov.evaluate("document.fonts.ready")
        ov.screenshot(path=str(OUT / "overview.png"), full_page=True)
        ov.close()

        for side, (w, h) in SIDES.items():
            pg = b.new_page(device_scale_factor=DPI_SCALE)
            pg.goto(f"{PAGE}?side={side}")
            pg.wait_for_load_state("networkidle")
            pg.evaluate("document.fonts.ready")
            pg.locator(f"#{side}").screenshot(path=str(OUT / f"{side}-300dpi.png"))
            pg.pdf(path=str(OUT / f"{side}.pdf"), width=f"{w}mm", height=f"{h}mm",
                   print_background=True, margin={"top": "0", "right": "0", "bottom": "0", "left": "0"})
            pg.close()
        b.close()
    print("готово:", OUT)


if __name__ == "__main__":
    main()

