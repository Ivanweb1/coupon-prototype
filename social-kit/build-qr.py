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
INK4 = "#B6B6B6"
LINE = "#D3D3D3"
SURFACE = "#F6F6F6"
SURFACE_2 = "#ECECEC"

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
        ("onest-latin.woff2", "U+0000-00FF,U+2013-2014,U+2192,U+2212"),
        ("onest-cyrillic.woff2", "U+0400-045F,U+2116"),
        ("onest-latin-ext.woff2", "U+20BD"),
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


# --------------------------------------------------------------------------
# Второй заход: купонные сюжеты
# --------------------------------------------------------------------------

def qr_block(x0, y0, s, mods="squares", eyes="square", ink=INK, eye_out=None, eye_in=None, keep=always):
    """QR целиком: модули выбранной формы плюс глазки."""
    eye_out = eye_out or ink
    if mods == "squares":
        m = f'<path fill="{ink}" d="{mod_squares(x0, y0, s, keep)}"/>'
    elif mods == "liquid":
        m = f'<path fill="{ink}" d="{mod_liquid(x0, y0, s, keep)}"/>'
    elif mods == "dots":
        m = f'<g fill="{ink}">{mod_dots(x0, y0, s, keep)}</g>'
    else:
        m = f'<g fill="{ink}">{mod_rounded(x0, y0, s, keep)}</g>'
    return m + finders(x0, y0, s, eyes, eye_out, eye_in)


def zigzag(x0, x1, y, tooth, depth, down):
    """Рваный край чека: зубцы от x0 до x1 (вниз или вверх от y)."""
    pts = []
    n = int((x1 - x0) / tooth)
    step = (x1 - x0) / n
    for i in range(n + 1):
        pts.append((x0 + i * step, y))
        if i < n:
            pts.append((x0 + (i + .5) * step, y + (depth if down else -depth)))
    return pts


def v9_receipt():
    """Кассовый чек: позиции со скидками, «к оплате 0 ₽», QR внизу."""
    W, H = 1080, 1350
    x0, x1, y0, y1 = 250, 830, 70, 1280
    top = zigzag(x0, x1, y0, 29, 16, False)
    bot = zigzag(x1, x0, y1, 29, 16, True)
    pts = top + bot
    paper = "M" + "L".join(f"{f(x)},{f(y)}" for x, y in pts) + "Z"
    shadow = "M" + "L".join(f"{f(x + 14)},{f(y + 18)}" for x, y in pts) + "Z"
    cx = (x0 + x1) / 2
    L, R = x0 + 48, x1 - 48

    def row(y, a, b, red=True, size=28, w=500):
        return (
            f'<text x="{L}" y="{y}" font-size="{size}" font-weight="{w}" fill="{INK}">{a}</text>'
            f'<text x="{R}" y="{y}" text-anchor="end" font-size="{size}" font-weight="800" fill="{RED if red else INK}">{b}</text>'
        )

    def dash(y):
        return f'<path d="M{L},{y}H{R}" stroke="{INK4}" stroke-width="3" stroke-dasharray="10 9"/>'

    s = 13
    qx = cx - N * s / 2
    qy = 812
    body = (
        f'<rect width="{W}" height="{H}" fill="{SURFACE}"/>'
        f'<g transform="rotate(-2 {cx} {H/2})">'
        f'<path fill="#E2E2E2" d="{shadow}"/><path fill="#fff" d="{paper}"/>'
        f'{logo("red", cx, 168, 120)}'
        f'<text x="{cx}" y="290" text-anchor="middle" font-size="40" font-weight="800" letter-spacing=".14em" fill="{INK}">ВСЕ КУПОНЫ</text>'
        f'<text x="{cx}" y="332" text-anchor="middle" font-size="22" font-weight="500" fill="{INK3}">Липецк · vsekupony.ru · касса 01</text>'
        f'{dash(372)}'
        f'{row(426, "Кофе с собой", "−30%")}'
        f'{row(476, "Стрижка", "−20%")}'
        f'{row(526, "Шиномонтаж", "−15%")}'
        f'{row(576, "Пицца 30 см", "1+1")}'
        f'{row(626, "Фитнес, месяц", "−25%")}'
        f'{dash(666)}'
        f'{row(730, "К ОПЛАТЕ", "0 ₽", red=False, size=44, w=800)}'
        f'<text x="{L}" y="770" font-size="22" font-weight="500" fill="{INK3}">купоны бесплатны, всегда</text>'
        f'{qr_block(qx, qy, s, "squares", "square", INK, INK)}'
        f'{dash(1222 - 20)}'
        f'<text x="{cx}" y="1246" text-anchor="middle" font-size="24" font-weight="800" letter-spacing=".14em" fill="{INK}">СПАСИБО! ЗАХОДИТЕ ЕЩЁ</text>'
        f"</g>"
    )
    return W, H, body, "Чек"


