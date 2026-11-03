"""Стили страницы «Возможности сотрудничества» (features.html).

На странице живут два сайта сразу: шапка прототипа (как на остальных
страницах) и лендинг для бизнеса из репо vsekupony-business. У них общие
имена классов (.btn, .wrap) и свои правила для body, a, h1–h3, поэтому
их стили разведены по зонам через @scope:

  assets/site-chrome.css  — стили прототипа, действуют только внутри
                            .site-chrome (шапка, мобильное меню, окно города);
  assets/landing/business-design.scoped.css — стили лендинга, действуют
                            везде, кроме .site-chrome.

Запуск после правок лендинга или стилей прототипа:
  python tools/build-features-css.py
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITE_FILES = [
    "style.css", "design.css", "design-3.css", "design-3-cards.css",
    "design-3-type.css", "design-3-shell.css", "design-3-0924.css",
    "design-3-pages.css",
]
# Имена анимаций, которые есть в обоих сайтах: у прототипа переименовываем
RENAME_KEYFRAMES = {"pulse": "sitePulse"}
GROUP = ("@media", "@supports", "@container", "@layer")
KEEP_GLOBAL_AT = ("@keyframes", "@-webkit-keyframes", "@font-face")


def statements(css):
    """Верхнеуровневые блоки CSS: (prelude, полный текст блока)."""
    out, i, n = [], 0, len(css)

    def skip_str(i):
        q = css[i]
        i += 1
        while i < n and css[i] != q:
            i += 2 if css[i] == "\\" else 1
        return i + 1

    while i < n:
        if css.startswith("/*", i):
            j = css.find("*/", i + 2)
            i = n if j < 0 else j + 2
            continue
        if css[i].isspace():
            i += 1
            continue
        start = i
        while i < n and css[i] not in "{;":
            if css[i] in "\"'":
                i = skip_str(i)
            elif css.startswith("/*", i):
                i = css.find("*/", i + 2) + 2
            else:
                i += 1
        if i >= n:
            break
        if css[i] == ";":
            i += 1
            out.append((css[start:i - 1].strip(), css[start:i]))
            continue
        brace = i
        depth = 0
        while i < n:
            c = css[i]
            if c in "\"'":
                i = skip_str(i)
                continue
            if css.startswith("/*", i):
                i = css.find("*/", i + 2) + 2
                continue
            if c == "{":
                depth += 1
            elif c == "}":
                depth -= 1
                if depth == 0:
                    i += 1
                    break
            i += 1
        out.append((css[start:brace].strip(), css[start:i]))
    return out


def body_of(block):
    return block[block.index("{") + 1:block.rindex("}")]


def is_root_level(pre, names):
    """Селектор целиком про сам html/body/:root, без потомков:
    «:root», «html.is-modal», «body» — да; «body .btn» — нет."""
    alt = "|".join(re.escape(x) for x in names)
    pat = r"(?:" + alt + r")(?:[.:#\[][^\s>+~]*)?"
    return all(re.fullmatch(pat, x.strip()) for x in pre.split(","))


def split(css, rule):
    """Раскладывает блоки на (глобальные, в зоне), заходя внутрь @media.
    rule(pre, block) -> ("global" | "scoped" | "drop", текст)."""
    glob, scoped = [], []
    for pre, block in statements(css):
        low = pre.lower()
        if low.startswith(("@charset", "@import")):
            continue
        if low.startswith(KEEP_GLOBAL_AT):
            glob.append(block)
        elif low.startswith(GROUP):
            g, sc = split(body_of(block), rule)
            if g:
                glob.append(pre + "{\n" + "\n".join(g) + "\n}")
            if sc:
                scoped.append(pre + "{\n" + "\n".join(sc) + "\n}")
        else:
            where, text = rule(pre, block)
            if where == "global":
                glob.append(text)
            elif where == "scoped":
                scoped.append(text)
    return glob, scoped


# Классы, которые на страницах прототипа висят на body. Здесь они на
# обёртке .site-chrome — корне зоны, а внутри @scope предок должен лежать
# в зоне, корень не считается. Поэтому «.dz .x» переписываем в «:scope .x».
# «.font-onest» скрипт вешает на <html> — Онест основной шрифт, он и
# остаётся; «.font-manrope» (сравнение через ?font=manrope) здесь не нужен.
ROOT_CLASSES = r"(?:\.font-onest\s+)?(?:body)?(?:\.(?:dz3|dz|cards-wb)(?![\w-]))+"


def root_to_scope(sel):
    parts = [p for p in sel.split(",") if not p.strip().startswith(".font-manrope")]
    return ",".join(re.sub(r"^(\s*)" + ROOT_CLASSES, r"\1:scope", part) for part in parts)


def site_rule(pre, block):
    if pre == "body.no-scroll":
        return "global", block
    if all(x.strip() in (":root", "body") for x in pre.split(",")):
        # переменные и базовый шрифт — на обёртку, а не на всю страницу
        return "scoped", ":scope{" + body_of(block) + "}"
    if is_root_level(pre, ["html"]):
        return "drop", ""
    new = root_to_scope(pre)
    if not new.strip():
        return "drop", ""
    return "scoped", new + block[len(pre):] if block.startswith(pre) else block


def landing_rule(pre, block):
    if is_root_level(pre, [":root", "html", "body"]):
        # переменные, фон и шрифт страницы — вне зоны (шапка берёт свои с обёртки)
        return "global", block
    return "scoped", block


def build_site():
    glob, scoped = [], []
    for name in SITE_FILES:
        css = (ROOT / "assets" / name).read_text(encoding="utf-8")
        for old, new in RENAME_KEYFRAMES.items():
            css = re.sub(r"(@keyframes\s+)" + old + r"\b", r"\g<1>" + new, css)
            css = re.sub(r"(animation(?:-name)?\s*:[^;}]*?)\b" + old + r"\b", r"\g<1>" + new, css)
        g, sc = split(css, site_rule)
        glob += g
        scoped += sc
    head = "/* Собрано tools/build-features-css.py — руками не править */\n"
    return head + "\n".join(glob) + "\n@scope (.site-chrome) {\n" + "\n".join(scoped) + "\n}\n"


def build_landing():
    css = (ROOT / "assets" / "landing" / "business-design.css").read_text(encoding="utf-8")
    glob, scoped = split(css, landing_rule)
    head = "/* Собрано tools/build-features-css.py из business-design.css — руками не править */\n"
    return head + "\n".join(glob) + "\n@scope (body) to (.site-chrome) {\n" + "\n".join(scoped) + "\n}\n"


if __name__ == "__main__":
    (ROOT / "assets" / "site-chrome.css").write_text(build_site(), encoding="utf-8")
    (ROOT / "assets" / "landing" / "business-design.scoped.css").write_text(build_landing(), encoding="utf-8")
    print("ok")
