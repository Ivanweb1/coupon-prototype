# -*- coding: utf-8 -*-
"""
Рендер макетов для соцсетей в PNG точного размера.

Источник один — assets/brand/social/index.html. Снимается не страница, а
каждый артборд по его id, поэтому PNG всегда равен тому, что видно на
странице, и размеры не могут разойтись с вёрсткой. Страница открывается в
режиме ?bare=1: без подписей и теней подложки.

Масштабирования нет: артборды свёрстаны в натуральную величину, снимок
идёт при device_scale_factor = 1. Иначе площадка пережмёт уже пережатое и
съест тонкие линии.

Запуск:
    python tools/render-social.py                 # всё, город по умолчанию
    python tools/render-social.py --city Воронежа # другой город
    python tools/render-social.py --guides        # с безопасными зонами

Результат — assets/brand/social/out/.
Нужны playwright с установленным chromium и Pillow.
"""

import argparse
from pathlib import Path
from urllib.parse import quote

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
PAGE = ROOT / "assets" / "brand" / "social" / "index.html"
OUT = PAGE.parent / "out"

# id артборда на странице -> (ширина, высота, имя PNG)
# Размеры — натуральные для площадки, без запаса: ВК и ОК принимают ровно
# эти холсты.
BOARDS = {
    "vk-cover": (1920, 768, "vk-cover"),
    "ok-cover": (1944, 600, "ok-cover"),
    "avatar-vk": (1000, 1000, "avatar-vk"),
    "avatar-ok": (1000, 1000, "avatar-ok"),
    "avatar-tg": (1000, 1000, "avatar-tg"),
    "avatar-max": (1000, 1000, "avatar-max"),
    "vk-mobile": (1080, 1920, "vk-mobile"),
    "menu-how": (376, 256, "menu-how"),
    "menu-place": (376, 256, "menu-place"),
    "menu-price": (376, 256, "menu-price"),
    "menu-partner": (376, 256, "menu-partner"),
    "menu-faq": (376, 256, "menu-faq"),
    "menu-contacts": (376, 256, "menu-contacts"),
    "menu-eda": (376, 256, "menu-eda"),
    "menu-krasota": (376, 256, "menu-krasota"),
    "menu-avto": (376, 256, "menu-avto"),
    "menu-sport": (376, 256, "menu-sport"),
    "menu-razvlecheniya": (376, 256, "menu-razvlecheniya"),
    "menu-detyam": (376, 256, "menu-detyam"),
    "post-45": (1080, 1350, "post-45"),
    "post-11": (1080, 1080, "post-11"),
}

# Рабочая копия под размер площадки: имя PNG -> сторона в пикселях.
# Крупный исходник остаётся рядом — он нужен для Figma и на случай, если
# площадка поменяет требования.
DOWNSCALE = {
    "avatar-vk": 400,
    "avatar-ok": 400,
    "avatar-tg": 800,
    "avatar-max": 512,
}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--city", default="",
                    help="город в родительном падеже — заголовок обложек")
    ap.add_argument("--city-nom", default="", dest="city_nom",
                    help="город в именительном падеже — подпись на аватарах")
    ap.add_argument("--v", choices=["2", "3"], default=None,
                    help="второй или третий вариант оформления (?v=2 / ?v=3)")
    ap.add_argument("--guides", action="store_true",
                    help="наложить безопасные зоны площадок поверх макетов")
    args = ap.parse_args()

    OUT.mkdir(parents=True, exist_ok=True)

    params = ["bare=1"]
    if args.city:
        params.append("city=" + quote(args.city))
    if args.city_nom:
        params.append("cityNom=" + quote(args.city_nom))
    if args.v:
        params.append("v=" + args.v)
    if args.guides:
        params.append("guides=1")
    url = PAGE.as_uri() + "?" + "&".join(params)
    suffix = (f"-v{args.v}" if args.v else "") + ("-guides" if args.guides else "")

    print("Рендер в", OUT.relative_to(ROOT))
    with sync_playwright() as p:
        browser = p.chromium.launch()
        # Окно шире самого широкого артборда (1944) — иначе страница
        # поедет в горизонтальный скролл и часть макета не отрисуется.
        page = browser.new_page(viewport={"width": 2100, "height": 1200},
                                device_scale_factor=1)
        page.goto(url, wait_until="networkidle")
        # Шрифт тянется с Google Fonts: без ожидания снимок иногда уходит
        # с системной подстановкой и другой шириной строк.
        page.evaluate("document.fonts.ready")
        page.wait_for_timeout(400)

        for board_id, (w, h, name) in BOARDS.items():
            el = page.locator("#" + board_id)
            if el.count() == 0:
                print(f"  пропущен: на странице нет #{board_id}")
                continue

            # Проверяем, что артборд действительно того размера, под
            # который заявлен: вёрстку правят чаще, чем этот список.
            box = el.bounding_box()
            if round(box["width"]) != w or round(box["height"]) != h:
                print(f"  ВНИМАНИЕ #{board_id}: на странице "
                      f"{round(box['width'])}×{round(box['height'])}, "
                      f"а ожидается {w}×{h}")

            target = OUT / f"{name}-{w}x{h}{suffix}.png"
            el.screenshot(path=str(target))
            print(f"  {target.relative_to(ROOT)}")

            # Уменьшенные копии — через Pillow, а не вторым снимком: так
            # все размеры гарантированно одной и той же картинки.
            if not args.guides and name in DOWNSCALE:
                from PIL import Image
                side = DOWNSCALE[name]
                with Image.open(target) as im:
                    small = OUT / f"{name}-{side}x{side}{suffix}.png"
                    im.resize((side, side), Image.LANCZOS).save(small)
                    print(f"  {small.relative_to(ROOT)}")

        browser.close()


if __name__ == "__main__":
    main()
