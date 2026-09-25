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
ICON.coins = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="m12 7.6 1.3 2.7 3 .4-2.2 2.1.5 3-2.6-1.4-2.6 1.4.5-3-2.2-2.1 3-.4Z"/></svg>';
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
    /* Кошелёк в шапке. «12 400 · +3 500 бонусов» читалось как «прибавь»:
       Коля не понял, входят бонусы в баланс или идут сверху. Теперь два
       отдельных числа, у бонусов свой значок, без плюса. */
    const w = qs("#lkWallet");
    if (w) w.innerHTML = `<span class="lkd-wal" title="Баланс, монеты">${ICON.wallet}<b>${num(LK_BALANCE.coins)}</b></span>
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
  const c = AD_COUPON;
  return `<aside class="lkd-ad" data-ad="${where}">
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
        <div class="lkd-money__v"><span class="lkd-money__ic lkd-money__ic--ink">${ICON.wallet}</span><b>${num(LK_BALANCE.coins)}</b><i>монет</i></div>
        <div class="lkd-money__burn lkd-money__burn--calm"><span>1 монета = 1 рубль, монеты не сгорают</span></div>
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

function statChart(series) {
  const W = 760, H = 260, L = 44, R = 48, T = 16, B = 30;
  const iw = W - L - R, ih = H - T - B;
  const n = series.length;
  const maxL = Math.max(1, ...series.map(r => Math.max(r.opened, r.taken, r.clicks)));
  const maxS = Math.max(1, ...series.map(r => r.shown));
  const x = i => L + (n === 1 ? iw / 2 : i * iw / (n - 1));
  const yL = v => T + ih - v / maxL * ih;
  const bw = Math.max(3, iw / n * .56);
  const ticks = [0, .5, 1];
  const labelEvery = n > 14 ? 5 : 1;
  const bars = series.map((r, i) =>
    `<rect class="lkd-ch__bar" x="${(x(i) - bw / 2).toFixed(1)}" y="${(T + ih - r.shown / maxS * ih).toFixed(1)}" width="${bw.toFixed(1)}" height="${(r.shown / maxS * ih).toFixed(1)}" rx="2"><title>Показы: ${num(r.shown)}</title></rect>`).join("");
  const lines = STAT_LINES.map(l => {
    const pts = series.map((r, i) => x(i).toFixed(1) + "," + yL(r[l.id]).toFixed(1)).join(" ");
    return `<polyline class="lkd-ch__ln lkd-ch__ln--${l.cls}" points="${pts}"/>`;
  }).join("");
  const grid = ticks.map(t => `<line class="lkd-ch__grid" x1="${L}" x2="${W - R}" y1="${T + ih - t * ih}" y2="${T + ih - t * ih}"/>
    <text class="lkd-ch__ax" x="${L - 8}" y="${T + ih - t * ih + 4}" text-anchor="end">${num(Math.round(maxL * t))}</text>
    <text class="lkd-ch__ax lkd-ch__ax--r" x="${W - R + 8}" y="${T + ih - t * ih + 4}">${num(Math.round(maxS * t))}</text>`).join("");
  const days = series.map((r, i) => i % labelEvery === 0 || i === n - 1
    ? `<text class="lkd-ch__ax" x="${x(i)}" y="${H - 8}" text-anchor="middle">${i + 1}</text>` : "").join("");
  return `<svg class="lkd-ch" viewBox="0 0 ${W} ${H}" role="img" aria-label="График показателей по дням">
    ${grid}${bars}${lines}${days}</svg>`;
}

