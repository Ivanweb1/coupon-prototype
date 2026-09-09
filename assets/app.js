/* ==========================================================================
   Логика прототипа: гео, разделы и ниши, лента, раскрытие купона.
   ========================================================================== */

const qs  = (s, r = document) => r.querySelector(s);
const qsa = (s, r = document) => Array.from(r.querySelectorAll(s));
const params = new URLSearchParams(location.search);

const ICON = {
  search: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/></svg>',
  mic:    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>',
  pin:    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/></svg>',
  chev:   '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m6 9 6 6 6-6"/></svg>',
  share:  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M12 15V3m0 0L8 7m4-4 4 4"/></svg>',
  close:  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  eye:    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.6"/></svg>',
  pinFill:'<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Zm0-8.4a2.6 2.6 0 1 1 0-5.2 2.6 2.6 0 0 1 0 5.2Z"/></svg>',
  burger: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  user:   '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="8" r="3.6"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/></svg>',
  grid:   '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="3" y="3" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="2"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2"/></svg>',
  plus:   '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  link:   '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M10 14a3.5 3.5 0 0 0 5 0l3-3a3.5 3.5 0 0 0-5-5l-1 1"/><path d="M14 10a3.5 3.5 0 0 0-5 0l-3 3a3.5 3.5 0 0 0 5 5l1-1"/></svg>',
  bag:    '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 8h16l-1.2 11.2a2 2 0 0 1-2 1.8H7.2a2 2 0 0 1-2-1.8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
  case:   '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7"/></svg>'
};

/* ==========================================================================
   Состояние: гео-контекст и категория
   ==========================================================================
   Гео-контекст по ТЗ v7.0 §3.2.11 — это не просто «город в шапке». Домашний
   город и область поиска разведены: человек живёт в Ельце, но может смотреть
   выдачу по всей области. Поэтому в состоянии два поля: city (домашний
   город, он же cookie home_city_id) и scope (что показываем — город или
   область). Категория — тоже пара: раздел L1 и ниша L2 внутри него. */
const state = {
  city: findCity(localStorage.getItem("cp_city")) || ACTIVE_CITIES[0],
  cityConfirmed: localStorage.getItem("cp_city_ok") === "1",
  scope: "city",
  l1: params.get("l1") || null,
  l2: params.get("l2") || null,
  near: false,
  /* Ниши, которые посетитель уже раскрывал. По ним на главной собирается
     блок рекомендаций: «она понимает, какую категорию человек смотрит, и
     рекомендует 2-3 смежные» (созвон 07.09.2026). */
  interest: []
};

/* Адрес — источник истины для гео: страница области и страница города это
   разные URL, а не одна страница с переключателем внутри. */
(function readGeoFromUrl() {
  if (params.get("region")) { state.scope = "region"; return; }
  const c = findCity(params.get("city"));
  if (c && c.active) { state.city = c; state.scope = "city"; }
  else if (localStorage.getItem("cp_scope") === "region") state.scope = "region";
})();

function noteInterest(catId) {
  if (!catId) return;
  const i = state.interest.indexOf(catId);
  if (i !== -1) state.interest.splice(i, 1);
  state.interest.unshift(catId);
  state.interest.length = Math.min(state.interest.length, 5);
}

/* Расстояние до точки — в минутах, а не в метрах: по решению с созвона
   07.09.2026 точная геопозиция не нужна, а «в 5 минутах» понятнее и не
   требует точного определения местоположения пользователя. Ближе 300 м
   считаем пешком (~5 км/ч), дальше — на транспорте по городу (~25 км/ч). */
function fmtDist(m) {
  const min = m < 300 ? Math.max(1, Math.round(m / 80)) : Math.max(2, Math.round(m / 420));
  return min + " мин";
}

/* ==========================================================================
   Гео: город и область
   ========================================================================== */
const isRegion = () => state.scope === "region";

/* Название текущей выдачи — им подписаны шапка, заголовки и хлебные крошки */
function geoName() { return isRegion() ? "Вся " + REGION.name : state.city.name; }
function geoShort() { return isRegion() ? REGION.name : state.city.name; }
function geoGen()  { return isRegion() ? REGION.gen : state.city.gen; }
function geoIn()   { return isRegion() ? "по всей " + REGION.gen : "в городе " + state.city.name; }

/* Параметры адреса. В проде это путь /city/{slug}/ или /region/{slug}/;
   прототип статический, поэтому те же две ветки живут в query. */
function geoParam() {
  return isRegion() ? "region=" + REGION.slug : "city=" + state.city.slug;
}

/* Тот самый ЧПУ из ТЗ §3.2.11 — показываем его на странице отдельной
   строкой. Прототип по нему не ходит, но на согласовании видно, какой
   адрес получит каждый экран и что L1 в пути обязателен. */
function chpu(l1, l2) {
  let p = isRegion() ? "/region/" + REGION.slug + "/" : "/city/" + state.city.slug + "/";
  if (l1) p += l1 + "/";
  if (l1 && l2) p += l2 + "/";
  return p;
}

function catalogUrl(l1, l2) {
  let u = "catalog.html?" + geoParam();
  if (l1) u += "&l1=" + l1;
  if (l1 && l2) u += "&l2=" + l2;
  return u;
}

const catUrl = cat => catalogUrl(cat.l1, cat.slug);

/* Город купона в выдаче области у каждого свой, в выдаче города — общий */
function feedCity() { return isRegion() ? null : state.city; }

function renderGeo() {
  qsa("[data-geo-name]").forEach(el => el.textContent = geoName());
  qsa("[data-geo-short]").forEach(el => el.textContent = geoShort());
  qsa("[data-geo-gen]").forEach(el => el.textContent = geoGen());
  qsa("[data-geo-in]").forEach(el => el.textContent = geoIn());
  /* Иконки соцсетей города — сам значок оставляем нетронутым (его рисует
     initIcons), город уходит в подсказку при наведении */
  qsa("[data-city-social]").forEach(el => {
    el.title = "Мы в " + el.dataset.citySocial + " · " + geoShort();
  });
}

/* Смена гео перезагружает страницу с новым адресом: город и область — это
   разные страницы выдачи, а не состояние одной. */
