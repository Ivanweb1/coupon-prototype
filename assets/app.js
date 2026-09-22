/* ==========================================================================
   Логика прототипа: гео, разделы и ниши, лента, раскрытие купона.
   ========================================================================== */

const qs  = (s, r = document) => r.querySelector(s);
const qsa = (s, r = document) => Array.from(r.querySelectorAll(s));
const params = new URLSearchParams(location.search);

const ICON = {
  /* Соцсети: плашка серая, цвет бренда — при наведении (см. design.css) */
  vk: '<svg class="soc-ic" style="--soc-c:#0077FF" width="18" height="18" viewBox="0 0 32 32" aria-hidden="true"><rect class="soc-ic__bg" width="32" height="32"/><path class="soc-ic__g" d="M16.8 21.615c-6.15 0-9.656-4.208-9.8-11.22h3.093c.099 5.142 2.364 7.318 4.163 7.767v-7.768h2.904v4.433c1.771-.19 3.641-2.212 4.27-4.442h2.896a8.57 8.57 0 0 1-3.938 5.602A8.87 8.87 0 0 1 25 21.615h-3.192c-.683-2.131-2.391-3.785-4.648-4.01v4.01h-.36"/></svg>',
  tg: '<svg class="soc-ic" style="--soc-c:#2AABEE" width="18" height="18" viewBox="0 0 248 248" aria-hidden="true"><rect class="soc-ic__bg" width="248" height="248"/><path class="soc-ic__g" d="M129.362 93.057q-16.659 6.93-66.588 28.682-8.107 3.225-8.494 6.308c-.436 3.475 3.916 4.844 9.842 6.707l.12.038q1.155.361 2.377.756c5.83 1.895 13.672 4.113 17.749 4.201q5.547.12 12.382-4.574 46.65-31.491 48.162-31.833c.711-.162 1.696-.365 2.364.228.668.594.602 1.718.531 2.019-.431 1.838-17.512 17.718-26.351 25.936l-.074.068c-2.717 2.526-4.64 4.315-5.037 4.726-.894.93-1.807 1.81-2.684 2.655-5.415 5.221-9.477 9.136.226 15.53 4.649 3.064 8.373 5.6 12.085 8.128l.031.02c4.064 2.768 8.119 5.53 13.365 8.968 1.336.876 2.613 1.787 3.856 2.673 4.731 3.372 8.981 6.402 14.232 5.919 3.051-.281 6.202-3.149 7.803-11.706 3.782-20.221 11.218-64.035 12.936-82.09.15-1.582-.039-3.606-.191-4.495-.152-.888-.47-2.155-1.625-3.092-1.368-1.11-3.48-1.344-4.424-1.328-4.295.076-10.884 2.367-42.593 15.556"/></svg>',
  /* MAX. Вилл на созвоне 21.09.2026 отдельно просил не забывать его:
     «государство заставляет о нём помнить, и вариантов нет». Цвет —
     фирменный #471AFF, как и у остальных, проступает при наведении. */
  /* Фирменный знак MAX, файлом от Ивана (22.09.2026). Остальные значки
     рисуются одним путём на нашем сером круге, а этот — готовый логотип
     с градиентом, поэтому он подключается картинкой и ведёт себя как
     логотипы маркетплейсов: серый в покое, цветной под курсором. */
  max: '<img class="soc-ic soc-ic--img" src="assets/brand/soc/max.svg" alt="" aria-hidden="true">',
  /* Instagram — из списка Коли для соцсетей компании. На публичке нашего
     сервиса не ставим: здесь он доступен компании как её собственная
     ссылка, и вопрос о размещении решает не дизайн. */
  instagram: '<svg class="soc-ic" style="--soc-c:#E4405F" width="18" height="18" viewBox="0 0 32 32" aria-hidden="true"><rect class="soc-ic__bg" width="32" height="32"/><path class="soc-ic__g" fill-rule="evenodd" d="M10.1 3h11.8A7.1 7.1 0 0 1 29 10.1v11.8a7.1 7.1 0 0 1-7.1 7.1H10.1A7.1 7.1 0 0 1 3 21.9V10.1A7.1 7.1 0 0 1 10.1 3Zm0 2.6a4.5 4.5 0 0 0-4.5 4.5v11.8a4.5 4.5 0 0 0 4.5 4.5h11.8a4.5 4.5 0 0 0 4.5-4.5V10.1a4.5 4.5 0 0 0-4.5-4.5H10.1ZM16 9.3a6.7 6.7 0 1 1 0 13.4 6.7 6.7 0 0 1 0-13.4Zm0 2.6a4.1 4.1 0 1 0 0 8.2 4.1 4.1 0 0 0 0-8.2Zm7-4.2a1.6 1.6 0 1 1 0 3.2 1.6 1.6 0 0 1 0-3.2Z"/></svg>',
  site: '<svg class="soc-ic" style="--soc-c:#DD443C" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><rect class="soc-ic__bg" width="24" height="24"/><g class="soc-ic__s" fill="none" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="12" r="6.6"/><path d="M5.6 12h12.8M12 5.4c1.9 1.9 2.8 4.1 2.8 6.6s-.9 4.7-2.8 6.6c-1.9-1.9-2.8-4.1-2.8-6.6s.9-4.7 2.8-6.6Z"/></g></svg>',
  ok: '<svg class="soc-ic" style="--soc-c:#FF7700" width="18" height="18" viewBox="0 0 44 44" aria-hidden="true"><rect class="soc-ic__bg" width="44" height="44"/><path class="soc-ic__g" d="M26.868 19.87a6.85 6.85 0 0 1-2.229 1.492 6.88 6.88 0 0 1-7.5-1.492 6.87 6.87 0 0 1-1.875-3.51 6.84 6.84 0 0 1 .392-3.955 6.9 6.9 0 0 1 2.527-3.08 6.96 6.96 0 0 1 3.82-1.18 6.96 6.96 0 0 1 3.83 1.177 6.9 6.9 0 0 1 2.532 3.086 6.84 6.84 0 0 1 .389 3.962 6.87 6.87 0 0 1-1.886 3.512zm-4.877-7.978a3.15 3.15 0 0 0-2.21.917 3.105 3.105 0 0 0 0 4.397c.586.584 1.38.914 2.21.918a3.15 3.15 0 0 0 2.21-.918 3.1 3.1 0 0 0 .913-2.198c0-.824-.328-1.615-.914-2.199a3.15 3.15 0 0 0-2.209-.917m7.239 10.017 2.014 2.753a.315.315 0 0 1-.05.434 14.2 14.2 0 0 1-5.725 2.79l3.889 7.495a.316.316 0 0 1-.123.43.3.3 0 0 1-.16.041h-4.17a.32.32 0 0 1-.296-.19l-2.605-6.182-2.618 6.181a.32.32 0 0 1-.295.191H14.92c-.244 0-.386-.255-.283-.471l3.902-7.494c-2.054-.484-4.03-1.402-5.724-2.791a.32.32 0 0 1-.064-.434l2.027-2.74a.334.334 0 0 1 .475-.064 10.5 10.5 0 0 0 6.75 2.677c2.503 0 4.84-1.045 6.752-2.677.128-.127.359-.102.475.051"/></svg>',
  search: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/></svg>',
  mic:    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>',
  pin:    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/></svg>',
  chev:   '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m6 9 6 6 6-6"/></svg>',
  share:  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M12 15V3m0 0L8 7m4-4 4 4"/></svg>',
  close:  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  eye:    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.6"/></svg>',
  /* Метрики карточки — созвон 21.09.2026. Коля: «копировать — два
     смещённых квадратика, всем знакомо; глазок — просмотры; использование
     — галочкой». Значки одной толщины со значками ниш, чтобы столбик не
     выбивался из остального интерфейса. */
  copy:   '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/></svg>',
  used:   '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="m4 12.5 5.2 5.2L20 7"/></svg>',
  pinFill:'<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Zm0-8.4a2.6 2.6 0 1 1 0-5.2 2.6 2.6 0 0 1 0 5.2Z"/></svg>',
  burger: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  user:   '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="8" r="3.6"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/></svg>',
  grid:   '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="3" y="3" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="2"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2"/></svg>',
  plus:   '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  link:   '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M10 14a3.5 3.5 0 0 0 5 0l3-3a3.5 3.5 0 0 0-5-5l-1 1"/><path d="M14 10a3.5 3.5 0 0 0-5 0l-3 3a3.5 3.5 0 0 0 5 5l1-1"/></svg>',
  bag:    '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 8h16l-1.2 11.2a2 2 0 0 1-2 1.8H7.2a2 2 0 0 1-2-1.8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
  case:   '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7"/></svg>',
  phone:  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6.6 10.8a15.7 15.7 0 0 0 6.6 6.6l2.2-2.2a1.5 1.5 0 0 1 1.5-.4c1 .3 2 .5 3.1.5a1.5 1.5 0 0 1 1.5 1.5V20a1.5 1.5 0 0 1-1.5 1.5C10.7 21.5 3 13.8 3 4.5A1.5 1.5 0 0 1 4.5 3h3.1A1.5 1.5 0 0 1 9.1 4.5c0 1.1.2 2.1.5 3.1a1.5 1.5 0 0 1-.4 1.5Z"/></svg>',
  mail:   '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg>'
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
/* Проверка длинного названия города — просьба Димы на созвоне 21.09.2026:
   «возьми самое длинное название, Ростов-на-Дону например, и покажи
   картинкой, как он смотрелся бы». Вилл добавил тот же вопрос про выдачу
   области. В данных прототипа есть только Липецкая область, поэтому
   длинный город подставляется адресом: ?geo=long — город, ?geo=region —
   область. Режим только для показа, в данные ничего не пишет. */
const GEO_DEMO = (location.search.match(/[?&]geo=(long|region)/) || [])[1];
const GEO_LONG = { name: "Ростов-на-Дону", gen: "Ростова-на-Дону", in: "в городе Ростов-на-Дону" };

function geoName() {
  if (GEO_DEMO === "long") return GEO_LONG.name;
  return isRegion() ? "Вся " + REGION.name : state.city.name;
}
function geoShort() {
  if (GEO_DEMO === "long") return GEO_LONG.name;
  return isRegion() ? REGION.name : state.city.name;
}
function geoGen() {
  if (GEO_DEMO === "long") return GEO_LONG.gen;
  if (GEO_DEMO === "region") return REGION.gen;
  return isRegion() ? REGION.gen : state.city.gen;
}
function geoIn() {
  if (GEO_DEMO === "long") return GEO_LONG.in;
  if (GEO_DEMO === "region") return "по всей " + REGION.gen;
  return isRegion() ? "по всей " + REGION.gen : "в городе " + state.city.name;
}

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
/* Значки ниш для вариантов строки категорий (?cats=a|b|c, дизайн-версия).
   Линейные, 24×24, цвет — currentColor. Нет значка — берётся «сетка». */
const CAT_PATH = {
  eda: '<path d="M5 9h11v4.5A5.5 5.5 0 0 1 10.5 19h0A5.5 5.5 0 0 1 5 13.5z"/><path d="M16 10.5h1.5a2.5 2.5 0 0 1 0 5H15.6"/><path d="M8.5 3.5v3M12 3.5v3"/>',
  krasota: '<path d="M8.5 21h7v-9h-7z"/><path d="M9.5 12V7.5L14.5 4v8"/>',
  kosmetologiya: '<path d="M12 3.5l1.7 4.3L18 9.5l-4.3 1.7L12 15.5l-1.7-4.3L6 9.5l4.3-1.7z"/><path d="M18 15l.7 1.8 1.8.7-1.8.7L18 20l-.7-1.8-1.8-.7 1.8-.7z"/>',
  meditsina: '<path d="M9.5 4h5v5.5H20v5h-5.5V20h-5v-5.5H4v-5h5.5z"/>',
  avto: '<path d="M4 16.5v-4.5l2.2-5h11.6l2.2 5v4.5z"/><path d="M5 16.5v2.5h3v-2.5M16 16.5v2.5h3v-2.5"/><path d="M7.5 12.5h.01M16.5 12.5h.01"/>',
  avtomoyki: '<path d="M12 3.5s5.5 6.2 5.5 10.3a5.5 5.5 0 0 1-11 0C6.5 9.7 12 3.5 12 3.5z"/><path d="M9.5 14a2.5 2.5 0 0 0 2.5 2.5"/>',
  avtotovary: '<circle cx="12" cy="12" r="3"/><path d="M12 3.5v2.5M12 18v2.5M3.5 12H6M18 12h2.5M6 6l1.8 1.8M16.2 16.2 18 18M6 18l1.8-1.8M16.2 7.8 18 6"/>',
  sport: '<path d="M7 7.5v9M4 9.5v5M17 7.5v9M20 9.5v5M7 12h10"/>',
  spa: '<path d="M12 20c-4.5 0-7.5-3.5-7.5-8 4 0 7.5 3 7.5 8zm0 0c4.5 0 7.5-3.5 7.5-8-4 0-7.5 3-7.5 8z"/><path d="M12 12c-1.8-1.8-1.8-5.2 0-8 1.8 2.8 1.8 6.2 0 8z"/>',
  razvlecheniya: '<path d="M3.5 8.5a2 2 0 0 0 2-2h13a2 2 0 0 0 2 2v1.5a2 2 0 0 0 0 4v1.5a2 2 0 0 0-2 2h-13a2 2 0 0 0-2-2V14a2 2 0 0 0 0-4z"/><path d="M14 6.5v11" stroke-dasharray="1.5 2"/>',
  detyam: '<circle cx="12" cy="13.5" r="6"/><circle cx="7" cy="7" r="2"/><circle cx="17" cy="7" r="2"/><path d="M10 14.5h.01M14 14.5h.01M10.5 17h3"/>',
  obuchenie: '<path d="M3.5 5.5h7v13h-7zM13.5 5.5h7v13h-7z"/>',
  dom: '<path d="M4 11 12 4l8 7v9H4z"/><path d="M10 20v-5h4v5"/>',
  remont: '<path d="M14 3.5 20.5 10l-3 3L11 6.5z"/><path d="M12.5 8 4 16.5 7.5 20 16 11.5"/>',
  odezhda: '<path d="M8.5 4 12 6l3.5-2 5 4-2.8 3-1.7-1V20h-8v-10l-1.7 1-2.8-3z"/>',
  pitomtsy: '<circle cx="7" cy="10" r="1.8"/><circle cx="10.5" cy="6.5" r="1.8"/><circle cx="14.5" cy="6.5" r="1.8"/><circle cx="18" cy="10" r="1.8"/><path d="M12 12c-3 0-5.5 3-5.5 5.2 0 1.8 1.6 2.3 3 2 1.2-.3 1.8-.7 2.5-.7s1.3.4 2.5.7c1.4.3 3-.2 3-2C17.5 15 15 12 12 12z"/>',
  uslugi: '<circle cx="12" cy="12" r="8.5"/><path d="m8.5 12.3 2.4 2.4 4.8-5"/>',
  puteshestviya: '<path d="M3.5 12.5 20.5 5 15 20.5l-3-5.5z"/><path d="m12 15 3.5-4"/>',
  "18plus": '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>',
  elektronika: '<rect x="7" y="3.5" width="10" height="17" rx="2"/><path d="M11 17.5h2"/>',
  reklama: '<path d="M4 10v4h3l7 4V6l-7 4z"/><path d="M17.5 9.5a3.5 3.5 0 0 1 0 5"/>',
  it: '<rect x="3.5" y="5" width="17" height="11" rx="1.5"/><path d="M8 20h8M12 16v4"/>',
  oborudovanie: '<path d="M4 20V9l5 3V9l5 3V5h6v15z"/>',
  logistika: '<path d="M3.5 7h10v9h-10zM13.5 10h4l3 3v3h-7z"/><circle cx="7" cy="17.5" r="1.6"/><circle cx="17" cy="17.5" r="1.6"/>'
};
CAT_PATH["uslugi-dlya-biznesa"] = CAT_PATH.uslugi;
const CAT_TONES = [
  ["#FDE7E4", "#C8362F"], ["#E8EEF6", "#3B5B86"], ["#E9F2EA", "#3F6B47"], ["#F6EDDD", "#9A6420"],
  ["#EEEAF6", "#5B4A8A"], ["#E3F2F1", "#2F6E69"], ["#F7E6EE", "#9A3D66"]
];
/* Правка созвона 21.09.2026: разноцветные значки ниш создавали «мясо» —
   семь пастельных тонов без общепринятого значения цвета. В dz3 все значки
   одноцветные, красно-белые; отличает нишу сам знак и подпись, а не оттенок. */
const CAT_TONES_MONO = ["#FFFFFF", "#DD443C"];
function catIcon(slug, size) {
  const d = CAT_PATH[slug] || '<rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/>';
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
}

function buildTags(l1) {
  const host = qs("#tags");
  if (!host) return;
  const vertical = findVertical(l1) || VERTICALS[0];
  host.innerHTML = "";

  /* В вариантах ?cats=a|b|c у ниши есть значок на цветном круге; без
     варианта значок скрыт стилями и строка выглядит как раньше */
  catsOf(vertical.slug).sort((a, b) => b.n - a.n).forEach((c, i) => {
    const a = document.createElement("a");
    a.className = "tag tag--niche" + (state.l2 === c.slug && state.l1 === c.l1 ? " is-active" : "");
    a.href = catUrl(c);
    const [bg, fg] = document.body.classList.contains("dz3")
      ? CAT_TONES_MONO
      : CAT_TONES[i % CAT_TONES.length];
    a.style.setProperty("--ct-bg", bg);
    a.style.setProperty("--ct-fg", fg);
    a.innerHTML = '<span class="tag__ic">' + catIcon(c.slug, 20) + '</span>' +
      '<span class="tag__name">' + c.name + '</span> <span class="tag__n">' + c.n + "</span>";
    host.appendChild(a);
  });

  /* Вариант «круги» (?cats=b): подписи под кругами переносятся, и ряд
     выглядит рваным. Поэтому сначала ставим ниши с подписью в одну строку,
     затем в две — внутри каждой группы порядок по числу купонов сохраняется */
  if (document.body.classList.contains("cats-b")) {
    const byCount = Array.from(host.children);
    const lines = el => {
      const name = qs(".tag__name", el);
      return Math.round(name.getBoundingClientRect().height / parseFloat(getComputedStyle(name).lineHeight));
    };
    const sortByLines = () => {
      /* 18+ всегда в конце ряда — как и раньше, не выносим её вперёд */
      const adult = byCount.filter(el => el.href.includes("18plus"));
      const rest = byCount.filter(el => !adult.includes(el));
      const one = rest.filter(el => lines(el) <= 1);
      const many = rest.filter(el => lines(el) > 1);
      [...one, ...many, ...adult].forEach(el => host.appendChild(el));
    };
    sortByLines();
    /* переносы зависят от шрифта — пересортируем, когда он догрузится */
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(sortByLines);
  }

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
/* Площадку показываем её словесным логотипом: он узнаваемее названия
   текстом. Для площадки без файла логотипа остаётся название. */
const MP_MARKS = {
  "Wildberries":   "wildberries-full.svg",
  "Ozon":          "ozon-full.svg",
  "Яндекс Маркет": "yandex-market-full.svg"
  /* У М.Видео словесного логотипа в наборе нет — на страницах, где площадка
     показывается чужим знаком, останется её название текстом. */
};

/* Плашка площадки словом, а не логотипом — решение Ивана 21.09.2026.
   Чужие логотипы на наших карточках — это и разрешения на использование
   знаков, и чужая типографика в нашей сетке: четыре разных начертания в
   одной ленте разваливают её сильнее, чем цветные значки категорий.
   Название набирается нашим шрифтом, цвет берём фирменный у площадки.

   Цвета фирменные, но две площадки пришлось выбирать, а не брать готовый,
   и обе замены стоит подтвердить:

   Wildberries — логотип градиентный, от фиолетового к розовому. Тёмный
   конец #7303FA сливается с фиолетовым Мегамаркета, поэтому взят розовый
   #CB11AB: он отличается от соседа и даёт белому тексту контраст 5:1.
   Яндекс Маркет — основной жёлтый #FFDD00 с белым текстом нечитаем
   вообще, поэтому взят их второй фирменный, оранжево-красный. */
const MP_COLOR = {
  "Wildberries":   "#CB11AB",
  "Ozon":          "#005BFF",
  "Яндекс Маркет": "#FF5226",

  /* М.Видео — фирменный красный площадки. Он почти совпадает с нашим
     #DD443C: на плашке площадка читается как наш собственный акцент.
     Под вопросом, вынести на согласование. */
  "М.Видео":       "#E30613"
};
function mpMark(name) {
  if (document.body.classList.contains("dz3")) {
    const color = MP_COLOR[name] || "#1B1B1B";
    return '<span class="mp-name" style="--mp:' + color + '">' + name + "</span>";
  }
  const file = MP_MARKS[name];
  return file
    ? '<img class="mp-logo" src="assets/brand/mp/' + file + '" alt="' + name + '">'
    : name;
}

function cardHTML(c, compact) {
  /* Два варианта карточки. wb — плотная, как на маркетплейсах: заголовок
     под фото. soft — наша первая версия: заголовок наложен на фото. */
  const wb = document.body.classList.contains("cards-wb");

  /* У купона маркетплейса нет расстояния: он действует в корзине, а не в
     точке на карте. Вместо минут показываем площадку. */
  const corner = c.market
    ? '<span class="card__near card__near--mp">' + mpMark(c.market) + "</span>"
    : '<span class="card__near">' + fmtDist(c.dist) + "</span>";

  /* Город в подписи нужен только в выдаче области: в выдаче города он у
     всех один и превращается в шум. На странице самой ниши по той же
     причине не повторяем её название — оно уже в заголовке страницы. */
  const city = isRegion() && !c.market
    ? '<i class="dot"></i><span>' + c.city.name + "</span>" : "";
  const onOwnPage = state.l1 === c.cat.l1 && state.l2 === c.cat.slug;
  const cat = onOwnPage ? "" : '<i class="dot"></i><span>' + c.cat.name + "</span>";

  /* Столбик метрик справа на картинке — созвон 21.09.2026. Коля предложил
     его по образцу Instagram, Вилл добавил: метрики видны всегда, а не по
     наведению, потому что наведение — уже спровоцированное действие, и
     прятать за ним доказательство живого купона незачем. Просмотры и
     «воспользовались» — числа, копирование и «поделиться» — действия.
     В рекомендациях столбика нет: там карточка — одна кнопка перехода. */
  const stats = dz3() && !compact ? `
      <div class="card__stats">
        <span class="card__stat" title="Просмотров: ${c.views}">${ICON.eye}<b>${fmtNum(c.views)}</b></span>
        <span class="card__stat" title="Воспользовались: ${c.uses}">${ICON.used}<b>${fmtNum(c.uses)}</b></span>
        <button type="button" class="card__stat card__stat--act" data-card-copy title="Скопировать код">${ICON.copy}</button>
        <button type="button" class="card__stat card__stat--act" data-card-share title="Поделиться">${ICON.share}</button>
      </div>` : "";

  /* Код поверх изображения. Вилл: «когда это захотят спиздить — а это
     обязательно спиздят — пусть на белой плашке рядом с кодом стоит наш
     знак, чтобы каждая собака видела, откуда купон». Поэтому по нажатию
     «Забрать купон» код появляется не только на кнопке, но и крупно по
     центру картинки, вместе с логотипом. */
  const codeOverlay = dz3() && !compact ? `
      <div class="card__code" data-card-code hidden aria-hidden="true">
        <span class="card__code-val"></span>
        <span class="card__code-mark"><img src="assets/brand/logo-red.png" alt="">Все купоны</span>
      </div>` : "";

  return `
    <div class="card__media">
      ${corner}
      <span class="card__share" title="Поделиться">${ICON.share}</span>
      <span class="erid-stamp">Реклама · erid: ${c.erid}</span>
      ${stats}
      ${codeOverlay}
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

/* Фото купонов в дизайн-версии (body.dz). Реальных креативов пока нет —
   раздаём четыре картинки случайно, но так, чтобы одинаковые не стояли
   рядом: ни с соседом слева, ни через одну, ни с карточкой над ней в
   сетке. Вызывается после того, как карточка уже вставлена в контейнер. */
/* Правка созвона 21.09.2026. Вилл: все демо-картинки подобраны в
   красно-розовых тонах, поэтому лента и выглядит гармонично — «это
   читерство». Режим ?pics=wild подставляет нарочно неудобные фоны
   (кислотно-зелёный, тёмно-коричневый, синий, маджента, неон, бирюза),
   чтобы проверить, что плашки, выгода и метка erid читаются на любом
   снимке, а не только на тёплом. */
/* Двенадцать вместо четырёх: при четырёх на четыре колонки раскладка без
   повторов упиралась в тупик и лента выглядела зациклённой. Тон у каждой
   свой и подобран нарочно вразнобой — тёплый красноватый кадр ровно один
   из двенадцати, чтобы гармония не держалась на подборе под фирменный
   цвет. Это и был упрёк Вилла на созвоне 21.09.2026. */
const COUPON_PHOTOS_WARM = [
  "eda-cool", "krasota-green", "odezhda-dark", "razvlecheniya-blue",
  "sport-teal", "avto-steel", "meditsina-white", "detyam-yellow",
  "dom-beige", "pitomtsy-brown", "obuchenie-purple", "biz-warm"
].map(n => "assets/coupons/" + n + ".jpg");
const COUPON_PHOTOS_WILD = ["acid", "beer", "cobalt", "magenta", "neon", "teal"]
  .map(n => "assets/coupons/wild/" + n + ".jpg");
/* Форма плашки с выгодой — созвон 21.09.2026. Вилл: «билетик» не выдержит
   текстовый оффер вроде «первый раз бесплатно» и перетягивает внимание с
   кнопок действия; предложил круг. Диме билетик нравится. Решения не
   приняли — Коля попросил 2–3 варианта, поэтому форма переключается
   адресом: ?value=ticket (как было), ?value=round (круг), ?value=plate
   (белая плашка с красными буквами, по умолчанию). */
/* Заголовочный шрифт — решение Ивана 21.09.2026. Unbounded уходит: Вилл
   не смог объяснить, чем он плох, но сформулировал риск — эту гарнитуру
   придётся ретранслировать в посты и наружку, и как она там ляжет, никто
   не знает. Берём то, чем уже набран текст. Онест по умолчанию, Manrope
   вторым кандидатом: ?font=manrope. */
const FONT_MODE = (location.search.match(/[?&]font=(onest|manrope)/) || [, "onest"])[1];
document.documentElement.classList.add("font-" + FONT_MODE);

const VALUE_SHAPE = (location.search.match(/[?&]value=(ticket|round|plate)/) || [, "plate"])[1];
document.documentElement.classList.add("val-" + VALUE_SHAPE);

const PICS_WILD = /[?&]pics=wild/.test(location.search);
const COUPON_PHOTOS = PICS_WILD ? COUPON_PHOTOS_WILD : COUPON_PHOTOS_WARM;
if (PICS_WILD) document.documentElement.classList.add("pics-wild");

function applyPhoto(card) {
  if (!document.body.classList.contains("dz")) return;
  const host = card.parentElement;
  if (!host) return;
  const kids = Array.from(host.children);
  const i = kids.indexOf(card);
  const tpl = getComputedStyle(host).gridTemplateColumns;
  const cols = !tpl || tpl === "none" ? 1 : tpl.split(" ").length;
  const photoAt = j => j >= 0 && kids[j]._coupon ? kids[j]._coupon.photo : null;
  /* Строго: весь ряд без повторов, плюс не как сверху. Если так уже не
     выходит (в ряду 4 карточки, а картинок тоже 4), — хотя бы не как
     слева и сверху. В ленте-рельсе (1 «колонка») — не как две предыдущие. */
  const row = [];
  for (let j = i - (cols > 1 ? i % cols : 2); j < i; j++) row.push(photoAt(j));
  /* Проверка наперёд: после выбора оставшиеся картинки должны без повторов
     расставиться по остатку ряда, не совпадая с картинками над ними —
     иначе последняя карточка ряда упрётся в тупик. */
  const rowEnd = cols > 1 ? i - (i % cols) + cols : i + 1;
  const fits = (left, j) => j >= rowEnd || left.some(p =>
    p !== photoAt(j - cols) && fits(left.filter(q => q !== p), j + 1));
  let pool = COUPON_PHOTOS.filter(p => !row.includes(p) && p !== photoAt(i - cols) &&
    fits(COUPON_PHOTOS.filter(q => q !== p && !row.includes(q)), i + 1));
  if (!pool.length) pool = COUPON_PHOTOS.filter(p => p !== photoAt(i - 1) && p !== photoAt(i - cols));
  const c = card._coupon;
  c.photo = pool[Math.floor(Math.random() * pool.length)];
  const media = qs(".card__media", card);
  media.style.background = 'url("' + c.photo + '") center/cover no-repeat';
  media.classList.add("has-photo");
  host._photoCols = cols;
  photoHosts.add(host);
}

/* Число колонок сетки зависит от ширины окна: соседи, разведённые при
   четырёх колонках, при трёх могут оказаться рядом. Поэтому при смене
   раскладки раздаём картинки заново по порядку. */
const photoHosts = new Set();
window.addEventListener("resize", () => {
  photoHosts.forEach(host => {
    const tpl = getComputedStyle(host).gridTemplateColumns;
    const cols = !tpl || tpl === "none" ? 1 : tpl.split(" ").length;
    if (cols === host._photoCols) return;
    const kids = Array.from(host.children).filter(k => k._coupon);
    kids.forEach(k => { k._coupon.photo = null; });
    kids.forEach(applyPhoto);
  });
});

function dz3() { return document.body.classList.contains("dz3"); }

/* 4 219 вместо 4219: на плашке в 40 пикселей четыре слитные цифры
   читаются как один ком. */
function fmtNum(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " "); }

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

  /* Копирование прямо со столбика метрик: код открывается и копируется
     одним нажатием, карточка при этом не открывается. */
  const copyBtn = qs("[data-card-copy]", el);
  if (copyBtn) copyBtn.onclick = e => {
    e.stopPropagation();
    showCardCode(el, c);
    const back = copyBtn.innerHTML;
    const done = () => {
      copyBtn.classList.add("is-done");
      copyBtn.innerHTML = ICON.used;
      setTimeout(() => { copyBtn.classList.remove("is-done"); copyBtn.innerHTML = back; }, 1600);
    };
    if (navigator.clipboard) navigator.clipboard.writeText(c.code).then(done, done);
    else done();
  };

  /* Делимся только ссылкой на страницу купона — решение созвона
     07.09.2026: значки соцсетей в шаринг не вшиваем. */
  const shareBtn = qs("[data-card-share]", el);
  if (shareBtn) shareBtn.onclick = e => {
    e.stopPropagation();
    const url = location.origin + location.pathname.replace(/[^/]*$/, "coupon.html");
    if (navigator.share) navigator.share({ title: c.title, url: url }).catch(() => {});
    else if (navigator.clipboard) navigator.clipboard.writeText(url).catch(() => {});
  };

  return el;
}

/* Код крупно по центру картинки, рядом — наш знак. Вилл на созвоне
   21.09.2026: купоны будут воровать скриншотами, и пусть воруют, но
   вместе с нашим логотипом. Плашка белая: на чужом снимке любого цвета
   это единственный фон, на котором код точно прочитают. */
function showCardCode(card, c) {
  const box = qs("[data-card-code]", card);
  if (!box) return;
  qs(".card__code-val", box).textContent = c.code;
  box.hidden = false;
  box.removeAttribute("aria-hidden");
}

/* Первое нажатие открывает код, второе — копирует.
   Где код печатается поверх картинки (design-3), кнопка его не дублирует:
   он и так крупно на снимке, а в кнопке лишь отнимал бы место у действия.
   На прежних страницах плашки на картинке нет, поэтому там код по-прежнему
   встаёт в саму кнопку — иначе его негде показать. */
function revealOnCard(btn, c) {
  const card = btn.closest(".card");
  const onPhoto = !!qs("[data-card-code]", card);

  if (!btn.classList.contains("is-open")) {
    btn.classList.add("is-open");
    if (!onPhoto) {
      btn.classList.add("is-code");
      btn.textContent = c.code;
    }
    btn.title = "Нажмите, чтобы скопировать";
    showCardCode(card, c);
    noteInterest(c.cat.id);
    return;
  }
  const back = btn.textContent;
  const done = () => {
    btn.textContent = "Скопировано";
    setTimeout(() => { btn.textContent = back; }, 1600);
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
  const card = makeCard(c);
  grid.appendChild(card);
  applyPhoto(card);
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
    applyPhoto(card);
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
  if (!cat || cat.adult) cat = catsOf(state.l1 || "regional").filter(c => !c.adult).sort((a, b) => b.n - a.n)[0];

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

/* Логотипы площадок для дизайн-версии: файлы assets/brand/mp/<ключ>.svg
   (круглый значок) и <ключ>-full.svg (логотип шрифтом). */
const MARKET_LOGO = { "Wildberries": "wildberries", "Ozon": "ozon", "Яндекс Маркет": "yandex-market", "М.Видео": "mvideo" };

/* Логотип компании для примера: монограмма по первой букве названия в
   кавычках («Бренд» → Б) на спокойном цветном круге. Цвет стабилен для
   компании и не совпадает с красным сервиса. Реальные логотипы придут
   из профиля компании в ЛК. */
const LOGO_TONES = [
  ["#E8EEF6", "#3B5B86"], ["#E9F2EA", "#3F6B47"], ["#F4EDE3", "#8A5A2B"],
  ["#EEEAF6", "#5B4A8A"], ["#E6F2F1", "#2F6E69"], ["#F3EAEA", "#7A3E45"]
];
function companyLogo(c) {
  if (!document.body.classList.contains("dz")) return '<div class="company__logo">лого</div>';
  const name = (c.company.match(/«([^»]+)»/) || [, c.company])[1];
  let h = 0;
  for (const ch of c.company) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const [bg, fg] = LOGO_TONES[h % LOGO_TONES.length];
  return `<div class="company__logo company__logo--mono" style="--lg-bg:${bg};--lg-fg:${fg}" aria-hidden="true">${name.trim()[0].toUpperCase()}</div>`;
}

function quickHTML(c) {
  /* Порядок блоков — сама воронка: промокод забирают раньше, чем
     успевают отвлечься на условия. Условия — позитивная инструкция
     «как воспользоваться», а не список запретов, и не в центре внимания.

     Два варианта компоновки — на созвоне 07.09.2026 выбор не сделали.
     side (по умолчанию) — промокод в правой колонке, как было.
     left — промокод и кнопка уходят под картинку влево: предложение Коли,
     чтобы уравновесить композицию, когда слева появится реальное фото.
     focus — предложение Ивана 17.09.2026: промокод сразу под заголовком
     как единственный акцентный блок, компания без рамки ниже, адрес
     только на карте, минуты — у заголовка «Где действует». */
  const revealBlock = `
      <div class="reveal" data-reveal>
        <div class="block-label" style="margin:0">Промокод</div>
        <!-- Срок действия отдельной строкой. Коля на созвоне 21.09.2026:
             «я тут вижу кнопку „забрать купон“, и только с четвёртого раза
             увидел срок действия» — раньше он был подписью в общей строке
             с заголовком блока и терялся. -->
        <div class="reveal__until">Действует ${c.until}</div>
        <div class="reveal__row">
          <div class="reveal__code">${c.code}</div>
          <div class="reveal__actions">
            <button class="btn btn--solid btn--lg reveal__cta" data-reveal-btn>Забрать купон</button>
            <div class="reveal__done">Код открыт — назовите его на кассе или сделайте скриншот</div>
            <button type="button" class="btn btn--ghost btn--lg" data-share>${ICON.share} Поделиться</button>
          </div>
        </div>
      </div>`;
  const left = document.body.classList.contains("quick-left");
  const focus = document.body.classList.contains("quick-focus");
  /* В дизайн-версии у сайта и соцсетей компании — фирменные значки */
  const dz = document.body.classList.contains("dz");

  /* Купон маркетплейса действует на площадке: вместо адреса и минут —
     площадка и ссылка на карточку товара. */
  const place = c.market
    ? `<span>${c.market}</span>`
    : `<span>${c.city.name}</span><i class="dot"></i><span>${fmtDist(c.dist)} от вас</span>`;

  const whereBlock = c.market
    ? `<div>
        <div class="block-label">Где действует</div>
        ${dz && MARKET_LOGO[c.market]
          /* Площадка — её логотипом, кнопка к товару — справа с круглым
             значком той же площадки */
          /* Площадка названием на фирменном фоне, а не логотипом: та же
             правка, что и на карточке (Иван, 21.09.2026) — чужие знаки с
             наших материалов убираем целиком, а не только из ленты. */
          ? `<div class="market-where market-where--logo">
              <div class="market-where__text">
                ${mpMark(c.market)}
                <span>Код вводится в корзине на площадке</span>
              </div>
              <a class="soc market-where__go" href="#">Открыть карточку товара</a>
            </div>`
          : `<div class="market-where">
          <b>${c.market}</b>
          <span>Код вводится в корзине на площадке</span>
          <a class="soc" href="#">${ICON.link} Открыть карточку товара</a>
        </div>`}
      </div>`
    : `<div>
        <div class="block-label">Где действует${focus
          ? ` <span class="block-label__aside">· ${fmtDist(c.dist)} от вас</span>` : ""}</div>
        ${dz
          /* Живая карта-виджет Яндекса без ключа API. Точка пока одна на
             все купоны — центр Липецка: реальных адресов в прототипе нет */
          ? `<div class="map map--live">
              <iframe src="https://yandex.ru/map-widget/v1/?ll=39.599200%2C52.608800&z=16&pt=39.599200%2C52.608800%2Cpm2rdl&l=map"
                      title="Карта: ${c.city.name}, ${c.address}" loading="lazy" allowfullscreen></iframe>
              <span class="map__addr">${ICON.pinFill} ${c.city.name}, ${c.address}</span>
            </div>`
          : `<div class="map">
          <span class="map__pin">${ICON.pinFill}</span>
          <span style="margin-top:34px">${c.city.name}, ${c.address}</span>
        </div>`}
      </div>`;

  const socials = `
        <div class="socials">
          <a class="soc" href="#" title="Сайт компании">${dz ? ICON.site : ICON.link} Сайт</a>
          <a class="soc" href="#" title="Компания ВКонтакте">${dz ? ICON.vk : ICON.link} ВКонтакте</a>
          <a class="soc" href="#" title="Компания в Telegram">${dz ? ICON.tg : ICON.link} Telegram</a>
        </div>`;
  const termsBlock = `
      <!-- Свёрнуто по умолчанию — решение созвона 21.09.2026. Коля: кнопка
           «Открыть страницу купона» должна быть видна сразу, без прокрутки;
           Вилл: условий «как воспользоваться» может быть много, поэтому
           раскрывающийся список, и скролл появляется только после
           раскрытия, а не встречает пользователя на входе. -->
      <details class="terms-fold">
        <summary class="block-label">Как воспользоваться</summary>
        <ul class="terms">
          <li>Сохраните код или сделайте скриншот — переходить никуда не нужно.</li>
          <li>${c.market
                ? "Введите код в корзине на площадке при оформлении заказа."
                : "Покажите код на кассе или назовите администратору при оплате."}</li>
        </ul>
      </details>`;
  const mediaBlock = `
    <button class="quick__close" data-quick-close>${ICON.close}</button>
    <div class="quick__media">
      <div class="quick__photo${c.photo ? " has-photo" : ""}"${c.photo ? ` style="background:url('${c.photo}') center/cover no-repeat"` : ""}>
        <span class="quick__value">${c.value}</span>
        <span class="erid-stamp">Реклама · erid: ${c.erid}</span>
      </div>
      ${left ? revealBlock : ""}
    </div>`;

  if (focus) return `${mediaBlock}
    <div class="quick__side">
      <div class="quick__eyebrow">
        <span>${c.cat.vertical.name}</span><i class="dot"></i>
        <span>${c.cat.name}</span>
        ${isRegion() && !c.market ? `<i class="dot"></i><span>${c.city.name}</span>` : ""}
      </div>
      <h3>${c.title}</h3>
      ${revealBlock}
      ${termsBlock}
      <div class="company">
        ${companyLogo(c)}
        <div>
          <div class="company__name">${c.company}</div>
          <div class="company__req">ИНН 0000000000</div>
        </div>
        ${socials}
      </div>
      ${whereBlock}
      <div class="quick__foot">
        <a class="quick__more" href="coupon.html" data-open-page>Открыть страницу купона ${ICON.arrow || "→"}</a>
      </div>
    </div>`;

  return `
    <button class="quick__close" data-quick-close>${ICON.close}</button>
    <div class="quick__media">
      <div class="quick__photo${c.photo ? " has-photo" : ""}"${c.photo ? ` style="background:url('${c.photo}') center/cover no-repeat"` : ""}>
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

      ${left ? "" : revealBlock}

      <div class="company">
        ${companyLogo(c)}
        <div>
          <div class="company__name">${c.company}</div>
          <div class="company__req">ИНН 0000000000 · ${c.market ? c.market : c.address}</div>
        </div>
        ${dz
          /* В дизайн-версии (решение Ивана 17.09.2026) — промокод сразу под
             заголовком, а сайт и соцсети компании — значками без подписей
             в одну строку с названием, чтобы блок компании стал на строку ниже */
          /* Шесть ссылок вместо трёх — созвон 21.09.2026. Коля: «сайт, ВК,
             Одноклассники, MAX, Телега, Инста — штук шесть, наверное
             семь», и в ЛК у компании будет галочка, какие из них
             показывать в купоне. Дима просил кружочки не уменьшать —
             мельче они теряются, поэтому размер прежний, а строка
             переносится.
             Сколько показывать по умолчанию — не решено: Коля склонялся
             к тому, чтобы на старте жёстко зашить одну соцсеть и ссылку,
             «иначе мы в этих купонах запутаемся». Здесь показаны все
             шесть, чтобы было видно, как выглядит максимум. */
          ? `<div class="socials socials--icons">
              <a class="soc soc--icon" href="#" title="Сайт компании" aria-label="Сайт компании">${ICON.site}</a>
              <a class="soc soc--icon" href="#" title="Компания ВКонтакте" aria-label="Компания ВКонтакте">${ICON.vk}</a>
              <a class="soc soc--icon" href="#" title="Компания в Telegram" aria-label="Компания в Telegram">${ICON.tg}</a>
              <a class="soc soc--icon" href="#" title="Компания в Одноклассниках" aria-label="Компания в Одноклассниках">${ICON.ok}</a>
              <a class="soc soc--icon" href="#" title="Компания в MAX" aria-label="Компания в MAX">${ICON.max}</a>
              <a class="soc soc--icon" href="#" title="Компания в Instagram" aria-label="Компания в Instagram">${ICON.instagram}</a>
            </div>`
          : `<div class="socials">
          <a class="soc" href="#" title="Сайт компании">${ICON.link} Сайт</a>
          <a class="soc" href="#" title="Компания ВКонтакте">${ICON.link} ВКонтакте</a>
          <a class="soc" href="#" title="Компания в Telegram">${ICON.link} Telegram</a>
        </div>`}
      </div>

      <!-- Единственное место, где сервис быстро объясняет, как этим
           пользоваться. Виль на созвоне 07.09.2026 просил свести условия
           ровно к этому — «сохрани купон, сделай скриншот, воспользуйся» —
           и выкинуть «мишуру про 30 дней, один купон одного человека»:
           такие оговорки становились центром внимания и противоречили
           самой концепции. Развёрнутые правила живут на странице купона. -->
      <!-- Свёрнуто по умолчанию — решение созвона 21.09.2026. Коля: кнопка
           «Открыть страницу купона» должна быть видна сразу, без прокрутки;
           Вилл: условий «как воспользоваться» может быть много, поэтому
           раскрывающийся список, и скролл появляется только после
           раскрытия, а не встречает пользователя на входе. -->
      <details class="terms-fold">
        <summary class="block-label">Как воспользоваться</summary>
        <ul class="terms">
          <li>Сохраните код или сделайте скриншот — переходить никуда не нужно.</li>
          <li>${c.market
                ? "Введите код в корзине на площадке при оформлении заказа."
                : "Покажите код на кассе или назовите администратору при оплате."}</li>
        </ul>
      </details>

      ${whereBlock}

      <div class="quick__foot">
        <a class="btn btn--ghost" href="coupon.html" data-open-page>Открыть страницу купона${dz ? ' <span class="quick__foot-arrow">→</span>' : ""}</a>
      </div>
    </div>`;
}

/* Картинка в поп-апе — во всю высоту правой колонки, но строго 4:5.
   Одним CSS это не решается: высота окна задаётся текстом, а ширина
   левой колонки — высотой картинки. Если просто растягивать колонку
   внутри окна фиксированной ширины, получается замкнутый круг (картинка
   шире → текст уже → окно выше → картинка ещё шире). Поэтому ширину
   текста фиксируем (CSS), меряем его высоту и под неё добавляем окну
   колонку с картинкой. Не влезает по ширине экрана — картинка меньше
   и центрируется в колонке. */
function fitQuickMedia() {
  const quick = qs("#quick");
  if (!quick || !document.body.classList.contains("dz") ||
      document.body.classList.contains("quick-left")) return;
  const media = qs(".quick__media", quick);
  const side = qs(".quick__side", quick);
  const photo = qs(".quick__photo", quick);
  if (!media || !side || !photo) return;
  quick.style.width = media.style.flexBasis = photo.style.height = photo.style.width = "";
  if (getComputedStyle(quick).flexDirection === "column") return;

  const pad = parseFloat(getComputedStyle(media).paddingTop) * 2;
  const maxH = parseFloat(getComputedStyle(quick).maxHeight) || window.innerHeight * .88;
  const sideW = side.offsetWidth;
  const h = Math.min(side.scrollHeight, maxH);
  const ideal = (h - pad) * .8 + pad;
  const w = Math.max(200, Math.min(ideal, window.innerWidth - 40 - sideW));
  media.style.flexBasis = w + "px";
  quick.style.width = Math.min(w + sideW, window.innerWidth - 40) + "px";
  if (w < ideal) {
    photo.style.width = (w - pad) + "px";
    photo.style.height = (w - pad) / .8 + "px";
  }
}
window.addEventListener("resize", () => {
  const quick = qs("#quick");
  if (quick && quick.classList.contains("is-on")) fitQuickMedia();
});

function openQuick(c, cardEl) {
  const quick = qs("#quick");
  const overlay = qs("#overlay");
  quick.innerHTML = quickHTML(c);
  fitQuickMedia();

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
    qs("[data-reveal-btn]", rev).disabled = true;
    fitQuickMedia();
  };
}

/* Адрес страницы купона — один на купон и без гео: по ТЗ §3.2.11 у карточки
   единственный URL /coupon/{id}/, две копии под разными путями запрещены. */
function couponPageUrl(c) {
  const base = location.href.replace(/[^/]*$/, "");
  const page = document.body.classList.contains("dz") ? "coupon-design.html" : "coupon.html";
  return base + page + "?id=" + c.id + "&cat=" + c.cat.id;
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
  /* У 18+ смежных ниш нет — блок рекомендаций целиком скрываем */
  const sec = rail.closest(".section");
  if (sec) sec.hidden = !!(cat && cat.adult);
  if (!cat || cat.adult) return;

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
    const card = makeCard(c, true);
    rail.appendChild(card);
    applyPhoto(card);
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
  const home = document.body.classList.contains("dz") ? "index-design-2.html" : "index.html";
  const parts = [`<a href="${home}">Главная</a>`];
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
  buildRecommendations(cat || catsOf(state.l1 || "regional").filter(c => !c.adult).sort((a, b) => b.n - a.n)[0]);
  if (cat && cat.adult) adultGate();
}

/* ==========================================================================
   Категория 18+ (созвон 14.09)
   ==========================================================================
   Как на Ozon: купоны заблюрены, пока посетитель не подтвердит возраст.
   «Да» снимает блюр до конца сессии, «Нет» уводит из категории. */
function adultGate() {
  let ok = false;
  try { ok = sessionStorage.getItem("cp_adult") === "1"; } catch (e) {}
  if (ok) return;
  document.body.classList.add("is-adult-lock");
  let el = qs("#adultGate");
  if (!el) {
    el = document.createElement("div");
    el.id = "adultGate";
    el.className = "modal is-on";
    el.innerHTML = `<div class="modal__box adult">
      <div class="adult__mark">18+</div>
      <h3>Раздел для взрослых</h3>
      <p>Здесь купоны на товары и услуги, которые можно показывать только
      совершеннолетним. Вам уже исполнилось 18 лет?</p>
      <div class="adult__act">
        <button class="btn btn--ghost btn--lg" data-adult-no>Нет</button>
        <button class="btn btn--solid btn--lg" data-adult-yes>Да, мне есть 18</button>
      </div>
    </div>`;
    document.body.appendChild(el);
  }
  qs("[data-adult-yes]", el).onclick = () => {
    try { sessionStorage.setItem("cp_adult", "1"); } catch (e) {}
    document.body.classList.remove("is-adult-lock");
    el.remove();
  };
  qs("[data-adult-no]", el).onclick = () => { location.href = catalogUrl("regional"); };
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
  const dz = document.body.classList.contains("dz");
  state.l1 = c.cat.l1;
  state.l2 = c.cat.slug;
  if (c.cat.adult) adultGate();

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
          <a class="soc" href="#" title="Сайт компании">${dz ? ICON.site : ICON.link} Сайт</a>
          <a class="soc" href="#" title="Компания ВКонтакте">${dz ? ICON.vk : ICON.link} ВКонтакте</a>
          <a class="soc" href="#" title="Компания в Telegram">${dz ? ICON.tg : ICON.link} Telegram</a>
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
   Страница купона — дизайн-версия (coupon-design.html)
   ==========================================================================
   Структура и тексты — из прототипа (renderCouponPage), вид — из главной и
   поп-апа: фото 4:5 слева, промокод сразу под заголовком как единственный
   акцентный блок, компания строкой со значками, серая карта. Страница даёт
   больше поп-апа: развёрнутые шаги и правила, «О компании» с контактами,
   другие купоны компании и подборку смежных ниш. */
function renderCouponDesign() {
  const c = currentCoupon();
  if (!c.photo) c.photo = COUPON_PHOTOS[Math.floor(Math.random() * COUPON_PHOTOS.length)];
  state.l1 = c.cat.l1;
  state.l2 = c.cat.slug;
  if (c.cat.adult) adultGate();

  document.title = c.title + " — " + c.company + ", " + c.city.name;
  renderCrumbs("#crumbs", c.title);

  const mp = c.market && MARKET_LOGO[c.market];
  const whereBlock = c.market
    ? `<div class="cpd__where">
        <div class="block-label">Где действует</div>
        ${mp
          ? `<div class="market-where market-where--logo">
              <div class="market-where__text">
                <img class="market-where__logo" src="assets/brand/mp/${mp}-full.svg" alt="${c.market}">
                <span>Код вводится в корзине на площадке</span>
              </div>
              <a class="soc market-where__go" href="#">
                <img class="mp-ic" src="assets/brand/mp/${mp}.svg" alt=""> Открыть карточку товара
              </a>
            </div>`
          : `<div class="market-where">
              <b>${c.market}</b>
              <span>Код вводится в корзине на площадке при оформлении заказа</span>
              <a class="soc" href="#">${ICON.link} Открыть карточку товара</a>
            </div>`}
      </div>`
    : `<div class="cpd__where">
        <div class="block-label">Где действует <span class="block-label__aside">· ${fmtDist(c.dist)} от вас</span></div>
        <div class="map map--live">
          <iframe src="https://yandex.ru/map-widget/v1/?ll=39.599200%2C52.608800&z=16&pt=39.599200%2C52.608800%2Cpm2rdl&l=map"
                  title="Карта: ${c.city.name}, ${c.address}" loading="lazy" allowfullscreen></iframe>
          <span class="map__addr">${ICON.pinFill} ${c.city.name}, ${c.address}</span>
        </div>
      </div>`;

  qs("#couponRoot").innerHTML = `
    <div class="cpd__media">
      <div class="cpd__photo has-photo" style="background:url('${c.photo}') center/cover no-repeat">
        <span class="cpd__value">${c.value}</span>
        <span class="erid-stamp">Реклама · erid: ${c.erid}</span>
      </div>
    </div>

    <div class="cpd__info">
      <div class="quick__eyebrow cpd__eyebrow">
        <a href="${catalogUrl(c.cat.l1)}">${c.cat.vertical.name}</a><i class="dot"></i>
        <a href="${catUrl(c.cat)}">${c.cat.name}</a><i class="dot"></i>
        <span>${c.market ? c.market : c.city.name}</span><i class="dot"></i>
        <span>${ICON.eye} ${c.views}</span>
      </div>

      <h1 class="cpd__h1">${c.title}</h1>

      <div class="reveal reveal--big" data-reveal>
        <div class="block-label" style="margin:0">Промокод · действует ${c.until}</div>
        <div class="reveal__row">
          <div class="reveal__code">${c.code}</div>
          <div class="reveal__actions">
            <button class="btn btn--solid btn--lg reveal__cta" data-reveal-btn>Забрать купон</button>
            <button type="button" class="btn btn--ghost btn--lg" data-share>${ICON.share} Поделиться</button>
          </div>
        </div>
      </div>

      <div class="company">
        ${companyLogo(c)}
        <div>
          <div class="company__name">${c.company}</div>
          <div class="company__req">ИНН 0000000000 · ${c.market ? c.market : c.address}</div>
        </div>
        <div class="socials socials--icons">
          <a class="soc soc--icon" href="#" title="Сайт компании" aria-label="Сайт компании">${ICON.site}</a>
          <a class="soc soc--icon" href="#" title="Компания ВКонтакте" aria-label="Компания ВКонтакте">${ICON.vk}</a>
          <a class="soc soc--icon" href="#" title="Компания в Telegram" aria-label="Компания в Telegram">${ICON.tg}</a>
        </div>
      </div>

      ${whereBlock}
    </div>`;

  const root = qs("#couponRoot");
  const rev = qs("[data-reveal]", root);
  qs("[data-reveal-btn]", rev).onclick = e => {
    rev.classList.add("is-open");
    e.currentTarget.disabled = true;
    noteInterest(c.cat.id);
  };
  const share = qs("[data-share]", root);
  share.onclick = () => shareCoupon(share, c);

  /* Как работает: шаги на одной «ленте» с пунктиром между номерами —
     как линия отрыва купона; правила — белой карточкой с галочками */
  const CHECK = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>';
  const r = RULES[c.cat.l1] || RULES.regional;
  qs("#rules").innerHTML = `
    <div class="cpd-how">
      <ol class="cpd-steps">
        ${r.steps.map((st, i) => `<li><b>${i + 1}</b><h3>${st[0]}</h3><p>${st[1]}</p></li>`).join("")}
      </ol>
      <div class="cpd-terms">
        <div class="cpd-terms__head">
          <h3>Как пользоваться правильно</h3>
          <p>Коротко о частых вопросах — без мелкого шрифта</p>
        </div>
        <ul class="cpd-terms__list">${r.terms.map(t => `<li><i>${CHECK}</i><span>${t}</span></li>`).join("")}</ul>
      </div>
    </div>`;

  /* О компании. Выводим ровно то, что компания заполняет в ЛК
     («Профиль компании»): название, краткое описание, ИНН, телефон, сайт,
     ВКонтакте, Telegram и точки продаж с адресом и режимом работы.
     Точек может быть несколько — показываем все, ближайшую первой. */
  const CLOCK = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>';
  const points = c.market ? [] : [
    { addr: c.address, hours: "ежедневно 10:00–21:00", dist: c.dist },
    { addr: c.address === "пр-т Победы, 45" ? "ул. Первомайская, 12" : "пр-т Победы, 45",
      hours: "ежедневно 09:00–22:00", dist: c.dist + 1400 }
  ];
  const contacts = [
    { ic: ICON.site, k: "Сайт", v: "example.ru", href: "#" },
    { ic: ICON.vk, k: "ВКонтакте", v: "vk.com/example", href: "#" },
    { ic: ICON.tg, k: "Telegram", v: "@example", href: "#" },
    { ic: `<span class="cpd-ic">${ICON.phone}</span>`, k: "Телефон", v: "+7 (000) 000-00-00", href: "tel:+70000000000" }
  ];

  qs("#about").innerHTML = `
    <div class="cpd-about__main">
      <div class="cpd-about__head">
        ${companyLogo(c)}
        <div>
          <div class="cpd-about__name">${c.company}</div>
          <div class="company__req">ИНН 0000000000</div>
        </div>
      </div>
      <p class="cpd-about__lead">${c.company} ${c.market
        ? "продаёт на " + c.market + " с 2021 года. Отгрузка со склада площадки, возврат по правилам маркетплейса."
        : "работает в городе с 2014 года. Своя команда, собственное оборудование, запись день в день."}</p>

      <div class="block-label">${c.market ? "Где продаёт" : "Точки продаж · " + points.length}</div>
      ${c.market
        ? `<div class="cpd-points"><div class="cpd-point">
            ${MARKET_LOGO[c.market]
              ? `<img class="cpd-point__mp" src="assets/brand/mp/${MARKET_LOGO[c.market]}.svg" alt="">`
              : `<span class="cpd-point__pin">${ICON.bag}</span>`}
            <div><b>${c.market}</b><span>Промокод вводится в корзине при оформлении заказа</span></div>
          </div></div>`
        : `<div class="cpd-points">${points.map((pt, i) => `
            <div class="cpd-point">
              <span class="cpd-point__pin">${ICON.pinFill}</span>
              <div>
                <b>${c.city.name}, ${pt.addr}</b>
                <span>${CLOCK} ${pt.hours}</span>
              </div>
              <em${i === 0 ? ' class="is-near"' : ""}>${fmtDist(pt.dist)}</em>
            </div>`).join("")}</div>`}
    </div>

    <div class="cpd-about__links">
      <div class="block-label">Компания в сети</div>
      <div class="cpd-contacts">
        ${contacts.map(x => `
          <a class="soc cpd-contact" href="${x.href}" title="${x.k}">
            ${x.ic}
            <span><small>${x.k}</small>${x.v}</span>
          </a>`).join("")}
      </div>
    </div>`;

  /* Другие купоны той же компании */
  const own = qs("#companyFeed");
  const used = new Set([c.title]);
  for (let i = 0; i < 4; i++) {
    let x = makeCoupon(c.cat.id, c.city);
    let tries = 0;
    while (used.has(x.title) && tries < 14) { x = makeCoupon(c.cat.id, c.city); tries++; }
    if (used.has(x.title)) break;
    used.add(x.title);
    x.company = c.company;
    x.address = c.address;
    x.market = c.market;
    const card = makeCard(x);
    own.appendChild(card);
    applyPhoto(card);
  }
  if (!own.children.length) own.closest(".section").remove();
  qs("#companyFeedLabel").textContent = c.company;

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

/* Компоновка попапа купона: ?quick=side (промокод справа, по умолчанию),
   ?quick=left (промокод под картинкой слева — вариант Коли) или
   ?quick=focus (промокод первым, компания без рамки — вариант Ивана). Выбор
   на созвоне не сделали, поэтому оба смотрятся переключением адреса. */
function initQuickStyle() {
  let style = params.get("quick");
  /* В дизайн-версии основной выбран 17.09.2026 — side. Без параметра в
     адресе всегда он, запомненный вариант не подхватываем; остальные
     варианты открываются только явно через ?quick=. */
  const dz = document.body.classList.contains("dz");
  if (style !== "left" && style !== "side" && style !== "focus") {
    style = dz ? "side" : (localStorage.getItem("cp_quick") || "side");
  }
  if (!dz) localStorage.setItem("cp_quick", style);
  document.body.classList.add("quick-" + style);
}

/* Варианты оформления строки категорий на дизайн-главной (17.09.2026):
   ?cats=a — значки у ниш, ?cats=b — круги как сторис, ?cats=c — разделы
   карточками. Без параметра — текущая строка. Не запоминаем: это
   сравнение вариантов, а не настройка. */
function initCatsStyle() {
  if (!document.body.classList.contains("dz")) return;
  /* Основным выбран вариант A (17.09.2026) — он и идёт без параметра.
     ?cats=b и ?cats=c открывают другие варианты, ?cats=off — строку
     прототипа без значков. */
  const v = params.get("cats") || "a";
  if (v === "a" || v === "b" || v === "c") document.body.classList.add("cats-" + v);
}

/* Шапка дизайн-версии отделяется от страницы: тонкая линия всегда,
   а после начала прокрутки — мягкая тень, чтобы шапка «парила» над лентой */
function initHeaderShadow() {
  const h = qs(".dz-header");
  if (!h) return;
  const sync = () => h.classList.toggle("is-scrolled", window.scrollY > 4);
  window.addEventListener("scroll", sync, { passive: true });
  sync();

  /* Компактный поиск в шапке показываем, когда большой поиск первого
     экрана ушёл под шапку. Если на странице своего поиска нет (страница
     купона) — поиск в шапке виден всегда. */
  const big = qs(".dz-hero .search");
  if (!big) { h.classList.add("has-search"); return; }
  const syncSearch = () => {
    const r = big.getBoundingClientRect();
    h.classList.toggle("has-search", r.bottom < h.getBoundingClientRect().bottom);
  };
  window.addEventListener("scroll", syncSearch, { passive: true });
  window.addEventListener("resize", syncSearch);
  syncSearch();
}

function initCommon() {
  initCardStyle();
  initQuickStyle();
  initCatsStyle();
  initHeaderShadow();
  const top = qs("[data-to-top]");
  if (top) top.onclick = () => window.scrollTo({ top: 0, behavior: "smooth" });
  initIcons();
  buildCityModal();
  initCityGate();
  renderGeo();
  initSearch();
  const ov = qs("#overlay");
  if (ov) ov.onclick = closeQuick;
}
