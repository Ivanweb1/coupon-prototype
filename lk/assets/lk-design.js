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
   полукруглыми вырезами по бокам. Буква набрана текстом: на 16px её
   контур штрихом заплывает. Значок стоит везде, где раньше была
   звёздочка, — кошелёк в шапке, блок бонусов, механики начисления. */
ICON.coins = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M5 6.3H19a2 2 0 0 1 2 2V10a2 2 0 0 0 0 4v1.7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V14a2 2 0 0 0 0-4V8.3a2 2 0 0 1 2-2Z"/><text x="12" y="12" text-anchor="middle" dominant-baseline="central" fill="currentColor" stroke="none" font-family="Onest, system-ui, sans-serif" font-size="10.5" font-weight="700">Б</text></svg>';
ICON.clock = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>';
ICON.q     = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M9.6 9.3a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2.2-2.4 3.6"/><circle cx="12" cy="17.2" r=".6" fill="currentColor"/></svg>';
ICON.lock  = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
ICON.eye18 = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.6"/></svg>';

/* Состояние дизайн-слоя: фильтры, которых нет в прототипе */
const D = {
  period: "30",        /* статистика: период */
  coupon: "all",       /* статистика: купон */
  ledger: "all",       /* биллинг: месяц в истории */
  editing: {},         /* какие формы открыты на редактирование */
  client: "all",       /* партнёр: фильтр купонов по клиенту */
  payType: "all",      /* партнёр: фильтр детализации выплаты по типу купона */
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
  it("codes").label = "Маркетплейс · Коды";
  const at = NAV.partner.findIndex(x => x.id === "profile");
  NAV.partner.splice(at + 1, 0,
    { id: "docs", label: "Документы",   icon: "doc" },
    { id: "kb",   label: "База знаний", icon: "book" });
  Object.assign(TITLES.partner, {
    clients: "Купоны клиентов", codes: "Реферальные коды маркетплейсов",
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
    if (cta) cta.lastElementChild.textContent = "Выдать реферальный код";
  }
};

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
   Статистика: график и фильтры
   --------------------------------------------------------------------------
   Коля: «нарисуй графику сверху — по всем купонам или по конкретному:
   внизу дни, три линии на одном графике». Фильтры — период и купон; по
   умолчанию все купоны за 30 дней. Показы на порядок больше остальных,
   поэтому они не линией, а светлыми столбиками со своей шкалой справа —
   иначе остальные три линии легли бы на ноль. */
const STAT_LINES = [
  { id: "opened", label: "Просмотры",     cls: "a" },
  { id: "taken",  label: "Купон забрали", cls: "b" },
  { id: "clicks", label: "Переходы к вам", cls: "c" }
];
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

/* Сглаженная линия — монотонная кубика (Фрич–Карлсон). Кривая проходит
   через все дневные точки и не выскакивает за них между ними: ломаная из
   острых углов читалась как шум, хотя показывает то же самое. */
function smoothPath(pts) {
  const n = pts.length;
  if (n < 2) return n ? `M${pts[0][0]} ${pts[0][1]}` : "";
  const dx = [], m = [], t = [];
  for (let i = 0; i < n - 1; i++) {
    dx[i] = pts[i + 1][0] - pts[i][0] || 1;
    m[i] = (pts[i + 1][1] - pts[i][1]) / dx[i];
  }
  t[0] = m[0];
  for (let i = 1; i < n - 1; i++) {
    if (m[i - 1] * m[i] <= 0) t[i] = 0;
    else {
      const w1 = 2 * dx[i] + dx[i - 1], w2 = dx[i] + 2 * dx[i - 1];
      t[i] = (w1 + w2) / (w1 / m[i - 1] + w2 / m[i]);
    }
  }
  t[n - 1] = m[n - 2];
  const f = v => v.toFixed(1);
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < n - 1; i++) {
    const h = dx[i] / 3;
    d += ` C${f(pts[i][0] + h)} ${f(pts[i][1] + t[i] * h)} ` +
         `${f(pts[i + 1][0] - h)} ${f(pts[i + 1][1] - t[i + 1] * h)} ` +
         `${f(pts[i + 1][0])} ${f(pts[i + 1][1])}`;
  }
  return d;
}

/* График по дням. Правки Ивана 29.09:
   · линии сглажены, у ключевой («Купон забрали») появилась заливка — из
     трёх одинаковых линий было не видно, на какую смотреть;
   · сетка и подписи приглушены, столбики показов ушли на задний план:
     шкал две, и цифры справа не должны спорить с левыми;
   · над каждым днём — прозрачное поле с подсказкой, где все четыре числа
     сразу: раньше всплывали только показы со столбика;
   · размер приходит в пикселях (см. отрисовку в render): панель тянется
     до низа рекламного места, и график занимает всё, что ему осталось. */
