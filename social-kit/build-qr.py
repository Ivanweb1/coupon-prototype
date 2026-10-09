# -*- coding: utf-8 -*-
"""
QR-коды на vsekupony.ru в фирменном стиле — несколько вариантов.

Одна матрица на все варианты (segno, уровень коррекции H — запас под логотип
и фигурные модули), меняется только рисовка: форма модулей, «глазки»,
подложка и подпись. Язык тот же, что у упаковки соцсетей (kit.css):
белый, нейтральные серые, чёрный и один красный #DD443C, без градиентов;
шрифт Onest; шар-логотип; красный билетик с полукруглыми вырезами;
плашка с наклоном −2°.

Каждый вариант — самостоятельный SVG в social-kit/qr/: шрифт и логотип
вшиты внутрь, файл открывается где угодно и тащится в Figma. PNG-превью
снимаются в social-kit/out/qr/ (chromium headless).

Запуск:
    python social-kit/build-qr.py            # SVG + PNG
    python social-kit/build-qr.py --no-png   # только SVG

Нужны segno и Pillow (pip install segno pillow).
"""

import argparse
import base64
import math
import random
import shutil
import subprocess
from pathlib import Path

import segno
from PIL import Image

ROOT = Path(__file__).resolve().parent
OUT_SVG = ROOT / "qr"
OUT_PNG = ROOT / "out" / "qr"
BRAND = ROOT.parent / "assets" / "brand"

URL = "https://vsekupony.ru"

RED = "#DD443C"
INK = "#1B1B1B"
INK2 = "#565656"
INK3 = "#8A8A8A"
LINE = "#D3D3D3"
SURFACE = "#F6F6F6"

Q = segno.make(URL, error="h", micro=False)
M = [[bool(v) for v in row] for row in Q.matrix]
N = len(M)


def b64(path):
    return base64.b64encode(path.read_bytes()).decode()


FONT_CSS = "".join(
    "@font-face{font-family:'Onest';font-weight:400 800;"
    f"src:url(data:font/woff2;base64,{b64(ROOT / 'fonts' / f)}) format('woff2');"
    f"unicode-range:{rng}}}"
    for f, rng in [
        ("onest-latin.woff2", "U+0000-00FF,U+2013-2014,U+2192"),
        ("onest-cyrillic.woff2", "U+0400-045F"),
    ]
)
LOGO = {
    "red": "data:image/png;base64," + b64(BRAND / "logo-red.png"),
    "white": "data:image/png;base64," + b64(BRAND / "logo-white.png"),
}
LOGO_RATIO = 357 / 600  # ширина / высота шара


def f(v):
    """Короткая запись чисел в путях."""
    return f"{v:.2f}".rstrip("0").rstrip(".")


# --------------------------------------------------------------------------
# Матрица
# --------------------------------------------------------------------------

def dark(r, c):
    return 0 <= r < N and 0 <= c < N and M[r][c]


def in_finder(r, c):
    return (r < 7 and c < 7) or (r < 7 and c >= N - 7) or (r >= N - 7 and c < 7)


FINDERS = [(0, 0), (0, N - 7), (N - 7, 0)]


def clear_center(radius):
    """Модули, которые убираем под логотип: круг в центре, в модулях."""
    mid = (N - 1) / 2

    def keep(r, c):
        return math.hypot(r - mid, c - mid) > radius
    return keep


def always(r, c):
    return True


# --------------------------------------------------------------------------
# Модули
# --------------------------------------------------------------------------

def mod_squares(x0, y0, s, keep=always):
    """Обычные квадраты, слитые в горизонтальные отрезки."""
    d = []
    for r in range(N):
        c = 0
        while c < N:
            if dark(r, c) and not in_finder(r, c) and keep(r, c):
                c1 = c
                while c1 + 1 < N and dark(r, c1 + 1) and not in_finder(r, c1 + 1) and keep(r, c1 + 1):
                    c1 += 1
                d.append(f"M{f(x0 + c * s)},{f(y0 + r * s)}h{f((c1 - c + 1) * s)}v{f(s)}h{f(-(c1 - c + 1) * s)}z")
                c = c1 + 1
            else:
                c += 1
    return "".join(d)


