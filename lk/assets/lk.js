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

const ICON = {
  plus:   '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  burger: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  bell:   '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M18 9a6 6 0 1 0-12 0c0 6-2 7-2 7h16s-2-1-2-7"/><path d="M10.5 20a2 2 0 0 0 3 0"/></svg>',
  link:   '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M10 14a3.5 3.5 0 0 0 5 0l3-3a3.5 3.5 0 0 0-5-5l-1 1"/><path d="M14 10a3.5 3.5 0 0 0-5 0l-3 3a3.5 3.5 0 0 0 5 5l1-1"/></svg>'
};

function initIcons(root = document) {
  qsa("[data-icon]", root).forEach(el => {
    if (!el.dataset.done) { el.innerHTML = ICON[el.dataset.icon] || ""; el.dataset.done = "1"; }
  });
}

const num = n => n.toLocaleString("ru-RU");
const rub = n => n.toLocaleString("ru-RU") + " ₽";

/* ---------- Состояние ---------- */
const state = {
  role: document.body.dataset.role === "partner" ? "partner" : "client",
  view: P.get("view") || "dashboard",
  filter: "all"
};

/* ==========================================================================
   Навигация. Порядок разделов — из структуры, согласованной с заказчиком.
   ========================================================================== */
const NAV = {
  client: [
    { group: "Купоны" },
    { id: "dashboard",       label: "Дашборд" },
    { id: "coupons",         label: "Мои купоны" },
    { id: "new-regional",    label: "Создание регионального купона" },
    { id: "new-marketplace", label: "Создание купона маркетплейса" },
    { id: "archive",         label: "Архив купонов" },
    { group: "Компания" },
    { id: "stats",           label: "Статистика" },
    { id: "billing",         label: "Биллинг" },
    { id: "profile",         label: "Профиль компании" },
    { id: "notifications",   label: "Уведомления" }
  ],
  partner: [
    { group: "Привлечение" },
    { id: "dashboard",       label: "Дашборд партнёра" },
    { id: "clients",         label: "Региональные клиенты" },
    { id: "codes",           label: "Маркетплейс · Мои коды" },
    { id: "bonuses",         label: "Бонусы клиентам" },
    { group: "Деньги" },
    { id: "payouts",         label: "Отчёты и выплаты" },
    { id: "profile",         label: "Профиль партнёра" },
    { id: "notifications",   label: "Уведомления" }
  ]
};

const TITLES = {
  client: {
    dashboard: "Дашборд", coupons: "Мои купоны",
    "new-regional": "Создание регионального купона",
    "new-marketplace": "Создание купона маркетплейса",
    archive: "Архив купонов", stats: "Статистика", billing: "Биллинг",
    profile: "Профиль компании", notifications: "Уведомления"
  },
  partner: {
    dashboard: "Дашборд партнёра", clients: "Региональные клиенты",
    codes: "Маркетплейс · Мои коды", bonuses: "Бонусы клиентам",
    payouts: "Отчёты и выплаты", profile: "Профиль партнёра",
    notifications: "Уведомления"
  }
};