function statChart(series, W, H) {
  W = W || 760; H = H || 260;
  /* Шкала одна, слева — показы (правка Ивана 29.09). Правую шкалу с
     делениями линий убрали: точные числа по каждому дню и так показывает
     подсказка при наведении. Справа осталось поле только под подпись
     последнего дня. */
  const L = 46, R = 16, T = 34, B = 48;
  const iw = W - L - R, ih = H - T - B;
  const n = series.length;
  if (n < 1 || iw < 40 || ih < 40) return "";
  const maxL = Math.max(1, ...series.map(r => Math.max(r.opened, r.taken, r.clicks)));
  const maxS = Math.max(1, ...series.map(r => r.shown));
  const x = i => L + (n === 1 ? iw / 2 : i * iw / (n - 1));
  const yL = v => T + ih - v / maxL * ih;
  /* Столбики уже и с воздухом — это фон под линиями, а не второй
     главный объект на поле */
  const bw = Math.max(3, iw / n * .42);
  const ticks = [0, .5, 1];
  const labelEvery = n > 14 ? 5 : n > 7 ? 2 : 1;

  /* Одна шкала слева — показы: первый шаг воронки и самое большое число,
     с него график и читают (правка Ивана 29.09). */
  const grid = ticks.map(t => `<line class="lkd-ch__grid" x1="${L}" x2="${W - R}" y1="${(T + ih - t * ih).toFixed(1)}" y2="${(T + ih - t * ih).toFixed(1)}"/>
    <text class="lkd-ch__ax lkd-ch__ax--bar" x="${L - 10}" y="${(T + ih - t * ih + 4).toFixed(1)}" text-anchor="end">${num(Math.round(maxS * t))}</text>`).join("");

  const bars = series.map((r, i) => {
    const h = r.shown / maxS * ih;
    return `<rect class="lkd-ch__bar" x="${(x(i) - bw / 2).toFixed(1)}" y="${(T + ih - h).toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" rx="2"/>`;
  }).join("");

  const paths = {};
  STAT_LINES.forEach(l => { paths[l.id] = smoothPath(series.map((r, i) => [x(i), yL(r[l.id])])); });

  /* Заливка под ключевой линией. Тем же путём, что и сама линия, —
     низом по нулевой отметке. */
  const area = `<path class="lkd-ch__area" d="${paths.taken} L${x(n - 1).toFixed(1)} ${(T + ih).toFixed(1)} L${x(0).toFixed(1)} ${(T + ih).toFixed(1)} Z"/>`;
  const lines = STAT_LINES.map(l =>
    `<path class="lkd-ch__ln lkd-ch__ln--${l.cls}" d="${paths[l.id]}"/>`).join("");

  const days = series.map((r, i) => i % labelEvery === 0 || i === n - 1
    ? `<text class="lkd-ch__ax" x="${x(i).toFixed(1)}" y="${(T + ih + 20).toFixed(1)}" text-anchor="middle">${i + 1}</text>` : "").join("");

  /* Подписи шкал у самих шкал: слева — что считают линии, справа — что
     считают столбики, снизу — что отложено по горизонтали. Легенда под
     графиком называет линии, а эти подписи говорят, в чём измеряется
     каждая шкала. */
  const caps = `<text class="lkd-ch__cap lkd-ch__cap--bar" x="${L}" y="16">Показы</text>
    <text class="lkd-ch__cap" x="${(L + iw / 2).toFixed(1)}" y="${(H - 6).toFixed(1)}" text-anchor="middle">День месяца</text>`;

  /* Поле дня во всю высоту: подсказка ловится где угодно по вертикали,
     а не только на столбике или ровно на линии. */
  const hw = iw / Math.max(1, n - 1);
  const hits = series.map((r, i) => `<rect class="lkd-ch__hit" x="${Math.max(L, x(i) - hw / 2).toFixed(1)}" y="${T}" width="${Math.min(hw, W - R - Math.max(L, x(i) - hw / 2)).toFixed(1)}" height="${ih.toFixed(1)}">
      <title>День ${i + 1} · Показы ${num(r.shown)} · Просмотры ${num(r.opened)} · Забрали ${num(r.taken)} · Переходы ${num(r.clicks)}</title></rect>`).join("");

  return `<svg class="lkd-ch" viewBox="0 0 ${W} ${H}" role="img" aria-label="График показателей по дням">
    ${grid}${bars}${area}${lines}${days}${caps}${hits}</svg>`;
}

