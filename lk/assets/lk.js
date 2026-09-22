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
  /* Мои купоны (созвон 10.09): раздел, поиск и сортировка. Раздел при
     каждом заходе на вкладку сбрасывается на «Все мои купоны». */
  sec: "all",
  q: "",
  sort: "new",
  couponPage: 1,
  /* Механика, с которой открыть конструктор — из «Топовых механик» */
  preMech: null,
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
    archive: "Архив купонов", coupon: "Купон", repeat: "Опубликовать снова", stats: "Статистика", billing: "Биллинг",
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
    if (id === "coupons") return LK_COUPONS.length;
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
               (/^(new-|repeat)/.test(state.view) && it.id === "coupons") ||
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
  /* У клиента одна кнопка на все разделы: сначала выбор раздела, потом
     конструктор под него (созвон 10.09 — три пункта в меню убраны) */
  cta.onclick = e => {
    e.preventDefault();
    if (state.role === "client") openCreateModal(); else go(main.view);
  };

  /* Кошелёк (созвон 10.09): баланс виден всегда, бонусы отдельно —
     клиент сразу замечает начисления. Клик ведёт в биллинг. */
  const wallet = qs("#lkWallet");
  if (wallet) {
    wallet.hidden = state.role !== "client";
    wallet.href = href("billing");
    wallet.innerHTML = `<span data-icon="wallet"></span>
      <b>${num(LK_BALANCE.coins)}</b><i>+${num(LK_BALANCE.bonuses)} бонусов</i>`;
    wallet.onclick = e => { e.preventDefault(); go("billing"); };
  }

  /* Колокольчик */
  const unread = LK_NOTIFICATIONS[state.role].filter(n => n.unread).length;
  qs("#lkDot").classList.toggle("is-on", unread > 0);
  const bell = qs("#lkBell");
  bell.href = href("notifications");
  bell.onclick = e => { e.preventDefault(); go("notifications"); };

  /* Кто в кабинете. По клику — профиль и выход: без выхода кабинет
     некуда закрыть. Выход возвращает на публичную часть. */
  /* Созвон 14.09: аватар и название компании — в шапке, чтобы кабинет
     выглядел своим. Клик по имени — профиль. */
  const me = qs("#lkMe");
  const acc = state.role === "client"
    ? { ava: LK_COMPANY.ava, name: LK_COMPANY.name, sub: "ИНН " + LK_COMPANY.inn }
    : { ava: "ИП", name: "Иван Партнёров", sub: "Партнёр · Липецк" };
  me.innerHTML = `
    <a class="lk__me-link" href="${href("profile")}" data-go="profile">
      <span class="lk__me-ava">${acc.ava}</span>
      <span class="lk__me-txt">
        <span class="lk__me-name">${acc.name}</span>
        <span class="lk__me-role">${acc.sub}</span>
      </span>
    </a>
    <a class="lk__me-exit" href="../index.html" title="Выйти" aria-label="Выйти">
      <span data-icon="exit"></span>
    </a>`;

  qsa("[data-go]", me).forEach(a => a.onclick = e => { e.preventDefault(); go(a.dataset.go); });

  initIcons();
}