VIEWS["client:stats"] = () => {
  const withData = LK_COUPONS.filter(c => c.shown > 0);
  const picked = D.coupon === "all" ? withData : withData.filter(c => String(c.id) === D.coupon);
  const days = D.period === "7" ? 7 : D.period === "prev" ? 31 : 30;
  const series = statSeries(picked, days);
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
    <span class="lkd-legend__i lkd-legend__i--bar">Показы · шкала справа</span>
    ${STAT_LINES.map(l => `<span class="lkd-legend__i lkd-legend__i--${l.cls}">${l.label}</span>`).join("")}
  </div>`;

  return head("Статистика", filters)
    + kpi(LK_METRICS.map(m => ({ label: m.label, value: num(tot(m.id)), raw: tot(m.id) })), { funnel: true })
    /* Рекламное место — справа от графика, как на дашборде: это второй
       по посещаемости раздел, и сетка у них одна */
    + `<div class="lkd-dash"><div class="lkd-dash__main">
        ${panel(D.coupon === "all" ? "Все купоны по дням" : (picked[0] || {}).title || "Купон", statChart(series) + legend)}
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
        { label: "Монеты", value: num(LK_BALANCE.coins),   note: "1 монета = 1 рубль, не сгорают" },
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
      <div class="lk-note" style="margin-top:12px">Одна монета — один рубль.
      Закрывающие документы приходят в момент пополнения, а не после каждой
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
          ? table([{ t: "Дата" }, { t: "Операция" }, { t: "Монеты", num: true }, { t: "Бонусы", num: true }], rows)
          : empty("Операций нет", "За этот месяц движений по балансу не было."))
        + `<div class="lk-total"><span>Бонусы тратятся на размещение наравне
           с монетами, но хотя бы одна монета в каждой публикации уходит
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
  + `<div class="lk-pair">
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
      ${panel("Компания в сети", `<div class="lk-f">
        ${editField("net", "Сайт", LK_COMPANY.site, "https://…")}
        ${editField("net", "ВКонтакте", LK_COMPANY.vk, "https://vk.com/…")}
        ${editField("net", "Telegram", LK_COMPANY.tg, "https://t.me/…")}
        ${editField("net", "Одноклассники", "", "https://ok.ru/…")}
        ${editField("net", "MAX", "", "https://max.ru/…")}
      </div>
      ${editBar("net")}`)}
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
VIEWS["client:notifications"] = VIEWS["partner:notifications"] = () => {
  const list = LK_NOTIFICATIONS[state.role];
  const unread = list.filter(n => n.unread).length;
  const feed = panel("", `<div class="lk-list">${list.map(n => `
        <div class="lk-list__i${n.unread ? " is-unread" : ""}">
          <i class="lk-list__d"></i>
          <div>${n.text}<div class="lk-list__w">${n.when}</div></div>
        </div>`).join("")}</div>`);
  const readAll = `<button class="btn btn--ghost" data-read-all${unread ? "" : " disabled"}>Прочитать все</button>`;

  if (!IS_CLIENT) {
    return head("Уведомления", readAll)
      + `<div class="lkd-one">${feed}
        <div class="lk-note">Уведомления о выплатах, документах и клиентах
        приходят сюда и дублируются на почту partner@example.ru.</div></div>`;
  }

  const channels = LK_NOTIFY_CHANNELS.map(ch => {
    const linked = ch.value !== "не подключён";
    const must = ch.id === "email";
    return `
    <div class="lk-chrow" data-notify-row="${ch.id}">
      <label class="lk-ch${ch.on ? " is-on" : ""}">
        <input type="checkbox" data-notify-ch="${ch.id}"${ch.on ? " checked" : ""}${must ? " disabled" : ""}>
        <span>${ch.label}${must ? ` <i class="lkd-must">обязательно</i>` : ""}</span>
      </label>
      ${linked
        ? `<span class="lk-chrow__v">${ch.value}</span>`
        : `<input class="lk-i lk-chrow__inp" data-notify-handle="${ch.id}"
             placeholder="Ник в ${ch.label}, например @primer_coffee">`}
    </div>`;
  }).join("");

  return head("Уведомления", readAll)
    + `<div class="lk-pair">
      ${feed}
      <div>
      ${panel("Куда присылать", channels
        + `<div class="lk-note" style="margin-top:14px">Почта нужна всегда:
           на неё приходят чеки и решения модерации. Telegram и Max — на
           выбор, SMS сервис не отправляет.</div>`
        + `<div class="lk-head__act" style="margin-top:14px">
             <button class="btn btn--solid" data-save>Сохранить</button>
             <span class="lk-save-ok" data-save-ok hidden>Изменения сохранены</span>
           </div>`)}
      <div class="lk-panel lkd-sub">
        <b class="lkd-sub__h">Хотите первыми узнавать о новых механиках и бонусах?</b>
        <p>Подпишитесь на наш канал — присылаем новости сервиса, подборки
        удачных купонов и акции для рекламодателей. За подписку —
        <b>${SUB_BONUS} бонусов</b>.</p>
        <div class="lkd-sub__acts">
          <a class="btn btn--ghost" href="#" target="_blank" rel="noopener">Telegram</a>
          <a class="btn btn--ghost" href="#" target="_blank" rel="noopener">Max</a>
        </div>
      </div>
      </div>
    </div>`;
};

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
    + kpi([
        { label: "Клиентов в регионе",        value: LK_CLIENTS.length, note: fresh + " ещё без первого купона" },
        { label: "Размещено купонов сейчас",  value: now.length, note: "активные на сегодня" },
        { label: "Активных клиентов",         value: activeClients, note: "с размещённым купоном" },
        { label: "К выплате",                 value: rub(readySum()), note: "за " + LK_PAYOUTS[0].period.toLowerCase() }
      ])
    + kpi([
        { label: "Начислено всего",       value: rub(feeAll), note: "за все периоды" },
        { label: "Купонов на клиента",    value: perClient },
        { label: "Начисление с клиента",  value: rub(feePerClient), note: "в среднем" }
      ])
    + panel("Последние купоны", table(
        [{ t: "Купон" }, { t: "Тип" }, { t: "Размещение" }, { t: "Ваше начисление", num: true, key: true }, { t: "" }],
        last.map(f => `<tr>
          <td><b class="lk-t__title">${f.title}</b><span class="lk-t__sub">${clientById(f.client).name} · ID ${f.id}</span></td>
          <td>${TYPE[f.type]}</td>
          <td>${f.from} — ${f.to}</td>
          <td class="num lk-t__key">${rub(f.fee)}</td>
          <td class="num">${eyeLink(f)}</td></tr>`).join("")),
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
  const rows = list.map(f => {
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
  }).join("");

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
      + table(
        [{ t: "Купон" }, { t: "Тип" }, { t: "Статус" }, { t: "Начало — окончание" },
         { t: "Оплачено, ₽", num: true }, { t: "Бонусами", num: true },
         { t: "Ваше начисление", num: true, key: true }, { t: "" }], rows)
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
          <li>Одному клиенту — не больше 20% месячного лимита два месяца
              подряд. Это условие оферты.</li>
        </ul>`)}
    </div>`
    + panel("История начислений", table(
        [{ t: "Кому" }, { t: "Сколько", num: true }, { t: "Дата начисления" }, { t: "", num: true }],
        LK_BONUSES.map(b => `<tr>
          <td><b class="lk-t__title">${b.to}</b><span class="lk-t__sub">ИНН ${innOf(b.to)}</span></td>
          <td class="num">${num(b.amount)}</td>
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
  const region = cur.filter(f => f.type !== "marketplace");
  const market = cur.filter(f => f.type === "marketplace");
  const sumOf = (xs, k) => xs.reduce((a, f) => a + f[k], 0);
  const paid = LK_PAYOUTS.filter(p => p.status === "paid").reduce((a, p) => a + p.total, 0);

  const detail = (title, xs) => xs.length ? `<tr class="lkd-grp"><td colspan="4">${title}</td>
      <td class="num lk-t__key">${rub(sumOf(xs.filter(f => f.ready), "fee"))}</td></tr>`
    + xs.map(f => `<tr>
      <td><b class="lk-t__title">${f.title}</b><span class="lk-t__sub">ID ${f.id} · ${clientById(f.client).name}</span></td>
      <td>${f.to}</td>
      <td class="num">${rub(f.rub)}</td>
      <td class="num">${f.bon ? num(f.bon) : "—"}</td>
      <td class="num lk-t__key">${f.ready ? rub(f.fee) : `<span class="lk-t__sub">после ${f.to}</span>`}</td>
    </tr>`).join("") : "";

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
    + panel("Детализация · " + pend.period, table(
        [{ t: "Купон" }, { t: "Окончание" }, { t: "Оплачено, ₽", num: true }, { t: "Бонусами", num: true },
         { t: "Ваше начисление", num: true, key: true }],
        detail("Регион", region) + detail("Маркетплейс", market)))
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
      ${panel("Реквизиты для выплат", `<div class="lk-f">
        <div class="lk-f__row">
          ${lockedField("ИНН", "482600000000", "Изменился ИНН — напишите в поддержку")}
          ${lockedField("ОГРНИП", "321482700000012", "Изменился ОГРНИП — напишите в поддержку")}
        </div>
        <div class="lk-f__row">${editField("preq", "Банк", "ПАО Сбербанк")}${editField("preq", "БИК", "044206604")}</div>
        <div class="lk-f__row">${editField("preq", "Расчётный счёт", "40802810435000000000")}${editField("preq", "Корр. счёт", "30101810800000000604")}</div>
        ${editField("preq", "Почта для документов", "buh@partnerov.ru")}
      </div>
      ${editBar("preq", "Счёт может быть любым на ваш ИНН")}`)}
    </div>`
  + panel("Условия", `
      <ul class="lk-rules">
        <li>Вознаграждение — от 20 до 30% суммы, которую клиент заплатил за
            размещение. Точный процент — в вашем договоре и ежемесячном
            приложении KPI.</li>
        <li>Скидка селлеру по вашему реферальному коду — ${LK_RATES.discount}%.</li>
        <li>Выплата раз в месяц, через 14 дней после закрытия периода.</li>
      </ul>
      <div class="lkd-editbar"><a class="btn lkd-btn-grey" href="${href("docs")}" data-go="docs">Договор и приложения</a></div>`);

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

/* Первый рендер lk.js делает по DOMContentLoaded — к этому моменту все
   подмены выше уже на месте. Окно ознакомления — после него. */
document.addEventListener("DOMContentLoaded", showGate);

})();