def v10_scratch():
    """Скретч-карта: защитный слой стёрт, по краям окна остатки и монетка."""
    W = H = 1080
    cx0, cy0, cw, ch = 110, 90, 860, 900
    s = 16
    qs = N * s
    m = 66
    wx, wy = (W - qs) / 2 - m, 300
    ww = wh = qs + 2 * m
    qx, qy = wx + m, wy + m
    rnd = random.Random(11)
    strokes = []
    edges = [((wx, wy), (wx + ww, wy)), ((wx + ww, wy), (wx + ww, wy + wh)),
             ((wx + ww, wy + wh), (wx, wy + wh)), ((wx, wy + wh), (wx, wy))]
    for (ax, ay), (bx, by) in edges:
        nx, ny = (by - ay), -(bx - ax)  # нормаль внутрь окна (обход по часовой)
        ln = math.hypot(nx, ny)
        nx, ny = -nx / ln, -ny / ln
        k = 0.0
        while k < 1:
            k2 = min(1, k + rnd.uniform(.12, .3))
            if rnd.random() < .78:
                pts = []
                for t in (k, (k + k2) / 2, k2):
                    off = rnd.uniform(0, 22)
                    pts.append((ax + (bx - ax) * t + nx * off, ay + (by - ay) * t + ny * off))
                strokes.append(
                    f'<path d="M{f(pts[0][0])},{f(pts[0][1])}Q{f(pts[1][0])},{f(pts[1][1])} {f(pts[2][0])},{f(pts[2][1])}" '
                    f'stroke-width="{rnd.randint(36, 52)}"/>')
            k = k2
    for _ in range(14):
        a = rnd.uniform(0, 2 * math.pi)
        # штрихи-царапины по слою
        e = rnd.choice(edges)
        t = rnd.random()
        px = e[0][0] + (e[1][0] - e[0][0]) * t
        py = e[0][1] + (e[1][1] - e[0][1]) * t
        strokes.append(f'<path d="M{f(px)},{f(py)}l{f(math.cos(a)*40)},{f(math.sin(a)*40)}" stroke="#DADADA" stroke-width="5"/>')
    coin_x, coin_y = wx + ww - 10, wy + wh - 6
    body = (
        f'<rect width="{W}" height="{H}" fill="{SURFACE}"/>'
        f'<rect x="{cx0}" y="{cy0}" width="{cw}" height="{ch}" rx="48" fill="{RED}"/>'
        f'<text x="{W/2}" y="186" text-anchor="middle" font-size="70" font-weight="800" letter-spacing="-.025em" fill="#fff">Сотри защитный слой</text>'
        f'<text x="{W/2}" y="250" text-anchor="middle" font-size="36" font-weight="500" fill="#fff" opacity=".85">и забери скидку города</text>'
        f'<defs><clipPath id="win"><rect x="{wx}" y="{wy}" width="{ww}" height="{wh}" rx="28"/></clipPath></defs>'
        f'<rect x="{wx}" y="{wy}" width="{ww}" height="{wh}" rx="28" fill="#fff"/>'
        f'<g clip-path="url(#win)" fill="none" stroke="#C7C7C7" stroke-linecap="round">{"".join(strokes)}</g>'
        f'{qr_block(qx, qy, s, "squares", "round", INK, INK, RED)}'
        f'<g transform="rotate(-18 {coin_x} {coin_y})">'
        f'<circle cx="{coin_x}" cy="{coin_y}" r="82" fill="#D3D3D3" stroke="#B6B6B6" stroke-width="8"/>'
        f'<circle cx="{coin_x}" cy="{coin_y}" r="62" fill="none" stroke="#B6B6B6" stroke-width="3" stroke-dasharray="4 7"/>'
        f'<text x="{coin_x}" y="{coin_y + 26}" text-anchor="middle" font-size="76" font-weight="800" fill="{INK3}">%</text></g>'
        f'<text x="{W/2}" y="{cy0 + ch - 48}" text-anchor="middle" font-size="52" font-weight="800" letter-spacing="-.01em" fill="#fff">vsekupony.ru</text>'
    )
    return W, H, body, "Скретч-карта"


def v11_tag():
    """Ценник на нитке: старая цена зачёркнута, новая — 0 ₽."""
    W, H = 1080, 1350
    cx = 560
    tw, top, bot = 620, 230, 1270
    roof = 150
    x0, x1 = cx - tw / 2, cx + tw / 2
    k = 36
    tag = (
        f"M{cx},{top}L{x1},{top + roof}V{bot - k}A{k},{k} 0 0 1 {x1 - k},{bot}"
        f"H{x0 + k}A{k},{k} 0 0 1 {x0},{bot - k}V{top + roof}Z"
    )
    hole_y = top + 105
    s = 16
    qs = N * s
    card = qs + 48
    qx0 = cx - card / 2
    qy0 = 420
    body = (
        f'<rect width="{W}" height="{H}" fill="{SURFACE}"/>'
        f'<path d="M{cx},{hole_y}C{cx - 40},{hole_y - 180} {cx + 160},{40} {cx + 60},-10" fill="none" stroke="{INK}" stroke-width="5" stroke-linecap="round"/>'
        f'<g transform="rotate(-6 {cx} {hole_y})">'
        f'<path fill="{RED}" d="{tag}" stroke="{RED}" stroke-width="20" stroke-linejoin="round"/>'
        f'<circle cx="{cx}" cy="{hole_y}" r="22" fill="{SURFACE}"/>'
        f'<circle cx="{cx}" cy="{hole_y}" r="22" fill="none" stroke="#fff" stroke-width="5"/>'
        f'<rect x="{qx0}" y="{qy0}" width="{card}" height="{card}" rx="26" fill="#fff"/>'
        f'{qr_block(qx0 + 24, qy0 + 24, s, "rounded", "round", INK, INK, RED)}'
        f'<text x="{x0 + 56}" y="{qy0 + card + 92}" font-size="56" font-weight="700" fill="#fff" opacity=".7">999 ₽</text>'
        f'<path d="M{x0 + 50},{qy0 + card + 82}L{x0 + 230},{qy0 + card + 56}" stroke="#fff" stroke-width="7" stroke-linecap="round"/>'
        f'<text x="{x1 - 56}" y="{qy0 + card + 112}" text-anchor="end" font-size="120" font-weight="800" letter-spacing="-.03em" fill="#fff">0 ₽</text>'
        f'<text x="{cx}" y="{bot - 60}" text-anchor="middle" font-size="48" font-weight="800" letter-spacing="-.01em" fill="#fff">vsekupony.ru</text>'
        f"</g>"
    )
    return W, H, body, "Ценник"


def v12_stamp():
    """Почтовая марка с перфорацией и гашением «Липецк»."""
    W = H = 1080
    sx, sy, sw, sh = 200, 110, 680, 860
    r, gap = 15, 40
    holes = []
    for i in range(int(sw / gap) + 1):
        x = sx + i * sw / int(sw / gap)
        holes += [(x, sy), (x, sy + sh)]
    for i in range(1, int(sh / gap)):
        y = sy + i * sh / int(sh / gap)
        holes += [(sx, y), (sx + sw, y)]
    s = 16
    qs = N * s
    qx, qy = sx + (sw - qs) / 2, sy + 150
    pm_x, pm_y = 820, 900
    waves = "".join(
        f'<path d="M{pm_x + 120},{pm_y - 48 + i * 32}' +
        "".join(f"q20,-16 40,0t40,0" for _ in range(3)) + '" fill="none"/>'
        for i in range(4)
    )
    body = (
        f'<rect width="{W}" height="{H}" fill="{SURFACE}"/>'
        f'<g transform="rotate(3 {W/2} {H/2})">'
        f'<rect x="{sx}" y="{sy}" width="{sw}" height="{sh}" fill="#fff"/>'
        f'<g fill="{SURFACE}">{"".join(f"<circle cx={chr(34)}{f(x)}{chr(34)} cy={chr(34)}{f(y)}{chr(34)} r={chr(34)}{r}{chr(34)}/>" for x, y in holes)}</g>'
        f'<rect x="{sx + 40}" y="{sy + 40}" width="{sw - 80}" height="{sh - 80}" fill="none" stroke="{RED}" stroke-width="4"/>'
        f'<text x="{sx + 74}" y="{sy + 112}" font-size="36" font-weight="800" letter-spacing=".12em" fill="{INK}">ПОЧТА СКИДОК</text>'
        f'<text x="{sx + sw - 74}" y="{sy + 116}" text-anchor="end" font-size="56" font-weight="800" letter-spacing="-.02em" fill="{RED}">0 ₽</text>'
        f'{qr_block(qx, qy, s, "squares", "square", INK, RED, INK)}'
        f'{logo("red", sx + 120, sy + sh - 140, 130, rot=-8)}'
        f'<text x="{sx + 190}" y="{sy + sh - 150}" font-size="40" font-weight="800" letter-spacing="-.02em" fill="{INK}">Все купоны</text>'
        f'<text x="{sx + 190}" y="{sy + sh - 104}" font-size="30" font-weight="600" fill="{RED}">vsekupony.ru</text>'
        f"</g>"
        f'<g stroke="{INK2}" stroke-width="4" opacity=".9">'
        f'<circle cx="{pm_x}" cy="{pm_y}" r="110" fill="none"/>'
        f'<circle cx="{pm_x}" cy="{pm_y}" r="78" fill="none" stroke-width="2.5"/>{waves}</g>'
        f'<defs><path id="pmT" d="M{pm_x - 92},{pm_y}A92,92 0 0 1 {pm_x + 92},{pm_y}"/>'
        f'<path id="pmB" d="M{pm_x - 110},{pm_y}A110,110 0 0 0 {pm_x + 110},{pm_y}"/></defs>'
        f'<g fill="{INK2}" font-weight="800" text-anchor="middle" opacity=".9">'
        f'<text font-size="24" letter-spacing=".16em"><textPath href="#pmT" startOffset="50%">ЛИПЕЦК</textPath></text>'
        f'<text font-size="22" letter-spacing=".16em"><textPath href="#pmB" startOffset="50%">ВСЕ КУПОНЫ</textPath></text>'
        f'<text x="{pm_x}" y="{pm_y + 11}" font-size="30" letter-spacing=".02em">09.10.26</text></g>'
    )
    return W, H, body, "Почтовая марка"


