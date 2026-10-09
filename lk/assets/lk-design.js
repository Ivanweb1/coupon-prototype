/* ==========================================================================
   Кабинеты — правки созвонов 24.09.2026 (дизайн-версия)
   ==========================================================================
   Подключается только на client-design.html и partner-design.html, после
   lk.js. Прототип (client.html, partner.html) этот файл не видит и остаётся
   эталоном «как было» — тот же приём, что design-3*.css на публичке.

   Как устроено. lk.js — обычный скрипт, его функции и константы глобальные.
   Здесь мы:
   · правим справочники на месте (NAV, TITLES, COUPON_ACTIONS — это
     объекты, константой объявлена только ссылка на них);
   · подменяем разделы целиком: VIEWS["client:billing"] = …;
   · оборачиваем renderChrome и render — lk.js зовёт их по глобальному
     имени, поэтому обёртка срабатывает при каждом перерисовывании.
   Первый рендер lk.js откладывает до DOMContentLoaded, так что этот файл
   успевает всё подменить до того, как экран нарисуется.

   Утро (10:33) — кабинет рекламодателя, вечер (17:03) — кабинет партнёра.
   Полный список правок — notes/pravki-2026-09-24.md.
   ========================================================================== */

(function () {

const IS_CLIENT = state.role === "client";

/* Значки, которых не было в lk.js. Рисуются тем же шаблоном nav(): 18px,
   толщина 1.7 — в меню они стоят в одном ряду с остальными. */
ICON.doc   = nav('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h4"/>');
ICON.book  = nav('<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15Z"/><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20v3H6.5"/>');
/* Бонусы — фирменный билетик с буквой «Б» (правка Ивана 29.09): та же
   форма, что у плашки выгоды на публичке — скруглённый прямоугольник с
   полукруглыми вырезами по бокам. Буква нарисована контуром по центру
   билетика: текстом она садилась ниже и правее (базовая линия шрифта). Значок стоит везде, где раньше была
   звёздочка, — кошелёк в шапке, блок бонусов, механики начисления. */
ICON.coins = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round"><path d="M5 6.3H19a2 2 0 0 1 2 2V10a2 2 0 0 0 0 4v1.7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V14a2 2 0 0 0 0-4V8.3a2 2 0 0 1 2-2Z"/><path d="M14.2 8.9H10.2V15.1H12.7a1.6 1.6 0 0 0 0-3.2H10.2"/></svg>';
ICON.clock = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>';
ICON.q     = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M9.6 9.3a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2.2-2.4 3.6"/><circle cx="12" cy="17.2" r=".6" fill="currentColor"/></svg>';
ICON.lock  = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
ICON.eye18 = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.6"/></svg>';

/* Состояние дизайн-слоя: фильтры, которых нет в прототипе */
const D = {
  period: "30",        /* статистика: период */
  coupon: "all",       /* статистика: купон */
  editing: {},         /* какие формы открыты на редактирование */
  prefill: null        /* партнёр: «Повторить» начисление */
};

/* Поле, которое можно заблокировать навсегда с подсказкой «?» — ИНН и
   ОГРН. Меняются они только через поддержку: от них зависит ERID. */
function lockedField(label, val, tip) {
  return `<label class="lk-l lkd-lock">
    <span class="lk-l__t">${label}
      <span class="lkd-tip" tabindex="0" aria-label="${tip}">${ICON.q}<span class="lkd-tip__b" role="tooltip">${tip}</span></span>
    </span>
    <span class="lkd-lock__v">${ICON.lock}<input class="lk-i" value="${val}" disabled></span>
  </label>`;
}

/* Поле, которое правится только после «Редактировать» */
function editField(form, label, val, ph) {
  const on = !!D.editing[form];
  return field(label, `<input class="lk-i" data-edit-f="${form}" placeholder="${ph || ""}" value="${val || ""}"${on ? "" : " disabled"}>`);
}

/* Серая «Редактировать» внизу блока. В режиме правки — «Сохранить» и
   «Отмена». Вилл: кнопка не должна быть такой же, как главная, — это не
   действие, которое от человека ждут, а возможность поправить ошибку. */
function editBar(form, note) {
  const on = !!D.editing[form];
  return `<div class="lkd-editbar">
    ${note ? `<span class="lkd-editbar__note">${note}</span>` : ""}
    ${on
      ? `<button class="btn btn--ghost" type="button" data-edit-cancel="${form}">Отмена</button>
         <button class="btn btn--solid" type="button" data-edit-save="${form}">Сохранить</button>`
      : `<button class="btn lkd-btn-grey" type="button" data-edit="${form}">Редактировать</button>`}
    <span class="lk-save-ok" data-edit-ok="${form}" hidden>Изменения сохранены</span>
  </div>`;
}

/* ==========================================================================
   Шапка, меню, заголовки — общее для обоих кабинетов
   ========================================================================== */

/* Кабинет рекламодателя: архив — отдельной вкладкой больше не нужен, он
   есть в фильтре статусов «Моих купонов» (созвон 24.09, утро). Меньше
   кнопок слева, которые «всех бесят». */
if (IS_CLIENT) {
  const i = NAV.client.findIndex(it => it.id === "archive");
  if (i >= 0) NAV.client.splice(i, 1);
}

/* Создание купона — тремя вкладками в меню (правка Ивана 29.09). На
   созвоне 10.09 три пункта из меню убрали в пользу одной кнопки с
   выбором раздела; кнопка и попап остаются, но разделы снова видно
   слева — путь в конструктор перестаёт быть в один клик через попап.
   Подписи и значки — те же, что в попапе выбора (openCreateModal). */
if (IS_CLIENT) {
  const at = NAV.client.findIndex(it => it.id === "coupons");
  NAV.client.splice(at + 1, 0,
    { id: "new-regional",    label: "Региональный купон", icon: "pin"  },
    { id: "new-marketplace", label: "Купон маркетплейса", icon: "bag"  },
    { id: "new-business",    label: "Купон для бизнеса",  icon: "case" });
}

/* Кабинет партнёра (созвон 24.09, вечер):
   · основа учёта — купон, а не клиент: «Региональные клиенты» стали
     списком купонов клиентов региона;
   · «промокод партнёра» — «реферальный код», чтобы не путать с промокодом
     селлера на площадке;
   · новые вкладки «Документы» и «База знаний». */
if (!IS_CLIENT) {
  const it = id => NAV.partner.find(x => x.id === id);
  it("clients").label = "Купоны клиентов";
  /* «Коды» звучало непонятно — «Промокоды» (созвон 30.09); профиль —
     «Ваш профиль»: это его кабинет, а не карточка партнёра со стороны */
  it("codes").label = "Маркетплейс · Промокоды";
  it("profile").label = "Ваш профиль";
  const at = NAV.partner.findIndex(x => x.id === "profile");
  NAV.partner.splice(at + 1, 0,
    { id: "docs", label: "Документы",   icon: "doc" },
    { id: "kb",   label: "База знаний", icon: "book" });
  Object.assign(TITLES.partner, {
    clients: "Купоны клиентов", codes: "Промокоды маркетплейсов", profile: "Ваш профиль",
    docs: "Документы", kb: "База знаний"
  });
}

/* Ширины столбцов в таблице. lk.js отдаёт вёрстку браузеру, и тот режет
   столбцы по содержимому: в «Истории начислений» сумма и дата сбивались в
   середину, а справа перед кнопкой оставалась пустая полоса (правка Ивана
   29.09). Столбец получает ширину, если в описании есть w; без w таблица
   собирается как раньше. */
const baseTable = window.table;
window.table = function (cols, rows) {
  const html = baseTable(cols, rows);
  if (!cols.some(c => c.w)) return html;
  const group = `<colgroup>${cols.map(c => `<col${c.w ? ` style="width:${c.w}"` : ""}>`).join("")}</colgroup>`;
  return html.replace('<table class="lk-t">', '<table class="lk-t">' + group);
};

/* Счётчик у «Купонов клиентов» — число купонов, а не клиентов */
const baseNavCount = window.navCount;
window.navCount = id => !IS_CLIENT && id === "clients" ? levelFees().length : baseNavCount(id);

/* Карточка архивного купона раньше подсвечивала «Архив» в меню и вела
   «К списку» туда же. Вкладки нет — ведём в «Мои купоны». */
window.isArchived = () => false;

const baseChrome = window.renderChrome;
window.renderChrome = function () {
  baseChrome();

  /* «Клиент» → «рекламодатель»: клиент у нас кто угодно, а человек в этом
     кабинете — тот, кто размещает рекламу (созвон 24.09). */
  document.title = document.title.replace("Кабинет клиента", "Кабинет рекламодателя");

  if (IS_CLIENT) {
    /* У конструктора теперь своя вкладка, а lk.js подсвечивает на ней
       «Мои купоны» — гасим, иначе в меню горят два пункта сразу. */
    if (/^new-/.test(state.view)) {
      qsa("#lkNav a").forEach(a => a.classList.toggle("is-on",
        new URLSearchParams(a.getAttribute("href").split("?")[1] || "").get("view") === state.view));
    }

    /* Кошелёк в шапке. «12 400 · +3 500 бонусов» читалось как «прибавь»:
       Коля не понял, входят бонусы в баланс или идут сверху. Теперь два
       отдельных числа, у бонусов свой значок, без плюса. */
    const w = qs("#lkWallet");
    if (w) w.innerHTML = `<span class="lkd-wal" title="Баланс, рубли">${ICON.wallet}<b>${num(LK_BALANCE.coins)}</b></span>
      <span class="lkd-wal lkd-wal--bon" title="Бонусы">${ICON.coins}<b>${num(LK_BALANCE.bonuses)}</b></span>`;
  } else {
    const cta = qs("#lkCta");
    if (cta) cta.lastElementChild.textContent = "Запросить промокод";
  }

  sideFoot();
  tabBar();
};

/* Нижнее меню на телефоне (решение 30.09, предложение Коли): главные
   разделы — панелью у нижнего края, под большим пальцем, как в
   приложениях маркетплейсов. Пять мест: четыре частых раздела и «Ещё»,
   которое открывает полное меню. У рекламодателя в центре — «Создать
   купон». На десктопе панель скрыта. */
function tabBar() {
  const old = qs(".lkd-tabbar");
  if (old) old.remove();
  const tabs = IS_CLIENT
    ? [["dashboard", "Дашборд", "grid"], ["coupons", "Купоны", "tag"], ["+create", "Создать", "plus"], ["stats", "Статистика", "chart"]]
    : [["dashboard", "Дашборд", "grid"], ["clients", "Клиенты", "users"], ["codes", "Промокоды", "code"], ["payouts", "Выплаты", "wallet"]];
  const cur = /^new-/.test(state.view) ? "+create" : state.view === "coupon" ? "coupons" : state.view;
  const inMenu = !tabs.some(t => t[0] === cur);
  const bar = document.createElement("nav");
  bar.className = "lkd-tabbar";
  bar.setAttribute("aria-label", "Основные разделы");
  bar.innerHTML = tabs.map(([id, label, icon]) => id === "+create"
    ? `<button type="button" class="lkd-tabbar__i lkd-tabbar__i--main${cur === id ? " is-on" : ""}" data-tab-create><span class="lkd-tabbar__ic">${ICON.plus}</span><span>${label}</span></button>`
    : `<a class="lkd-tabbar__i${cur === id ? " is-on" : ""}" href="${href(id)}" data-tab="${id}"${cur === id ? ' aria-current="page"' : ""}><span class="lkd-tabbar__ic">${ICON[icon]}</span><span>${label}</span></a>`
  ).join("") + `<button type="button" class="lkd-tabbar__i${inMenu ? " is-on" : ""}" data-tab-more><span class="lkd-tabbar__ic">${ICON.burger}</span><span>Ещё</span></button>`;
  document.body.appendChild(bar);
  qsa("[data-tab]", bar).forEach(a => a.onclick = e => { e.preventDefault(); document.body.classList.remove("lk-nav-open"); go(a.dataset.tab); });
  const create = qs("[data-tab-create]", bar);
  if (create) create.onclick = () => { document.body.classList.remove("lk-nav-open"); openCreateModal(); };
  qs("[data-tab-more]", bar).onclick = () => document.body.classList.toggle("lk-nav-open");

  /* Бургера в шапке на телефоне больше нет — на его месте логотип */
  const top = qs(".lk__top");
  if (top && !qs(".lkd-toplogo", top)) top.insertAdjacentHTML("afterbegin",
    `<a class="lkd-toplogo" href="../index-design-3.html" aria-label="Все купоны — на главную"><img src="../assets/brand/logo-red.png" alt="" width="18" height="30"></a>`);
}

/* Низ бургер-меню на телефоне (Иван 30.09): в шапке на узком экране
   от кошелька и профиля остаются одни значки, поэтому в меню дублируем
   полностью — баланс и бонусы, главную кнопку, профиль и выход. На
   десктопе этот блок скрыт: там всё это и так стоит в шапке. */
function sideFoot() {
  const side = qs("#lkSide");
  if (!side) return;
  const old = qs(".lkd-sidefoot", side);
  if (old) old.remove();
  const acc = IS_CLIENT
    ? { ava: LK_COMPANY.ava, name: LK_COMPANY.name, sub: "ИНН " + LK_COMPANY.inn }
    : { ava: "ИП", name: "Иван Партнёров", sub: "Партнёр · Липецк" };
  const el = document.createElement("div");
  el.className = "lkd-sidefoot";
  el.innerHTML = (IS_CLIENT ? `
      <a class="lkd-sidefoot__money" href="${href("billing")}" data-side-go="billing">
        <span class="lkd-sidefoot__row"><span class="lkd-sidefoot__ic">${ICON.wallet}</span><span>Баланс</span><b>${rub(LK_BALANCE.coins)}</b></span>
        <span class="lkd-sidefoot__row"><span class="lkd-sidefoot__ic lkd-sidefoot__ic--bon">${ICON.coins}</span><span>Бонусы</span><b>${num(LK_BALANCE.bonuses)}</b></span>
      </a>
      <button type="button" class="btn btn--solid btn--wide" data-side-create>Создать купон</button>`
    : `<button type="button" class="btn btn--solid btn--wide" data-side-go="codes">Запросить промокод</button>`) + `
    <div class="lkd-sidefoot__me">
      <a class="lkd-sidefoot__prof" href="${href("profile")}" data-side-go="profile">
        <span class="lk__me-ava">${acc.ava}</span>
        <span class="lkd-sidefoot__who"><b>${acc.name}</b><span>${acc.sub}</span></span>
      </a>
      <a class="lkd-sidefoot__exit" href="${window.LKD_LOGOUT || "../index.html"}">${ICON.exit || ""}<span>Выйти</span></a>
    </div>`;
  side.appendChild(el);
  const close = () => document.body.classList.remove("lk-nav-open");
  qsa("[data-side-go]", el).forEach(a => a.onclick = e => { e.preventDefault(); close(); go(a.dataset.sideGo); });
  const create = qs("[data-side-create]", el);
  if (create) create.onclick = () => { close(); openCreateModal(); };
}

/* ==========================================================================
   КАБИНЕТ РЕКЛАМОДАТЕЛЯ
   ========================================================================== */

/* Рекламное место в кабинете (созвон 24.09, утро — «новый заёб» Вилла).
   B2B-купоны и баннеры партнёров сервиса предпринимателю, который сидит
   в кабинете: агентство по маркетплейсам — селлерам, банк с эквайрингом —
   всем. Размер — ровно карточка купона из ленты: в слот встаёт либо
   купон, либо баннер того же размера, и вид кабинета от этого не ломается.
   Клик открывает купон в новой вкладке, чтобы кабинет не закрывался.
   ?ad=banner — вариант с баннером вместо купона. */
const AD_COUPON = {
  kicker: "Для бизнеса", title: "Ведение магазина на Wildberries: первый месяц бесплатно",
  company: "Агентство «Пример»", value: "1 месяц за 0 ₽", photo: "../assets/coupons/biz-warm.jpg",
  erid: "2Vt1NKB2B", views: 1240
};
/* Второй рекламный купон — только на телефоне, чтобы рекламное место
   стояло двумя карточками в ряд, как лента на публичке (Иван 30.09) */
const AD_COUPON_2 = {
  kicker: "Для бизнеса", title: "Фотосъёмка товаров для карточек: 10 кадров в подарок",
  company: "Студия «Кадр»", value: "−20%", photo: "../assets/coupons/obuchenie-purple.jpg",
  erid: "2Vt1NKF0T", views: 860
};
const AD_BANNER = {
  kicker: "Партнёр сервиса", title: "Эквайринг от 1,2% для тех, кто размещает купоны",
  text: "Откройте расчётный счёт в Банке «Пример» — первые три месяца обслуживания бесплатно.",
  cta: "Открыть счёт", erid: "2Vt1NKBNK"
};
function adSlot(where) {
  const banner = P.get("ad") === "banner";
  if (banner) return `<aside class="lkd-ad lkd-ad--banner" data-ad="${where}">
      <span class="lkd-ad__label">Реклама · erid: ${AD_BANNER.erid}</span>
      <span class="lkd-ad__kicker">${AD_BANNER.kicker}</span>
      <b class="lkd-ad__h">${AD_BANNER.title}</b>
      <p>${AD_BANNER.text}</p>
      <a class="btn btn--solid btn--wide" href="#" target="_blank" rel="noopener">${AD_BANNER.cta}</a>
    </aside>`;
  const card = (c, extra) => `<aside class="lkd-ad${extra || ""}" data-ad="${where}">
      <a class="lkd-ad__media" href="../coupon-design.html" target="_blank" rel="noopener"
         style="background-image:url('${c.photo}')" aria-label="${c.title} — открыть в новой вкладке">
        <span class="lkd-ad__corner">${c.kicker}</span>
        <span class="lkd-ad__erid">Реклама · erid: ${c.erid}</span>
        <span class="lkd-ad__badge">${c.value}</span>
      </a>
      <div class="lkd-ad__body">
        <b class="lkd-ad__title">${c.title}</b>
        <span class="lkd-ad__meta"><b>${c.company}</b><i class="dot"></i>Маркетплейсы</span>
        <div class="lkd-ad__acts">
          <a class="btn btn--ghost btn--wide" href="../coupon-design.html" target="_blank" rel="noopener">Подробнее</a>
          <a class="btn btn--solid" href="../coupon-design.html" target="_blank" rel="noopener">Забрать купон</a>
        </div>
      </div>
    </aside>`;
  /* У партнёра рекламное место стоит в ряду офферов — там пара не нужна */
  if (where === "partner") return card(AD_COUPON);
  return `<div class="lkd-adpair">${card(AD_COUPON)}${card(AD_COUPON_2, " lkd-ad--m2")}</div>`;
}

/* Дашборд. Что поменялось против эскиза 14.09:
   · «Требует внимания» встал под «Опубликовано сейчас», а справа —
     рекламное место размером с карточку купона;
   · блок бонусов пересобран: строка «Бонусы скоро сгорят / Получить
     бонусы» Виллу не нравилась — теперь бонусы и баланс две карточки
     с числом крупно, сгорающие — одной строкой под числом;
   · ИИ-консультант пока «скоро»: его ещё учить пару месяцев, красная
     кнопка обещала то, чего нет. */
VIEWS["client:dashboard"] = () => {
  const live = LK_COUPONS.filter(c => c.status === "live");
  const sum = k => LK_COUPONS.reduce((a, c) => a + c[k], 0);
  const attention = LK_COUPONS.filter(c => c.status === "rejected" || c.status === "draft");
  const mechLabel = id => (LK_MECHANICS.find(m => m.id === id) || {}).label || id;

  return head(
      "Привлекай тех, кто уже ищет, что купить",
      `<a class="btn lk-head__more" href="${href("stats")}" data-go="stats">Подробнее</a>`
    )
    + kpi(LK_METRICS.map(m => ({ label: m.label, value: num(sum(m.id)), raw: sum(m.id) })), { funnel: true })
    + `<div class="lkd-dash">
      <div class="lkd-dash__main">
        ${panel("Опубликовано сейчас", live.length
          ? table(
              [{ t: "Купон" }, { t: "Действует" }, { t: "Забрали", num: true, key: true }],
              live.map(c => `<tr data-coupon="${c.id}" tabindex="0">
                <td><b class="lk-t__title">${c.title}</b><span class="lk-t__sub">${where(c)} · ${c.value}</span></td>
                <td>${c.from} — ${c.to}</td>
                <td class="num lk-t__key">${num(c.taken)}</td></tr>`).join("")
            )
          : empty("Пока ничего не опубликовано", "Созданные купоны появятся здесь после модерации."),
          { act: `<a class="btn btn--ghost" href="${href("coupons")}" data-go="coupons">Подробнее</a>` })}

        ${panel("Требует внимания", attention.length
          ? `<div class="lk-list">${attention.map(c => `
              <div class="lk-list__i lk-att is-unread"><i class="lk-list__d"></i><div class="lk-att__txt">
                ${c.title}
                <div class="lk-list__w">${c.status === "rejected" ? "Отклонён: " + c.reject : "Черновик — не заполнены срок и промокод"}</div>
              </div>
              <button class="btn btn--solid" data-open-coupon="${c.id}">Исправить</button></div>`).join("")}</div>`
          : empty("Всё в порядке", "Купонов, которые ждут вашего действия, нет."))}
      </div>
      ${adSlot("dashboard")}
    </div>

    <div class="lkd-money">
      <div class="lk-panel lkd-money__c">
        <span class="lkd-money__l">Бонусы</span>
        <div class="lkd-money__v"><span class="lkd-money__ic">${ICON.coins}</span><b>${num(LK_BALANCE.bonuses)}</b></div>
        <div class="lkd-money__burn">${ICON.clock}<span><b>${num(LK_BONUS_BURN_SOON.amount)}</b> сгорят ${LK_BONUS_BURN_SOON.date}</span></div>
        <div class="lkd-money__act">
          <button class="btn btn--ghost" data-bonus-ways>Как получить ещё</button>
        </div>
      </div>
      <div class="lk-panel lkd-money__c">
        <span class="lkd-money__l">Баланс</span>
        <div class="lkd-money__v"><span class="lkd-money__ic lkd-money__ic--ink">${ICON.wallet}</span><b>${num(LK_BALANCE.coins)}</b><i>₽</i></div>
        <div class="lkd-money__burn lkd-money__burn--calm"><span>Рубли на балансе не сгорают</span></div>
        <div class="lkd-money__act">
          <a class="btn btn--solid" href="${href("billing")}" data-go="billing">Пополнить</a>
        </div>
      </div>
    </div>`

    + panel("Топовые механики в ваших нишах", table(
        [{ t: "Ниша" }, { t: "Механика" }, { t: "Эффект" }, { t: "", num: true }],
        LK_TOP_MECHANICS.map(m => `<tr>
          <td>${m.niche}</td>
          <td><b class="lk-t__title">${mechLabel(m.mech)}</b></td>
          <td class="lk-t__muted">${m.effect}</td>
          <td class="num"><button class="btn btn--solid" data-create-mech="${m.mech}">+ Создать купон</button></td>
        </tr>`).join(""))
      + `<div class="lk-note" style="margin-top:12px">Подборка — по опыту похожих
        компаний. Когда в сервисе накопится статистика, её будем считать по
        вашему городу.</div>`)

    + `<div class="lk-panel lk-help">
      <h2 class="lk-help__h">Не знаете, какое предложение выбрать или как привлечь больше клиентов?</h2>
      <p class="lk-help__lead">Получите помощь эксперта. Скоро здесь появится и ИИ-консультант.</p>
      <div class="lk-help__grid">
        <div class="lk-help__c">
          <b>Консультация специалиста</b>
          <p>Маркетолог сервиса разберёт вашу задачу и подскажет, с каким
          предложением выйти, чтобы купон забирали. Перезвоним в течение 48 часов.</p>
          <button class="btn btn--ghost btn--lg" data-consult>Получить консультацию</button>
        </div>
        <div class="lk-help__c lkd-soon">
          <b>ИИ-консультант <span class="lkd-soon__tag">скоро</span></b>
          <p>Подскажет механику, срок и заголовок купона, объяснит, как
          работают бонусы и каналы публикации.</p>
          <div class="lkd-soon__plate">Консультант сейчас учится на наших данных — скоро он будет знать о сервисе всё. Подождите немного.</div>
        </div>
      </div>
    </div>`;
};

/* Мои купоны: «Опубликовать» у черновика — это на деле отправка на
   модерацию. Публикует модератор, а не рекламодатель, и кнопка должна
   говорить, что произойдёт (созвон 24.09, утро). */
COUPON_ACTIONS.draft = [["Редактировать", "edit"], ["Отправить на модерацию", "edit"]];

/* Ссылка на ?view=archive из старых закладок — в «Мои купоны» с фильтром «Архив» */
VIEWS["client:archive"] = () => {
  state.view = "coupons";
  state.filter = "done";
  history.replaceState(null, "", href("coupons"));
  renderChrome();
  return VIEWS["client:coupons"]();
};

/* --------------------------------------------------------------------------
   Статистика: воронка и фильтры
   --------------------------------------------------------------------------
   Фильтры — период и купон; по умолчанию все купоны за 30 дней. График
   по дням (24.09) заменён воронкой по созвону 30.09. */
D.statPage = 1;
const STAT_PERIODS = [["7", "7 дней"], ["30", "30 дней"], ["month", "Сентябрь"], ["prev", "Август"]];

/* Дневной ряд — рыба, но устойчивая: одна и та же для купона и периода,
   с будничной волной и спадом к концу срока, чтобы график был похож на
   настоящий, а не на шум. */
function statSeries(coupons, days) {
  const out = [];
  for (let d = 0; d < days; d++) {
    const row = { shown: 0, opened: 0, taken: 0, clicks: 0 };
    coupons.forEach(c => {
      if (!c.shown) return;
      const wave = 1 + .28 * Math.sin((d + c.id) / 1.3) + (d % 7 === 5 || d % 7 === 6 ? .25 : 0);
      const fade = .65 + .35 * Math.cos(d / days * 1.4);
      ["shown", "opened", "taken", "clicks"].forEach(k => {
        row[k] += Math.max(0, Math.round(c[k] / 30 * wave * fade));
      });
    });
    out.push(row);
  }
  return out;
}

/* Воронка вместо графика (созвон 30.09): «вот тебе идеальная архитектура
   воронки» — как в кабинете продавца Wildberries. Четыре шага в ряд:
   число, подпись, столбик и светлый клин к следующему шагу, под ним —
   доля от предыдущего шага. Графика по дням нет: на телефоне он был
   нечитаем, а статистику смотрят с телефона.
   Высота столбика — по корню из доли от первого шага: показы на два
   порядка больше переходов, и в линейной шкале последние шаги легли бы
   в ноль. */
/* Цвета — фирменный красный по нарастающей (правка Ивана 30.09: «ближе
   к цветам сервиса»): от светлого --brand-300 на показах к --brand-700 на
   переходах. Чем глубже шаг воронки, тем насыщеннее. */
const FUNNEL_COLORS = ["#F08F88", "#E7665F", "#DD443C", "#A92A24"];

function funnel(steps) {
  const max = Math.max(1, steps[0].raw);
  const n = steps.length;
  const hs = steps.map(s => Math.max(3, Math.sqrt(s.raw / max) * 100));
  /* Столбик занимает левую половину колонки, клин тянется от его правого
     края до начала следующего столбика. SVG растягивается по ширине
     (preserveAspectRatio="none"), поэтому координаты — в процентах. */
  const W = 100 * n, bw = 50;
  const bars = hs.map((h, i) => `<rect x="${i * 100}" y="${100 - h}" width="${bw}" height="${h}" fill="${FUNNEL_COLORS[i]}"/>`).join("");
  const wedges = hs.slice(0, -1).map((h, i) => {
    const x1 = i * 100 + bw, x2 = (i + 1) * 100, h2 = hs[i + 1];
    return `<polygon points="${x1},${100 - h} ${x2},${100 - h2} ${x2},100 ${x1},100" fill="${FUNNEL_COLORS[i]}" opacity=".16"/>`;
  }).join("");
  /* У последнего шага клина нет — тянем бледную полосу до края, как в
     примере: без неё столбик обрывается посреди колонки */
  const tail = `<rect x="${(n - 1) * 100 + bw}" y="${100 - hs[n - 1]}" width="${100 - bw}" height="${hs[n - 1]}" fill="${FUNNEL_COLORS[n - 1]}" opacity=".16"/>`;
  return `<div class="lkd-fn" style="--n:${n}">
    <div class="lkd-fn__cols">${steps.map((s, i) => `<div class="lkd-fn__c">
      <b class="lkd-fn__v">${num(s.raw)}</b>
      <span class="lkd-fn__l">${s.label}</span>
    </div>`).join("")}</div>
    <div class="lkd-fn__plot">
      <svg viewBox="0 0 ${W} 100" preserveAspectRatio="none" aria-hidden="true">${wedges}${tail}${bars}</svg>
    </div>
    <div class="lkd-fn__cols lkd-fn__cols--p">${steps.map((s, i) => `<span class="lkd-fn__p"
      title="${i ? "Доля от шага «" + steps[i - 1].label + "»" : "Первый шаг воронки"}">${i ? String(Math.round(s.raw / Math.max(1, steps[i - 1].raw) * 1000) / 10).replace(".", ",") : 100}%</span>`).join("")}</div>
  </div>`;
}

VIEWS["client:stats"] = () => {
  const withData = LK_COUPONS.filter(c => c.shown > 0);
  const picked = D.coupon === "all" ? withData : withData.filter(c => String(c.id) === D.coupon);
  const days = D.period === "7" ? 7 : D.period === "prev" ? 31 : 30;
  const series = statSeries(picked, days);
  const tot = k => series.reduce((a, r) => a + r[k], 0);

  /* Таблица «По купонам» — по 10 строк на странице (Коля, 30.09) */
  const sorted = withData.slice().sort((a, b) => b.taken - a.taken);
  const rows = pageSlice("stat", sorted)
    .map(c => `<tr data-coupon="${c.id}" tabindex="0"${D.coupon !== "all" && String(c.id) !== D.coupon ? ' class="lkd-dim"' : ""}>
      <td><b class="lk-t__title">${c.title}</b><span class="lk-t__sub">${where(c)}</span></td>
      <td>${status(c.status)}</td>
      <td class="num">${num(c.shown)}</td>
      <td class="num">${num(c.opened)}</td>
      <td class="num lk-t__key">${num(c.taken)}</td>
      <td class="num">${num(c.clicks)}</td>
    </tr>`).join("");

  const filters = `<div class="lkd-filters">
    <select class="lk-s" data-stat-period aria-label="Период">
      ${STAT_PERIODS.map(([k, l]) => `<option value="${k}"${D.period === k ? " selected" : ""}>${l}</option>`).join("")}
    </select>
    <select class="lk-s" data-stat-coupon aria-label="Купон">
      <option value="all">Все купоны</option>
      ${withData.map(c => `<option value="${c.id}"${D.coupon === String(c.id) ? " selected" : ""}>${c.title}</option>`).join("")}
    </select>
  </div>`;

  /* Плитки с числами ушли: те же четыре числа теперь стоят над столбиками
     воронки, дублировать их отдельным рядом незачем */
  const periodName = (STAT_PERIODS.find(p => p[0] === D.period) || [])[1] || "";
  return head("Статистика", filters)
    /* Рекламное место — справа от воронки, как на дашборде: это второй
       по посещаемости раздел, и сетка у них одна */
    + `<div class="lkd-dash lkd-dash--chart"><div class="lkd-dash__main">
        ${panel(D.coupon === "all" ? "Воронка по всем купонам" : (picked[0] || {}).title || "Купон",
          funnel(LK_METRICS.map(m => ({ label: m.label, raw: tot(m.id) })))
          + `<div class="lk-note lkd-fn__note">${periodName}. Процент под столбиком — доля от предыдущего шага.</div>`)}
      </div>${adSlot("stats")}</div>`
    + panel("По купонам", `<div class="lkd-bycoupon">` +
        table([{ t: "Купон" }, { t: "Статус" }, { t: "Показы", num: true }, { t: "Просмотры", num: true },
               { t: "Забрали", num: true, key: true }, { t: "Переходы к вам", num: true }], rows)
        + listPager("stat", sorted.length) + `</div>`
        /* «Переходы — какие, куда?» (Коля, 30.09): говорим прямо */
        + `<div class="lk-note lkd-fn__note">Переходы к вам — клики с купона на ваш сайт и в соцсети.</div>`);
};

/* --------------------------------------------------------------------------
   Биллинг
   --------------------------------------------------------------------------
   · «Потрачено за сентябрь» убрали с самого верха: от слова «потрачено»
     позитивного сценария не добиться, а расходы и так видны в истории.
   · СБП дешевле эквайринга на ~2%, поэтому за пополнение через СБП —
     бонусы. Показываем прямо на выборе способа.
   · «Деньги сразу становятся монетами» звучало как фокус с чужими
     деньгами. Начинаем с курса.
   · Реквизиты: ИНН и ОГРН закреплены, банк и счёт меняются — счетов у
     компании бывает несколько. И предупреждение: платить с той же
     компании, от которой размещаетесь, иначе вернём.
   · В истории — фильтр по датам, столбец «Документ» убран: хранить и
     связывать документы с операциями пока слишком дорого, а кнопка
     «Запросить» завалит бухгалтерию запросами. */
const SBP_BONUS = 200;

/* История операций (созвон 30.09): у дат год, фильтр «с — по» вместо
   месяца, по 10 строк на странице и выгрузка в Excel. Строк в прототипе
   было семь — добираем рыбой за лето, чтобы вторая страница была видна. */
LK_LEDGER.push(
  { date: "24 июня",  what: "Купон «Лимонады со скидкой 20%», 14 дней, Липецк", kind: "spend", coins: -1800, bonuses: -400 },
  { date: "20 июня",  what: "Анкета о компании", kind: "bonus-service", coins: 0, bonuses: 700 },
  { date: "12 июня",  what: "Пополнение на 5 000 ₽", kind: "topup-card", coins: 5000, bonuses: 0 },
  { date: "2 июня",   what: "Купон «Завтраки до 12:00», 21 день, Липецк и Грязи", kind: "spend", coins: -2900, bonuses: 0 },
  { date: "28 мая",   what: "Пополнение на 3 000 ₽", kind: "topup-sbp", coins: 3000, bonuses: 0 },
  { date: "15 мая",   what: "Бонус за регистрацию", kind: "bonus-service", coins: 0, bonuses: 500 }
);
LK_LEDGER.forEach(r => { if (!/\d{4}$/.test(r.date)) r.date += " 2026"; });
D.ledgerFrom = D.ledgerTo = "";
D.ledgerPage = 1;

const ledgerList = () => LK_LEDGER.filter(b => {
  const d = isoFromRu(b.date);
  return (!D.ledgerFrom || d >= D.ledgerFrom) && (!D.ledgerTo || d <= D.ledgerTo);
});

/* Выгрузка — CSV с разделителем «;» и BOM: Excel открывает его двойным
   кликом и не ломает кириллицу. В продукте — настоящий .xlsx. */
function ledgerCSV(list) {
  const q = v => '"' + String(v).replace(/"/g, '""') + '"';
  const lines = [["Дата", "Операция", "Описание", "Рубли", "Бонусы"].map(q).join(";")]
    .concat(list.map(b => [b.date, LK_LEDGER_KINDS[b.kind], b.what, b.coins, b.bonuses].map(q).join(";")));
  const url = URL.createObjectURL(new Blob(["﻿" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: "operacii-vse-kupony.csv" });
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* Пагинация — одна на все таблицы обоих кабинетов (Иван 30.09): слева
   «Показывать по 10 / 20 / 50», справа «1–10 из 13» и «‹ 1 2 ›». Видна
   всегда, даже когда страница одна, — место и вид у неё везде одинаковые.
   key — какая таблица: у каждой свои страница и размер. */
D.pgSize = { coupons: 10, stat: 10, ledger: 10, fee: 10, codes: 10 };
const PG = {
  coupons: { get: () => state.couponPage || 1, set: v => { state.couponPage = v; } },
  stat:    { get: () => D.statPage,   set: v => { D.statPage = v; } },
  ledger:  { get: () => D.ledgerPage, set: v => { D.ledgerPage = v; } },
  fee:     { get: () => D.fpage,      set: v => { D.fpage = v; } },
  codes:   { get: () => D.codePage,   set: v => { D.codePage = v; } }
};
/* Страница, поджатая к числу страниц, и строки этой страницы */
function pageSlice(key, list) {
  const size = D.pgSize[key];
  const pages = Math.max(1, Math.ceil(list.length / size));
  if (PG[key].get() > pages) PG[key].set(pages);
  if (PG[key].get() < 1) PG[key].set(1);
  const page = PG[key].get();
  return list.slice((page - 1) * size, page * size);
}
function listPager(key, total) {
  if (!total) return "";
  const size = D.pgSize[key];
  const page = PG[key].get();
  const pages = Math.max(1, Math.ceil(total / size));
  const from = (page - 1) * size + 1, to = Math.min(total, page * size);
  const btn = (p, label, off, on, aria) => `<button type="button" class="lkd-pg__b${on ? " is-on" : ""}"
    data-pg-go="${p}"${off ? " disabled" : ""}${on ? ' aria-current="page"' : ""}${aria ? ` aria-label="${aria}"` : ""}>${label}</button>`;
  return `<nav class="lkd-pg" data-pg="${key}" aria-label="Страницы таблицы">
    <label class="lkd-pg__size">Показывать по
      <select class="lk-s" data-pg-size aria-label="Строк на странице">
        ${[10, 20, 50].map(n => `<option value="${n}"${n === size ? " selected" : ""}>${n}</option>`).join("")}
      </select></label>
    <div class="lkd-pg__right">
      <span class="lkd-pg__n">${from}–${to} из ${total}</span>
      <div class="lkd-pg__bs">
        ${btn(page - 1, "‹", page === 1, false, "Предыдущая страница")}
        ${Array.from({ length: pages }, (_, i) => btn(i + 1, i + 1, false, i + 1 === page)).join("")}
        ${btn(page + 1, "›", page === pages, false, "Следующая страница")}
      </div>
    </div>
  </nav>`;
}
window.LKD_PAGE_SIZE = key => D.pgSize[key];
window.LKD_PAGER = (key, total) => listPager(key, total);

VIEWS["client:billing"] = () => {
  const sign = n => (n > 0 ? "+" : "") + num(n);
  const all = ledgerList();
  const list = pageSlice("ledger", all);
  const rows = list.map(b => `<tr>
    <td>${b.date}</td>
    <td><b class="lk-t__title">${LK_LEDGER_KINDS[b.kind]}</b><span class="lk-t__sub">${b.what}</span></td>
    <td class="num${b.coins < 0 ? " is-out" : ""}">${b.coins ? sign(b.coins) : "—"}</td>
    <td class="num${b.bonuses < 0 ? " is-out" : ""}">${b.bonuses ? sign(b.bonuses) : "—"}</td>
  </tr>`).join("");

  const ways = [["sbp", "СБП", `+${SBP_BONUS} бонусов`], ["card", "Картой", ""], ["invoice", "По счёту на юрлицо", ""]];
  const way = D.way || "sbp";

  return head("Биллинг")
    + kpi([
        { label: "Рубли", value: num(LK_BALANCE.coins),   note: "не сгорают" },
        { label: "Бонусы", value: num(LK_BALANCE.bonuses), note: "Сгорают " + LK_BALANCE.bonusBurn }
      ])
    + `<div class="lk-pair">
      ${panel("Пополнить баланс", `<div class="lk-f">
        ${field("Сумма", input("", "10 000"))}
        <div class="lk-l"><span class="lk-l__t">Способ</span>
          <div class="lkd-ways" role="radiogroup">
            ${ways.map(([id, l, perk]) => `<button type="button" role="radio" aria-checked="${way === id}"
              class="lkd-way${way === id ? " is-on" : ""}" data-way="${id}">
              <span>${l}</span>${perk ? `<em>${ICON.coins}${perk}</em>` : ""}</button>`).join("")}
          </div>
        </div>
      </div>
      <div class="lk-head__act" style="margin-top:16px">
        <button class="btn btn--solid">Пополнить</button>
      </div>
      <div class="lk-note" style="margin-top:12px">Закрывающие документы приходят в момент пополнения, а не после каждой
      публикации.${way === "sbp" ? ` За пополнение через СБП начислим ${SBP_BONUS} бонусов.` : ""}</div>`)}
      ${panel("Реквизиты для счетов", `<div class="lk-f">
        ${lockedField("Плательщик", "ООО «Пример»", "Название меняется только через поддержку")}
        <div class="lk-f__row">
          ${lockedField("ИНН", LK_COMPANY.inn, "Изменился ИНН — напишите в поддержку")}
          ${lockedField("ОГРН", "1154827000000", "Изменился ОГРН — напишите в поддержку")}
        </div>
        <div class="lk-f__row">${editField("req", "КПП", "482601001")}${editField("req", "БИК", "044206604")}</div>
        ${editField("req", "Банк", "ПАО Сбербанк, Липецкое отделение")}
        <div class="lk-f__row">
          ${editField("req", "Расчётный счёт", "40702810435000000000")}
          ${/* Корр. счёт нужен для счёта на оплату (созвон 30.09) */ editField("req", "Корр. счёт", "30101810800000000604")}
        </div>
      </div>
      <div class="lkd-warn">Оплачивайте счёт с расчётного счёта той же компании,
      от имени которой размещаете купоны. Платёж от другой компании вернём.</div>
      ${editBar("req")}`)}
    </div>`
    + panel("История операций",
        `<div class="lkd-filters lkd-filters--in lkd-datefilter">
          <label class="lkd-dates__f"><span>с</span><input class="lk-i" type="date" data-ledger-from value="${D.ledgerFrom}" aria-label="С даты"></label>
          <label class="lkd-dates__f"><span>по</span><input class="lk-i" type="date" data-ledger-to value="${D.ledgerTo}" aria-label="По дату"></label>
          ${D.ledgerFrom || D.ledgerTo ? `<button type="button" class="btn btn--ghost" data-ledger-reset>Сбросить</button>` : ""}
        </div>`
        + (list.length
          ? table([{ t: "Дата" }, { t: "Операция" }, { t: "Рубли", num: true }, { t: "Бонусы", num: true }], rows)
            + listPager("ledger", all.length)
          : empty("Операций нет", "За эти даты движений по балансу не было."))
        + `<div class="lk-total"><span>Бонусы тратятся на размещение наравне
           с рублями, но хотя бы один рубль в каждой публикации уходит
           реальными деньгами. Чеки и счета приходят на почту.</span></div>`,
        { act: `<button type="button" class="btn btn--ghost" data-ledger-export${all.length ? "" : " disabled"}>Скачать в Excel</button>` });
};

/* --------------------------------------------------------------------------
   Профиль компании
   --------------------------------------------------------------------------
   · ОГРН рядом с ИНН: вместе они нужны для ERID. Расчётные счета здесь
     не нужны — они в биллинге.
   · «Сохранить» ушла. Поля закрыты, внизу серая «Редактировать»; открыть
     можно только то, что меняется без проверки: название, описание,
     телефон и ссылки. ИНН и ОГРН — только через поддержку, подсказка у «?».
     Так не нужен антифрод на ввод чужого ИНН (решение утра 24.09).
   · Соцсети — все пять полей видны сразу, без прокрутки: иначе заполнят
     первые три и бросят. */
VIEWS["client:profile"] = () =>
  head("Профиль компании")
  /* Сетка по смыслу, рядами (правка Ивана 30.09):
     · компания и где её найти в сети;
     · где компания читает нас: бот для уведомлений и канал новостей за
       бонусы — оба про «подпишитесь», поэтому рядом, одной высоты;
     · логотип и цвета — во всю ширину, в одну строку;
     · точки продаж. */
  + `<div class="lk-pair lkd-row">
      ${panel("Компания", `<div class="lk-f">
        ${editField("co", "Название", "Кофейня «Пример»")}
        ${field("Краткое описание", `<textarea class="lk-ta" data-edit-f="co"${D.editing.co ? "" : " disabled"}>Своя обжарка, запись день в день, работаем с 2014 года.</textarea>`)}
        <div class="lk-f__row">
          ${editField("co", "Телефон", "+7 900 000-00-00")}
          ${/* Почты в профиле не было (созвон 30.09) */ editField("co", "E-mail", "hello@primer.ru", "mail@company.ru")}
        </div>
        <div class="lk-f__row">
          ${lockedField("ИНН", LK_COMPANY.inn, "Изменился ИНН — напишите в поддержку")}
          ${lockedField("ОГРН", "1154827000000", "Изменился ОГРН — напишите в поддержку")}
        </div>
      </div>
      ${editBar("co")}`)}
      ${panel("Компания в сети", `<div class="lk-f">
        <div class="lk-f__row">
          ${editField("net", "Сайт", LK_COMPANY.site, "https://…")}
          ${editField("net", "ВКонтакте", LK_COMPANY.vk, "https://vk.com/…")}
        </div>
        <div class="lk-f__row">
          ${editField("net", "Telegram", LK_COMPANY.tg, "https://t.me/…")}
          ${editField("net", "Одноклассники", "", "https://ok.ru/…")}
        </div>
        ${editField("net", "MAX", "", "https://max.ru/…")}
      </div>
      ${editBar("net")}`)}
    </div>
    <div class="lk-pair lkd-row">
      ${notifyWherePanel()}
      ${subPanel()}
    </div>`
  + brandPanel()
  + panel("Точки продаж", table(
      [{ t: "Адрес" }, { t: "Город" }, { t: "Режим работы" }, { t: "", num: true }],
      `<tr><td>ул. Первомайская, 12</td><td>Липецк</td><td>ежедневно 08:00–22:00</td>
        <td class="num"><button class="btn btn--ghost">Изменить</button></td></tr>
       <tr><td>пр-т Победы, 45</td><td>Липецк</td><td>ежедневно 09:00–21:00</td>
        <td class="num"><button class="btn btn--ghost">Изменить</button></td></tr>`),
      { act: `<button class="btn btn--ghost">Добавить точку</button>` });

/* Логотип и фирменные цвета (созвон 30.09). Логотип — аватар компании в
   кабинете и на купоне, цвета — подсказка генерации картинок: «укажите
   три цвета, которые каждый раз будут использоваться». Логотип просим в
   PNG на прозрачном фоне — иначе на картинке вокруг него встанет белая
   плашка. В прототипе файл читается в браузере и никуда не уходит. */
D.brand = { logo: "", colors: ["#E23B2E", "#2B1D14", "#F4E6D4"] };

function brandPanel() {
  const b = D.brand;
  return panel("Логотип и фирменные цвета", `<div class="lkd-brandgrid"><div class="lkd-brand">
    <label class="lkd-brand__logo${b.logo ? " has-img" : ""}">
      <input type="file" accept="image/png,image/svg+xml,image/jpeg" data-brand-logo hidden>
      ${b.logo ? `<img src="${b.logo}" alt="Логотип компании">` : `<span>${LK_COMPANY.ava}</span>`}
      <em>${b.logo ? "Заменить" : "Загрузить"}</em>
    </label>
    <div class="lkd-brand__txt">
      <b>Логотип</b>
      <span>PNG на прозрачном фоне, от 512 × 512. Встанет аватаром компании в кабинете и на купонах.</span>
    </div>
  </div>
  <div class="lk-l lkd-brand__cols">
    <span class="lk-l__t">Фирменные цвета</span>
    <div class="lkd-swatches">
      ${b.colors.map((c, i) => `<label class="lkd-sw" style="--c:${c}">
        <input type="color" value="${c}" data-brand-color="${i}" aria-label="Цвет ${i + 1}">
        <i></i><span>${c.toUpperCase()}</span>
      </label>`).join("")}
    </div>
    <div class="lk-note">Три цвета, которые генератор будет использовать в каждой картинке купона — так купоны узнаются в ленте.</div>
  </div></div>`);
}

/* --------------------------------------------------------------------------
   Уведомления
   --------------------------------------------------------------------------
   Рекламодателю: «Прочитать все» теперь работает, каналы остаются —
   почта всегда (чеки и решения модерации), Telegram и Max на выбор.
   И отдельно — подписка на наши каналы с новостями за бонусы (вечер
   24.09: «нативка, аккуратная — хотите быть в курсе всех событий…»).

   Партнёру: блок «Куда присылать» убран совсем. Бухгалтерия и процессы
   — сюда и дублем на почту, а маркетинг и новости мы и так дадим ему
   лично, по телефону: «подпишитесь на группу». */
const SUB_BONUS = 150;

/* Telegram тоже подключается только через бота (Иван 30.09): в прототипе
   он был «уже подключён» с ником — теперь, как и Max, с кнопкой
   «Подписаться» */
LK_NOTIFY_CHANNELS.forEach(ch => { if (ch.id !== "email") { ch.value = "не подключён"; ch.on = false; } });

/* Блок «Куда присылать» — один на оба кабинета. Отличаются подставленные
   значения (у партнёра своя почта и ник) и строка про то, что приходит
   на почту: у рекламодателя чеки и модерация, у партнёра счета и акты.

   Где он стоит (правки Ивана 29.09):
   · у рекламодателя — в «Профиле компании», рядом с остальными контактами
     компании, а из «Уведомлений» убран;
   · у партнёра — в «Уведомлениях», под списком (на 24.09 его убирали
     совсем). Ширина ограничена, иначе строка канала растягивается через
     весь раздел. */
function notifyWherePanel() {
  const chValue = ch => !IS_CLIENT && ch.id === "email" ? "partner@example.ru" : ch.value;
  const channels = LK_NOTIFY_CHANNELS.map(ch => {
    const val = chValue(ch);
    const linked = val !== "не подключён";
    const must = ch.id === "email";
    return `
    <div class="lk-chrow" data-notify-row="${ch.id}">
      <label class="lk-ch${ch.on ? " is-on" : ""}">
        <input type="checkbox" data-notify-ch="${ch.id}"${ch.on ? " checked" : ""}${must || !linked ? " disabled" : ""}>
        <span>${ch.label}${must ? ` <i class="lkd-must">обязательно</i>` : ""}</span>
      </label>
      ${linked
        ? `<span class="lk-chrow__v">${val}</span>`
        /* Ник вписать мало: написать человеку бот может, только если тот
           сам его запустил (созвон 30.09). Поэтому кнопка открывает бота,
           человек жмёт «Старт», бот возвращает сюда его ник и ставит
           галочку. В прототипе бот «отвечает» через пару секунд. */
        : ch.pending
          ? `<span class="lk-chrow__v lkd-sub-wait">Ждём подтверждения в боте…</span>`
          : `<button type="button" class="btn btn--solid lkd-sub-btn" data-notify-sub="${ch.id}">Подписаться в ${ch.label}</button>`}
    </div>`;
  }).join("");
  const unlinked = LK_NOTIFY_CHANNELS.some(ch => chValue(ch) === "не подключён");
  return panel("Куда присылать уведомления",
    (unlinked ? `<div class="lkd-sub-lead">Чтобы вовремя узнавать о модерации, оплатах и
       бонусах, подпишитесь на наш бот — это одна кнопка. Бот сам пришлёт сюда ваш ник.</div>` : "")
    + channels
    + `<div class="lk-note" style="margin-top:14px">Почта нужна всегда: на
       неё приходят ${IS_CLIENT ? "чеки и решения модерации" : "счета, акты и решения по выплатам"}.
       Telegram и Max — через нашего бота, SMS сервис не отправляет.
       <span class="lk-save-ok" data-notify-ok hidden>Сохранено</span></div>`);
  /* «Сохранить» убрана (Иван 30.09): каналы подключает бот, а галочка
     только включает и выключает канал — это сохраняется сразу, подтверждаем
     короткой строкой в конце пояснения. */
}

VIEWS["client:notifications"] = VIEWS["partner:notifications"] = () => {
  const list = LK_NOTIFICATIONS[state.role];
  const unread = list.filter(n => n.unread).length;
  const readAll = `<button class="btn btn--ghost" data-read-all${unread ? "" : " disabled"}>Прочитать все</button>`;
  /* Список в две колонки в обоих кабинетах (правка Ивана 29.09): текст
     уведомления короткий, и строка во всю ширину раздела оставляла
     справа пустое поле. */
  const feed = panel("", `<div class="lk-list lk-list--2">${list.map(n => `
        <div class="lk-list__i${n.unread ? " is-unread" : ""}">
          <i class="lk-list__d"></i>
          <div>${n.text}<div class="lk-list__w">${n.when}</div></div>
        </div>`).join("")}</div>`
    + (IS_CLIENT ? "" : `<div class="lk-total lk-total--note"><span>Уведомления
        о выплатах, документах и клиентах приходят сюда и дублируются на
        выбранные каналы.</span></div>`));

  /* В разделе остаётся только лента: каналы уехали в профиль в обоих
     кабинетах, подписка на наши каналы — в профиль компании (правки
     Ивана 29.09). */
  return head("Уведомления", readAll) + feed;
};

/* Подписка на наши каналы за бонусы — нативная реклама сервиса (созвон
   24.09, вечер). Стоит в профиле компании рядом с каналами уведомлений,
   одной высоты с ними (правка Ивана 30.09): оба блока — «подпишитесь». */
function subPanel() {
  return panel("Новости сервиса", `<div class="lkd-sub">
    <div class="lkd-sub__bonus">${ICON.coins}<span>+${SUB_BONUS} бонусов за подписку</span></div>
    <p>Подпишитесь на наш канал — бонусы начислим сразу после подписки.
    Что там будет:</p>
    <ul class="lkd-sub__list">
      <li>Новые механики и сезонные подборки</li>
      <li>Разборы удачных купонов в вашей нише</li>
      <li>Акции и бонусы для рекламодателей</li>
    </ul>
    <p class="lkd-sub__aside">Это не уведомления о ваших купонах — их присылает бот.</p>
    <div class="lkd-sub__acts">
      <a class="btn btn--ghost lkd-sub-btn" href="#" target="_blank" rel="noopener">Канал в Telegram</a>
      <a class="btn btn--ghost lkd-sub-btn" href="#" target="_blank" rel="noopener">Канал в Max</a>
    </div>
  </div>`);
}

/* Превью купона в мастере — та же карточка, что в ленте, поэтому и правки
   ленты переходят сюда: без «воспользовались» и копирования в столбике,
   «мин от вас» в углу, выгода билетиком (последнее — в lk-design-0924.css).
   Сам мастер разбираем на следующем созвоне. */
window.pvNearHTML = function (market) {
  return market
    ? `<span class="mp-name" style="--mp:${LK_MP_COLOR[market] || "#1B1B1B"}">${market}</span>`
    : PV_SAMPLE_DIST + " от вас";
};

/* ==========================================================================
   КАБИНЕТ ПАРТНЁРА
   ========================================================================== */

/* ИНН клиентов региона — в прототипе их не было, а теперь по ИНН партнёр
   выбирает, кому начислить бонусы, и видит, чей купон. Рыба. */
const INN = { 1: "4826011201", 2: "4826027734", 3: "4821009912", 4: "4826104455", 5: "4802012388", 6: "4826075520" };
const innOf = name => {
  const c = LK_CLIENTS.find(x => x.name === name);
  return c ? INN[c.id] : "";
};

/* Купоны клиентов региона — основа начислений (вечер 24.09: «основа
   всей математики — купон, не клиент»). Одна строка — одно размещение:
   у клиента два купона — две строки; перезапуск — новое размещение со
   своим ID. Оплачено разнесено на рубли и бонусы: с бонусов вознаграждение
   не платится, и без этого столбца сумма «оплатил» не сходилась бы с
   начислением. Тип — раздел витрины. ready — купон завершился в этом
   отчётном периоде и попадает в выплату. */
const FEES = [
  { id: 1044, title: "Скидка 20% на первую стрижку", client: 2, type: "regional", status: "draft",
    from: "—", to: "—", rub: 0, bon: 0, fee: 0, ready: false },
  { id: 1043, title: "Мойка кузова по будням", client: 4, type: "regional", status: "moderation",
    from: "—", to: "—", rub: 3100, bon: 0, fee: 620, ready: false },
  { id: 1041, title: "Комбо-обед по будням до 16:00", client: 1, type: "regional", status: "done",
    from: "3 сентября", to: "24 сентября", rub: 2400, bon: 600, fee: 480, ready: true },
  { id: 1039, title: "Каждая пятая чашка кофе в подарок", client: 1, type: "regional", status: "live",
    from: "1 сентября", to: "30 сентября", rub: 3200, bon: 0, fee: 640, ready: false },
  { id: 1036, title: "Шиномонтаж со скидкой до конца сезона", client: 2, type: "regional", status: "live",
    from: "10 сентября", to: "10 октября", rub: 5200, bon: 1800, fee: 1040, ready: false },
  { id: 1031, title: "Набор соусов к заказу от 1 500 ₽", client: 6, type: "marketplace", status: "done",
    from: "14 августа", to: "13 сентября", rub: 5100, bon: 0, fee: 1020, ready: true },
  { id: 1028, title: "Настройка CRM для салона под ключ", client: 3, type: "for-business", status: "done",
    from: "20 августа", to: "19 сентября", rub: 6400, bon: 1000, fee: 1280, ready: true },
  { id: 1022, title: "Окрашивание любой сложности", client: 3, type: "regional", status: "done",
    from: "12 августа", to: "11 сентября", rub: 4300, bon: 500, fee: 860, ready: true },
  { id: 1019, title: "Бизнес-ланч в августе", client: 1, type: "regional", status: "done",
    from: "1 августа", to: "31 августа", rub: 2600, bon: 0, fee: 520, ready: false, paid: true }
];
/* Черновик и модерация (созвон 30.09): партнёр видит купоны клиента ещё
   до оплаты — «чтобы дожимать». Начисления по ним пока нет. */
const TYPE = { regional: "Региональный", marketplace: "Маркетплейс", "for-business": "Для бизнеса" };
const clientById = id => LK_CLIENTS.find(c => c.id === id) || {};
/* Партнёр без региональной роли (правило 25.09: регистрация даёт только
   маркетплейсы, регион открывает сервис по запросу) видит только
   маркетплейсные купоны — региональных клиентов у него нет. */
const levelFees = () => state.regional ? FEES : FEES.filter(f => f.type === "marketplace");
const periodFees = () => levelFees().filter(f => !f.paid && (f.status === "live" || f.status === "done"));
const readySum = () => periodFees().filter(f => f.ready).reduce((a, f) => a + f.fee, 0);
const earnedAll = () => LK_PAYOUTS.filter(p => p.status === "paid").reduce((a, p) => a + p.total, 0) + readySum();

/* Сравнение с прошлым месяцем и тренд (созвон 30.09): «в деньгах
   оценивать сложно, в процентах проще». Сравниваем два последних
   закрытых месяца, а не текущий незакрытый с прошлым полным: иначе в
   начале каждого месяца партнёр видел бы «−70%» на ровном месте (правка
   Ивана 30.09 — показывать рост). Полоска — выплаты по закрытым месяцам. */
const RU_DAT = { "Январь": "январю", "Февраль": "февралю", "Март": "марту", "Апрель": "апрелю", "Май": "маю", "Июнь": "июню",
  "Июль": "июлю", "Август": "августу", "Сентябрь": "сентябрю", "Октябрь": "октябрю", "Ноябрь": "ноябрю", "Декабрь": "декабрю" };
function trend() {
  const closed = LK_PAYOUTS.filter(p => p.status === "paid");
  const series = closed.map(p => p.total).reverse();
  if (series.length < 2) return "";
  const cur = series[series.length - 1], prev = series[series.length - 2];
  const pct = Math.round((cur - prev) / prev * 100);
  const up = cur >= prev;
  const W = 96, H = 30, max = Math.max(...series), min = Math.min(...series);
  const pts = series.map((v, i) => [i / (series.length - 1) * W, H - 3 - (v - min) / Math.max(1, max - min) * (H - 6)]);
  const d = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  const [curM, prevM] = [closed[0].period.split(" ")[0], closed[1].period.split(" ")[0]];
  return `<span class="lkd-trend ${up ? "is-up" : "is-down"}" title="${closed[0].period}: ${rub(cur)} · ${closed[1].period}: ${rub(prev)}">
    <svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" aria-hidden="true"><path d="${d}"/><circle cx="${pts[pts.length - 1][0].toFixed(1)}" cy="${pts[pts.length - 1][1].toFixed(1)}" r="3"/></svg>
    <b>${up ? "+" : "−"}${Math.abs(pct)}%</b><span>${curM.toLowerCase()} к ${RU_DAT[prevM] || prevM.toLowerCase()}</span>
  </span>`;
}

/* Статус купона — те же слова и цвета, что у рекламодателя: одна база
   статусов на оба кабинета */
const feeStatus = f => status(f.status);
const feeReady = f => f.paid
  ? `<span class="lk-st lk-st--done">Выплачено</span>`
  : f.ready
    ? `<span class="lk-st lk-st--ok">Готово к выплате</span>`
    : f.status === "draft" || f.status === "moderation"
      ? `<span class="lk-st lk-st--wait">После оплаты</span>`
      : `<span class="lk-st lk-st--wait">Ждёт завершения</span>`;
/* «Глазик» ведёт на купон на сайте. У завершённого купона страницы уже
   нет — глазик зачёркнут и не нажимается (созвон 30.09), у черновика и
   модерации купона на сайте ещё нет. */
const eyeLink = f => f.status === "live"
  ? `<a class="lkd-eye" href="../coupon-design.html?id=${f.id}" target="_blank" rel="noopener"
      title="Посмотреть купон на сайте" aria-label="Посмотреть купон «${f.title}»">${ICON.eye18}</a>`
  : `<span class="lkd-eye is-off" title="${f.status === "done" ? "Купон завершён — на сайте его больше нет" : "Купона на сайте ещё нет"}">${ICON.eyeOff}</span>`;
ICON.eyeOff = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.6"/><path d="M4 20 20 4"/></svg>';

/* Строка купона клиента в «Купонах клиентов» — полная таблица */
const FEE_COLS = [
  { t: "Купон" }, { t: "Тип" }, { t: "Статус" }, { t: "Начало — окончание" },
  { t: "Оплачено, ₽", num: true, sort: "rub" }, { t: "Бонусами", num: true, sort: "bon" },
  { t: "Ваше начисление", num: true, key: true, sort: "fee" }, { t: "" }
];
const feeRow = f => {
  const cl = clientById(f.client);
  return `<tr>
    <td><b class="lk-t__title">${f.title}</b><span class="lk-t__sub">ID ${f.id} · ${cl.name}<br>ИНН ${INN[cl.id]}</span></td>
    <td>${TYPE[f.type]}</td>
    <td>${feeStatus(f)}</td>
    <td class="lkd-dates">${f.from === "—" ? "<span class='lk-t__sub'>после публикации</span>" : `<span>${f.from}</span><span>${f.to}</span>`}</td>
    <td class="num">${f.rub ? rub(f.rub) : "—"}</td>
    <td class="num">${f.bon ? num(f.bon) : "—"}</td>
    <td class="num lk-t__key">${f.fee ? rub(f.fee) : "—"}<div class="lkd-ready">${feeReady(f)}</div></td>
    <td class="num">${eyeLink(f)}</td>
  </tr>`;
};

/* На дашборде — короткая версия той же строки (созвон 30.09): «Тип»,
   «Оплачено» и «Бонусами» свёрнуты — они есть в полной таблице по
   «Все купоны», а справа освобождается место под рекламу. */
const FEE_COLS_SHORT = [
  { t: "Купон" }, { t: "Статус" }, { t: "Начало — окончание" },
  { t: "Ваше начисление", num: true, key: true }, { t: "" }
];
const feeRowShort = f => {
  const cl = clientById(f.client);
  return `<tr>
    <td><b class="lk-t__title">${f.title}</b><span class="lk-t__sub">${cl.name}</span></td>
    <td>${feeStatus(f)}</td>
    <td class="lkd-dates">${f.from === "—" ? "<span class='lk-t__sub'>после публикации</span>" : `<span>${f.from}</span><span>${f.to}</span>`}</td>
    <td class="num lk-t__key">${f.fee ? rub(f.fee) : "—"}<div class="lkd-ready">${feeReady(f)}</div></td>
    <td class="num">${eyeLink(f)}</td>
  </tr>`;
};

/* Дашборд партнёра — «рука на пульсе».
   · Шесть показателей: «Купонов на клиента» убрали (созвон 30.09) —
     седьмая плитка переносилась на ноутбуке, а число мало что говорило;
   · «Последние купоны» — пять последних событий: черновик, модерация,
     публикация, завершение. Порядок — по последнему действию клиента:
     партнёр сразу видит, кому позвонить;
   · реклама — справа от таблицы, внизу её больше нет. */
const kpiRow = items => kpi(items).replace('class="lk-kpi"', 'class="lk-kpi lkd-kpi-row"');

/* Партнёрская ссылка — первая полоса дашборда: её партнёр берёт чаще
   всего, чтобы отправить знакомому бизнесу. Ссылка — образец, настоящая
   выдаётся при регистрации партнёра. Копируется одним нажатием. */
const PARTNER_REF = "vsekupony.ru/p/751743";
const refBar = () => `<div class="lkd-ref">
    <div class="lkd-ref__txt">
      <span class="lkd-ref__label">Партнёрская ссылка</span>
      <a class="lkd-ref__link" href="https://${PARTNER_REF}" target="_blank" rel="noopener">${PARTNER_REF}</a>
    </div>
    <p class="lkd-ref__hint">Бизнес, который зарегистрируется по ней, закрепится за вами.</p>
    <button class="btn btn--ghost lkd-ref__btn" type="button" data-ref-copy>
      <i data-icon="copy"></i><span>Скопировать</span></button>
  </div>`;
const withRef = html => html.replace('<div class="lk-kpi', refBar() + '<div class="lk-kpi');

document.addEventListener("click", e => {
  const b = e.target.closest("[data-ref-copy]");
  if (!b) return;
  try { navigator.clipboard.writeText("https://" + PARTNER_REF); } catch (_) {}
  const t = qs("span", b), was = t.textContent;
  t.textContent = "Скопировано"; b.classList.add("is-done");
  setTimeout(() => { t.textContent = was; b.classList.remove("is-done"); }, 1800);
});

const baseMpDashboard = VIEWS["partner:dashboard"];
VIEWS["partner:dashboard"] = () => {
  /* Без региональной роли — дашборд по кодам из lk.js: показывать
     клиентов региона и купоны на клиента здесь нечем */
  if (!state.regional) return withRef(baseMpDashboard()) + offersRow();

  const now = FEES.filter(f => f.status === "live");
  const activeClients = new Set(now.map(f => f.client)).size;
  const fresh = LK_CLIENTS.filter(c => clientStatus(c) === "new").length;
  const feeAll = FEES.reduce((a, f) => a + f.fee, 0) + LK_PAYOUTS.filter(p => p.status === "paid").reduce((a, p) => a + p.total, 0);
  const withCoupons = LK_CLIENTS.filter(c => c.coupons > 0);
  const feePerClient = Math.round(withCoupons.reduce((a, c) => a + c.fee, 0) / withCoupons.length);
  const last = FEES.slice().sort((a, b) => b.id - a.id).slice(0, 5);

  return head("Дашборд партнёра")
    + refBar()
    + kpiRow([
        { label: "Клиентов в регионе",        value: LK_CLIENTS.length, note: fresh + " без первого купона" },
        { label: "Размещено купонов",         value: now.length, note: "активные на сегодня" },
        { label: "Активных клиентов",         value: activeClients, note: "разместили купон" },
        { label: "К выплате",                 value: rub(readySum()), note: "за " + LK_PAYOUTS[0].period.toLowerCase() },
        { label: "Начислено всего",           value: rub(feeAll), note: "за все периоды" },
        { label: "Начисление с клиента",      value: rub(feePerClient), note: "в среднем" }
      ])
    /* Панель тянется до низа рекламной карточки — блоки кончаются на одной
       линии (Иван 30.09), как в статистике */
    + `<div class="lkd-dash lkd-dash--chart"><div class="lkd-dash__main">
        ${panel("Последние купоны", table(FEE_COLS_SHORT, last.map(feeRowShort).join("")),
          { act: `<a class="btn btn--ghost" href="${href("clients")}" data-go="clients">Все купоны</a>` })}
      </div>${adSlot("partner")}</div>`;
};

/* Полоса предложений для бизнеса внизу разделов партнёра */
function offersRow() {
  return `<div class="lkd-offers">
    <div class="lkd-offers__head"><h2>Предложения для вашего бизнеса</h2>
      <span class="lk-note">Открываются в новой вкладке</span></div>
    <div class="lkd-offers__row">${adSlot("partner")}${(() => {
      /* второй слот — всегда баннер, чтобы было видно оба формата рядом */
      const b = AD_BANNER;
      return `<aside class="lkd-ad lkd-ad--banner">
        <span class="lkd-ad__label">Реклама · erid: ${b.erid}</span>
        <span class="lkd-ad__kicker">${b.kicker}</span>
        <b class="lkd-ad__h">${b.title}</b><p>${b.text}</p>
        <a class="btn btn--solid btn--wide" href="#" target="_blank" rel="noopener">${b.cta}</a>
      </aside>`;
    })()}</div>
  </div>`;
}

/* Купоны клиентов (созвон 30.09): фильтр и сортировка «везде» — крупный
   партнёр с менеджерами иначе запутается. Клиент — поиском по названию
   или ИНН, тип и статус — списками, период — по дате размещения. Суммы
   сортируются кликом по заголовку столбца. Итог под таблицей — по
   текущему фильтру, по всем страницам. */
D.fq = ""; D.ftype = "all"; D.fstatus = "all"; D.ffrom = ""; D.fto = "";
D.fsort = null; D.fdir = -1; D.fpage = 1;

const feeFiltered = () => {
  const q = D.fq.trim().toLowerCase();
  let list = levelFees().filter(f => {
    const cl = clientById(f.client);
    if (q && (cl.name || "").toLowerCase().indexOf(q) === -1 && (INN[cl.id] || "").indexOf(q) === -1) return false;
    if (D.ftype !== "all" && f.type !== D.ftype) return false;
    if (D.fstatus !== "all" && f.status !== D.fstatus) return false;
    const d = isoFromRu(f.from === "—" ? "" : f.from + " 2026");
    if (D.ffrom && (!d || d < D.ffrom)) return false;
    if (D.fto && (!d || d > D.fto)) return false;
    return true;
  });
  if (D.fsort) list = list.slice().sort((x, y) => (x[D.fsort] - y[D.fsort]) * D.fdir);
  return list;
};

/* Заголовок столбца с сортировкой: стрелка показывает текущее направление */
const sortCols = cols => cols.map(c => c.sort ? Object.assign({}, c, {
  t: `<button type="button" class="lkd-sort${D.fsort === c.sort ? " is-on" : ""}" data-fee-sort="${c.sort}">${c.t}<i>${D.fsort === c.sort ? (D.fdir < 0 ? "↓" : "↑") : "↕"}</i></button>`
}) : c);

VIEWS["partner:clients"] = () => {
  const all = feeFiltered();
  const list = pageSlice("fee", all);
  const sum = k => all.reduce((a, f) => a + (f[k] || 0), 0);
  const opt = (v, label, cur) => `<option value="${v}"${cur === v ? " selected" : ""}>${label}</option>`;
  const statuses = ["draft", "moderation", "live", "done"];

  const totalRow = all.length ? `<tr class="lkd-sumrow">
      <td><b>Итого по фильтру</b><span class="lk-t__sub">${all.length} ${plural(all.length, "купон", "купона", "купонов")}</span></td>
      <td></td><td></td><td></td>
      <td class="num">${rub(sum("rub"))}</td>
      <td class="num">${num(sum("bon"))}</td>
      <td class="num lk-t__key">${rub(sum("fee"))}</td>
      <td></td></tr>` : "";

  return head("Купоны клиентов",
      `<button class="btn btn--ghost">Выгрузить в CSV</button>
       <button class="btn btn--ghost">Выгрузить в Excel</button>`)
    + `<div class="lkd-earn">
      <div class="lk-panel lkd-earn__c lkd-earn__c--main">
        <span class="lkd-money__l">Готово к выплате в отчётном периоде</span>
        <b>${rub(readySum())}</b>
        <span class="lk-note">Счёт формируется в «Отчётах и выплатах» после
        закрытия периода по купонам, которые уже завершились.</span>
        <a class="btn btn--ghost" href="${href("payouts")}" data-go="payouts">К выплатам</a>
      </div>
      <div class="lk-panel lkd-earn__c">
        <span class="lkd-money__l">Заработано за всё время</span>
        <b>${rub(earnedAll())}</b>
        <span class="lk-note">Вместе с текущим периодом</span>
        ${trend()}
      </div>
    </div>`
    + panel("", `<div class="lkd-filters lkd-filters--in lkd-ffilters">
        <input class="lk-i" type="search" data-fee-q value="${D.fq}" placeholder="Клиент или ИНН" aria-label="Клиент или ИНН">
        <select class="lk-s" data-fee-type aria-label="Тип купона">
          ${opt("all", "Все типы", D.ftype)}${Object.keys(TYPE).map(t => opt(t, TYPE[t], D.ftype)).join("")}
        </select>
        <select class="lk-s" data-fee-status aria-label="Статус">
          ${opt("all", "Все статусы", D.fstatus)}${statuses.map(st => opt(st, LK_STATUSES[st].label, D.fstatus)).join("")}
        </select>
        <label class="lkd-dates__f"><span>с</span><input class="lk-i" type="date" data-fee-from value="${D.ffrom}" aria-label="Размещён с"></label>
        <label class="lkd-dates__f"><span>по</span><input class="lk-i" type="date" data-fee-to value="${D.fto}" aria-label="Размещён по"></label>
      </div>`
      + (all.length
        ? table(sortCols(FEE_COLS), list.map(feeRow).join("") + totalRow)
        : empty("Ничего не нашлось", "Поменяйте фильтры: клиент, тип, статус или даты."))
      + listPager("fee", all.length)
      + `<div class="lk-total"><span>Клиенты закреплены за вами по территории
         ответственности. Закрепление постоянное. В выплату идут купоны,
         завершившиеся в отчётном периоде — календарном месяце.</span></div>`);
};

/* Бонусы клиентам: у дат истории — год (созвон 30.09) */
LK_BONUSES.forEach(b => { if (!/\d{4}$/.test(b.sent)) b.sent += " 2026"; });
VIEWS["partner:bonuses"] = () => {
  const left = LK_BONUS_POOL.limit - LK_BONUS_POOL.spent;
  const share = Math.round(LK_BONUS_POOL.spent / LK_BONUS_POOL.limit * 100);
  const pre = D.prefill || {};

  return head("Бонусы клиентам")
    + kpi([
        { label: "Лимит на " + LK_BONUS_POOL.month, value: num(LK_BONUS_POOL.limit) },
        { label: "Использовано", value: num(LK_BONUS_POOL.spent), note: share + "% лимита" },
        { label: "Осталось",     value: num(left), note: "Обнулится 1 октября" },
        { label: "Начислений",   value: LK_BONUSES.length }
      ])
    + `<div class="lk-pair">
      ${panel("Начислить бонусы", `<div class="lk-f" data-bonus-form>
        <label class="lk-l"><span class="lk-l__t">Кому — ИНН клиента</span>
          <input class="lk-i" data-inn inputmode="numeric" maxlength="12" placeholder="10 или 12 цифр" value="${pre.inn || ""}">
          <span class="lkd-inn" data-inn-found></span>
        </label>
        ${field("Сколько бонусов", `<input class="lk-i" data-bonus-amount placeholder="2 500" value="${pre.amount || ""}">`)}
        ${field("Сообщение клиенту", `<textarea class="lk-ta" placeholder="Спасибо, что с нами. Вот бонусы на следующее размещение."></textarea>`)}
      </div>
      <div class="lk-head__act" style="margin-top:16px">
        <button class="btn btn--solid btn--lg">Начислить</button>
      </div>`)}
      ${panel("Правила", `
        <ul class="lk-rules">
          <li>Лимит задаёт администратор на календарный месяц. Остаток не
              переносится: 1-го числа каждого месяца счётчик обнуляется.</li>
          <li>Бонусы идут только клиентам вашего региона. В маркетплейсах
              вместо них работает реферальный код.</li>
          <li>Клиент тратит бонусы на размещение купонов. Обменять их на
              деньги нельзя. Срок жизни бонусов — 365 дней.</li>
        </ul>`)}
    </div>`
    + panel("История начислений", table(
        /* Столбцы равными долями, сумма и дата — по левому краю своих
           столбцов (правка Ивана 29.09). */
        [{ t: "Кому", w: "28%" }, { t: "Сколько", w: "24%" },
         { t: "Дата начисления", w: "24%" }, { t: "", num: true, w: "24%" }],
        LK_BONUSES.map(b => `<tr>
          <td><b class="lk-t__title">${b.to}</b><span class="lk-t__sub">ИНН ${innOf(b.to)}</span></td>
          <td>${num(b.amount)}</td>
          <td>${b.sent}</td>
          <td class="num"><button class="btn btn--ghost" data-repeat-bonus="${innOf(b.to)}|${b.amount}">Повторить</button></td></tr>`).join("")));
};

/* Промокоды маркетплейсов (созвон 30.09):
   · «Кому выдан» убран: мы это никак не фиксируем, партнёр пишет себе
     комментарий — его достаточно;
   · «Публикаций» → «Применили»: код применяют, а не публикуют;
   · страницы по 10: у кого-то кодов будут сотни. */
const MP4 = ["Яндекс Маркет", "Ozon", "Wildberries", "М.Видео"];
D.codePage = 1;
VIEWS["partner:codes"] = () => {
  const rows = pageSlice("codes", LK_CODES).map(c => `<tr>
    <td><b class="lk-t__title">${c.status === "queued" ? "В очереди…" : c.code}</b>
        ${c.base ? `<span class="lk-t__sub">базовый</span>`
          : c.status === "queued" ? `<span class="lk-t__sub">будет готов через ~${LK_CODE_LIMITS.delayMin} мин</span>` : ""}</td>
    <td>${c.comment || "<span class='lk-t__sub'>—</span>"}</td>
    <td>${c.market === "—" ? "<span class='lk-t__sub'>любая</span>" : c.market}</td>
    <td class="num">${c.used ? num(c.used) : "—"}</td>
    <td class="num lk-t__key">${c.income ? rub(c.income) : "—"}</td>
  </tr>`).join("");

  const total = LK_CODES.reduce((a, c) => a + c.income, 0);

  return head("Промокоды маркетплейсов",
      `<button class="btn btn--solid" type="button" data-request-code>Запросить новый промокод</button>`)
    + panel("", table(
        [{ t: "Промокод" }, { t: "Комментарий" }, { t: "Площадка" },
         { t: "Применили", num: true }, { t: "Начислено", num: true, key: true }], rows)
      + listPager("codes", LK_CODES.length)
      + `<div class="lk-total"><b>${rub(total)}</b><span>начислено по промокодам за всё время</span></div>`)
    + panel("Как это работает", `
      <ul class="lk-rules">
        <li>Селлер вводит ваш промокод при создании купона в разделе
            «Маркетплейсы». Размещение для него дешевле на ${LK_RATES.discount}%,
            вам идёт вознаграждение с того, что он заплатил.</li>
        <li>Без промокода — розничная цена и ноль вам. Промокод указывается
            заново на каждой публикации: селлер может принести разные промокоды
            в разные месяцы.</li>
        <li>Площадки — ${MP4.join(", ")}. Отдельный промокод под площадку
            поможет понять, кто из ваших людей где работает.</li>
        <li>Новый промокод выдаётся с задержкой около ${LK_CODE_LIMITS.delayMin} минут,
            не чаще ${LK_CODE_LIMITS.perHour} в час.</li>
      </ul>`);
};

/* Запрос промокода: комментарий для себя и площадка. ИНН убран (30.09):
   кому выдан код, мы не фиксируем. */
const baseCodeModal = window.openCodeRequestModal;
window.openCodeRequestModal = function () {
  if (nextCodeAllowedAt()) { baseCodeModal(); return; }
  openModal(`
    <h3>Запросить промокод</h3>
    <p class="lk-modal__lead">Промокод появляется не сразу — на выдачу уходит около
    ${LK_CODE_LIMITS.delayMin} минут, это антифрод-задержка.</p>
    <div class="lk-f">
      ${field("Комментарий для себя", `<input class="lk-i" data-code-comment placeholder="Например, «для чата селлеров Ozon»">`)}
      ${field("Площадка", select(["Любая"].concat(MP4)))}
    </div>
    <div class="lk-head__act" style="margin-top:18px">
      <button class="btn btn--ghost" type="button" data-modal-close>Отмена</button>
      <button class="btn btn--solid" type="button" data-code-submit>Отправить заявку</button>
    </div>`);
  const box = qs("#lkModal .lk-modal__body");
  qs("[data-code-submit]", box).onclick = () => {
    const code = nextCodeValue();
    const mk = qs(".lk-s", box).value;
    LK_CODES.unshift({
      code, base: false, comment: qs("[data-code-comment]", box).value.trim(),
      market: mk === "Любая" ? "—" : mk, used: 0, income: 0, status: "queued"
    });
    state.codeRequestAt = Date.now();
    D.codePage = 1;
    closeModal();
    render();
  };
};

/* Отчёты и выплаты (созвон 30.09):
   · «Сформировать счёт и акт» убрана: механику поменяли — сверку
     отправляем и выплачиваем сами, со стороны партнёра ничего формировать
     не нужно;
   · сумма «К выплате» — крупно, с тем же сравнением с прошлым периодом,
     что в «Купонах клиентов»;
   · детализация: ИНН клиента — тот же ключ, что в «Купонах клиентов»,
     чтобы сверять, прыгая между разделами; «Окончание» → «Дата
     публикации»; фильтр типов убран, вместо него — выбор месяца стрелками;
   · по периодам: без столбца «Счёт», «Скачать отчёт» вместо акта;
   · реклама отсюда убрана. */
D.payMonth = 0;
VIEWS["partner:payouts"] = () => {
  const pend = LK_PAYOUTS.find(p => p.status === "pending");
  const month = LK_PAYOUTS[D.payMonth] || LK_PAYOUTS[0];
  /* Детализация есть у текущего периода и у августа (купон 1019 выплачен);
     за более ранние месяцы в прототипе строк нет */
  const detail = month.status === "pending" ? periodFees()
    : levelFees().filter(f => f.paid && month.period.indexOf("Август") === 0);
  const paid = LK_PAYOUTS.filter(p => p.status === "paid").reduce((a, p) => a + p.total, 0);

  const detailRows = detail.map(f => {
    const cl = clientById(f.client);
    return `<tr>
      <td><b class="lk-t__title">${f.title}</b><span class="lk-t__sub">ID ${f.id} · ${cl.name}</span></td>
      <td>${INN[cl.id] || "—"}</td>
      <td>${TYPE[f.type]}</td>
      <td>${f.from}</td>
      <td class="num">${rub(f.rub)}</td>
      <td class="num">${f.bon ? num(f.bon) : "—"}</td>
      <td class="num lk-t__key">${f.ready || f.paid ? rub(f.fee) : `<span class="lk-t__sub">после ${f.to}</span>`}</td>
    </tr>`;
  }).join("");
  const readyIn = detail.filter(f => f.ready || f.paid).reduce((a, f) => a + f.fee, 0);

  const rows = LK_PAYOUTS.map(p => `<tr>
    <td><b class="lk-t__title">${p.period}</b><span class="lk-t__sub">${p.date}</span></td>
    <td class="num lk-t__key">${rub(p.status === "pending" ? readySum() : p.total)}</td>
    <td>${p.status === "paid"
      ? `<span class="lk-st lk-st--done">Выплачено</span>`
      : `<span class="lk-st lk-st--wait">Ожидает выплаты</span>`}</td>
    <td class="num">${p.status === "paid" ? `<button class="btn btn--ghost">Скачать отчёт</button>` : ""}</td>
  </tr>`).join("");

  const monthNav = `<div class="lkd-month">
    <button type="button" class="lkd-month__b" data-pay-month="${D.payMonth + 1}"${D.payMonth >= LK_PAYOUTS.length - 1 ? " disabled" : ""} aria-label="Предыдущий месяц">‹</button>
    <b>${month.period}</b>
    <button type="button" class="lkd-month__b" data-pay-month="${D.payMonth - 1}"${D.payMonth <= 0 ? " disabled" : ""} aria-label="Следующий месяц">›</button>
  </div>`;

  return head("Отчёты и выплаты", `<button class="btn btn--ghost">Выгрузить в Excel</button>`)
    + `<div class="lk-pair lkd-row">
      ${/* Та же информация, разложенная в две колонки (Иван 30.09): слева
           сумма и тренд, справа дата выплаты и пояснение — без пустого
           поля ни справа, ни снизу */ ""}
      ${panel("К выплате", `<div class="lkd-payout-wrap"><div class="lkd-payout">
        <span class="lkd-money__l">${pend.period}</span>
        <b class="lkd-payout__v">${rub(readySum())}</b>
        ${trend()}
      </div>
      <div class="lkd-payout__side">
        <span class="lkd-money__l">Выплата</span>
        <b class="lkd-payout__date">${pend.date.replace("к выплате ", "")}</b>
        <p>В расчёт идут купоны, завершившиеся в отчётном периоде. Сверку и
        выплату делаем сами через 14 дней после закрытия периода —
        формировать и подписывать ничего не нужно.</p>
      </div></div>`)}
      ${panel("Реквизиты для выплат", `<div class="lk-f">
        <div class="lkd-grid6">${field("Получатель", input("", "ИП Партнёров И.", true))}${field("ИНН", input("", "482600000000", true))}${field("ОГРНИП", input("", "321482700000012", true))}${field("Банк", input("", "ПАО Сбербанк", true))}${field("БИК", input("", "044206604", true))}${field("Расчётный счёт", input("", "40802810435000000000", true))}</div>
      </div>
      <div class="lkd-editbar">
        <span class="lkd-editbar__note">Реквизиты меняются в профиле</span>
        <a class="btn lkd-btn-grey" href="${href("profile")}" data-go="profile">Изменить в профиле</a>
      </div>`)}
    </div>`
    + panel("Детализация", (detail.length
          ? table([{ t: "Купон" }, { t: "ИНН клиента" }, { t: "Тип" }, { t: "Дата публикации" }, { t: "Оплачено, ₽", num: true },
                   { t: "Бонусами", num: true }, { t: "Ваше начисление", num: true, key: true }], detailRows)
            + `<div class="lk-total"><b>${rub(readyIn)}</b>
               <span>${month.status === "pending" ? "готово к выплате в этом периоде" : "выплачено за " + month.period.toLowerCase()}</span></div>`
          : empty("Детализации за этот месяц нет", "В прототипе строки есть только за сентябрь и август.")),
        { act: monthNav })
    + panel("По периодам", table(
        [{ t: "Период" }, { t: "Сумма", num: true, key: true }, { t: "Статус" }, { t: "", num: true }], rows)
      + `<div class="lk-total"><b>${rub(paid)}</b><span>выплачено за всё время</span></div>`);
};

/* Ваш профиль (созвон 30.09)
   · «Профиль партнёра» → «Ваш профиль»: это его кабинет;
   · территория ответственности — просто строкой, без поля: партнёр её не
     меняет, она здесь, «чтобы помнил»;
   · «Добавить контактное лицо» — между территорией и основным телефоном:
     у крупного партнёра будет прямой телефон менеджера. Имя, телефон и
     почта обязательны;
   · сетка рядами, как у рекламодателя: уведомления и партнёрские каналы
     новостей рядом, условия — во всю ширину. */
D.contacts = [{ name: "Василий, менеджер", phone: "+7 900 111-22-33", mail: "vasily@partnerov.ru" }];
D.contactNew = false;

function contactsBlock() {
  const list = D.contacts.map((c, i) => `<div class="lkd-contact">
      <div><b>${c.name}</b><span>${c.phone} · ${c.mail}</span></div>
      <button type="button" class="lkd-contact__x" data-contact-del="${i}" aria-label="Удалить контакт">×</button>
    </div>`).join("");
  const form = D.contactNew ? `<div class="lkd-contact-new" data-contact-form>
      <div class="lk-f__row lkd-contact-new__row">
        ${field("Имя и должность", `<input class="lk-i" data-c="name" placeholder="Анна, менеджер">`)}
        ${field("Телефон", `<input class="lk-i" data-c="phone" type="tel" placeholder="+7 900 000-00-00">`)}
        ${field("Почта", `<input class="lk-i" data-c="mail" type="email" placeholder="anna@company.ru">`)}
      </div>
      <div class="lkd-contact-new__acts">
        <span class="lkd-contact-new__err" data-contact-err hidden>Заполните имя, телефон и почту</span>
        <button type="button" class="btn btn--ghost" data-contact-cancel>Отмена</button>
        <button type="button" class="btn btn--solid" data-contact-save>Добавить</button>
      </div>
    </div>` : `<button type="button" class="lkd-geo__all lkd-contact-add" data-contact-add>+ Добавить контактное лицо</button>`;
  return `<div class="lk-l"><span class="lk-l__t">Контактные лица</span>${list}${form}</div>`;
}

VIEWS["partner:profile"] = () =>
  head("Ваш профиль")
  + `<div class="lk-pair lkd-row">
      ${panel("Партнёр", `<div class="lk-f">
        ${editField("pp", "Имя или организация", "ИП Партнёров И.")}
        ${editField("pp", "Сфера деятельности", "Рекламное агентство полного цикла")}
        ${editField("pp", "Сайт", "https://partnerov.ru")}
        ${state.regional
          ? `<div class="lk-l"><span class="lk-l__t">Территория ответственности</span>
              <span class="lkd-static">Липецкая область: ${LK_CITIES.map(c => c.name).join(", ")}</span></div>`
          : ""}
        ${contactsBlock()}
        <div class="lk-f__row">${editField("pp", "Основной телефон", "+7 900 000-00-00")}${editField("pp", "Почта", "partner@example.ru")}</div>
      </div>
      ${editBar("pp")}`)}
      ${panel("Реквизиты для выплат", `<div class="lk-f">
        <div class="lk-f__row">
          ${lockedField("ИНН", "482600000000", "Изменился ИНН — напишите в поддержку")}
          ${lockedField("ОГРНИП", "321482700000012", "Изменился ОГРНИП — напишите в поддержку")}
        </div>
        <div class="lk-f__row">${editField("preq", "Банк", "ПАО Сбербанк")}${editField("preq", "БИК", "044206604")}</div>
        <div class="lk-f__row">${editField("preq", "Расчётный счёт", "40802810435000000000")}${editField("preq", "Корр. счёт", "30101810800000000604")}</div>
        ${editField("preq", "Почта для документов", "buh@partnerov.ru")}
      </div>
      ${editBar("preq")}`)}
    </div>
    <div class="lk-pair lkd-row">
      ${notifyWherePanel()}
      ${panel("Партнёрские новости", `<div class="lkd-sub">
        <p>Новости для партнёров — в наших партнёрских каналах: изменения
        условий и KPI, новые материалы для работы с клиентами, разборы
        удачных сделок. Уведомления о ваших клиентах и выплатах присылает
        бот — это не он.</p>
        <div class="lkd-sub__acts">
          <a class="btn btn--ghost lkd-sub-btn" href="#" target="_blank" rel="noopener">Канал в Telegram</a>
          <a class="btn btn--ghost lkd-sub-btn" href="#" target="_blank" rel="noopener">Канал в Max</a>
        </div>
      </div>`)}
    </div>`
  + panel("Условия", `
      <ul class="lk-rules">
        <li>Вознаграждение — от 20 до 30% суммы, которую клиент заплатил
            за размещение. Точный процент — в вашем договоре и
            ежемесячном приложении KPI.</li>
        <li>Скидка селлеру по вашему промокоду — ${LK_RATES.discount}%.</li>
        <li>Выплата раз в месяц, через 14 дней после закрытия периода.</li>
      </ul>
      <div class="lkd-editbar"><a class="btn lkd-btn-grey" href="${href("docs")}" data-go="docs">Договор и приложения</a></div>`);

/* Документы: подписанный договор, ежемесячные приложения KPI и акты.
   Столбец статуса убран, «Дата» → «Дата подписания» (созвон 30.09): здесь
   лежит только подписанное — черновики уходят на почту. Приложение KPI
   действует без подписи: дата — когда вступило в силу. */
const DOCS = [
  { name: "Приложение KPI · октябрь 2026", kind: "KPI", date: "25 сентября 2026" },
  { name: "Акт № П-0826-014 за август 2026", kind: "Акт", date: "1 сентября 2026" },
  { name: "Приложение KPI · сентябрь 2026", kind: "KPI", date: "26 августа 2026" },
  { name: "Акт № П-0726-011 за июль 2026", kind: "Акт", date: "1 августа 2026" },
  { name: "Договор возмездного оказания услуг № П-014", kind: "Договор", date: "12 июня 2026" }
];
VIEWS["partner:docs"] = () =>
  head("Документы")
  + panel("", table(
      [{ t: "Документ" }, { t: "Тип" }, { t: "Дата подписания" }, { t: "", num: true }],
      DOCS.map(d => `<tr>
        <td><b class="lk-t__title">${d.name}</b></td>
        <td>${d.kind}</td><td>${d.date}</td>
        <td class="num"><button class="btn btn--ghost">Скачать</button></td></tr>`).join(""))
    + `<div class="lk-total"><span>Приложение KPI обновляется каждый месяц
       и действует без подписи — достаточно отметки «ознакомлен». Акты
       подписаны факсимиле.</span></div>`);

/* ==========================================================================
   База знаний — в обоих кабинетах (созвон 30.09)
   ==========================================================================
   «Как в Notion»: слева поиск и дерево разделов со статьями, справа статья.
   Материалы — презентации, шаблоны, скрипты — прикреплены прямо в тексте
   и скачиваются из него (Вилл: отдельный архив файлов не нужен). Базы две:
   у партнёров своя, у рекламодателей — своя, того же устройства. Тексты
   — рыба: наполнять будет отдел взаимодействия с партнёрами. Позже рядом
   появится ИИ-помощник по базе — в MVP его нет. */
const KB_FILE = (name, kind, size) => `<a class="lkd-file" href="#" data-kb-file="${name}.${kind.toLowerCase()}">
  <span class="lkd-file__i">${kind}</span><span class="lkd-file__t"><b>${name}</b><small>${kind} · ${size}</small></span>
  <span class="lkd-file__d" aria-hidden="true">↓</span></a>`;

const KB = {
  partner: [
    { id: "p0", title: "00. Старт партнёра", items: [
      { id: "p-howto", title: "Как пользоваться базой знаний", updated: "вчера, 16:42", views: 12, body: `
        <p>База знаний — всё, что нужно для работы с клиентами: как их искать, как объяснять купоны, как устроены выплаты. Слева — разделы, сверху — поиск по всем статьям.</p>
        <p>Материалы — презентации, шаблоны писем, скрипты звонков — прикреплены прямо к статьям. Нажмите на файл, чтобы скачать.</p>
        <h2>С чего начать</h2>
        <ol><li><b>Чек-лист первых дней</b> — что сделать в первую неделю.</li>
        <li><b>Как объяснить купон за минуту</b> — короткий скрипт для первого звонка.</li>
        <li><b>Выплаты и документы</b> — когда и как приходят деньги.</li></ol>` },
      { id: "p-checklist", title: "Чек-лист первых дней", updated: "28 сентября 2026", views: 34, body: `
        <p>Первая неделя — на то, чтобы разобраться в сервисе и провести первые встречи. Отмечайте пункты по порядку.</p>
        <h2>День 1–2</h2>
        <ul><li>Пройдите регистрацию клиента сами — посмотрите сервис глазами рекламодателя.</li>
        <li>Прочитайте приложение KPI на текущий месяц.</li>
        <li>Подпишитесь на партнёрский канал в Telegram или Max.</li></ul>
        <h2>День 3–5</h2>
        <ul><li>Составьте список из 30 компаний вашей территории.</li>
        <li>Проведите первые пять звонков по скрипту.</li></ul>
        ${KB_FILE("Список первых шагов", "PDF", "240 КБ")}` }
    ] },
    { id: "p1", title: "01. Поиск клиентов", items: [
      { id: "p-where", title: "Где искать клиентов", updated: "25 сентября 2026", views: 51, body: `
        <p>Лучше всего купоны работают у бизнеса с живым потоком гостей: кафе, салоны, автосервисы, фитнес. Начните с улиц, где вы бываете сами.</p>
        <h2>Источники</h2>
        <ol><li><b>Карты и справочники</b> — компании рядом, у которых мало отзывов.</li>
        <li><b>Соцсети города</b> — кто уже даёт рекламу, тот готов платить за трафик.</li>
        <li><b>Ваши клиенты</b> — попросите рекомендацию у тех, кому купон уже принёс гостей.</li></ol>
        ${KB_FILE("База компаний Липецка — шаблон", "XLSX", "86 КБ")}` },
      { id: "p-script", title: "Как объяснить купон за минуту", updated: "вчера, 11:05", views: 78, body: `
        <p>Короткий скрипт для первого звонка. Задача — не продать, а договориться о встрече.</p>
        <h2>Скрипт</h2>
        <ol><li><b>Кто вы:</b> «Я партнёр сервиса „Все купоны“ в Липецке».</li>
        <li><b>Что это:</b> «Мы публикуем скидки компаний в каталоге и городских группах — люди забирают купон и приходят к вам».</li>
        <li><b>Почему сейчас:</b> «Первый купон размещаем бесплатно».</li>
        <li><b>Встреча:</b> «Покажу за 15 минут, как это выглядит. Когда удобно?»</li></ol>
        ${KB_FILE("Скрипт первого звонка", "DOCX", "54 КБ")}
        ${KB_FILE("Презентация для клиента", "PDF", "3,4 МБ")}` }
    ] },
    { id: "p2", title: "02. Механики купонов", items: [
      { id: "p-mech", title: "Пять механик скидки", updated: "20 сентября 2026", views: 23 },
      { id: "p-secret", title: "Тайный покупатель: как продавать", updated: "20 сентября 2026", views: 9 }
    ] },
    { id: "p3", title: "03. Выплаты и документы", items: [
      { id: "p-pay", title: "Когда приходят выплаты", updated: "30 сентября 2026", views: 40 },
      { id: "p-kpi", title: "Приложение KPI: как читать", updated: "25 сентября 2026", views: 17 }
    ] },
    { id: "p4", title: "04. Материалы", items: [
      { id: "p-brand", title: "Логотипы и презентации", updated: "18 сентября 2026", views: 66 }
    ] }
  ],
  client: [
    { id: "c0", title: "00. Первые шаги", items: [
      { id: "c-howto", title: "Как пользоваться базой знаний", updated: "вчера, 16:42", views: 8, body: `
        <p>Здесь собраны ответы на частые вопросы: как создать купон, какую механику выбрать, как читать статистику и платить. Слева — разделы, сверху — поиск.</p>
        <p>Шаблоны и примеры прикреплены прямо к статьям — нажмите на файл, чтобы скачать.</p>` },
      { id: "c-first", title: "Первый купон за 10 минут", updated: "29 сентября 2026", views: 112, body: `
        <p>Первый купон размещаем бесплатно. Вот как собрать его быстро.</p>
        <h2>По шагам</h2>
        <ol><li><b>Раздел и ниша</b> — где купон появится в каталоге.</li>
        <li><b>Предложение</b> — заголовок и механика: скидка, подарок, «два по цене одного».</li>
        <li><b>Срок и промокод</b> — промокод можно сгенерировать.</li>
        <li><b>Города и адреса</b> — где купон увидят и где им воспользоваться.</li>
        <li><b>Изображение</b> — загрузите своё или сгенерируйте.</li></ol>
        ${KB_FILE("Чек-лист удачного купона", "PDF", "310 КБ")}` }
    ] },
    { id: "c1", title: "01. Механики и предложения", items: [
      { id: "c-mech", title: "Какую механику выбрать", updated: "22 сентября 2026", views: 64 },
      { id: "c-title", title: "Как написать заголовок", updated: "22 сентября 2026", views: 41 }
    ] },
    { id: "c2", title: "02. Статистика", items: [
      { id: "c-funnel", title: "Как читать воронку", updated: "30 сентября 2026", views: 27 }
    ] },
    { id: "c3", title: "03. Оплата и бонусы", items: [
      { id: "c-bonus", title: "Рубли и бонусы: что чем оплачивается", updated: "24 сентября 2026", views: 38 },
      { id: "c-docs", title: "Закрывающие документы", updated: "24 сентября 2026", views: 15 }
    ] }
  ]
};
/* Статьи без текста в прототипе — одна и та же рыба, чтобы раздел не
   выглядел пустым при клике */
const KB_FISH = `<p>Статья готовится: текст напишет отдел взаимодействия с партнёрами. Здесь будут пошаговые инструкции, примеры и материалы для скачивания.</p>
  <h2>Что будет в статье</h2><ul><li>Короткое объяснение, зачем это нужно.</li><li>Инструкция по шагам.</li><li>Примеры и частые ошибки.</li></ul>
  ${KB_FILE("Материалы к статье", "PDF", "1,2 МБ")}`;

D.kb = { client: "c-howto", partner: "p-howto" };
D.kbOpen = {};
D.kbQ = "";

const kbAll = () => KB[state.role].flatMap(sec => sec.items.map(it => Object.assign({ sec: sec }, it)));
const kbText = it => (it.title + " " + (it.body || "")).replace(/<[^>]+>/g, " ").toLowerCase();

function kbView() {
  const role = state.role;
  const all = kbAll();
  const cur = all.find(it => it.id === D.kb[role]) || all[0];
  const q = D.kbQ.trim().toLowerCase();
  const hits = q ? all.filter(it => kbText(it).indexOf(q) !== -1) : null;
  const item = it => `<button type="button" class="lkd-kb__it${it.id === cur.id ? " is-on" : ""}" data-kb="${it.id}">${it.title}</button>`;

  const tree = hits
    ? (hits.length
        ? `<div class="lkd-kb__found">Нашлось: ${hits.length}</div>` + hits.map(it => `<button type="button" class="lkd-kb__it lkd-kb__it--hit${it.id === cur.id ? " is-on" : ""}" data-kb="${it.id}">${it.title}<small>${it.sec.title}</small></button>`).join("")
        : `<div class="lkd-kb__found">Ничего не нашлось</div>`)
    : KB[role].map(sec => {
        const open = D.kbOpen[sec.id] !== undefined ? D.kbOpen[sec.id] : sec.items.some(it => it.id === cur.id) || sec === KB[role][0];
        return `<div class="lkd-kb__sec${open ? " is-open" : ""}">
          <button type="button" class="lkd-kb__h" data-kb-sec="${sec.id}" aria-expanded="${open}">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>
            <span>${sec.title}</span></button>
          <div class="lkd-kb__items">${sec.items.map(item).join("")}</div>
        </div>`;
      }).join("");

  return head("База знаний")
    + `<div class="lk-panel lkd-kb">
      <aside class="lkd-kb__side">
        <label class="lkd-kb__search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
          <input type="search" data-kb-q value="${D.kbQ}" placeholder="Поиск по базе" aria-label="Поиск по базе знаний">
        </label>
        <nav class="lkd-kb__tree" aria-label="Статьи">${tree}</nav>
      </aside>
      <article class="lkd-kb__art">
        <span class="lkd-kb__crumb">${cur.sec.title}</span>
        <h2 class="lkd-kb__title">${cur.title}</h2>
        <div class="lkd-kb__meta">Изменён ${cur.updated} · ${ICON.eye18}<span>${cur.views}</span></div>
        <div class="lkd-kb__body">${cur.body || KB_FISH}</div>
      </article>
    </div>`;
}
VIEWS["partner:kb"] = VIEWS["client:kb"] = kbView;

/* Рекламодателю — такой же пункт меню, над «Уведомлениями» */
if (IS_CLIENT) {
  const at = NAV.client.findIndex(x => x.id === "notifications");
  NAV.client.splice(at, 0, { id: "kb", label: "База знаний", icon: "book" });
  TITLES.client.kb = "База знаний";
}

/* Ознакомление с новыми условиями блокирует кабинет. Пока партнёр не
   отметил, что прочитал новое приложение KPI, ничего сделать в кабинете
   нельзя (вечер 24.09 — «как на ВВС»). Закрыть окно нельзя ни крестиком,
   ни Escape, ни кликом мимо. ?terms=show — показать ещё раз. */
function gateAccepted() {
  try { return localStorage.getItem("lkd_kpi_oct") === "1"; } catch (e) { return false; }
}
function showGate() {
  if (IS_CLIENT) return;
  if (P.get("terms") !== "show" && gateAccepted()) return;
  const el = document.createElement("div");
  el.className = "lkd-gate";
  el.innerHTML = `<div class="lkd-gate__box" role="dialog" aria-modal="true" aria-labelledby="lkdGateH">
    <span class="lkd-gate__k">Новые условия</span>
    <h3 id="lkdGateH">Приложение KPI на октябрь 2026</h3>
    <p>С 1 октября действуют новые показатели и процент вознаграждения.
    Приложение действует без подписи, но работать в кабинете можно только
    после ознакомления.</p>
    <a class="lkd-gate__doc" href="#" target="_blank" rel="noopener">${ICON.doc}<span>Приложение KPI · октябрь 2026<small>PDF, 2 страницы</small></span></a>
    <label class="lk-ch lkd-gate__ok"><input type="checkbox" data-gate-check><span>Я ознакомился с приложением KPI на октябрь</span></label>
    <button class="btn btn--solid btn--lg btn--wide" data-gate-go disabled>Продолжить работу</button>
  </div>`;
  document.body.appendChild(el);
  document.body.classList.add("lkd-gated");
  const chk = qs("[data-gate-check]", el);
  const go = qs("[data-gate-go]", el);
  chk.onchange = () => {
    go.disabled = !chk.checked;
    chk.closest(".lk-ch").classList.toggle("is-on", chk.checked);
  };
  go.onclick = () => {
    try { localStorage.setItem("lkd_kpi_oct", "1"); } catch (e) {}
    el.remove();
    document.body.classList.remove("lkd-gated");
    render();
  };
}

/* ==========================================================================
   Обработчики — после каждой перерисовки
   ========================================================================== */
const baseRender = window.render;
window.render = function () {
  baseRender();
  const host = qs("#lkView");

  /* Превью мастера: те же правки, что у карточки в ленте */
  qsa(".lk-prev__stat", host).forEach(s => {
    const ic = qs("[data-icon]", s);
    if (ic && (ic.dataset.icon === "used" || ic.dataset.icon === "copy")) s.remove();
  });

  /* Статистика */
  const per = qs("[data-stat-period]", host);
  if (per) per.onchange = () => { D.period = per.value; render(); };
  const cp = qs("[data-stat-coupon]", host);
  if (cp) cp.onchange = () => { D.coupon = cp.value; render(); };

  /* Биллинг */
  const lf = qs("[data-ledger-from]", host), lt = qs("[data-ledger-to]", host);
  if (lf) lf.onchange = () => { D.ledgerFrom = lf.value; D.ledgerPage = 1; render(); };
  if (lt) lt.onchange = () => { D.ledgerTo = lt.value; D.ledgerPage = 1; render(); };
  const lr = qs("[data-ledger-reset]", host);
  if (lr) lr.onclick = () => { D.ledgerFrom = D.ledgerTo = ""; D.ledgerPage = 1; render(); };
  const lx = qs("[data-ledger-export]", host);
  if (lx) lx.onclick = () => ledgerCSV(ledgerList());
  qsa("[data-way]", host).forEach(b => b.onclick = () => { D.way = b.dataset.way; render(); });

  /* «Редактировать» → поля открыты → «Сохранить» / «Отмена» */
  qsa("[data-edit]", host).forEach(b => b.onclick = () => { D.editing[b.dataset.edit] = true; render(); });
  qsa("[data-edit-cancel]", host).forEach(b => b.onclick = () => { D.editing[b.dataset.editCancel] = false; render(); });
  qsa("[data-edit-save]", host).forEach(b => b.onclick = () => {
    const f = b.dataset.editSave;
    D.editing[f] = false;
    render();
    const ok = qs(`[data-edit-ok="${f}"]`, qs("#lkView"));
    if (ok) { ok.hidden = false; setTimeout(() => { ok.hidden = true; }, 2400); }
  });

  /* Подписка на бота: «открыли» бота → через пару секунд он вернул ник */
  qsa("[data-notify-sub]", host).forEach(b => b.onclick = () => {
    const ch = LK_NOTIFY_CHANNELS.find(c => c.id === b.dataset.notifySub);
    ch.pending = true;
    render();
    setTimeout(() => {
      ch.pending = false;
      ch.value = IS_CLIENT ? "@primer_coffee" : "@partnerov";
      ch.on = true;
      render();
    }, 1800);
  });

  /* Галочка канала уведомлений сохраняется сразу */
  qsa("[data-notify-ch]", host).forEach(cb => cb.addEventListener("change", () => {
    const ch = LK_NOTIFY_CHANNELS.find(c => c.id === cb.dataset.notifyCh);
    if (ch) ch.on = cb.checked;
    const ok = qs("[data-notify-ok]", host);
    if (!ok) return;
    ok.hidden = false;
    clearTimeout(ok._t);
    ok._t = setTimeout(() => { ok.hidden = true; }, 2000);
  }));

  /* Логотип и фирменные цвета */
  const logo = qs("[data-brand-logo]", host);
  if (logo) logo.onchange = () => {
    const file = logo.files && logo.files[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = () => { D.brand.logo = r.result; render(); };
    r.readAsDataURL(file);
  };
  qsa("[data-brand-color]", host).forEach(inp => inp.oninput = () => {
    D.brand.colors[+inp.dataset.brandColor] = inp.value;
    const sw = inp.closest(".lkd-sw");
    sw.style.setProperty("--c", inp.value);
    qs("span", sw).textContent = inp.value.toUpperCase();
  });

  /* Уведомления: «Прочитать все» */
  const ra = qs("[data-read-all]", host);
  if (ra) ra.onclick = () => {
    LK_NOTIFICATIONS[state.role].forEach(n => { n.unread = false; });
    render();
  };

  /* Партнёр: фильтры, сортировка и страницы «Купонов клиентов» */
  const fq = qs("[data-fee-q]", host);
  if (fq) fq.oninput = () => {
    D.fq = fq.value; D.fpage = 1;
    const pos = fq.selectionStart;
    render();
    const again = qs("[data-fee-q]", qs("#lkView"));
    if (again) { again.focus(); again.setSelectionRange(pos, pos); }
  };
  [["data-fee-type", "ftype"], ["data-fee-status", "fstatus"], ["data-fee-from", "ffrom"], ["data-fee-to", "fto"]].forEach(([attr, key]) => {
    const el = qs("[" + attr + "]", host);
    if (el) el.onchange = () => { D[key] = el.value; D.fpage = 1; render(); };
  });
  qsa("[data-fee-sort]", host).forEach(b => b.onclick = () => {
    const k = b.dataset.feeSort;
    D.fdir = D.fsort === k ? -D.fdir : -1;
    D.fsort = k;
    render();
  });

  /* База знаний: статья, раздел, поиск, скачивание материала */
  qsa("[data-kb]", host).forEach(btn => btn.onclick = () => {
    D.kb[state.role] = btn.dataset.kb;
    render();
    const art = qs(".lkd-kb__art", qs("#lkView"));
    if (art && window.innerWidth <= 900) art.scrollIntoView({ block: "start", behavior: "smooth" });
  });
  qsa("[data-kb-sec]", host).forEach(btn => btn.onclick = () => {
    const sec = btn.closest(".lkd-kb__sec");
    D.kbOpen[btn.dataset.kbSec] = !sec.classList.contains("is-open");
    sec.classList.toggle("is-open");
    btn.setAttribute("aria-expanded", sec.classList.contains("is-open"));
  });
  const kq = qs("[data-kb-q]", host);
  if (kq) kq.oninput = () => {
    D.kbQ = kq.value;
    const pos = kq.selectionStart;
    render();
    const again = qs("[data-kb-q]", qs("#lkView"));
    if (again) { again.focus(); again.setSelectionRange(pos, pos); }
  };
  qsa("[data-kb-file]", host).forEach(a => a.onclick = e => {
    e.preventDefault();
    /* В прототипе файла нет — отдаём текстовую заглушку с тем же именем */
    const url = URL.createObjectURL(new Blob(["Материал базы знаний — заглушка прототипа."], { type: "text/plain;charset=utf-8" }));
    const link = Object.assign(document.createElement("a"), { href: url, download: a.dataset.kbFile + ".txt" });
    document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });

  /* Пагинация — одна на все таблицы: номер страницы и «Показывать по» */
  qsa("[data-pg]", host).forEach(nav => {
    const key = nav.dataset.pg;
    qsa("[data-pg-go]", nav).forEach(b => b.onclick = () => {
      if (b.disabled) return;
      PG[key].set(+b.dataset.pgGo);
      render();
      const again = qs('[data-pg="' + key + '"]', qs("#lkView"));
      const top = again && again.closest(".lk-panel");
      if (top && top.getBoundingClientRect().top < 0) top.scrollIntoView({ block: "start", behavior: "smooth" });
    });
    const sel = qs("[data-pg-size]", nav);
    if (sel) sel.onchange = () => { D.pgSize[key] = +sel.value; PG[key].set(1); render(); };
  });

  /* Выплаты: месяц детализации стрелками */
  qsa("[data-pay-month]", host).forEach(b => b.onclick = () => { D.payMonth = +b.dataset.payMonth; render(); });

  /* Профиль партнёра: контактные лица */
  const cAdd = qs("[data-contact-add]", host);
  if (cAdd) cAdd.onclick = () => { D.contactNew = true; render(); const f = qs('[data-c="name"]', qs("#lkView")); if (f) f.focus(); };
  const cCancel = qs("[data-contact-cancel]", host);
  if (cCancel) cCancel.onclick = () => { D.contactNew = false; render(); };
  const cSave = qs("[data-contact-save]", host);
  if (cSave) cSave.onclick = () => {
    const v = k => qs('[data-c="' + k + '"]', host).value.trim();
    const c = { name: v("name"), phone: v("phone"), mail: v("mail") };
    if (!c.name || !c.phone || !c.mail) { qs("[data-contact-err]", host).hidden = false; return; }
    D.contacts.push(c);
    D.contactNew = false;
    render();
  };
  qsa("[data-contact-del]", host).forEach(b => b.onclick = () => { D.contacts.splice(+b.dataset.contactDel, 1); render(); });

  /* Бонусы: поиск клиента по ИНН и «Повторить» */
  const inn = qs("[data-inn]", host);
  if (inn) {
    const out = qs("[data-inn-found]", host);
    const find = () => {
      const v = inn.value.replace(/\D/g, "");
      const id = Object.keys(INN).find(k => INN[k] === v);
      const c = id && clientById(Number(id));
      out.className = "lkd-inn" + (c ? " is-ok" : v.length >= 10 ? " is-bad" : "");
      out.textContent = c ? c.name + " · " + c.city
        : v.length >= 10 ? "Такого клиента в вашем регионе нет" : "";
    };
    inn.oninput = find;
    find();
  }
  qsa("[data-repeat-bonus]", host).forEach(b => b.onclick = () => {
    const [i, a] = b.dataset.repeatBonus.split("|");
    D.prefill = { inn: i, amount: num(Number(a)) };
    render();
    D.prefill = null;
    const form = qs("[data-bonus-form]", qs("#lkView"));
    if (form) form.scrollIntoView({ block: "center", behavior: "smooth" });
  });

  initIcons(host);
};

/* ==========================================================================
   Конструктор купона — правки созвона 28.09.2026
   ==========================================================================
   Разметку конструктора собирает couponForm() в lk.js, поведение —
   initCouponBuilder(). Здесь мы их не переписываем: правим уже собранную
   форму по узлам и вешаем свои обработчики поверх базовых. Ч/Б прототип
   (client.html) этот файл не подключает и остаётся прежним.
   Полный список правок — notes/pravki-2026-09-28.md.
   ========================================================================== */

/* Сроки размещения — от 1 до 28 дней, 30 дней у нас нет (Вилл 28.09).
   Коэффициенты в прежней пропорции: тариф всё равно ещё считают. */
LK_DURATIONS.length = 0;
LK_DURATIONS.push(
  { days: 1,  label: "1 день",  k: 0.4 },
  { days: 3,  label: "3 дня",   k: 1 },
  { days: 7,  label: "7 дней",  k: 2.1 },
  { days: 14, label: "14 дней", k: 3.8 },
  { days: 21, label: "21 день", k: 5.2 },
  { days: 28, label: "28 дней", k: 6.2 });
window.LK_RECOMMENDED_DAYS = 28;

/* Выход из кабинета ведёт на страницу входа, а не на витрину */
window.LKD_LOGOUT = "../login-design.html" + (document.body.dataset.role === "partner" ? "?role=partner" : "");

/* Совет ИИ про срок: тридцати дней больше нет, потолок — 28 (28.09) */
const aiTerm = AI_ANSWERS.find(a => a[0].test("срок"));
if (aiTerm) aiTerm[1] = "Советуем 28 дней: за первую неделю купон только набирает показы в ленте и соцсетях. Короткий срок обычно заканчивается раньше, чем о купоне узнают.";

/* Монеты заменили рублями (28.09): в истории операций тоже «10 000 ₽» */
LK_LEDGER.forEach(r => { r.what = r.what.replace(/Зачислено ([\d\s ]+) монет/, "Пополнение на $1 ₽"); });

/* Тайный покупатель приходит в течение 1–3 дней после публикации (28.09) */
LK_SECRET.days = "1–3 дней";

/* У подарка на купоне стоит слово, а не «0 ₽»: ноль рублей и «подарок» —
   разные вещи, Вилл про это говорил и на публичке (28.09). */
(LK_MECHANICS.find(m => m.id === "gift") || {}).sample = "Подарок";

/* Попытки генерации: показываем лимит, но фактически не ограничиваем —
   «вообще нужно, но не ограничивать их фактически, чтобы они думали, что
   ограничено» (Вилл 28.09). Счётчик в lk.js считает от LK_GEN_LIMIT, а мы
   переписываем его текст под показанный лимит. */
const GEN_SHOWN = 10;
window.LK_GEN_LIMIT = 9999;

/* Величина скидки зависит от механики (28.09): у подарка и «два по цене
   одного» величины нет вовсе, у скидки суммой — своя подсказка про рубли. */
const MECH_VALUE = {
  percent:   { label: "Величина скидки", ph: "−25%" },
  amount:    { label: "Сумма скидки", ph: "−500 ₽", hint: "Напишите, сколько рублей скидки — эта сумма встанет на купон." },
  twoforone: { hide: true, hint: "Величину указывать не нужно: на купоне встанет «2 = 1»." },
  gift:      { hide: true, hint: "Величину указывать не нужно: на купоне встанет «Подарок»." },
  friend:    { label: "Скидка другу", ph: "−15%" }
};

/* «Как воспользоваться» попадает в описание купона: 200 знаков мало,
   чтобы описать акцию, — 1000 (созвон 30.09) */
const USE_MAX = 1000;

const todayISO = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
};

/* «3 сентября 2026» → 2026-09-03 для input[type=date] */
function isoFromRu(s) {
  const m = /^(\d{1,2})\s+(\S+)(?:\s+(\d{4}))?/.exec((s || "").trim());
  if (!m) return "";
  const mon = RU_MONTHS.findIndex(p => m[2].toLowerCase().startsWith(p));
  if (mon < 0) return "";
  const y = m[3] ? +m[3] : new Date().getFullYear();
  return y + "-" + String(mon + 1).padStart(2, "0") + "-" + String(+m[1]).padStart(2, "0");
}

/* Поле и панель ищем по подписи: привязываться к порядку нельзя — он ещё
   поменяется, а подписи держатся от созвона к созвону. */
const fieldByLabel = (form, text) => qsa(".lk-l", form).find(l => {
  const t = qs(".lk-l__t", l);
  return t && t.textContent.trim().indexOf(text) === 0;
});
const panelByTitle = (form, text) => qsa(".lk-panel", form).find(p => {
  const h = qs("h2", p);
  return h && h.textContent.trim() === text;
});

/* -------------------------------------------------------------------------
   Разметка: правим то, что собрал couponForm
   ------------------------------------------------------------------------- */
function patchWizard(form) {
  const isMarket = !!qs('[data-f="article"]', form);

  /* Даты — календарём, он открывается на сегодняшней дате, а не на 2003 году */
  ["from", "to"].forEach(n => {
    const el = qs('[data-f="' + n + '"]', form);
    if (!el) return;
    el.value = isoFromRu(el.value);
    el.type = "date";
    el.min = todayISO();
  });

  /* «Как воспользоваться»: текст по умолчанию, ограничение по знакам и
     пометка, что он попадёт в описание купона */
  const use = fieldByLabel(form, "Как воспользоваться");
  if (use) {
    const ta = qs("textarea", use);
    ta.value = isMarket
      ? "При покупке или добавлении в корзину введите промокод в специальное поле на маркетплейсе."
      : "Покажите код при оплате.";
    if (isMarket) {
      /* У маркетплейса текст один для всех: промокод вводят в корзине */
      ta.readOnly = true;
      use.insertAdjacentHTML("afterend", '<div class="lk-note lkd-usenote">Текст одинаковый для всех купонов маркетплейса, менять его не нужно.</div>');
    } else {
      ta.maxLength = USE_MAX;
      ta.setAttribute("data-use-text", "1");
      use.insertAdjacentHTML("afterend", '<div class="lk-note lkd-usenote">Текст попадёт в описание купона — его увидят посетители. Осталось <b data-use-left>' + USE_MAX + '</b> знаков.</div>');
    }
  }

  /* Города и адреса — двумя блоками: где разместить купон и где его
     применяют. Одним блоком читалось тяжело и путало. */
  const cityPanel = panelByTitle(form, "Города и адреса");
  if (cityPanel) {
    qs("h2", cityPanel).textContent = "Города размещения";
    const chips = qs(".lk-chips", cityPanel);
    if (chips) {
      chips.insertAdjacentHTML("beforebegin", '<label class="lk-l lkd-citysearch"><span class="lk-l__t">Где разместить</span><input class="lk-i" type="search" placeholder="Начните вводить город" data-city-search></label>');
      chips.insertAdjacentHTML("afterend", '<div class="lkd-citysum" data-city-sum></div>');
    }
    const addr = qs(".lk-addr", cityPanel);
    if (addr) {
      const head = qs(".lk-l__t", addr);
      if (head) head.remove();   /* было подписью внутри, стало заголовком панели */
      const p = document.createElement("div");
      p.className = "lk-panel";
      p.innerHTML = '<div class="lk-panel__head"><h2>Адреса применения купона</h2></div>';
      p.appendChild(addr);
      cityPanel.after(p);
      /* Вариант «без адреса»: услуги по всему городу, офиса нет */
      const list = qs("[data-addr-list]", p);
      if (list) list.insertAdjacentHTML("afterbegin", '<label class="lk-ch lkd-noaddr" data-addr-row data-addr-city=""><input type="checkbox" data-addr-cb data-noaddr value="Без адреса"><span>Адреса нет — услуги оказываются по всему городу или онлайн</span></label>');
    }
  }

  /* ERID — вопросик с пояснением: маркировку присваиваем мы */
  const erid = fieldByLabel(form, "ERID");
  if (erid) {
    const tip = "По закону купон — это реклама, её нужно маркировать. Маркировку (erid) присвоим мы сами при публикации: от вас ничего не требуется, и ваша реклама будет законной.";
    qs(".lk-l__t", erid).insertAdjacentHTML("beforeend",
      ' <span class="lkd-tip" tabindex="0" aria-label="' + tip + '">' + ICON.q + '<span class="lkd-tip__b" role="tooltip">' + tip + '</span></span>');
  }

  const comp = panelByTitle(form, "Компания в купоне");
  if (comp) {
    const note = qs(".lk-note", comp);
    if (note) note.textContent = "Сайт, соцсети и контакты подставили из профиля компании — для этого купона их можно поправить.";
  }

  /* Каналы публикации. Текст временный: продающий вариант пишет Коля. */
  const chan = panelByTitle(form, "Каналы публикации");
  if (chan) {
    const note = qs(".lk-note", chan);
    if (note) note.textContent = isMarket
      ? "Купон уйдёт в наши группы по маркетплейсам — это вся Россия сразу. Макеты соберём сами, от вас ничего не требуется."
      : "Купон уйдёт в наши группы выбранных городов — там его увидят люди, которые уже ищут, где купить. Макеты соберём сами: один под сайт, один для ВКонтакте и Одноклассников, один для Telegram и Max.";
  }

  /* Тайный покупатель: новый текст и рекламное оформление — это раздел
     дополнительной монетизации, он не должен выглядеть как каталог */
  const secret = qs(".lk-secret", form);
  if (secret) {
    secret.classList.add("lkd-secret");
    /* Шар из логотипа — тот же, что у красного рекламного блока на главной */
    secret.insertAdjacentHTML("afterbegin", '<img class="lkd-secret__balloon" src="../assets/brand/logo-white.png" alt="" width="357" height="600" aria-hidden="true">');
    /* «Добавить проверку» — кнопкой, а не галочкой (созвон 30.09): галочка
       на красном терялась, а белая плашка «✓ Проверено» в углу читалась
       так, будто проверка уже включена. Плашку убираем, чекбокс остаётся
       внутри кнопки — на нём держится расчёт цены. */
    const badge = qs(".lk-secret__badge", secret);
    if (badge) badge.remove();
    const cb = qs('[data-f="secret"]', secret);
    const lbl = cb && cb.closest(".lk-ch");
    if (lbl) {
      lbl.classList.add("lkd-secret-add");
      qs("span", lbl).innerHTML = '<b data-secret-t>Добавить проверку</b>';
    }
    const list = qs(".lk-secret__list", secret);
    if (list) list.innerHTML = (isMarket
      ? ["К вам на страницу товара зайдёт живой человек и применит промокод, как обычный покупатель",
         "Покупать товар он не будет — только проверит, что промокод работает",
         "Проверка пройдёт в течение 1–3 дней после публикации",
         "После проверки на купоне появится бейдж «Проверено тайным покупателем»"]
      : ["К вам придёт живой человек и воспользуется купоном, как обычный гость",
         "Проверка пройдёт в течение 1–3 дней после публикации",
         "После проверки на купоне появится бейдж «Проверено тайным покупателем»"]
    ).map(t => "<li>" + t + "</li>").join("");
  }

  /* Изображение: слово «промпт» понимают не все */
  const prompt = fieldByLabel(form, "Промпт");
  if (prompt) qs(".lk-l__t", prompt).textContent = "Опишите, как должно выглядеть изображение";
  const genPane = qs('[data-img-pane="gen"]', form);
  if (genPane) {
    const note = qs(".lk-note", genPane);
    if (note) note.textContent = "Описание собрали из ниши, предложения и городов — поправьте его, если нужно. На один купон " + GEN_SHOWN + " попыток, каждая занимает несколько секунд. Понравившийся вариант выберите кликом.";
  }

  /* Монеты меняем на рубли (28.09) */
  const pay = qs("#lkPay", form);
  if (pay) {
    const ends = qs(".lk-pay__ends span", pay);
    if (ends) ends.textContent = "Рублями";
    const hint = qs("[data-pay-hint]", pay);
    if (hint) hint.textContent = "Бонусами пока не платите — доступно " + num(LK_BALANCE.bonuses) + ". Перетащите ползунок вправо, чтобы часть суммы списалась ими.";
    const note = pay.parentElement && qs(".lk-note", pay.parentElement);
    if (note) note.textContent = "Хотя бы один рубль в каждой публикации уходит реальными деньгами — бонусами закрыть размещение целиком нельзя. Списанные бонусы не возвращаются.";
  }

  /* Прогресс и цена — закреплённой строкой под превью: в длинной форме
     цена уходила за экран, а она влияет на решение (28.09) */
  const prev = qs(".lk-prev", form);
  if (prev && qs("[data-prog-n]", form)) {
    prev.insertAdjacentHTML("beforeend", '<div class="lkd-wizbar" data-wiz-bar>' +
      '<div class="lkd-wizbar__l"><span>Купон заполнен</span><b data-bar-pct>0%</b>' +
      '<div class="lkd-wizbar__bar"><i data-bar-fill></i></div></div>' +
      '<div class="lkd-wizbar__r"><span>Итого</span><b data-bar-total>—</b></div></div>');
  }

  if (window.LKD_MODE === "marketplace") patchMarketplace(form);
  if (window.LKD_MODE === "for-business") patchBusiness(form);
  if (window.LKD_MODE === "regional" && cityPanel) stageCities(cityPanel);
}

/* -------------------------------------------------------------------------
   Города размещения — ступенями, от крупного к мелкому (созвон 30.09)
   -------------------------------------------------------------------------
   «Я хочу разместиться в Ульяновской области, я не знаю, какие там города».
   Сначала область, по клику — её города плиткой; «Все города области» и
   «Во всех регионах присутствия» — одним нажатием, без ввода. Поиск по
   городу остаётся для тех, кто знает, что ищет. Для MVP работает только
   Липецкая область: остальные раскрываются, но города в них «скоро» —
   так видно, как механика заработает, когда регионы подключат. */
const GEO_SOON = [
  { name: "Тамбовская область",  cities: ["Тамбов", "Мичуринск", "Котовск", "Моршанск", "Рассказово"] },
  { name: "Воронежская область", cities: ["Воронеж", "Россошь", "Борисоглебск", "Лиски"] },
  { name: "Орловская область",   cities: ["Орёл", "Ливны", "Мценск"] },
  { name: "Курская область",     cities: ["Курск", "Железногорск", "Курчатов"] }
];
const plural = (n, one, few, many) =>
  n % 10 === 1 && n % 100 !== 11 ? one : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? few : many;

function stageCities(cityPanel) {
  const chips = qs(".lk-chips", cityPanel);
  if (!chips) return;
  const caret = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
  const head = (name, n, soon) => '<button type="button" class="lkd-geo__head" data-geo-toggle aria-expanded="' + !soon + '">' +
    '<b>' + name + '</b><span>' + n + " " + plural(n, "город", "города", "городов") + (soon ? " · скоро" : "") + '</span>' + caret + '</button>';

  const geo = document.createElement("div");
  geo.className = "lkd-geo";
  geo.innerHTML =
    '<div class="lkd-geo__reg is-open" data-geo-reg>' + head("Липецкая область", LK_CITIES.length, false) +
      '<div class="lkd-geo__body" data-geo-body></div></div>' +
    GEO_SOON.map(r => '<div class="lkd-geo__reg is-soon" data-geo-reg>' + head(r.name, r.cities.length, true) +
      '<div class="lkd-geo__body"><div class="lk-chips">' +
      r.cities.map(c => '<span class="lk-chipbtn lkd-geo__soon" data-geo-city="' + c + '">' + c + '</span>').join("") +
      '</div><div class="lk-note">Область подключим после Липецкой — сообщим в уведомлениях.</div></div></div>').join("") +
    '<button type="button" class="btn btn--ghost lkd-geo__every" data-geo-every>Во всех регионах присутствия</button>';

  chips.before(geo);
  const body = qs("[data-geo-body]", geo);
  body.appendChild(chips);
  body.insertAdjacentHTML("beforeend", '<button type="button" class="lkd-geo__all" data-geo-all>Все города области</button>');

  /* Плашка «Купон появится в каталоге каждого города…» писала про
     «города других областей по мере запуска» — теперь это видно в списке */
  const note = qsa(".lk-note", cityPanel).find(n => !n.closest(".lkd-geo"));
  if (note) note.textContent = "Купон появится в каталоге каждого выбранного города и уйдёт в его соцсети. Каждый город добавляет к цене размещения.";
}

/* Поведение ступенчатого выбора — после того, как lk.js повесил клики на
   плитки городов: жмём по ним же, чтобы расчёт и правило «хотя бы один
   город» работали как при ручном выборе. */
function geoExtras(form) {
  const geo = qs(".lkd-geo", form);
  if (!geo) return;
  const clickAll = scope => qsa("[data-city]", scope).forEach(b => { if (!b.classList.contains("is-on")) b.click(); });
  geo.addEventListener("click", e => {
    const t = e.target.closest("[data-geo-toggle]");
    if (t) {
      const reg = t.closest("[data-geo-reg]");
      reg.classList.toggle("is-open");
      t.setAttribute("aria-expanded", reg.classList.contains("is-open"));
      return;
    }
    if (e.target.closest("[data-geo-all]")) clickAll(e.target.closest("[data-geo-reg]"));
    if (e.target.closest("[data-geo-every]")) clickAll(geo);
  });
}

/* -------------------------------------------------------------------------
   Купон маркетплейса (28.09): один товар, одна механика, вся Россия
   ------------------------------------------------------------------------- */
const MP_PRICE = 10000;          /* размещение на всю Россию, город в цене не участвует */
const MP_SECRET_PRICE = 1000;    /* проверить промокод — дело двух секунд */
const PARTNER_DISCOUNT = 0.2;
const PARTNER_CODES = { ok: ["PRTLIP01", "PRTELT02"], revoked: ["PRTOLD09"] };

function patchMarketplace(form) {
  /* Ссылка на карточку и артефакт — оба обязательны: под одним артикулом
     на WB и Ozon бывают разные товары, проверяем по двум признакам */
  const link = fieldByLabel(form, "Ссылка на карточку товара");
  if (link) {
    const inp = qs("input", link);
    inp.setAttribute("data-f", "link");
    qs(".lk-l__t", link).textContent = "Ссылка на карточку товара (обязательно)";
    link.insertAdjacentHTML("afterend", '<div class="lk-note">Проверяем товар дважды — по ссылке и по артикулу: на Wildberries и Ozon под одним артикулом бывают разные товары. Картинку возьмём из карточки товара и обрежем под формат купона, генерировать её не нужно.</div>');
  }
  const art = fieldByLabel(form, "Артикул товара");
  if (art) qs(".lk-l__t", art).textContent = "Артикул товара (обязательно)";

  /* Заголовок: без вариантов от нейросети, подсказка прямо в поле */
  const ai = qs("[data-ai-titles]", form);
  if (ai) ai.remove();
  const title = qs('[data-f="title"]', form);
  if (title) title.placeholder = "Скидка на ваш товар по промокоду";

  /* Механика одна — скидка в процентах. Кнопки «Выбрать» нет. */
  const mech = qs('[data-f="mech"]', form);
  if (mech) {
    mech.innerHTML = "<option>Скидка в процентах</option>";
    mech.disabled = true;
  }
  const tip = qs("[data-tip-mech]", form);
  if (tip) tip.replaceWith(Object.assign(document.createElement("div"), {
    className: "lk-note lkd-mechhint",
    textContent: "На маркетплейсе работает одна механика — скидка в процентах. Чем глубже скидка, тем больше трафик."
  }));

  /* Города размещения убираем совсем: публикация идёт в федеральные группы
     по площадкам, город в расчёте не участвует */
  const cityPanel = panelByTitle(form, "Города размещения");
  if (cityPanel) cityPanel.remove();
  /* Каналы (созвон 30.09): площадка выбрана сверху, купон не может идти
     на две сразу, поэтому каналы строятся под неё. В каждой соцсети у нас
     две федеральные группы — общая «Маркетплейсы» и группа площадки, —
     и они идут одним лотом: плашек четыре, как у остальных купонов, и
     понижающая механика цены остаётся одной на все разделы. */
  const chan = panelByTitle(form, "Каналы публикации");
  if (chan) {
    const box = qs("[data-channels]", chan);
    const market = (qs('[data-f="market"]', form) || {}).value || LK_MARKETS[0];
    if (box) box.innerHTML = LK_CHANNELS.map(ch => ch.fixed
      ? '<label class="lk-ch is-on is-fixed"><input type="checkbox" checked disabled><span>' + ch.label + '</span><i>входит всегда</i></label>'
      : '<label class="lk-ch is-on lkd-mpch"><input type="checkbox" data-ch="' + ch.id + '" checked>' +
        '<span>' + ch.label + '<small data-mp-pair>Маркетплейсы + ' + market + '</small></span><i data-reach="' + ch.id + '"></i></label>').join("");
    const msg = qs("[data-reach-msg]", chan);
    if (msg) msg.remove();
    const note = qs(".lk-note", chan);
    if (note) note.textContent = "В каждой соцсети купон уйдёт сразу в две наши федеральные группы: общую по маркетплейсам и группу выбранной площадки. Размещение — на всю Россию, город в цене не участвует. Макеты соберём сами.";
  }

  /* Сайт — магазин, соцсети пусть заполняет */
  const site = fieldByLabel(form, "Сайт");
  if (site) {
    qs(".lk-l__t", site).textContent = "Сайт магазина";
    qs("input", site).placeholder = "Впишите ссылку на ваш магазин";
  }

  /* Тайный покупатель: цена за проверку, а не за город */
  const secretNote = qs(".lkd-secret > .lk-note", form);
  if (secretNote) secretNote.textContent = rub(MP_SECRET_PRICE) + " за проверку: промокод проверить дело двух секунд.";

  /* Изображение не генерируем — блок уходит, на его месте промокод партнёра */
  const imgP = qs("[data-img]", form) && qs("[data-img]", form).closest(".lk-panel");
  const oldPartner = panelByTitle(form, "Промокод партнёра");
  if (oldPartner) oldPartner.remove();
  const promo = document.createElement("div");
  promo.className = "lk-panel lkd-promo";
  promo.innerHTML = '<div class="lk-panel__head"><h2>Промокод партнёра</h2></div>' +
    '<div class="lk-f">' +
    '<div class="lk-note">Найдите партнёра, у которого есть промокод, либо введите код, который вам известен. Он даёт ' + Math.round(PARTNER_DISCOUNT * 100) + '% скидки на размещение неограниченное количество раз.</div>' +
    '<div class="lkd-promo__row"><input class="lk-i" id="lkdPartnerCode" data-partner-code maxlength="8" autocomplete="off" placeholder="Код партнёра, 8 символов"><button type="button" class="btn btn--solid lkd-promo__btn" data-promo-apply>Применить</button></div>' +
    '<div class="lkd-promo__msg" data-promo-msg role="status" aria-live="polite"></div>' +
    '</div>';
  if (imgP) { imgP.before(promo); imgP.hidden = true; imgP.classList.add("lkd-off"); }

  const hold = qs(".lk-prev__hold", form);
  if (hold) hold.textContent = "Картинку возьмём из карточки товара";

  const lbl = qs(".lkd-wizbar__r span", form);
  const calcRows = qsa(".lk-calc__row span", form);
  if (calcRows[0]) calcRows[0].textContent = "Размещение на всю Россию";
  if (calcRows[1]) calcRows[1].textContent = "Федеральные группы";

  /* Подтверждение перед отправкой */
  const acts = qs(".lk-head__act", form);
  if (acts) acts.insertAdjacentHTML("beforebegin",
    '<label class="lk-ch lkd-confirm" data-confirm-box><input type="checkbox" id="lkdConfirm" data-confirm><span>Подтверждаю, что условия акции и ссылки указаны верно</span></label>');
}

/* -------------------------------------------------------------------------
   Купон для бизнеса (28.09): регионы вместо городов, без адресов
   ------------------------------------------------------------------------- */
const LK_REGIONS = [
  { name: "Липецкая область",   k: 1 },
  { name: "Тамбовская область", k: 0.8 },
  { name: "Воронежская область", k: 1.3 },
  { name: "Орловская область",  k: 0.7 },
  { name: "Курская область",    k: 0.7 },
  { name: "Москва и область",   k: 2.5 },
  { name: "Вся Россия",         k: 5 }
];
const ALL_RUSSIA = "Вся Россия";

function patchBusiness(form) {
  /* Заголовок без вариантов от нейросети: для B2B они не подходят */
  const ai = qs("[data-ai-titles]", form);
  if (ai) ai.remove();

  /* Регионы вместо городов: укрупняем до области, плюс «Вся Россия».
     Кнопки остаются data-city — на них завязан расчёт и итог. */
  const panel = panelByTitle(form, "Города размещения");
  if (panel) {
    qs("h2", panel).textContent = "Регионы размещения";
    const chips = qs(".lk-chips", panel);
    if (chips) chips.innerHTML = LK_REGIONS.map((r, i) =>
      '<button type="button" class="lk-chipbtn' + (i === 0 ? " is-on" : "") + '" data-city="' + r.name + '">' + r.name + '</button>').join("");
    const s = qs("[data-city-search]", panel);
    if (s) {
      s.placeholder = "Начните вводить область";
      qs(".lk-l__t", s.closest("label")).textContent = "Где разместить";
    }
    const note = qs(".lk-note", panel);
    if (note) note.textContent = "Бизнесу ехать из соседнего района не проблема, поэтому размещаем по областям, а в соцсетях показываем в разделе области. Город остаётся только фильтром на сайте.";
  }

  /* Адреса и точки не нужны: адрес компании подтянется из профиля */
  const addr = panelByTitle(form, "Адреса применения купона");
  if (addr) addr.remove();

  /* Компания: email и телефон подтянутся сами, свои можно добавить */
  const comp = panelByTitle(form, "Компания в купоне");
  if (comp) {
    const note = qs(".lk-note", comp);
    if (note) note.textContent = "Адрес, сайт, соцсети, почту и телефон подставили из профиля компании. Если нужно, добавьте свои контакты: например, другой телефон и почту на конкретного сотрудника.";
    const f = qs(".lk-f", comp);
    const row = document.createElement("div");
    row.className = "lk-f__row";
    row.innerHTML = '<label class="lk-l"><span class="lk-l__t">Дополнительный телефон</span><input class="lk-i" id="lkdExtraPhone" type="tel" placeholder="+7 900 000-00-00"></label>' +
      '<label class="lk-l"><span class="lk-l__t">Дополнительная почта</span><input class="lk-i" id="lkdExtraMail" type="email" placeholder="sales@company.ru"></label>';
    if (f && note) note.before(row); else if (f) f.appendChild(row);
  }

  const chan = panelByTitle(form, "Каналы публикации");
  if (chan) {
    const note = qs(".lk-note", chan);
    if (note) note.textContent = "Купон уйдёт в наши группы выбранных областей. Макеты соберём сами: один под сайт, один для ВКонтакте и Одноклассников, один для Telegram и Max.";
  }

  const rows = qsa(".lk-calc__row span", form);
  if (rows[0]) rows[0].textContent = "Ниша, регионы и срок";
  const secretNote = qs(".lkd-secret > .lk-note", form);
  if (secretNote) secretNote.textContent = rub(LK_SECRET.price) + " за каждый регион размещения.";
}

/* -------------------------------------------------------------------------
   Поведение: свои обработчики поверх базовых
   ------------------------------------------------------------------------- */
function wizardExtras(form) {
  const f = n => qs('[data-f="' + n + '"]', form);

  /* Величина — по механике */
  const valInput = f("value");
  const mechSel = f("mech");
  if (valInput && mechSel) {
    const valField = valInput.closest(".lk-l");
    const row = valField.closest(".lk-f__row") || valField;
    const hint = document.createElement("div");
    hint.className = "lk-note lkd-mechhint";
    row.after(hint);
    const paint = () => {
      const m = LK_MECHANICS.find(x => x.label === mechSel.value) || LK_MECHANICS[0];
      const cfg = MECH_VALUE[m.id] || {};
      hint.textContent = cfg.hint || "";
      hint.hidden = !cfg.hint;
      /* Поле остаётся на месте: рядом с механикой, в одну строку, как у
         остальных пар. У подарка и «2 = 1» оно просто закрыто, а образец
         на нём подсказывает, что встанет на купоне. */
      valInput.disabled = !!cfg.hide;
      valField.classList.toggle("lkd-locked", !!cfg.hide);
      qs(".lk-l__t", valField).textContent = cfg.hide ? "Величина скидки" : (cfg.label || "Величина");
      if (cfg.hide) {
        valInput.dataset.auto = "1";
        if (valInput.value !== m.sample) {
          valInput.value = m.sample;
          valInput.dispatchEvent(new Event("input", { bubbles: true }));
        }
      } else {
        /* Вернулись к механике с величиной: образец от прошлой механики
           («Подарок», «2 = 1») с поля убираем */
        if (valInput.dataset.auto) {
          delete valInput.dataset.auto;
          valInput.value = "";
          valInput.dispatchEvent(new Event("input", { bubbles: true }));
        }
        valInput.placeholder = cfg.ph || m.sample;
      }
    };
    mechSel.addEventListener("change", paint);
    paint();
  }

  /* Маркетплейс: сменили площадку — группы в каналах следом */
  const mkSel = f("market");
  if (mkSel && qs("[data-mp-pair]", form)) mkSel.addEventListener("change", () => {
    qsa("[data-mp-pair]", form).forEach(s => { s.textContent = "Маркетплейсы + " + mkSel.value; });
  });

  /* Пересчёт цены: базовый recalc вешается на смену срока, дёргаем её */
  const reprice = () => {
    const d = f("days");
    if (d) d.dispatchEvent(new Event("change", { bubbles: true }));
  };

  /* B2B: «Вся Россия» исключает области — отметить страну и часть областей
     сразу нельзя. Хотя бы один регион остаётся выбранным. */
  if (window.LKD_MODE === "for-business") {
    const all = qs('[data-city="' + ALL_RUSSIA + '"]', form);
    /* Кнопки переключает lk.js уже после нас, поэтому смотрим на итог клика
       и правим его следом */
    form.addEventListener("click", e => {
      const b = e.target.closest("[data-city]");
      if (!b || !all) return;
      setTimeout(() => {
        if (!b.classList.contains("is-on")) return;
        if (b === all) qsa("[data-city]", form).forEach(x => { if (x !== all) x.classList.remove("is-on"); });
        else all.classList.remove("is-on");
        reprice();
        form.dispatchEvent(new Event("input", { bubbles: true }));
      }, 0);
    });
  }

  /* Плашка выгоды на купоне вмещает около 10 знаков: «бесплатно» (9 букв)
     помещается, а «0 рублей» — не то же самое (28.09) */
  if (valInput && !valInput.disabled) valInput.maxLength = 10;
  if (valInput) {
    const vf = valInput.closest(".lk-l");
    if (vf && !qs(".lkd-vallen", vf)) vf.insertAdjacentHTML("beforeend", '<span class="lk-note lkd-vallen">До 10 знаков: «бесплатно» помещается.</span>');
  }

  /* Поиск по городам и итог «купон будет размещён в …» */
  const search = qs("[data-city-search]", form);
  const chips = qsa("[data-city]", form);
  if (search) search.addEventListener("input", () => {
    const q = search.value.trim().toLowerCase();
    chips.forEach(b => { b.hidden = !!q && b.dataset.city.toLowerCase().indexOf(q) === -1; });
    /* Ступенчатый выбор: города «скоро» ищутся тоже, а область, где
       нашёлся город, раскрывается сама */
    qsa("[data-geo-city]", form).forEach(b => { b.hidden = !!q && b.dataset.geoCity.toLowerCase().indexOf(q) === -1; });
    if (q) qsa("[data-geo-reg]", form).forEach(r => {
      const hit = qsa("[data-city],[data-geo-city]", r).some(b => !b.hidden);
      r.classList.toggle("is-open", hit);
      r.hidden = !hit;
    });
    else qsa("[data-geo-reg]", form).forEach(r => { r.hidden = false; });
  });
  geoExtras(form);

  const sum = qs("[data-city-sum]", form);
  const noAddr = qs("[data-noaddr]", form);
  const noAddrRow = noAddr && noAddr.closest("[data-addr-row]");
  const paintCities = () => {
    const on = qsa("[data-city].is-on", form).map(b => b.dataset.city);
    /* У каждого выбранного города — крестик (созвон 30.09): «не хватает
       интуитивного, чтобы закрыть, что этот город не нужен». Последний
       город не снимается — купону нужен хотя бы один. */
    if (sum) sum.innerHTML = !on.length ? "<i>Выберите хотя бы один город</i>"
      : qs(".lkd-geo", form)
        ? '<span>Ваш купон будет размещён в:</span> ' + on.map(c => '<span class="lkd-picked">' + c +
            (on.length > 1 ? '<button type="button" data-city-x="' + c + '" aria-label="Убрать ' + c + '">×</button>' : "") + '</span>').join("")
        : "Ваш купон будет размещён в: <b>" + on.join(", ") + "</b>";
    /* lk.js прячет адреса невыбранных городов; вариант «без адреса» к
       городу не привязан, поэтому держим на нём первый выбранный */
    if (noAddrRow) noAddrRow.dataset.addrCity = on[0] || "";
  };
  if (sum) {
    sum.addEventListener("click", e => {
      const x = e.target.closest("[data-city-x]");
      const chip = x && qsa("[data-city]", form).find(b => b.dataset.city === x.dataset.cityX);
      if (chip) chip.click();
    });
    form.addEventListener("click", e => {
      if (!e.target.closest("[data-city]")) return;
      setTimeout(() => { paintCities(); form.dispatchEvent(new Event("input", { bubbles: true })); });
    });
    paintCities();
  }

  if (noAddr) noAddr.addEventListener("change", () => {
    if (noAddr.checked) qsa("[data-addr-cb]", form).forEach(i => {
      if (i === noAddr) return;
      i.checked = false;
      i.closest(".lk-ch").classList.remove("is-on");
    });
    qsa("[data-addr-row]", form).forEach(r => {
      if (r !== noAddrRow) r.classList.toggle("lkd-off", noAddr.checked);
    });
    form.dispatchEvent(new Event("input", { bubbles: true }));
  });

  /* Промокод партнёра (маркетплейс): «Применить», цена пересчитывается
     на глазах, отозванный код объясняет, что делать дальше */
  const promoBtn = qs("[data-promo-apply]", form);
  if (promoBtn) {
    const pin = qs("[data-partner-code]", form);
    const msg = qs("[data-promo-msg]", form);
    const total = qs('[data-calc="total"]', form);
    const say = (on, text, cls) => {
      partnerOn = on;
      msg.textContent = text;
      msg.className = "lkd-promo__msg " + cls;
      reprice();
      if (total && on) {
        total.classList.remove("lkd-flash");
        void total.offsetWidth;
        total.classList.add("lkd-flash");
      }
    };
    msg.textContent = "Для примера в прототипе: PRTLIP01 действует, PRTOLD09 отозван.";
    msg.className = "lkd-promo__msg is-hint";
    promoBtn.onclick = () => {
      const code = pin.value.trim().toUpperCase();
      if (!code) return say(false, "Введите код партнёра.", "is-bad");
      if (PARTNER_CODES.revoked.indexOf(code) !== -1) return say(false, "Промокод больше не актуален, найдите новый.", "is-bad");
      if (PARTNER_CODES.ok.indexOf(code) !== -1) return say(true, "Код применён: скидка " + Math.round(PARTNER_DISCOUNT * 100) + "% на размещение.", "is-ok");
      say(false, "Такого кода нет. Проверьте, что он введён без ошибок.", "is-bad");
    };
    pin.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); promoBtn.click(); } });
    pin.addEventListener("input", () => {
      if (!partnerOn) return;
      partnerOn = false;
      msg.textContent = "";
      msg.className = "lkd-promo__msg";
      reprice();
    });
  }

  /* Счётчик знаков в «как воспользоваться» */
  const ta = qs("[data-use-text]", form);
  const left = qs("[data-use-left]", form);
  if (ta && left) {
    const paint = () => { left.textContent = USE_MAX - ta.value.length; };
    ta.addEventListener("input", paint);
    paint();
  }

  /* Закреплённая строка: прогресс и итог берём из тех же узлов, что
     считает lk.js, — второго расчёта в прототипе быть не должно */
  const pct = qs("[data-prog-n]", form);
  const bar = qs("[data-prog-bar]", form);
  const total = qs('[data-calc="total"]', form);
  const bPct = qs("[data-bar-pct]", form);
  if (bPct && pct) {
    const bFill = qs("[data-bar-fill]", form);
    const bTot = qs("[data-bar-total]", form);
    const paint = () => {
      bPct.textContent = pct.textContent;
      bFill.style.width = bar.style.width;
      if (total) bTot.textContent = total.textContent;
    };
    const mo = new MutationObserver(paint);
    mo.observe(pct, { childList: true, characterData: true, subtree: true });
    mo.observe(bar, { attributes: true, attributeFilter: ["style"] });
    if (total) mo.observe(total, { childList: true, characterData: true, subtree: true });
    paint();
  }

  /* Бейдж «Проверено» на превью купона: появляется, когда отмечен тайный
     покупатель, — над плашкой выгоды, с наклоном, как будет на публичке */
  const secretCb = qs('[data-f="secret"]', form);
  const secretBtn = secretCb && secretCb.closest(".lkd-secret-add");
  if (secretBtn) {
    const t = qs("[data-secret-t]", secretBtn);
    const paintBtn = () => {
      secretBtn.classList.toggle("is-added", secretCb.checked);
      t.textContent = secretCb.checked ? "Проверка добавлена" : "Добавить проверку";
    };
    secretCb.addEventListener("change", paintBtn);
    paintBtn();
  }
  const pvMedia = qs("[data-pv-media]", form);
  if (secretCb && pvMedia) {
    pvMedia.insertAdjacentHTML("beforeend", '<span class="lkd-verified" data-pv-verified hidden><i aria-hidden="true"><svg viewBox="0 0 12 12" width="60%" height="60%" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 6.2 5 8.6 9.5 3.6"/></svg></i><span class="lkd-verified__t">Проверено</span></span>');
    const badge = qs("[data-pv-verified]", pvMedia);
    const val = qs("#pvVal", pvMedia);
    /* Как на публичке: справа от плашки выгоды, той же высоты; не
       помещается — одна галочка */
    const paint = () => {
      badge.hidden = !secretCb.checked;
      if (badge.hidden || !val) return;
      const h = val.offsetHeight;
      badge.classList.remove("is-compact");
      badge.style.height = h + "px";
      badge.style.bottom = (pvMedia.clientHeight - val.offsetTop - h) + "px";
      badge.style.left = (val.offsetLeft + val.offsetWidth + 6) + "px";
      if (val.offsetLeft + val.offsetWidth + 6 + badge.offsetWidth > pvMedia.clientWidth - 12) badge.classList.add("is-compact");
    };
    secretCb.addEventListener("change", paint);
    form.addEventListener("input", () => requestAnimationFrame(paint));
    form.addEventListener("change", () => requestAnimationFrame(paint));
    window.addEventListener("resize", paint);
    paint();
  }

  /* Строка прогресса и цены приколота к низу окна под колонкой превью:
     положение берём у колонки и обновляем при прокрутке и смене размера */
  const wbar = qs("[data-wiz-bar]", form);
  const wprev = qs(".lk-prev", form);
  if (wbar && wprev) {
    const place = () => {
      if (window.innerWidth <= 1000) { wbar.style.left = wbar.style.width = ""; return; }
      const r = wprev.getBoundingClientRect();
      wbar.style.left = Math.round(r.left) + "px";
      wbar.style.width = Math.round(r.width - 6) + "px";
    };
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, { passive: true });
    place();
    setTimeout(place, 300);
  }

  /* Счётчик генераций под показанный лимит */
  const genLeft = qs("[data-img-left]", form);
  if (genLeft) {
    const fix = () => {
      const m = /(\d+)\s+из\s+(\d+)/.exec(genLeft.textContent);
      if (!m || +m[2] === GEN_SHOWN) return;
      const used = +m[2] - +m[1];
      genLeft.textContent = "Осталось " + Math.max(0, GEN_SHOWN - used) + " из " + GEN_SHOWN;
    };
    new MutationObserver(fix).observe(genLeft, { childList: true, characterData: true, subtree: true });
    fix();   /* первый текст lk.js поставил до того, как мы подписались */
  }

  /* Что происходит после отправки на модерацию (28.09) */
  const acts = qs(".lk-head__act", form);
  if (acts) {
    const mail = (LK_NOTIFY_CHANNELS.find(c => c.id === "email") || {}).value || "почту из профиля";
    const btns = qsa(".btn", acts);
    const close = '<div class="lk-head__act" style="margin:12px 0 0"><button class="btn btn--solid" data-modal-close>Понятно</button></div>';
    if (btns[0]) btns[0].onclick = () => openModal('<h3>Черновик сохранён</h3>' +
      '<p class="lk-modal__lead">Купон лежит в «Моих купонах» со статусом «Черновик» — вернитесь к нему в любой момент.</p>' + close);
    if (btns[1]) btns[1].onclick = () => {
      const cf = qs("[data-confirm]", form);
      if (cf && !cf.checked) {
        const box = qs("[data-confirm-box]", form);
        box.classList.remove("is-warn");
        void box.offsetWidth;
        box.classList.add("is-warn");
        box.scrollIntoView({ block: "center", behavior: "smooth" });
        return;
      }
      openModal('<h3>Купон отправлен на модерацию</h3>' +
      '<p class="lk-modal__lead">Если мы не найдём нарушений, купон будет опубликован в течение 2 часов. Если найдём — вернём на доработку с комментарием, что поправить.</p>' +
      '<p class="lk-modal__lead">Следите за статусом в «Моих купонах»: уведомление придёт в колокольчик и на почту ' + mail + '.</p>' + close);
    };
  }
}

