/* ==========================================================================
   Личные кабинеты — логика прототипа.
   Кабинеты разведены по страницам: client.html и partner.html. Роль берётся
   из data-role страницы и внутри кабинета не меняется — ровно как в
   продукте, где она закреплена за учётной записью. Разделы внутри кабинета
   рисуются в #lkView, номер раздела живёт в адресе (?view=coupons), чтобы
   ссылку на конкретный экран можно было скинуть в чат при согласовании.
   ========================================================================== */

const qs  = (s, r = document) => r.querySelector(s);
const qsa = (s, r = document) => Array.from(r.querySelectorAll(s));
const P   = new URLSearchParams(location.search);

/* Все иконки разделов рисуются по одному шаблону: 18px, толщина 1.7,
   скруглённые концы. Так ряд в меню выглядит собранным. */
const nav = d => '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" ' +
  'stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' + d + '</svg>';

const ICON = {
  plus:   '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  burger: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  bell:   '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M18 9a6 6 0 1 0-12 0c0 6-2 7-2 7h16s-2-1-2-7"/><path d="M10.5 20a2 2 0 0 0 3 0"/></svg>',
  chev:   '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m6 9 6 6 6-6"/></svg>',

  /* Иконки разделов. Один размер, одна толщина, скруглённые концы —
     в списке они должны читаться как ряд, а не как набор картинок. */
  grid:   nav('<rect x="3" y="3" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="2"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2"/>'),
  tag:    nav('<path d="M12.6 3H5a2 2 0 0 0-2 2v7.6a2 2 0 0 0 .6 1.4l7.4 7.4a2 2 0 0 0 2.8 0l7.6-7.6a2 2 0 0 0 0-2.8L14 3.6A2 2 0 0 0 12.6 3Z"/><circle cx="7.9" cy="7.9" r="1.3"/>'),
  pin:    nav('<path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/>'),
  bag:    nav('<path d="M5 8h14l-1.2 11.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>'),
  archive:nav('<rect x="3" y="4" width="18" height="4.5" rx="1.5"/><path d="M5 8.5V19a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8.5"/><path d="M10 12.5h4"/>'),
  chart:  nav('<path d="M4 20h16"/><path d="M7.5 20v-5.5M12 20V9M16.5 20v-8"/>'),
  card:   nav('<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3 10h18"/><path d="M6.5 14.5h3"/>'),
  store:  nav('<path d="M4.5 9.5h15V19a1 1 0 0 1-1 1h-13a1 1 0 0 1-1-1V9.5Z"/><path d="M4.5 9.5 6 4.5h12l1.5 5"/><path d="M9.8 20v-5h4.4v5"/>'),
  users:  nav('<circle cx="9.2" cy="8.4" r="3.2"/><path d="M3.5 19.2a5.7 5.7 0 0 1 11.4 0"/><path d="M16.2 5.6a3.2 3.2 0 0 1 0 5.6M17.3 19.2a5.7 5.7 0 0 0-1.5-3.9"/>'),
  code:   nav('<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M7 9v6M10.5 9v6M14 9v6M17 9v6"/>'),
  case:   nav('<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7"/><path d="M3 12.5h18"/>'),
  gift:   nav('<rect x="3.5" y="8.5" width="17" height="4" rx="1"/><path d="M5.2 12.5V19a1 1 0 0 0 1 1h11.6a1 1 0 0 0 1-1v-6.5"/><path d="M12 8.5V20"/><path d="M12 8.5S10.9 4 8.9 4a2.25 2.25 0 0 0 0 4.5H12Z"/><path d="M12 8.5S13.1 4 15.1 4a2.25 2.25 0 0 1 0 4.5H12Z"/>'),
  wallet: nav('<path d="M19.5 8.5V7a2 2 0 0 0-2-2H5.5a2.5 2.5 0 0 0 0 5h12a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-12a2.5 2.5 0 0 1-2.5-2.5v-9"/><circle cx="16.5" cy="14.5" r="1.1"/>'),
  user:   nav('<circle cx="12" cy="8" r="3.6"/><path d="M4.8 20a7.2 7.2 0 0 1 14.4 0"/>'),
  exit:   '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M15 4h3a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-3"/><path d="M10 8l-4 4 4 4M6 12h9"/></svg>'
};

function initIcons(root = document) {
  qsa("[data-icon]", root).forEach(el => {
    if (!el.dataset.done) { el.innerHTML = ICON[el.dataset.icon] || ""; el.dataset.done = "1"; }
  });
}

const num = n => n.toLocaleString("ru-RU");
const rub = n => n.toLocaleString("ru-RU") + " ₽";

/* Разбор дат вида «9 августа» — рыба без года, поэтому считаем ближайшим
   прошедшим годом (текущий, а даты позже сегодняшнего месяца/дня —
   прошлым годом). Используется и для сортировки «свежее выше», и для
   статуса клиента партнёра (ниже) — точная дата нигде не показывается. */
const RU_MONTHS = ["январ", "феврал", "март", "апрел", "ма", "июн", "июл",
  "август", "сентябр", "октябр", "ноябр", "декабр"];
function ruDate(str) {
  const m = /^(\d{1,2})\s+(\S+)/.exec(str || "");
  if (!m) return null;
  const day = +m[1];
  const month = RU_MONTHS.findIndex(p => m[2].toLowerCase().startsWith(p));
  if (month < 0) return null;
  const now = new Date();
  let year = now.getFullYear();
  if (month > now.getMonth() || (month === now.getMonth() && day > now.getDate())) year -= 1;
  return new Date(year, month, day);
}
function ruDateKey(str) {
  const d = ruDate(str);
  return d ? d.getTime() : -Infinity;
}

/* Статус клиента партнёра — не поле из БД, а расчёт по правилу ТЗ §3.2.7
   и §4.4.4: «новый» — ещё не публиковал купоны; «неактивный» — с
   последнего размещения прошло больше 2 месяцев; иначе «активный».
   Дата последнего размещения — c.last («—» у тех, кто ещё не публиковал). */