def v13_stack():
    """Стопка купонов веером; верхний — с QR."""
    W = H = 1080
    cw, ch = 860, 440
    cx, cy = W / 2, H / 2 + 30
    x, y = cx - cw / 2, cy - ch / 2

    def coupon(fill, rot, dx, dy, txt, tcol):
        return (
            f'<g transform="translate({dx} {dy}) rotate({rot} {cx} {cy})">'
            f'<path fill="{fill}" d="{ticket_path(x, y, cw, ch, 34, 34)}"/>'
            f'<text x="{x + cw - 60}" y="{y + 130}" text-anchor="end" font-size="110" font-weight="800" letter-spacing="-.03em" fill="{tcol}">{txt}</text>'
            f"</g>"
        )
    s = 12
    qs = N * s
    split = x + qs + 92
    body = (
        f'<rect width="{W}" height="{H}" fill="#fff"/>'
        f'{coupon(INK, -13, -20, -70, "1+1", "#fff")}'
        f'{coupon(RED, 8, 10, -40, "−50%", "#fff")}'
        f'<path fill="#E4E4E4" d="{ticket_path(x + 14, y + 20, cw, ch, 34, 34)}"/>'
        f'<path fill="#fff" stroke="{INK}" stroke-width="4" d="{ticket_path(x, y, cw, ch, 34, 34)}"/>'
        f'<path d="M{split},{y + 28}V{y + ch - 28}" stroke="{INK4}" stroke-width="4" stroke-dasharray="12 10"/>'
        f'{qr_block(x + 46, cy - qs / 2, s, "liquid", "round", INK, INK, RED)}'
        f'<text x="{split + 50}" y="{y + 108}" font-size="30" font-weight="600" fill="{INK3}">Купон №000001</text>'
        f'<text x="{split + 50}" y="{y + 186}" font-size="60" font-weight="800" letter-spacing="-.025em" fill="{INK}">Все купоны</text>'
        f'<text x="{split + 50}" y="{y + 250}" font-size="60" font-weight="800" letter-spacing="-.025em" fill="{INK}">города</text>'
        f'{red_ticket(split + 50 + 180, y + 340, "vsekupony.ru", 38)}'
    )
    return W, H, body, "Стопка купонов"


def v14_percent():
    """Знак процента: в верхнем круге шар, в нижнем — QR; черта — билетик."""
    W = H = 1080
    s = 10
    qs = N * s
    c2 = 765
    rin, sw = 226, 34
    c1 = 292
    L = 900
    body = (
        f'<rect width="{W}" height="{H}" fill="#fff"/>'
        f'<g transform="rotate(-45 540 540)">'
        f'<path fill="{RED}" d="{ticket_path(540 - L / 2, 540 - 44, L, 88, 22, 30)}"/></g>'
        f'<circle cx="{c1}" cy="{c1}" r="{175}" fill="#fff" stroke="{RED}" stroke-width="{sw}"/>'
        f'{logo("red", c1 + 4, c1 + 4, 230, rot=-8)}'
        f'<circle cx="{c2}" cy="{c2}" r="{rin + sw / 2}" fill="#fff" stroke="{RED}" stroke-width="{sw}"/>'
        f'{qr_block(c2 - qs / 2, c2 - qs / 2, s, "squares", "square", INK, INK)}'
    )
    return W, H, body, "Процент"


def v15_hidden():
    """QR с секретом: модули, попавшие в силуэт шара, красные."""
    from PIL import Image, ImageFilter
    W = H = 1080
    s = 32
    q0 = (W - N * s) / 2
    im = Image.open(BRAND / "logo-red.png").split()[-1]
    rows = N - 2
    cols = round(rows * LOGO_RATIO)
    blob = im.filter(ImageFilter.GaussianBlur(14)).resize((cols, rows), Image.BILINEAR)
    c_off = (N - cols) // 2
    r_off = 1

    def inside(r, c):
        rr, cc = r - r_off, c - c_off
        return 0 <= rr < rows and 0 <= cc < cols and blob.getpixel((cc, rr)) > 60

    body = (
        f'<rect width="{W}" height="{H}" fill="#fff"/>'
        f'<g fill="{SURFACE}">{"".join(f'<rect x="{f(q0 + c * s)}" y="{f(q0 + r * s)}" width="{s}" height="{s}"/>' for r in range(N) for c in range(N) if inside(r, c) and not in_finder(r, c))}</g>'
        f'<g fill="{INK}">{mod_rounded(q0, q0, s, lambda r, c: not inside(r, c), k=.3)}</g>'
        f'<g fill="{RED}">{mod_rounded(q0, q0, s, inside, k=.3)}</g>'
        f'{finders(q0, q0, s, "round", INK, INK)}'
    )
    return W, H, body, "Шар внутри"


