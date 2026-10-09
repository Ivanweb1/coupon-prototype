# -*- coding: utf-8 -*-
"""
QR-коды для купонов-билетов (qr-coupons.html): SVG, по файлу на цвет.

Уровень коррекции H — середину кода можно закрыть логотипом (до ~30 %
модулей), он всё равно читается. Поэтому в центре оставляем «окно»:
модули под ним не рисуем, на странице туда встаёт значок.

Запуск:  python social-kit/build-qr.py   (нужен pip install qrcode)
Результат — social-kit/qr/*.svg
"""

from pathlib import Path

import qrcode
from qrcode.constants import ERROR_CORRECT_H

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "qr"

CODES = {
    "site": "https://vsekupony.ru",
}
COLORS = {"red": "#DD443C", "ink": "#1B1B1B", "white": "#FFFFFF"}


def matrix(data):
    qr = qrcode.QRCode(error_correction=ERROR_CORRECT_H, border=0)
    qr.add_data(data)
    qr.make(fit=True)
    return qr.get_matrix()


def svg(m, color, hole):
    n = len(m)
    # окно под логотип — квадрат ~22 % стороны по центру, целыми модулями
    k = round(n * 0.22) | 1 if hole else 0
    a = (n - k) // 2
    d = []
    for y, row in enumerate(m):
        for x, on in enumerate(row):
            if not on or (a <= x < a + k and a <= y < a + k):
                continue
            d.append(f"M{x},{y}h1v1h-1z")
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {n} {n}" '
            f'shape-rendering="crispEdges"><path fill="{color}" d="{"".join(d)}"/></svg>\n')


def finder(m, x, y):
    return x < 7 and y < 7 or x >= len(m) - 7 and y < 7 or x < 7 and y >= len(m) - 7


def dots(m, color, eye):
    """Точечный QR: модули — кружки, «глазки» — скруглённая рамка и квадрат
    с цветной серединой (как в референсе «отсканируй меня»)."""
    n = len(m)
    out = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-0.5 -0.5 {n + 1} {n + 1}">']
    d = []
    for y, row in enumerate(m):
        for x, on in enumerate(row):
            if on and not finder(m, x, y):
                d.append(f"M{x + .5},{y + .08}a.42,.42 0 1 1 0,.84a.42,.42 0 1 1 0-.84z")
    out.append(f'<path fill="{color}" d="{"".join(d)}"/>')
    for fx, fy in ((0, 0), (n - 7, 0), (0, n - 7)):
        out.append(f'<rect x="{fx + .5}" y="{fy + .5}" width="6" height="6" rx="1.7" fill="none" '
                   f'stroke="{color}" stroke-width="1"/>')
        out.append(f'<rect x="{fx + 2}" y="{fy + 2}" width="3" height="3" rx=".9" fill="{color}"/>')
        out.append(f'<rect x="{fx + 2.6}" y="{fy + 2.6}" width="1.8" height="1.8" rx=".5" fill="{eye}"/>')
    return "".join(out) + "</svg>\n"


DOTS = {"ink": ("#1B1B1B", "#DD443C"), "white": ("#FFFFFF", "#DD443C")}


def main():
    OUT.mkdir(exist_ok=True)
    for name, data in CODES.items():
        m = matrix(data)
        for cname, color in COLORS.items():
            for hole in (True, False):
                f = OUT / f"qr-{name}-{cname}{'' if hole else '-full'}.svg"
                f.write_text(svg(m, color, hole), encoding="utf-8")
                print(f.relative_to(ROOT))
        for cname, (color, eye) in DOTS.items():
            f = OUT / f"qr-{name}-dots-{cname}.svg"
            f.write_text(dots(m, color, eye), encoding="utf-8")
            print(f.relative_to(ROOT))


if __name__ == "__main__":
    main()