function goGeo(scope, city) {
  if (city) localStorage.setItem("cp_city", city.slug);
  localStorage.setItem("cp_scope", scope);
  localStorage.setItem("cp_city_ok", "1");
  const geo = scope === "region" ? "region=" + REGION.slug : "city=" + (city || state.city).slug;
  const keep = [];
  if (state.l1) keep.push("l1=" + state.l1);
  if (state.l1 && state.l2) keep.push("l2=" + state.l2);
  location.href = location.pathname + "?" + [geo].concat(keep).join("&");
}

function confirmCity() {
  state.cityConfirmed = true;
  localStorage.setItem("cp_city_ok", "1");
  localStorage.setItem("cp_city", state.city.slug);
  const modal = qs("#cityModal");
  if (modal) modal.classList.remove("is-on");
  document.body.classList.remove("no-scroll");
}

/* Город — ключевой триггер всего сервиса, поэтому на входе спрашиваем
   полноэкранным попапом, а не тихой плашкой: по решению с созвона
   07.09.2026 (город определяется по IP, человек подтверждает или меняет). */
function initCityGate() {
  const modal = qs("#cityModal");
  if (!modal || state.cityConfirmed) return;
  modal.classList.add("is-on");
  document.body.classList.add("no-scroll");
  const yes = qs("[data-city-yes]", modal);
  if (yes) yes.onclick = confirmCity;
}

/* Селектор гео из ТЗ §3.2.1: сам город, «вся область», остальные города
   области, неактивные — заглушкой «скоро». Города вне региона в MVP
   выбрать нельзя: справочник запускается одной областью. */
function buildCityModal() {
  const modal = qs("#cityModal");
  if (!modal) return;

  qsa("[data-city-detected]").forEach(el => el.textContent = state.city.name);

  const region = qs("[data-region-row]", modal);
  if (region) {
    region.innerHTML = "";
    const b = document.createElement("button");
    b.className = "city-region" + (isRegion() ? " is-active" : "");
    b.innerHTML = '<b>Вся ' + REGION.name + "</b><span>Купоны всех городов области на одной странице</span>";
    b.onclick = () => goGeo("region");
    region.appendChild(b);
  }

  const list = qs(".city-list", modal);
  list.innerHTML = "";
  REGION.cities.forEach(c => {
    const b = document.createElement("button");
    b.textContent = c.name;
    if (!c.active) {
      /* Неактивный город по ТЗ §3.2.9 — заглушка «скоро», а не пустой
         каталог: показывать выдачу без купонов хуже, чем честно сказать,
         что сервис туда ещё не пришёл. */
      b.classList.add("is-soon");
      b.disabled = true;
      b.title = "Скоро в вашем городе";
      b.innerHTML = c.name + '<span class="city-soon">скоро</span>';
    } else {
      if (!isRegion() && c.slug === state.city.slug) b.classList.add("is-active");
      b.onclick = () => goGeo("city", c);
    }
    list.appendChild(b);
  });

  qs("[data-city-close]").onclick = () => {
    confirmCity();
    modal.classList.remove("is-on");
    document.body.classList.remove("no-scroll");
  };
  qsa("[data-city-open]").forEach(b => b.onclick = () => modal.classList.add("is-on"));
}

/* ==========================================================================
   Категории: раздел L1 и ниши L2
   ========================================================================== */

/* Строка ниш. На главной это ниши региональных купонов: у маркетплейсов и
   «Для бизнеса» ниши свои и раскрываются из их же плашек. На странице
   раздела строка показывает ниши уже этого раздела. */
function buildTags(l1) {
  const host = qs("#tags");
  if (!host) return;
  const vertical = findVertical(l1) || VERTICALS[0];
  host.innerHTML = "";

  catsOf(vertical.slug).sort((a, b) => b.n - a.n).forEach(c => {
    const a = document.createElement("a");
    a.className = "tag" + (state.l2 === c.slug && state.l1 === c.l1 ? " is-active" : "");
    a.href = catUrl(c);
    a.innerHTML = c.name + ' <span class="tag__n">' + c.n + "</span>";
    host.appendChild(a);
  });

  /* «Рядом со мной» — фильтр региональной выдачи: у купона маркетплейса и
     у предложения для бизнеса нет точки на карте, там кнопке нечего
     фильтровать. */
  const near = qs("[data-near]");
  if (near) near.hidden = vertical.slug !== "regional";

  /* Подсказка, что строка продолжается за правым краем: затухание плюс
     явная стрелка — на догадливость по скроллу полагаться нельзя */
  const row = qs("#tagsRow");
  const sync = () => {
    row.classList.toggle("has-more", row.scrollWidth - row.clientWidth - row.scrollLeft > 8);
  };
  row.addEventListener("scroll", sync, { passive: true });
  window.addEventListener("resize", sync);
  sync();

  const more = qs("[data-tags-more]");
  if (more) more.onclick = () => {
    row.scrollBy({ left: Math.round(row.clientWidth * .8), behavior: "smooth" });
  };
  row.scrollLeft = 0;
}

/* Раскрытие любого списка в строке категорий. Списков теперь несколько —
   «Все категории» и по одному на закреплённый раздел, — поэтому открытый
   всегда ровно один: два развёрнутых меню рядом перекрывают друг друга. */
function initDD(dd) {
  qs("[data-dd-toggle]", dd).onclick = e => {
    e.stopPropagation();
    const open = dd.classList.contains("is-open");
    qsa(".dd.is-open").forEach(x => x.classList.remove("is-open"));
    dd.classList.toggle("is-open", !open);
  };
  qs(".dd__panel", dd).onclick = e => e.stopPropagation();
}

document.addEventListener("click", () => {
  qsa(".dd.is-open").forEach(dd => dd.classList.remove("is-open"));
});

/* «Все категории» — единственное место, где видны сразу все три раздела и
   их ниши. Отдельную страницу-каталог категорий не делаем: решение Ивана
   08.09.2026, вопрос Павла с созвона закрыт. */
function buildDropdown() {
  const dd = qs("#allCats");
  if (!dd) return;
  const panel = qs(".dd__panel", dd);
  panel.innerHTML = "";

  VERTICALS.forEach(v => {
    const g = document.createElement("div");
    g.className = "dd__group";
    const head = document.createElement("a");
    head.className = "dd__l1";
    head.href = catalogUrl(v.slug);
    head.innerHTML = "<b>" + v.name + "</b><span>" + countOf(v.slug) + "</span>";
    g.appendChild(head);

    catsOf(v.slug).forEach(c => {
      const a = document.createElement("a");
      a.className = "dd__l2";
      a.href = catUrl(c);
      a.innerHTML = c.name + "<span>" + c.n + "</span>";
      g.appendChild(a);
    });
    panel.appendChild(g);
  });

  initDD(dd);
}

