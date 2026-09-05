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
  burger: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>'
};

/* ---------- Состояние ---------- */
const state = {
  city: localStorage.getItem("cp_city") || null,
  cat: params.get("cat") || null,
  metrics: { shown: 0, opened: 0, revealed: 0 },
  seen: new Set()
};

/* ==========================================================================
   Город
   ========================================================================== */
function renderCity() {
  qsa("[data-city-name]").forEach(el => el.textContent = state.city || "Выберите город");
  qsa("[data-city-social]").forEach(el => {
    const net = el.dataset.citySocial;
    el.textContent = net + " · " + (state.city || "город");
  });
}

function setCity(name) {
  state.city = name;
  localStorage.setItem("cp_city", name);
  renderCity();
  qs("#cityModal").classList.remove("is-on");
  document.body.classList.remove("no-scroll");
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
  if (!state.city) {
    modal.classList.add("is-on");
  }
}

/* ==========================================================================
   Категории
   ========================================================================== */
function buildTags() {
  const host = qs("#tags");
  if (!host) return;
  const top = CATEGORIES.slice().sort((a, b) => b.n - a.n).slice(0, 8);
  top.forEach(c => {
    const a = document.createElement("a");
    a.className = "tag" + (state.cat === c.id ? " is-active" : "");
    a.href = "catalog.html?cat=" + c.id + (EMBED ? "&embed=1" : "");
    a.innerHTML = c.name + ' <span class="tag__n">' + c.n + "</span>";
    host.appendChild(a);
  });
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
  return `
    <div class="card__media">
      ${compact ? "" : '<span class="card__ratio">4:5</span>'}
      <span class="card__share" title="Поделиться">${ICON.share}</span>
      <span class="card__value">${c.value}</span>
      <div class="card__cap"><h3 class="card__title">${c.title}</h3></div>
    </div>
    <div class="card__body">
      <div class="card__meta">
        <b>${c.company}</b><i class="dot"></i><span>${c.cat.name}</span>
      </div>
      <div class="code">
        <span class="code__val">${c.code}</span>
        <span class="code__hint">код скрыт</span>
      </div>
      <div class="card__actions">
        <span class="btn btn--ghost btn--wide">Подробнее</span>
        <span class="btn btn--solid">Показать купон</span>
      </div>
    </div>`;
}

function makeCard(c, compact) {
  const el = document.createElement("button");
  el.className = "card card-in";
  el.type = "button";
  el.dataset.id = c.id;
  el.setAttribute("aria-label", c.title + " — " + c.company + ", " + c.value);
  el.innerHTML = cardHTML(c, compact);
  el.addEventListener("click", () => openQuick(c, el));
  el._coupon = c;
  impressions.observe(el);
  return el;
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
let feedBusy = false;
function fillFeed(gridSel, n, catId) {
  const grid = qs(gridSel);
  if (!grid) return;
  makeBatch(n, catId).forEach((c, i) => {
    const card = makeCard(c);
    card.style.animationDelay = (i % 8) * 40 + "ms";
    grid.appendChild(card);
  });
}

function initInfinite(gridSel, catId) {
  const loader = qs("#loader");
  if (!loader) return;
  new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting || feedBusy) return;
    feedBusy = true;
    setTimeout(() => {
      fillFeed(gridSel, 8, catId);
      feedBusy = false;
    }, 320);
  }, { rootMargin: "300px" }).observe(loader);
}

/* ==========================================================================
   Раскрытие купона поверх ленты (без перехода на новую страницу)
   ========================================================================== */
let originCard = null;
let fromTransform = "";