def mod_rounded(x0, y0, s, keep=always, k=0.24):
    """Отдельные квадратики со скруглёнными углами, с зазором."""
    g = s * 0.08
    rr = s * k
    out = []
    for r in range(N):
        for c in range(N):
            if dark(r, c) and not in_finder(r, c) and keep(r, c):
                out.append(f'<rect x="{f(x0 + c * s + g)}" y="{f(y0 + r * s + g)}" width="{f(s - 2 * g)}" height="{f(s - 2 * g)}" rx="{f(rr)}"/>')
    return "".join(out)


def mod_dots(x0, y0, s, keep=always, k=0.44):
    out = []
    for r in range(N):
        for c in range(N):
            if dark(r, c) and not in_finder(r, c) and keep(r, c):
                out.append(f'<circle cx="{f(x0 + (c + .5) * s)}" cy="{f(y0 + (r + .5) * s)}" r="{f(s * k)}"/>')
    return "".join(out)


def mod_liquid(x0, y0, s, keep=always):
    """Модули слиты в «капли»: угол скругляется, если с обеих его сторон пусто."""
    def on(r, c):
        return dark(r, c) and not in_finder(r, c) and keep(r, c)
    R = s / 2
    d = []
    for r in range(N):
        for c in range(N):
            if not on(r, c):
                continue
            up, dn, lf, rt = on(r - 1, c), on(r + 1, c), on(r, c - 1), on(r, c + 1)
            tl = 0 if (up or lf) else R
            tr = 0 if (up or rt) else R
            br = 0 if (dn or rt) else R
            bl = 0 if (dn or lf) else R
            x, y = x0 + c * s, y0 + r * s
            p = f"M{f(x + tl)},{f(y)}H{f(x + s - tr)}"
            if tr:
                p += f"A{f(tr)},{f(tr)} 0 0 1 {f(x + s)},{f(y + tr)}"
            p += f"V{f(y + s - br)}"
            if br:
                p += f"A{f(br)},{f(br)} 0 0 1 {f(x + s - br)},{f(y + s)}"
            p += f"H{f(x + bl)}"
            if bl:
                p += f"A{f(bl)},{f(bl)} 0 0 1 {f(x)},{f(y + s - bl)}"
            p += f"V{f(y + tl)}"
            if tl:
                p += f"A{f(tl)},{f(tl)} 0 0 1 {f(x + tl)},{f(y)}"
            d.append(p + "Z")
    return "".join(d)


def ticket_path(x, y, w, h, notch, corner):
    """Билетик: прямоугольник со скруглёнными углами и полукруглыми вырезами по бокам."""
    m = y + h / 2
    k, n = corner, notch
    return (
        f"M{f(x + k)},{f(y)}H{f(x + w - k)}A{f(k)},{f(k)} 0 0 1 {f(x + w)},{f(y + k)}"
        f"V{f(m - n)}A{f(n)},{f(n)} 0 0 0 {f(x + w)},{f(m + n)}"
        f"V{f(y + h - k)}A{f(k)},{f(k)} 0 0 1 {f(x + w - k)},{f(y + h)}"
        f"H{f(x + k)}A{f(k)},{f(k)} 0 0 1 {f(x)},{f(y + h - k)}"
        f"V{f(m + n)}A{f(n)},{f(n)} 0 0 0 {f(x)},{f(m - n)}"
        f"V{f(y + k)}A{f(k)},{f(k)} 0 0 1 {f(x + k)},{f(y)}Z"
    )


def mod_tickets(x0, y0, s, keep=always, red_share=0.0, seed=7):
    """Каждый горизонтальный отрезок модулей — билетик с вырезами на концах.
    Часть длинных билетиков красные: QR, собранный из купонов."""
    rnd = random.Random(seed)
    ink, red = [], []
    for r in range(N):
        c = 0
        while c < N:
            if dark(r, c) and not in_finder(r, c) and keep(r, c):
                c1 = c
                while c1 + 1 < N and dark(r, c1 + 1) and not in_finder(r, c1 + 1) and keep(r, c1 + 1):
                    c1 += 1
                ln = c1 - c + 1
                p = ticket_path(x0 + c * s + s * .04, y0 + r * s + s * .09, ln * s - s * .08, s * .82, s * .17, s * .14)
                (red if ln >= 3 and rnd.random() < red_share else ink).append(p)
                c = c1 + 1
            else:
                c += 1
    return "".join(ink), "".join(red)


