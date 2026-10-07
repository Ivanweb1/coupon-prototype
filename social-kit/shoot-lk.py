# -*- coding: utf-8 -*-
"""
Скриншоты платформы для презентации — photos/lk/*.png.

Снимаются с прототипа в этом же репозитории (register-design.html и
lk/client-design.html) в двойной плотности, по одному блоку на снимок:
  step-1-register.png — форма регистрации;
  step-2-preview.png  — так купон увидят в ленте (превью конструктора);
  step-2-channels.png — где публиковать: сайт и соцсети;
  step-3-live.png     — дашборд: что опубликовано и сколько забрали;
  home-mobile.png     — витрина Липецка на телефоне (первый слайд);
  ai-offer.png        — варианты заголовка от нейросети;
  ai-image.png        — генерация изображения;
  ai-mech.png         — топовые механики в нише;
  ai-stats.png        — воронка по купонам.

Запуск: python social-kit/shoot-lk.py
"""

import os
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parent
OUT = ROOT / "photos" / "lk"
LK = (REPO / "lk" / "client-design.html").as_uri()

BOX = '''(js)=>{const e=eval(js);if(!e)return null;e.scrollIntoView({block:"center"});
  const b=e.getBoundingClientRect();return {x:b.left+scrollX,y:b.top+scrollY,width:b.width,height:b.height}}'''
LATER = '''()=>{const x=[...document.querySelectorAll("button")].find(b=>b.textContent.trim()==="Позже");x&&x.click()}'''
UNLOCK = '''()=>{document.querySelector("[data-img-lock]").hidden=true;document.querySelector("[data-img-body]").hidden=false;
  document.querySelectorAll("[data-img-tab]").forEach(t=>t.classList.toggle("is-on",t.dataset.imgTab==="gen"));
  document.querySelectorAll("[data-img-pane]").forEach(p=>p.hidden=p.dataset.imgPane!=="gen");}'''
BY_TEXT = '[...document.querySelectorAll("*")].find(e=>e.childElementCount===0&&e.textContent.trim()==="{t}").closest("{c}")'