def v16_burst():
    """Наклейка «скидка»: красная звезда-вспышка, QR в белом круге, текст по кругу."""
    W = H = 1080
    c = W / 2
    n = 32
    pts = []
    for i in range(2 * n):
        a = math.pi * i / n
        rr = 515 if i % 2 == 0 else 470
        pts.append((c + rr * math.cos(a), c + rr * math.sin(a)))
    star = "M" + "L".join(f"{f(x)},{f(y)}" for x, y in pts) + "Z"
    s = 17
    qs = N * s
    ra = 418
    words = "СКИДКИ · АКЦИИ · КУПОНЫ · VSEKUPONY.RU · "
    body = (
        f'<rect width="{W}" height="{H}" fill="{SURFACE}"/>'
        f'<g transform="rotate(-8 {c} {c})">'
        f'<path fill="{RED}" d="{star}"/>'
        f'<circle cx="{c}" cy="{c}" r="380" fill="#fff"/>'
        f'<defs><path id="ring" d="M{c - ra},{c}A{ra},{ra} 0 1 1 {c + ra},{c}A{ra},{ra} 0 1 1 {c - ra},{c}"/></defs>'
        f'<text font-size="34" font-weight="800" letter-spacing=".1em" fill="#fff"><textPath href="#ring" textLength="{f(2 * math.pi * ra - 20)}" lengthAdjust="spacing">{words * 2}</textPath></text>'
        f"</g>"
        f'{qr_block(c - qs / 2, c - qs / 2, s, "dots", "circle", INK, RED)}'
    )
    return W, H, body, "Вспышка «скидка»"


# --------------------------------------------------------------------------
# Третий заход: предметы из жизни
# --------------------------------------------------------------------------

RED_DARK = "#B9332C"


def v17_lottery():
    """Лотерейный билет: шары-выигрыши, QR, отрывной контроль с номером."""
    W, H = 1080, 1350
    x0, x1, y0, y1 = 190, 890, 80, 1270
    cx = (x0 + x1) / 2
    perf = 1010
    n, k = 30, 36
    shape = (
        f"M{x0 + k},{y0}H{x1 - k}A{k},{k} 0 0 1 {x1},{y0 + k}V{perf - n}A{n},{n} 0 0 0 {x1},{perf + n}"
        f"V{y1 - k}A{k},{k} 0 0 1 {x1 - k},{y1}H{x0 + k}A{k},{k} 0 0 1 {x0},{y1 - k}"
        f"V{perf + n}A{n},{n} 0 0 0 {x0},{perf - n}V{y0 + k}A{k},{k} 0 0 1 {x0 + k},{y0}Z"
    )
    head = f"M{x0 + k},{y0}H{x1 - k}A{k},{k} 0 0 1 {x1},{y0 + k}V250H{x0}V{y0 + k}A{k},{k} 0 0 1 {x0 + k},{y0}Z"
    balls = ""
    for i, t in enumerate(["−10", "−20", "−30", "−50", "1+1", "%"]):
        bx = cx - 250 + i * 100
        red = i in (3, 5)
        balls += (f'<circle cx="{bx}" cy="318" r="42" fill="{RED if red else "#fff"}" stroke="{RED}" stroke-width="4"/>'
                  f'<text x="{bx}" y="328" text-anchor="middle" font-size="28" font-weight="800" letter-spacing="-.02em" fill="{"#fff" if red else RED}">{t}</text>')
    s = 15
    qs = N * s
    body = (
        f'<rect width="{W}" height="{H}" fill="{SURFACE}"/>'
        f'<path fill="#fff" d="{shape}"/><path fill="{RED}" d="{head}"/>'
        f'<text x="{cx}" y="170" text-anchor="middle" font-size="56" font-weight="800" letter-spacing=".06em" fill="#fff">ЛОТЕРЕЯ СКИДОК</text>'
        f'<text x="{cx}" y="216" text-anchor="middle" font-size="28" font-weight="500" fill="#fff" opacity=".85">выигрывает каждый · тираж №1</text>'
        f'{balls}'
        f'{qr_block(cx - qs / 2, 400, s, "squares", "round", INK, INK, RED)}'
        f'<text x="{cx}" y="{400 + qs + 70}" text-anchor="middle" font-size="30" font-weight="600" fill="{INK2}">Наведите камеру — выигрыш уже на сайте</text>'
        f'<path d="M{x0 + n + 14},{perf}H{x1 - n - 14}" stroke="{INK4}" stroke-width="4" stroke-dasharray="12 10"/>'
        f'<text x="{x0 + 60}" y="{perf + 76}" font-size="24" font-weight="700" letter-spacing=".12em" fill="{INK3}">КОНТРОЛЬНЫЙ КУПОН</text>'
        f'<text x="{x0 + 60}" y="{perf + 160}" font-size="76" font-weight="800" letter-spacing=".02em" fill="{INK}">№ 000001</text>'
        f'{red_ticket(x1 - 190, perf + 200, "vsekupony.ru", 30, rot=-4)}'
    )
    return W, H, body, "Лотерейный билет"


def v18_bag():
    """Шоппер: красный пакет с ручками, QR на белой этикетке."""
    W, H = 1080, 1350
    x0, x1, y0, y1 = 210, 870, 400, 1250
    cx = (x0 + x1) / 2
    s = 15
    qs = N * s
    lx = cx - (qs + 60) / 2
    handle = lambda hx: f'<path d="M{hx - 90},{y0 + 40}C{hx - 90},{y0 - 260} {hx + 90},{y0 - 260} {hx + 90},{y0 + 40}" fill="none" stroke="{INK}" stroke-width="16" stroke-linecap="round"/>'
    body = (
        f'<rect width="{W}" height="{H}" fill="{SURFACE}"/>'
        f'<ellipse cx="{cx}" cy="{y1 + 18}" rx="{(x1 - x0) / 2 + 20}" ry="22" fill="#E0E0E0"/>'
        f'{handle(cx)}'
        f'<path fill="{RED}" d="M{x0},{y0}H{x1}L{x1 + 20},{y1}H{x0 - 20}Z"/>'
        f'<path fill="{RED_DARK}" d="M{x0},{y0}H{x1}V{y0 + 56}H{x0}Z"/>'
        f'<circle cx="{cx - 90}" cy="{y0 + 28}" r="12" fill="{INK}"/><circle cx="{cx + 90}" cy="{y0 + 28}" r="12" fill="{INK}"/>'
        f'<text x="{cx}" y="{y0 + 150}" text-anchor="middle" font-size="64" font-weight="800" letter-spacing="-.025em" fill="#fff">Покупайте выгодно</text>'
        f'<rect x="{lx}" y="{y0 + 200}" width="{qs + 60}" height="{qs + 60}" rx="28" fill="#fff"/>'
        f'{qr_block(lx + 30, y0 + 230, s, "dots", "circle", INK, RED)}'
        f'<text x="{cx}" y="{y1 - 70}" text-anchor="middle" font-size="54" font-weight="800" letter-spacing="-.01em" fill="#fff">vsekupony.ru</text>'
    )
    return W, H, body, "Шоппер"