function go(view, id, opts) {
  state.view = view;
  state.id = id || null;
  state.filter = "all";
  state.sec = "all";
  state.q = "";
  state.couponPage = 1;
  state.preMech = (opts && opts.mech) || null;
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

/* key — колонка с итоговой метрикой. «Забрали» это то, ради чего сервис
   и нужен: показы и просмотры объясняют, как до него дошли, а купон,
   который забрали, — результат. В таблице из четырёх одинаковых столбцов
   цифр он ничем не выделялся, хотя в статистике список ещё и отсортирован
   именно по нему. */
function table(cols, rows) {
  const th = c => {
    const cls = [c.num ? "num" : "", c.key ? "lk-t__key" : ""].filter(Boolean).join(" ");
    return `<th${cls ? ` class="${cls}"` : ""}>${c.t}</th>`;
  };
  return `<div class="lk-tw"><table class="lk-t">
    <thead><tr>${cols.map(th).join("")}</tr></thead>
    <tbody>${rows}</tbody></table></div>`;
}

function empty(title, text) {
  return `<div class="lk-empty"><b>${title}</b>${text}</div>`;
}

function field(label, control) {
  return `<label class="lk-l"><span class="lk-l__t">${label}</span>${control}</label>`;
}

function input(ph, val, locked, name) {
  return `<input class="lk-i" placeholder="${ph}"${name ? ` data-f="${name}"` : ""}${val ? ` value="${val}"` : ""}${locked ? " disabled" : ""}>`;
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
function openModal(bodyHtml, opts) {
  const el = modalRoot();
  qs(".lk-modal", el).classList.toggle("lk-modal--wide", !!(opts && opts.wide));
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

/* ==========================================================================
   Модалки кабинета клиента
   ========================================================================== */

/* «Создать купон» — один вход во все разделы (созвон 10.09): сначала
   раздел, потом конструктор под него. mech — механика из «Топовых
   механик», с ней конструктор откроется уже заполненным. */
function openCreateModal(mech) {
  const opts = [
    ["new-regional",    "Региональный купон", "Скидка в заведении или магазине вашего города — по коду с экрана"],
    ["new-marketplace", "Купон маркетплейса", "Промокод на товар на Wildberries, Ozon и других площадках"],
    ["new-business",    "Купон для бизнеса",  "Предложение для компаний: услуги, оборудование, подряд"]
  ];
  const el = openModal(`
    <h3>Какой купон создаём?</h3>
    <p class="lk-modal__lead">От раздела зависят поля конструктора и то, где купон увидят.</p>
    <div class="lk-pick">${opts.map(o => `
      <button type="button" class="lk-pick__i" data-pick="${o[0]}">
        <b>${o[1]}</b><span>${o[2]}</span>
      </button>`).join("")}</div>`, { wide: true });
  qsa("[data-pick]", el).forEach(b => b.onclick = () => {
    closeModal();
    go(b.dataset.pick, null, { mech: mech });
  });
}

/* Прогресс по способам получить бонусы живёт в рамках вкладки — это демо */
const bonusDone = {};

function openBonusWays() {
  const el = openModal(`
    <h3>Как получить бонусы</h3>
    <p class="lk-modal__lead">Бонусами можно оплатить часть размещения. Хотя бы
    одна монета в каждой публикации всё равно уходит деньгами.</p>
    <div class="lk-ways" data-ways></div>`, { wide: true });

  const paint = () => {
    qs("[data-ways]", el).innerHTML = LK_BONUS_WAYS.map(w => {
      const used = bonusDone[w.id];
      const label = used
        ? (w.monthly ? "Доступно в октябре" : w.once ? "Получено" : "Готово")
        : w.act;
      return `<div class="lk-ways__i${used && (w.once || w.monthly) ? " is-used" : ""}">
        <div class="lk-ways__t"><b>${w.title}</b><span>${w.note}</span></div>
        <div class="lk-ways__r">+${w.reward}</div>
        <button class="btn ${used ? "btn--ghost" : "btn--solid"}" data-way="${w.id}"${used && (w.once || w.monthly) ? " disabled" : ""}>${label}</button>
      </div>`;
    }).join("");
    qsa("[data-way]", el).forEach(b => b.onclick = () => {
      const id = b.dataset.way;
      if (id === "survey") { openSurvey(); return; }
      bonusDone[id] = true;
      if (id === "register") { LK_BALANCE.bonuses += 500; renderChrome(); }
      paint();
    });
  };
  paint();
}

/* Консультация специалиста (созвон 14.09): бесплатно, форма, а не чат.
   Пояснение сразу отсекает жалобы и технические вопросы; одна заявка на
   купон; перезваниваем по телефону в течение 48 часов. */
const consultSent = {};

function openConsult() {
  const own = LK_COUPONS.filter(c => c.status !== "done");
  const el = openModal(`
    <h3>Консультация специалиста</h3>
    <div class="lk-warn" style="margin:10px 0 0">Здесь помогают придумать
    предложение и настроить купон, чтобы его забирали. С техническими
    вопросами и жалобами — в поддержку, так вам ответят быстрее.</div>
    <div class="lk-f">
      ${field("По какому купону", `<select class="lk-s" data-c-coupon>
        <option value="new">Новый купон — ещё не создан</option>
        ${own.map(c => `<option value="${c.id}"${consultSent[c.id] ? " disabled" : ""}>${c.title}${consultSent[c.id] ? " — заявка уже отправлена" : ""}</option>`).join("")}
      </select>`)}
      ${field("Что хотите получить", `<textarea class="lk-ta" placeholder="Например: открываем вторую точку и хотим привести новых гостей в будни"></textarea>`)}
      ${field("Телефон для звонка", `<input class="lk-i" value="+7 900 000-00-00">`)}
    </div>
    <div class="lk-note" style="margin-top:10px">Это не онлайн-чат: специалист
    позвонит в течение 48 часов. На один купон — одна заявка.</div>
    <div class="lk-head__act" style="margin:16px 0 0">
      <button class="btn btn--solid btn--lg" data-c-send>Отправить заявку</button>
    </div>`, { wide: true });

  qs("[data-c-send]", el).onclick = () => {
    const sel = qs("[data-c-coupon]", el).value;
    if (sel !== "new") consultSent[sel] = true;
    qs(".lk-modal__body", el).innerHTML = `
      <h3>Заявка принята</h3>
      <p class="lk-modal__lead">Специалист позвонит в течение 48 часов по
      рабочим дням. Если вопрос решится раньше — просто скажите об этом при звонке.</p>
      <div class="lk-head__act" style="margin:16px 0 0">
        <button class="btn btn--solid" data-modal-close>Понятно</button>
      </div>`;
    qsa("[data-modal-close]", el).forEach(b => b.onclick = closeModal);
  };
}

/* ИИ-консультант (эскиз 14.09). В прототипе — заготовленные ответы по
   ключевым словам, чтобы показать сценарий, а не модель. */
const AI_ANSWERS = [
  [/механик|скидк|предложен/i, "Для кофейни в Липецке сейчас лучше всего работает «Подарок к покупке» — например, десерт к любому напитку. Такой купон забирают чаще, чем скидку в процентах. Создать купон с этой механикой?"],
  [/срок|дней|долго/i, "Советуем 30 дней: за первую неделю купон только набирает показы в ленте и соцсетях. Короткий срок обычно заканчивается раньше, чем о купоне узнают."],
  [/бонус/i, "Бонусы дают за регистрацию, анкету о компании, приглашённых друзей и репосты. Ими можно оплатить часть размещения — хотя бы одна монета уходит деньгами."],
  [/соцсет|канал|вконтакт|telegram|телеграм/i, "Соцсети увеличивают просмотры купона в 3–4 раза каждая. Если убрать все, купон увидят только на сайте — почти все компании в вашей нише их оставляют."],
  [/заголов|назван/i, "Хороший заголовок начинается с выгоды и называет компанию: «Десерт в подарок к кофе — кофейня «Пример»». Короче 60 знаков, без капса."]
];

function openAiChat() {
  const el = openModal(`
    <h3>ИИ-консультант</h3>
    <div class="lk-chat" data-chat>
      <div class="lk-chat__m">Здравствуйте! Помогу выбрать механику, срок и заголовок
      купона. О чём спросите?</div>
    </div>
    <div class="lk-chat__chips">
      ${["Какую механику выбрать?", "Какой срок поставить?", "Как получить бонусы?"]
        .map(q => `<button type="button" class="lk-chipbtn" data-chat-q>${q}</button>`).join("")}
    </div>
    <div class="lk-chat__in">
      <input class="lk-i" placeholder="Напишите вопрос" data-chat-input>
      <button class="btn btn--solid" data-chat-send>Отправить</button>
    </div>`, { wide: true });

  const box = qs("[data-chat]", el);
  const inp = qs("[data-chat-input]", el);
  const say = (text, me) => {
    box.insertAdjacentHTML("beforeend", `<div class="lk-chat__m${me ? " is-me" : ""}">${text}</div>`);
    box.scrollTop = box.scrollHeight;
  };
  const ask = q => {
    if (!q.trim()) return;
    say(q.replace(/</g, "&lt;"), true);
    inp.value = "";
    const hit = AI_ANSWERS.find(a => a[0].test(q));
    setTimeout(() => say(hit ? hit[1] : "Уточните, пожалуйста: вопрос про механику, срок, заголовок, бонусы или каналы публикации?"), 700);
  };
  qs("[data-chat-send]", el).onclick = () => ask(inp.value);
  inp.onkeydown = e => { if (e.key === "Enter") ask(inp.value); };
  qsa("[data-chat-q]", el).forEach(b => b.onclick = () => ask(b.textContent));
  inp.focus();
}

/* Анкета о компании (созвон 14.09): регистрация сокращена до обязательных
   полей, остальное — здесь, за бонусы. Список вопросов — черновой, его
   собирает Павел; ответы помогают подсказкам и ИИ-консультанту. */
function openSurvey() {
  const q = (label, opts) => field(label, `<select class="lk-s">${opts.map(o => `<option>${o}</option>`).join("")}</select>`);
  const el = openModal(`
    <h3>Расскажите о компании — получите 700 бонусов</h3>
    <p class="lk-modal__lead">Ответы помогут подсказывать механики и сроки
    именно под ваш бизнес. Займёт около 5 минут.</p>
    <div class="lk-f">
      <div class="lk-f__row">
        ${q("Как давно работает бизнес", ["Меньше года", "1–3 года", "Больше 3 лет"])}
        ${q("Сколько сотрудников", ["До 5", "6–20", "Больше 20"])}
      </div>
      <div class="lk-f__row">
        ${q("Сколько точек или филиалов", ["Одна", "2–5", "Больше 5", "Работаем онлайн"])}
        ${field("Средний чек, ₽", `<input class="lk-i" placeholder="650">`)}
      </div>
      ${q("Сколько готовы отдать на привлечение одного клиента", ["До 5% чека", "5–10%", "10–20%", "Пока не знаю"])}
      ${q("Опыт в рекламе", ["Запускаю впервые", "Пробовал(а) разное", "Работаю с маркетологом"])}
      ${field("Кто ваши клиенты", `<textarea class="lk-ta" placeholder="Студенты рядом с вузом, офисы в центре, семьи на выходных"></textarea>`)}
    </div>
    <div class="lk-head__act" style="margin:16px 0 0">
      <button class="btn btn--ghost" data-modal-close>Позже</button>
      <button class="btn btn--solid" data-survey-send>Отправить и получить бонусы</button>
    </div>`, { wide: true });

  qs("[data-survey-send]", el).onclick = () => {
    bonusDone.survey = true;
    LK_BALANCE.bonuses += 700;
    renderChrome();
    try { localStorage.setItem("lk_survey", "done"); } catch (e) {}
    hideSurveyPill();
    qs(".lk-modal__body", el).innerHTML = `
      <h3>Спасибо! Начислили 700 бонусов</h3>
      <p class="lk-modal__lead">Бонусы уже на балансе — ими можно оплатить часть следующего размещения.</p>
      <div class="lk-head__act" style="margin:16px 0 0">
        <button class="btn btn--solid" data-modal-close>Отлично</button>
      </div>`;
    qsa("[data-modal-close]", el).forEach(b => b.onclick = closeModal);
    if (state.view === "dashboard") render();
  };
}

/* При первом заходе в кабинет — приглашение пройти анкету (Дима, 14.09).
   Крупной модалкой показываем ровно один раз на браузер, чтобы не мешать
   работе. Дальше приглашение не пропадает совсем, а живёт свёрнутой
   плашкой в углу: анкета — это 700 бонусов и точность подсказок, и терять
   её из виду после одного «Позже» не за чем. */
function maybeSurveyPrompt() {
  let seen = null;
  try { seen = localStorage.getItem("lk_survey"); } catch (e) { return; }
  if (seen === "done") return;

  /* Крестик на свёрнутой плашке прячет её до следующего захода в кабинет,
     поэтому память об этом — на сессию, а не на браузер. */
  let hidden = null;
  try { hidden = sessionStorage.getItem("lk_survey_pill"); } catch (e) {}
  if (hidden) return;

  /* Модалку уже видели — дальше только плашка. Ею же встречаем и того, кто
     в первый раз зашёл сразу во внутренний раздел по прямой ссылке:
     перехватывать работу модалкой уместно на входе в кабинет, а не поверх
     биллинга или конструктора. */
  if (seen || state.view !== "dashboard") { showSurveyPill(); return; }

  try { localStorage.setItem("lk_survey", "shown"); } catch (e) {}
  const el = openModal(`
    <h3>Добро пожаловать в кабинет!</h3>
    <p class="lk-modal__lead">Ответьте на несколько вопросов о компании — начислим
    700 бонусов на оплату размещения, а подсказки в конструкторе станут точнее.
    Первый купон вы и так размещаете бесплатно.</p>
    <div class="lk-head__act" style="margin:16px 0 0">
      <button class="btn btn--ghost" data-survey-later>Позже</button>
      <button class="btn btn--solid" data-survey-open>Заполнить анкету</button>
    </div>`, { wide: true });
  qs("[data-survey-open]", el).onclick = openSurvey;
  /* И «Позже», и крестик модалки сворачивают приглашение, а не прячут его:
     оба — «не сейчас», а не «никогда». */
  qs("[data-survey-later]", el).onclick = collapseSurvey;
  qs(".lk-modal__x", el).onclick = collapseSurvey;
}

function collapseSurvey() {
  closeModal();
  showSurveyPill();
}

function hideSurveyPill() {
  const pill = document.getElementById("lkSurveyPill");
  if (pill) pill.remove();
}

/* Свёрнутое приглашение: висит во всех разделах кабинета, пока анкету не
   заполнили. Клик по плашке открывает анкету, крестик убирает её до
   следующего захода. */
function showSurveyPill() {
  if (document.getElementById("lkSurveyPill")) return;
  const el = document.createElement("div");
  el.id = "lkSurveyPill";
  el.className = "lk-pill";
  el.innerHTML = `
    <button type="button" class="lk-pill__body" data-pill-open>
      <b>Анкета о компании</b>
      <span>+700 бонусов · около 5 минут</span>
    </button>
    <button type="button" class="lk-pill__x" data-pill-hide aria-label="Скрыть до следующего захода"></button>`;
  document.body.appendChild(el);
  qs("[data-pill-open]", el).onclick = openSurvey;
  qs("[data-pill-hide]", el).onclick = () => {
    try { sessionStorage.setItem("lk_survey_pill", "hidden"); } catch (e) {}
    hideSurveyPill();
  };
}

/* Где размещён купон. Городов у купона может быть несколько (city_ids[]),
   у маркетплейсного вместо города площадка: он действует в корзине. */
function where(c) {
  if (c.l1 === "marketplace") return c.market;
  if (!c.cities || !c.cities.length) return "город не выбран";
  /* Созвон 10.09: не «километровой» строкой, а первый город и счётчик */
  return c.cities.length > 1
    ? c.cities[0] + " +" + (c.cities.length - 1)
    : c.cities[0];
}

/* ==========================================================================
   Калькулятор размещения (ТЗ v7.0 §4.3.5)
   ==========================================================================
   publish_fee = base(ниша) × region_k(город) × duration_k + пакет каналов.
   Ставка берётся с ниши, а не с раздела. Города складываются: купон в двух
   городах — две витрины и два автопоста. Сами коэффициенты — заглушка,
   пять критериев тарифа ещё не посчитаны (задача Will Charges). */
function calcFee(nicheName, cityNames, days, channelIds, secret) {
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
  /* Тайный покупатель — за каждый город отдельный визит (созвон 10.09) */
  const check = secret ? LK_SECRET.price * (cityNames || []).length : 0;
  return { base: base, extra: extra, secret: check, total: base + extra + check };
}

/* ==========================================================================
   Разделы кабинета клиента
   ========================================================================== */
const VIEWS = {};

/* Дашборд — по эскизу Вилла и Павла (созвон 14.09). Это вход в воронку:
   под каждым блоком действие — исправить купон, получить бонусы,
   пополнить, создать купон с сильной механикой, позвать эксперта.
   Заголовок — слоган вместо слова «Дашборд» (созвон 10.09). */
VIEWS["client:dashboard"] = () => {
  const live = LK_COUPONS.filter(c => c.status === "live");
  const sum = k => LK_COUPONS.reduce((a, c) => a + c[k], 0);
  const attention = LK_COUPONS.filter(c => c.status === "rejected" || c.status === "draft");
  const mechLabel = id => (LK_MECHANICS.find(m => m.id === id) || {}).label || id;

  return head(
      "Привлекай тех, кто уже ищет, что купить",
      `<a class="btn lk-head__more" href="${href("stats")}" data-go="stats">Подробнее</a>`
    )
    + kpi(LK_METRICS.map(m => ({ label: m.label, value: num(sum(m.id)) })))
    + `<div class="lk-pair">
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

    <div class="lk-panel lk-bal">
      <div class="lk-bal__part">
        <div class="lk-bal__n"><span>Бонусы</span><b>${num(LK_BALANCE.bonuses)}</b></div>
        <div class="lk-bal__n lk-bal__n--burn"><span>Скоро сгорят</span><b>${num(LK_BONUS_BURN_SOON.amount)}</b>
          <em>до ${LK_BONUS_BURN_SOON.date}</em></div>
        <button class="btn btn--ghost" data-bonus-ways>Получить бонусы</button>
      </div>
      <div class="lk-bal__part">
        <div class="lk-bal__n"><span>Баланс</span><b>${num(LK_BALANCE.coins)}</b></div>
        <a class="btn btn--solid" href="${href("billing")}" data-go="billing">Пополнить</a>
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
      <p class="lk-help__lead">Получите помощь эксперта или задайте вопрос ИИ-консультанту.</p>
      <div class="lk-help__grid">
        <div class="lk-help__c">
          <b>Консультация специалиста</b>
          <p>Маркетолог сервиса разберёт вашу задачу и подскажет, с каким
          предложением выйти, чтобы купон забирали. Перезвоним в течение 48 часов.</p>
          <button class="btn btn--ghost btn--lg" data-consult>Получить консультацию</button>
        </div>
        <div class="lk-help__c">
          <b>ИИ-консультант</b>
          <p>Ответит сразу: подскажет механику, срок и заголовок купона,
          объяснит, как работают бонусы и каналы публикации.</p>
          <button class="btn btn--solid btn--lg" data-ai-chat>Задать вопрос в чате</button>
        </div>
      </div>
    </div>`;
};

/* Мои купоны — рабочий стол воронки (созвон 10.09). У каждой строки слева
   действие по статусу; метрик достаточно, цены здесь нет. Фильтры в два
   уровня: раздел витрины и статус, плюс поиск, сортировка и постраничная
   навигация. */
const COUPON_ACTIONS = {
  draft:      [["Редактировать", "edit"], ["Опубликовать", "edit"]],
  moderation: [["Снять с модерации", "unmod"]],
  rejected:   [["Редактировать", "edit"]],
  done:       [["Опубликовать снова", "repeat"]],
  live:       []
};
const STATUS_TAB = { draft: "Черновики", moderation: "На модерации", live: "Опубликованы", rejected: "Отклонены", done: "Архив" };

function couponActions(c) {
  const acts = COUPON_ACTIONS[c.status] || [];
  return acts.length
    ? `<div class="lk-acts">${acts.map((a, i) => `<button class="btn ${i === acts.length - 1 && c.status !== "moderation" ? "btn--solid" : "btn--ghost"}"
        data-act="${a[1]}" data-id="${c.id}">${a[0]}</button>`).join("")}</div>`
    : `<span class="lk-t__sub">—</span>`;
}

VIEWS["client:coupons"] = () => {
  const bySec = state.sec === "all" ? LK_COUPONS : LK_COUPONS.filter(c => c.l1 === state.sec);
  const counts = {};
  bySec.forEach(c => counts[c.status] = (counts[c.status] || 0) + 1);
  let list = state.filter === "all" ? bySec : bySec.filter(c => c.status === state.filter);

  const needle = state.q.trim().toLowerCase();
  if (needle) list = list.filter(c => c.title.toLowerCase().indexOf(needle) !== -1);

  const sorters = {
    new:   (a, b) => b.id - a.id,
    taken: (a, b) => b.taken - a.taken,
    shown: (a, b) => b.shown - a.shown
  };
  list = list.slice().sort(sorters[state.sort] || sorters.new);

  const pageSize = 5;
  const pageCount = Math.max(1, Math.ceil(list.length / pageSize));
  state.couponPage = Math.min(Math.max(1, state.couponPage || 1), pageCount);
  const pageStart = (state.couponPage - 1) * pageSize;
  const pageList = list.slice(pageStart, pageStart + pageSize);

  /* Фильтров два, но ярус один. Статус — рабочая воронка (черновик →
     модерация → опубликован → отклонён → архив): его переключают постоянно,
     и счётчик у каждого состояния сразу показывает, где скопилась работа,
     поэтому статусы остаются чипами в один ряд.

     Раздел витрины переключают редко — он уехал в выпадающий список к
     поиску и сортировке. Раньше он занимал второй ярус чипов, и два ряда
     плашек подряд читались тяжелее, чем сама таблица под ними. Счётчики
     из чипов перенесены в подписи пунктов, чтобы ничего не потерялось, а
     «Только …» в названии не даёт прочитать пункт как раздел меню. */
  const secs = [["all", "Все мои купоны"]]
    .concat(Object.keys(LK_VERTICALS).map(k => [k, "Только " + LK_VERTICALS[k].name.toLowerCase()]));
  const secSelect = `<select class="lk-s lk-tools__sec" data-sec-select aria-label="Раздел витрины">
    ${secs.map(([k, label]) => {
      const n = k === "all" ? LK_COUPONS.length : LK_COUPONS.filter(c => c.l1 === k).length;
      return `<option value="${k}"${state.sec === k ? " selected" : ""}>${label} (${n})</option>`;
    }).join("")}
  </select>`;

  const filters = `<div class="lk-filters">
    <button data-f="all"${state.filter === "all" ? ' class="is-on"' : ""}>Все статусы<span class="lk__n">${bySec.length}</span></button>
    ${["draft", "moderation", "live", "rejected", "done"].filter(s => counts[s])
      .map(s => `<button data-f="${s}"${state.filter === s ? ' class="is-on"' : ""}>${STATUS_TAB[s]}<span class="lk__n">${counts[s]}</span></button>`).join("")}
  </div>`;

  /* Слева — два списка, которыми набирают и раскладывают список: раздел и
     порядок. Оба управляют одним и тем же — что и в каком порядке лежит в
     таблице, — поэтому стоят рядом, а не по разным краям строки. Поиск
     занимает весь остаток: он не настройка списка, а способ выдернуть из
     него одну строку. */
  const tools = `<div class="lk-tools">
    ${secSelect}
    <select class="lk-s lk-tools__sort" data-sort>
      ${[["new", "Сначала новые"], ["taken", "Больше всего забрали"], ["shown", "Больше всего показов"]]
        .map(([k, l]) => `<option value="${k}"${state.sort === k ? " selected" : ""}>${l}</option>`).join("")}
    </select>
    <input class="lk-i lk-tools__q" type="search" placeholder="Поиск по названию купона" data-q value="${state.q}">
  </div>`;

  const mech = c => (LK_MECHANICS.find(m => m.id === c.mech) || {}).label || "—";
  const rows = pageList.map(c => `<tr data-coupon="${c.id}" tabindex="0" data-title="${c.title.toLowerCase()}">
    <td class="lk-t__acts">${couponActions(c)}</td>
    <td><b class="lk-t__title">${c.title}</b>
        <span class="lk-t__sub">${LK_VERTICALS[c.l1].name} · ${c.niche} · ${where(c)}</span></td>
    <td>${mech(c)}<div class="lk-t__sub"><span class="lk-chip">${c.value}</span></div></td>
    <td>${c.status === "done" ? `<span class="lk-st lk-st--done">Архив</span>` : status(c.status)}${c.status === "rejected" ? `<div class="lk-t__sub">${c.reject}</div>` : ""}</td>
    <td>${c.from === "—" ? "<span class='lk-t__sub'>срок не задан</span>" : c.from + " — " + c.to}
        <div class="lk-erid">erid: ${c.erid}</div></td>
    <td class="num">${c.shown ? num(c.shown) : "—"}</td>
    <td class="num lk-t__key">${c.taken ? num(c.taken) : "—"}</td>
  </tr>`).join("");

  const pagination = list.length > pageSize ? `<nav class="lk-page" aria-label="Страницы списка купонов">
    <span class="lk-page__meta">${pageStart + 1}–${Math.min(pageStart + pageSize, list.length)} из ${list.length}</span>
    <div class="lk-page__nav">
      <button type="button" class="lk-page__btn lk-page__arrow" data-page="${state.couponPage - 1}"
        aria-label="Предыдущая страница"${state.couponPage === 1 ? " disabled" : ""}>←</button>
      ${Array.from({ length: pageCount }, (_, i) => i + 1).map(page => `
        <button type="button" class="lk-page__btn${page === state.couponPage ? " is-current" : ""}"
          data-page="${page}"${page === state.couponPage ? ' aria-current="page"' : ""}>${page}</button>`).join("")}
      <button type="button" class="lk-page__btn lk-page__arrow" data-page="${state.couponPage + 1}"
        aria-label="Следующая страница"${state.couponPage === pageCount ? " disabled" : ""}>→</button>
    </div>
  </nav>` : "";

  return head("Мои купоны",
      `<button class="btn btn--solid" data-create>Создать купон</button>`)
    + panel("", filters + tools + (list.length
        ? table([{ t: "Действие" }, { t: "Купон" }, { t: "Механика" }, { t: "Статус" }, { t: "Срок действия" },
                 { t: "Показы", num: true }, { t: "Забрали", num: true, key: true }], rows) + pagination
        : needle
          ? empty("Ничего не нашли", "Проверьте название или сбросьте поиск.")
          : empty("Здесь пока пусто", state.sec === "all"
            ? "Смените фильтр, чтобы увидеть остальные купоны."
            : "В этом разделе у вас нет купонов. Создайте первый — кнопка справа вверху.")));
};

/* Повторная публикация купона из архива: те же условия, новые даты и
   промокод, заново на модерацию */
VIEWS["client:repeat"] = () => {
  const c = LK_COUPONS.find(x => x.id === state.id);
  if (!c) return head("Купон не найден");
  const copy = Object.assign({}, c, { status: "draft", from: "—", to: "—", code: "—", erid: "—" });
  return head("Опубликовать снова",
      `<a class="btn btn--ghost" href="${href("coupons")}" data-go="coupons">К списку</a>`)
    + `<div class="lk-sub"><span>Условия взяты из купона «${c.title}». Задайте новые даты и промокод.</span></div>`
    + couponForm(c.l1, copy, false);
};

/* Форма создания купона. Набор полей выведен из созвонов, а не придуман:
   срок — двумя датами (Коля просил период, а не «сколько дней»), ЕРИД
   уникальный на каждое объявление, ссылки на сайт и соцсети обязательны
   (переходы туда — ключевая метрика), изображение 4:5 под ленты соцсетей.

   Устройство — по созвону 16.09.2026. Квиз «один экран — один вопрос»
   отклонили: остаётся одна страница с превью справа, чтобы был виден
   прогресс и любой блок можно было поправить. Сначала то, что меняет
   купон (ниша, предложение со сроком и кодом), потом города и адреса.
   Изображение — отдельный последний блок: генерация стоит денег, поэтому
   открывается, только когда заполнено остальное, и ограничена попытками
   на купон. Текст на превью накладывается сразу, без нейросети. */
function couponForm(l1, c, locked) {
  const isMarket = l1 === "marketplace";
  const v = c || (state.preMech ? { mech: state.preMech } : {});
  const ro = locked ? " disabled" : "";
  const vert = LK_VERTICALS[l1];
  const niches = LK_NICHES[l1].map(n => n.name);
  const cities = v.cities || [LK_CITIES[0].name];
  const chans = v.channels || LK_CHANNELS.map(x => x.id);
  const days = v.days || 14;
  const fee = calcFee(v.niche || niches[0], cities, days, chans.filter(x => x !== "site"), !!v.secret);
  const reach = LK_REACH[v.niche || niches[0]] || LK_REACH.base;
  const times = n => String(n).replace(".", ",");
  const clean = x => x && x !== "—" ? x : null;
  /* Адреса купона. У созданного купона — первая точка компании, у нового
     ничего не отмечено: адрес клиент выбирает сам. */
  const addrs = v.addresses || (c ? [LK_ADDRESSES[0].addr] : []);
  /* Картинка есть у всего, что уже уходило на модерацию */
  const img = v.img || (c && c.status !== "draft" ? "upload" : null);

  /* У маркетплейса вместо адреса точки — площадка и артикул */
  const market = isMarket
    ? `<div class="lk-f__row">
        ${field("Маркетплейс", select(LK_MARKETS, null, v.market, locked))}
        ${field("Артикул товара", input("184 220 933", v.article, locked, "article"))}
       </div>
       ${field("Ссылка на карточку товара", input("https://…", null, locked))}`
    : "";

  /* Города — мультивыбор: купон размещается сразу в нескольких (city_ids[]),
     и каждый добавленный город увеличивает цену. Одним выпадающим списком
     это не задать, поэтому переключатели. */
  const cityChips = LK_CITIES.map(x => `
    <button type="button" class="lk-chipbtn${cities.indexOf(x.name) !== -1 ? " is-on" : ""}"
      data-city="${x.name}"${ro}>${x.name}</button>`).join("");

  /* Адреса применения купона (созвон 16.09): у сетевых точек их бывает
     несколько, поэтому список с «+ Добавить адрес». Сначала показываем
     точки из карточки компании, новый адрес ищется по базе адресов и
     сохраняется в карточку — в следующий раз не тратим запрос на поиск. */
  const addrBlock = isMarket ? "" : `
    <div class="lk-addr">
      <span class="lk-l__t">Адреса, где действует купон</span>
      <div class="lk-checks" data-addr-list>
        ${LK_ADDRESSES.map(a => addrRow(a, addrs.indexOf(a.addr) !== -1, locked)).join("")}
      </div>
      ${locked ? "" : `
        <div class="lk-addr__add" data-addr-add hidden>
          <input class="lk-i" list="lkAddrSuggest" placeholder="Начните вводить адрес" data-addr-input>
          <datalist id="lkAddrSuggest">${LK_ADDRESS_SUGGEST.map(s =>
            `<option value="${s.city}, ${s.addr}">`).join("")}</datalist>
        </div>
        <button type="button" class="lk-addr__plus" data-addr-plus>+ Добавить адрес</button>
        <div class="lk-note">Адреса берём из карточки компании. Новый найдём
        по базе адресов и сохраним в карточку — в следующий раз он будет в
        этом списке.</div>`}
    </div>`;

  const channelRows = LK_CHANNELS.map(ch => ch.fixed
    ? `<label class="lk-ch is-on is-fixed"><input type="checkbox" checked disabled><span>${ch.label}</span><i>входит всегда</i></label>`
    : `<label class="lk-ch${chans.indexOf(ch.id) !== -1 ? " is-on" : ""}">
        <input type="checkbox" data-ch="${ch.id}"${chans.indexOf(ch.id) !== -1 ? " checked" : ""}${ro}>
        <span>${ch.label}</span><i data-reach="${ch.id}">просмотры × ${times(reach[ch.id])}</i></label>`).join("");

  const mech = (LK_MECHANICS.find(m => m.id === v.mech) || {}).label;

  /* Блок изображения. Два пути: свой креатив или генерация. Свой — дешевле
     для нас и быстрее для клиента, поэтому он открыт по умолчанию. */
  const imgPanel = locked
    ? panel("Изображение купона", `<div class="lk-note">${img === "gen"
        ? "Сгенерировано в сервисе" : "Загружено компанией"}. Скидка, заголовок
        и срок наложены поверх текстом.</div>`)
    : panel("Изображение купона", `
      <div class="lk-img" data-img>
        <div class="lk-img__lock" data-img-lock>
          <b>Откроется, когда купон заполнен</b>
          Картинку подбираем последней: к этому моменту понятно, что за
          предложение, и промпт для генерации соберётся из ваших ответов.
          <ul class="lk-img__todo" data-img-todo></ul>
        </div>
        <div data-img-body hidden>
          <div class="lk-seg">
            <button type="button" class="is-on" data-img-tab="upload">Загрузить своё</button>
            <button type="button" data-img-tab="gen">Сгенерировать</button>
          </div>

          <div class="lk-img__up" data-img-pane="upload">
            <button type="button" class="lk-drop" data-img-drop>Перетащите файл<br>или выберите на компьютере<br><br>Пропорция 4:5</button>
            <div class="lk-f">
              <div class="lk-warn lk-warn--tight">Используйте только изображения,
              на которые у вас есть права. Картинки из поиска почти всегда
              кому-то принадлежат — правообладатели выставляют за них претензии
              на десятки тысяч рублей. Ответственность несёт компания, см.
              <a href="#" class="lk-link">оферту</a>.</div>
              <div data-img-rights>${check("Подтверждаю, что у компании есть права на это изображение", false, "rights")}</div>
              <div class="lk-note">Скидку, заголовок и срок наложим поверх
              картинки сами — писать их на изображении не нужно. Своё
              изображение не тратит попытки генерации.</div>
            </div>
          </div>

          <div class="lk-f" data-img-pane="gen" hidden>
            <label class="lk-l"><span class="lk-l__t">Промпт</span>
              <textarea class="lk-ta" data-img-prompt></textarea></label>
            <div class="lk-img__bar">
              <button type="button" class="btn btn--ghost" data-img-rebuild>Собрать из полей заново</button>
              <span class="lk-img__left" data-img-left></span>
              <button type="button" class="btn btn--solid" data-img-gen>Сгенерировать</button>
            </div>
            <div class="lk-img__grid" data-img-grid></div>
            <div class="lk-note">Промпт собран из ниши, предложения и городов —
            поправьте его, если нужно. На один купон ${LK_GEN_LIMIT} попыток,
            каждая занимает несколько секунд. Понравившийся вариант выберите
            кликом.</div>
          </div>
        </div>
      </div>`);

  /* Водяной знак (созвон 16.09): пока купон создаётся — по диагонали на всё
     изображение, после публикации — маленький в углу, навсегда. Текст
     знака — заглушка, знак рисует Иван вместе с дизайном купона. */
  const wm = locked
    ? `<span class="lk-wm-corner"><i></i>Сделано на сервисе</span>`
    : `<div class="lk-wm" aria-hidden="true">${Array(18).fill("<span>Сделано на сервисе</span>").join("")}</div>`;
  const mediaCls = locked && img ? " has-img " + (img === "gen" ? "lk-gen--2" : "lk-up") : "";

  return `<div class="lk-form">
    <div>
      ${panel("Раздел и ниша", `<div class="lk-f">
        <div class="lk-note">${vert.name} · ${vert.hint}</div>
        ${field("Ниша", select(niches, "niche", v.niche, locked))}
        ${market}
      </div>`)}

      ${panel("Предложение", `<div class="lk-f">
        ${field("Заголовок купона", input("Комбо-обед по будням до 16:00", v.title, locked, "title"))}
        ${locked ? "" : `<div class="lk-ai" data-ai-titles>
          <div class="lk-ai__h">Варианты от нейросети — нажмите, чтобы подставить</div>
          <div class="lk-ai__list" data-ai-list></div>
        </div>`}
        <div class="lk-f__row">
          ${field("Механика", select(LK_MECHANICS.map(m => m.label), "mech", mech, locked))}
          ${field("Величина", input("−30%", v.value, locked, "value"))}
        </div>
        ${locked ? "" : `<div class="lk-tip" data-tip-mech hidden></div>`}
        <div class="lk-f__row">
          ${field("Действует с", input("3 сентября 2026", clean(v.from), locked, "from"))}
          ${field("по", input("24 сентября 2026", clean(v.to), locked, "to"))}
        </div>
        <div class="lk-f__row">
          ${field("Срок размещения", select(LK_DURATIONS.map(d => d.label), "days",
              (LK_DURATIONS.find(d => d.days === days) || {}).label, locked))}
          ${isMarket
            ? field("Промокод", input("Код из кабинета продавца", clean(v.code), locked, "code"))
            : field("Промокод — напишите сами или сгенерируйте", `<div class="lk-code">
                ${input("LUNCH30", clean(v.code), locked, "code")}
                ${locked ? "" : `<button type="button" class="btn btn--ghost" data-code-gen>Сгенерировать</button>`}
              </div>`)}
        </div>
        ${locked ? "" : `<div class="lk-tip" data-tip-days hidden></div>`}
        ${locked ? "" : `<div class="lk-note">${isMarket
          ? "Промокод создаётся в кабинете продавца на площадке — впишите его как есть."
          : "В сгенерированный код добавляем префикс сервиса — так видно, что клиент пришёл от нас. Свой код публикуем без изменений."}</div>`}
        ${field("Как воспользоваться", `<textarea class="lk-ta" placeholder="Покажите код на кассе или назовите администратору при оплате."${ro}></textarea>`)}
      </div>`)}

      ${panel(isMarket ? "Города размещения" : "Города и адреса", `<div class="lk-f">
        <div>
          <div class="lk-chips">${cityChips}</div>
          <div class="lk-note" style="margin-top:12px">Купон появится в каталоге
          каждого выбранного города и уйдёт в его соцсети. Города других
          областей — по мере запуска сервиса.</div>
        </div>
        ${addrBlock}
      </div>`)}

      ${panel("Компания в купоне", `<div class="lk-f">
        <div class="lk-f__row">
          ${field("Сайт", input("https://…", LK_COMPANY.site, locked))}
          ${field("ВКонтакте", input("https://vk.com/…", LK_COMPANY.vk, locked))}
        </div>
        <div class="lk-f__row">
          ${field("Telegram", input("https://t.me/…", LK_COMPANY.tg, locked))}
          ${field("ERID", input("", clean(v.erid) || "будет присвоен при публикации", true))}
        </div>
        ${locked ? "" : `<div class="lk-note">Ссылки подставили из профиля компании — для этого купона их можно поправить.</div>`}
      </div>`)}

      ${panel("Каналы публикации", `
        <div class="lk-checks" data-channels>${channelRows}</div>
        <div class="lk-reach" data-reach-msg></div>
        <div class="lk-note" style="margin-top:12px">Публикуем в каналы выбранных
        городов, макеты собираются сами: один под сайт, один под ВКонтакте и
        Одноклассники, один под Telegram и Max.</div>`)}

      <div class="lk-panel lk-secret">
        <div class="lk-secret__top">
          <div>
            <div class="lk-secret__k">Проверка тайным покупателем</div>
            <h2 class="lk-secret__h">Проверенному купону доверяют в ${LK_SECRET.trust} раз больше</h2>
          </div>
          <div class="lk-secret__badge">✓ Проверено</div>
        </div>
        <ul class="lk-secret__list">
          <li>К вам придёт живой человек и воспользуется купоном, как обычный гость</li>
          <li>Визит — в течение ${LK_SECRET.days} после публикации</li>
          <li>После проверки на купоне появится бейдж «Проверено тайным покупателем»</li>
        </ul>
        <div class="lk-secret__foot">
          ${check("Добавить проверку", !!v.secret, "secret", locked)}
          <b data-secret-price>${rub(LK_SECRET.price * cities.length)}</b>
        </div>
        <div class="lk-note">${rub(LK_SECRET.price)} за каждый город размещения.</div>
      </div>

      ${imgPanel}

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
        ${locked ? "" : `<div class="lk-prog">
          <div class="lk-prog__t"><span>Купон заполнен</span><b data-prog-n>0%</b></div>
          <div class="lk-prog__bar"><i data-prog-bar></i></div>
        </div>`}
        <div class="lk-prev__card">
          <div class="lk-prev__media${mediaCls}" data-pv-media>
            <span class="lk-prev__erid">Реклама · erid: ${clean(v.erid) || "2Vt…"}</span>
            <span class="lk-prev__val" id="pvVal">${v.value || "−30%"}</span>
            <span class="lk-prev__hold">Изображение — последним шагом</span>
            ${wm}
          </div>
          <div class="lk-prev__body">
            <div class="lk-prev__title" data-pv-title>${v.title || "Комбо-обед по будням до 16:00"}</div>
            <div class="lk-prev__tags" data-pv-tags></div>
            <div class="lk-prev__meta">Кофейня «Пример» · <span id="pvNiche">${v.niche || niches[0]}</span></div>
            <div class="lk-prev__trust" data-pv-trust${v.secret ? "" : " hidden"}>✓ Проверено тайным покупателем · доверие × ${LK_SECRET.trust}</div>
          </div>
        </div>
        ${locked ? "" : `<div class="lk-note" style="margin-top:12px">Текст
        появляется на купоне сразу, пока вы заполняете поля. Изображение
        добавляется в конце, до публикации по нему идёт водяной знак.</div>`}`)}

      ${panel("Стоимость размещения", `
        <div class="lk-calc" id="lkCalc">
          <div class="lk-calc__row"><span>Ниша, города и срок</span><b data-calc="base">${rub(fee.base)}</b></div>
          <div class="lk-calc__row"><span>Пакет соцсетей</span><b data-calc="extra">${rub(fee.extra)}</b></div>
          <div class="lk-calc__row"><span>Тайный покупатель</span><b data-calc="secret">${fee.secret ? rub(fee.secret) : "—"}</b></div>
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

/* Строка адреса в форме купона. data-addr-city — чтобы прятать точки
   городов, которые в купоне не выбраны. */
function addrRow(a, on, locked) {
  return `<label class="lk-ch${on ? " is-on" : ""}" data-addr-row data-addr-city="${a.city}">
    <input type="checkbox" data-addr-cb value="${a.addr}"${on ? " checked" : ""}${locked ? " disabled" : ""}>
    <span>${a.addr}</span><i>${a.city}</i></label>`;
}

const plural = (n, one, few, many) => {
  const d = n % 10, h = n % 100;
  return d === 1 && h !== 11 ? one : d >= 2 && d <= 4 && (h < 12 || h > 14) ? few : many;
};

/* ==========================================================================
   Конструктор купона (созвон 16.09.2026)
   ==========================================================================
   Превью обновляется на каждое поле, но только текстом: перегенерация
   картинки — это деньги и 3–4 секунды ожидания, поэтому изображение
   появляется одним отдельным шагом в конце. Генерация в прототипе
   имитируется задержкой, варианты — серые заглушки. */
function initCouponBuilder(host) {
  const form = qs(".lk-form", host);
  if (!form) return;

  const f   = name => qs(`[data-f="${name}"]`, form);
  const val = name => { const el = f(name); return el ? el.value.trim() : ""; };
  const media   = qs("[data-pv-media]", form);
  const pvVal   = qs("#pvVal", form);
  const pvTitle = qs("[data-pv-title]", form);
  const pvTags  = qs("[data-pv-tags]", form);
  const isMarket = !!f("article");

  const cities = () => qsa("[data-city].is-on", form).map(b => b.dataset.city);
  const addrs  = () => qsa("[data-addr-cb]", form)
    .filter(i => i.checked && !i.closest("[data-addr-row]").hidden).map(i => i.value);

  /* Что должно быть заполнено, прежде чем откроется изображение */
  const need = () => [
    ["Заголовок купона", val("title")],
    ["Величина скидки", val("value")],
    ["Срок действия — обе даты", val("from") && val("to")],
    ["Промокод", val("code")],
    isMarket ? ["Артикул товара", val("article")] : ["Хотя бы один адрес", addrs().length]
  ];

  const img = qs("[data-img]", form);
  const st = { src: null, variant: 0, variants: [], chosen: -1, left: LK_GEN_LIMIT, busy: false, touched: false };

  function sync() {
    const m = LK_MECHANICS.find(x => x.label === val("mech"));
    pvVal.textContent = val("value") || (m && m.sample) || "−30%";

    const title = val("title");
    pvTitle.textContent = title || "Заголовок купона";
    pvTitle.classList.toggle("is-empty", !title);

    /* Точки городов, которые сняли, прячем — и в купон они не идут */
    const cs = cities();
    qsa("[data-addr-row]", form).forEach(r => { r.hidden = cs.indexOf(r.dataset.addrCity) === -1; });

    const tags = [];
    if (val("from") && val("to")) tags.push(val("from") + " — " + val("to"));
    if (cs.length) tags.push(cs.join(", "));
    const a = addrs();
    if (a.length === 1) tags.push(a[0]);
    if (a.length > 1) tags.push(a.length + " " + plural(a.length, "адрес", "адреса", "адресов"));
    pvTags.innerHTML = tags.map(t => `<span>${t}</span>`).join("");

    if (!img) return;

    const list = need();
    const missing = list.filter(x => !x[1]).map(x => x[0]);
    const pct = Math.round((list.length - missing.length + (st.src ? 1 : 0)) / (list.length + 1) * 100);
    qs("[data-prog-n]", form).textContent = pct + "%";
    qs("[data-prog-bar]", form).style.width = pct + "%";

    qs("[data-img-lock]", img).hidden = !missing.length;
    qs("[data-img-body]", img).hidden = !!missing.length;
    qs("[data-img-todo]", img).innerHTML = missing.map(x => `<li>${x}</li>`).join("");

    const prompt = qs("[data-img-prompt]", img);
    if (!st.touched) prompt.value = buildPrompt();
  }

  function buildPrompt() {
    const cs = cities();
    return "Рекламное фото для купона: " + (val("title") || "предложение компании") +
      ". Ниша — " + val("niche").toLowerCase() + "." +
      (cs.length ? " Город — " + cs.join(", ") + "." : "") +
      " Вертикальный кадр 4:5, товар или услуга крупно, спокойный фон." +
      " Без текста на изображении: скидку и условия наложим сверху.";
  }

  /* Что стоит на превью: своё изображение или выбранный вариант генерации */
  function paintMedia() {
    media.className = "lk-prev__media" + (st.src
      ? " has-img " + (st.src === "upload" ? "lk-up" : "lk-gen--" + st.variants[st.chosen])
      : "");
  }

  /* Поля, адреса, города. Города переключаются кликом, класс меняется
     в своём обработчике — поэтому синхронизируемся после него. */
  form.addEventListener("input", sync);
  form.addEventListener("change", e => {
    if (e.target.matches("[data-addr-cb]")) e.target.closest(".lk-ch").classList.toggle("is-on", e.target.checked);
    sync();
  });
  form.addEventListener("click", e => { if (e.target.closest("[data-city]")) setTimeout(sync); });

  /* «+ Добавить адрес». В продукте — живой поиск по базе адресов,
     в прототипе — подсказки браузера из заготовленного списка. */
  const plus = qs("[data-addr-plus]", form);
  if (plus) {
    const add = qs("[data-addr-add]", form);
    const inp = qs("[data-addr-input]", form);
    plus.onclick = () => { add.hidden = false; inp.focus(); };
    inp.addEventListener("change", () => {
      const s = LK_ADDRESS_SUGGEST.find(x => x.city + ", " + x.addr === inp.value);
      if (!s) return;
      if (!qsa("[data-addr-cb]", form).some(i => i.value === s.addr)) {
        LK_ADDRESSES.push(s);
        qs("[data-addr-list]", form).insertAdjacentHTML("beforeend", addrRow(s, true, false));
      }
      const chip = qs(`[data-city="${s.city}"]`, form);
      if (chip && !chip.classList.contains("is-on")) chip.click();
      inp.value = "";
      add.hidden = true;
      sync();
    });
  }

  /* Варианты заголовка от нейросети (созвон 10.09): свой заголовок
     остаётся, рядом — варианты с пояснением; клик подставляет вариант.
     В прототипе варианты собираются по шаблонам из ниши и механики. */
  const aiList = qs("[data-ai-list]", form);
  function paintTitles() {
    if (!aiList) return;
    const value = val("value") || "−30%";
    const m = LK_MECHANICS.find(x => x.label === val("mech")) || LK_MECHANICS[0];
    const company = LK_COMPANY.name;
    /* Уже подставленный вариант не обрастает хвостами при повторной
       подсказке: снимаем то, что добавляют шаблоны */
    const own = val("title")
      .replace(" — " + company, "").replace(": только до конца месяца", "")
      .replace(/ по будням$/, "").replace(value + " · ", "");
    const core = own || { gift: "Подарок к покупке", twoforone: "Второй напиток бесплатно",
      amount: "Скидка на весь чек", percent: "Скидка на меню", friend: "Скидка за друга" }[m.id];
    const vars = [
      [core + " — " + company, "с названием компании: так купон узнают в ленте"],
      [(m.id === "gift" || m.id === "twoforone" ? "" : value + " · ") + core + " по будням", "выгода в начале — заметнее при пролистывании"],
      [core + ": только до конца месяца", "ограничение по времени — купон забирают быстрее"]
    ];
    aiList.innerHTML = vars.map(v => `<button type="button" class="lk-ai__i" data-ai-pick>
      <b>${v[0]}</b><span>${v[1]}</span></button>`).join("");
  }
  if (aiList) {
    let t;
    form.addEventListener("input", e => {
      if (e.target.matches('[data-f="title"], [data-f="value"]')) { clearTimeout(t); t = setTimeout(paintTitles, 500); }
    });
    form.addEventListener("change", e => { if (e.target.matches('[data-f="mech"]')) paintTitles(); });
    aiList.addEventListener("click", e => {
      const b = e.target.closest("[data-ai-pick]");
      if (!b) return;
      const inp = f("title");
      inp.value = qs("b", b).textContent;
      inp.dispatchEvent(new Event("input", { bubbles: true }));
    });
    paintTitles();
  }

  /* Подсказки при выборе механики и срока (созвон 10.09): мягко
     подталкиваем к выгодным сценариям, выбор остаётся за клиентом. */
  const tipMech = qs("[data-tip-mech]", form);
  const tipDays = qs("[data-tip-days]", form);
  function paintTips() {
    if (tipMech) {
      const niche = val("niche");
      const adv = LK_MECH_ADVICE[niche] || LK_MECH_ADVICE.base;
      const rec = LK_MECHANICS.find(x => x.id === adv.mech);
      const cur = val("mech");
      tipMech.hidden = !rec || rec.label === cur;
      if (rec) tipMech.innerHTML = `<span>В нише «${niche}» лучше работает «${rec.label}» — ${adv.why}.</span>
        <button type="button" class="btn btn--ghost" data-tip-mech-apply>Выбрать</button>`;
    }
    if (tipDays) {
      const d = LK_DURATIONS.find(x => x.label === val("days"));
      tipDays.hidden = !d || d.days >= LK_RECOMMENDED_DAYS;
      tipDays.innerHTML = `<span>Короткий срок: купон не успеет набрать просмотры. Рекомендуем ${LK_RECOMMENDED_DAYS} дней.</span>
        <button type="button" class="btn btn--ghost" data-tip-days-apply>Поставить ${LK_RECOMMENDED_DAYS} дней</button>`;
    }
  }
  form.addEventListener("change", e => { if (e.target.matches('[data-f="mech"], [data-f="days"], [data-f="niche"]')) paintTips(); });
  form.addEventListener("click", e => {
    const setSel = (name, label) => {
      const el = f(name);
      el.value = label;
      el.dispatchEvent(new Event("change", { bubbles: true }));
    };
    if (e.target.closest("[data-tip-mech-apply]")) {
      const adv = LK_MECH_ADVICE[val("niche")] || LK_MECH_ADVICE.base;
      setSel("mech", LK_MECHANICS.find(x => x.id === adv.mech).label);
    }
    if (e.target.closest("[data-tip-days-apply]")) {
      setSel("days", LK_DURATIONS.find(x => x.days === LK_RECOMMENDED_DAYS).label);
    }
  });
  paintTips();

  /* Генерация промокода (созвон 10.09): код собран из механики и срока,
     с префиксом сервиса. Свой код клиента публикуем как есть. */
  const codeGen = qs("[data-code-gen]", form);
  if (codeGen) codeGen.onclick = () => {
    const m = LK_MECHANICS.find(x => x.label === val("mech")) || LK_MECHANICS[0];
    const tag = { percent: "SALE", amount: "MINUS", twoforone: "TWO", gift: "GIFT", friend: "FRIEND" }[m.id];
    const d = LK_DURATIONS.find(x => x.label === val("days"));
    const digits = (val("value").match(/\d+/) || [""])[0];
    const code = "KP-" + tag + (digits || (d ? d.days : "")) + "-" + Math.floor(100 + Math.random() * 900);
    const inp = f("code");
    inp.value = code;
    inp.dispatchEvent(new Event("input", { bubbles: true }));
  };

  if (img) {
    const tabs = qsa("[data-img-tab]", img);
    tabs.forEach(t => t.onclick = () => {
      tabs.forEach(x => x.classList.toggle("is-on", x === t));
      qsa("[data-img-pane]", img).forEach(p => { p.hidden = p.dataset.imgPane !== t.dataset.imgTab; });
    });

    /* Без подтверждения прав файл не принимаем — это обязательное условие */
    const drop = qs("[data-img-drop]", img);
    const rights = qs('[data-f="rights"]', img);
    drop.onclick = () => {
      const box = qs("[data-img-rights]", img);
      if (!rights.checked) {
        box.classList.remove("is-warn");
        void box.offsetWidth;
        box.classList.add("is-warn");
        return;
      }
      st.src = "upload";
      drop.classList.add("is-done");
      drop.innerHTML = "Изображение загружено<br><br>Нажмите, чтобы заменить";
      paintMedia();
      paintGen();
      sync();
    };
    rights.addEventListener("change", () => qs("[data-img-rights]", img).classList.remove("is-warn"));

    qs("[data-img-prompt]", img).addEventListener("input", () => { st.touched = true; });
    qs("[data-img-rebuild]", img).onclick = () => {
      st.touched = false;
      qs("[data-img-prompt]", img).value = buildPrompt();
    };

    const genBtn = qs("[data-img-gen]", img);
    const grid = qs("[data-img-grid]", img);

    function paintGen() {
      qs("[data-img-left]", img).textContent = st.left > 0
        ? "Осталось " + st.left + " из " + LK_GEN_LIMIT
        : "Попытки закончились";
      genBtn.disabled = st.busy || st.left <= 0;
      genBtn.textContent = st.busy ? "Генерируем…" : st.variants.length ? "Ещё вариант" : "Сгенерировать";
      grid.innerHTML = st.variants.map((k, i) => `
        <button type="button" class="lk-img__v lk-gen--${k}${st.src === "gen" && i === st.chosen ? " is-on" : ""}"
          data-img-pick="${i}"><span>Вариант ${i + 1}</span></button>`).join("")
        + (st.busy ? `<div class="lk-img__v is-busy"><span>Генерируем…</span></div>` : "")
        + (st.left <= 0 ? `<div class="lk-img__out">Попытки на этот купон закончились. Выберите
            один из вариантов или загрузите своё изображение.</div>` : "");
    }

    genBtn.onclick = () => {
      if (st.busy || st.left <= 0) return;
      st.busy = true;
      st.left--;
      paintGen();
      setTimeout(() => {
        st.variants.push(st.variants.length % 4 + 1);
        st.chosen = st.variants.length - 1;
        st.src = "gen";
        st.busy = false;
        paintGen();
        paintMedia();
        sync();
      }, 3200);
    };

    grid.addEventListener("click", e => {
      const b = e.target.closest("[data-img-pick]");
      if (!b) return;
      st.chosen = Number(b.dataset.imgPick);
      st.src = "gen";
      paintGen();
      paintMedia();
      sync();
    });

    paintGen();
  }

  sync();
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

/* Архив — итоги отработавших купонов: четыре метрики за весь срок и
   возможность запустить купон заново.

   «Опубликовать снова» здесь контурная, а не сплошная, хотя в «Моих
   купонах» действие в строке сплошное. Разница по смыслу: там кнопка
   появляется только у части строк и двигает купон по воронке — это и
   правда призыв к действию. Здесь она одинакова у каждой строки, и
   сплошной заливкой архив превращался в столбец красного, где ни одна
   строка не срочнее соседней. Красной кнопка становится под курсором —
   на той строке, которую человек и правда собрался нажать. */
VIEWS["client:archive"] = () => {
  const done = LK_COUPONS.filter(c => c.status === "done");
  return head("Архив купонов")
    + panel("", done.length
      ? table([{ t: "Купон" }, { t: "Период" }, { t: "Показы", num: true }, { t: "Просмотры", num: true },
               { t: "Забрали", num: true, key: true }, { t: "Переходы", num: true }, { t: "" }],
          done.map(c => `<tr data-coupon="${c.id}" tabindex="0">
            <td><b class="lk-t__title">${c.title}</b><span class="lk-t__sub">${where(c)} · ${c.value}</span></td>
            <td>${c.from} — ${c.to}</td>
            <td class="num">${num(c.shown)}</td>
            <td class="num">${num(c.opened)}</td>
            <td class="num lk-t__key">${num(c.taken)}</td>
            <td class="num">${num(c.clicks)}</td>
            <td class="num"><button class="btn btn--ghost" data-act="repeat" data-id="${c.id}">Опубликовать снова</button></td>
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
      <td class="num lk-t__key">${num(c.taken)}</td>
      <td class="num">${num(c.clicks)}</td>
    </tr>`).join("");

  return head("Статистика")
    + kpi(LK_METRICS.map(m => ({ label: m.label, value: num(sum(m.id)) })))
    + panel("По купонам",
        table([{ t: "Купон" }, { t: "Статус" }, { t: "Показы", num: true }, { t: "Просмотры", num: true },
               { t: "Забрали", num: true, key: true }, { t: "Переходы", num: true }], rows));
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
  /* Поля профиля можно было править, но сохранить — нет: кнопки в разделе
     просто не было. Она здесь такая же, как в «Уведомлениях», и с тем же
     подтверждением строкой рядом, без модалок. */
  + `<div class="lk-head__act" style="margin:-4px 0 16px">
       <button class="btn btn--solid" data-save>Сохранить</button>
       <span class="lk-save-ok" data-save-ok hidden>Изменения сохранены</span>
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
      (c.status === "moderation" ? `<button class="btn btn--ghost" data-unmod="${c.id}">Снять с модерации</button>` : "")
      + (c.status === "done" ? `<button class="btn btn--solid" data-act="repeat" data-id="${c.id}">Опубликовать снова</button>` : "")
      + `<a class="btn btn--ghost" href="${href(back)}" data-go="${back}">К списку</a>`)
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
    <td class="num lk-t__key">${c.fee ? rub(c.fee) : "—"}</td>
  </tr>`).join("");

  return head("Региональные клиенты",
      `<button class="btn btn--ghost">Выгрузить в CSV</button>
       <button class="btn btn--ghost">Выгрузить в Excel</button>`)
    + panel("", table(
        [{ t: "Клиент" }, { t: "Статус" }, { t: "С нами с" }, { t: "Купонов", num: true },
         { t: "Оплатил", num: true }, { t: "Ваше начисление", num: true, key: true }], rows)
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
    <td class="num lk-t__key">${c.income ? rub(c.income) : "—"}</td>
  </tr>`).join("");

  const total = LK_CODES.reduce((a, c) => a + c.income, 0);

  return head("Маркетплейс · Мои коды",
      `<button class="btn btn--solid" type="button" data-request-code>Запросить новый код</button>`)
    + panel("", table(
        [{ t: "Код" }, { t: "Кому отдан" }, { t: "Площадка" },
         { t: "Публикаций", num: true }, { t: "Начислено", num: true, key: true }], rows)
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
/* Бонус проходит те же три состояния, что купон и выплата: сработал
   (клиент потратил), ждёт (отправлен, но не потрачен), вышел из игры
   (сгорел). Карта — чтобы не заводить свой словарь цветов на каждый
   раздел. */
const BONUS_STATE = { used: "ok", sent: "wait", expired: "done" };

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
          <td><span class="lk-st lk-st--${BONUS_STATE[b.status]}">${LK_BONUS_STATUSES[b.status]}</span></td></tr>`).join("")));
};

/* Отчёты. Период — календарный месяц, деньги уходят через 14 дней после
   его закрытия: столько отведено на споры по завершённым купонам
   (ТЗ §4.4.3). Детализация построчная: купон, клиент, сумма оплаты и
   начисление, чтобы отчёт можно было сверить. */
VIEWS["partner:payouts"] = () => {
  const rows = LK_PAYOUTS.map(p => `<tr>
    <td><b class="lk-t__title">${p.period}</b><span class="lk-t__sub">${p.date}</span></td>
    <td class="num">${rub(p.income)}</td>
    <td class="num lk-t__key">${rub(p.total)}</td>
    <td>${p.status === "paid"
      ? `<span class="lk-st lk-st--done">Выплачено</span>`
      : `<span class="lk-st lk-st--wait">Ожидает выплаты</span>`}</td>
    <td class="num"><button class="btn btn--ghost">Скачать</button></td>
  </tr>`).join("");

  const detail = LK_PAYOUT_ROWS.map(r => `<tr>
    <td><b class="lk-t__title">${r.coupon}</b><span class="lk-t__sub">купон ${r.id} · ${r.client}</span></td>
    <td>${r.contour === "market" ? "Маркетплейс · " + r.code : "Регион"}</td>
    <td class="num">${rub(r.paid)}</td>
    <td class="num lk-t__key">${rub(r.fee)}</td>
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
         { t: "Ваши " + LK_RATES.fee + "%", num: true, key: true }], detail))
    + panel("По периодам", table(
        [{ t: "Период" }, { t: "Начислено", num: true }, { t: "К выплате", num: true, key: true },
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
             <button class="btn btn--solid" data-save>Сохранить</button>
             <span class="lk-save-ok" data-save-ok hidden>Изменения сохранены</span>
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
    b.onclick = () => { state.filter = b.dataset.f; state.couponPage = 1; render(); };
  });

  /* Мои купоны: раздел, действия по статусу, поиск, сортировка.
     Смена раздела сбрасывает статус: в новом разделе прежнего статуса
     может не быть вовсе, и список молча оказался бы пустым. */
  const secSel = qs("[data-sec-select]", host);
  if (secSel) secSel.onchange = () => {
    state.sec = secSel.value;
    state.filter = "all";
    state.couponPage = 1;
    render();
  };
  qsa("[data-act]", host).forEach(b => b.onclick = e => {
    e.stopPropagation();
    const id = Number(b.dataset.id);
    const c = LK_COUPONS.find(x => x.id === id);
    if (b.dataset.act === "unmod") { c.status = "draft"; render(); return; }
    go(b.dataset.act === "repeat" ? "repeat" : "coupon", id);
  });
  const sortSel = qs("[data-sort]", host);
  if (sortSel) sortSel.onchange = () => { state.sort = sortSel.value; state.couponPage = 1; render(); };
  const qInp = qs("[data-q]", host);
  if (qInp) {
    qInp.oninput = e => {
      if (e.isComposing) return;
      state.q = qInp.value;
      state.couponPage = 1;
      render();
      const nextQ = qs("[data-q]", host);
      if (nextQ) {
        nextQ.focus();
        nextQ.setSelectionRange(nextQ.value.length, nextQ.value.length);
      }
    };
  }
  qsa("[data-page]", host).forEach(b => b.onclick = () => {
    if (b.disabled) return;
    state.couponPage = Number(b.dataset.page) || 1;
    render();
    const listTop = qs(".lk-tools", host);
    if (listTop) listTop.scrollIntoView({ block: "start", behavior: "smooth" });
  });

  /* Дашборд: создание купона, бонусы, консультация, ИИ-консультант */
  qsa("[data-create]", host).forEach(b => b.onclick = () => openCreateModal());
  qsa("[data-create-mech]", host).forEach(b => b.onclick = () => openCreateModal(b.dataset.createMech));
  qsa("[data-open-coupon]", host).forEach(b => b.onclick = () => go("coupon", Number(b.dataset.openCoupon)));
  qsa("[data-bonus-ways]", host).forEach(b => b.onclick = openBonusWays);
  qsa("[data-consult]", host).forEach(b => b.onclick = openConsult);
  qsa("[data-ai-chat]", host).forEach(b => b.onclick = openAiChat);
  qsa("[data-unmod]", host).forEach(b => b.onclick = () => {
    const c = LK_COUPONS.find(x => x.id === Number(b.dataset.unmod));
    c.status = "draft";
    render();
  });
  /* Крупная модалка появляется только на дашборде — это вход в кабинет;
     свёрнутая плашка дальше висит в любом разделе (см. maybeSurveyPrompt). */
  if (state.role === "client") maybeSurveyPrompt();

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

  /* Конструктор купона: превью, адреса и блок изображения */
  initCouponBuilder(host);

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

    /* Каналы публикации (созвон 10.09): у включённого — «просмотры × N»,
       у снятого строка краснеет и пишет, во сколько раз упадут просмотры.
       Под списком — пояснение под конкретный набор снятых галочек: здесь
       конец воронки, и соцсети решают бо́льшую часть цены. */
    const fmt = n => String(n).replace(".", ",");
    function paintReach(niche, adult) {
      const reach = LK_REACH[niche] || LK_REACH.base;
      const off = [];
      qsa("[data-ch]", host).forEach(i => {
        const row = i.closest(".lk-ch");
        const lbl = qs("[data-reach]", row);
        const id = i.dataset.ch;
        row.classList.toggle("is-off", !i.checked && !adult);
        lbl.textContent = adult ? "недоступно для 18+"
          : i.checked ? "просмотры × " + fmt(reach[id]) : "просмотры упадут в " + fmt(reach[id]) + " раза";
        if (!i.checked) off.push({ id: id, label: qs("span", row).textContent });
      });

      const msg = qs("[data-reach-msg]", host);
      if (!msg) return;
      const total = Object.keys(reach).length;
      let text = "";
      let bad = true;
      if (adult) {
        text = "Купоны 18+ публикуем только на сайте, за подтверждением возраста — в соцсети они не уходят.";
        bad = false;
      } else if (!off.length) {
        text = "Все соцсети включены — так размещаются почти все компании ниши «" + niche + "».";
        bad = false;
      } else if (off.length === 1) {
        const o = off[0];
        text = LK_REACH_KEEP[o.id] + "% компаний ниши оставляют " + o.label +
          ". Без него просмотров купона станет в " + fmt(reach[o.id]) + " раза меньше.";
      } else if (off.length < total) {
        text = "Вы убрали " + off.map(o => o.label).join(" и ") +
          " — просмотры купона упадут в " + off.length + "–" + (off.length + 2) +
          " раза. Так размещаются меньше 10% компаний вашей ниши.";
      } else {
        text = "Купон увидят только на сайте — просмотров станет в 5–6 раз меньше. " +
          "Без соцсетей не размещается почти никто в вашей нише.";
      }
      msg.textContent = text;
      msg.classList.toggle("is-bad", bad);
    }

    const secretCb = qs('[data-f="secret"]', host);
    const recalc = () => {
      const niche = nicheSel && nicheSel.value;
      const nicheRec = LK_NICHES.regional.find(n => n.name === niche);
      const adult = !!(nicheRec && nicheRec.adult);

      /* 18+ в соцсети не уходит (созвон 14.09): каналы гасим и блокируем */
      qsa("[data-ch]", host).forEach(i => {
        if (adult) { i.checked = false; i.disabled = true; }
        else if (i.dataset.adultOff) { i.checked = true; i.disabled = false; }
        i.dataset.adultOff = adult ? "1" : "";
        i.closest(".lk-ch").classList.toggle("is-on", i.checked);
      });

      const dur = LK_DURATIONS.find(d => d.label === (daysSel && daysSel.value));
      const fee = calcFee(niche, cities(), dur ? dur.days : 14, chans(), !!(secretCb && secretCb.checked));
      qs('[data-calc="base"]', calc).textContent  = rub(fee.base);
      qs('[data-calc="extra"]', calc).textContent = rub(fee.extra);
      qs('[data-calc="secret"]', calc).textContent = fee.secret ? rub(fee.secret) : "—";
      qs('[data-calc="total"]', calc).textContent = rub(fee.total);
      if (pvNiche && nicheSel) pvNiche.textContent = nicheSel.value;

      const sp = qs("[data-secret-price]", host);
      if (sp) sp.textContent = rub(LK_SECRET.price * Math.max(1, cities().length));
      const trust = qs("[data-pv-trust]", host);
      if (trust && secretCb) trust.hidden = !secretCb.checked;

      paintReach(niche, adult);
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
    if (secretCb) secretCb.addEventListener("change", recalc);
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
  /* Сохранение формы раздела — профиль, каналы уведомлений. Прототип
     ничего не сохраняет, поэтому подтверждение короткой строкой рядом с
     кнопкой: то же решение, что «Скопировано» на публичке. */
  qsa("[data-save]", host).forEach(btn => {
    btn.onclick = () => {
      const ok = qs("[data-save-ok]", btn.parentNode);
      if (!ok) return;
      ok.hidden = false;
      clearTimeout(btn._hideTimer);
      btn._hideTimer = setTimeout(() => { ok.hidden = true; }, 2400);
    };
  });

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
