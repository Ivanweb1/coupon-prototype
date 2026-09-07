/* ==========================================================================
   Логика прототипа: лента, раскрытие купона, город, метрики.
   ========================================================================== */

const qs  = (s, r = document) => r.querySelector(s);
const qsa = (s, r = document) => Array.from(r.querySelectorAll(s));
const params = new URLSearchParams(location.search);
const EMBED = params.get("embed") === "1";

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
  link:   '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M10 14a3.5 3.5 0 0 0 5 0l3-3a3.5 3.5 0 0 0-5-5l-1 1"/><path d="M14 10a3.5 3.5 0 0 0-5 0l-3 3a3.5 3.5 0 0 0 5 5l1-1"/></svg>'
};

/* ---------- Состояние ---------- */
/* Город определяется автоматически (в проде — по IP) и подтверждается
   попапом на входе: город — ключевой триггер сервиса. */
const state = {
  city: localStorage.getItem("cp_city") || CITIES[0],
  cityConfirmed: localStorage.getItem("cp_city_ok") === "1",
  cat: params.get("cat") || null,
  near: false,
  metrics: { shown: 0, opened: 0, revealed: 0 },
  seen: new Set()
};

/* Расстояние до точки — в минутах, а не в метрах: по решению с созвона
   07.09.2026 точная геопозиция не нужна, а «в 5 минутах» понятнее и не
   требует точного определения местоположения пользователя. Ближе 300 м
   считаем пешком (~5 км/ч), дальше — на транспорте по городу (~25 км/ч). */
function fmtDist(m) {
  const min = m < 300 ? Math.max(1, Math.round(m / 80)) : Math.max(2, Math.round(m / 420));
  return min + " мин";
}

/* ==========================================================================
   Город
   ========================================================================== */
function renderCity() {
  qsa("[data-city-name]").forEach(el => el.textContent = state.city || "Выберите город");
  /* Иконки соцсетей города — сам значок оставляем нетронутым (его рисует
     initIcons), город уходит в подсказку при наведении */
  qsa("[data-city-social]").forEach(el => {
    const net = el.dataset.citySocial;
    el.title = "Мы в " + net + (state.city ? " · " + state.city : "");
  });
}

function setCity(name) {
  state.city = name;
  localStorage.setItem("cp_city", name);
  confirmCity();
  renderCity();
  qs("#cityModal").classList.remove("is-on");
  document.body.classList.remove("no-scroll");
  qsa("#cityModal .city-list button").forEach(b => {
    b.classList.toggle("is-active", b.textContent === name);
  });
}

function confirmCity() {
  state.cityConfirmed = true;
  localStorage.setItem("cp_city_ok", "1");
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
  qsa("[data-city-detected]").forEach(el => el.textContent = state.city || CITIES[0]);
  modal.classList.add("is-on");
  document.body.classList.add("no-scroll");
  const yes = qs("[data-city-yes]", modal);
  if (yes) yes.onclick = () => setCity(state.city || CITIES[0]);
}

function buildCityModal() {
  const modal = qs("#cityModal");
  if (!modal) return;
  const list = qs(".city-list", modal);
  CITIES.forEach(c => {
    const b = document.createElement("button");
    b.textContent = c;
    if (c === state.city) b.classList.add("is-active");
    b.onclick = () => setCity(c);
    list.appendChild(b);
  });
  qs("[data-city-close]", modal).onclick = () => {
    if (!state.city) setCity(CITIES[0]);
    modal.classList.remove("is-on");
    document.body.classList.remove("no-scroll");
  };
  qsa("[data-city-open]").forEach(b => b.onclick = () => {
    modal.classList.add("is-on");
  });
}

/* ==========================================================================
   Категории
   ========================================================================== */
function buildTags() {
  const host = qs("#tags");
  if (!host) return;
  /* Показываем все категории, отсортированные по числу активных купонов
     в городе: строка одна, длинная — её листают вправо. Marketplace и
     «Для бизнеса» сюда не попадают — это отдельные ветки строкой выше,
     а не рядовые категории вроде «кафе». */
  CATEGORIES.filter(c => c.id !== "marketplace" && c.id !== "business")
    .sort((a, b) => b.n - a.n).forEach(c => {
    const a = document.createElement("a");
    a.className = "tag" + (state.cat === c.id ? " is-active" : "");
    a.href = "catalog.html?cat=" + c.id + (EMBED ? "&embed=1" : "");
    a.innerHTML = c.name + ' <span class="tag__n">' + c.n + "</span>";
    host.appendChild(a);
  });

  /* Подсказка, что строка продолжается за правым краем: затухание плюс
     явная стрелка — на догадливость по скроллу полагаться нельзя */
  const row = qs("#tagsRow");
  const sync = () => {
    const more = row.scrollWidth - row.clientWidth - row.scrollLeft > 8;
    row.classList.toggle("has-more", more);
  };
  row.addEventListener("scroll", sync, { passive: true });
  window.addEventListener("resize", sync);
  sync();

  const more = qs("[data-tags-more]");
  if (more) more.onclick = () => {
    row.scrollBy({ left: Math.round(row.clientWidth * .8), behavior: "smooth" });
  };
}