def v19_gift():
    """Подарочный сертификат с лентой и бантом."""
    W, H = 1600, 900
    x0, y0, x1, y1 = 80, 80, 1520, 820
    rx, rw = 1270, 80
    ry, rh = 400, 80
    bx, by = rx + rw / 2, ry + rh / 2
    s = 17
    qs = N * s
    qy = (H - qs) / 2
    bow = (
        f'<path fill="{RED}" d="M{bx},{by}C{bx - 60},{by - 160} {bx - 230},{by - 120} {bx - 170},{by - 20}C{bx - 140},{by + 30} {bx - 60},{by + 10} {bx},{by}Z"/>'
        f'<path fill="{RED}" d="M{bx},{by}C{bx + 60},{by - 160} {bx + 230},{by - 120} {bx + 170},{by - 20}C{bx + 140},{by + 30} {bx + 60},{by + 10} {bx},{by}Z"/>'
        f'<path fill="{RED_DARK}" d="M{bx},{by}C{bx - 50},{by - 110} {bx - 150},{by - 90} {bx - 120},{by - 30}Z"/>'
        f'<path fill="{RED_DARK}" d="M{bx},{by}C{bx + 50},{by - 110} {bx + 150},{by - 90} {bx + 120},{by - 30}Z"/>'
        f'<path fill="{RED}" d="M{bx - 14},{by + 10}L{bx - 110},{by + 190}L{bx - 70},{by + 175}L{bx - 52},{by + 220}L{bx + 6},{by + 18}Z"/>'
        f'<path fill="{RED}" d="M{bx + 14},{by + 10}L{bx + 110},{by + 190}L{bx + 70},{by + 175}L{bx + 52},{by + 220}L{bx - 6},{by + 18}Z"/>'
        f'<rect x="{bx - 32}" y="{by - 30}" width="64" height="60" rx="18" fill="{RED_DARK}"/>'
    )
    tx = 140 + qs + 64
    body = (
        f'<rect width="{W}" height="{H}" fill="{SURFACE}"/>'
        f'<rect x="{x0}" y="{y0}" width="{x1 - x0}" height="{y1 - y0}" rx="32" fill="#fff"/>'
        f'<rect x="{x0 + 24}" y="{y0 + 24}" width="{x1 - x0 - 48}" height="{y1 - y0 - 48}" rx="20" fill="none" stroke="{LINE}" stroke-width="3"/>'
        f'<rect x="{rx}" y="{y0}" width="{rw}" height="{y1 - y0}" fill="{RED}"/>'
        f'<rect x="{rx}" y="{ry}" width="{x1 - rx}" height="{rh}" fill="{RED}"/>'
        f'{qr_block(140, qy, s, "rounded", "round", INK, INK, RED)}'
        f'<text x="{tx}" y="250" font-size="30" font-weight="700" letter-spacing=".12em" fill="{RED}">ПОДАРОК</text>'
        f'<text x="{tx}" y="330" font-size="58" font-weight="800" letter-spacing="-.025em" fill="{INK}">Сертификат</text>'
        f'<text x="{tx}" y="400" font-size="58" font-weight="800" letter-spacing="-.025em" fill="{INK}">на все скидки</text>'
        f'<text x="{tx}" y="470" font-size="58" font-weight="800" letter-spacing="-.025em" fill="{INK}">города</text>'
        f'<text x="{tx}" y="570" font-size="30" font-weight="500" fill="{INK2}">Номинал: сколько унесёте</text>'
        f'<text x="{tx}" y="680" font-size="44" font-weight="800" letter-spacing="-.01em" fill="{RED}">vsekupony.ru</text>'
        f'{bow}'
        f'<text x="{x1 - 50}" y="{y1 - 50}" text-anchor="end" font-size="26" font-weight="600" fill="{INK3}">№ 0001</text>'
    )
    return W, H, body, "Подарочный сертификат"


def v20_camera():
    """Кадр камеры: уголки видоискателя, линия сканирования, уведомление сверху."""
    W, H = 1080, 1350
    s = 22
    qs = N * s
    qx, qy = (W - qs) / 2, 430
    o, L = 46, 110
    a, b = qx - o, qx + qs + o
    c, d = qy - o, qy + qs + o
    corners = (
        f"M{a},{c + L}V{c + 20}Q{a},{c} {a + 20},{c}H{a + L}"
        f"M{b - L},{c}H{b - 20}Q{b},{c} {b},{c + 20}V{c + L}"
        f"M{b},{d - L}V{d - 20}Q{b},{d} {b - 20},{d}H{b - L}"
        f"M{a + L},{d}H{a + 20}Q{a},{d} {a},{d - 20}V{d - L}"
    )
    scan_y = qy + qs * .62
    ic = 150
    body = (
        f'<rect width="{W}" height="{H}" fill="#fff"/>'
        f'<rect x="90" y="80" width="900" height="210" rx="44" fill="{SURFACE}"/>'
        f'<rect x="130" y="{185 - 56}" width="112" height="112" rx="28" fill="{RED}"/>'
        f'{logo("white", 186, 185, 92)}'
        f'<text x="276" y="150" font-size="26" font-weight="700" letter-spacing=".08em" fill="{INK3}">КАМЕРА · СЕЙЧАС</text>'
        f'<text x="276" y="204" font-size="42" font-weight="800" letter-spacing="-.02em" fill="{INK}">Открыть vsekupony.ru</text>'
        f'<text x="276" y="250" font-size="28" font-weight="500" fill="{INK2}">Купоны Липецка рядом с вами</text>'
        f'{qr_block(qx, qy, s, "squares", "square", INK, INK)}'
        f'<path d="{corners}" fill="none" stroke="{RED}" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>'
        f'<rect x="{a + 30}" y="{scan_y - 4}" width="{b - a - 60}" height="8" rx="4" fill="{RED}"/>'
        f'<circle cx="{W / 2}" cy="1250" r="46" fill="none" stroke="{INK}" stroke-width="6"/>'
        f'<circle cx="{W / 2}" cy="1250" r="34" fill="{RED}"/>'
    )
    return W, H, body, "Камера"