function href(view) {
  return "?view=" + view;
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
    return `<a href="${href(it.id)}"${it.id === state.view ? ' class="is-on"' : ""}>
      <span>${it.label}</span>${n ? `<span class="lk__n">${n}</span>` : ""}</a>`;
  }).join("");
  qsa("#lkNav a").forEach(a => a.onclick = e => { e.preventDefault(); go(a.getAttribute("href").split("view=")[1]); });

  /* Название раздела в шапке не дублируем: оно и так стоит заголовком
     страницы прямо под ней и подсвечено в меню слева. Шапка остаётся под
     действия. В заголовке вкладки браузера кабинет и раздел сохраняем —
     по ним различаются открытые вкладки. */
  const title = TITLES[state.role][state.view] || "Раздел";
  const cab = state.role === "client" ? "Кабинет клиента" : "Кабинет партнёра";
  document.title = title + " — " + cab;

  /* Кнопка действия в шапке есть только у клиента: он публикует купоны.
     Партнёр этого не может (решение созвона 04.09), а чем он занимается
     в один клик — на созвонах не проговаривали, поэтому кнопки нет. */
  const cta = qs("#lkCta");
  if (state.role === "client") {
    cta.hidden = false;
    cta.href = href("new-regional");
    cta.onclick = e => { e.preventDefault(); go("new-regional"); };
  } else {
    cta.hidden = true;
  }

  /* Колокольчик */
  const unread = LK_NOTIFICATIONS[state.role].filter(n => n.unread).length;
  qs("#lkDot").classList.toggle("is-on", unread > 0);
  const bell = qs("#lkBell");
  bell.href = href("notifications");
  bell.onclick = e => { e.preventDefault(); go("notifications"); };

  /* Кто в кабинете */
  qs("#lkMe").innerHTML = state.role === "client"
    ? `<div class="lk__me-ava">КП</div><div><div class="lk__me-name">Кофейня «Пример»</div><div class="lk__me-role">Липецк</div></div>`
    : `<div class="lk__me-ava">ИП</div><div><div class="lk__me-name">Иван Партнёров</div><div class="lk__me-role">Липецк</div></div>`;

  initIcons();
}