function quickHTML(c) {
  return `
    <button class="quick__close" data-quick-close>${ICON.close}</button>
    <div class="quick__media">
      <div class="quick__gallery">
        <div class="quick__thumb">фото 1</div>
        <div class="quick__thumb">фото 2</div>
        <div class="quick__thumb">фото 3</div>
      </div>
      <div class="quick__value">${c.value}</div>
    </div>
    <div class="quick__side">
      <div class="quick__eyebrow">
        <span>${c.cat.name}</span><i class="dot"></i>
        <span>${state.city || "город"}</span><i class="dot"></i>
        <span>${ICON.eye} ${c.views}</span>
      </div>
      <h3>${c.title}</h3>

      <div class="company">
        <div class="company__logo">лого</div>
        <div>
          <div class="company__name">${c.company}</div>
          <div class="company__req">ИНН 0000000000 · ${c.address}</div>
        </div>
        <div class="socials">
          <a class="soc" href="#" title="Сайт">сайт</a>
          <a class="soc" href="#" title="ВК">вк</a>
          <a class="soc" href="#" title="Telegram">tg</a>
        </div>
      </div>

      <div>
        <div class="block-label">Условия</div>
        <ul class="terms">
          <li>${c.terms[0]}</li>
          <li>${c.terms[1]}</li>
          <li>${c.terms[2]}</li>
        </ul>
      </div>

      <div class="reveal" data-reveal>
        <div class="block-label" style="margin:0">Промокод · ${c.until}</div>
        <div class="reveal__row">
          <div class="reveal__code">${c.code}</div>
          <button class="btn btn--solid btn--lg reveal__cta" data-reveal-btn>Показать купон</button>
          <div class="reveal__done">Код открыт — назовите его на кассе или сделайте скриншот</div>
        </div>
      </div>

      <div>
        <div class="block-label">Где действует</div>
        <div class="map">
          <span class="map__pin">${ICON.pinFill}</span>
          <span style="margin-top:34px">${c.address}</span>
        </div>
      </div>

      <div class="quick__foot">
        <a class="btn btn--ghost" href="#">Поделиться</a>
        <a class="btn btn--ghost" href="coupon.html" data-open-page>Открыть страницу купона</a>
        <span class="mute">осталось ${c.left} шт.</span>
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

  const rev = qs("[data-reveal]", quick);
  qs("[data-reveal-btn]", quick).onclick = () => {
    rev.classList.add("is-open");
    state.metrics.revealed++;
    paintMetrics();
  };
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
        <span class="card__ratio">4:5 — то же изображение, что уходит в соцсети</span>
        <span class="coupon__value">${c.value}</span>
      </div>
      <div class="coupon__thumbs">
        <div class="coupon__thumb">фото 1</div>
        <div class="coupon__thumb">фото 2</div>
        <div class="coupon__thumb">фото 3</div>
        <div class="coupon__thumb">фото 4</div>
      </div>
    </div>

    <div class="coupon__right">
      <div class="coupon__meta">
        <a href="catalog.html?cat=${c.cat.id}">${c.cat.name}</a><i class="dot"></i>
        <span>${state.city || "город"}</span><i class="dot"></i>
        <span>${ICON.eye} ${c.views}</span><i class="dot"></i>
        <span>осталось ${c.left} шт.</span><i class="dot"></i>
        <span>${c.until}</span>
      </div>

      <h1>${c.title}</h1>

      <div class="company">
        <div class="company__logo">лого</div>
        <div>
          <div class="company__name">${c.company}</div>
          <div class="company__req">ИНН 0000000000 · ${c.address}</div>
        </div>
        <div class="socials">
          <a class="soc" href="#" title="Сайт">сайт</a>
          <a class="soc" href="#" title="ВК">вк</a>
          <a class="soc" href="#" title="Telegram">tg</a>
        </div>
      </div>

      <div class="reveal reveal--big" data-reveal>
        <div class="block-label" style="margin:0">Промокод · ${c.until}</div>
        <div class="reveal__row">
          <div class="reveal__code">${c.code}</div>
          <button class="btn btn--solid btn--lg reveal__cta" data-reveal-btn>Показать купон</button>
          <div class="reveal__done">Код открыт — назовите его на кассе или сделайте скриншот</div>
        </div>
      </div>

      <div class="coupon__actions">
        <button class="btn btn--ghost btn--lg">Поделиться</button>
        <button class="btn btn--ghost btn--lg">Сохранить скриншотом</button>
      </div>

      <div>
        <div class="block-label">Условия</div>
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

  /* О компании */
  qs("#aboutName").textContent = c.company;
  qs("#aboutAddress").textContent = c.address;

  /* Другие купоны той же компании */
  const own = qs("#companyFeed");
  const used = new Set([c.title]);
  for (let i = 0; i < 4; i++) {
    let x = makeCoupon(c.cat.id);
    for (let t = 0; t < 12 && used.has(x.title); t++) x = makeCoupon(c.cat.id);
    used.add(x.title);
    x.company = c.company;
    x.address = c.address;
    own.appendChild(makeCard(x));
  }
  qs("#companyFeedLabel").textContent = c.company;

  /* SEO-текст: тот самый «просто текст» под каждую связку купон/город */
  qs("#seoTitle").textContent =
    c.cat.name + " в городе " + (state.city || "—") + ": купон «" + c.title + "»";

  buildRecommendations(c.cat.id);
}

/* ==========================================================================
   Панель прототипа
   ========================================================================== */
function paintMetrics() {
  const m = state.metrics;
  const s = qs("#mShown"), o = qs("#mOpened"), r = qs("#mRevealed");
  if (s) s.textContent = m.shown;
  if (o) o.textContent = m.opened;
  if (r) r.textContent = m.revealed;
}

function initProto() {
  const proto = qs("#proto");
  if (!proto) return;
  if (EMBED) { proto.remove(); return; }

  const label = qs("[data-proto-label]", proto);
  qs("[data-proto-toggle]", proto).onclick = () => {
    proto.classList.toggle("is-min");
    if (label) label.textContent = proto.classList.contains("is-min") ? "развернуть" : "свернуть";
  };

  const mv = qs("#mobileView");
  qs("[data-mobile]", proto).onclick = () => {
    const src = location.pathname.split("/").pop() +
      "?embed=1" + (state.cat ? "&cat=" + state.cat : "");
    qs("iframe", mv).src = src;
    mv.classList.add("is-on");
    document.body.classList.add("no-scroll");
  };
  qs("[data-mobile-close]", mv).onclick = () => {
    mv.classList.remove("is-on");
    qs("iframe", mv).src = "";
    document.body.classList.remove("no-scroll");
  };

  const bannerBtn = qs("[data-banner]", proto);
  if (bannerBtn) {
    bannerBtn.onclick = () => {
      const slot = qs("#bannerSlot");
      if (slot) slot.classList.toggle("hide");
    };
  }
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

function initBurger() {
  const b = qs("[data-burger]");
  const m = qs("#mobileMenu");
  if (!b || !m) return;
  b.onclick = () => m.classList.toggle("is-on");
}

function initCommon() {
  initIcons();
  initBurger();
  buildCityModal();
  renderCity();
  initSearch();
  initProto();
  paintMetrics();
  const ov = qs("#overlay");
  if (ov) ov.onclick = closeQuick;
}