/* Закреплённые разделы — маркетплейсы и «Для бизнеса». Ниши у них свои, и
   до правки их не было видно вовсе: плашка просто уводила на страницу
   раздела. Теперь у плашки стрелка и свой список — видно, что внутри, не
   уходя с главной. Первой строкой — сам раздел целиком. */
function buildL1Dropdowns() {
  qsa(".dd--l1").forEach(dd => {
    const v = findVertical(dd.dataset.l1);
    if (!v) return;

    const n = qs(".tag__n", dd);
    if (n) n.textContent = countOf(v.slug);
    if (state.l1 === v.slug) qs(".tag", dd).classList.add("is-active");

    const panel = qs(".dd__panel", dd);
    panel.innerHTML = "";

    const all = document.createElement("a");
    all.className = "dd__l1";
    all.href = catalogUrl(v.slug);
    all.innerHTML = "<b>Все купоны раздела</b><span>" + countOf(v.slug) + "</span>";
    panel.appendChild(all);

    catsOf(v.slug).forEach(c => {
      const a = document.createElement("a");
      a.className = "dd__l2" + (state.l1 === c.l1 && state.l2 === c.slug ? " is-active" : "");
      a.href = catUrl(c);
      a.innerHTML = c.name + "<span>" + c.n + "</span>";
      panel.appendChild(a);
    });

    initDD(dd);
  });
}

/* ==========================================================================
   Карточка купона
   ========================================================================== */
function cardHTML(c, compact) {
  /* Два варианта карточки. wb — плотная, как на маркетплейсах: заголовок
     под фото. soft — наша первая версия: заголовок наложен на фото. */
  const wb = document.body.classList.contains("cards-wb");

  /* У купона маркетплейса нет расстояния: он действует в корзине, а не в
     точке на карте. Вместо минут показываем площадку. */
  const corner = c.market
    ? '<span class="card__near card__near--mp">' + c.market + "</span>"
    : '<span class="card__near">' + fmtDist(c.dist) + "</span>";

  /* Город в подписи нужен только в выдаче области: в выдаче города он у
     всех один и превращается в шум. На странице самой ниши по той же
     причине не повторяем её название — оно уже в заголовке страницы. */
  const city = isRegion() && !c.market
    ? '<i class="dot"></i><span>' + c.city.name + "</span>" : "";
  const onOwnPage = state.l1 === c.cat.l1 && state.l2 === c.cat.slug;
  const cat = onOwnPage ? "" : '<i class="dot"></i><span>' + c.cat.name + "</span>";

  return `
    <div class="card__media">
      ${corner}
      <span class="card__share" title="Поделиться">${ICON.share}</span>
      <span class="erid-stamp">Реклама · erid: ${c.erid}</span>
      ${wb
        ? `<span class="card__badge">${c.value}</span>`
        : `<span class="card__value">${c.value}</span>
      <div class="card__cap"><h3 class="card__title">${c.title}</h3></div>`}
    </div>
    <div class="card__body">
      ${wb ? `<h3 class="card__title">${c.title}</h3>` : ""}
      <div class="card__meta">
        <b>${c.company}</b>${cat}${city}
      </div>
      <div class="card__actions">
        ${compact
          /* В рекомендациях кнопка не показывает код: по решению созвона
             07.09.2026 она переносит в смежную нишу и закрепляет этот
             купон первым, чтобы воронка запускалась заново, а не
             закольцовывалась на том же шаге. Раз действие другое — и
             надпись другая: «Забрать купон» здесь обещала бы код. */
          ? `<button type="button" class="btn btn--solid btn--wide" data-card-reveal>Смотреть в категории</button>`
          : `<button type="button" class="btn btn--ghost btn--wide" data-card-more>Подробнее</button>
             <button type="button" class="btn btn--solid" data-card-reveal>Забрать купон</button>`}
      </div>
    </div>`;
}

function makeCard(c, compact) {
  const el = document.createElement("div");
  el.className = "card card-in";
  el.dataset.id = c.id;
  el.setAttribute("role", "button");
  el.setAttribute("tabindex", "0");
  el.setAttribute("aria-label", c.title + " — " + c.company + ", " + c.value);
  el.innerHTML = cardHTML(c, compact);
  el._coupon = c;

  /* В ленте рекомендаций (compact) карточка не открывает поп-ап поверх
     той же страницы — это закольцовывало бы воронку на одном и том же
     шаге. Вместо этого переносим в каталог смежной ниши и закрепляем
     этот купон в выдаче первым (см. consumePin). */
  const goToCategory = () => {
    try { sessionStorage.setItem("cp_pin", JSON.stringify(c)); } catch (err) {}
    location.href = catUrl(c.cat);
  };
  const open = () => openQuick(c, el);
  const activate = compact ? goToCategory : open;

  el.addEventListener("click", activate);
  el.addEventListener("keydown", e => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); activate(); }
  });

  /* В рекомендациях «Подробнее» не рисуется — карточка там одна кнопка */
  const more = qs("[data-card-more]", el);
  if (more) more.onclick = e => { e.stopPropagation(); activate(); };

  /* «Забрать купон» показывает код на месте самой кнопки — без лишнего
     клика и без отдельной полосы. */
  qs("[data-card-reveal]", el).onclick = e => {
    e.stopPropagation();
    if (compact) { activate(); return; }
    revealOnCard(e.currentTarget, c);
  };

  return el;
}

/* Первое нажатие — код на месте кнопки, второе — копирование */
function revealOnCard(btn, c) {
  if (!btn.classList.contains("is-code")) {
    btn.classList.add("is-code");
    btn.textContent = c.code;
    btn.title = "Нажмите, чтобы скопировать";
    noteInterest(c.cat.id);
    return;
  }
  const done = () => {
    btn.textContent = "Скопировано";
    setTimeout(() => { btn.textContent = c.code; }, 1600);
  };
  if (navigator.clipboard) navigator.clipboard.writeText(c.code).then(done, done);
  else done();
}


/* ==========================================================================
   Лента и бесконечная подгрузка
   ==========================================================================
   Выдача определяется тремя вещами: гео (город или область), разделом L1 и
   нишей L2. Ниша задана — лента одной ниши; задан только раздел — лента по
   всем его нишам; не задано ничего — вся витрина города. */