# --------------------------------------------------------------------------
# «Глазки» — три угловых квадрата
# --------------------------------------------------------------------------

def finders(x0, y0, s, style, outer, inner=None):
    inner = inner or outer
    out = []
    for fr, fc in FINDERS:
        x, y = x0 + fc * s, y0 + fr * s
        cx, cy = x + 3.5 * s, y + 3.5 * s
        if style == "square":
            out.append(f'<path fill="{outer}" fill-rule="evenodd" d="M{f(x)},{f(y)}h{f(7*s)}v{f(7*s)}h{f(-7*s)}zM{f(x+s)},{f(y+s)}v{f(5*s)}h{f(5*s)}v{f(-5*s)}z"/>')
            out.append(f'<rect fill="{inner}" x="{f(x+2*s)}" y="{f(y+2*s)}" width="{f(3*s)}" height="{f(3*s)}"/>')
        elif style == "round":
            out.append(f'<rect fill="none" stroke="{outer}" stroke-width="{f(s)}" x="{f(x+s/2)}" y="{f(y+s/2)}" width="{f(6*s)}" height="{f(6*s)}" rx="{f(1.7*s)}"/>')
            out.append(f'<rect fill="{inner}" x="{f(x+2*s)}" y="{f(y+2*s)}" width="{f(3*s)}" height="{f(3*s)}" rx="{f(.9*s)}"/>')
        elif style == "circle":
            out.append(f'<circle fill="none" stroke="{outer}" stroke-width="{f(s)}" cx="{f(cx)}" cy="{f(cy)}" r="{f(3*s)}"/>')
            out.append(f'<circle fill="{inner}" cx="{f(cx)}" cy="{f(cy)}" r="{f(1.5*s)}"/>')
        elif style == "ticket":
            out.append(f'<rect fill="none" stroke="{outer}" stroke-width="{f(s)}" x="{f(x+s/2)}" y="{f(y+s/2)}" width="{f(6*s)}" height="{f(6*s)}" rx="{f(1.3*s)}"/>')
            out.append(f'<path fill="{inner}" d="{ticket_path(x+2*s, y+2*s, 3*s, 3*s, .5*s, .5*s)}"/>')
    return "".join(out)


# --------------------------------------------------------------------------
# Общее
# --------------------------------------------------------------------------

def svg(w, h, body, label):
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" '
        f'viewBox="0 0 {w} {h}" width="{w}" height="{h}" role="img" aria-label="{label}">'
        f"<style>{FONT_CSS}text{{font-family:Onest,sans-serif}}</style>"
        f"{body}</svg>\n"
    )


def logo(color, cx, cy, h, rot=0):
    w = h * LOGO_RATIO
    t = f' transform="rotate({rot} {f(cx)} {f(cy)})"' if rot else ""
    return f'<image href="{LOGO[color]}" x="{f(cx - w/2)}" y="{f(cy - h/2)}" width="{f(w)}" height="{f(h)}"{t}/>'


def red_ticket(cx, cy, text, size, rot=-2, fill=RED, color="#fff"):
    """Красный билетик выгоды с текстом — как бейдж на карточке купона."""
    w = len(text) * size * .58 + size * 1.24
    h = size * 1.36
    x, y = cx - w / 2, cy - h / 2
    return (
        f'<g transform="rotate({rot} {f(cx)} {f(cy)})">'
        f'<path fill="{fill}" d="{ticket_path(x, y, w, h, h * .2, h * .16)}"/>'
        f'<text x="{f(cx)}" y="{f(cy + size * .36)}" text-anchor="middle" font-size="{size}" font-weight="800" letter-spacing="-.01em" fill="{color}">{text}</text>'
        f"</g>"
    )


# --------------------------------------------------------------------------
# Варианты
# --------------------------------------------------------------------------