VIEWS["client:stats"] = () => {
  const withData = LK_COUPONS.filter(c => c.shown > 0);
  const picked = D.coupon === "all" ? withData : withData.filter(c => String(c.id) === D.coupon);
  const days = D.period === "7" ? 7 : D.period === "prev" ? 31 : 30;
  const series = D.series = statSeries(picked, days);
  const tot = k => series.reduce((a, r) => a + r[k], 0);

  const rows = withData.slice()
    .sort((a, b) => b.taken - a.taken)
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

  const legend = `<div class="lkd-legend">
    ${/* «шкала справа» из легенды ушло: об этом теперь говорит подпись у
         самой шкалы (правка Ивана 29.09) */ ""}
    <span class="lkd-legend__i lkd-legend__i--bar">Показы</span>
    ${STAT_LINES.map(l => `<span class="lkd-legend__i lkd-legend__i--${l.cls}">${l.label}</span>`).join("")}
  </div>`;

  return head("Статистика", filters)
    + kpi(LK_METRICS.map(m => ({ label: m.label, value: num(tot(m.id)), raw: tot(m.id) })), { funnel: true })
    /* Рекламное место — справа от графика, как на дашборде: это второй
       по посещаемости раздел, и сетка у них одна */
    + `<div class="lkd-dash lkd-dash--chart"><div class="lkd-dash__main">
        ${panel(D.coupon === "all" ? "Все купоны по дням" : (picked[0] || {}).title || "Купон",
          `<div class="lkd-ch__box" data-chart></div>` + legend)}
      </div>${adSlot("stats")}</div>`
    + panel("По купонам",
        table([{ t: "Купон" }, { t: "Статус" }, { t: "Показы", num: true }, { t: "Просмотры", num: true },
               { t: "Забрали", num: true, key: true }, { t: "Переходы", num: true }], rows));
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
   · В истории — фильтр по месяцу, столбец «Документ» убран: хранить и
     связывать документы с операциями пока слишком дорого, а кнопка
     «Запросить» завалит бухгалтерию запросами. */
const SBP_BONUS = 200;
VIEWS["client:billing"] = () => {
  const sign = n => (n > 0 ? "+" : "") + num(n);
  const months = ["сентябр", "август", "июл"];
  const list = D.ledger === "all" ? LK_LEDGER : LK_LEDGER.filter(b => b.date.indexOf(D.ledger) !== -1);
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
        ${editField("req", "Расчётный счёт", "40702810435000000000")}
      </div>
      <div class="lkd-warn">Оплачивайте счёт с расчётного счёта той же компании,
      от имени которой размещаете купоны. Платёж от другой компании вернём.</div>
      ${editBar("req")}`)}
    </div>`
    + panel("История операций",
        `<div class="lkd-filters lkd-filters--in">
          <select class="lk-s" data-ledger aria-label="Период">
            <option value="all"${D.ledger === "all" ? " selected" : ""}>За всё время</option>
            ${[["сентябр", "Сентябрь"], ["август", "Август"], ["июл", "Июль"]].map(([k, l]) =>
              `<option value="${k}"${D.ledger === k ? " selected" : ""}>${l}</option>`).join("")}
          </select>
        </div>`
        + (list.length
          ? table([{ t: "Дата" }, { t: "Операция" }, { t: "Рубли", num: true }, { t: "Бонусы", num: true }], rows)
          : empty("Операций нет", "За этот месяц движений по балансу не было."))
        + `<div class="lk-total"><span>Бонусы тратятся на размещение наравне
           с рублями, но хотя бы один рубль в каждой публикации уходит
           реальными деньгами. Чеки и счета приходят на почту.</span></div>`);
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
  /* Два столбца по смыслу, а не по длине (правка Ивана 29.09):
     слева — сама компания и то, куда ей писать, справа — где компанию
     найти в сети и наш канал. Так столбцы ещё и сходятся по высоте:
     раньше слева стоял один блок, справа три, и слева пустовал экран. */
  + `<div class="lk-pair">
      <div>
      ${panel("Компания", `<div class="lk-f">
        ${editField("co", "Название", "Кофейня «Пример»")}
        ${field("Краткое описание", `<textarea class="lk-ta" data-edit-f="co"${D.editing.co ? "" : " disabled"}>Своя обжарка, запись день в день, работаем с 2014 года.</textarea>`)}
        ${editField("co", "Телефон", "+7 900 000-00-00")}
        <div class="lk-f__row">
          ${lockedField("ИНН", LK_COMPANY.inn, "Изменился ИНН — напишите в поддержку")}
          ${lockedField("ОГРН", "1154827000000", "Изменился ОГРН — напишите в поддержку")}
        </div>
      </div>
      ${editBar("co")}`)}
      ${notifyWherePanel()}
      </div>
      <div>
      ${panel("Компания в сети", `<div class="lk-f">
        ${editField("net", "Сайт", LK_COMPANY.site, "https://…")}
        ${editField("net", "ВКонтакте", LK_COMPANY.vk, "https://vk.com/…")}
        ${editField("net", "Telegram", LK_COMPANY.tg, "https://t.me/…")}
        ${editField("net", "Одноклассники", "", "https://ok.ru/…")}
        ${editField("net", "MAX", "", "https://max.ru/…")}
      </div>
      ${editBar("net")}`)}
      ${subPanel()}
      </div>
    </div>`
  + panel("Точки продаж", table(
      [{ t: "Адрес" }, { t: "Город" }, { t: "Режим работы" }, { t: "", num: true }],
      `<tr><td>ул. Первомайская, 12</td><td>Липецк</td><td>ежедневно 08:00–22:00</td>
        <td class="num"><button class="btn btn--ghost">Изменить</button></td></tr>
       <tr><td>пр-т Победы, 45</td><td>Липецк</td><td>ежедневно 09:00–21:00</td>
        <td class="num"><button class="btn btn--ghost">Изменить</button></td></tr>`),
      { act: `<button class="btn btn--ghost">Добавить точку</button>` });

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
  const nick = IS_CLIENT ? "@primer_coffee" : "@partnerov";
  const chValue = ch => !IS_CLIENT && ch.id === "email" ? "partner@example.ru"
    : !IS_CLIENT && ch.id === "tg" ? nick : ch.value;
  const channels = LK_NOTIFY_CHANNELS.map(ch => {
    const val = chValue(ch);
    const linked = val !== "не подключён";
    const must = ch.id === "email";
    return `
    <div class="lk-chrow" data-notify-row="${ch.id}">
      <label class="lk-ch${ch.on ? " is-on" : ""}">
        <input type="checkbox" data-notify-ch="${ch.id}"${ch.on ? " checked" : ""}${must ? " disabled" : ""}>
        <span>${ch.label}${must ? ` <i class="lkd-must">обязательно</i>` : ""}</span>
      </label>
      ${linked
        ? `<span class="lk-chrow__v">${val}</span>`
        : `<input class="lk-i lk-chrow__inp" data-notify-handle="${ch.id}"
             placeholder="Ник в ${ch.label}, например ${nick}">`}
    </div>`;
  }).join("");
  return panel("Куда присылать уведомления", channels
    + `<div class="lk-note" style="margin-top:14px">Почта нужна всегда: на
       неё приходят ${IS_CLIENT ? "чеки и решения модерации" : "счета, акты и решения по выплатам"}.
       Telegram и Max — на выбор, SMS сервис не отправляет.</div>`
    + `<div class="lk-head__act" style="margin-top:14px">
         <button class="btn btn--solid" data-save>Сохранить</button>
         <span class="lk-save-ok" data-save-ok hidden>Изменения сохранены</span>
       </div>`);
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
   24.09, вечер). Стоит в профиле компании, под каналами уведомлений
   (правка Ивана 29.09): оба блока про то, где компания нас читает. */
function subPanel() {
  return `<div class="lk-panel lkd-sub">
    <b class="lkd-sub__h">Хотите первыми узнавать о новых механиках и бонусах?</b>
    <p>Подпишитесь на наш канал — присылаем новости сервиса, подборки
    удачных купонов и акции для рекламодателей. За подписку —
    <b>${SUB_BONUS} бонусов</b>.</p>
    <div class="lkd-sub__acts">
      <a class="btn btn--ghost" href="#" target="_blank" rel="noopener">Telegram</a>
      <a class="btn btn--ghost" href="#" target="_blank" rel="noopener">Max</a>
    </div>
  </div>`;
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
const TYPE = { regional: "Региональный", marketplace: "Маркетплейс", "for-business": "Для бизнеса" };
const clientById = id => LK_CLIENTS.find(c => c.id === id) || {};
/* Партнёр без региональной роли (правило 25.09: регистрация даёт только
   маркетплейсы, регион открывает сервис по запросу) видит только
   маркетплейсные купоны — региональных клиентов у него нет. */
const levelFees = () => state.regional ? FEES : FEES.filter(f => f.type === "marketplace");
const periodFees = () => levelFees().filter(f => !f.paid);
const readySum = () => periodFees().filter(f => f.ready).reduce((a, f) => a + f.fee, 0);
const earnedAll = () => LK_PAYOUTS.filter(p => p.status === "paid").reduce((a, p) => a + p.total, 0) + readySum();

/* Статус купона — те же слова и цвета, что у рекламодателя: одна база
   статусов на оба кабинета */
const feeStatus = f => status(f.status);
const feeReady = f => f.paid
  ? `<span class="lk-st lk-st--done">Выплачено</span>`
  : f.ready
    ? `<span class="lk-st lk-st--ok">Готово к выплате</span>`
    : `<span class="lk-st lk-st--wait">Ждёт завершения</span>`;
const eyeLink = f => `<a class="lkd-eye" href="../coupon-design.html?id=${f.id}" target="_blank" rel="noopener"
    title="Посмотреть купон" aria-label="Посмотреть купон «${f.title}»">${ICON.eye18}</a>`;

/* Строка купона клиента — одна и та же в «Купонах клиентов» и на дашборде:
   «Последние купоны» — это те же пять верхних строк того же списка, и поля
   у них должны быть те же (правка Ивана 29.09). */
const FEE_COLS = [
  { t: "Купон" }, { t: "Тип" }, { t: "Статус" }, { t: "Начало — окончание" },
  { t: "Оплачено, ₽", num: true }, { t: "Бонусами", num: true },
  { t: "Ваше начисление", num: true, key: true }, { t: "" }
];
const feeRow = f => {
  const cl = clientById(f.client);
  return `<tr>
    <td><b class="lk-t__title">${f.title}</b><span class="lk-t__sub">ID ${f.id} · ${cl.name}<br>ИНН ${INN[cl.id]}</span></td>
    <td>${TYPE[f.type]}</td>
    <td>${feeStatus(f)}</td>
    <td class="lkd-dates"><span>${f.from}</span><span>${f.to}</span></td>
    <td class="num">${rub(f.rub)}</td>
    <td class="num">${f.bon ? num(f.bon) : "—"}</td>
    <td class="num lk-t__key">${rub(f.fee)}<div class="lkd-ready">${feeReady(f)}</div></td>
    <td class="num">${eyeLink(f)}</td>
  </tr>`;
};

/* Дашборд партнёра — «рука на пульсе». Что поменялось:
   · между «клиентами в регионе» и «активными» — сколько купонов размещено
     прямо сейчас. Клиентов со временем станет 150, купонов 35 — и эта
     разница как раз показывает партнёру, с кем поработать;
   · «Активных клиентов» — тех, у кого есть размещённый купон;
   · из профиля сюда переехали «купонов на клиента» и «начисление с
     клиента» — это статистика, а не данные профиля;
   · «Последние клиенты» были таблицей без смысла. Теперь это живая лента
     последних пяти купонов, связанная с начислениями, с глазиком;
   · внизу — предложения для бизнеса: партнёр тоже предприниматель. */
/* Компактная полоса показателей — те же плитки, что и в kpi(), но мельче
   и без растягивания: помещаются в один ряд. */
const kpiRow = items => kpi(items).replace('class="lk-kpi"', 'class="lk-kpi lkd-kpi-row"');

const baseMpDashboard = VIEWS["partner:dashboard"];
VIEWS["partner:dashboard"] = () => {
  /* Без региональной роли — дашборд по кодам из lk.js: показывать
     клиентов региона и купоны на клиента здесь нечем */
  if (!state.regional) return baseMpDashboard() + offersRow();

  const now = FEES.filter(f => f.status === "live");
  const activeClients = new Set(now.map(f => f.client)).size;
  const fresh = LK_CLIENTS.filter(c => clientStatus(c) === "new").length;
  const feeAll = FEES.reduce((a, f) => a + f.fee, 0) + LK_PAYOUTS.filter(p => p.status === "paid").reduce((a, p) => a + p.total, 0);
  const withCoupons = LK_CLIENTS.filter(c => c.coupons > 0);
  const perClient = (withCoupons.reduce((a, c) => a + c.coupons, 0) / withCoupons.length).toFixed(1);
  const feePerClient = Math.round(withCoupons.reduce((a, c) => a + c.fee, 0) / withCoupons.length);
  const last = FEES.slice().sort((a, b) => b.id - a.id).slice(0, 5);

  return head("Дашборд партнёра")
    /* Семь показателей одной компактной полосой, а не двумя рядами
       крупных карточек: дашборд начинался с двух экранов цифр, а во
       втором ряду три плитки растягивались на всю ширину (правка Ивана
       29.09). Порядок прежний: сначала работа, потом деньги. */
    + kpiRow([
        { label: "Клиентов в регионе",        value: LK_CLIENTS.length, note: fresh + " без первого купона" },
        { label: "Размещено купонов",         value: now.length, note: "активные на сегодня" },
        { label: "Активных клиентов",         value: activeClients, note: "разместили купон" },
        { label: "К выплате",                 value: rub(readySum()), note: "за " + LK_PAYOUTS[0].period.toLowerCase() },
        { label: "Начислено всего",           value: rub(feeAll), note: "за все периоды" },
        { label: "Купонов на клиента",        value: perClient, note: "в среднем" },
        { label: "Начисление с клиента",      value: rub(feePerClient), note: "в среднем" }
      ])
    + panel("Последние купоны", table(FEE_COLS, last.map(feeRow).join("")),
        { act: `<a class="btn btn--ghost" href="${href("clients")}" data-go="clients">Все купоны</a>` })
    + offersRow();
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

/* Купоны клиентов — бывшие «Региональные клиенты» */
VIEWS["partner:clients"] = () => {
  const clients = LK_CLIENTS.filter(c => FEES.some(f => f.client === c.id));
  const list = D.client === "all" ? FEES : FEES.filter(f => String(f.client) === D.client);
  const rows = list.map(feeRow).join("");

  return head("Купоны клиентов",
      `<button class="btn btn--ghost">Выгрузить в CSV</button>
       <button class="btn btn--ghost">Выгрузить в Excel</button>`)
    + `<div class="lkd-earn">
      <div class="lk-panel lkd-earn__c lkd-earn__c--main">
        <span class="lkd-money__l">Готово к выплате в этом месяце</span>
        <b>${rub(readySum())}</b>
        <span class="lk-note">По купонам, которые уже завершились. Счёт
        формируется в «Отчётах и выплатах» после закрытия периода.</span>
        <a class="btn btn--ghost" href="${href("payouts")}" data-go="payouts">К выплатам</a>
      </div>
      <div class="lk-panel lkd-earn__c">
        <span class="lkd-money__l">Заработано за всё время</span>
        <b>${rub(earnedAll())}</b>
        <span class="lk-note">Вместе с текущим периодом</span>
      </div>
    </div>`
    + panel("", `<div class="lkd-filters lkd-filters--in">
        <select class="lk-s" data-fee-client aria-label="Клиент">
          <option value="all">Все клиенты</option>
          ${clients.map(c => `<option value="${c.id}"${D.client === String(c.id) ? " selected" : ""}>${c.name}</option>`).join("")}
        </select>
      </div>`
      + table(FEE_COLS, rows)
      + `<div class="lk-total"><span>Клиенты закреплены за вами по территории
         ответственности. Закрепление постоянное. В выплату идут купоны,
         завершившиеся в отчётном периоде — календарном месяце.</span></div>`)
    + offersRow();
};

/* Бонусы клиентам */
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
           столбцов. Пока сумма стояла по правому краю, а дата сразу за
           ней по левому, оба значения сбивались в середину строки и
           справа оставалась пустая полоса до кнопки (правка Ивана 29.09). */
        [{ t: "Кому", w: "28%" }, { t: "Сколько", w: "24%" },
         { t: "Дата начисления", w: "24%" }, { t: "", num: true, w: "24%" }],
        LK_BONUSES.map(b => `<tr>
          <td><b class="lk-t__title">${b.to}</b><span class="lk-t__sub">ИНН ${innOf(b.to)}</span></td>
          <td>${num(b.amount)}</td>
          <td>${b.sent}</td>
          <td class="num"><button class="btn btn--ghost" data-repeat-bonus="${innOf(b.to)}|${b.amount}">Повторить</button></td></tr>`).join("")));
};