function buildDropdown() {
  const dd = qs("#allCats");
  if (!dd) return;
  const panel = qs(".dd__panel", dd);
  CATEGORIES.forEach(c => {
    const a = document.createElement("a");
    a.href = "catalog.html?cat=" + c.id + (EMBED ? "&embed=1" : "");
    a.innerHTML = c.name + " <span>" + c.n + "</span>";
    panel.appendChild(a);
  });
  qs("[data-dd-toggle]", dd).onclick = e => {
    e.stopPropagation();
    dd.classList.toggle("is-open");
  };
  document.addEventListener("click", () => dd.classList.remove("is-open"));
  panel.onclick = e => e.stopPropagation();
}

/* ==========================================================================
   Карточка купона
   ========================================================================== */
function cardHTML(c, compact) {
  /* Два варианта карточки. wb — плотная, как на маркетплейсах: заголовок
     под фото. soft — наша первая версия: заголовок наложен на фото. */
  const wb = document.body.classList.contains("cards-wb");
  return `
    <div class="card__media">
      <span class="card__near">${fmtDist(c.dist)}</span>
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
        <b>${c.company}</b><i class="dot"></i><span>${c.cat.name}</span>
      </div>
      <div class="card__actions">
        <button type="button" class="btn btn--ghost btn--wide" data-card-more>Подробнее</button>
        <button type="button" class="btn btn--solid" data-card-reveal>Забрать купон</button>
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
     шаге. Вместо этого переносим в каталог смежной категории и закрепляем
     этот купон в выдаче первым (см. consumePin). */
  const goToCategory = () => {
    try { sessionStorage.setItem("cp_pin", JSON.stringify(c)); } catch (err) {}
    location.href = "catalog.html?cat=" + c.cat.id + (EMBED ? "&embed=1" : "");
  };
  const open = () => openQuick(c, el);
  const activate = compact ? goToCategory : open;

  el.addEventListener("click", activate);
  el.addEventListener("keydown", e => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); activate(); }
  });

  qs("[data-card-more]", el).onclick = e => { e.stopPropagation(); activate(); };

  /* «Забрать купон» показывает код на месте самой кнопки — без лишнего
     клика и без отдельной полосы. */
  qs("[data-card-reveal]", el).onclick = e => {
    e.stopPropagation();
    if (compact) { activate(); return; }
    revealOnCard(e.currentTarget, c);
  };

  impressions.observe(el);
  return el;
}

/* Первое нажатие — код на месте кнопки, второе — копирование */
function revealOnCard(btn, c) {
  if (!btn.classList.contains("is-code")) {
    btn.classList.add("is-code");
    btn.textContent = c.code;
    btn.title = "Нажмите, чтобы скопировать";
    state.metrics.revealed++;
    paintMetrics();
    return;
  }
  const done = () => {
    btn.textContent = "Скопировано";
    setTimeout(() => { btn.textContent = c.code; }, 1600);
  };
  if (navigator.clipboard) navigator.clipboard.writeText(c.code).then(done, done);
  else done();
}

/* Показ засчитывается, когда карточка реально попала в экран */
const impressions = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const key = e.target.dataset.id + "@" + (e.target.closest(".rail") ? "rail" : "grid");
    if (!state.seen.has(key)) {
      state.seen.add(key);
      state.metrics.shown++;
      paintMetrics();
    }
    impressions.unobserve(e.target);
  });
}, { threshold: .5 });

/* ==========================================================================
   Лента и бесконечная подгрузка
   ========================================================================== */

/* Купон, на который нажали в блоке рекомендаций другой страницы, должен
   встать в выдаче каталога первым — забираем его до обычной подгрузки.
   Возвращает true, если купон был закреплён (тогда лента добирает на
   один купон меньше, чтобы не перебить обычную первую порцию). */
function consumePin(gridSel, catId) {
  let raw;
  try { raw = sessionStorage.getItem("cp_pin"); } catch (e) { return false; }
  if (!raw) return false;
  try { sessionStorage.removeItem("cp_pin"); } catch (e) {}
  let c;
  try { c = JSON.parse(raw); } catch (e) { return false; }
  if (!c || !c.cat || c.cat.id !== catId) return false;
  const grid = qs(gridSel);
  if (!grid) return false;
  grid.appendChild(makeCard(c));
  return true;
}

let feedBusy = false;
function fillFeed(gridSel, n, catId) {
  const grid = qs(gridSel);
  if (!grid) return;
  const batch = makeBatch(n, catId);
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

/* Переключатель «Рядом со мной» */
function initNear(gridSel, catId) {
  const btn = qs("[data-near]");
  const grid = qs(gridSel);
  if (!btn || !grid) return;
  btn.onclick = () => {
    state.near = !state.near;
    btn.classList.toggle("is-active", state.near);
    grid.innerHTML = "";
    state.seen.clear();
    fillFeed(gridSel, 8, catId);
    initInfinite(gridSel, catId);
  };
}

/* Лента по-настоящему бесконечная — без кнопки «Показать ещё». По решению
   с созвона 07.09.2026: кнопка создаёт лишний клик, мешает метрике
   показов и может задвоить купон при повторном срабатывании рандомайзера.
   Подгружаем сама по скроллу, пока не кончится FEED_MAX. */
const FEED_MAX = 56;

function initInfinite(gridSel, catId) {
  const loader = qs("#loader");
  const grid = qs(gridSel);
  if (!loader || !grid) return;

  const dots = '<span class="loader__dot"></span><span class="loader__dot"></span>' +
               '<span class="loader__dot"></span><span style="margin-left:6px">подгружаем ещё купоны</span>';

  function paint() {
    if (grid.children.length >= FEED_MAX) {
      loader.innerHTML = '<span class="feed-end">Вы посмотрели все купоны' +
        (state.city ? " в городе " + state.city : "") +
        '. Новые появляются каждый день.</span>';
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
      fillFeed(gridSel, 8, catId);
      feedBusy = false;
      paint();
    }, 320);
  }, { rootMargin: "300px" }).observe(loader);
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
        <span>${c.cat.name}</span><i class="dot"></i>
        <span>${state.city || "город"}</span><i class="dot"></i>
        <span>${ICON.eye} ${c.views}</span><i class="dot"></i>
        <span>${fmtDist(c.dist)} от вас</span>
      </div>
      <h3>${c.title}</h3>

      <div class="company">
        <div class="company__logo">лого</div>
        <div>
          <div class="company__name">${c.company}</div>
          <div class="company__req">ИНН 0000000000 · ${c.address}</div>
        </div>
        <div class="socials">
          <a class="soc" href="#" title="Сайт компании">${ICON.link} Сайт</a>
          <a class="soc" href="#" title="Компания ВКонтакте">${ICON.link} ВКонтакте</a>
          <a class="soc" href="#" title="Компания в Telegram">${ICON.link} Telegram</a>
        </div>
      </div>

      ${left ? "" : revealBlock}

      <div>
        <div class="block-label">Как воспользоваться</div>
        <ul class="terms">
          <li>${c.terms[0]}</li>
          <li>${c.terms[1]}</li>
          <li>${c.terms[2]}</li>
        </ul>
      </div>

      <div>
        <div class="block-label">Где действует</div>
        <div class="map">
          <span class="map__pin">${ICON.pinFill}</span>
          <span style="margin-top:34px">${c.address}</span>
        </div>
      </div>

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

  state.metrics.opened++;
  paintMetrics();

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
    page.href = "coupon.html?cat=" + c.cat.id + (EMBED ? "&embed=1" : "");
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
    state.metrics.revealed++;
    paintMetrics();
  };
}

/* Ссылка на страницу купона — общая для попапа и самой страницы */
function couponPageUrl(c) {
  const base = location.href.replace(/[^/]*$/, "");
  return base + "coupon.html?cat=" + c.cat.id + (EMBED ? "&embed=1" : "");
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
   Блок рекомендаций — смежные категории
   ========================================================================== */
function buildRecommendations(catId) {
  const rail = qs("#rail");
  if (!rail) return;
  const cat = CATEGORIES.find(c => c.id === catId) || CATEGORIES[0];
  const label = qs("#railLabel");
  if (label) {
    label.textContent = cat.adjacent
      .map(id => (CATEGORIES.find(c => c.id === id) || {}).name)
      .filter(Boolean).join(" · ");
  }
  const used = new Set();
  for (let i = 0; i < 9; i++) {
    const id = cat.adjacent[i % cat.adjacent.length];
    let c = makeCoupon(id);
    for (let t = 0; t < 12 && used.has(c.title + c.company); t++) c = makeCoupon(id);
    used.add(c.title + c.company);
    rail.appendChild(makeCard(c, true));
  }
}

/* ==========================================================================
   Страница купона
   ========================================================================== */
function currentCoupon() {
  /* Купон приходит из попапа. Если зашли по прямой ссылке (как придёт
     посетитель из поиска) — собираем купон по категории из адреса. */
  try {
    const raw = sessionStorage.getItem("cp_coupon");
    if (raw) {
      const c = JSON.parse(raw);
      if (!state.cat || c.cat.id === state.cat) return c;
    }
  } catch (e) {}
  return makeCoupon(state.cat || "beauty");
}

function renderCouponPage() {
  const c = currentCoupon();
  state.cat = c.cat.id;

  document.title = c.title + " — " + c.company + ", " + (state.city || "город");
  qs("#crumbCat").textContent = c.cat.name;
  qs("#crumbCat").href = "catalog.html?cat=" + c.cat.id;
  qs("#crumbTitle").textContent = c.title;

  qs("#couponRoot").innerHTML = `
    <div class="coupon__left">
      <div class="coupon__hero">
        <span class="coupon__value">${c.value}</span>
        <span class="erid-stamp">Реклама · erid: ${c.erid}</span>
      </div>
    </div>

    <div class="coupon__right">
      <div class="coupon__meta">
        <a href="catalog.html?cat=${c.cat.id}">${c.cat.name}</a><i class="dot"></i>
        <span>${state.city || "город"}</span><i class="dot"></i>
        <span>${ICON.eye} ${c.views}</span><i class="dot"></i>
        <span>${fmtDist(c.dist)} от вас</span><i class="dot"></i>
        <span>Действует ${c.until}</span>
      </div>

      <h1>${c.title}</h1>

      <div class="company">
        <div class="company__logo">лого</div>
        <div>
          <div class="company__name">${c.company}</div>
          <div class="company__req">ИНН 0000000000 · ${c.address}</div>
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

      <div>
        <div class="block-label">Как воспользоваться</div>
        <ul class="terms">
          <li>${c.terms[0]}</li>
          <li>${c.terms[1]}</li>
          <li>${c.terms[2]}</li>
        </ul>
      </div>

      <div>
        <div class="block-label">Где действует</div>
        <div class="map">
          <span class="map__pin">${ICON.pinFill}</span>
          <span style="margin-top:34px">${c.address}</span>
        </div>
      </div>
    </div>`;

  const rev = qs("[data-reveal]", qs("#couponRoot"));
  qs("[data-reveal-btn]", rev).onclick = () => {
    rev.classList.add("is-open");
    state.metrics.revealed++;
    paintMetrics();
  };

  const share = qs("[data-share]", qs("#couponRoot"));
  if (share) share.onclick = () => shareCoupon(share, c);

  /* О компании */
  qs("#aboutName").textContent = c.company;
  qs("#aboutAddress").textContent = c.address;

  /* Другие купоны той же компании */
  const own = qs("#companyFeed");
  const used = new Set([c.title]);
  for (let i = 0; i < 4; i++) {
    let x = makeCoupon(c.cat.id);
    let tries = 0;
    while (used.has(x.title) && tries < 14) { x = makeCoupon(c.cat.id); tries++; }
    /* Заготовок в категории может быть меньше четырёх — лучше показать
       два разных купона, чем четыре с повторами. */
    if (used.has(x.title)) break;
    used.add(x.title);
    x.company = c.company;
    x.address = c.address;
    own.appendChild(makeCard(x));
  }
  if (!own.children.length) own.closest(".section").remove();
  qs("#companyFeedLabel").textContent = c.company;

  /* SEO-текст: тот самый «просто текст» под каждую связку купон/город */
  qs("#seoTitle").textContent =
    c.cat.name + " в городе " + (state.city || "—") + ": купон «" + c.title + "»";

  buildRecommendations(c.cat.id);
}

function paintMetrics() {
  const m = state.metrics;
  const s = qs("#mShown"), o = qs("#mOpened"), r = qs("#mRevealed");
  if (s) s.textContent = m.shown;
  if (o) o.textContent = m.opened;
  if (r) r.textContent = m.revealed;
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
      location.href = "catalog.html?q=" + q + (EMBED ? "&embed=1" : "");
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
    const mv = qs("#mobileView");
    if (mv && mv.classList.contains("is-on")) {
      mv.classList.remove("is-on");
      qs("iframe", mv).src = "";
      document.body.classList.remove("no-scroll");
    }
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

/* Счётчики у Marketplace/«Для бизнеса» на главной — те же данные,
   что и у обычных категорий, просто вынесены отдельной строкой */
function fillFeaturedCounts() {
  const mp = qs("#mpCount"), biz = qs("#bizCount");
  if (mp) mp.textContent = (CATEGORIES.find(c => c.id === "marketplace") || {}).n || "";
  if (biz) biz.textContent = (CATEGORIES.find(c => c.id === "business") || {}).n || "";
}

function initCommon() {
  initCardStyle();
  initQuickStyle();
  initIcons();
  fillFeaturedCounts();
  buildCityModal();
  initCityGate();
  renderCity();
  initSearch();
  paintMetrics();
  const ov = qs("#overlay");
  if (ov) ov.onclick = closeQuick;
}
