# -*- coding: utf-8 -*-
"""
Карта для слайда «Наш следующий шаг»: регионы России в SVG.

Две картинки:
  map-ru.svg       — европейская часть крупно: Липецкая область красным,
                     регионы следующих городов — светло-красным, остальное
                     серым; от Липецка к городам — пунктир;
  map-ru-inset.svg — вся Россия мелко, с рамкой крупного фрагмента: чтобы
                     было видно, где это на карте страны.
Подписи городов — не в SVG, а в deck.html поверх (там шрифт Onest);
координаты городов на картинке скрипт печатает, их и вставляем в разметку.

Границы регионов — click_that_hood (codeforgermany, лицензия MIT-подобная,
данные OSM). Файл скачивается при первом запуске.

Запуск: python social-kit/build-map.py
Нужен shapely.
"""

import json
import math
import urllib.request
from pathlib import Path

from shapely.geometry import shape, box
from shapely.ops import transform

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "out" / "russia.geojson"
URL = "https://raw.githubusercontent.com/codeforgermany/click_that_hood/main/public/data/russia.geojson"

HOME = "Липецкая область"
TARGETS = ["Нижегородская область", "Воронежская область", "Ростовская область",
           "Краснодарский край", "Рязанская область", "Волгоградская область", "Тульская область"]
CITIES = [("Липецк", 52.61, 39.60), ("Нижний Новгород", 56.33, 44.00), ("Воронеж", 51.67, 39.20),
          ("Ростов-на-Дону", 47.23, 39.72), ("Краснодар", 45.04, 38.98), ("Рязань", 54.63, 39.74),
          ("Волгоград", 48.71, 44.51), ("Тула", 54.19, 37.62), ("Москва", 55.75, 37.62)]

GREY, HOME_C, TARGET_C, STROKE = "#DEDEDE", "#DD443C", "#F3A9A3", "#FFFFFF"


def lcc(lon0, lat0, p1, p2):
    """Равноугольная коническая проекция Ламберта (сфера)."""
    r = math.radians
    n = math.log(math.cos(r(p1)) / math.cos(r(p2))) / \
        math.log(math.tan(math.pi / 4 + r(p2) / 2) / math.tan(math.pi / 4 + r(p1) / 2))
    F = math.cos(r(p1)) * math.tan(math.pi / 4 + r(p1) / 2) ** n / n
    rho0 = F / math.tan(math.pi / 4 + r(lat0) / 2) ** n

    def f(lon, lat):
        rho = F / math.tan(math.pi / 4 + r(lat) / 2) ** n
        th = n * r(lon - lon0)
        return rho * math.sin(th), rho0 - rho * math.cos(th)
    return f


def proj_geom(g, f):
    return transform(lambda xs, ys, zs=None: tuple(zip(*[f(x, y) for x, y in zip(xs, ys)])), g)


def path(g, fit):
    polys = [g] if g.geom_type == "Polygon" else list(g.geoms)
    d = []
    for p in polys:
        for ring in [p.exterior, *p.interiors]:
            pts = [fit(x, y) for x, y in ring.coords]
            d.append("M" + "L".join(f"{x:.1f},{y:.1f}" for x, y in pts) + "Z")
    return "".join(d)


def render(feats, f, bounds, W, H, tol, extra="", pad=1.0):
    """bounds — (lon_min, lat_min, lon_max, lat_max) того, что должно влезть."""
    if bounds:
        view = proj_geom(box(*bounds), f)
        x0, y0, x1, y1 = view.bounds
    else:
        bs = [proj_geom(g, f).bounds for _, g in feats]
        x0, y0 = min(b[0] for b in bs), min(b[1] for b in bs)
        x1, y1 = max(b[2] for b in bs), max(b[3] for b in bs)
        view = None
    k = min(W / (x1 - x0), H / (y1 - y0)) * pad
    ox, oy = (W - (x1 - x0) * k) / 2, (H - (y1 - y0) * k) / 2

    def fit(x, y):
        return ox + (x - x0) * k, H - (oy + (y - y0) * k)

    out = []
    for name, g in feats:
        pg = proj_geom(g, f).simplify(tol / k, preserve_topology=True)
        fill = HOME_C if name == HOME else TARGET_C if name in TARGETS else GREY
        out.append(f'<path d="{path(pg, fit)}" fill="{fill}"/>')
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">'
           f'<g stroke="{STROKE}" stroke-width="1.2" stroke-linejoin="round">{"".join(out)}</g>{extra}</svg>\n')
    return svg, (lambda lon, lat: fit(*f(lon, lat))), view, fit


def main():
    if not SRC.exists():
        SRC.parent.mkdir(parents=True, exist_ok=True)
        urllib.request.urlretrieve(URL, SRC)
    data = json.loads(SRC.read_text())
    feats = [(ft["properties"]["name"], shape(ft["geometry"])) for ft in data["features"]]
    # Чукотка заходит за 180-й меридиан: отрицательные долготы переносим
    # на +360, иначе на карте всей страны её кусок улетает на другой край
    wrap = lambda xs, ys, zs=None: (tuple(x + 360 if x < 0 else x for x in xs), ys)
    feats_w = [(n, transform(wrap, g)) for n, g in feats]

    # Крупно: европейская часть от Подмосковья до Кубани
    W, H = 1180, 600
    f = lcc(41, 51, 47, 57)
    bounds = (31, 43.9, 50, 57.2)
    svg, xy, _, _ = render(feats, f, bounds, W, H, tol=0.6)
    # Пунктир от Липецка к городам — под точками и подписями из deck.html
    hx, hy = xy(39.60, 52.61)
    lines = "".join(
        f'<line x1="{hx:.1f}" y1="{hy:.1f}" x2="{x:.1f}" y2="{y:.1f}" stroke="#DD443C" stroke-width="3" '
        f'stroke-dasharray="10 8" stroke-linecap="round"/>'
        for x, y in (xy(lon, lat) for _, lat, lon in CITIES[1:8]))
    svg = svg.replace("</svg>", lines + "</svg>")
    (ROOT / "map-ru.svg").write_text(svg)
    print("map-ru.svg — координаты городов:")
    for name, lat, lon in CITIES:
        x, y = xy(lon, lat)
        print(f'  ["{name}", {x:.0f}, {y:.0f}]')

    # Вся Россия мелко, с рамкой фрагмента
    W2, H2 = 420, 240
    f2 = lcc(100, 60, 52, 68)
    svg2, xy2, _, fit2 = render(feats_w, f2, None, W2, H2, tol=0.5, pad=0.86)
    frame = proj_geom(box(*bounds).segmentize(0.5), f2)
    fpts = " ".join(f"{fit2(x, y)[0]:.1f},{fit2(x, y)[1]:.1f}" for x, y in frame.exterior.coords)
    lx, ly = xy2(39.60, 52.61)
    svg2 = svg2.replace("</svg>",
        f'<polygon points="{fpts}" fill="none" stroke="#1B1B1B" stroke-width="2"/>'
        f'<circle cx="{lx:.1f}" cy="{ly:.1f}" r="5" fill="#DD443C" stroke="#fff" stroke-width="2"/></svg>')
    (ROOT / "map-ru-inset.svg").write_text(svg2)
    print("map-ru-inset.svg готов")


if __name__ == "__main__":
    main()