function go(view) {
  state.view = view;
  state.filter = "all";
  history.replaceState(null, "", href(view));
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

function input(ph, val) {
  return `<input class="lk-i" placeholder="${ph}"${val ? ` value="${val}"` : ""}>`;
}

function select(opts, name) {
  return `<select class="lk-s"${name ? ` data-f="${name}"` : ""}>${opts.map(o => `<option>${o}</option>`).join("")}</select>`;
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
            live.map(c => `<tr>
              <td><b class="lk-t__title">${c.title}</b><span class="lk-t__sub">${c.kind === "market" ? c.market : c.city} · ${c.value}</span></td>
              <td>${c.from} — ${c.to}</td>
              <td class="num">${num(c.taken)}</td></tr>`).join("")
          )
        : empty("Пока ничего не опубликовано", "Созданные купоны появятся здесь после модерации."),
        { act: `<a class="btn btn--ghost" href="${href("coupons")}" data-go="coupons">Все купоны</a>` })}

      ${panel("Требует внимания", attention.length
        ? `<div class="lk-list">${attention.map(c => `
            <div class="lk-list__i is-unread"><i class="lk-list__d"></i><div>
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

  const rows = list.map(c => `<tr>
    <td><b class="lk-t__title">${c.title}</b>
        <span class="lk-t__sub">${c.kind === "market" ? c.market + " · арт. " + c.article : c.cat + " · " + c.city}</span></td>
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
function couponForm(kind) {
  const isMarket = kind === "market";
  const where = isMarket
    ? `<div class="lk-f__row">
        ${field("Маркетплейс", select(LK_MARKETS))}
        ${field("Артикул товара", input("184 220 933"))}
       </div>
       ${field("Ссылка на товар", input("https://…"))}`
    : `<div class="lk-f__row">
        ${field("Категория", select(["Кафе и рестораны", "Красота", "Медицина", "Авто", "Развлечения", "Услуги"]))}
        ${field("Город", select(LK_CITIES))}
       </div>
       ${field("Адрес точки", input("ул. Первомайская, 12"))}`;

  return `<div class="lk-form">
    <div>
      ${panel(isMarket ? "Товар и площадка" : "Что и где", where)}

      ${panel("Предложение", `<div class="lk-f">
        ${field("Заголовок купона", input("Комбо-обед по будням до 16:00"))}
        <div class="lk-f__row">
          ${field("Механика", select(LK_MECHANICS.map(m => m.label), "mech"))}
          ${field("Величина", input("−30%"))}
        </div>
        ${field("Изображение купона", `<div class="lk-drop">Перетащите файл<br>или выберите на компьютере<br><br>Пропорция 4:5</div>`)}
      </div>`)}

      ${panel("Срок и код", `<div class="lk-f">
        <div class="lk-f__row">
          ${field("Действует с", input("3 сентября 2026"))}
          ${field("по", input("24 сентября 2026"))}
        </div>
        ${field("Промокод", input("LUNCH30"))}
        ${field("Как воспользоваться", `<textarea class="lk-ta" placeholder="Покажите код на кассе или назовите администратору при оплате."></textarea>`)}
      </div>`)}

      ${panel("Компания в купоне", `<div class="lk-f">
        <div class="lk-f__row">
          ${field("Сайт", input("https://…"))}
          ${field("ВКонтакте", input("https://vk.com/…"))}
        </div>
        <div class="lk-f__row">
          ${field("Telegram", input("https://t.me/…"))}
          ${field("ERID", input("", "будет присвоен при публикации"))}
        </div>
      </div>`)}

      <div class="lk-head__act" style="margin:0">
        <button class="btn btn--ghost btn--lg">Сохранить черновик</button>
        <button class="btn btn--solid btn--lg">Отправить на модерацию</button>
      </div>
    </div>

    <div class="lk-prev">
      ${panel("Так купон увидят в ленте", `
        <div class="lk-prev__card">
          <div class="lk-prev__media">
            <span class="lk-prev__erid">Реклама · erid: 2Vt…</span>
            <span class="lk-prev__val" id="pvVal">−30%</span>
          </div>
          <div class="lk-prev__body">
            <div class="lk-prev__title">Комбо-обед по будням до 16:00</div>
            <div class="lk-prev__meta">Кофейня «Пример» · ${isMarket ? "Wildberries" : "Кафе и рестораны"}</div>
          </div>
        </div>`)}
    </div>
  </div>`;
}

VIEWS["client:new-regional"] = () =>
  head("Создание регионального купона")
  + couponForm("region");

VIEWS["client:new-marketplace"] = () =>
  head("Создание купона маркетплейса")
  + couponForm("market");

VIEWS["client:archive"] = () => {
  const done = LK_COUPONS.filter(c => c.status === "done");
  return head("Архив купонов")
    + panel("", done.length
      ? table([{ t: "Купон" }, { t: "Период" }, { t: "Показы", num: true }, { t: "Просмотры", num: true },
               { t: "Забрали", num: true }, { t: "Переходы", num: true }, { t: "" }],
          done.map(c => `<tr>
            <td><b class="lk-t__title">${c.title}</b><span class="lk-t__sub">${c.city || c.market} · ${c.value}</span></td>
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
    .map(c => `<tr>
      <td><b class="lk-t__title">${c.title}</b><span class="lk-t__sub">${c.city || c.market}</span></td>
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

VIEWS["client:billing"] = () => {
  const rows = LK_BILLING.map(b => `<tr>
    <td>${b.date}</td>
    <td><b class="lk-t__title">${b.doc}</b><span class="lk-t__sub">${b.what}</span></td>
    <td class="num">${rub(b.sum)}</td>
    <td>Оплачен</td>
    <td class="num"><button class="btn btn--ghost">Скачать</button></td>
  </tr>`).join("");

  return head("Биллинг")
    + `<div class="lk-pair">
      ${panel("Текущий пакет", `
        <div class="lk-kpi__l">Публикаций осталось</div>
        <div class="lk-kpi__v">7 из 10</div>
        <div class="lk-kpi__h">Пакет действует до 1 октября 2026</div>
        <div class="lk-head__act" style="margin-top:16px">
          <button class="btn btn--solid">Продлить пакет</button>
          <button class="btn btn--ghost">Сменить тариф</button>
        </div>`)}
      ${panel("Реквизиты для счетов", `
        <div class="lk-f">
          ${field("Плательщик", input("", "ООО «Пример»"))}
          <div class="lk-f__row">${field("ИНН", input("", "4826000000"))}${field("КПП", input("", "482601001"))}</div>
        </div>`)}
    </div>`
    + panel("История платежей",
        table([{ t: "Дата" }, { t: "Документ" }, { t: "Сумма", num: true }, { t: "Статус" }, { t: "", num: true }], rows));
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

/* ==========================================================================
   Разделы кабинета партнёра
   ========================================================================== */
VIEWS["partner:dashboard"] = () => {
  const active = LK_CLIENTS.filter(c => c.status === "active").length;
  const trial  = LK_CLIENTS.filter(c => c.status === "trial").length;
  const fee    = LK_CLIENTS.reduce((a, c) => a + c.fee, 0);
  const pend   = LK_PAYOUTS.find(p => p.status === "pending");

  return head("Дашборд партнёра")
    + kpi([
        { label: "Клиентов всего",   value: LK_CLIENTS.length },
        { label: "Из них платят",    value: active, note: trial + " ещё на пробном периоде" },
        { label: "Начислено всего",  value: rub(fee) },
        { label: "К выплате",        value: rub(pend.total), note: pend.date }
      ])
    + panel("Последние клиенты",
        table([{ t: "Клиент" }, { t: "С нами с" }, { t: "Купонов", num: true }],
          LK_CLIENTS.slice(0, 4).map(c => `<tr>
            <td><b class="lk-t__title">${c.name}</b><span class="lk-t__sub">${c.city} · ${LK_CLIENT_STATUSES[c.status]}</span></td>
            <td>${c.since}</td><td class="num">${c.coupons}</td></tr>`).join("")),
        { act: `<a class="btn btn--ghost" href="${href("clients")}" data-go="clients">Все клиенты</a>` });
};

VIEWS["partner:clients"] = () => {
  const rows = LK_CLIENTS.map(c => `<tr>
    <td><b class="lk-t__title">${c.name}</b><span class="lk-t__sub">${c.city}</span></td>
    <td>${LK_CLIENT_STATUSES[c.status]}</td>
    <td>${c.since}</td>
    <td class="num">${c.coupons}</td>
    <td class="num">${c.paid ? rub(c.paid) : "—"}</td>
    <td class="num">${c.fee ? rub(c.fee) : "—"}</td>
  </tr>`).join("");

  return head("Региональные клиенты")
    + panel("", table(
        [{ t: "Клиент" }, { t: "Статус" }, { t: "С нами с" }, { t: "Купонов", num: true },
         { t: "Оплатил", num: true }, { t: "Ваше начисление", num: true }], rows));
};

VIEWS["partner:codes"] = () => {
  const rows = LK_CODES.map(c => `<tr>
    <td><b class="lk-t__title">${c.code}</b><span class="lk-t__sub">${c.market}</span></td>
    <td>${c.seller === "—" ? "<span class='lk-t__sub'>не привязан</span>" : c.seller}</td>
    <td>${c.status === "active" ? "Работает" : "Свободен"}</td>
    <td class="num">${c.used ? num(c.used) : "—"}</td>
    <td class="num">${c.income ? rub(c.income) : "—"}</td>
  </tr>`).join("");

  return head("Маркетплейс · Мои коды")
    + panel("", table(
        [{ t: "Код" }, { t: "Селлер" }, { t: "Статус" }, { t: "Применений", num: true }, { t: "Начислено", num: true }], rows));
};

VIEWS["partner:bonuses"] = () =>
  head("Бонусы клиентам")
  + panel("", table(
      [{ t: "Бонус" }, { t: "Кому" }, { t: "Что" }, { t: "Отправлен" }, { t: "Статус" }],
      LK_BONUSES.map(b => `<tr>
        <td><b class="lk-t__title">${b.id}</b></td>
        <td>${b.to}</td><td>${b.kind}</td><td>${b.sent}</td>
        <td>${LK_BONUS_STATUSES[b.status]}</td></tr>`).join("")));

VIEWS["partner:payouts"] = () => {
  const rows = LK_PAYOUTS.map(p => `<tr>
    <td><b class="lk-t__title">${p.period}</b><span class="lk-t__sub">${p.date}</span></td>
    <td class="num">${rub(p.income)}</td>
    <td class="num">${p.bonusCost ? "− " + rub(p.bonusCost) : "—"}</td>
    <td class="num">${rub(p.total)}</td>
    <td>${p.status === "paid" ? "Выплачено" : "Ожидает выплаты"}</td>
  </tr>`).join("");
  const paid = LK_PAYOUTS.filter(p => p.status === "paid").reduce((a, p) => a + p.total, 0);
  const pend = LK_PAYOUTS.find(p => p.status === "pending");

  return head("Отчёты и выплаты")
    + `<div class="lk-pair">
      ${panel("К выплате", `
        <div class="lk-kpi__l">${pend.period}</div>
        <div class="lk-kpi__v">${rub(pend.total)}</div>
        <div class="lk-kpi__h">${pend.date}</div>
        <div class="lk-total"><span>Начислено ${rub(pend.income)} · удержано за бонусы ${rub(pend.bonusCost)}</span></div>`)}
      ${panel("Реквизиты для выплат", `<div class="lk-f">
        ${field("Получатель", input("", "ИП Партнёров И."))}
        <div class="lk-f__row">${field("ИНН", input("", "482600000000"))}${field("Счёт", input("", "40802…"))}</div>
      </div>`)}
    </div>`
    + panel("По периодам", table(
        [{ t: "Период" }, { t: "Начислено", num: true }, { t: "Бонусы", num: true },
         { t: "К выплате", num: true }, { t: "Статус" }], rows)
      + `<div class="lk-total"><b>${rub(paid)}</b><span>выплачено за всё время</span></div>`);
};

VIEWS["partner:profile"] = () => {
  const avgCoupons = (LK_CLIENTS.reduce((a, c) => a + c.coupons, 0) / LK_CLIENTS.length).toFixed(1);
  const avgFee = Math.round(LK_CLIENTS.reduce((a, c) => a + c.fee, 0) / LK_CLIENTS.length);

  return head("Профиль партнёра")
    + kpi([
        { label: "Клиентов в месяц",     value: "2,0" },
        { label: "Купонов на клиента",   value: avgCoupons },
        { label: "Начисление с клиента", value: rub(avgFee) }
      ])
    + panel("Партнёр", `<div class="lk-narrow">
        <div class="lk-f">
          ${field("Имя или организация", input("", "ИП Партнёров И."))}
          <div class="lk-f__row">${field("Телефон", input("", "+7 900 000-00-00"))}${field("Почта", input("", "partner@example.ru"))}</div>
          ${field("Регион работы", select(LK_CITIES))}
        </div>
      </div>`);
};

/* ==========================================================================
   Уведомления — общий раздел для обоих кабинетов
   ========================================================================== */
VIEWS["client:notifications"] = VIEWS["partner:notifications"] = () => {
  const list = LK_NOTIFICATIONS[state.role];
  return head("Уведомления",
      `<button class="btn btn--ghost">Отметить прочитанными</button>`)
    + panel("", `<div class="lk-list">${list.map(n => `
        <div class="lk-list__i${n.unread ? " is-unread" : ""}">
          <i class="lk-list__d"></i>
          <div>${n.text}<div class="lk-list__w">${n.when}</div></div>
        </div>`).join("")}</div>`);
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

  initIcons(host);
}

/* Шторка навигации на мобильном */
qs("#lkBurger").onclick = () => document.body.classList.toggle("lk-nav-open");
qs("#lkScrim").onclick  = () => document.body.classList.remove("lk-nav-open");

render();
