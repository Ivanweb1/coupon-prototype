/* Купоны для макетов. Тексты — из заготовок витрины (assets/data.js),
   поля те же, что у купона в ленте: кабинету при сборке поста нечего
   досочинять. Компании — «Пример»: обложка висит на публичном сообществе,
   выдуманное название читалось бы как настоящий оффер. */
const COUPONS = {
  coffee: {
    photo: "coffee.jpg", value: "5 = 4", cat: "eda", catName: "Кафе и рестораны",
    title: "Каждая пятая чашка кофе в подарок", company: "Кофейня «Пример»",
    address: "ул. Советская, 8", until: "с 1 по 31 октября", erid: "2Vt1NKPQW"
  },
  beauty: {
    photo: "beauty.jpg", value: "−25%", cat: "krasota", catName: "Красота",
    title: "Окрашивание любой сложности", company: "Салон «Пример»",
    address: "пр-т Победы, 45", until: "с 3 по 24 октября", erid: "2Vt1NLTRB"
  },
  fitness: {
    photo: "fitness.jpg", value: "−35%", cat: "sport", catName: "Фитнес и спорт",
    title: "Годовой абонемент в клуб со скидкой", company: "Фитнес-клуб «Пример»",
    address: "ул. Зелёная, 3", until: "с 1 по 14 октября", erid: "2Vt1NMXZC"
  },
  eda: {
    photo: "eda-cool.jpg", value: "349 ₽", cat: "eda", catName: "Кафе и рестораны",
    title: "Комбо-обед по будням до 16:00", company: "Кафе «Пример»",
    address: "пл. Центральная, 1", until: "с 1 по 21 октября", erid: "2Vt1NJILR"
  }
};

/* Значки ниш — пути из строки категорий витрины (CAT_PATH в assets/app.js) */
const PATH = {
  eda: '<path d="M5 9h11v4.5A5.5 5.5 0 0 1 10.5 19h0A5.5 5.5 0 0 1 5 13.5z"/><path d="M16 10.5h1.5a2.5 2.5 0 0 1 0 5H15.6"/><path d="M8.5 3.5v3M12 3.5v3"/>',
  krasota: '<path d="M8.5 21h7v-9h-7z"/><path d="M9.5 12V7.5L14.5 4v8"/>',
  sport: '<path d="M7 7.5v9M4 9.5v5M17 7.5v9M20 9.5v5M7 12h10"/>',
  ticket: '<path d="M3.5 8.5a2 2 0 0 0 2-2h13a2 2 0 0 0 2 2v1.5a2 2 0 0 0 0 4v1.5a2 2 0 0 0-2 2h-13a2 2 0 0 0-2-2V14a2 2 0 0 0 0-4z"/><path d="M14 6.5v11" stroke-dasharray="1.5 2"/>',
  pin: '<path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/>',
  cal: '<rect x="4" y="5.5" width="16" height="14.5" rx="2"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  help: '<circle cx="12" cy="12" r="8.5"/><path d="M9.6 9.6a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2.2-2.4 3.8"/><path d="M12 17.2h.01"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>'
};
const icon = (k, w) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w || 1.8}" stroke-linecap="round" stroke-linejoin="round">${PATH[k]}</svg>`;
const PH = "../assets/coupons/";

/* Город в заголовках: ?city=Ельца (родительный падеж — «Все скидки Ельца») */
const city = new URLSearchParams(location.search).get("city");
if (city) document.querySelectorAll("[data-city]").forEach(el => { el.textContent = city; });
/* Город на аватарах — в именительном: ?town=Елец */
const town = new URLSearchParams(location.search).get("town");
if (town) document.querySelectorAll("[data-town]").forEach(el => { el.textContent = town; });
document.querySelectorAll(".ava__city").forEach(el => { el.classList.toggle("is-long", el.textContent.length > 8); });

/* Карточки на обложках */
document.querySelectorAll("[data-card]").forEach(el => {
  const c = COUPONS[el.dataset.card];
  el.innerHTML = `
    <div class="card__ph" style="background-image:url('${PH + c.photo}')"><span class="tk">${c.value}</span></div>
    <div class="card__t">${c.title}</div>
    <div class="card__c">${c.company}</div>`;
});

/* Обложки ВК и ОК — ещё и без адреса сайта: копия рядом, файл с
   суффиксом -nolink. Основной вариант — с красной полосой (03.10). */
["vk-cover", "ok-cover"].forEach(id => {
  const src = document.getElementById(id);
  const fig = src.closest(".slot");
  const copy = fig.cloneNode(true);
  const art = copy.querySelector(".art");
  art.id = id + "-nolink";
  art.dataset.out = src.dataset.out.replace(/(-\d+x\d+)$/, "-nolink$1");
  art.querySelector(".strip").remove();
  art.classList.remove("has-strip");
  copy.querySelector("figcaption").insertAdjacentHTML("beforeend", " · без адреса сайта");
  fig.after(copy);
});

/* Пост с купоном — один шаблон на оба формата */
document.querySelectorAll("[data-post]").forEach(el => {
  const c = COUPONS[el.dataset.post];
  const long = c.value.length > 5 ? " is-long" : "";
  el.innerHTML = `
    <div class="post__card">
      <div class="post__ph" style="background-image:url('${PH + c.photo}')">
        <div class="post__erid">Реклама · ${c.company} · erid: ${c.erid}</div>
        <span class="tk${long}">${c.value}</span>
      </div>
      <div class="post__body">
        <div class="post__cat"><span>${icon(c.cat)}</span>${c.catName}</div>
        <h2 class="post__t">${c.title}</h2>
        <div class="post__c">${c.company}</div>
        <ul class="post__meta">
          <li>${icon("pin")}${town || "Липецк"}, ${c.address}</li>
          <li>${icon("cal")}${c.until}</li>
        </ul>
        <div class="post__foot"><div class="post__foot-t"><span>Код купона — на сайте</span><b>vsekupony.ru</b></div><img class="logo" src="../assets/brand/logo-red.png" alt=""></div>
      </div>
    </div>
    <div class="perf"><i></i><i></i></div>`;
});