def v1_ticket():
    """Купон с отрывным корешком: QR на белой части, адрес на красной."""
    W, H = 1600, 800
    x, y, w, h = 80, 80, 1440, 640
    split = x + h  # белая часть квадратная
    n = 30  # вырезы на линии отрыва
    k = 40
    white = (
        f"M{x+k},{y}H{split-n}A{n},{n} 0 0 0 {split+n},{y}"
        f"V{y+h}"  # правая граница белой части уходит под красную
        f"H{split+n}A{n},{n} 0 0 0 {split-n},{y+h}H{x+k}A{k},{k} 0 0 1 {x},{y+h-k}V{y+k}A{k},{k} 0 0 1 {x+k},{y}Z"
    )
    red = (
        f"M{split+n},{y}H{x+w-k}A{k},{k} 0 0 1 {x+w},{y+k}V{y+h-k}A{k},{k} 0 0 1 {x+w-k},{y+h}"
        f"H{split+n}A{n},{n} 0 0 0 {split},{y+h-n}V{y+n}A{n},{n} 0 0 0 {split+n},{y}Z"
    )
    s = 18
    qx = x + (h - N * s) / 2
    qy = y + (h - N * s) / 2
    tx = split + 90
    body = (
        f'<rect width="{W}" height="{H}" fill="{SURFACE}"/>'
        f'<path fill="#fff" d="{white}"/><path fill="{RED}" d="{red}"/>'
        f'<path d="M{split},{y+n+18}V{y+h-n-18}" stroke="#fff" stroke-width="5" stroke-dasharray="14 14" stroke-linecap="round"/>'
        f'<path fill="{INK}" d="{mod_squares(qx, qy, s)}"/>'
        f'{finders(qx, qy, s, "round", INK, RED)}'
        f'<text x="{tx}" y="{y+150}" font-size="32" font-weight="600" fill="#fff" opacity=".85">Наведите камеру телефона</text>'
        f'<text x="{tx}" y="{y+256}" font-size="92" font-weight="800" letter-spacing="-.025em" fill="#fff">Все купоны</text>'
        f'<text x="{tx}" y="{y+352}" font-size="92" font-weight="800" letter-spacing="-.025em" fill="#fff">города</text>'
        f'<rect x="{tx}" y="{y+460}" width="430" height="96" rx="48" fill="#fff"/>'
        f'<text x="{tx+215}" y="{y+524}" text-anchor="middle" font-size="50" font-weight="800" letter-spacing="-.01em" fill="{RED}">vsekupony.ru</text>'
        f'{logo("white", x+w-95, y+290, 250, rot=8)}'
    )
    return W, H, body, "Купон с корешком"


def v2_balloon():
    """Точки и круглые глазки — как шар логотипа; шар в центре."""
    W = H = 1080
    s = 30
    q0 = (W - N * s) / 2
    keep = clear_center(4.6)
    mid = q0 + N * s / 2
    body = (
        f'<rect width="{W}" height="{H}" fill="#fff"/>'
        f'<g fill="{INK}">{mod_dots(q0, q0, s, keep)}</g>'
        f'{finders(q0, q0, s, "circle", RED)}'
        f'{logo("red", mid, mid, 8.2 * s)}'
    )
    return W, H, body, "Шар"


def v3_plate():
    """Пост 4:5: заголовок с красной плашкой города, «жидкие» модули."""
    W, H = 1080, 1350
    s = 24
    q0x = (W - N * s) / 2
    q0y = 430
    body = (
        f'<rect width="{W}" height="{H}" fill="#fff"/>'
        f'<text x="{W/2}" y="196" text-anchor="middle" font-size="104" font-weight="800" letter-spacing="-.025em" fill="{INK}">Все скидки</text>'
        f'<g transform="rotate(-2 {W/2} 300)">'
        f'<rect x="{W/2-250}" y="236" width="500" height="132" rx="22" fill="{RED}"/>'
        f'<text x="{W/2}" y="338" text-anchor="middle" font-size="104" font-weight="800" letter-spacing="-.025em" fill="#fff">Липецка</text>'
        f"</g>"
        f'<path fill="{INK}" d="{mod_liquid(q0x, q0y, s)}"/>'
        f'{finders(q0x, q0y, s, "round", INK, RED)}'
        f'<text x="{W/2}" y="1238" text-anchor="middle" font-size="64" font-weight="800" letter-spacing="-.01em" fill="{RED}">vsekupony.ru</text>'
    )
    return W, H, body, "Плашка города"