function feedBatch(n) {
  const city = feedCity();
  if (state.l1 && state.l2) return makeBatch(n, state.l1 + "/" + state.l2, city);
  return makeMixedBatch(n, state.l1, city);
}

/* Купон, на который нажали в блоке рекомендаций другой страницы, должен
   встать в выдаче каталога первым — забираем его до обычной подгрузки.
   Возвращает true, если купон был закреплён (тогда лента добирает на
   один купон меньше, чтобы не перебить обычную первую порцию). */
function consumePin(gridSel) {
  let raw;
  try { raw = sessionStorage.getItem("cp_pin"); } catch (e) { return false; }
  if (!raw) return false;
  try { sessionStorage.removeItem("cp_pin"); } catch (e) {}
  let c;
  try { c = JSON.parse(raw); } catch (e) { return false; }
  if (!c || !c.cat || c.cat.l1 !== state.l1 || c.cat.slug !== state.l2) return false;
  const grid = qs(gridSel);
  if (!grid) return false;
  grid.appendChild(makeCard(c));
  return true;
}

let feedBusy = false;
function fillFeed(gridSel, n) {
  const grid = qs(gridSel);
  if (!grid) return;
  const batch = feedBatch(n);
  if (state.near) {
    /* В режиме «рядом» выдача идёт от ближней точки к дальней,
       в том числе при подгрузке следующих порций. */
    const offset = grid.children.length;
    batch.sort((a, b) => a.dist - b.dist);
    batch.forEach((c, i) => {
      c.dist = 150 + (offset + i) * 170 + Math.floor(Math.random() * 110);
    });
  }
  batch.forEach((c, i) => {
    const card = makeCard(c);
    card.style.animationDelay = (i % 8) * 40 + "ms";
    grid.appendChild(card);
  });
}

/* Переключатель «Рядом со мной». В разделах маркетплейсов и «Для бизнеса»
   он бессмысленен — у таких купонов нет точки на карте, — поэтому кнопку
   там просто убираем. */
function initNear(gridSel) {
  const btn = qs("[data-near]");
  const grid = qs(gridSel);
  if (!btn || !grid) return;
  if (state.l1 && state.l1 !== "regional") { btn.remove(); return; }
  btn.onclick = () => {
    state.near = !state.near;
    btn.classList.toggle("is-active", state.near);
    grid.innerHTML = "";
    fillFeed(gridSel, 8);
    initInfinite(gridSel);
  };
}

/* Лента по-настоящему бесконечная — без кнопки «Показать ещё». По решению
   с созвона 07.09.2026: кнопка создаёт лишний клик, мешает метрике
   показов и может задвоить купон при повторном срабатывании рандомайзера.
   Подгружаем сама по скроллу, пока не кончится FEED_MAX. */
const FEED_MAX = 56;

function initInfinite(gridSel) {
  const loader = qs("#loader");
  const grid = qs(gridSel);
  if (!loader || !grid) return;

  const dots = '<span class="loader__dot"></span><span class="loader__dot"></span>' +
               '<span class="loader__dot"></span><span style="margin-left:6px">подгружаем ещё купоны</span>';

  function paint() {
    if (grid.children.length >= FEED_MAX) {
      loader.innerHTML = '<span class="feed-end">Вы посмотрели все купоны ' +
        geoIn() + '. Новые появляются каждый день.</span>';
      showFeedRecos();
      return;
    }
    loader.innerHTML = dots;
  }

  paint();

  new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting || feedBusy) return;
    if (grid.children.length >= FEED_MAX) return;
    feedBusy = true;
    setTimeout(() => {
      fillFeed(gridSel, 8);
      feedBusy = false;
      paint();
    }, 320);
  }, { rootMargin: "300px" }).observe(loader);
}

/* Хвост бесконечной ленты. На созвоне 07.09.2026 блок рекомендаций был
   привязан к концу выдачи: «когда вот эта кнопка кончится, кончится вся
   выдача — блок рекомендаций». Кнопку «Показать ещё» убрали, но сам блок
   остался нужен, поэтому показываем его там же — когда лента исчерпана.
   Нишу берём из того, что посетитель раскрывал (state.interest), а не из
   общего топа: рекомендация должна отвечать на просмотренное. */
function showFeedRecos() {
  const host = qs("#feedRecos");
  if (!host || host.dataset.on === "1") return;

  let cat = null;
  if (state.l1 && state.l2) cat = findCat(state.l1 + "/" + state.l2);
  if (!cat && state.interest.length) cat = findCat(state.interest[0]);
  if (!cat) cat = catsOf(state.l1 || "regional").sort((a, b) => b.n - a.n)[0];

  const src = qs("#recosSource");
  if (src) src.textContent = state.interest.length
    ? "Вы смотрели «" + cat.name + "»"
    : "Популярное " + geoIn() + " — «" + cat.name + "»";
  buildRecommendations(cat);
  host.dataset.on = "1";
  host.hidden = false;
}

/* ==========================================================================
   Раскрытие купона поверх ленты (без перехода на новую страницу)
   ========================================================================== */
let originCard = null;
let fromTransform = "";