/* Режим конструктора: какой из трёх разделов сейчас открыт. lk.js читает
   window.LKD_MODE, чтобы знать, что обязательно (ссылка, регион), а цена
   считается ниже по своим правилам. */
const SECRET_BASE = LK_SECRET.price;
let partnerOn = false;

const baseCouponForm = couponForm;
window.couponForm = function (l1, c, locked) {
  window.LKD_MODE = l1;
  partnerOn = false;
  LK_SECRET.price = l1 === "marketplace" ? MP_SECRET_PRICE : SECRET_BASE;
  return baseCouponForm(l1, c, locked);
};

/* Цена. Маркетплейс: вся Россия одной суммой, город и соцсети в неё не
   входят, тайный покупатель — отдельно. B2B: те же множители, но по
   регионам. Партнёрский код даёт скидку на размещение. */
const baseCalcFee = calcFee;
window.calcFee = function (nicheName, names, days, chans, secret) {
  const mode = window.LKD_MODE;
  if (mode === "marketplace") {
    const base = Math.round(MP_PRICE * (partnerOn ? 1 - PARTNER_DISCOUNT : 1));
    const check = secret ? LK_SECRET.price : 0;
    return { base: base, extra: 0, secret: check, total: base + check };
  }
  if (mode === "for-business") {
    const niche = LK_NICHES["for-business"].find(n => n.name === nicheName) || LK_NICHES["for-business"][0];
    const dur = LK_DURATIONS.find(d => d.days === days) || LK_DURATIONS[1];
    const geo = (names || []).reduce((a, n) => {
      const r = LK_REGIONS.find(x => x.name === n);
      return a + (r ? r.k : 0);
    }, 0);
    const base = Math.round(niche.base * dur.k * geo);
    const extra = Math.round(base * (chans || []).reduce((a, id) => {
      const ch = LK_CHANNELS.find(x => x.id === id);
      return a + (ch ? ch.k : 0);
    }, 0));
    const check = secret ? LK_SECRET.price * (names || []).length : 0;
    return { base: base, extra: extra, secret: check, total: base + extra + check };
  }
  return baseCalcFee(nicheName, names, days, chans, secret);
};

const baseInitCB = window.initCouponBuilder;
window.initCouponBuilder = function (host) {
  const form = qs(".lk-form", host);
  /* Сначала правим разметку, потом lk.js навешивает на неё обработчики,
     и только потом добавляем свои — иначе базовые ссылки на узлы уедут. */
  if (form && qs("[data-img]", form)) patchWizard(form);
  baseInitCB(host);
  if (form && qs("[data-img]", form)) wizardExtras(form);
};

/* Первый рендер lk.js делает по DOMContentLoaded — к этому моменту все
   подмены выше уже на месте. Окно ознакомления — после него. */
document.addEventListener("DOMContentLoaded", showGate);

})();