def v4_tickets():
    """QR, собранный из билетиков; часть билетиков красные."""
    W = H = 1080
    s = 30
    q0 = (W - N * s) / 2
    ink, red = mod_tickets(q0, q0, s, red_share=0.35)
    body = (
        f'<rect width="{W}" height="{H}" fill="#fff"/>'
        f'<path fill="{INK}" d="{ink}"/><path fill="{RED}" d="{red}"/>'
        f'{finders(q0, q0, s, "ticket", INK, RED)}'
    )
    return W, H, body, "Из купонов"


def v5_sticker():
    """Наклейка на красном: белый шар, белая карточка, красный QR."""
    W, H = 1080, 1350
    s = 22
    card = N * s + 2 * 3 * s
    cx0 = (W - card) / 2
    cy0 = 420
    q0x, q0y = cx0 + 3 * s, cy0 + 3 * s
    body = (
        f'<rect width="{W}" height="{H}" fill="{RED}"/>'
        f'{logo("white", 250, 215, 270, rot=-8)}'
        f'<text x="400" y="200" font-size="92" font-weight="800" letter-spacing="-.025em" fill="#fff">Все купоны</text>'
        f'<text x="400" y="290" font-size="92" font-weight="800" letter-spacing="-.025em" fill="#fff">города</text>'
        f'<rect x="{cx0}" y="{cy0}" width="{card}" height="{card}" rx="56" fill="#fff"/>'
        f'<g fill="{RED}">{mod_rounded(q0x, q0y, s)}</g>'
        f'{finders(q0x, q0y, s, "round", RED, INK)}'
        f'<text x="{W/2}" y="{cy0+card+120}" text-anchor="middle" font-size="64" font-weight="800" letter-spacing="-.01em" fill="#fff">vsekupony.ru</text>'
    )
    return W, H, body, "Красная наклейка"


def v6_cut():
    """Купон под ножницы — шутка: вырезать не нужно, достаточно камеры."""
    W = H = 1080
    s = 20
    q0x = (W - N * s) / 2
    q0y = 330
    bx, by, bw, bh = 90, 90, 900, 900
    # Ножницы на пунктире, слева сверху
    sx, sy = 210, by
    scissors = (
        f'<g transform="translate({sx} {sy}) rotate(180)" fill="none" stroke="{INK}" stroke-width="5" stroke-linecap="round">'
        f'<rect x="-42" y="-10" width="84" height="20" fill="#fff" stroke="none"/>'
        f'<circle cx="-16" cy="-22" r="11"/><circle cx="-16" cy="22" r="11"/>'
        f'<path d="M-6,-15 28,14M-6,15 28,-14"/></g>'
    )
    body = (
        f'<rect width="{W}" height="{H}" fill="{SURFACE}"/>'
        f'<rect x="{bx}" y="{by}" width="{bw}" height="{bh}" rx="44" fill="#fff" stroke="{INK3}" stroke-width="4" stroke-dasharray="18 14"/>'
        f"{scissors}"
        f'<text x="{W/2}" y="222" text-anchor="middle" font-size="52" font-weight="800" letter-spacing="-.02em" fill="{INK}">Вырезать не нужно —</text>'
        f'<text x="{W/2}" y="284" text-anchor="middle" font-size="52" font-weight="800" letter-spacing="-.02em" fill="{INK}">просто наведите камеру</text>'
        f'<path fill="{INK}" d="{mod_squares(q0x, q0y, s)}"/>'
        f'{finders(q0x, q0y, s, "square", RED, INK)}'
        f'{red_ticket(W/2, by + bh, "vsekupony.ru", 50)}'
    )
    return W, H, body, "Вырезать не нужно"


