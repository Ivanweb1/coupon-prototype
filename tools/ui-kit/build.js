/* ==========================================================================
   Сборка UI-кита для переноса в Figma
   ==========================================================================
   Запуск из корня репозитория:  node tools/ui-kit/build.js

   Что делает. Поднимает локальный сервер, открывает настоящие страницы
   прототипа в браузере (Playwright), дожидается, пока скрипты их нарисуют,
   и забирает готовые компоненты — ту же разметку, что видит посетитель.
   Из них собирает статические страницы:

     ui-kit.html          — все элементы по умолчанию, десктоп (1440);
     ui-kit-mobile.html   — те же элементы на телефоне (390) и состояния
                            мобильных элементов;
     ui-kit-states.html   — состояния (наведение, фокус, нажатие, выбрано,
                            ошибка, выключено) и дизайн-система: цвета,
                            типографика, скругления, тени, иконки.

   Телефон — отдельной страницей, потому что мобильная вёрстка включается
   по ширине окна: на широкой странице кита она бы не сработала. В Figma
   её забирают с шириной экрана 390.

   Как сохраняется вид. Компонент забирается вместе с цепочкой родителей
   (#feed, .quick, #lkView…), но родители получают display:contents: места
   не занимают, а правила вида «#feed .card» продолжают работать. Тело
   страницы заменяет обёртка с теми же классами. Стили собираются в один
   файл assets/ui-kit.css: пути к картинкам поправлены, «body.» заменено
   на обёртку, общий для витрины и кабинета .lk-chip разведён.

   Состояния :hover / :focus / :active браузер сам не покажет, поэтому
   такие правила копируются в классы .is-hover / .is-focus / .is-active.

   Нужен Playwright с Chromium (в окружении Claude Code он уже стоит).
   ========================================================================== */

const fs = require("fs");
const path = require("path");
const http = require("http");
const { execSync } = require("child_process");

let chromium;
try { ({ chromium } = require("playwright")); }
catch (e) { ({ chromium } = require(path.join(execSync("npm root -g").toString().trim(), "playwright"))); }

const ROOT = path.resolve(__dirname, "../..");
const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "application/javascript",
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".svg": "image/svg+xml" };

function serve() {
  return new Promise(resolve => {
    const srv = http.createServer((req, res) => {
      const p = decodeURIComponent(req.url.split("?")[0]);
      const file = path.join(ROOT, p === "/" ? "index.html" : p);
      if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end(); }
      res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
      fs.createReadStream(file).pipe(res);
    });
    srv.listen(0, () => resolve(srv));
  });
}

/* --------------------------------------------------------------------------
   Стили кита — один файл
   -------------------------------------------------------------------------- */
const PUB_CSS = ["assets/style.css", "assets/design.css", "assets/design-3.css", "assets/design-3-cards.css", "assets/design-3-type.css",
  "assets/design-3-shell.css", "assets/design-3-0924.css", "assets/design-3-pages.css", "assets/design-3-coupon.css",
  "assets/register.css", "assets/design-3-register.css"];
const LK_CSS = ["lk/assets/lk.css", "lk/assets/lk-design.css", "lk/assets/lk-design-0924.css"];