def v21_pin():
    """Геометка на карте города, QR в круге метки."""
    W, H = 1080, 1350
    rnd = random.Random(5)
    streets = []
    for i in range(-2, 14):
        y = i * 120 + rnd.randint(-20, 20)
        streets.append(f'<path d="M-100,{y}L1200,{y + rnd.randint(-80, 80)}" stroke-width="{rnd.choice([14, 14, 24])}"/>')
    for i in range(-2, 12):
        x = i * 140 + rnd.randint(-20, 20)
        streets.append(f'<path d="M{x},-100L{x + rnd.randint(-120, 120)},1450" stroke-width="{rnd.choice([14, 14, 30])}"/>')
    cx, cy, R, ty = 540, 560, 372, 1180
    dd = ty - cy
    beta = math.acos(R / dd)
    lx, ly = cx - R * math.sin(beta), cy + R * math.cos(beta)
    rxp = cx + R * math.sin(beta)
    pin = f"M{cx},{ty}L{f(lx)},{f(ly)}A{R},{R} 0 1 1 {f(rxp)},{f(ly)}Z"
    s = 15
    qs = N * s
    body = (
        f'<rect width="{W}" height="{H}" fill="{SURFACE_2}"/>'
        f'<g stroke="#fff" fill="none" transform="rotate(-12 540 675)">{"".join(streets)}</g>'
        f'<path d="M-50,1010C250,940 420,1120 700,1060S1000,960 1150,1010" stroke="{LINE}" stroke-width="56" fill="none"/>'
        f'<ellipse cx="{cx}" cy="{ty + 8}" rx="120" ry="28" fill="{INK4}"/>'
        f'<path fill="{RED}" d="{pin}"/>'
        f'<circle cx="{cx}" cy="{cy}" r="{R - 40}" fill="#fff"/>'
        f'{qr_block(cx - qs / 2, cy - qs / 2, s, "liquid", "round", INK, INK, RED)}'
        f'<g transform="rotate(-2 230 1260)"><rect x="90" y="1210" width="300" height="96" rx="18" fill="{RED}"/>'
        f'<text x="240" y="1278" text-anchor="middle" font-size="60" font-weight="800" letter-spacing="-.02em" fill="#fff">Липецк</text></g>'
        f'<text x="1000" y="1278" text-anchor="end" font-size="44" font-weight="800" letter-spacing="-.01em" fill="{INK}">vsekupony.ru</text>'
    )
    return W, H, body, "Геометка"


def v22_card():
    """Дисконтная карта: красный пластик, чип, номер, QR на белом поле."""
    W, H = 1600, 1100
    x0, y0, cw, ch = 150, 140, 1300, 820
    s = 15
    qs = N * s
    pad = 34
    wx, wy = x0 + cw - 80 - (qs + 2 * pad), y0 + (ch - qs - 2 * pad) / 2
    chip_x, chip_y = x0 + 90, y0 + 330
    chip = (
        f'<rect x="{chip_x}" y="{chip_y}" width="150" height="112" rx="20" fill="#D3D3D3"/>'
        f'<path d="M{chip_x},{chip_y + 38}H{chip_x + 50}M{chip_x},{chip_y + 74}H{chip_x + 50}M{chip_x + 100},{chip_y + 38}H{chip_x + 150}M{chip_x + 100},{chip_y + 74}H{chip_x + 150}M{chip_x + 50},{chip_y}V{chip_y + 112}M{chip_x + 100},{chip_y}V{chip_y + 112}" stroke="{INK4}" stroke-width="4"/>'
    )
    body = (
        f'<rect width="{W}" height="{H}" fill="{SURFACE}"/>'
        f'<g transform="rotate(-4 {W / 2} {H / 2})">'
        f'<rect x="{x0 + 18}" y="{y0 + 26}" width="{cw}" height="{ch}" rx="56" fill="#DCDCDC"/>'
        f'<rect x="{x0}" y="{y0}" width="{cw}" height="{ch}" rx="56" fill="{RED}"/>'
        f'{logo("white", x0 + 140, y0 + 150, 160, rot=-8)}'
        f'<text x="{x0 + 220}" y="{y0 + 150}" font-size="72" font-weight="800" letter-spacing="-.025em" fill="#fff">Все купоны</text>'
        f'<text x="{x0 + 222}" y="{y0 + 206}" font-size="34" font-weight="500" fill="#fff" opacity=".85">карта скидок города</text>'
        f'{chip}'
        f'<text x="{x0 + 90}" y="{y0 + ch - 150}" font-size="58" font-weight="600" letter-spacing=".08em" fill="#fff">0000 0000 0001</text>'
        f'<text x="{x0 + 90}" y="{y0 + ch - 80}" font-size="30" font-weight="700" letter-spacing=".14em" fill="#fff" opacity=".85">ЛИПЕЦК · БЕССРОЧНО</text>'
        f'<rect x="{wx}" y="{wy}" width="{qs + 2 * pad}" height="{qs + 2 * pad}" rx="32" fill="#fff"/>'
        f'{qr_block(wx + pad, wy + pad, s, "squares", "round", INK, INK, RED)}'
        f"</g>"
    )
    return W, H, body, "Дисконтная карта"


def v23_flyer():
    """Объявление на кнопке с отрывными язычками, пара уже оторвана."""
    W, H = 1080, 1350
    x0, x1, y0, y1 = 170, 910, 110, 1250
    cx = (x0 + x1) / 2
    tabs_y = 1010
    nt = 8
    tw = (x1 - x0) / nt
    tabs = ""
    for i in range(nt):
        tx = x0 + i * tw
        if i in (2, 5):  # оторваны
            jag = "".join(f"L{f(tx + j * tw / 6)},{tabs_y + 4 + (8 if j % 2 else 0)}" for j in range(7))
            tabs += f'<path fill="{SURFACE_2}" d="M{f(tx)},{y1 + 2}V{tabs_y + 4}{jag}V{y1 + 2}Z"/>'
            continue
        if i:
            tabs += f'<path d="M{f(tx)},{tabs_y}V{y1}" stroke="{INK4}" stroke-width="3" stroke-dasharray="8 7"/>'
        tabs += (f'<text transform="translate({f(tx + tw / 2 + 9)} {y1 - 18}) rotate(-90)" font-size="27" font-weight="800" '
                 f'letter-spacing="-.01em" fill="{RED if i % 2 == 0 else INK}">vsekupony.ru</text>')
    s = 12
    qs = N * s
    body = (
        f'<rect width="{W}" height="{H}" fill="{SURFACE_2}"/>'
        f'<g transform="rotate(-1.5 {cx} {H / 2})">'
        f'<rect x="{x0 + 10}" y="{y0 + 14}" width="{x1 - x0}" height="{y1 - y0}" fill="#DADADA"/>'
        f'<rect x="{x0}" y="{y0}" width="{x1 - x0}" height="{y1 - y0}" fill="#fff"/>'
        f'<path d="M{x0 + 40},{tabs_y}H{x1 - 40}" stroke="{INK4}" stroke-width="3"/>'
        f'<text x="{cx}" y="{y0 + 130}" text-anchor="middle" font-size="40" font-weight="800" letter-spacing=".22em" fill="{RED}">ОБЪЯВЛЕНИЕ</text>'
        f'<text x="{cx}" y="{y0 + 240}" text-anchor="middle" font-size="96" font-weight="800" letter-spacing="-.03em" fill="{INK}">Отдам скидки</text>'
        f'<text x="{cx}" y="{y0 + 330}" text-anchor="middle" font-size="96" font-weight="800" letter-spacing="-.03em" fill="{INK}">даром</text>'
        f'<text x="{cx}" y="{y0 + 396}" text-anchor="middle" font-size="30" font-weight="500" fill="{INK2}">Кофе, стрижки, пицца — по всему городу</text>'
        f'{qr_block(cx - qs / 2, y0 + 440, s, "squares", "square", INK, INK)}'
        f'{tabs}'
        f"</g>"
        f'<circle cx="{cx + 6}" cy="{y0 + 30}" r="30" fill="#C7C7C7"/>'
        f'<circle cx="{cx}" cy="{y0 + 22}" r="30" fill="{RED}"/><circle cx="{cx - 9}" cy="{y0 + 13}" r="9" fill="#fff" opacity=".6"/>'
    )
    return W, H, body, "Объявление"