function quickHTML(c) {
  /* Порядок блоков — сама воронка: промокод забирают раньше, чем
     успевают отвлечься на условия. Условия — позитивная инструкция
     «как воспользоваться», а не список запретов, и не в центре внимания.

     Два варианта компоновки — на созвоне 07.09.2026 выбор не сделали.
     side (по умолчанию) — промокод в правой колонке, как было.
     left — промокод и кнопка уходят под картинку влево: предложение Коли,
     чтобы уравновесить композицию, когда слева появится реальное фото. */
  const revealBlock = `
      <div class="reveal" data-reveal>
        <div class="block-label" style="margin:0">Промокод · действует ${c.until}</div>
        <div class="reveal__row">
          <div class="reveal__code">${c.code}</div>
          <button class="btn btn--solid btn--lg reveal__cta" data-reveal-btn>Забрать купон</button>
          <div class="reveal__done">Код открыт — назовите его на кассе или сделайте скриншот</div>
        </div>
      </div>`;
  const left = document.body.classList.contains("quick-left");

  /* Купон маркетплейса действует на площадке: вместо адреса и минут —
     площадка и ссылка на карточку товара. */
  const place = c.market
    ? `<span>${c.market}</span>`
    : `<span>${c.city.name}</span><i class="dot"></i><span>${fmtDist(c.dist)} от вас</span>`;

  const whereBlock = c.market
    ? `<div>
        <div class="block-label">Где действует</div>
        <div class="market-where">
          <b>${c.market}</b>
          <span>Код вводится в корзине на площадке</span>
          <a class="soc" href="#">${ICON.link} Открыть карточку товара</a>
        </div>
      </div>`
    : `<div>
        <div class="block-label">Где действует</div>
        <div class="map">
          <span class="map__pin">${ICON.pinFill}</span>
          <span style="margin-top:34px">${c.city.name}, ${c.address}</span>
        </div>
      </div>`;

  return `
    <button class="quick__close" data-quick-close>${ICON.close}</button>
    <div class="quick__media">
      <div class="quick__photo">
        <span class="quick__value">${c.value}</span>
        <span class="erid-stamp">Реклама · erid: ${c.erid}</span>
      </div>
      ${left ? revealBlock : ""}
    </div>
    <div class="quick__side">
      <div class="quick__eyebrow">
        <span>${c.cat.vertical.name}</span><i class="dot"></i>
        <span>${c.cat.name}</span><i class="dot"></i>
        ${place}<i class="dot"></i>
        <span>${ICON.eye} ${c.views}</span>
      </div>
      <h3>${c.title}</h3>

      <div class="company">
        <div class="company__logo">лого</div>
        <div>
          <div class="company__name">${c.company}</div>
          <div class="company__req">ИНН 0000000000 · ${c.market ? c.market : c.address}</div>
        </div>
        <div class="socials">
          <a class="soc" href="#" title="Сайт компании">${ICON.link} Сайт</a>
          <a class="soc" href="#" title="Компания ВКонтакте">${ICON.link} ВКонтакте</a>
          <a class="soc" href="#" title="Компания в Telegram">${ICON.link} Telegram</a>
        </div>
      </div>

      ${left ? "" : revealBlock}

      <!-- Единственное место, где сервис быстро объясняет, как этим
           пользоваться. Виль на созвоне 07.09.2026 просил свести условия
           ровно к этому — «сохрани купон, сделай скриншот, воспользуйся» —
           и выкинуть «мишуру про 30 дней, один купон одного человека»:
           такие оговорки становились центром внимания и противоречили
           самой концепции. Развёрнутые правила живут на странице купона. -->
      <div>
        <div class="block-label">Как воспользоваться</div>
        <ul class="terms">
          <li>Сохраните код или сделайте скриншот — переходить никуда не нужно.</li>
          <li>${c.market
                ? "Введите код в корзине на площадке при оформлении заказа."
                : "Покажите код на кассе или назовите администратору при оплате."}</li>
        </ul>
      </div>

      ${whereBlock}

      <div class="quick__foot">
        <button type="button" class="btn btn--ghost" data-share>${ICON.share} Поделиться</button>
        <a class="btn btn--ghost" href="coupon.html" data-open-page>Открыть страницу купона</a>
      </div>
    </div>`;
}

function openQuick(c, cardEl) {
  const quick = qs("#quick");
  const overlay = qs("#overlay");
  quick.innerHTML = quickHTML(c);

  noteInterest(c.cat.id);

  const r = cardEl.getBoundingClientRect();
  const qw = quick.offsetWidth;
  const dx = (r.left + r.width / 2) - window.innerWidth / 2;
  const dy = (r.top + r.height / 2) - window.innerHeight / 2;
  const sc = Math.max(.25, r.width / qw);
  fromTransform = `translate(-50%,-50%) translate(${dx}px, ${dy}px) scale(${sc})`;

  originCard = cardEl;
  cardEl.classList.add("is-open");

  quick.style.transition = "none";
  quick.style.transform = fromTransform;
  overlay.classList.add("is-on");
  document.body.classList.add("no-scroll");

  /* Форсируем пересчёт стилей, чтобы браузер зафиксировал стартовую позицию.
     Через requestAnimationFrame нельзя: в неактивной вкладке он не срабатывает
     и окно купона не открывается вовсе. */
  void quick.offsetWidth;
  quick.style.transition = "";
  quick.classList.add("is-on");
  quick.style.transform = "";

  qs("[data-quick-close]", quick).onclick = closeQuick;

  /* Переносим на страницу купона именно тот купон, который открыли */
  const page = qs("[data-open-page]", quick);
  if (page) {
    page.href = couponPageUrl(c);
    page.onclick = () => {
      try { sessionStorage.setItem("cp_coupon", JSON.stringify(c)); } catch (e) {}
    };
  }

  /* Поделиться можно только ссылкой на отдельную страницу купона: у попапа
     своего адреса нет, поэтому кнопка отдаёт именно её (системный шаринг,
     иначе — копирование ссылки; значки соцсетей сюда не выносим). */
  const share = qs("[data-share]", quick);
  if (share) share.onclick = () => shareCoupon(share, c);

  const rev = qs("[data-reveal]", quick);
  qs("[data-reveal-btn]", quick).onclick = () => {
    rev.classList.add("is-open");
  };
}

/* Адрес страницы купона — один на купон и без гео: по ТЗ §3.2.11 у карточки
   единственный URL /coupon/{id}/, две копии под разными путями запрещены. */
function couponPageUrl(c) {
  const base = location.href.replace(/[^/]*$/, "");
  return base + "coupon.html?id=" + c.id + "&cat=" + c.cat.id;
}

function shareCoupon(btn, c) {
  const url = couponPageUrl(c);
  const done = () => {
    const was = btn.innerHTML;
    btn.textContent = "Ссылка скопирована";
    setTimeout(() => { btn.innerHTML = was; }, 1800);
  };
  if (navigator.share) {
    navigator.share({ title: c.title, text: c.company, url: url }).catch(() => {});
    return;
  }
  if (navigator.clipboard) navigator.clipboard.writeText(url).then(done, done);
  else done();
}

function closeQuick() {
  const quick = qs("#quick");
  const overlay = qs("#overlay");
  quick.style.transform = fromTransform;
  quick.classList.remove("is-on");
  overlay.classList.remove("is-on");
  document.body.classList.remove("no-scroll");
  if (originCard) originCard.classList.remove("is-open");
  setTimeout(() => { quick.style.transform = ""; }, 380);
}

/* ==========================================================================
   Блок рекомендаций — смежные ниши
   ========================================================================== */