function buildCSS() {
  const out = [];
  for (const f of PUB_CSS.concat(LK_CSS)) {
    let css = fs.readFileSync(path.join(ROOT, f), "utf8");
    const dir = path.dirname(f);
    /* Пути url() — относительно assets/, где лежит ui-kit.css */
    css = css.replace(/url\((['"]?)(?!data:|https?:|\/)([^'")]+)\1\)/g, (m, q, u) =>
      "url(" + q + path.posix.relative("assets", path.posix.join(dir, u)) + q + ")");
    /* Тело страницы в ките — обёртка .kit-b с классами тела */
    css = css.replace(/(^|[\s,>+~(])body(?=[.:#\[\s{,])/g, "$1.kit-b");
    /* .lk-chip: у витрины это кнопка «Кабинет» в шапке, у кабинета — метка */
    if (f === "lk/assets/lk.css") css = css.replace(/^\.lk-chip\{/m, ".lkd .lk-chip{");
    out.push(`/* ==== ${f} ==== */\n` + css);
  }
  fs.writeFileSync(path.join(ROOT, "assets/ui-kit.css"),
    "/* Стили UI-кита — собраны скриптом tools/ui-kit/build.js из стилей сайта. Вручную не править. */\n" + out.join("\n"));
}

/* --------------------------------------------------------------------------
   Что забираем
   -------------------------------------------------------------------------- */
const PUB = "index-design-3.html";
const CL = "lk/client-design.html";
const PT = "lk/partner-design.html?regional=1";

/* w — ширина окна (1440 — на странице десктопа, 390 — на странице
   телефона); fixed — элемент во весь экран (попап, окно): берём его
   целиком в рамке размером с экран, frameH — высота рамки. */
const SECTIONS = [
  { title: "Витрина · шапка и первый экран", items: [
    { name: "Шапка", page: PUB, sel: ".dz-header" },
    { name: "Первый экран", page: PUB, sel: ".dz-hero" },
  ] },
  { title: "Витрина · карточки купонов", items: [
    { name: "Карточка", page: PUB, sel: "#feed .card:not(:has(.card__near--mp)):not(:has(.verified-flag))" },
    { name: "Карточка · проверено", page: PUB, sel: "#feed .card:has(.verified-flag)" },
    { name: "Карточка · маркетплейс", page: PUB, prep: "mpFeed", sel: "#feed .card:has(.card__near--mp)" },
    { name: "Лента", page: PUB, sel: "#feed", only: "m" },
  ] },
  { title: "Витрина · попап купона и окна", items: [
    { name: "Попап купона", page: PUB, prep: "openQuick", sel: "#quick", fixed: true },
    { name: "Попап · маркетплейс", page: PUB, prep: "openQuickMp", sel: "#quick", fixed: true },
    { name: "Выбор города", page: PUB, prep: "openCity", sel: "#cityModal", fixed: true },
  ] },
  { title: "Витрина · подвал", items: [
    { name: "Баннер «Для бизнеса»", page: PUB, sel: ".dz-biz" },
    { name: "Подвал", page: PUB, sel: "footer.footer" },
  ] },
  { title: "Страница купона", items: [
    { name: "Страница купона", page: "coupon-design.html", sel: "main" },
  ] },
  { title: "Регистрация и вход", items: [
    { name: "Шапка регистрации", page: "register-partner-design.html", sel: ".dz-header" },
    { name: "Регистрация рекламодателя", page: "register-design.html", sel: ".reg__card" },
    { name: "Боковая колонка", page: "register-design.html", sel: ".rg-side", only: "d" },
    { name: "Регистрация партнёра · по маркетплейсам", page: "register-partner-design.html", sel: ".reg__card" },
    { name: "Регистрация партнёра · региональный", page: "register-partner-design.html?tab=regional", sel: ".reg__card" },
    { name: "Вход", page: "login-design.html", sel: ".lg__card" },
  ] },
  { title: "Кабинет рекламодателя · каркас", items: [
    { name: "Меню", page: CL + "?view=dashboard", sel: ".lk__side", only: "d" },
    { name: "Шапка", page: CL + "?view=dashboard", sel: ".lk__top" },
    { name: "Нижнее меню", page: CL + "?view=dashboard", sel: ".lkd-tabbar", fixed: true, frameH: 80, only: "m" },
    { name: "Меню «Ещё»", page: CL + "?view=dashboard", prep: "openMore", sel: ".lk__side", fixed: true, only: "m" },
  ] },
  { title: "Кабинет рекламодателя · разделы", items: [
    { name: "Дашборд", page: CL + "?view=dashboard", sel: "#lkView" },
    { name: "Мои купоны", page: CL + "?view=coupons", sel: "#lkView" },
    { name: "Конструктор · региональный купон", page: CL + "?view=new-regional", sel: "#lkView" },
    { name: "Конструктор · маркетплейс", page: CL + "?view=new-marketplace", sel: "#lkView", only: "d" },
    { name: "Конструктор · для бизнеса", page: CL + "?view=new-business", sel: "#lkView", only: "d" },
    { name: "Статистика", page: CL + "?view=stats", sel: "#lkView" },
    { name: "Биллинг", page: CL + "?view=billing", sel: "#lkView" },
    { name: "Профиль компании", page: CL + "?view=profile", sel: "#lkView" },
    { name: "База знаний", page: CL + "?view=kb", sel: "#lkView" },
    { name: "Уведомления", page: CL + "?view=notifications", sel: "#lkView" },
    { name: "Окно «Создать купон»", page: CL + "?view=dashboard", prep: "openCreate", sel: "#lkModal", fixed: true },
  ] },
  { title: "Кабинет партнёра", items: [
    { name: "Меню", page: PT + "&view=dashboard", sel: ".lk__side", only: "d" },
    { name: "Дашборд", page: PT + "&view=dashboard", sel: "#lkView" },
    { name: "Купоны клиентов", page: PT + "&view=clients", sel: "#lkView" },
    { name: "Промокоды", page: PT + "&view=codes", sel: "#lkView" },
    { name: "Бонусы клиентам", page: PT + "&view=bonuses", sel: "#lkView" },
    { name: "Отчёты и выплаты", page: PT + "&view=payouts", sel: "#lkView" },
    { name: "Ваш профиль", page: PT + "&view=profile", sel: "#lkView" },
    { name: "Документы", page: PT + "&view=docs", sel: "#lkView", only: "d" },
  ] },
];

/* Состояния: образец и набор состояний. m — показать на странице телефона */
const STATES = [
  { title: "Кнопки · витрина", items: [
    { name: "Главная (красная)", page: PUB, sel: ".dz-header .header-cta", states: ["default", "hover", "focus", "active"] },
    { name: "Белая на красном", page: PUB, sel: ".dz-biz .dz-btn-white", states: ["default", "hover", "focus", "active"], bg: "#DD443C" },
    { name: "Второстепенная", page: PUB, sel: "#feed .card .btn--ghost", states: ["default", "hover", "focus", "active"] },
    { name: "Забрать купон", page: PUB, sel: "#feed .card .btn--solid", states: ["default", "hover", "active"] },
    { name: "Город", page: PUB, sel: ".dz-header .city-btn", states: ["default", "hover", "focus"] },
    { name: "Кабинет", page: PUB, sel: ".dz-header .lk-chip", states: ["default", "hover", "focus"] },
    { name: "Соцсеть", page: PUB, sel: ".dz-header .head-socials .soc", states: ["default", "hover"] },
  ] },
  { title: "Карточка и категории", items: [
    { name: "Карточка", page: PUB, sel: "#feed .card:has(.verified-flag)", states: ["default", "hover"], fit: true /* в ленте карточка резиновая — без ширины схлопнется */ },
    { name: "Действие в столбике", page: PUB, sel: "#feed .card .card__stats", states: ["default", "hover"], bg: "#8d8b87",
      /* столбик целиком — кнопка без своей белой подложки не читается; состояние на «Скопировать» */
      inner: "card__stat card__stat--act" },
    { name: "Плашка раздела", page: PUB, sel: ".dz-tags .tags-row__l1 > *", states: ["default", "hover", "on"],
      /* наведение висит на кнопке .tag внутри выпадашки, «выбрано» — это открытая выпадашка */
      inner: "tag", onCls: "is-open" },
    { name: "Поиск", page: PUB, sel: ".dzl__search", states: ["default", "focus-within"] },
  ] },
  { title: "Формы · регистрация и вход", items: [
    { name: "Поле", page: "register-design.html", sel: "[data-reg-email]", states: ["default", "focus", "filled", "disabled"] },
    { name: "Выбор формы", page: "register-design.html", sel: ".reg__chip[data-org='ИП']", states: ["default", "hover", "on"] },
    { name: "Согласие", page: "register-design.html", sel: ".reg__consent", states: ["default", "checked", "error"] },
    { name: "Вкладка роли партнёра", page: "register-partner-design.html", sel: ".rg-tab[data-ptab='regional']", states: ["default", "hover", "on"] },
  ] },
  { title: "Кабинет · кнопки и меню", items: [
    { name: "Главная (красная)", page: CL + "?view=dashboard", sel: "#lkCta", states: ["default", "hover", "focus", "active"] },
    { name: "Второстепенная", page: CL + "?view=dashboard", sel: "#lkView .btn--ghost", states: ["default", "hover", "focus", "disabled"] },
    { name: "Серая «Редактировать»", page: CL + "?view=profile", sel: ".lkd-btn-grey", states: ["default", "hover", "focus"] },
    { name: "Подписаться в бота", page: CL + "?view=profile", sel: ".lkd-sub-btn.btn--solid", states: ["default", "hover", "focus"] },
    { name: "Пункт меню", page: CL + "?view=stats", sel: ".lk__nav a:not(.is-on)", states: ["default", "hover", "on"] },
    { name: "Нижнее меню · пункт", page: CL + "?view=dashboard", sel: ".lkd-tabbar__i[data-tab='stats']", states: ["default", "on"], m: true },
    { name: "Нижнее меню · создать", page: CL + "?view=dashboard", sel: ".lkd-tabbar__i--main", states: ["default", "on"], m: true },
  ] },
  { title: "Кабинет · поля и выбор", items: [
    { name: "Поле", page: CL + "?view=profile", sel: "[data-edit-f='co']", states: ["default", "focus", "disabled"], edit: "co" },
    { name: "Список", page: CL + "?view=stats", sel: "[data-stat-period]", states: ["default", "focus"] },
    { name: "Галочка канала", page: CL + "?view=new-regional", sel: "[data-channels] .lk-ch:has([data-ch])", states: ["default", "hover", "unchecked"] },
    { name: "Плитка города", page: CL + "?view=new-regional", sel: ".lkd-geo [data-city]:not(.is-on)", states: ["default", "hover", "on", "disabled"] },
    { name: "Способ оплаты", page: CL + "?view=billing", sel: ".lkd-way:not(.is-on)", states: ["default", "hover", "on"] },
    { name: "Проверка тайным покупателем", page: CL + "?view=new-regional", sel: ".lk-secret", states: ["default", "added"] },
  ] },
  { title: "Кабинет · таблицы и навигация", items: [
    { name: "Кнопка страницы", page: CL + "?view=billing", sel: ".lkd-pg__b:not(.is-on):not(:disabled)", states: ["default", "hover", "on", "disabled"] },
    { name: "Сортировка столбца", page: PT + "&view=clients", sel: ".lkd-sort", states: ["default", "hover", "on"] },
    { name: "Посмотреть купон", page: PT + "&view=clients", sel: "a.lkd-eye", states: ["default", "hover", "off"] },
    { name: "Месяц", page: PT + "&view=payouts", sel: ".lkd-month__b:not(:disabled)", states: ["default", "hover", "disabled"] },
    { name: "Статья базы знаний", page: PT + "&view=kb", sel: ".lkd-kb__it:not(.is-on)", states: ["default", "hover", "on"] },
    { name: "Материал в статье", page: PT + "&view=kb", prep: "kbFile", sel: ".lkd-file", states: ["default", "hover"] },
  ] },
];

/* --------------------------------------------------------------------------
   Браузер
   -------------------------------------------------------------------------- */
async function openPage(browser, base, url, w) {
  const p = await browser.newPage({ viewport: { width: w, height: w < 600 ? 844 : 900 } });
  p.errs = [];
  p.on("pageerror", e => p.errs.push(e.message));
  await p.goto(base + "/index-design-3.html");
  await p.evaluate(() => {
    localStorage.setItem("cp_city_ok", "1");
    localStorage.setItem("cp_city", "lipetsk");
    localStorage.setItem("lkd_kpi_oct", "1");
  });
  await p.goto(base + "/" + url, { waitUntil: "networkidle" });
  await p.waitForTimeout(700);
  /* Плашка «Анкета о компании» и приветствие кабинета — всплывающие
     подсказки, а не части раздела */
  await p.evaluate(() => {
    document.querySelectorAll(".lk-pill").forEach(e => e.remove());
    const m = document.getElementById("lkModal");
    if (m) m.classList.remove("is-open", "is-on");
  });
  return p;
}

async function prep(p, what) {
  if (!what) return;
  if (what === "mpFeed") {
    for (let i = 0; i < 15 && !(await p.$("#feed .card__near--mp")); i++) { await p.reload({ waitUntil: "networkidle" }); await p.waitForTimeout(400); }
  }
  if (what === "openQuick" || what === "openQuickMp") {
    const sel = what === "openQuickMp" ? "#feed .card:has(.card__near--mp) .card__media" : "#feed .card:has(.verified-flag) .card__media";
    /* Лента случайная: карточки маркетплейса может не оказаться — перезагружаем */
    for (let i = 0; i < 15 && !(await p.$(sel)); i++) { await p.reload({ waitUntil: "networkidle" }); await p.waitForTimeout(400); }
    await p.click(sel);
    await p.waitForTimeout(900);
  }
  if (what === "openCity") { await p.evaluate(() => document.querySelector("[data-city-open]").click()); await p.waitForTimeout(500); }
  if (what === "kbFile") { await p.evaluate(() => document.querySelector('[data-kb="p-checklist"]').click()); await p.waitForTimeout(300); }
  if (what === "openCreate") { await p.evaluate(() => openCreateModal()); await p.waitForTimeout(400); }
  if (what === "openMore") { await p.evaluate(() => document.querySelector("[data-tab-more]").click()); await p.waitForTimeout(400); }
}

/* Снимок компонента вместе с цепочкой родителей. Родители — пустые копии
   с классами и id и display:contents; тело — обёртка с его классами. */
async function snap(p, sel, fixed) {
  return p.evaluate(({ sel, fixed }) => {
    const el = sel.split(/,\s*/).map(s => document.querySelector(s)).find(Boolean);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    document.querySelectorAll("input, textarea, select").forEach(i => {
      if (i.type === "checkbox" || i.type === "radio") { if (i.checked) i.setAttribute("checked", ""); else i.removeAttribute("checked"); }
      else if (i.tagName === "SELECT") [...i.options].forEach(o => { if (o.selected) o.setAttribute("selected", ""); else o.removeAttribute("selected"); });
      else if (i.tagName === "TEXTAREA") i.textContent = i.value;
      else if (i.value) i.setAttribute("value", i.value);
    });
    const rel = u => {
      try { const x = new URL(u, location.href); return x.origin === location.origin ? x.pathname.replace(/^\//, "") + x.search : u; }
      catch (e) { return u; }
    };
    const clean = n => {
      [n, ...n.querySelectorAll("*")].forEach(x => {
        ["src", "poster"].forEach(a => { if (x.hasAttribute(a)) { const v = x.getAttribute(a); if (v && !v.startsWith("data:")) x.setAttribute(a, rel(v)); } });
        if (x.tagName === "A" && x.hasAttribute("href")) x.setAttribute("href", "#");
        if (x.hasAttribute("srcset")) x.setAttribute("srcset", x.getAttribute("srcset").split(",").map(s => { const [u, d] = s.trim().split(/\s+/); return rel(u) + (d ? " " + d : ""); }).join(", "));
        const st = x.getAttribute("style");
        if (st && st.includes("url(")) x.setAttribute("style", st.replace(/url\((['"]?)([^'")]+)\1\)/g, (m, q, u) => "url(" + q + (u.startsWith("data:") ? u : rel(u)) + q + ")"));
      });
      return n;
    };
    const root = clean(el.cloneNode(true));
    /* Внешние отступы компонента зависят от соседей на странице — в ките они не нужны */
    if (!fixed) root.style.margin = "0";
    const html = root.outerHTML;
    let pre = "", post = "";
    for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
      const attrs = [...a.attributes].filter(x => x.name !== "style" && x.name !== "hidden" && !/^on/.test(x.name))
        .map(x => ` ${x.name}="${x.value.replace(/"/g, "&quot;")}"`).join("");
      pre = `<${a.tagName.toLowerCase()}${attrs} style="display:contents">` + pre;
      post += `</${a.tagName.toLowerCase()}>`;
    }
    const body = { cls: document.body.className, role: document.body.dataset.role || "" };
    return { html, pre, post, body, w: Math.round(r.width), h: Math.round(r.height), vw: innerWidth, vh: innerHeight, fixed };
  }, { sel, fixed: !!fixed });
}

/* Правила :hover / :focus / :active — копией в классы, с обёртками
   @media и @container */
async function stateCSS(p) {
  return p.evaluate(() => {
    const MAP = [[/:hover/g, ".is-hover"], [/:focus-visible/g, ".is-focus"], [/:focus-within/g, ".is-focus-within"], [/:focus(?![-\w])/g, ".is-focus"], [/:active/g, ".is-active"]];
    const walk = rules => {
      let out = "";
      for (const r of rules) {
        if (r.cssRules && !r.selectorText) {
          const inner = walk(r.cssRules);
          if (inner) out += r.cssText.slice(0, r.cssText.indexOf("{")).trim() + "{" + inner + "}\n";
        } else if (r.selectorText && /:(hover|focus|active)/.test(r.selectorText)) {
          let sel = r.selectorText;
          MAP.forEach(([re, cls]) => { sel = sel.replace(re, cls); });
          out += sel + "{" + r.style.cssText + "}\n";
        }
      }
      return out;
    };
    let css = "";
    for (const sh of document.styleSheets) { try { if (sh.href && sh.href.includes("ui-kit.css")) css += walk(sh.cssRules); } catch (e) {} }
    return css;
  });
}

/* --------------------------------------------------------------------------
   Разметка страниц
   -------------------------------------------------------------------------- */
function head(title, mobile, extra) {
  return `<!doctype html>
<html lang="ru" class="val-ticket font-onest">
<head>
<meta charset="utf-8">
<meta name="robots" content="noindex, nofollow">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<!-- Собрано скриптом tools/ui-kit/build.js из вёрстки сайта — вручную не править -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Onest:wght@300;400;500;600;700;800&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/ui-kit.css?v=${Date.now().toString(36)}">
<link rel="icon" href="assets/brand/logo-red.png">
<style>
/* Оформление самого кита: серый фон, подписи, рамки образцов */
body.kit{margin:0;background:#E4E4E1;color:#151514;font-family:"Onest",ui-sans-serif,system-ui,sans-serif;min-width:${mobile ? 390 : 1520}px}
.kit-top{display:flex;align-items:center;flex-wrap:wrap;gap:8px 24px;padding:18px ${mobile ? 16 : 40}px;background:#151514;color:#fff}
.kit-top b{font-size:18px;margin-right:8px}
.kit-top a{color:#fff;opacity:.6;text-decoration:none;font-size:14px}
.kit-top a.is-on{opacity:1;text-decoration:underline;text-underline-offset:4px}
.kit-top span{font-size:13px;opacity:.6}
.kit-sec{padding:${mobile ? "32px 0 8px" : "48px 40px 8px"}}
.kit-sec > h2{margin:0 0 20px;padding:0 ${mobile ? 16 : 0}px;font-size:${mobile ? 22 : 30}px;font-weight:700;letter-spacing:-.02em}
.kit-row{display:flex;flex-wrap:wrap;align-items:flex-start;gap:${mobile ? 28 : 40}px}
.kit-spec{display:flex;flex-direction:column;gap:10px}
.kit-l{padding:0 ${mobile ? 16 : 0}px;font-size:13px;font-weight:600;color:#55534f}
.kit-l small{font-weight:400;color:#8d8b87;margin-left:6px}
.kit-box{position:relative;background:#fff;box-shadow:0 0 0 1px rgba(0,0,0,.06);transform:translateZ(0)}
/* фиксированные части страниц — внутри своего образца */
.kit-box .lk__side::after{position:absolute;left:auto;right:0;top:0;bottom:0;height:auto}
.kit-box .lk__side[style*="display:contents"]::after{display:none}
/* украшения родителей (водяной знак фото и т.п.) в образец не попадают */
.kit-box [style*="display:contents"]::before,.kit-box [style*="display:contents"]::after{display:none}
.kit-box--frame{overflow:hidden;transform:translateZ(0)}
.kit-box--grey{background:#F5F5F4}
/* баннер «Для бизнеса» на главной наезжает на блок выше (translateY). Отдельным образцом — без сдвига,
   в подвале сдвиг как на сайте, а над образцом место под выступ */
.kit-box .dz-biz[style*="margin"]{transform:none}
.kit-spec:has(.kit-box .footer[style*="margin"]) > .kit-box{margin-top:${mobile ? 40 : 56}px}
.kit-b{display:block;min-height:0;background:none}
.kit-states{display:flex;flex-wrap:wrap;align-items:flex-start;gap:16px;padding:0 ${mobile ? 16 : 0}px}
.kit-state{display:flex;flex-direction:column;gap:8px;align-items:flex-start}
.kit-state > span{font-size:12px;color:#8d8b87}
/* в состояниях — только сам элемент: список выпадашки и привязка к фото карточки не нужны */
.kit-state .dd__panel{display:none!important}
.kit-state .card__stats{position:relative;inset:auto;transform:none}
.kit-state > .kit-box{padding:16px;border-radius:6px}
.kit-sw{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:14px}
.kit-sw__i{background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 0 0 1px rgba(0,0,0,.06)}
.kit-sw__c{height:72px;box-shadow:inset 0 -1px 0 rgba(0,0,0,.06)}
.kit-sw__t{padding:10px 12px;font-size:12px;line-height:1.5;color:#55534f}
.kit-sw__t b{display:block;font-size:13px;color:#151514}
.kit-sub{margin:28px 0 12px;font-size:14px;font-weight:600;color:#55534f}
.kit-type{display:flex;flex-direction:column;gap:20px;background:#fff;border-radius:10px;padding:28px}
.kit-type__i{display:grid;grid-template-columns:300px 1fr;gap:24px;align-items:baseline}
.kit-type__m{font-size:12px;color:#8d8b87;line-height:1.55}
.kit-type__m b{display:block;color:#151514;font-size:13px}
.kit-tok{display:flex;flex-wrap:wrap;gap:24px}
.kit-tok__i{display:flex;flex-direction:column;align-items:center;gap:8px;font-size:12px;color:#55534f;text-align:center}
.kit-tok__i b{color:#151514}
.kit-tok__i i{display:block;width:96px;height:96px;background:#fff;border:1px solid #c9c8c5}
.kit-ic{display:grid;grid-template-columns:repeat(auto-fill,minmax(112px,1fr));gap:12px}
.kit-ic__i{display:flex;flex-direction:column;align-items:center;gap:10px;padding:18px 8px;background:#fff;border-radius:10px;font-size:12px;color:#55534f;box-shadow:0 0 0 1px rgba(0,0,0,.06)}
.kit-ic__i svg,.kit-ic__i img{width:24px;height:24px;flex:none}
${extra || ""}
</style>
</head>`;
}

function topbar(on, date) {
  const L = [["ui-kit.html", "1. Элементы · десктоп"], ["ui-kit-mobile.html", "2. Элементы · телефон (390)"], ["ui-kit-states.html", "3. Состояния и дизайн-система"]];
  return `<header class="kit-top"><b>Все купоны · UI-кит</b>
  ${L.map(([h, t], i) => `<a href="${h}"${on === i + 1 ? ' class="is-on"' : ""}>${t}</a>`).join("\n  ")}
  <span>собрано из вёрстки ${date}</span></header>`;
}

/* Образец: обёртка тела + цепочка родителей + компонент */
function wrap(s, html) {
  return `<div class="kit-b ${s.body.cls}"${s.body.role ? ` data-role="${s.body.role}"` : ""}>${s.pre}${html}${s.post}</div>`;
}
function specHTML(name, s) {
  const style = s.fixed ? `width:${s.vw}px;height:${s.frameH || s.vh}px` : `width:${s.w}px`;
  const size = s.fixed ? `экран ${s.vw}×${s.frameH || s.vh}` : `${s.w}×${s.h}`;
  return `<div class="kit-spec"><div class="kit-l">${name}<small>${size}</small></div>
    <div class="kit-box${s.fixed ? " kit-box--frame" : ""}" style="${style}">${wrap(s, s.html)}</div></div>`;
}

const LABEL = { default: "По умолчанию", hover: "Наведение", focus: "Фокус", "focus-within": "Фокус", active: "Нажатие",
  on: "Выбрано", disabled: "Недоступно", filled: "Заполнено", checked: "Отмечено", unchecked: "Не отмечено", error: "Ошибка",
  off: "Неактивно", added: "Добавлено" };

function stateVariant(s, st, it = {}) {
  let html = s.html;
  const addInner = cls => html.replace(new RegExp(`class="(${it.inner}(?:\\s[^"]*)?)"`), (m, v) => `class="${v} ${cls}"`);
  const addClass = cls => (it.inner && cls !== (it.onCls || "is-on")) ? addInner(cls) : html.replace(/^<([a-z0-9-]+)([^>]*)>/i, (m, tag, attrs) =>
    /\sclass="/.test(attrs) ? `<${tag}${attrs.replace(/\sclass="([^"]*)"/, (mm, v) => ` class="${v} ${cls}"`)}>` : `<${tag}${attrs} class="${cls}">`);
  if (st === "hover") html = addClass("is-hover");
  if (st === "focus") html = addClass("is-focus");
  if (st === "focus-within") html = addClass("is-focus-within");
  if (st === "active") html = addClass("is-active is-hover");
  if (st === "on") html = addClass(it.onCls || "is-on");
  if (st === "disabled") html = /^<(button|input|select|textarea)/i.test(html) ? html.replace(/^<([a-z]+)/i, "<$1 disabled") : html.replace(/<(button|input|select)(?=[\s>])/gi, "<$1 disabled");
  if (st === "filled") html = html.replace(/^<input/i, '<input value="hello@primer.ru"');
  if (st === "checked") html = html.replace(/<input(?![^>]*\bchecked)/i, "<input checked");
  if (st === "unchecked") html = html.replace(/\schecked(="")?/g, "").replace(/^(<[^>]*class="[^"]*)\bis-on\b/, "$1");
  if (st === "error") html = addClass("is-bad");
  if (st === "off") html = html.replace(/^<a\b/i, "<span").replace(/<\/a>$/i, "</span>").replace(/class="lkd-eye/, 'class="lkd-eye is-off');
  if (st === "added") html = html.replace(/class="lk-ch lkd-secret-add/, 'class="lk-ch lkd-secret-add is-added').replace(/<input([^>]*data-f="secret")/, "<input checked$1").replace("Добавить проверку", "Проверка добавлена");
  return html;
}
function statesHTML(it, s) {
  return `<div class="kit-spec"><div class="kit-l">${it.name}</div><div class="kit-states">${it.states.map(st =>
    `<div class="kit-state"><span>${LABEL[st] || st}</span><div class="kit-box${it.bg ? "" : " kit-box--grey"}" style="box-sizing:content-box${it.fit ? `;width:${s.w}px` : ""}${it.bg ? `;background:${it.bg}` : ""}">${wrap(s, stateVariant(s, st, it))}</div></div>`).join("")}</div></div>`;
}

/* --------------------------------------------------------------------------
   Сборка
   -------------------------------------------------------------------------- */
(async () => {
  buildCSS();
  const srv = await serve();
  const base = "http://localhost:" + srv.address().port;
  const browser = await chromium.launch();
  const report = [];
  const date = new Date().toISOString().slice(0, 10);

  const grab = async (it, w) => {
    const p = await openPage(browser, base, it.page, w);
    await prep(p, it.prep);
    if (it.edit) await p.evaluate(f => { const b = document.querySelector('[data-edit="' + f + '"]'); if (b) b.click(); }, it.edit);
    const s = await snap(p, it.sel, it.fixed);
    if (s && it.frameH) s.frameH = it.frameH;
    if (p.errs.length) report.push(`ошибки на ${it.page}: ${p.errs.join("; ")}`);
    await p.close();
    if (!s) report.push(`не найдено: ${it.name} · ${w} (${it.sel})`);
    return s;
  };

  /* Страницы элементов: десктоп и телефон */
  const pages = { d: "", m: "" };
  for (const sec of SECTIONS) {
    for (const [key, w] of [["d", 1440], ["m", 390]]) {
      let row = "";
      for (const it of sec.items) {
        if (it.only && it.only !== key) continue;
        const s = await grab(it, w);
        if (s) row += specHTML(it.name, s);
      }
      if (row) pages[key] += `<section class="kit-sec"><h2>${sec.title}</h2><div class="kit-row">${row}</div></section>`;
    }
  }

  /* Состояния — на десктопной странице состояний, мобильные — на странице телефона */
  let states = "", mStates = "";
  for (const sec of STATES) {
    let row = "", mRow = "";
    for (const it of sec.items) {
      const s = await grab(it, it.m ? 390 : 1440);
      if (!s) continue;
      if (it.m) mRow += statesHTML(it, s); else row += statesHTML(it, s);
    }
    if (row) states += `<section class="kit-sec"><h2>${sec.title}</h2><div class="kit-row">${row}</div></section>`;
    if (mRow) mStates += `<section class="kit-sec"><h2>Состояния · ${sec.title.toLowerCase()}</h2><div class="kit-row">${mRow}</div></section>`;
  }

  /* Статусы и метки — все варианты */
  const ST = { draft: "Черновик", moderation: "На модерации", live: "Опубликован", done: "Завершён", rejected: "Отклонён", ok: "Готово к выплате", wait: "Ждёт завершения" };
  states += `<section class="kit-sec"><h2>Статусы</h2><div class="kit-b lk lkd" data-role="client"><div class="kit-states">
    ${Object.entries(ST).map(([k, v]) => `<div class="kit-state"><span>${k}</span><div class="kit-box kit-box--grey"><span class="lk-st lk-st--${k}">${v}</span></div></div>`).join("")}
  </div></div></section>`;

  fs.writeFileSync(path.join(ROOT, "ui-kit.html"), head("UI-кит · десктоп") + `\n<body class="kit">${topbar(1, date)}\n${pages.d}\n</body>\n</html>\n`);
  fs.writeFileSync(path.join(ROOT, "ui-kit-mobile.html"), head("UI-кит · телефон", true) + `\n<body class="kit">${topbar(2, date)}\n${pages.m}\n${mStates}\n</body>\n</html>\n`);

  /* Дизайн-система — токены читаем со страницы кита, где загружены все стили */
  const kp = await openPage(browser, base, "ui-kit.html", 1440);
  const statesCss = await stateCSS(kp);
  const tokens = await kp.evaluate(() => {
    const names = new Set();
    for (const sh of document.styleSheets) { try { for (const r of sh.cssRules) (r.cssText.match(/--[a-z0-9-]+(?=\s*:)/g) || []).forEach(n => names.add(n)); } catch (e) {} }
    const read = el => { const cs = getComputedStyle(el); const o = {}; names.forEach(n => { const v = cs.getPropertyValue(n).trim(); if (v) o[n] = v; }); return o; };
    const pub = document.querySelector(".kit-b.dz3"), lk = document.querySelector(".kit-b.lkd");
    return { pub: read(pub || document.documentElement), lk: read(lk || document.documentElement) };
  });
  await kp.close();

  /* Типографика — с настоящих элементов */
  const typoSrc = [
    ["Заголовок первого экрана", PUB, ".dzl__h1"],
    ["Заголовок раздела витрины", PUB, ".section__head h2, .section__head"],
    ["Заголовок карточки", PUB, "#feed .card__title"],
    ["Компания в карточке", PUB, "#feed .card__company, #feed .card__meta"],
    ["Плашка выгоды", PUB, "#feed .card__badge"],
    ["Плашка на фото", PUB, "#feed .card__near"],
    ["Кнопка", PUB, "#feed .card .btn--solid"],
    ["Заголовок раздела кабинета", CL + "?view=dashboard", ".lk-head h1"],
    ["Заголовок панели", CL + "?view=dashboard", ".lk-panel__head h2"],
    ["Число в плитке", CL + "?view=dashboard", ".lk-kpi__v"],
    ["Подпись плитки", CL + "?view=dashboard", ".lk-kpi__l"],
    ["Текст таблицы", CL + "?view=dashboard", ".lk-t td"],
    ["Шапка таблицы", CL + "?view=dashboard", ".lk-t th"],
    ["Пункт меню", CL + "?view=dashboard", ".lk__nav a"],
    ["Подпись поля", CL + "?view=profile", ".lk-l__t"],
    ["Поле ввода", CL + "?view=profile", ".lk-i"],
    ["Пояснение", CL + "?view=billing", ".lk-note"],
  ];
  const typo = [];
  for (const [name, page, sel] of typoSrc) {
    const p = await openPage(browser, base, page, 1440);
    const t = await p.evaluate(sel => {
      const el = sel.split(/,\s*/).map(s => document.querySelector(s)).find(Boolean);
      if (!el) return null;
      const cs = getComputedStyle(el);
      return { text: ((el.innerText || el.value || el.placeholder || "").trim().split("\n")[0] || "Все купоны").slice(0, 60),
        ff: cs.fontFamily, fs: cs.fontSize, fw: cs.fontWeight, lh: cs.lineHeight, ls: cs.letterSpacing, tt: cs.textTransform, color: cs.color };
    }, sel);
    await p.close();
    if (t) typo.push(Object.assign({ name }, t)); else report.push("типографика: не найдено " + name);
  }

  /* Иконки — наборы ICON из app.js и lk.js / lk-design.js */
  const icons = {};
  for (const [label, page] of [["витрина", PUB], ["кабинет", CL + "?view=dashboard"]]) {
    const p = await openPage(browser, base, page, 1440);
    icons[label] = await p.evaluate(() => {
      try { return Object.fromEntries(Object.entries(ICON).filter(([k, v]) => typeof v === "string" && /<(svg|img)/.test(v))); } catch (e) { return {}; }
    });
    await p.close();
  }

  /* Цвета */
  const isColor = v => /^(#|rgb|hsl)/i.test(v);
  const sw = (n, v) => `<div class="kit-sw__i"><div class="kit-sw__c" style="background:${v}"></div><div class="kit-sw__t"><b>${n}</b>${v}</div></div>`;
  const skip = /^--(soc|mp$|featured|rot|near|all|niche|icon|act|solid|ghost|tk-|c$)/;
  const pubColors = Object.entries(tokens.pub).filter(([n, v]) => isColor(v) && !skip.test(n));
  const lkColors = Object.entries(tokens.lk).filter(([n, v]) => isColor(v) && !skip.test(n) && tokens.pub[n] !== v);
  const extra = { "Воронка · шаг 1": "#F08F88", "Воронка · шаг 2": "#E7665F", "Воронка · шаг 3": "#DD443C", "Воронка · шаг 4": "#A92A24",
    "Проверено · кружок": "#1F9D55", "Wildberries": "#CB11AB", "Ozon": "#005BFF", "Яндекс Маркет": "#FC3F1D", "М.Видео": "#E31235" };
  let ds = `<section class="kit-sec"><h2>Дизайн-система · цвета</h2>
    <div class="kit-sub" style="margin-top:0">Токены витрины и общие</div><div class="kit-sw">${pubColors.map(([n, v]) => sw(n, v)).join("")}</div>
    ${lkColors.length ? `<div class="kit-sub">Кабинет — свои значения</div><div class="kit-sw">${lkColors.map(([n, v]) => sw(n, v)).join("")}</div>` : ""}
    <div class="kit-sub">Графики, значки, площадки</div><div class="kit-sw">${Object.entries(extra).map(([n, v]) => sw(n, v)).join("")}</div></section>`;

  ds += `<section class="kit-sec"><h2>Дизайн-система · типографика</h2>
    <p class="kit-sub" style="margin-top:0">Шрифт — Onest (Google Fonts), веса 400–800. Размеры и начертания сняты с элементов сайта.</p>
    <div class="kit-type">${typo.map(t => `<div class="kit-type__i"><div class="kit-type__m"><b>${t.name}</b>${t.ff.split(",")[0].replace(/"/g, "")} · ${t.fs} / ${t.lh} · ${t.fw}${t.ls !== "normal" ? " · межбуквенный " + t.ls : ""}${t.tt !== "none" ? " · " + t.tt : ""}</div>
      <div style="font-family:${t.ff.replace(/"/g, "'")};font-size:${t.fs};font-weight:${t.fw};line-height:${t.lh};letter-spacing:${t.ls};text-transform:${t.tt};color:${t.color}">${t.text}</div></div>`).join("")}</div></section>`;

  const radii = Object.entries(tokens.pub).filter(([n]) => /^--r-/.test(n));
  const shadows = Object.entries(tokens.pub).filter(([n]) => /^--shadow-/.test(n));
  ds += `<section class="kit-sec"><h2>Дизайн-система · скругления, тени, отступы</h2>
    <div class="kit-tok">${radii.map(([n, v]) => `<div class="kit-tok__i"><i style="border-radius:${v}"></i><b>${n}</b>${v}</div>`).join("")}</div>
    <div class="kit-tok" style="margin-top:32px">${shadows.map(([n, v]) => `<div class="kit-tok__i"><i style="border:0;border-radius:16px;box-shadow:${v}"></i><b>${n}</b><span style="max-width:160px">${v}</span></div>`).join("")}</div>
    <div class="kit-tok" style="margin-top:32px;align-items:flex-end">${[4, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48].map(n => `<div class="kit-tok__i"><i style="width:${n}px;height:40px;background:#DD443C;border:0"></i><b>${n}</b></div>`).join("")}</div>
    <p class="kit-sub">Плашки на фото карточки — 10px от краёв, на телефоне высота 28px. Поле ввода — 44px. Кнопки кабинета — 40–48px, кнопки страниц — 36px.</p></section>`;

  ds += Object.entries(icons).map(([label, set]) => `<section class="kit-sec"><h2>Иконки · ${label}</h2>
    <div class="kit-b ${label === "кабинет" ? "lk lkd" : "dz dz3"}"><div class="kit-ic">${Object.entries(set).map(([n, svg]) =>
      `<div class="kit-ic__i">${svg.replace(/src="(?!http|data:)(?:\.\.\/)*([^"]+)"/g, 'src="$1"')}<span>${n}</span></div>`).join("")}</div></div></section>`).join("");

  fs.writeFileSync(path.join(ROOT, "ui-kit-states.html"),
    head("UI-кит · состояния и дизайн-система", false, "/* Состояния из CSS сайта: :hover → .is-hover и т. д. */\n" + statesCss) +
    `\n<body class="kit">${topbar(3, date)}\n${states}\n${ds}\n</body>\n</html>\n`);

  await browser.close();
  srv.close();
  console.log("Готово: ui-kit.html, ui-kit-mobile.html, ui-kit-states.html, assets/ui-kit.css");
  if (report.length) console.log("Замечания:\n  " + report.join("\n  "));
})();