def v24_calendar():
    """Отрывной календарь: 9 октября, купон дня."""
    W, H = 1080, 1350
    x0, x1 = 210, 870
    cx = (x0 + x1) / 2
    top, bot = 170, 1230
    torn = "".join(f"L{f(x0 + i * (x1 - x0) / 22)},{top + 14 + (16 if i % 2 else 0) + (i * 7 % 5)}" for i in range(23))
    s = 13
    qs = N * s
    body = (
        f'<rect width="{W}" height="{H}" fill="{SURFACE}"/>'
        f'<rect x="{x0 + 18}" y="{top + 30}" width="{x1 - x0}" height="{bot - top}" fill="#E2E2E2"/>'
        f'<rect x="{x0 + 10}" y="{top + 20}" width="{x1 - x0}" height="{bot - top}" fill="#fff" stroke="{LINE}" stroke-width="3"/>'
        f'<rect x="{x0 + 5}" y="{top + 10}" width="{x1 - x0}" height="{bot - top}" fill="#fff" stroke="{LINE}" stroke-width="3"/>'
        f'<rect x="{x0}" y="{top}" width="{x1 - x0}" height="{bot - top}" fill="#fff" stroke="{LINE}" stroke-width="3"/>'
        f'<path fill="#fff" stroke="{LINE}" stroke-width="3" d="M{x0},{top}{torn}L{x1},{top}Z"/>'
        f'<rect x="{x0 - 20}" y="{top - 70}" width="{x1 - x0 + 40}" height="90" rx="20" fill="{INK}"/>'
        f'<circle cx="{cx - 160}" cy="{top - 25}" r="14" fill="{SURFACE}"/><circle cx="{cx + 160}" cy="{top - 25}" r="14" fill="{SURFACE}"/>'
        f'<text x="{cx}" y="{top + 110}" text-anchor="middle" font-size="44" font-weight="800" letter-spacing=".16em" fill="{RED}">ОКТЯБРЬ</text>'
        f'<text x="{cx}" y="{top + 330}" text-anchor="middle" font-size="250" font-weight="800" letter-spacing="-.04em" fill="{RED}">9</text>'
        f'<text x="{cx}" y="{top + 390}" text-anchor="middle" font-size="36" font-weight="600" fill="{INK2}">пятница</text>'
        f'{red_ticket(cx, top + 470, "Купон дня", 40)}'
        f'{qr_block(cx - qs / 2, top + 540, s, "rounded", "round", INK, INK, RED)}'
        f'<text x="{cx}" y="{bot - 70}" text-anchor="middle" font-size="40" font-weight="800" letter-spacing="-.01em" fill="{INK}">vsekupony.ru</text>'
        f'<text x="{cx}" y="{bot - 28}" text-anchor="middle" font-size="24" font-weight="500" fill="{INK3}">новые купоны каждый день</text>'
    )
    return W, H, body, "Отрывной календарь"


# --------------------------------------------------------------------------
# Четвёртый заход: сам QR — купон
# --------------------------------------------------------------------------
# Поле модулей в форме билетика: скруглённые углы, полукруглые вырезы,
# линия отрыва из модулей через один и корешок с пиксельной надписью.
# Настоящий QR сидит в окне со свободным полем в два модуля; всё вокруг —
# декоративные модули того же размера, так что граница кода растворяется
# и купоном становится весь рисунок.

PIX = {
    "%": ["11000", "11001", "00010", "00100", "01000", "10011", "00011"],
    "5": ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
    "0": ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
    "-": ["00000", "00000", "00000", "11111", "00000", "00000", "00000"],
}


def pix_text(text, scale=1, rotate=False):
    """Пиксельная надпись: множество клеток (r, c), строки сверху вниз."""
    cells = set()
    x = 0
    for ch in text:
        g = PIX[ch]
        for r, row in enumerate(g):
            for c, v in enumerate(row):
                if v == "1":
                    for dr in range(scale):
                        for dc in range(scale):
                            cells.add((r * scale + dr, (x + c) * scale + dc))
        x += len(g[0]) + 1
    if rotate:  # поворот на −90°: читается снизу вверх
        w = max(c for _, c in cells) + 1
        cells = {(w - 1 - c, r) for r, c in cells}
    return cells


def cells_squares(on, rows, cols, x0, y0, s):
    d = []
    for r in range(rows):
        c = 0
        while c < cols:
            if on(r, c):
                c1 = c
                while c1 + 1 < cols and on(r, c1 + 1):
                    c1 += 1
                d.append(f"M{f(x0 + c * s)},{f(y0 + r * s)}h{f((c1 - c + 1) * s)}v{f(s)}h{f(-(c1 - c + 1) * s)}z")
                c = c1 + 1
            else:
                c += 1
    return "".join(d)


def cells_dots(on, rows, cols, x0, y0, s, k=.44):
    return "".join(
        f'<circle cx="{f(x0 + (c + .5) * s)}" cy="{f(y0 + (r + .5) * s)}" r="{f(s * k)}"/>'
        for r in range(rows) for c in range(cols) if on(r, c)
    )


def cells_liquid(on, rows, cols, x0, y0, s):
    R = s / 2
    d = []
    for r in range(rows):
        for c in range(cols):
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