/* Реферальные коды маркетплейсов */
const CODE_TO = { PRTLIP02: 6, PRTLIP03: 3 };
const MP4 = ["Яндекс Маркет", "Ozon", "Wildberries", "М.Видео"];
VIEWS["partner:codes"] = () => {
  const rows = LK_CODES.map(c => {
    const to = CODE_TO[c.code] ? clientById(CODE_TO[c.code]) : null;
    return `<tr>
    <td><b class="lk-t__title">${c.status === "queued" ? "В очереди…" : c.code}</b>
        ${c.base ? `<span class="lk-t__sub">базовый</span>`
          : c.status === "queued" ? `<span class="lk-t__sub">будет готов через ~${LK_CODE_LIMITS.delayMin} мин</span>` : ""}</td>
    <td>${to ? `${to.name}<div class="lk-t__sub">ИНН ${INN[to.id]}</div>` : c.inn ? `ИНН ${c.inn}` : "<span class='lk-t__sub'>—</span>"}</td>
    <td>${c.comment || "<span class='lk-t__sub'>—</span>"}</td>
    <td>${c.market === "—" ? "<span class='lk-t__sub'>любая</span>" : c.market}</td>
    <td class="num">${c.used ? num(c.used) : "—"}</td>
    <td class="num lk-t__key">${c.income ? rub(c.income) : "—"}</td>
  </tr>`;
  }).join("");

  const total = LK_CODES.reduce((a, c) => a + c.income, 0);

  return head("Реферальные коды маркетплейсов",
      `<button class="btn btn--solid" type="button" data-request-code>Запросить новый код</button>`)
    + panel("", table(
        [{ t: "Код" }, { t: "Кому выдан" }, { t: "Комментарий" }, { t: "Площадка" },
         { t: "Публикаций", num: true }, { t: "Начислено", num: true, key: true }], rows)
      + `<div class="lk-total"><b>${rub(total)}</b><span>начислено по кодам за всё время</span></div>`)
    + panel("Как это работает", `
      <ul class="lk-rules">
        <li>Селлер вводит ваш реферальный код при создании купона в разделе
            «Маркетплейсы». Размещение для него дешевле на ${LK_RATES.discount}%,
            вам идёт вознаграждение с того, что он заплатил.</li>
        <li>Без кода — розничная цена и ноль вам. Код указывается заново на
            каждой публикации: селлер может принести разные коды в разные месяцы.</li>
        <li>Площадки — ${MP4.join(", ")}. Отдельный код под площадку
            поможет понять, кто из ваших людей где работает.</li>
        <li>Новый код выдаётся с задержкой около ${LK_CODE_LIMITS.delayMin} минут,
            не чаще ${LK_CODE_LIMITS.perHour} в час.</li>
      </ul>`);
};