function buildRecommendations(cat) {
  const rail = qs("#rail");
  if (!rail) return;
  rail.innerHTML = "";
  if (!cat) return;

  /* Смежные ниши берём внутри своего раздела: «одежда» на маркетплейсах и
     «одежда» в городе — разные категории, и подмешивать одну в выдачу
     другой нельзя. Блок обещает «не прямых конкурентов» — значит,
     показывать он должен ровно то, что назвал в подписи. */
  const adjacent = adjacentOf(cat);
  if (!adjacent.length) return;

  const label = qs("#railLabel");
  if (label) label.textContent = adjacent.map(c => c.name).join(" · ");

  const used = new Set();
  for (let i = 0; i < 9; i++) {
    const id = adjacent[i % adjacent.length].id;
    let c = makeCoupon(id, feedCity());
    for (let t = 0; t < 12 && used.has(c.title + c.company); t++) c = makeCoupon(id, feedCity());
    used.add(c.title + c.company);
    rail.appendChild(makeCard(c, true));
  }

  initRailNav(rail);
}

/* Листание рекомендаций. Полоса прокрутки скрыта, поэтому нужны явные
   стрелки: на созвоне отдельно проговаривали, что на догадливость по
   скроллу полагаться нельзя. Стрелка показывается только с той стороны,
   куда действительно есть куда листать. */
function initRailNav(rail) {
  const wrap = rail.parentElement;
  if (!wrap || wrap.dataset.nav === "1") return;
  wrap.dataset.nav = "1";

  const mk = dir => {
    const b = document.createElement("button");
    b.className = "rail-nav rail-nav--" + dir;
    b.type = "button";
    b.setAttribute("aria-label", dir === "prev" ? "Назад" : "Дальше");
    b.innerHTML = '<span class="chev">' + ICON.chev + "</span>";
    b.onclick = () => rail.scrollBy({
      left: Math.round(rail.clientWidth * .8) * (dir === "prev" ? -1 : 1),
      behavior: "smooth"
    });
    wrap.appendChild(b);
    return b;
  };
  const prev = mk("prev"), next = mk("next");

  const sync = () => {
    const max = rail.scrollWidth - rail.clientWidth;
    const canPrev = rail.scrollLeft > 4;
    const canNext = rail.scrollLeft < max - 4;
    prev.classList.toggle("is-on", canPrev);
    next.classList.toggle("is-on", canNext);
    wrap.classList.toggle("can-prev", canPrev);
    wrap.classList.toggle("can-next", canNext);
  };
  rail.addEventListener("scroll", sync, { passive: true });
  window.addEventListener("resize", sync);
  sync();
}

/* ==========================================================================
   Хлебные крошки и строка адреса
   ==========================================================================
   Крошки повторяют путь из ТЗ: гео, раздел, ниша. Под ними — сам ЧПУ:
   на согласовании по нему видно, что раздел L1 в адресе обязателен и что
   одна и та же ниша в разных разделах даёт разные страницы. */
function renderCrumbs(hostSel, tail) {
  const host = qs(hostSel);
  if (!host) return;
  const parts = [`<a href="index.html">Главная</a>`];
  parts.push(`<a href="${catalogUrl()}">${geoName()}</a>`);
  if (state.l1) {
    const v = findVertical(state.l1);
    parts.push(`<a href="${catalogUrl(state.l1)}">${v.name}</a>`);
    if (state.l2) {
      const c = findCat(state.l1 + "/" + state.l2);
      if (c) parts.push(tail
        ? `<a href="${catUrl(c)}">${c.name}</a>`
        : `<span class="mute">${c.name}</span>`);
    }
  }
  if (tail) parts.push(`<span class="mute">${tail}</span>`);
  host.innerHTML = parts.join(" · ");
}

function renderChpu(hostSel, path) {
  const host = qs(hostSel);
  if (host) host.textContent = path;
}

/* ==========================================================================
   Страница каталога
   ========================================================================== */
function renderCatalog() {
  const v = state.l1 ? findVertical(state.l1) : null;
  if (!v) state.l1 = state.l2 = null;
  const cat = state.l1 && state.l2 ? findCat(state.l1 + "/" + state.l2) : null;
  if (state.l2 && !cat) state.l2 = null;

  const title = cat ? cat.name : (v ? v.title : "Все купоны");
  const heading = title + " " + geoIn();

  qs("#catTitle").textContent = heading;
  document.title = title + " " + geoIn() + " — купоны";
  renderCrumbs("#crumbs");
  renderChpu("#chpu", chpu(state.l1, state.l2));

  const hint = qs("#catHint");
  if (hint) hint.textContent = cat ? "" : (v ? v.hint : "");

  /* Строка ниш показывает текущий раздел: из «Маркетплейсов» нельзя
     провалиться в региональную «Еду», это соседняя ветка витрины. */
  buildTags(state.l1);

  const count = qs("#catCount");
  if (count) count.textContent = (cat ? cat.n : (v ? countOf(v.slug) : "1 800")) + " купонов";

  /* Переключатель «город / вся область» — тот самый переход на /region/
     из ТЗ. Живёт в тулбаре рядом с городом, а не прячется в попапе. */
  const scope = qs("#scopeBtn");
  if (scope) {
    scope.innerHTML = isRegion()
      ? "Область: <b>" + REGION.name + "</b>"
      : "Город: <b>" + state.city.name + "</b>";
    scope.onclick = () => goGeo(isRegion() ? "city" : "region");
  }
  const sel = qs("#catSelectLabel");
  if (sel) sel.textContent = cat ? cat.name : (v ? v.name : "Все категории");

  /* Купон из блока рекомендаций другой страницы встаёт первым, а лента
     добирает на один меньше — иначе первая порция окажется из девяти */
  const hasPin = consumePin("#feed");
  fillFeed("#feed", hasPin ? 7 : 8);
  initInfinite("#feed");
  initNear("#feed");
  buildRecommendations(cat || catsOf(state.l1 || "regional").sort((a, b) => b.n - a.n)[0]);
}

/* ==========================================================================
   Страница купона
   ==========================================================================
   Развёрнутые правила — то, ради чего полная страница вообще нужна: попап
   держит быстрый путь (код и «Забрать купон»), а здесь отвечаем на вопросы,
   из-за которых человек мог бы не дойти до кассы. Формулировки
   утвердительные: на созвоне 07.09.2026 Виль просил, чтобы правила
   объясняли, как пользоваться правильно, а не перечисляли запреты.
   Два набора: купон в городе показывают на кассе, купон маркетплейса
   вводят в корзине — одним текстом это не описать. Всё — рыба, согласуется
   с заказчиком (см. README). */