/* Кнопки меню ВК */
const MENU = [
  ["all",     "ticket", "Все купоны<br>города"],
  ["near",    "pin",    "Купоны<br>рядом"],
  ["eda",     "eda",    "Кафе и<br>рестораны"],
  ["krasota", "krasota","Красота"],
  ["how",     "help",   "Как это<br>работает"],
  ["place",   "plus",   "Разместить<br>купон", true]
];
document.getElementById("menu").innerHTML = MENU.map(([id, ic, t, lead]) => `
  <div class="fit"><div class="art menu${lead ? " menu--lead" : ""}" id="menu-${id}" data-out="vk/vk-menu-${id}-376x256">
    <span class="menu__ic">${icon(ic)}</span>
    <span class="menu__go">${icon("arrow", 2.2)}</span>
    <div class="menu__t">${t}</div>
  </div></div>`).join("");

/* Форма билетика — контур с вырезами по бокам. Считается в долях
   высоты: вырез и скругление по 0.2 кегля, а высота плашки ~1.41 кегля,
   то есть 14 % высоты. viewBox повторяет пропорцию плашки, поэтому
   контур не растягивается. */
function ticketPath(w, h) {
  const r = h * .142, n = h * .142, c = h / 2;
  return `M${r},0H${w - r}A${r},${r} 0 0 1 ${w},${r}V${c - n}A${n},${n} 0 0 0 ${w},${c + n}` +
         `V${h - r}A${r},${r} 0 0 1 ${w - r},${h}H${r}A${r},${r} 0 0 1 0,${h - r}` +
         `V${c + n}A${n},${n} 0 0 0 0,${c - n}V${r}A${r},${r} 0 0 1 ${r},0Z`;
}
function shapeTickets() {
  document.querySelectorAll(".tk").forEach(tk => {
    tk.querySelector(".tk__bg")?.remove();
    const b = tk.getBoundingClientRect();
    if (!b.height) return;
    const h = 100, w = Math.round(100 * b.width / b.height * 10) / 10;
    tk.insertAdjacentHTML("afterbegin",
      `<svg class="tk__bg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><path d="${ticketPath(w, h)}"/></svg>`);
  });
}

/* Просмотр: артборды ужимаются под окно. В ?bare=1 — натуральная величина. */
function fit() {
  if (document.documentElement.classList.contains("bare")) return;
  const page = document.querySelector(".page").clientWidth - 80;
  document.querySelectorAll(".art").forEach(a => {
    const w = a.offsetWidth;
    const max = w >= 1900 ? page
      : a.classList.contains("vk-mob") ? 440
      : a.classList.contains("post") ? 560
      : a.classList.contains("ava") ? 260
      : w;
    a.style.zoom = Math.min(1, max / w);
  });
}
fit();
addEventListener("resize", () => { document.querySelectorAll(".art").forEach(a => { a.style.zoom = 1; }); fit(); });

/* Где стоит адрес сайта на обложках — варианты на выбор (?site=a|b|c).
   Без параметра — отдельной строкой под шагами.
   a — в надзаголовке, первым словом;
   b — подписью под карточками купонов;
   c — подписью под логотипом, как фирменный блок «знак + адрес»;
   d — билетиком с вырезами, как выгода на карточке купона;
   e — красной полосой по нижнему краю;
   f — в правом верхнем углу, на линии надзаголовка. */
const siteV = new URLSearchParams(location.search).get("site");
if (siteV) {
  const DOMAIN = '<span class="dom">vsekupony.ru</span>';
  document.querySelectorAll(".vk-cover, .ok-cover").forEach(art => {
    art.querySelector(".site")?.remove();
    if (siteV === "a") {
      const e = art.querySelector(".eyebrow");
      e.innerHTML = DOMAIN + ' · бесплатно, без регистрации';
    } else if (siteV === "b") {
      const cap = document.createElement("div");
      cap.className = "cards-cap";
      cap.innerHTML = 'Все купоны — на ' + DOMAIN;
      if (!art.querySelector(".cards-cap")) (art.querySelector(".art-r") || art).appendChild(cap);
    } else if (siteV === "d") {
      const t = document.createElement("div");
      t.className = "site-tk";
      t.innerHTML = '<span class="tk">vsekupony.ru</span>';
      art.querySelector(".txt").appendChild(t);
    } else if (siteV === "e") {
      const st = document.createElement("div");
      st.className = "strip";
      st.innerHTML = 'Все купоны города — <b>vsekupony.ru</b>';
      art.appendChild(st);
      art.classList.add("has-strip");
    } else if (siteV === "f") {
      const c = document.createElement("div");
      c.className = "corner";
      c.innerHTML = DOMAIN + ' <span class="corner__ar">→</span>';
      art.appendChild(c);
    } else if (siteV === "c") {
      const cap = document.createElement("div");
      cap.className = "logo-cap";
      cap.innerHTML = DOMAIN;
      art.appendChild(cap);
      art.classList.add("has-logo-cap");
    }
  });
}

/* Билетики строятся после шрифтов: от них зависит ширина плашки */
document.fonts.ready.then(shapeTickets);