function clientStatus(c) {
  if (!c.coupons) return "new";
  const last = ruDate(c.last);
  if (!last) return "active";
  const monthsAgo = (Date.now() - last.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
  return monthsAgo > 2 ? "inactive" : "active";
}

/* ---------- Состояние ---------- */
const state = {
  role: document.body.dataset.role === "partner" ? "partner" : "client",
  view: P.get("view") || "dashboard",
  id: P.get("id") ? Number(P.get("id")) : null,
  filter: "all",
  /* Момент последнего запроса промокода — антифрод-лимит §4.4.3 считается
     от него, живёт только в рамках открытой вкладки (демо, не бэкенд). */
  codeRequestAt: null
};

/* ==========================================================================
   Навигация. Порядок разделов — из структуры, согласованной с заказчиком.
   ========================================================================== */
const NAV = {
  client: [
    { group: "Купоны" },
    { id: "dashboard",       label: "Дашборд",                        icon: "grid" },
    { id: "coupons",         label: "Мои купоны",                     icon: "tag" },
    { id: "new-regional",    label: "Создание регионального купона",  icon: "pin" },
    { id: "new-marketplace", label: "Создание купона маркетплейса",   icon: "bag" },
    { id: "new-business",    label: "Создание купона для бизнеса",    icon: "case" },
    { id: "archive",         label: "Архив купонов",                  icon: "archive" },
    { group: "Компания" },
    { id: "stats",           label: "Статистика",                     icon: "chart" },
    { id: "billing",         label: "Биллинг",                        icon: "card" },
    { id: "profile",         label: "Профиль компании",               icon: "store" },
    { id: "notifications",   label: "Уведомления",                    icon: "bell" }
  ],
  partner: [
    { group: "Привлечение" },
    { id: "dashboard",       label: "Дашборд партнёра",        icon: "grid" },
    { id: "clients",         label: "Региональные клиенты",    icon: "users" },
    { id: "codes",           label: "Маркетплейс · Мои коды",  icon: "code" },
    { id: "bonuses",         label: "Бонусы клиентам",         icon: "gift" },
    { group: "Деньги" },
    { id: "payouts",         label: "Отчёты и выплаты",        icon: "wallet" },
    { id: "profile",         label: "Профиль партнёра",        icon: "user" },
    { id: "notifications",   label: "Уведомления",             icon: "bell" }
  ]
};

const TITLES = {
  client: {
    dashboard: "Дашборд", coupons: "Мои купоны",
    "new-regional": "Создание регионального купона",
    "new-marketplace": "Создание купона маркетплейса",
    "new-business": "Создание купона для бизнеса",
    archive: "Архив купонов", coupon: "Купон", stats: "Статистика", billing: "Биллинг",
    profile: "Профиль компании", notifications: "Уведомления"
  },
  partner: {
    dashboard: "Дашборд партнёра", clients: "Региональные клиенты",
    codes: "Маркетплейс · Мои коды", bonuses: "Бонусы клиентам",
    client: "Клиент", payouts: "Отчёты и выплаты", profile: "Профиль партнёра",
    notifications: "Уведомления"
  }
};

function href(view, id) {
  return "?view=" + view + (id ? "&id=" + id : "");
}

/* Счётчики в навигации — только там, где число реально помогает выбрать
   раздел, а не ради украшения */
function navCount(id) {
  const live = LK_COUPONS.filter(c => c.status !== "done");
  if (state.role === "client") {
    if (id === "coupons") return live.length;
    if (id === "archive") return LK_COUPONS.filter(c => c.status === "done").length;
    if (id === "notifications") return LK_NOTIFICATIONS.client.filter(n => n.unread).length || "";
  } else {
    if (id === "clients") return LK_CLIENTS.length;
    if (id === "codes")   return LK_CODES.filter(c => c.status === "active").length;
    if (id === "bonuses") return LK_BONUSES.length;
    if (id === "notifications") return LK_NOTIFICATIONS.partner.filter(n => n.unread).length || "";
  }
  return "";
}

function renderChrome() {
  /* Меню */
  qs("#lkNav").innerHTML = NAV[state.role].map(it => {
    if (it.group) return `<div class="lk__nav-group">${it.group}</div>`;
    const n = navCount(it.id);
    const on = it.id === state.view ||
               (state.view === "coupon" && it.id === (isArchived() ? "archive" : "coupons")) ||
               (state.view === "client" && it.id === "clients");
    return `<a href="${href(it.id)}"${on ? ' class="is-on"' : ""}>
      <span class="lk__nav-i" data-icon="${it.icon}"></span>
      <span>${it.label}</span>${n ? `<span class="lk__n">${n}</span>` : ""}</a>`;
  }).join("");
  qsa("#lkNav a").forEach(a => a.onclick = e => { e.preventDefault(); go(a.getAttribute("href").split("view=")[1]); });

  /* Название раздела в шапке не дублируем: оно и так стоит заголовком
     страницы прямо под ней и подсвечено в меню слева. Шапка остаётся под
     действия. В заголовке вкладки браузера кабинет и раздел сохраняем —
     по ним различаются открытые вкладки. */
  /* Купоны видит только клиент: в кабинете партнёра раздела нет, и его
     название не должно просачиваться даже в заголовок вкладки. */
  const cur = state.role === "client" && state.view === "coupon" && state.id
    ? LK_COUPONS.find(c => c.id === state.id) : null;
  const who = state.role === "partner" && state.view === "client" && state.id
    ? LK_CLIENTS.find(c => c.id === state.id) : null;
  const title = (cur && cur.title) || (who && who.name) ||
                TITLES[state.role][state.view] || "Раздел";
  const cab = state.role === "client" ? "Кабинет клиента" : "Кабинет партнёра";
  document.title = title + " — " + cab;

  /* Главное действие кабинета. У клиента это публикация купона, у партнёра
     — привлечение юрлиц-клиентов: другой работы у него нет, купоны он
     публиковать не может (решение созвона 04.09). Обе кнопки ведут туда,
     где действие совершается. */
  const cta = qs("#lkCta");
  const main = state.role === "client"
    ? { view: "new-regional", label: "Создать купон" }
    : { view: "codes",        label: "Выдать промокод" };
  cta.href = href(main.view);
  cta.lastElementChild.textContent = main.label;
  cta.onclick = e => { e.preventDefault(); go(main.view); };

  /* Колокольчик */
  const unread = LK_NOTIFICATIONS[state.role].filter(n => n.unread).length;
  qs("#lkDot").classList.toggle("is-on", unread > 0);
  const bell = qs("#lkBell");
  bell.href = href("notifications");
  bell.onclick = e => { e.preventDefault(); go("notifications"); };

  /* Кто в кабинете. По клику — профиль и выход: без выхода кабинет
     некуда закрыть. Выход возвращает на публичную часть. */
  const me = qs("#lkMe");
  const acc = state.role === "client"
    ? { ava: "КП", name: "Кофейня «Пример»" }
    : { ava: "ИП", name: "Иван Партнёров" };
  me.innerHTML = `
    <span class="lk__me-ava">${acc.ava}</span>
    <span class="lk__me-txt">
      <span class="lk__me-name">${acc.name}</span>
      <span class="lk__me-role">Липецк</span>
    </span>
    <a class="lk__me-exit" href="../index.html" title="Выйти" aria-label="Выйти">
      <span data-icon="exit"></span>
    </a>`;

  initIcons();
}

function go(view, id) {
  state.view = view;
  state.id = id || null;
  state.filter = "all";
  history.replaceState(null, "", href(view, id));
  document.body.classList.remove("lk-nav-open");
  render();
  qs("#lkView").scrollIntoView({ block: "start" });
  window.scrollTo(0, 0);
}

/* ==========================================================================
   Общие куски разметки
   ========================================================================== */
function head(title, actions) {
  return `<div class="lk-head"><div class="lk-head__row">
      <h1>${title}</h1>
      ${actions ? `<div class="lk-head__act">${actions}</div>` : ""}
    </div></div>`;
}

/* note — короткая строка данных под числом: срок, период, остаток.
   Пояснять, что показатель означает, в интерфейсе не нужно. */
function kpi(items) {
  return `<div class="lk-kpi">${items.map(i => `
    <div class="lk-kpi__c">
      <div class="lk-kpi__l">${i.label}</div>
      <div class="lk-kpi__v">${i.value}</div>
      ${i.note ? `<div class="lk-kpi__h">${i.note}</div>` : ""}
    </div>`).join("")}</div>`;
}

function status(id) {
  return `<span class="lk-st lk-st--${id}">${LK_STATUSES[id].label}</span>`;
}

function panel(title, body, opts) {
  const o = opts || {};
  return `<div class="lk-panel">
    ${title ? `<div class="lk-panel__head"><h2>${title}</h2>${o.act ? `<div class="lk-panel__act">${o.act}</div>` : ""}</div>` : ""}
    ${body}</div>`;
}

function table(cols, rows) {
  return `<div class="lk-tw"><table class="lk-t">
    <thead><tr>${cols.map(c => `<th${c.num ? ' class="num"' : ""}>${c.t}</th>`).join("")}</tr></thead>
    <tbody>${rows}</tbody></table></div>`;
}

function empty(title, text) {
  return `<div class="lk-empty"><b>${title}</b>${text}</div>`;
}

function field(label, control) {
  return `<label class="lk-l"><span class="lk-l__t">${label}</span>${control}</label>`;
}

function input(ph, val, locked) {
  return `<input class="lk-i" placeholder="${ph}"${val ? ` value="${val}"` : ""}${locked ? " disabled" : ""}>`;
}

function select(opts, name, val, locked) {
  return `<select class="lk-s"${name ? ` data-f="${name}"` : ""}${locked ? " disabled" : ""}>` +
    opts.map(o => `<option${o === val ? " selected" : ""}>${o}</option>`).join("") + `</select>`;
}

function check(label, on, name, locked) {
  return `<label class="lk-ch${on ? " is-on" : ""}">
    <input type="checkbox"${on ? " checked" : ""}${name ? ` data-f="${name}"` : ""}${locked ? " disabled" : ""}>
    <span>${label}</span></label>`;
}

/* ==========================================================================
   Модалка — общий контейнер для коротких действий (пока только запрос
   промокода партнёра). Один DOM-узел на страницу, содержимое подставляется
   под конкретный вызов; открыть/закрыть можно из любого VIEWS.
   ========================================================================== */
function modalRoot() {
  let el = document.getElementById("lkModal");
  if (el) return el;
  el = document.createElement("div");
  el.id = "lkModal";
  el.className = "lk-modal-ov";
  el.innerHTML = `<div class="lk-modal" role="dialog" aria-modal="true">
    <button class="lk-modal__x" type="button" aria-label="Закрыть" data-modal-close></button>
    <div class="lk-modal__body"></div>
  </div>`;
  document.body.appendChild(el);
  el.addEventListener("click", e => { if (e.target === el) closeModal(); });
  qs("[data-modal-close]", el).onclick = closeModal;
  return el;
}
function openModal(bodyHtml) {
  const el = modalRoot();
  qs(".lk-modal__body", el).innerHTML = bodyHtml;
  qsa("[data-modal-close]", el).forEach(b => b.onclick = closeModal);
  el.classList.add("is-on");
  initIcons(el);
  return el;
}
function closeModal() {
  const el = document.getElementById("lkModal");
  if (el) el.classList.remove("is-on");
}

/* Где размещён купон. Городов у купона может быть несколько (city_ids[]),
   у маркетплейсного вместо города площадка: он действует в корзине. */
function where(c) {
  if (c.l1 === "marketplace") return c.market;
  if (!c.cities || !c.cities.length) return "город не выбран";
  return c.cities.length > 2
    ? c.cities.slice(0, 2).join(", ") + " и ещё " + (c.cities.length - 2)
    : c.cities.join(", ");
}

/* ==========================================================================
   Калькулятор размещения (ТЗ v7.0 §4.3.5)
   ==========================================================================
   publish_fee = base(ниша) × region_k(город) × duration_k + пакет каналов.
   Ставка берётся с ниши, а не с раздела. Города складываются: купон в двух
   городах — две витрины и два автопоста. Сами коэффициенты — заглушка,
   пять критериев тарифа ещё не посчитаны (задача Will Charges). */
function calcFee(nicheName, cityNames, days, channelIds) {
  const list = [].concat(LK_NICHES.regional, LK_NICHES.marketplace, LK_NICHES["for-business"]);
  const niche = list.find(n => n.name === nicheName) || list[0];
  const dur = LK_DURATIONS.find(d => d.days === days) || LK_DURATIONS[1];
  const geo = (cityNames || []).reduce((a, name) => {
    const c = LK_CITIES.find(x => x.name === name);
    return a + (c ? c.k : 0);
  }, 0);
  const base = Math.round(niche.base * dur.k * geo);
  const extra = Math.round(base * (channelIds || []).reduce((a, id) => {
    const ch = LK_CHANNELS.find(x => x.id === id);
    return a + (ch ? ch.k : 0);
  }, 0));
  return { base: base, extra: extra, total: base + extra };
}

/* ==========================================================================
   Разделы кабинета клиента
   ========================================================================== */
const VIEWS = {};

VIEWS["client:dashboard"] = () => {
  const live = LK_COUPONS.filter(c => c.status === "live");
  const sum = k => LK_COUPONS.reduce((a, c) => a + c[k], 0);
  const attention = LK_COUPONS.filter(c => c.status === "rejected" || c.status === "draft");

  return head("Дашборд")
    + kpi(LK_METRICS.map(m => ({ label: m.label, value: num(sum(m.id)) })))
    + `<div class="lk-pair">
      ${panel("Опубликовано сейчас", live.length
        ? table(
            [{ t: "Купон" }, { t: "Действует" }, { t: "Забрали", num: true }],
            live.map(c => `<tr data-coupon="${c.id}" tabindex="0">
              <td><b class="lk-t__title">${c.title}</b><span class="lk-t__sub">${where(c)} · ${c.value}</span></td>
              <td>${c.from} — ${c.to}</td>
              <td class="num">${num(c.taken)}</td></tr>`).join("")
          )
        : empty("Пока ничего не опубликовано", "Созданные купоны появятся здесь после модерации."),
        { act: `<a class="btn btn--ghost" href="${href("coupons")}" data-go="coupons">Все купоны</a>` })}

      ${panel("Требует внимания", attention.length
        ? `<div class="lk-list">${attention.map(c => `
            <div class="lk-list__i is-unread" data-coupon-row="${c.id}" tabindex="0"><i class="lk-list__d"></i><div>
              ${c.title}
              <div class="lk-list__w">${c.status === "rejected" ? "Отклонён: " + c.reject : "Черновик — не заполнены срок и промокод"}</div>
            </div></div>`).join("")}</div>`
        : empty("Всё в порядке", "Купонов, которые ждут вашего действия, нет."))}
    </div>`;
};

VIEWS["client:coupons"] = () => {
  const all = LK_COUPONS.filter(c => c.status !== "done");
  const counts = {};
  all.forEach(c => counts[c.status] = (counts[c.status] || 0) + 1);
  const list = state.filter === "all" ? all : all.filter(c => c.status === state.filter);

  const filters = `<div class="lk-filters">
    <button data-f="all"${state.filter === "all" ? ' class="is-on"' : ""}>Все<span class="lk__n">${all.length}</span></button>
    ${Object.keys(LK_STATUSES).filter(s => s !== "done" && counts[s])
      .map(s => `<button data-f="${s}"${state.filter === s ? ' class="is-on"' : ""}>${LK_STATUSES[s].label}<span class="lk__n">${counts[s]}</span></button>`).join("")}
  </div>`;

  const rows = list.map(c => `<tr data-coupon="${c.id}" tabindex="0">
    <td><b class="lk-t__title">${c.title}</b>
        <span class="lk-t__sub">${c.niche} · ${where(c)}</span></td>
    <td><span class="lk-chip">${c.value}</span></td>
    <td>${status(c.status)}${c.status === "rejected" ? `<div class="lk-t__sub">${c.reject}</div>` : ""}</td>
    <td>${c.from === "—" ? "<span class='lk-t__sub'>срок не задан</span>" : c.from + " — " + c.to}
        <div class="lk-erid">erid: ${c.erid}</div></td>
    <td class="num">${c.shown ? num(c.shown) : "—"}</td>
    <td class="num">${c.taken ? num(c.taken) : "—"}</td>
  </tr>`).join("");

  return head("Мои купоны",
      `<a class="btn btn--ghost" href="${href("new-marketplace")}" data-go="new-marketplace">Купон маркетплейса</a>
       <a class="btn btn--solid" href="${href("new-regional")}" data-go="new-regional">Создать купон</a>`)
    + panel("", filters + (list.length
        ? table([{ t: "Купон" }, { t: "Скидка" }, { t: "Статус" }, { t: "Срок действия" },
                 { t: "Показы", num: true }, { t: "Забрали", num: true }], rows)
        : empty("В этом статусе купонов нет", "Смените фильтр, чтобы увидеть остальные.")));
};

/* Форма создания купона. Набор полей выведен из созвонов, а не придуман:
   срок — двумя датами (Коля просил период, а не «сколько дней»), ЕРИД
   уникальный на каждое объявление, ссылки на сайт и соцсети обязательны
   (переходы туда — ключевая метрика), изображение 4:5 под ленты соцсетей.
   Полей намеренно немного: Виль просил Ивана согласовывать сложность
   карточки с Павлом, чтобы не переделывать интерфейс создания купона. */
function couponForm(l1, c, locked) {
  const isMarket = l1 === "marketplace";
  const v = c || {};
  const ro = locked ? " disabled" : "";
  const vert = LK_VERTICALS[l1];
  const niches = LK_NICHES[l1].map(n => n.name);
  const cities = v.cities || [LK_CITIES[0].name];
  const chans = v.channels || LK_CHANNELS.map(x => x.id);
  const days = v.days || 14;
  const fee = calcFee(v.niche || niches[0], cities, days, chans.filter(x => x !== "site"));

  /* Где размещаем. У маркетплейса это площадка и артикул: город там нужен
     для тарифа и автопоста, а не для витрины. */
  const place = isMarket
    ? `<div class="lk-f__row">
        ${field("Маркетплейс", select(LK_MARKETS, null, v.market, locked))}
        ${field("Артикул товара", input("184 220 933", v.article, locked))}
       </div>
       ${field("Ссылка на карточку товара", input("https://…", null, locked))}`
    : field("Адрес точки", input("ул. Первомайская, 12", null, locked));

  /* Города — мультивыбор: купон размещается сразу в нескольких (city_ids[]),
     и каждый добавленный город увеличивает цену. Одним выпадающим списком
     это не задать, поэтому переключатели. */
  const cityChips = LK_CITIES.map(x => `
    <button type="button" class="lk-chipbtn${cities.indexOf(x.name) !== -1 ? " is-on" : ""}"
      data-city="${x.name}"${ro}>${x.name}</button>`).join("");

  const channelRows = LK_CHANNELS.map(ch => ch.fixed
    ? `<label class="lk-ch is-on is-fixed"><input type="checkbox" checked disabled><span>${ch.label}</span><i>входит всегда</i></label>`
    : `<label class="lk-ch${chans.indexOf(ch.id) !== -1 ? " is-on" : ""}">
        <input type="checkbox" data-ch="${ch.id}"${chans.indexOf(ch.id) !== -1 ? " checked" : ""}${ro}>
        <span>${ch.label}</span><i>+${Math.round(ch.k * 100)}%</i></label>`).join("");

  const mech = (LK_MECHANICS.find(m => m.id === v.mech) || {}).label;

  return `<div class="lk-form">
    <div>
      ${panel("Раздел и ниша", `<div class="lk-f">
        <div class="lk-note">${vert.name} · ${vert.hint}</div>
        ${field("Ниша", select(niches, "niche", v.niche, locked))}
        ${place}
      </div>`)}

      ${panel("Города размещения", `
        <div class="lk-chips">${cityChips}</div>
        <div class="lk-note" style="margin-top:12px">Купон появится в каталоге
        каждого выбранного города и уйдёт в его соцсети. Города других
        областей — по мере запуска сервиса.</div>`)}

      ${panel("Предложение", `<div class="lk-f">
        ${field("Заголовок купона", input("Комбо-обед по будням до 16:00", v.title, locked))}
        <div class="lk-f__row">
          ${field("Механика", select(LK_MECHANICS.map(m => m.label), "mech", mech, locked))}
          ${field("Величина", input("−30%", v.value, locked))}
        </div>
        ${field("Изображение купона", `<div class="lk-drop">Перетащите файл<br>или выберите на компьютере<br><br>Пропорция 4:5</div>`)}
      </div>`)}

      ${panel("Срок и код", `<div class="lk-f">
        <div class="lk-f__row">
          ${field("Действует с", input("3 сентября 2026", v.from === "—" ? null : v.from, locked))}
          ${field("по", input("24 сентября 2026", v.to === "—" ? null : v.to, locked))}
        </div>
        ${field("Срок размещения", select(LK_DURATIONS.map(d => d.label), "days",
            (LK_DURATIONS.find(d => d.days === days) || {}).label, locked))}
        ${field("Промокод", input("LUNCH30", v.code === "—" ? null : v.code, locked))}
        ${field("Как воспользоваться", `<textarea class="lk-ta" placeholder="Покажите код на кассе или назовите администратору при оплате."${ro}></textarea>`)}
      </div>`)}

      ${panel("Каналы публикации", `
        <div class="lk-checks">${channelRows}</div>
        <div class="lk-note" style="margin-top:12px">Соцсети включены по
        умолчанию. Публикуем в каналы выбранных городов, макеты собираются
        сами: один под сайт, один под ВКонтакте и Одноклассники, один под
        Telegram и Max.</div>`)}

      ${panel("Компания в купоне", `<div class="lk-f">
        <div class="lk-f__row">
          ${field("Сайт", input("https://…", null, locked))}
          ${field("ВКонтакте", input("https://vk.com/…", null, locked))}
        </div>
        <div class="lk-f__row">
          ${field("Telegram", input("https://t.me/…", null, locked))}
          ${field("ERID", input("", v.erid && v.erid !== "—" ? v.erid : "будет присвоен при публикации", true))}
        </div>
      </div>`)}

      ${panel("Проверка", `
        ${check("Проверить тайным покупателем", !!v.secret, null, locked)}
        <div class="lk-note" style="margin-top:10px">Наш человек придёт по
        купону и проверит, что скидку дали. На карточке появится бейдж
        «Проверено тайным покупателем».</div>`)}

      ${locked ? "" : `
        <div class="lk-warn">После публикации условия купона изменить нельзя.
        Купон можно остановить и создать новый или достать из архива и
        запустить заново.</div>
        <div class="lk-head__act" style="margin:0">
          <button class="btn btn--ghost btn--lg">Сохранить черновик</button>
          <button class="btn btn--solid btn--lg">Отправить на модерацию</button>
        </div>`}
    </div>

    <div class="lk-prev">
      ${panel("Так купон увидят в ленте", `
        <div class="lk-prev__card">
          <div class="lk-prev__media">
            <span class="lk-prev__erid">Реклама · erid: ${v.erid && v.erid !== "—" ? v.erid : "2Vt…"}</span>
            <span class="lk-prev__val" id="pvVal">${v.value || "−30%"}</span>
          </div>
          <div class="lk-prev__body">
            <div class="lk-prev__title">${v.title || "Комбо-обед по будням до 16:00"}</div>
            <div class="lk-prev__meta">Кофейня «Пример» · <span id="pvNiche">${v.niche || niches[0]}</span></div>
          </div>
        </div>`)}

      ${panel("Стоимость размещения", `
        <div class="lk-calc" id="lkCalc">
          <div class="lk-calc__row"><span>Ниша, города и срок</span><b data-calc="base">${rub(fee.base)}</b></div>
          <div class="lk-calc__row"><span>Пакет соцсетей</span><b data-calc="extra">${rub(fee.extra)}</b></div>
          <div class="lk-calc__row lk-calc__row--total"><span>Итого</span><b data-calc="total">${rub(fee.total)}</b></div>
        </div>
        <div class="lk-note">Считается по нише, городам и сроку. Коэффициенты
        в прототипе условные: тариф ещё считают.</div>`)}

      ${isMarket ? panel("Промокод партнёра", `<div class="lk-f">
        ${field("Код", input("8 символов латиницей", v.partnerCode, locked))}
        </div>
        <div class="lk-note" style="margin-top:10px">Необязательно. С кодом
        размещение дешевле на ${LK_RATES.discount}%. Код вводится заново при
        каждой публикации — прошлый не подставляем.</div>`) : ""}

      ${locked ? "" : panel("Чем платим", `
        <div class="lk-pay" id="lkPay">
          <div class="lk-pay__ends"><span>Монетами</span><span>Бонусами</span></div>
          <input class="lk-range" type="range" min="0" max="100" value="0" data-pay-range>
          <div class="lk-pay__sums">
            <b data-pay="coins">${rub(fee.total)}</b>
            <b data-pay="bonuses">0 ₽</b>
          </div>
          <div class="lk-pay__hint" data-pay-hint>Бонусами пока не платите —
            доступно ${num(LK_BALANCE.bonuses)}. Перетащите ползунок вправо,
            чтобы часть суммы списалась ими.</div>
        </div>
        <div class="lk-note">Хотя бы одна монета в каждой публикации уходит
        реальными деньгами — бонусами закрыть размещение целиком нельзя.
        Списанные бонусы не возвращаются.</div>`)}
    </div>
  </div>`;
}

VIEWS["client:new-regional"] = () =>
  head("Создание регионального купона")
  + couponForm("regional");

VIEWS["client:new-marketplace"] = () =>
  head("Создание купона маркетплейса")
  + couponForm("marketplace");

VIEWS["client:new-business"] = () =>
  head("Создание купона для бизнеса")
  + couponForm("for-business");

VIEWS["client:archive"] = () => {
  const done = LK_COUPONS.filter(c => c.status === "done");
  return head("Архив купонов")
    + panel("", done.length
      ? table([{ t: "Купон" }, { t: "Период" }, { t: "Показы", num: true }, { t: "Просмотры", num: true },
               { t: "Забрали", num: true }, { t: "Переходы", num: true }, { t: "" }],
          done.map(c => `<tr data-coupon="${c.id}" tabindex="0">
            <td><b class="lk-t__title">${c.title}</b><span class="lk-t__sub">${where(c)} · ${c.value}</span></td>
            <td>${c.from} — ${c.to}</td>
            <td class="num">${num(c.shown)}</td>
            <td class="num">${num(c.opened)}</td>
            <td class="num">${num(c.taken)}</td>
            <td class="num">${num(c.clicks)}</td>
            <td class="num"><button class="btn btn--ghost">Повторить</button></td>
          </tr>`).join(""))
      : empty("Архив пуст", "Сюда попадают купоны, у которых закончился срок действия."));
};

VIEWS["client:stats"] = () => {
  const sum = k => LK_COUPONS.reduce((a, c) => a + c[k], 0);
  const rows = LK_COUPONS.filter(c => c.shown > 0)
    .sort((a, b) => b.taken - a.taken)
    .map(c => `<tr data-coupon="${c.id}" tabindex="0">
      <td><b class="lk-t__title">${c.title}</b><span class="lk-t__sub">${where(c)}</span></td>
      <td>${status(c.status)}</td>
      <td class="num">${num(c.shown)}</td>
      <td class="num">${num(c.opened)}</td>
      <td class="num">${num(c.taken)}</td>
      <td class="num">${num(c.clicks)}</td>
    </tr>`).join("");

  return head("Статистика")
    + kpi(LK_METRICS.map(m => ({ label: m.label, value: num(sum(m.id)) })))
    + panel("По купонам",
        table([{ t: "Купон" }, { t: "Статус" }, { t: "Показы", num: true }, { t: "Просмотры", num: true },
               { t: "Забрали", num: true }, { t: "Переходы", num: true }], rows));
};

/* Биллинг. Пакетов и тарифов в модели нет: по ТЗ §4.3.2 на балансе лежат
   две разные сущности — монеты (примерно рубль, не сгорают) и бонусы (не
   деньги, живут 365 дней), и оплачивается каждое размещение отдельно.
   Поэтому они и в истории операций стоят двумя колонками, а не одной
   суммой: клиенту важно видеть, сколько ушло реальных денег. */
VIEWS["client:billing"] = () => {
  const sign = n => (n > 0 ? "+" : "") + num(n);
  const rows = LK_LEDGER.map(b => `<tr>
    <td>${b.date}</td>
    <td><b class="lk-t__title">${LK_LEDGER_KINDS[b.kind]}</b><span class="lk-t__sub">${b.what}</span></td>
    <td class="num${b.coins < 0 ? " is-out" : ""}">${b.coins ? sign(b.coins) : "—"}</td>
    <td class="num${b.bonuses < 0 ? " is-out" : ""}">${b.bonuses ? sign(b.bonuses) : "—"}</td>
    <td class="num">${b.doc ? `<button class="btn btn--ghost">${b.doc}</button>` : "—"}</td>
  </tr>`).join("");

  return head("Биллинг")
    + kpi([
        { label: "Монеты",   value: num(LK_BALANCE.coins),   note: "Не сгорают" },
        { label: "Бонусы",   value: num(LK_BALANCE.bonuses), note: "Сгорают " + LK_BALANCE.bonusBurn },
        { label: "Потрачено за сентябрь", value: rub(LK_BALANCE.spentMonth) }
      ])
    + `<div class="lk-pair">
      ${panel("Пополнить баланс", `<div class="lk-f">
        ${field("Сумма", input("", "10 000"))}
        ${field("Способ", select(["СБП", "Картой", "По счёту на юрлицо"]))}
      </div>
      <div class="lk-head__act" style="margin-top:16px">
        <button class="btn btn--solid">Пополнить</button>
      </div>
      <div class="lk-note" style="margin-top:12px">Деньги сразу становятся
      монетами: одна монета — один рубль. Закрывающие документы приходят в
      момент пополнения, а не после каждой публикации.</div>`)}
      ${panel("Реквизиты для счетов", `<div class="lk-f">
        ${field("Плательщик", input("", "ООО «Пример»"))}
        <div class="lk-f__row">${field("ИНН", input("", "4826000000"))}${field("КПП", input("", "482601001"))}</div>
      </div>`)}
    </div>`
    + panel("История операций",
        table([{ t: "Дата" }, { t: "Операция" }, { t: "Монеты", num: true },
               { t: "Бонусы", num: true }, { t: "Документ", num: true }], rows)
        + `<div class="lk-total"><span>Бонусы тратятся на размещение наравне
           с монетами, но хотя бы одна монета в каждой публикации уходит
           реальными деньгами.</span></div>`);
};

VIEWS["client:profile"] = () =>
  head("Профиль компании")
  + `<div class="lk-pair">
      ${panel("Компания", `<div class="lk-f">
        ${field("Название", input("", "Кофейня «Пример»"))}
        ${field("Краткое описание", `<textarea class="lk-ta" placeholder="Своя обжарка, запись день в день, работаем с 2014 года."></textarea>`)}
        <div class="lk-f__row">${field("ИНН", input("", "4826000000"))}${field("Телефон", input("", "+7 900 000-00-00"))}</div>
      </div>`)}
      ${panel("Компания в сети", `<div class="lk-f">
        ${field("Сайт", input("https://…"))}
        ${field("ВКонтакте", input("https://vk.com/…"))}
        ${field("Telegram", input("https://t.me/…"))}
      </div>`)}
    </div>`
  + panel("Точки продаж", table(
      [{ t: "Адрес" }, { t: "Город" }, { t: "Режим работы" }, { t: "", num: true }],
      `<tr><td>ул. Первомайская, 12</td><td>Липецк</td><td>ежедневно 08:00–22:00</td>
        <td class="num"><button class="btn btn--ghost">Изменить</button></td></tr>
       <tr><td>пр-т Победы, 45</td><td>Липецк</td><td>ежедневно 09:00–21:00</td>
        <td class="num"><button class="btn btn--ghost">Изменить</button></td></tr>`),
      { act: `<button class="btn btn--ghost">Добавить точку</button>` });

/* Карточка купона. Черновик и отклонённый открываются на редактирование —
   ради этого статус «черновик» и существует. Остальные показываем теми же
   полями, но заблокированными: что можно делать с уже опубликованным
   купоном, на созвонах не обсуждали. */
function isArchived() {
  const c = LK_COUPONS.find(x => x.id === state.id);
  return !!c && c.status === "done";
}

VIEWS["client:coupon"] = () => {
  const c = LK_COUPONS.find(x => x.id === state.id);
  if (!c) return head("Купон не найден")
    + empty("Такого купона нет", "Вернитесь к списку и выберите другой.");

  const editable = c.status === "draft" || c.status === "rejected";
  const back = isArchived() ? "archive" : "coupons";

  return head(c.title,
      `<a class="btn btn--ghost" href="${href(back)}" data-go="${back}">К списку</a>`)
    + `<div class="lk-sub">${status(c.status)}<i class="dot"></i>
        <span>${LK_VERTICALS[c.l1].name} · ${c.niche}</span><i class="dot"></i><span>${where(c)}</span>
        ${c.from === "—" ? "" : `<i class="dot"></i><span>${c.from} — ${c.to}</span>`}</div>`
    + (c.status === "rejected"
        ? panel("Причина отклонения", `<p class="lk-reason">${c.reject}</p>`)
        : "")
    + (c.shown
        ? kpi(LK_METRICS.map(m => ({ label: m.label, value: num(c[m.id]) })))
        : "")
    + couponForm(c.l1, c, !editable);
};

/* ==========================================================================
   Разделы кабинета партнёра
   ==========================================================================
   Партнёр ведёт два контура сразу (ТЗ §4.4.1): региональных клиентов, за
   которых он закреплён навсегда, и селлеров маркетплейсов, где партнёрство
   подтверждается промокодом на каждой публикации. Ставка в обоих одна:
   20% с суммы, которую клиент реально заплатил. */
VIEWS["partner:dashboard"] = () => {
  const active   = LK_CLIENTS.filter(c => clientStatus(c) === "active").length;
  const fresh    = LK_CLIENTS.filter(c => clientStatus(c) === "new").length;
  const fee      = LK_CLIENTS.reduce((a, c) => a + c.fee, 0);
  const pend     = LK_PAYOUTS.find(p => p.status === "pending");

  return head("Дашборд партнёра")
    + kpi([
        { label: "Клиентов в регионе", value: LK_CLIENTS.length, note: fresh + " ещё без первой оплаты" },
        { label: "Активных",           value: active },
        { label: "Начислено всего",    value: rub(fee), note: LK_RATES.fee + "% с оплат клиентов" },
        { label: "К выплате",          value: rub(pend.total), note: pend.date }
      ])
    + panel("Последние клиенты",
        table([{ t: "Клиент" }, { t: "С нами с" }, { t: "Купонов", num: true }],
          LK_CLIENTS.slice().sort((a, b) => ruDateKey(b.since) - ruDateKey(a.since)).slice(0, 4)
            .map(c => `<tr data-client="${c.id}" tabindex="0">
            <td><b class="lk-t__title">${c.name}</b><span class="lk-t__sub">${c.city} · ${LK_CLIENT_STATUSES[clientStatus(c)]}</span></td>
            <td>${c.since}</td><td class="num">${c.coupons}</td></tr>`).join("")),
        { act: `<a class="btn btn--ghost" href="${href("clients")}" data-go="clients">Все клиенты</a>` });
};

/* Микро-CRM. Клиенты закреплены по городу организации: реферальных ссылок
   на регистрацию в продукте нет, закрепление делает администратор
   (ТЗ §3.2.7, §4.4.2). Баланс виден при любом статусе — по нему партнёр
   решает, кому дарить бонусы. */
VIEWS["partner:clients"] = () => {
  const rows = LK_CLIENTS.map(c => `<tr data-client="${c.id}" tabindex="0">
    <td><b class="lk-t__title">${c.name}</b><span class="lk-t__sub">${c.sphere} · ${c.city}</span></td>
    <td><span class="lk-cst lk-cst--${clientStatus(c)}">${LK_CLIENT_STATUSES[clientStatus(c)]}</span></td>
    <td>${c.since}</td>
    <td class="num">${c.coupons || "—"}</td>
    <td class="num">${c.paid ? rub(c.paid) : "—"}</td>
    <td class="num">${c.fee ? rub(c.fee) : "—"}</td>
  </tr>`).join("");

  return head("Региональные клиенты",
      `<button class="btn btn--ghost">Выгрузить в CSV</button>
       <button class="btn btn--ghost">Выгрузить в Excel</button>`)
    + panel("", table(
        [{ t: "Клиент" }, { t: "Статус" }, { t: "С нами с" }, { t: "Купонов", num: true },
         { t: "Оплатил", num: true }, { t: "Ваше начисление", num: true }], rows)
      + `<div class="lk-total"><span>Клиенты закреплены за вами по городу
         организации. Закрепление постоянное, новых добавляет
         администратор.</span></div>`);
};

/* Карточка клиента: контакты и баланс. Статистику по купонам клиента
   партнёр не видит — это решение созвона 04.09 и оно осталось в ТЗ. */
VIEWS["partner:client"] = () => {
  const c = LK_CLIENTS.find(x => x.id === state.id);
  if (!c) return head("Клиент не найден")
    + empty("Такого клиента нет", "Вернитесь к списку и выберите другого.");

  return head(c.name,
      `<a class="btn btn--ghost" href="${href("clients")}" data-go="clients">К списку</a>`)
    + `<div class="lk-sub"><span class="lk-cst lk-cst--${clientStatus(c)}">${LK_CLIENT_STATUSES[clientStatus(c)]}</span>
        <i class="dot"></i><span>${c.sphere}</span><i class="dot"></i><span>${c.city}</span></div>`
    + kpi([
        { label: "Купонов размещено", value: c.coupons || "—", note: c.last === "—" ? "" : "последний " + c.last },
        { label: "Оплатил",           value: c.paid ? rub(c.paid) : "—" },
        { label: "Ваше начисление",   value: c.fee ? rub(c.fee) : "—", note: LK_RATES.fee + "% с оплат" },
        { label: "Баланс клиента",    value: num(c.coins) + " / " + num(c.bonuses), note: "монеты / бонусы" }
      ])
    + `<div class="lk-pair">
      ${panel("Контакты", `<div class="lk-f">
        ${field("Почта", input("", c.email, true))}
        ${field("Телефон", input("", c.phone, true))}
        ${field("С нами с", input("", c.since, true))}
      </div>`)}
      ${panel("Бонусы клиенту", `
        <div class="lk-note">Раздача идёт из вашего месячного пула
        «От души брат». Доступно ${num(LK_BONUS_POOL.limit - LK_BONUS_POOL.spent)} бонусов
        до ${LK_BONUS_POOL.resets}.</div>
        <div class="lk-head__act" style="margin-top:16px">
          <a class="btn btn--solid" href="${href("bonuses")}" data-go="bonuses">Начислить бонусы</a>
        </div>`)}
    </div>`;
};

/* Промокоды для селлеров маркетплейсов. Код нужен селлеру при каждой
   публикации: партнёрство здесь не вечное, оно живёт ровно на том купоне,
   где код указан (ТЗ §4.4.3). Комментарий «кому отдал» — часть ТЗ: без
   него по списку кодов нельзя понять, кто чей. */
VIEWS["partner:codes"] = () => {
  const rows = LK_CODES.map(c => `<tr>
    <td><b class="lk-t__title">${c.status === "queued" ? "В очереди…" : c.code}</b>
        ${c.base ? `<span class="lk-t__sub">базовый</span>`
          : c.status === "queued" ? `<span class="lk-t__sub">будет готов через ~${LK_CODE_LIMITS.delayMin} мин</span>` : ""}</td>
    <td>${c.comment || "<span class='lk-t__sub'>кому отдан, не записано</span>"}</td>
    <td>${c.market === "—" ? "<span class='lk-t__sub'>—</span>" : c.market}</td>
    <td class="num">${c.used ? num(c.used) : "—"}</td>
    <td class="num">${c.income ? rub(c.income) : "—"}</td>
  </tr>`).join("");

  const total = LK_CODES.reduce((a, c) => a + c.income, 0);

  return head("Маркетплейс · Мои коды",
      `<button class="btn btn--solid" type="button" data-request-code>Запросить новый код</button>`)
    + panel("", table(
        [{ t: "Код" }, { t: "Кому отдан" }, { t: "Площадка" },
         { t: "Публикаций", num: true }, { t: "Начислено", num: true }], rows)
      + `<div class="lk-total"><b>${rub(total)}</b><span>начислено по кодам за всё время</span></div>`)
    + panel("Как это работает", `
      <ul class="lk-rules">
        <li>Селлер вводит код при создании купона в разделе «Маркетплейсы».
            Размещение для него дешевле на ${LK_RATES.discount}%, вам идёт
            ${LK_RATES.fee}% от того, что он заплатил.</li>
        <li>Без кода — розничная цена и ноль вам. Код указывается заново на
            каждой публикации, автоматически он не подставляется.</li>
        <li>Новый код выдаётся с задержкой около ${LK_CODE_LIMITS.delayMin} минут,
            не чаще ${LK_CODE_LIMITS.perHour} в час.</li>
      </ul>`);
};

/* Запрос нового кода — антифрод-очередь из ТЗ §4.4.3: не чаще
   LK_CODE_LIMITS.perHour в час, готовность через LK_CODE_LIMITS.delayMin
   минут. Таймер настоящий: если оставить вкладку открытой, код сам
   переходит из «в очереди» в рабочий — как и было бы после бэкенда. */
function nextCodeAllowedAt() {
  if (!state.codeRequestAt || !LK_CODE_LIMITS.perHour) return null;
  const at = state.codeRequestAt + (60 * 60 * 1000) / LK_CODE_LIMITS.perHour;
  return at > Date.now() ? at : null;
}

function nextCodeValue() {
  const nums = LK_CODES.map(c => /^PRTLIP(\d+)$/.exec(c.code)).filter(Boolean).map(m => +m[1]);
  const n = (nums.length ? Math.max(...nums) : 0) + 1;
  return "PRTLIP" + String(n).padStart(2, "0");
}

function openCodeRequestModal() {
  const wait = nextCodeAllowedAt();
  if (wait) {
    const min = Math.max(1, Math.ceil((wait - Date.now()) / 60000));
    openModal(`
      <h3>Пока нельзя</h3>
      <p class="lk-note">Антифрод-лимит — не чаще ${LK_CODE_LIMITS.perHour}
      нового кода в час. Следующий запрос будет доступен примерно через
      ${min} мин.</p>
      <div class="lk-head__act" style="margin-top:18px">
        <button class="btn btn--ghost" type="button" data-modal-close>Понятно</button>
      </div>`);
    return;
  }

  openModal(`
    <h3>Запросить новый код</h3>
    <p class="lk-note">Код появляется не сразу — на выдачу уходит около
    ${LK_CODE_LIMITS.delayMin} минут, это антифрод-задержка.</p>
    <div class="lk-f">
      ${field("Кому отдан", input("Например, «Магазину «Пример-2»»"))}
      ${field("Площадка", select(["—"].concat(LK_MARKETS)))}
    </div>
    <div class="lk-head__act" style="margin-top:18px">
      <button class="btn btn--ghost" type="button" data-modal-close>Отмена</button>
      <button class="btn btn--solid" type="button" data-code-submit>Отправить заявку</button>
    </div>`);

  const box = qs("#lkModal .lk-modal__body");
  const commentInp = qs(".lk-i", box);
  const marketSel = qs(".lk-s", box);
  qs("[data-code-submit]", box).onclick = () => {
    const code = nextCodeValue();
    LK_CODES.unshift({
      code, base: false, comment: commentInp.value.trim(),
      market: marketSel.value, used: 0, income: 0, status: "queued"
    });
    state.codeRequestAt = Date.now();
    closeModal();
    if (state.role === "partner" && state.view === "codes") render();
    setTimeout(() => {
      const c = LK_CODES.find(x => x.code === code);
      if (c) c.status = "active";
      if (state.role === "partner" && state.view === "codes") render();
    }, LK_CODE_LIMITS.delayMin * 60000);
  };
}

/* Пул «От души брат». Лимит на календарный месяц задаёт администратор,
   раздаёт партнёр вручную, остаток не переносится (ТЗ §4.4.2). Бонусы —
   только региональным клиентам: в маркетплейсах работает промокод. */
VIEWS["partner:bonuses"] = () => {
  const left = LK_BONUS_POOL.limit - LK_BONUS_POOL.spent;
  const share = Math.round(LK_BONUS_POOL.spent / LK_BONUS_POOL.limit * 100);

  return head("Бонусы клиентам")
    + kpi([
        { label: "Лимит на " + LK_BONUS_POOL.month, value: num(LK_BONUS_POOL.limit) },
        { label: "Роздано",  value: num(LK_BONUS_POOL.spent), note: share + "% пула" },
        { label: "Осталось", value: num(left), note: "Сгорит " + LK_BONUS_POOL.resets },
        { label: "Начислений", value: LK_BONUSES.length }
      ])
    + `<div class="lk-pair">
      ${panel("Начислить бонусы", `<div class="lk-f">
        ${field("Кому", select(LK_CLIENTS.filter(c => clientStatus(c) !== "new").map(c => c.name)))}
        ${field("Сколько бонусов", input("2 500"))}
        ${field("Сообщение клиенту", `<textarea class="lk-ta" placeholder="Спасибо, что с нами. Следующее размещение за наш счёт."></textarea>`)}
      </div>
      <div class="lk-head__act" style="margin-top:16px">
        <button class="btn btn--solid btn--lg">Начислить</button>
      </div>`)}
      ${panel("Правила пула", `
        <ul class="lk-rules">
          <li>Лимит задаёт администратор на календарный месяц. Остаток не
              переносится: ${LK_BONUS_POOL.resets} счётчик обнуляется.</li>
          <li>Бонусы идут только клиентам вашего региона. В маркетплейсах
              вместо них работает промокод.</li>
          <li>Клиент тратит бонусы на размещение купонов. Обменять их на
              деньги нельзя, срок жизни — 365 дней.</li>
        </ul>`)}
    </div>`
    + panel("История начислений", table(
        [{ t: "Начисление" }, { t: "Кому" }, { t: "Сколько", num: true }, { t: "Отправлено" }, { t: "Статус" }],
        LK_BONUSES.map(b => `<tr>
          <td><b class="lk-t__title">${b.id}</b></td>
          <td>${b.to}</td>
          <td class="num">${num(b.amount)}</td>
          <td>${b.sent}</td>
          <td>${LK_BONUS_STATUSES[b.status]}</td></tr>`).join("")));
};

/* Отчёты. Период — календарный месяц, деньги уходят через 14 дней после
   его закрытия: столько отведено на споры по завершённым купонам
   (ТЗ §4.4.3). Детализация построчная: купон, клиент, сумма оплаты и
   начисление, чтобы отчёт можно было сверить. */
VIEWS["partner:payouts"] = () => {
  const rows = LK_PAYOUTS.map(p => `<tr>
    <td><b class="lk-t__title">${p.period}</b><span class="lk-t__sub">${p.date}</span></td>
    <td class="num">${rub(p.income)}</td>
    <td class="num">${rub(p.total)}</td>
    <td>${p.status === "paid" ? "Выплачено" : "Ожидает выплаты"}</td>
    <td class="num"><button class="btn btn--ghost">Скачать</button></td>
  </tr>`).join("");

  const detail = LK_PAYOUT_ROWS.map(r => `<tr>
    <td><b class="lk-t__title">${r.coupon}</b><span class="lk-t__sub">купон ${r.id} · ${r.client}</span></td>
    <td>${r.contour === "market" ? "Маркетплейс · " + r.code : "Регион"}</td>
    <td class="num">${rub(r.paid)}</td>
    <td class="num">${rub(r.fee)}</td>
  </tr>`).join("");

  const paid = LK_PAYOUTS.filter(p => p.status === "paid").reduce((a, p) => a + p.total, 0);
  const pend = LK_PAYOUTS.find(p => p.status === "pending");

  return head("Отчёты и выплаты",
      `<button class="btn btn--ghost">Выгрузить в CSV</button>`)
    + `<div class="lk-pair">
      ${panel("К выплате", `
        <div class="lk-kpi__l">${pend.period}</div>
        <div class="lk-kpi__v">${rub(pend.total)}</div>
        <div class="lk-kpi__h">${pend.date}</div>
        <div class="lk-total"><span>В расчёт идут завершённые купоны. После
        закрытия месяца остаётся 14 дней на споры, потом деньги
        уходят.</span></div>`)}
      ${panel("Реквизиты для выплат", `<div class="lk-f">
        ${field("Получатель", input("", "ИП Партнёров И."))}
        <div class="lk-f__row">${field("ИНН", input("", "482600000000"))}${field("Счёт", input("", "40802…"))}</div>
      </div>`)}
    </div>`
    + panel("Детализация · " + pend.period, table(
        [{ t: "Купон" }, { t: "Контур" }, { t: "Клиент заплатил", num: true },
         { t: "Ваши " + LK_RATES.fee + "%", num: true }], detail))
    + panel("По периодам", table(
        [{ t: "Период" }, { t: "Начислено", num: true }, { t: "К выплате", num: true },
         { t: "Статус" }, { t: "", num: true }], rows)
      + `<div class="lk-total"><b>${rub(paid)}</b><span>выплачено за всё время</span></div>`);
};

VIEWS["partner:profile"] = () => {
  const avgCoupons = (LK_CLIENTS.reduce((a, c) => a + c.coupons, 0) / LK_CLIENTS.length).toFixed(1);
  const avgFee = Math.round(LK_CLIENTS.reduce((a, c) => a + c.fee, 0) / LK_CLIENTS.length);

  return head("Профиль партнёра")
    + kpi([
        { label: "Клиентов в месяц",     value: "2,0" },
        { label: "Купонов на клиента",   value: avgCoupons },
        { label: "Начисление с клиента", value: rub(avgFee) },
        { label: "Доживает до оплаты",   value: "67%" }
      ])
    + `<div class="lk-pair">
      ${panel("Партнёр", `<div class="lk-f">
        ${field("Имя или организация", input("", "ИП Партнёров И."))}
        <div class="lk-f__row">${field("Телефон", input("", "+7 900 000-00-00"))}${field("Почта", input("", "partner@example.ru"))}</div>
        ${field("Города ответственности", input("", LK_CITIES.map(c => c.name).join(", "), true))}
      </div>`)}
      ${panel("Условия", `
        <ul class="lk-rules">
          <li>Вознаграждение — ${LK_RATES.fee}% от суммы, которую клиент
              заплатил за размещение. Одинаково для региона и маркетплейсов.</li>
          <li>Скидка селлеру по вашему промокоду — ${LK_RATES.discount}%.</li>
          <li>Выплата раз в месяц, через 14 дней после закрытия периода.</li>
          <li>Города и закрепление клиентов меняет администратор.</li>
        </ul>`)}
    </div>`;
};

/* ==========================================================================
   Уведомления — общий раздел для обоих кабинетов
   ==========================================================================
   Каналы по ТЗ §4.3.1: почта, Telegram и Max на выбор. SMS не используем
   вообще — это отдельное решение, а не недоделка прототипа.

   Канал без привязки (Max) нельзя просто включить галочкой — присылать
   уведомления некуда, пока не указан контакт. Поэтому вместо статичной
   подписи «не подключён» у такого канала — поле ввода: включил канал,
   вписал ник, нажал «Сохранить». Само сохранение, как и везде в
   прототипе, ничего не пишет на сервер — только подтверждает действие. */
VIEWS["client:notifications"] = VIEWS["partner:notifications"] = () => {
  const list = LK_NOTIFICATIONS[state.role];
  const channels = LK_NOTIFY_CHANNELS.map(ch => {
    const linked = ch.value !== "не подключён";
    return `
    <div class="lk-chrow" data-notify-row="${ch.id}">
      <label class="lk-ch${ch.on ? " is-on" : ""}">
        <input type="checkbox" data-notify-ch="${ch.id}"${ch.on ? " checked" : ""}>
        <span>${ch.label}</span>
      </label>
      ${linked
        ? `<span class="lk-chrow__v">${ch.value}</span>`
        : `<input class="lk-i lk-chrow__inp" data-notify-handle="${ch.id}"
             placeholder="Ник в ${ch.label}, например @primer_coffee">`}
    </div>`;
  }).join("");

  return head("Уведомления",
      `<button class="btn btn--ghost">Отметить прочитанными</button>`)
    + `<div class="lk-pair">
      ${panel("", `<div class="lk-list">${list.map(n => `
        <div class="lk-list__i${n.unread ? " is-unread" : ""}">
          <i class="lk-list__d"></i>
          <div>${n.text}<div class="lk-list__w">${n.when}</div></div>
        </div>`).join("")}</div>`)}
      ${panel("Куда присылать", channels
        + `<div class="lk-note" style="margin-top:14px">Почта нужна всегда:
           на неё приходят чеки и решения модерации. Telegram и Max — на
           выбор, SMS сервис не отправляет.</div>`
        + `<div class="lk-head__act" style="margin-top:14px">
             <button class="btn btn--solid" data-notify-save>Сохранить</button>
             <span class="lk-save-ok" data-notify-ok hidden>Изменения сохранены</span>
           </div>`)}
    </div>`;
};

/* ==========================================================================
   Рендер
   ========================================================================== */
function render() {
  renderChrome();
  const key = state.role + ":" + state.view;
  const view = VIEWS[key];
  const host = qs("#lkView");

  host.innerHTML = view
    ? view()
    : head("Раздел не найден");

  /* Фильтры статусов */
  qsa("[data-f]", host).forEach(b => {
    if (b.tagName !== "BUTTON") return;
    b.onclick = () => { state.filter = b.dataset.f; render(); };
  });

  /* Внутренние переходы из карточек */
  qsa("[data-go]", host).forEach(a => a.onclick = e => { e.preventDefault(); go(a.dataset.go); });

  /* Запрос нового кода партнёра — открывает модалку (§4.4.3) */
  const codeBtn = qs("[data-request-code]", host);
  if (codeBtn) codeBtn.onclick = () => openCodeRequestModal();

  qsa("[data-coupon-row]", host).forEach(el => {
    el.onclick = () => go("coupon", Number(el.dataset.couponRow));
    el.onkeydown = e => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); el.click(); }
    };
  });

  /* Строка таблицы купонов открывает сам купон */
  qsa("tr[data-coupon]", host).forEach(tr => {
    tr.onclick = () => go("coupon", Number(tr.dataset.coupon));
    tr.onkeydown = e => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); tr.click(); }
    };
  });

  /* Карточка клиента открывается строкой списка — как и купон у клиента */
  qsa("[data-client]", host).forEach(el => {
    el.onclick = () => go("client", Number(el.dataset.client));
    el.onkeydown = e => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); el.click(); }
    };
  });

  /* Живой предпросмотр величины скидки в форме создания */
  const val = qs("#pvVal", host);
  if (val) {
    const mech = qs('[data-f="mech"]', host);
    const size = qsa(".lk-i", host).find(i => i.placeholder === "−30%");
    const sync = () => {
      const m = LK_MECHANICS.find(x => x.label === (mech && mech.value));
      val.textContent = (size && size.value) || (m && m.sample) || "−30%";
    };
    if (mech) mech.onchange = sync;
    if (size) size.oninput = sync;
  }

  /* Калькулятор размещения. Цена собирается из ниши, городов, срока и
     пакета соцсетей — по ТЗ §4.3.5 клиент должен видеть её прямо в мастере,
     а не узнавать на шаге оплаты. Пересчитываем на каждое изменение. */
  const calc = qs("#lkCalc", host);
  if (calc) {
    const nicheSel = qs('[data-f="niche"]', host);
    const daysSel  = qs('[data-f="days"]', host);
    const pvNiche  = qs("#pvNiche", host);
    const pay      = qs("#lkPay", host);
    const range    = pay && qs("[data-pay-range]", pay);

    const cities = () => qsa("[data-city].is-on", host).map(b => b.dataset.city);
    const chans  = () => qsa("[data-ch]", host).filter(i => i.checked).map(i => i.dataset.ch);

    const recalc = () => {
      const dur = LK_DURATIONS.find(d => d.label === (daysSel && daysSel.value));
      const fee = calcFee(nicheSel && nicheSel.value, cities(), dur ? dur.days : 14, chans());
      qs('[data-calc="base"]', calc).textContent  = rub(fee.base);
      qs('[data-calc="extra"]', calc).textContent = rub(fee.extra);
      qs('[data-calc="total"]', calc).textContent = rub(fee.total);
      if (pvNiche && nicheSel) pvNiche.textContent = nicheSel.value;
      if (range) splitPay(fee.total);
      return fee;
    };

    /* Две суммы одной ручкой: бегунок делит цену между монетами и бонусами.
       Бонусами нельзя закрыть всё — минимум одна монета уходит реальными
       деньгами (ТЗ §4.3.2), поэтому доля бонусов упирается в потолок раньше,
       чем ползунок доезжает до правого края. Подсказка под слайдером и
       говорит, где сейчас этот потолок, а не молчит о нём. */
    function splitPay(total) {
      const pct = Number(range.value);
      const cap = Math.min(LK_BALANCE.bonuses, Math.max(0, total - LK_MIN_COINS));
      const want = Math.round(total * pct / 100);
      const bonuses = Math.min(want, cap);
      const coins = total - bonuses;
      qs('[data-pay="coins"]', pay).textContent   = rub(coins);
      qs('[data-pay="bonuses"]', pay).textContent = rub(bonuses);

      const hint = qs("[data-pay-hint]", pay);
      if (hint) {
        if (cap <= 0) {
          hint.textContent = "Бонусов на балансе нет — размещение целиком монетами.";
        } else if (bonuses === 0) {
          hint.textContent = "Бонусами пока не платите — доступно " + num(cap) +
            ". Перетащите ползунок вправо, чтобы часть суммы списалась ими.";
        } else if (want > cap) {
          hint.textContent = "Бонусами покрыт максимум — " + num(bonuses) +
            " из " + num(LK_BALANCE.bonuses) + " на балансе. Остальные " +
            rub(coins) + " — монетами.";
        } else {
          hint.textContent = "Бонусами покрыто " + num(bonuses) +
            ", монетами — " + rub(coins) + ".";
        }
      }

      /* Заливка слева от ползунка — обычный способ показать, что элемент
         реально двигается, а не просто рисунок под цифрами */
      range.style.background =
        "linear-gradient(to right, var(--ink) " + pct + "%, var(--surface-2) " + pct + "%)";
    }

    qsa("[data-city]", host).forEach(b => b.onclick = () => {
      /* Хотя бы один город обязателен: купон без города некуда положить */
      if (b.classList.contains("is-on") && cities().length === 1) return;
      b.classList.toggle("is-on");
      recalc();
    });
    qsa("[data-ch]", host).forEach(i => i.onchange = () => {
      i.closest(".lk-ch").classList.toggle("is-on", i.checked);
      recalc();
    });
    if (nicheSel) nicheSel.onchange = recalc;
    if (daysSel)  daysSel.onchange = recalc;
    if (range)    range.oninput = recalc;
    recalc();
  }

  /* Галочки вне мастера — каналы уведомлений и тайный покупатель */
  qsa(".lk-ch input:not([data-ch]):not([disabled])", host).forEach(i => {
    i.onchange = () => i.closest(".lk-ch").classList.toggle("is-on", i.checked);
  });

  /* Канал без привязки (Max) неактивен, пока не включена галочка: вводить
     ник, который не к чему присылать, незачем. Включили — поле оживает и
     сразу берёт фокус. */
  qsa("[data-notify-ch]", host).forEach(cb => {
    const row = cb.closest("[data-notify-row]");
    const inp = row && qs("[data-notify-handle]", row);
    if (!inp) return;
    const sync = focus => {
      inp.disabled = !cb.checked;
      if (focus && cb.checked) inp.focus();
    };
    sync(false);
    cb.addEventListener("change", () => sync(true));
  });

  /* «Сохранить» в уведомлениях: как и все формы прототипа, значения
     никуда не пишутся — только подтверждаем нажатие тем же способом, что
     и «Скопировано» на публичке. */
  const notifySave = qs("[data-notify-save]", host);
  if (notifySave) {
    notifySave.onclick = () => {
      const ok = qs("[data-notify-ok]", host);
      ok.hidden = false;
      clearTimeout(notifySave._hideTimer);
      notifySave._hideTimer = setTimeout(() => { ok.hidden = true; }, 2400);
    };
  }

  initIcons(host);
}

/* Шторка навигации на мобильном и модалка — закрываются по Escape */
document.addEventListener("keydown", e => {
  if (e.key !== "Escape") return;
  document.body.classList.remove("lk-nav-open");
  closeModal();
});

qs("#lkBurger").onclick = () => document.body.classList.toggle("lk-nav-open");
qs("#lkScrim").onclick  = () => document.body.classList.remove("lk-nav-open");

render();