const RULES = {
  regional: {
    steps: [
      ["Открываете код", "Прямо на этой странице. Ничего оплачивать и регистрироваться не нужно — купон бесплатный, и таким останется."],
      ["Сохраняете скриншотом", "Код останется в галерее телефона и будет под рукой, даже если в заведении не ловит интернет."],
      ["Приходите в любой день срока", "Спешить не нужно: купон действует весь указанный период, а не один день."],
      ["Показываете код при оплате", "На кассе или администратору — скидку применят сразу к чеку."]
    ],
    terms: [
      "Код можно показать с экрана телефона или скриншотом — распечатывать не нужно.",
      "Скидка считается от итогового чека. Если у заведения в этот день своя акция — выбирайте ту, что выгоднее для вас.",
      "Один купон — на одного гостя. Пришли компанией: каждый открывает свой код, это бесплатно и занимает несколько секунд.",
      "Купон можно передать другу — кнопка «Поделиться» отправит ссылку на эту страницу, и код откроется у него точно так же.",
      "Купон уже сработал? Он остаётся у вас в истории, а новые предложения этой компании появляются в её карточке.",
      "Если код не приняли, напишите нам — разберёмся с заведением и подскажем, чем заменить предложение."
    ]
  },
  marketplace: {
    steps: [
      ["Открываете код", "Прямо на этой странице. Ничего оплачивать и регистрироваться не нужно — купон бесплатный, и таким останется."],
      ["Переходите на площадку", "Кнопка «Открыть карточку товара» ведёт к тому самому товару, на который действует скидка."],
      ["Вводите код в корзине", "Поле промокода — на шаге оформления заказа. Скидка пересчитает сумму сразу."],
      ["Заказываете в любой день срока", "Спешить не нужно: код работает весь указанный период."]
    ],
    terms: [
      "Код вводится на самой площадке — сервис ничего не продаёт и ничего не списывает.",
      "Скидка применяется к товарам продавца, указанным в купоне. У других продавцов этот код не сработает.",
      "Если у площадки в этот день своя акция — выбирайте ту, что выгоднее для вас.",
      "Код можно передать другу — кнопка «Поделиться» отправит ссылку на эту страницу.",
      "Доставка, возврат и гарантия остаются на условиях площадки и продавца.",
      "Если код не принялся, напишите нам — уточним у продавца и подскажем, чем заменить предложение."
    ]
  }
};
/* «Для бизнеса» — те же условия, что у городского купона: сделка идёт
   напрямую с компанией, а не через площадку. */
RULES["for-business"] = RULES.regional;

function renderRules(c) {
  const host = qs("#rules");
  if (!host) return;
  const r = RULES[c.cat.l1] || RULES.regional;
  host.innerHTML = `
    <ol class="steps">
      ${r.steps.map(s => `<li><b>${s[0]}</b>${s[1]}</li>`).join("")}
    </ol>
    <div class="rules__list">
      <div class="block-label">Правила — как пользоваться купоном</div>
      <ul class="terms">${r.terms.map(t => `<li>${t}</li>`).join("")}</ul>
    </div>`;
}

function currentCoupon() {
  /* Купон приходит из попапа. Если зашли по прямой ссылке (как придёт
     посетитель из поиска) — собираем купон по нише из адреса. */
  try {
    const raw = sessionStorage.getItem("cp_coupon");
    if (raw) {
      const c = JSON.parse(raw);
      const want = params.get("cat");
      if (!want || c.cat.id === want) {
        /* Из sessionStorage категория и город приходят копиями — возвращаем
           ссылки на справочник, иначе сравнения по id перестают работать. */
        c.cat = findCat(c.cat.id) || c.cat;
        c.city = findCity(c.city.slug) || c.city;
        return c;
      }
    }
  } catch (e) {}
  return makeCoupon(params.get("cat") || "regional/krasota", feedCity());
}