def coupon_field(gw, gh, corner, notches, perf, qr_at, glyph, glyph_at, density, seed):
    """Раскладка купона в клетках модулей.
    notches — [(x, y, r)] в единицах модулей; perf — ('col'|'row', индекс):
    за ней корешок. Контур купона — сплошной ряд модулей, внутри основной
    части — случайное заполнение, корешок залит целиком, а надпись на нём
    вырезана пустыми клетками.
    Возвращает функции клеток: qr, filler, stub, perf."""
    qr_r, qr_c = qr_at
    rnd = random.Random(seed)
    kind, idx = perf

    def in_shape(r, c):
        if not (0 <= r < gh and 0 <= c < gw):
            return False
        x, y = c + .5, r + .5
        for cx, cy in ((corner, corner), (gw - corner, corner), (corner, gh - corner), (gw - corner, gh - corner)):
            if (x < corner or x > gw - corner) and (y < corner or y > gh - corner):
                if abs(x - cx) <= corner and abs(y - cy) <= corner and math.hypot(x - cx, y - cy) > corner:
                    return False
        for nx, ny, nr in notches:
            if math.hypot(x - nx, y - ny) < nr:
                return False
        return True

    def edge(r, c):
        return in_shape(r, c) and not all(in_shape(r + dr, c + dc) for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)))

    def gutter(r, c):
        """Пустая дорожка внутри контура: рамка купона читается отдельно."""
        return not edge(r, c) and any(edge(r + dr, c + dc) or not in_shape(r + dr, c + dc)
                                      for dr in (-1, 0, 1) for dc in (-1, 0, 1))

    def in_quiet(r, c):
        return qr_r - 2 <= r < qr_r + N + 2 and qr_c - 2 <= c < qr_c + N + 2

    def side(r, c):
        """-1 — основная часть, 0 — линия отрыва, 1 — корешок."""
        v = c if kind == "col" else r
        return (v > idx) - (v < idx)

    gr, gc = glyph_at
    gl = {(r + gr, c + gc) for r, c in glyph}
    rand = {(r, c): rnd.random() < density for r in range(gh) for c in range(gw)}

    def qr(r, c):
        return qr_r <= r < qr_r + N and qr_c <= c < qr_c + N and dark(r - qr_r, c - qr_c) and not in_finder(r - qr_r, c - qr_c)

    def filler(r, c):
        if not in_shape(r, c) or side(r, c) != -1 or in_quiet(r, c):
            return False
        v = c if kind == "col" else r
        if v == idx - 1:
            return False  # зазор перед линией отрыва
        return edge(r, c) or (not gutter(r, c) and rand[(r, c)])

    def stub(r, c):
        v = c if kind == "col" else r
        return in_shape(r, c) and side(r, c) == 1 and v > idx + 1 and (r, c) not in gl

    def perf_on(r, c):
        if not in_shape(r, c) or side(r, c) != 0:
            return False
        return (r if kind == "col" else c) % 2 == 0

    return qr, filler, stub, perf_on


def v25_coupon():
    """Купон целиком из модулей: чёрное поле, красный корешок с вырезанным «%»."""
    W, H = 1600, 1180
    gw, gh = 58, 39
    s = 25
    x0, y0 = (W - gw * s) / 2, (H - gh * s) / 2
    g = pix_text("%", 2)
    qr, filler, stub, perf = coupon_field(
        gw, gh, 4, [(0, gh / 2, 4.2), (40.5, 0, 2.6), (40.5, gh, 2.6)], ("col", 40), (5, 5),
        g, ((gh - 14) // 2, 42 + (16 - 10) // 2), .45, 21)
    body = (
        f'<rect width="{W}" height="{H}" fill="#fff"/>'
        f'<path fill="{INK}" d="{cells_squares(lambda r, c: qr(r, c) or filler(r, c) or perf(r, c), gh, gw, x0, y0, s)}"/>'
        f'<path fill="{RED}" d="{cells_squares(stub, gh, gw, x0, y0, s)}"/>'
        f'{finders(x0 + 5 * s, y0 + 5 * s, s, "square", INK, RED)}'
    )
    return W, H, body, "Купон из модулей"


def v26_coupon_v():
    """Вертикальный купон из точек: красный контур и корешок с «−50%», чёрный QR."""
    W, H = 1080, 1350
    gw, gh = 39, 56
    s = 20
    x0, y0 = (W - gw * s) / 2, (H - gh * s) / 2
    g = pix_text("-50%")
    gwid = max(c for _, c in g) + 1
    qr, filler, stub, perf = coupon_field(
        gw, gh, 4, [(0, 39.5, 3.6), (gw, 39.5, 3.6)], ("row", 39), (5, 5),
        g, (41 + (15 - 7) // 2, (gw - gwid) // 2), .4, 8)
    body = (
        f'<rect width="{W}" height="{H}" fill="#fff"/>'
        f'<g fill="{RED}">{cells_dots(lambda r, c: filler(r, c) or stub(r, c), gh, gw, x0, y0, s)}{cells_dots(perf, gh, gw, x0, y0, s, k=.28)}</g>'
        f'<g fill="{INK}">{cells_dots(qr, gh, gw, x0, y0, s)}</g>'
        f'{finders(x0 + 5 * s, y0 + 5 * s, s, "circle", INK, RED)}'
    )
    return W, H, body, "Вертикальный купон из точек"


def v27_coupon_soft():
    """Купон из слитых модулей: серое поле, красный корешок с «−50%» вдоль."""
    W, H = 1600, 1180
    gw, gh = 55, 39
    s = 26
    x0, y0 = (W - gw * s) / 2, (H - gh * s) / 2
    g = pix_text("-50%", rotate=True)
    gh_g = max(r for r, _ in g) + 1
    qr, filler, stub, perf = coupon_field(
        gw, gh, 5, [(40.5, 0, 3.2), (40.5, gh, 3.2)], ("col", 40), (5, 5),
        g, ((gh - gh_g) // 2, 42 + (13 - 7) // 2), .45, 4)
    body = (
        f'<rect width="{W}" height="{H}" fill="#fff"/>'
        f'<path fill="{LINE}" d="{cells_liquid(filler, gh, gw, x0, y0, s)}"/>'
        f'<path fill="{INK4}" d="{cells_liquid(perf, gh, gw, x0, y0, s)}"/>'
        f'<path fill="{RED}" d="{cells_liquid(stub, gh, gw, x0, y0, s)}"/>'
        f'<path fill="{INK}" d="{cells_liquid(qr, gh, gw, x0, y0, s)}"/>'
        f'{finders(x0 + 5 * s, y0 + 5 * s, s, "round", INK, RED)}'
    )
    return W, H, body, "Мягкий купон"


VARIANTS = [
    ("qr-1-ticket", v1_ticket),
    ("qr-2-balloon", v2_balloon),
    ("qr-3-plate", v3_plate),
    ("qr-4-tickets", v4_tickets),
    ("qr-5-sticker", v5_sticker),
    ("qr-6-cut", v6_cut),
    ("qr-7-seal", v7_seal),
    ("qr-8-clean", v8_clean),
    ("qr-9-receipt", v9_receipt),
    ("qr-10-scratch", v10_scratch),
    ("qr-11-tag", v11_tag),
    ("qr-12-stamp", v12_stamp),
    ("qr-13-stack", v13_stack),
    ("qr-14-percent", v14_percent),
    ("qr-15-hidden", v15_hidden),
    ("qr-16-burst", v16_burst),
    ("qr-17-lottery", v17_lottery),
    ("qr-18-bag", v18_bag),
    ("qr-19-gift", v19_gift),
    ("qr-20-camera", v20_camera),
    ("qr-21-pin", v21_pin),
    ("qr-22-card", v22_card),
    ("qr-23-flyer", v23_flyer),
    ("qr-24-calendar", v24_calendar),
    ("qr-25-coupon", v25_coupon),
    ("qr-26-coupon-v", v26_coupon_v),
    ("qr-27-coupon-soft", v27_coupon_soft),
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