def shot(pg, js, name, pad=0):
    r = pg.evaluate(BOX, js)
    if not r:
        print("не найдено:", name)
        return
    clip = {"x": r["x"] - pad, "y": r["y"] - pad, "width": r["width"] + 2 * pad, "height": r["height"] + 2 * pad}
    pg.screenshot(path=str(OUT / name), clip=clip, full_page=True)
    print(name)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    launch = {"executable_path": "/opt/pw-browsers/chromium"} if os.path.exists("/opt/pw-browsers/chromium") else {}
    with sync_playwright() as p:
        b = p.chromium.launch(**launch)
        pg = b.new_page(viewport={"width": 1440, "height": 900}, device_scale_factor=2)

        # 1. Регистрация — карточка формы
        pg.goto((REPO / "register-design.html").as_uri())
        pg.wait_for_timeout(1000)
        pg.screenshot(path=str(OUT / "step-1-register.png"), clip={"x": 60, "y": 322, "width": 741, "height": 500})
        print("step-1-register.png")

        # 2. Конструктор: заполняем поля, снимаем превью и подсказки нейросети
        pg.goto(LK + "?view=new-regional")
        pg.wait_for_timeout(1200)
        for k, v in [("title", "Комбо-обед по будням до 16:00"), ("value", "−25%")]:
            el = pg.query_selector(f'[data-f="{k}"]')
            if el:
                el.fill(v)
                el.dispatch_event("input")
        pg.wait_for_timeout(400)
        # В превью — пример снимка из библиотеки ленты вместо пустого места
        # под изображение; всплывающие подсказки кабинета убираем
        pg.evaluate('''(u)=>{const m=document.querySelector(".lk-prev__media");
          m.style.background="url("+u+") center/cover";m.querySelectorAll(":scope > :not(.lk-prev__badge):not(.lk-prev__near):not(.lk-prev__stats)").forEach(e=>e.style.visibility="hidden");
          document.querySelectorAll(".lk-toast,[class*=toast],[class*=nudge],[class*=survey]").forEach(e=>e.remove())}''',
          (REPO / "assets" / "coupons" / "eda-cool.jpg").as_uri())
        pg.wait_for_timeout(300)
        shot(pg, 'document.querySelector(".lk-prev__card")', "step-2-preview.png")
        pg.evaluate('''()=>{const a=document.querySelector("[data-ai-titles]");a.id="xAi";a.previousElementSibling.id="xTitle"}''')
        pg.evaluate('''()=>{const t=document.querySelector("#xTitle");t.querySelector("input").value=""}''')
        r1 = pg.evaluate(BOX, 'document.querySelector("#xTitle")')
        r2 = pg.evaluate(BOX, 'document.querySelector("#xAi")')
        pg.screenshot(path=str(OUT / "ai-offer.png"), full_page=True, clip={
            "x": r1["x"] - 16, "y": r1["y"] - 16, "width": r1["width"] + 32,
            "height": r2["y"] + r2["height"] - r1["y"] + 32})
        print("ai-offer.png")
        shot(pg, BY_TEXT.format(t="Каналы публикации", c=".lk-panel,section"), "step-2-channels.png")
        pg.evaluate(UNLOCK)
        for _ in range(3):
            pg.evaluate('document.querySelector("[data-img-gen]").click()')
            pg.wait_for_timeout(3600)
        pg.evaluate(UNLOCK)
        pg.wait_for_timeout(300)
        shot(pg, 'document.querySelector("[data-img]").closest(".lk-panel")', "ai-image.png")

        # 3. Дашборд: опубликованные купоны и механики
        pg.goto(LK + "?view=dashboard")
        pg.wait_for_timeout(1200)
        pg.evaluate(LATER)
        pg.wait_for_timeout(400)
        shot(pg, BY_TEXT.format(t="Опубликовано сейчас", c=".lk-panel,section"), "step-3-live.png")
        shot(pg, BY_TEXT.format(t="Топовые механики в ваших нишах", c=".lk-panel,section"), "ai-mech.png")

        # Витрина на телефоне (первый слайд): первые четыре карточки — понятные
        # купоны из набора соцсетей, чтобы снимок и заголовок совпадали
        m = b.new_page(viewport={"width": 400, "height": 860}, device_scale_factor=2, is_mobile=True, has_touch=True)
        m.goto((REPO / "index-design-3.html").as_uri() + "?city=lipetsk")
        m.wait_for_timeout(1500)
        m.evaluate('''()=>{const x=[...document.querySelectorAll("button")].find(b=>/Да, я в городе/.test(b.textContent));x&&x.click()}''')
        m.wait_for_timeout(700)
        m.evaluate('''(cards)=>{document.querySelectorAll(".card").forEach((c,i)=>{const d=cards[i];if(!d)return;
          c.querySelector(".card__media").style.background="url(assets/coupons/"+d[0]+") center/cover no-repeat";
          c.querySelector(".card__title").textContent=d[1];c.querySelector(".card__meta b").textContent=d[2];
          c.querySelector(".card__meta span").textContent=d[3];c.querySelector(".card__badge").textContent=d[4];
          const n=c.querySelector(".card__near");if(n)n.textContent=d[5];
          c.querySelectorAll(".card__stat-full,.card__stat-short").forEach(e=>e.textContent=d[6]);})}''',
          [["kofe-warm.jpg", "Каждая пятая чашка кофе в подарок", "Кофейня «Пример»", "Кафе", "5 = 4", "7 мин от вас", "3,1к"],
           ["manikyur-rose.jpg", "Маникюр с покрытием: два по цене одного", "Студия «Пример»", "Красота", "2 = 1", "12 мин от вас", "2,4к"],
           ["fitness.jpg", "Годовой абонемент в клуб", "Фитнес «Пример»", "Спорт", "−35%", "9 мин от вас", "1,8к"],
           ["eda-cool.jpg", "Комбо-обед по будням до 16:00", "Кафе «Пример»", "Кафе", "349 ₽", "4 мин от вас", "2,7к"]])
        m.wait_for_timeout(300)
        m.screenshot(path=str(OUT / "home-mobile.png"), clip={"x": 0, "y": 0, "width": 400, "height": 860})
        print("home-mobile.png")

        # Статистика: воронка
        pg.goto(LK + "?view=stats")
        pg.wait_for_timeout(1500)
        pg.evaluate(LATER)
        shot(pg, BY_TEXT.format(t="Воронка по всем купонам", c=".lk-panel,section,.lk-card"), "ai-stats.png")
        b.close()


if __name__ == "__main__":
    main()