def v7_seal():
    """Круглая печать: QR в круге, серые модули-заполнители, текст по ободу."""
    W = H = 1080
    s = 16
    c = W / 2
    q0 = c - N * s / 2
    rnd = random.Random(3)
    fill_r = 392
    filler = []
    span = int(fill_r / s) + 2
    for r in range(-span, N + span):
        for cc in range(-span, N + span):
            if -3 <= r < N + 3 and -3 <= cc < N + 3:
                continue  # свободное поле вокруг QR
            px, py = q0 + (cc + .5) * s, q0 + (r + .5) * s
            if math.hypot(px - c, py - c) < fill_r - s * .6 and rnd.random() < .45:
                filler.append(f'<circle cx="{f(px)}" cy="{f(py)}" r="{f(s*.42)}"/>')
    ra = 448  # радиус строки по ободу
    body = (
        f'<rect width="{W}" height="{H}" fill="#fff"/>'
        f'<circle cx="{c}" cy="{c}" r="500" fill="none" stroke="{RED}" stroke-width="8"/>'
        f'<circle cx="{c}" cy="{c}" r="{fill_r + 4}" fill="none" stroke="{RED}" stroke-width="3"/>'
        f'<g fill="{LINE}">{"".join(filler)}</g>'
        f'<g fill="{INK}">{mod_dots(q0, q0, s, k=.46)}</g>'
        f'{finders(q0, q0, s, "circle", RED)}'
        f'<defs><path id="arcT" d="M{c-ra},{c}A{ra},{ra} 0 0 1 {c+ra},{c}"/>'
        f'<path id="arcB" d="M{c-ra-31},{c}A{ra+31},{ra+31} 0 0 0 {c+ra+31},{c}"/></defs>'
        f'<text font-size="44" font-weight="800" letter-spacing=".12em" fill="{RED}" text-anchor="middle">'
        f'<textPath href="#arcT" startOffset="50%">ВСЕ КУПОНЫ ГОРОДА</textPath></text>'
        f'<text font-size="44" font-weight="800" letter-spacing=".08em" fill="{RED}" text-anchor="middle">'
        f'<textPath href="#arcB" startOffset="50%">VSEKUPONY.RU</textPath></text>'
        f'<circle cx="{c-ra-15}" cy="{c}" r="8" fill="{RED}"/><circle cx="{c+ra+15}" cy="{c}" r="8" fill="{RED}"/>'
    )
    return W, H, body, "Печать"


def v8_clean():
    """Базовый: чёткие квадраты, красные глазки — для печати мелко."""
    W = H = 1080
    s = 32
    q0 = (W - N * s) / 2
    body = (
        f'<rect width="{W}" height="{H}" fill="#fff"/>'
        f'<path fill="{INK}" d="{mod_squares(q0, q0, s)}"/>'
        f'{finders(q0, q0, s, "square", RED, INK)}'
    )
    return W, H, body, "Базовый"


VARIANTS = [
    ("qr-1-ticket", v1_ticket),
    ("qr-2-balloon", v2_balloon),
    ("qr-3-plate", v3_plate),
    ("qr-4-tickets", v4_tickets),
    ("qr-5-sticker", v5_sticker),
    ("qr-6-cut", v6_cut),
    ("qr-7-seal", v7_seal),
    ("qr-8-clean", v8_clean),
]


def find_chrome():
    for p in ("/opt/pw-browsers/chromium-1194/chrome-linux/chrome", "chromium", "google-chrome"):
        if Path(p).exists() or shutil.which(p):
            return p
    return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--no-png", action="store_true")
    args = ap.parse_args()

    OUT_SVG.mkdir(exist_ok=True)
    built = []
    for name, fn in VARIANTS:
        w, h, body, label = fn()
        path = OUT_SVG / f"{name}.svg"
        path.write_text(svg(w, h, body, f"{label}: QR-код vsekupony.ru"), encoding="utf-8")
        built.append((path, w, h))
        print(path.relative_to(ROOT.parent), f"{w}x{h}")

    if args.no_png:
        return
    chrome = find_chrome()
    if not chrome:
        print("chromium не найден — PNG пропущены")
        return
    OUT_PNG.mkdir(parents=True, exist_ok=True)
    for path, w, h in built:
        png = OUT_PNG / (path.stem + ".png")
        subprocess.run(
            [chrome, "--headless", "--no-sandbox", "--hide-scrollbars", "--disable-gpu",
             f"--window-size={w},{h + 200}", f"--screenshot={png}", path.as_uri()],
            check=True, capture_output=True,
        )
        Image.open(png).crop((0, 0, w, h)).save(png)
        print(png.relative_to(ROOT.parent))


if __name__ == "__main__":
    main()