function renderCouponPage() {
  const c = currentCoupon();
  state.l1 = c.cat.l1;
  state.l2 = c.cat.slug;

  document.title = c.title + " — " + c.company + ", " + c.city.name;
  renderCrumbs("#crumbs", c.title);
  renderChpu("#chpu", "/coupon/" + c.id + "/");

  const place = c.market
    ? `<span>${c.market}</span>`
    : `<span>${c.city.name}</span><i class="dot"></i><span>${fmtDist(c.dist)} от вас</span>`;

  const whereBlock = c.market
    ? `<div>
        <div class="block-label">Где действует</div>
        <div class="market-where">
          <b>${c.market}</b>
          <span>Код вводится в корзине на площадке при оформлении заказа</span>
          <a class="soc" href="#">${ICON.link} Открыть карточку товара</a>
        </div>
      </div>`
    : `<div>
        <div class="block-label">Где действует</div>
        <div class="map">
          <span class="map__pin">${ICON.pinFill}</span>
          <span style="margin-top:34px">${c.city.name}, ${c.address}</span>
        </div>
      </div>`;

  qs("#couponRoot").innerHTML = `
    <div class="coupon__left">
      <div class="coupon__hero">
        <span class="coupon__value">${c.value}</span>
        <span class="erid-stamp">Реклама · erid: ${c.erid}</span>
      </div>
    </div>

    <div class="coupon__right">
      <div class="coupon__meta">
        <a href="${catalogUrl(c.cat.l1)}">${c.cat.vertical.name}</a><i class="dot"></i>
        <a href="${catUrl(c.cat)}">${c.cat.name}</a><i class="dot"></i>
        ${place}<i class="dot"></i>
        <span>${ICON.eye} ${c.views}</span><i class="dot"></i>
        <span>Действует ${c.until}</span>
      </div>

      <h1>${c.title}</h1>

      <div class="company">
        <div class="company__logo">лого</div>
        <div>
          <div class="company__name">${c.company}</div>
          <div class="company__req">ИНН 0000000000 · ${c.market ? c.market : c.address}</div>
        </div>
        <div class="socials">
          <a class="soc" href="#" title="Сайт компании">${ICON.link} Сайт</a>
          <a class="soc" href="#" title="Компания ВКонтакте">${ICON.link} ВКонтакте</a>
          <a class="soc" href="#" title="Компания в Telegram">${ICON.link} Telegram</a>
        </div>
      </div>

      <div class="reveal reveal--big" data-reveal>
        <div class="block-label" style="margin:0">Промокод · действует ${c.until}</div>
        <div class="reveal__row">
          <div class="reveal__code">${c.code}</div>
          <button class="btn btn--solid btn--lg reveal__cta" data-reveal-btn>Забрать купон</button>
          <div class="reveal__done">Код открыт — назовите его на кассе или сделайте скриншот</div>
        </div>
      </div>

      <div class="coupon__actions">
        <button type="button" class="btn btn--ghost btn--lg" data-share>${ICON.share} Поделиться</button>
        <button type="button" class="btn btn--ghost btn--lg">Сохранить скриншотом</button>
      </div>

      <!-- Короткий список условий здесь не повторяем: он дословно совпадал
           с попапом, а страница по решению созвона должна давать больше,
           а не то же самое. Развёрнутые правила — отдельной секцией ниже,
           чтобы не спорить за внимание с промокодом. -->
      ${whereBlock}
    </div>`;

  const rev = qs("[data-reveal]", qs("#couponRoot"));
  qs("[data-reveal-btn]", rev).onclick = () => {
    rev.classList.add("is-open");
  };

  const share = qs("[data-share]", qs("#couponRoot"));
  if (share) share.onclick = () => shareCoupon(share, c);

  renderRules(c);

  /* О компании — краткое описание из профиля продавца. У продавца на
     маркетплейсе нет ни адреса, ни режима работы, поэтому и текст другой. */
  qs("#aboutName").textContent = c.company;
  qs("#aboutLead").textContent = c.market
    ? "продаёт на " + c.market + " с 2021 года. Отгрузка со склада площадки, " +
      "возврат по правилам маркетплейса."
    : "работает в городе с 2014 года. Своя команда, собственное оборудование, " +
      "запись день в день.";
  qs("#aboutWhere").textContent = c.market
    ? "Площадка: " + c.market + ". Промокод действует в корзине при оформлении заказа."
    : "Адрес: " + c.city.name + ", " + c.address + ". Режим работы: ежедневно 10:00–21:00.";

  /* Другие купоны той же компании */
  const own = qs("#companyFeed");
  const used = new Set([c.title]);
  for (let i = 0; i < 4; i++) {
    let x = makeCoupon(c.cat.id, c.city);
    let tries = 0;
    while (used.has(x.title) && tries < 14) { x = makeCoupon(c.cat.id, c.city); tries++; }
    /* Заготовок в нише может быть меньше четырёх — лучше показать
       два разных купона, чем четыре с повторами. */
    if (used.has(x.title)) break;
    used.add(x.title);
    x.company = c.company;
    x.address = c.address;
    x.market = c.market;
    own.appendChild(makeCard(x));
  }
  if (!own.children.length) own.closest(".section").remove();
  qs("#companyFeedLabel").textContent = c.company;

  /* SEO-текст: тот самый «просто текст» под каждую связку ниша/город.
     Раздел в заголовке назван прямо — по нему видно, что «Одежда» в
     маркетплейсах и «Одежда» в городе это две разные страницы. */
  qs("#seoTitle").textContent =
    c.cat.name + " · " + c.cat.vertical.name.toLowerCase() + " " + geoIn() +
    ": купон «" + c.title + "»";
  qs("#seoLead").textContent = c.market
    ? "Скидка действует по промокоду на " + c.market + ". Чтобы получить её, " +
      "не нужно ничего оплачивать и регистрироваться: откройте код и введите " +
      "его в корзине при оформлении заказа."
    : "Скидка действует " + geoIn() + " по промокоду. Чтобы получить её, не нужно " +
      "ничего оплачивать и регистрироваться: откройте код, сделайте скриншот и " +
      "предъявите его на месте.";
  qs("#seoTail").textContent =
    "Другие предложения ниши «" + c.cat.name + "» в разделе «" +
    c.cat.vertical.name + "» смотрите в каталоге — список обновляется каждый день.";

  buildRecommendations(c.cat);
}


/* ==========================================================================
   Общая инициализация
   ========================================================================== */
function initIcons() {
  qsa("[data-icon]").forEach(el => el.innerHTML = ICON[el.dataset.icon] || "");
}

function initSearch() {
  qsa(".search").forEach(form => {
    const input = qs("input", form);
    const go = () => {
      const q = encodeURIComponent(input.value.trim());
      location.href = catalogUrl(state.l1, state.l2) + "&q=" + q;
    };
    const btn = qs(".search__go", form);
    if (btn) btn.onclick = go;
    input.addEventListener("keydown", e => { if (e.key === "Enter") go(); });
    const voice = qs(".search__voice", form);
    if (voice) voice.onclick = () => {
      input.value = "хочу скидку на кофе рядом со мной";
      input.focus();
    };
  });
}

document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    if (qs("#quick") && qs("#quick").classList.contains("is-on")) closeQuick();
  }
});

/* Стиль карточек: ?cards=wb (по умолчанию) или ?cards=soft — первая версия.
   Выбор запоминается, чтобы не сбрасывался при переходе между страницами. */
function initCardStyle() {
  let style = params.get("cards");
  if (style !== "wb" && style !== "soft") {
    style = localStorage.getItem("cp_cards2") || "soft";
  }
  localStorage.setItem("cp_cards2", style);
  document.body.classList.add("cards-" + style);
}

/* Компоновка попапа купона: ?quick=side (промокод справа, по умолчанию)
   или ?quick=left (промокод под картинкой слева — вариант Коли). Выбор
   на созвоне не сделали, поэтому оба смотрятся переключением адреса. */
function initQuickStyle() {
  let style = params.get("quick");
  if (style !== "left" && style !== "side") {
    style = localStorage.getItem("cp_quick") || "side";
  }
  localStorage.setItem("cp_quick", style);
  document.body.classList.add("quick-" + style);
}

/* Переход «город ↔ вся область» рядом с самой выдачей. По ТЗ это смена
   адреса на /region/, поэтому ссылка ведёт на другую страницу, а не
   переключает состояние текущей. */
function initScopeAlt() {
  const alt = qs("#scopeAlt");
  if (!alt) return;
  alt.textContent = isRegion()
    ? "Показать только " + state.city.name
    : "Показать всю " + REGION.acc;
  alt.onclick = e => { e.preventDefault(); goGeo(isRegion() ? "city" : "region"); };
}

function initCommon() {
  initCardStyle();
  initQuickStyle();
  initIcons();
  initScopeAlt();
  buildCityModal();
  initCityGate();
  renderGeo();
  initSearch();
  const ov = qs("#overlay");
  if (ov) ov.onclick = closeQuick;
}