/* Запрос кода: кому — по ИНН, площадка — из четырёх */
const baseCodeModal = window.openCodeRequestModal;
window.openCodeRequestModal = function () {
  if (nextCodeAllowedAt()) { baseCodeModal(); return; }
  openModal(`
    <h3>Запросить реферальный код</h3>
    <p class="lk-modal__lead">Код появляется не сразу — на выдачу уходит около
    ${LK_CODE_LIMITS.delayMin} минут, это антифрод-задержка.</p>
    <div class="lk-f">
      ${field("Кому выдаёте — ИНН", `<input class="lk-i" data-code-inn inputmode="numeric" maxlength="12" placeholder="Можно оставить пустым">`)}
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
      inn: qs("[data-code-inn]", box).value.trim(),
      market: mk === "Любая" ? "—" : mk, used: 0, income: 0, status: "queued"
    });
    state.codeRequestAt = Date.now();
    closeModal();
    render();
  };
};

/* Отчёты и выплаты
   · Кнопка «Сформировать счёт и акт» — одна на отчётный период, живёт
     здесь. Неактивна, пока период не закрыт; подсказка при наведении.
     Счёт собираем на нашей стороне из реквизитов партнёра и наших:
     договор возмездного оказания услуг, и счета от всех партнёров должны
     выглядеть одинаково, с нашей нумерацией.
   · В таблице периодов — номер счёта и два статуса: ожидает выплаты,
     выплачено. По периоду скачивается акт.
   · Реквизиты — только посмотреть: правятся в профиле. */
const INVOICE = { "Август 2026": "П-0826-014", "Июль 2026": "П-0726-011", "Июнь 2026": "П-0626-006" };
VIEWS["partner:payouts"] = () => {
  const pend = LK_PAYOUTS.find(p => p.status === "pending");
  const cur = periodFees();
  /* Тип купона — фильтром над таблицей, а не строками-группами (правка
     Ивана 29.09). Группы разбивали короткий список на куски по одной
     строке, а фильтр — тот же приём, что в «Купонах клиентов», и тип
     каждой строки виден в своём столбце. Итог под таблицей считается по
     выбранному типу. */
  const detail = D.payType === "all" ? cur : cur.filter(f => f.type === D.payType);
  const sumOf = (xs, k) => xs.reduce((a, f) => a + f[k], 0);
  const paid = LK_PAYOUTS.filter(p => p.status === "paid").reduce((a, p) => a + p.total, 0);

  const detailRows = detail.map(f => `<tr>
      <td><b class="lk-t__title">${f.title}</b><span class="lk-t__sub">ID ${f.id} · ${clientById(f.client).name}</span></td>
      <td>${TYPE[f.type]}</td>
      <td>${f.to}</td>
      <td class="num">${rub(f.rub)}</td>
      <td class="num">${f.bon ? num(f.bon) : "—"}</td>
      <td class="num lk-t__key">${f.ready ? rub(f.fee) : `<span class="lk-t__sub">после ${f.to}</span>`}</td>
    </tr>`).join("");

  const rows = LK_PAYOUTS.map(p => `<tr>
    <td><b class="lk-t__title">${p.period}</b><span class="lk-t__sub">${p.date}</span></td>
    <td class="num lk-t__key">${rub(p.status === "pending" ? readySum() : p.total)}</td>
    <td>${INVOICE[p.period] ? "№ " + INVOICE[p.period] : "<span class='lk-t__sub'>после закрытия периода</span>"}</td>
    <td>${p.status === "paid"
      ? `<span class="lk-st lk-st--done">Выплачено</span>`
      : `<span class="lk-st lk-st--wait">Ожидает выплаты</span>`}</td>
    <td class="num">${p.status === "paid" ? `<button class="btn btn--ghost">Скачать акт</button>` : ""}</td>
  </tr>`).join("");

  return head("Отчёты и выплаты", `<button class="btn btn--ghost">Выгрузить в Excel</button>`)
    + `<div class="lk-pair">
      ${panel("К выплате", `
        <div class="lk-kpi__l">${pend.period}</div>
        <div class="lk-kpi__v">${rub(readySum())}</div>
        <div class="lk-kpi__h">${pend.date}</div>
        <div class="lkd-invoice">
          <span class="lkd-tipbtn" tabindex="0">
            <button class="btn btn--solid" type="button" disabled>Сформировать счёт и акт</button>
            <span class="lkd-tip__b" role="tooltip">Счёт можно сформировать после закрытия отчётного периода — с 1 октября. Отчётный период по договору — календарный месяц.</span>
          </span>
          <span class="lk-note">Счёт и акт собираются из ваших и наших
          реквизитов — подписывать и отправлять вручную ничего не нужно.</span>
        </div>
        <div class="lk-total"><span>В расчёт идут купоны, завершившиеся в
        отчётном периоде. Выплата — через 14 дней после закрытия
        периода.</span></div>`)}
      ${panel("Реквизиты для выплат", `<div class="lk-f">
        ${field("Получатель", input("", "ИП Партнёров И.", true))}
        <div class="lk-f__row">${field("ИНН", input("", "482600000000", true))}${field("ОГРНИП", input("", "321482700000012", true))}</div>
        <div class="lk-f__row">${field("Банк", input("", "ПАО Сбербанк", true))}${field("БИК", input("", "044206604", true))}</div>
        ${field("Расчётный счёт", input("", "40802810435000000000", true))}
      </div>
      <div class="lkd-editbar">
        <span class="lkd-editbar__note">Реквизиты меняются в профиле</span>
        <a class="btn lkd-btn-grey" href="${href("profile")}" data-go="profile">Изменить в профиле</a>
      </div>`)}
    </div>`
    + panel("Детализация · " + pend.period,
        `<div class="lkd-filters lkd-filters--in">
          <select class="lk-s" data-pay-type aria-label="Тип купона">
            <option value="all">Все типы</option>
            ${Object.keys(TYPE).map(t => `<option value="${t}"${D.payType === t ? " selected" : ""}>${TYPE[t]}</option>`).join("")}
          </select>
        </div>`
        + (detail.length
          ? table([{ t: "Купон" }, { t: "Тип" }, { t: "Окончание" }, { t: "Оплачено, ₽", num: true },
                   { t: "Бонусами", num: true }, { t: "Ваше начисление", num: true, key: true }], detailRows)
            + `<div class="lk-total"><b>${rub(sumOf(detail.filter(f => f.ready), "fee"))}</b>
               <span>готово к выплате${D.payType === "all" ? " в этом периоде" : " · " + TYPE[D.payType].toLowerCase()}</span></div>`
          : empty("Купонов этого типа в периоде нет", "Выберите другой тип или «Все типы».")))
    + panel("По периодам", table(
        [{ t: "Период" }, { t: "Сумма", num: true, key: true }, { t: "Счёт" }, { t: "Статус" }, { t: "", num: true }], rows)
      + `<div class="lk-total"><b>${rub(paid)}</b><span>выплачено за всё время</span></div>`)
    + offersRow();
};

/* Профиль партнёра
   · Метрик сверху больше нет: две переехали на дашборд, «клиентов в
     месяц» и «доживает до оплаты» убраны — первая со временем обнулится,
     вторая недостоверна.
   · Добавлены сфера деятельности и сайт — из регистрации.
   · Реквизиты правятся здесь: ИНН и ОГРНИП закреплены, банк и счёт —
     через «Редактировать». Платить на другой счёт партнёр вправе:
     в договоре главное ИНН и ОГРН, а не номер счёта.
   · Условия переписаны по договору. */
VIEWS["partner:profile"] = () =>
  head("Профиль партнёра")
  + `<div class="lk-pair">
      <div>
      ${panel("Партнёр", `<div class="lk-f">
        ${editField("pp", "Имя или организация", "ИП Партнёров И.")}
        ${editField("pp", "Сфера деятельности", "Рекламное агентство полного цикла")}
        ${editField("pp", "Сайт", "https://partnerov.ru")}
        <div class="lk-f__row">${editField("pp", "Телефон", "+7 900 000-00-00")}${editField("pp", "Почта", "partner@example.ru")}</div>
        ${state.regional
          ? field("Территория ответственности", input("", "Липецкая область: " + LK_CITIES.map(c => c.name).join(", "), true))
          : ""}
      </div>
      ${editBar("pp")}`)}
      ${/* Слева — кто вы и на каких условиях работаете, справа — куда
           слать деньги и письма (правка Ивана 29.09). «Условия» пришли
           сюда из полной ширины, каналы уведомлений — из «Уведомлений»;
           так столбцы ещё и сходятся по высоте. */ ""}
      ${panel("Условия", `
        <ul class="lk-rules">
          <li>Вознаграждение — от 20 до 30% суммы, которую клиент заплатил
              за размещение. Точный процент — в вашем договоре и
              ежемесячном приложении KPI.</li>
          <li>Скидка селлеру по вашему реферальному коду — ${LK_RATES.discount}%.</li>
          <li>Выплата раз в месяц, через 14 дней после закрытия периода.</li>
        </ul>
        <div class="lkd-editbar"><a class="btn lkd-btn-grey" href="${href("docs")}" data-go="docs">Договор и приложения</a></div>`)}
      </div>
      <div>
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
      ${notifyWherePanel()}
      </div>
    </div>`;

/* Документы: подписанный договор, ежемесячные приложения KPI и акты.
   Приложение KPI действует в одностороннем порядке — его не подписывают,
   а отмечают «ознакомлен» (см. блокировку ниже). */
const DOCS = [
  { name: "Приложение KPI · октябрь 2026", kind: "KPI", date: "25 сентября", state: "new" },
  { name: "Акт № П-0826-014 за август 2026", kind: "Акт", date: "1 сентября", state: "signed" },
  { name: "Приложение KPI · сентябрь 2026", kind: "KPI", date: "26 августа", state: "read" },
  { name: "Акт № П-0726-011 за июль 2026", kind: "Акт", date: "1 августа", state: "signed" },
  { name: "Договор возмездного оказания услуг № П-014", kind: "Договор", date: "12 июня", state: "signed" }
];
const DOC_STATE = {
  new:    `<span class="lk-st lk-st--wait">Новый</span>`,
  read:   `<span class="lk-st lk-st--done">Ознакомлен</span>`,
  signed: `<span class="lk-st lk-st--ok">Подписан</span>`
};
VIEWS["partner:docs"] = () =>
  head("Документы")
  + panel("", table(
      [{ t: "Документ" }, { t: "Тип" }, { t: "Дата" }, { t: "Статус" }, { t: "", num: true }],
      DOCS.map(d => `<tr>
        <td><b class="lk-t__title">${d.name}</b></td>
        <td>${d.kind}</td><td>${d.date}</td>
        <td>${gateAccepted() && d.state === "new" ? DOC_STATE.read : DOC_STATE[d.state]}</td>
        <td class="num"><button class="btn btn--ghost">Скачать</button></td></tr>`).join(""))
    + `<div class="lk-total"><span>Приложение KPI обновляется каждый месяц
       и действует без подписи — достаточно отметки «ознакомлен». Акты
       подписаны факсимиле.</span></div>`);

VIEWS["partner:kb"] = () =>
  head("База знаний")
  + panel("", empty("Скоро здесь будет база знаний",
      "Как искать клиентов, как объяснять механику купонов, ответы на частые вопросы партнёров. Наполняем."));

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

  /* График рисуем по реальному размеру поля, а не растягиваем готовую
     картинку: панель тянется до низа рекламного места, график занимает
     всё, что ему осталось, а подписи и толщина линий остаются в своих
     пикселях. Перерисовываем на изменение размера поля — окно, сворачивание
     меню, смена периода. */
  const box = qs("[data-chart]", host);
  if (box) {
    const draw = () => {
      const w = Math.round(box.clientWidth), h = Math.round(box.clientHeight);
      if (w > 40 && h > 40) box.innerHTML = statChart(D.series, w, h);
    };
    draw();
    if (window.ResizeObserver) new ResizeObserver(draw).observe(box);
  }

  /* Статистика */
  const per = qs("[data-stat-period]", host);
  if (per) per.onchange = () => { D.period = per.value; render(); };
  const cp = qs("[data-stat-coupon]", host);
  if (cp) cp.onchange = () => { D.coupon = cp.value; render(); };

  /* Биллинг */
  const led = qs("[data-ledger]", host);
  if (led) led.onchange = () => { D.ledger = led.value; render(); };
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

  /* Уведомления: «Прочитать все» */
  const ra = qs("[data-read-all]", host);
  if (ra) ra.onclick = () => {
    LK_NOTIFICATIONS[state.role].forEach(n => { n.unread = false; });
    render();
  };

  /* Партнёр: фильтр купонов по клиенту */
  const fc = qs("[data-fee-client]", host);
  if (fc) fc.onchange = () => { D.client = fc.value; render(); };

  /* Партнёр: фильтр детализации выплаты по типу купона */
  const pt = qs("[data-pay-type]", host);
  if (pt) pt.onchange = () => { D.payType = pt.value; render(); };

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

const USE_MAX = 180;

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
      : "Покажите код администратору при оплате.";
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
      if (list) list.insertAdjacentHTML("afterbegin", '<label class="lk-ch lkd-noaddr" data-addr-row data-addr-city=""><input type="checkbox" data-addr-cb data-noaddr value="Без адреса"><span>Адреса нет — услуги оказываю по всему городу</span></label>');
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
}

/* -------------------------------------------------------------------------
   Купон маркетплейса (28.09): один товар, одна механика, вся Россия
   ------------------------------------------------------------------------- */
const MP_PRICE = 10000;          /* размещение на всю Россию, город в цене не участвует */
const MP_SECRET_PRICE = 1000;    /* проверить промокод — дело двух секунд */
const PARTNER_DISCOUNT = 0.2;
const PARTNER_CODES = { ok: ["PRTLIP01", "PRTELT02"], revoked: ["PRTOLD09"] };
const MP_GROUPS = ["Wildberries", "Ozon", "Яндекс Маркет"];

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
  const chan = panelByTitle(form, "Каналы публикации");
  if (chan) {
    const box = qs("[data-channels]", chan);
    if (box) box.innerHTML = MP_GROUPS.map(n =>
      '<label class="lk-ch is-on is-fixed"><input type="checkbox" checked disabled><span>Группа ' + n + '</span><i>входит всегда</i></label>').join("");
    const msg = qs("[data-reach-msg]", chan);
    if (msg) msg.remove();
    const note = qs(".lk-note", chan);
    if (note) note.textContent = "Купон уйдёт в наши федеральные группы по площадкам: Wildberries, Ozon и Яндекс Маркет. Размещение — на всю Россию, город в цене не участвует. Макеты соберём сами.";
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
  });

  const sum = qs("[data-city-sum]", form);
  const noAddr = qs("[data-noaddr]", form);
  const noAddrRow = noAddr && noAddr.closest("[data-addr-row]");
  const paintCities = () => {
    const on = qsa("[data-city].is-on", form).map(b => b.dataset.city);
    if (sum) sum.innerHTML = on.length
      ? "Ваш купон будет размещён в: <b>" + on.join(", ") + "</b>"
      : "<i>Выберите хотя бы один город</i>";
    /* lk.js прячет адреса невыбранных городов; вариант «без адреса» к
       городу не привязан, поэтому держим на нём первый выбранный */
    if (noAddrRow) noAddrRow.dataset.addrCity = on[0] || "";
  };
  if (sum) {
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
  const pvMedia = qs("[data-pv-media]", form);
  if (secretCb && pvMedia) {
    pvMedia.insertAdjacentHTML("beforeend", '<span class="lkd-verified" data-pv-verified hidden><i aria-hidden="true">✓</i> Проверено</span>');
    const badge = qs("[data-pv-verified]", pvMedia);
    const paint = () => { badge.hidden = !secretCb.checked; };
    secretCb.addEventListener("change", paint);
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
