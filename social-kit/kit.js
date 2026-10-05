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

/* Аватары — варианты (05.10). Один аватар на все сети; рядом с каждым —
   он же в размерах, в которых его видят. Город — только у 4 и 5, и для
   них — примеры с длинными названиями. */
const BALL = '<div class="ball"><img src="../assets/brand/LOGO.png" alt=""></div>';
const AVAS = [
  ["big",  "",        BALL.replace("LOGO", "logo-red"),   "Шар крупно", "Без нитки и подписей: буквы «ВСЕ КУПОНЫ» занимают весь круг и читаются даже в 64 px. Самый узнаваемый."],
  ["inv",  "av--red", '<img class="whole" src="../assets/brand/logo-white.png" alt="">', "Белый шар на красном", "Целиком, с ниткой. Красный круг выделяется среди белых аватаров в списках ВК и ОК, но буквы мельче."],
  ["tilt", "av--red", BALL.replace("LOGO", "logo-white"), "Наклейка", "Белый шар крупно на красном, с наклоном — живее, как плашка города на сайте. Ярко и читается в любом размере."],
  ["ring", "",        BALL.replace("LOGO", "logo-red") + '<svg class="arc" viewBox="0 0 100 100"><circle cx="50" cy="50" r="47"/><path id="ARC" d="M9,50A41,41 0 0 0 91,50" fill="none"/><text text-anchor="middle"><textPath href="#ARC" startOffset="50%" data-av-town></textPath></text></svg>', "Город по кругу", "Город дугой по нижнему краю, как на печати или значке. Длинные названия ужимаются по дуге."],
  ["ring-red",  "av--red av-ring", BALL.replace("LOGO", "logo-white") + '<svg class="arc" viewBox="0 0 100 100"><circle cx="50" cy="50" r="47"/><path id="ARC" d="M9,50A41,41 0 0 0 91,50" fill="none"/><text text-anchor="middle"><textPath href="#ARC" startOffset="50%" data-av-town></textPath></text></svg>', "Город по кругу, на красном", "Тот же значок-печать, но белым по красному: ярче в списках, город по нижней дуге."],
  ["ring-band", "av-ring av-band", BALL.replace("LOGO", "logo-red") + '<svg class="arc" viewBox="0 0 100 100"><circle class="band" cx="50" cy="50" r="44"/><path id="ARC" d="M2.6,50A47.4,47.4 0 0 0 97.4,50" fill="none"/><path id="ARCT" d="M9.5,50A40.5,40.5 0 0 1 90.5,50" fill="none"/><text text-anchor="middle" data-fs="7.4" data-max="128"><textPath href="#ARC" startOffset="50%" data-av-town></textPath></text><text text-anchor="middle" class="top" font-size="5.6"><textPath href="#ARCT" startOffset="50%">СКИДКИ ГОРОДА</textPath></text></svg>', "Печать с красным ободом", "Город белыми буквами в широком красном ободе, сверху «скидки города». Город крупнее и читается раньше."],
  ["ring-band-red", "av--red av-ring av-band", BALL.replace("LOGO", "logo-white") + '<svg class="arc" viewBox="0 0 100 100"><circle class="band" cx="50" cy="50" r="44"/><path id="ARC" d="M2.6,50A47.4,47.4 0 0 0 97.4,50" fill="none"/><path id="ARCT" d="M9.5,50A40.5,40.5 0 0 1 90.5,50" fill="none"/><text text-anchor="middle" data-fs="7.4" data-max="128"><textPath href="#ARC" startOffset="50%" data-av-town></textPath></text><text text-anchor="middle" class="top" font-size="5.6"><textPath href="#ARCT" startOffset="50%">СКИДКИ ГОРОДА</textPath></text></svg>', "Печать на красном", "Наоборот: красный центр с белым шаром и белый обод с красным городом."]
];
const AV_TOWNS = ["Елец", "Нижний Новгород", "Санкт-Петербург"];
const avArt = (id, cls, inner, t, out, n) =>
  `<div class="art av av-${id} ${cls}"${out ? ` id="ava-${id}" data-out="ava/ava-${n}-${id}-400x400"` : ""} data-town-v="${t}">${inner.replace(/ARC/g, "arc-" + id + "-" + t.replace(/\W/g, "") + (out ? "" : "x"))}</div>`;
document.getElementById("ava-list").innerHTML = AVAS.map(([id, cls, inner, name, desc], i) => {
  const t0 = town || "Липецк";
  const withTown = inner.includes("data-av-town");
  const examples = withTown ? AV_TOWNS.map((t, k) => `
    <figure><div class="av-mini av-ex" style="width:160px;height:160px" data-ex="${id}|${t}|${k}"></div>${t}</figure>`).join("") : "";
  return `
  <div class="av-row">
    <figure class="slot"><figcaption><b>${i + 1}. ${name}</b> 400×400</figcaption>
      <div class="fit fit--round">${avArt(id, cls, inner, t0, true, i + 1)}</div>
    </figure>
    <div class="av-sizes" data-sizes="${id}"></div>
    <div class="av-desc"><b>${name}</b>${desc}</div>
  </div>` + (examples ? `<div class="av-row av-sizes" style="margin-top:-12px">${examples}</div>` : "");
}).join("");
/* Примеры городов — полноразмерные копии, уменьшенные zoom'ом */
document.querySelectorAll("[data-ex]").forEach(el => {
  const [id, t] = el.dataset.ex.split("|");
  const [, cls, inner] = AVAS.find(a => a[0] === id);
  el.innerHTML = avArt(id, cls, inner, t, false);
  el.firstElementChild.style.zoom = .4;
});
document.querySelectorAll("[data-av-town]").forEach(el => {
  el.textContent = el.closest("[data-town-v]").dataset.townV;
});

/* Город по ширине: плашка — две строки для длинных названий,
   дуга — ужимается по длине пути */
function fitAvatarTowns() {
  document.querySelectorAll(".av-tag .tag").forEach(tag => {
    const t = tag.closest("[data-town-v]").dataset.townV;
    const two = t.length > 10 && /[ -]/.test(t);
    const lines = two ? t.replace(/-/, "-\n").replace(/ /, "\n").split("\n") : [t];
    tag.innerHTML = lines.map(l => `<span>${l}</span>`).join("");
    const box = 400 * .68;
    let fs = two ? 44 : 60;
    tag.style.fontSize = fs + "px";
    while (fs > 18 && Math.max(...[...tag.children].map(s => s.scrollWidth)) > box) tag.style.fontSize = (fs -= 1) + "px";
  });
  document.querySelectorAll(".av-ring textPath[data-av-town]").forEach(tp => {
    const text = tp.parentNode;
    let fs = parseFloat(text.dataset.fs) || 11;
    const max = parseFloat(text.dataset.max) || 96;
    text.setAttribute("font-size", fs);
    while (fs > 4 && text.getComputedTextLength() > max) text.setAttribute("font-size", (fs -= .25));
  });
}
/* Уменьшенные копии: 160 — страница группы, 64 — лента, 32 — списки */
function avatarSizes() {
  document.querySelectorAll("[data-sizes]").forEach(box => {
    const src = document.getElementById("ava-" + box.dataset.sizes);
    box.innerHTML = "";
    [160, 64, 32].forEach(px => {
      const f = document.createElement("figure");
      const m = document.createElement("div");
      m.className = "av-mini"; m.style.width = m.style.height = px + "px";
      const c = src.cloneNode(true);
      c.removeAttribute("id"); c.removeAttribute("data-out"); c.classList.remove("art");
      c.style.cssText = "position:relative;overflow:hidden;zoom:" + px / 400;
      c.querySelectorAll("[id]").forEach(n => { n.id += "-m" + px; });
      c.querySelectorAll("textPath").forEach(n => n.setAttribute("href", n.getAttribute("href") + "-m" + px));
      m.appendChild(c);
      f.append(m, px + " px");
      box.appendChild(f);
    });
  });
}

/* Макеты «как в ВК» — копии обложек: пересобираются, когда догрузится
   снимок, иначе на медленной сети копия остаётся без фото и меток */
let vkPrevT;
const vkPreviewSoon = () => { clearTimeout(vkPrevT); vkPrevT = setTimeout(() => { if (typeof vkPreview === "function" && document.fonts.status === "loaded") vkPreview(); }, 150); };

/* Отдельный снимок под живую обложку (правка 05.10): если в photos/ лежит
   <имя>-mob.jpg, на телефоне берётся он, иначе — общий снимок с кадрированием */
function loadMobPhotos() {
  document.querySelectorAll(".vk-mob2.cpn .shot[data-photo]").forEach(n => {
    const stem = n.dataset.photo + "-mob", img = new Image();
    img.onload = () => {
      PHOTO_SIZE[stem] = [img.naturalWidth, img.naturalHeight];
      n.dataset.mob = "1"; n.dataset.file = stem;
      n.style.backgroundSize = n.style.backgroundPosition = "";
      n.style.setProperty("--img", `url('photos/${stem}.jpg')`); n.classList.add("is-loaded");
      placeHot(n);
      vkPreviewSoon();
    };
    img.src = "photos/" + stem + ".jpg";
  });
}

/* Новые обложки (05.10). Выгода на снимке — пилюля «значок · ниша · билетик» */
PATH.detyam = '<circle cx="12" cy="13.5" r="6"/><circle cx="7" cy="7" r="2"/><circle cx="17" cy="7" r="2"/><path d="M10 14.5h.01M14 14.5h.01M10.5 17h3"/>';
PATH.avto = '<path d="M4 16.5v-4.5l2.2-5h11.6l2.2 5v4.5z"/><path d="M5 16.5v2.5h3v-2.5M16 16.5v2.5h3v-2.5"/><path d="M7.5 12.5h.01M16.5 12.5h.01"/>';
/* Выгода на фото — корешок купона (правка 05.10: билетик внутри
   скруглённой пилюли выглядел наклейкой на наклейке). Одна фигура:
   слева белая часть «значок · ниша», справа красная с выгодой, на линии
   отрыва — полукруглые вырезы сверху и снизу. Контур строит shapeStubs. */
const stubHTML = (cat, name, value) =>
  `<span class="stub${value ? "" : " stub--solo"}"><span class="stub__l"><span class="offer__ic">${icon(cat)}</span>${name}</span>` +
  (value ? `<span class="stub__r">${value}</span>` : "") + `</span>`;
document.querySelectorAll("[data-offer]").forEach(el => {
  const [cat, name, value] = el.dataset.offer.split("|");
  el.innerHTML = stubHTML(cat, name, value);
});

PATH.dom = '<path d="M4 11 12 4l8 7v9H4z"/><path d="M10 20v-5h4v5"/>';

/* D. Ниши строкой: «значок · название» */
document.querySelectorAll("[data-chips]").forEach(el => {
  el.innerHTML = el.dataset.chips.split("|").map(c => {
    const [cat, name] = c.split(":");
    return `<span class="chip">${icon(cat)}${name}</span>`;
  }).join("");
});

/* E. Телефон с открытым купоном: снимок, выгода, код для кассы */
document.querySelectorAll("[data-phone]").forEach(el => {
  const c = COUPONS.beauty;
  el.innerHTML = `
    <div class="phone__scr">
      <div class="phone__bar"><img src="../assets/brand/logo-red.png" alt=""><span>vsekupony.ru</span></div>
      <div class="phone__ph" style="background-image:url('${PH + c.photo}')"><span class="tk">${c.value}</span></div>
      <div class="phone__t">${c.title}</div>
      <div class="phone__c">${c.company}</div>
      <div class="phone__code"><span>Код купона</span><b>LIP-2547</b></div>
      <div class="phone__hint">Покажите экран на кассе</div>
    </div>`;
});

/* F. Мозаика: снимки всех ниш из библиотеки ленты, на части — выгода */
const MOSAIC = [
  ["kofe-warm.jpg", "5 = 4"], ["manikyur-rose.jpg", ""], ["sport-teal.jpg", ""], ["eda-cool.jpg", ""],
  ["detyam-yellow.jpg", "−20%"], ["avto-steel.jpg", ""], ["razvlecheniya-blue.jpg", "2 по цене 1"], ["dom-beige.jpg", ""],
  ["beauty.jpg", "−25%"], ["pitomtsy-brown.jpg", ""], ["fitness.jpg", "−35%"], ["coffee.jpg", "−50%"],
  ["krasota-green.jpg", ""], ["entertainment.jpg", ""], ["odezhda-dark.jpg", ""], ["obuchenie-purple.jpg", "−15%"],
  ["meditsina-white.jpg", ""], ["biz-warm.jpg", "−10%"]
];
document.querySelectorAll("[data-mosaic]").forEach(el => {
  const n = +el.dataset.mosaic;
  el.innerHTML = Array.from({ length: n }, (_, i) => {
    const [ph, v] = MOSAIC[i % MOSAIC.length];
    return `<div class="mosaic__i" style="background-image:url('${PH + ph}')">${v ? `<span class="tk">${v}</span>` : ""}</div>`;
  }).join("");
});

/* B. Витрина: шесть ниш, снимки из общей библиотеки ленты */
const SHELF = [
  ["kofe-warm.jpg",     "eda",     "Кофейни",        "5 = 4"],
  ["beauty.jpg",        "krasota", "Красота",        "−25%"],
  ["eda-cool.jpg",      "eda",     "Обеды",          "349 ₽"],
  ["fitness.jpg",       "sport",   "Фитнес",         "−35%"],
  ["detyam-yellow.jpg", "detyam",  "Детям",          "−20%"],
  ["avto-steel.jpg",    "avto",    "Автомойка",      "−30%"]
];
document.querySelectorAll("[data-tiles]").forEach(el => {
  el.innerHTML = SHELF.map(([ph, cat, name, value]) => `
    <div class="tile">
      <div class="tile__ph" style="background-image:url('${PH + ph}')"><span class="tk">${value}</span></div>
      <div class="tile__t"><span>${icon(cat)}</span>${name}</div>
    </div>`).join("");
});

/* Метки на снимке (05.10): выгода привязана к предмету в кадре — точка на
   предмете, тонкая линия, белая плашка «значок · ниша · билетик».
   Координаты — в долях снимка, поэтому метка попадает на предмет при любом
   кадрировании (компьютер, телефон, ОК). Плашка встаёт с той стороны, где
   ей хватает места в кадре. Ключ — имя файла без .jpg. */
PATH.odezhda = '<path d="M8.5 4 12 6l3.5-2 5 4-2.8 3-1.7-1V20h-8v-10l-1.7 1-2.8-3z"/>';
PATH.spa = '<path d="M12 20c-4.5 0-7.5-3.5-7.5-8 4 0 7.5 3 7.5 8zm0 0c4.5 0 7.5-3.5 7.5-8-4 0-7.5 3-7.5 8z"/><path d="M12 12c-1.8-1.8-1.8-5.2 0-8 1.8 2.8 1.8 6.2 0 8z"/>';
PATH.phone = '<rect x="7" y="3.5" width="10" height="17" rx="2"/><path d="M11 17.5h2"/>';
const HOT = {
  "people":   { cup: [.735, .50, "eda", "Кофе с собой", "5 = 4"], bags: [.60, .80, "odezhda", "Одежда", "−30%"] },
  "people-2": { flowers: [.55, .42, "spa", "Цветы", "−15%"], box: [.89, .53, "eda", "Выпечка", "5 = 4"], bags: [.51, .78, "odezhda", "Одежда", "−30%"] },
  "people-3": { phone: [.715, .48, "phone", "Купон на экране", ""], cup: [.77, .615, "eda", "Капучино", "5 = 4"], bakery: [.94, .74, "eda", "Выпечка", "−20%"] },
  "flatlay":  { coffee: [.65, .15, "eda", "Кофейни", "5 = 4"], lipstick: [.665, .43, "krasota", "Красота", "−25%"],
                kettle: [.78, .52, "sport", "Фитнес", "−35%"], toy: [.68, .63, "detyam", "Детям", "−20%"],
                pizza: [.89, .76, "eda", "Пиццерии", "2 по цене 1"], keys: [.75, .85, "avto", "Автомойка", "−30%"] }
};
Object.assign(HOT, {
  "cafe-2":    { phone: [.31, .47, "phone", "Купон на экране", ""], cup: [.545, .51, "eda", "Капучино", "5 = 4"],
                 rolls: [.72, .82, "eda", "Выпечка", "−20%"] },
  "couple-2":  { flowers: [.22, .30, "spa", "Цветы", "−15%"], coffee: [.65, .48, "eda", "Кофе с собой", "5 = 4"],
                 donuts: [.85, .62, "eda", "Пончики", "−20%"], bags: [.48, .80, "odezhda", "Одежда", "−30%"] },
  "flatlay-2": { coffee: [.11, .22, "eda", "Кофейни", "5 = 4"], lipstick: [.46, .22, "krasota", "Красота", "−25%"],
                 kettle: [.68, .30, "sport", "Фитнес", "−35%"], toy: [.88, .22, "detyam", "Детям", "−20%"],
                 pizza: [.12, .70, "eda", "Пиццерии", "2 по цене 1"], flowers: [.37, .62, "spa", "Цветы", "−15%"],
                 keys: [.87, .82, "avto", "Автомойка", "−30%"] },
  "walk-2":    { cup: [.33, .40, "eda", "Кофе с собой", "5 = 4"], flowers: [.74, .48, "spa", "Цветы", "−15%"],
                 bags: [.17, .75, "odezhda", "Одежда", "−30%"] },
  "checkout":  { screen: [.43, .30, "ticket", "Купон на экране", ""], cup: [.70, .68, "eda", "Капучино", "5 = 4"],
                 bakery: [.90, .70, "eda", "Выпечка", "−20%"] },
  "table":     { pizza: [.25, .30, "eda", "Пиццерии", "2 по цене 1"], salad: [.58, .20, "eda", "Салаты", "−15%"],
                 lemonade: [.86, .16, "eda", "Лимонады", "1 + 1"], sushi: [.68, .55, "eda", "Суши", "−25%"],
                 cake: [.42, .78, "eda", "Десерты", "−20%"], cup: [.20, .78, "eda", "Кофе", "5 = 4"] }
});
/* Отдельные снимки под телефон (*-mob.jpg, 2600×975) */
Object.assign(HOT, {
  "cafe-2-mob":    { bakery: [.70, .86, "eda", "Выпечка", "−20%"] },
  "table-mob":     { sushi: [.33, .62, "eda", "Суши", "−25%"] },
  "walk-2-mob":    { cup: [.63, .63, "eda", "Кофе с собой", "5 = 4"], bags: [.32, .78, "odezhda", "Одежда", "−30%"] },
  "flatlay-2-mob": { coffee: [.12, .52, "eda", "Кофейни", "5 = 4"], kettle: [.54, .56, "sport", "Фитнес", "−35%"],
                     pizza: [.67, .55, "eda", "Пиццерии", "2 по цене 1"], flowers: [.88, .45, "spa", "Цветы", "−15%"] }
});
/* Белый экран телефона на снимке checkout — наш купон поверх, в долях снимка */
const SCREEN = { "checkout": [.268, .172, .435, .688] };
const PHOTO_SIZE = {};
/* Живая обложка на телефоне: в шапке ВК от снимка видна только полоса
   справа от аватара, над названием (в кадре снимка ~0–240 px по высоте,
   правее ~420 px). Поэтому кадр на телефоне строится от главного — лица
   или предмета: [x, y] в долях снимка, увеличение, куда его поставить. */
const MOB_FOCUS = {
  "people":   [.70, .20, 1,   680, 130],
  "people-2": [.75, .20, 1,   700, 130],
  "people-3": [.58, .30, 1.6, 640, 130],
  "flatlay":  [.65, .15, 1,   470, 125],
  "walk-2":    [.48, .14, 1, 690, 120],
  "flatlay-2": [.68, .30, 1, 690, 130]
};
/* Купон на телефоне: снимок — полоса 780×300 вверху купона, лица и
   главное — по центру полосы */
const MOB_FOCUS_CPN = {
  "people":    [.70, .18, 1, 540, 140],
  "people-2":  [.75, .18, 1, 540, 140],
  "people-3":  [.60, .25, 1, 540, 140],
  "flatlay":   [.72, .45, 1, 540, 175],
  "cafe-2":    [.45, .18, 1, 540, 140],
  "couple-2":  [.55, .18, 1, 540, 140],
  "flatlay-2": [.50, .30, 1, 540, 175],
  "walk-2":    [.48, .14, 1, 540, 130],
  "checkout":  [.40, .35, 1, 540, 175],
  "table":     [.50, .45, 1, 540, 175]
};
/* Где лежит снимок в кадре: обычно cover по --pos; на телефоне — от фокуса */
function photoBox(shot) {
  const size = PHOTO_SIZE[shot.dataset.file];
  const W = shot.clientWidth, H = shot.clientHeight;
  const f = shot.closest(".vk-mob2") && (shot.closest(".cpn") ? MOB_FOCUS_CPN : MOB_FOCUS)[shot.dataset.file];
  if (f) {
    const sc = Math.max(W / size[0], H / size[1]) * f[2];
    const dw = size[0] * sc, dh = size[1] * sc;
    const ox = Math.min(0, Math.max(W - dw, f[3] - shot.offsetLeft - f[0] * dw));
    const oy = Math.min(0, Math.max(H - dh, f[4] - f[1] * dh));
    shot.style.backgroundSize = `${dw}px ${dh}px`;
    shot.style.backgroundPosition = `${ox}px ${oy}px`;
    return { dw, dh, ox, oy };
  }
  const pos = (getComputedStyle(shot).getPropertyValue("--pos").trim() || "50% 50%").split(/\s+/)
    .map(v => v === "center" ? .5 : parseFloat(v) / 100);
  const sc = Math.max(W / size[0], H / size[1]);
  const dw = size[0] * sc, dh = size[1] * sc;
  return { dw, dh, ox: (W - dw) * pos[0], oy: (H - dh) * (pos[1] ?? .5) };
}
function placeHot(shot) {
  shot.querySelectorAll(".hot, .scr").forEach(h => h.remove());
  const file = shot.dataset.file, size = PHOTO_SIZE[file], spots = HOT[file];
  if (!size) return;
  if (!spots || !shot.dataset.hot) { photoBox(shot); return; }
  const W = shot.clientWidth, H = shot.clientHeight;
  const { dw, dh, ox, oy } = photoBox(shot);
  const fs = parseFloat(getComputedStyle(shot).getPropertyValue("--hot-fs")) || 26;
  /* Видимая часть кадра: у обложек ВК верх срезан (компьютер ~117 px,
     телефон — до 1060 снимок и так не доходит) */
  const top = parseFloat(getComputedStyle(shot).getPropertyValue("--hot-top")) || 0;
  const scr = SCREEN[file];
  if (scr) {
    const c = COUPONS.coffee, el = document.createElement("div");
    const w = (scr[2] - scr[0]) * dw;
    el.className = "scr";
    el.style.cssText = `left:${ox + scr[0] * dw}px;top:${oy + scr[1] * dh}px;width:${w}px;height:${(scr[3] - scr[1]) * dh}px;--pw:${w * 1.05}px`;
    el.innerHTML = `<div class="phone__scr">
      <div class="phone__bar"><img src="../assets/brand/logo-red.png" alt=""><span>vsekupony.ru</span></div>
      <div class="phone__ph" style="background-image:url('${PH + c.photo}')"><span class="tk">${c.value}</span></div>
      <div class="phone__t">${c.title}</div>
      <div class="phone__code"><span>Код</span><b>LIP-2547</b></div></div>`;
    shot.appendChild(el);
  }
  shot.dataset.hot.split(",").forEach(id => {
    const sp = spots[id]; if (!sp) return;
    const [x, y, cat, name, value] = sp;
    const X = ox + x * dw, Y = oy + y * dh;
    const bottom = parseFloat(getComputedStyle(shot).getPropertyValue("--hot-bottom")) || 0;
    const leftLim = parseFloat(getComputedStyle(shot).getPropertyValue("--hot-left")) || 0;
    if (X < leftLim + fs || X > W - fs || Y < top + fs || Y > H - bottom - fs) return;
    /* Ширина плашки — грубо по числу знаков; сторона — где помещается */
    const w = fs * (3 + .64 * name.length + (value ? .7 * value.length + 1.6 : 0)) + fs * 2.4;
    const right = parseFloat(getComputedStyle(shot).getPropertyValue("--hot-right")) || 0;
    if (X > W - right - fs) return;
    const side = X + w < W - right ? "r" : "l";
    const el = document.createElement("div");
    el.className = "hot hot--" + side;
    el.style.cssText = `left:${X}px;top:${Y}px`;
    el.innerHTML = `<i class="hot__dot"></i><span class="hot__line"></span>
      <div class="hot__tag">${stubHTML(cat, name, value)}</div>`;
    shot.appendChild(el);
  });
  if (document.fonts.status === "loaded") { shapeTickets(); shapeStubs(); }
}

/* A и C: снимки генерируются отдельно и кладутся в social-kit/photos/
   (промпты — photos/README.md). ?people=2 — второй кадр с людьми
   (photos/people-2.jpg) и т. д. Пока файла нет — заглушка с именем. */
const PHOTO_V = { people: new URLSearchParams(location.search).get("people"), flatlay: new URLSearchParams(location.search).get("flatlay") };
document.querySelectorAll("[data-photo]").forEach(el => {
  const key = el.dataset.photo;
  const file = "photos/" + key + (PHOTO_V[key] ? "-" + PHOTO_V[key] : "") + ".jpg";
  el.dataset.label = "Снимок: social-kit/" + file + "\nпромпт — в photos/README.md";
  const img = new Image();
  /* По загрузке — всем узлам с этим снимком, включая уменьшенные копии
     аватара, которые могли появиться раньше */
  img.onload = () => {
    const stem = file.replace(/^photos\/|\.jpg$/g, "");
    PHOTO_SIZE[stem] = [img.naturalWidth, img.naturalHeight];
    document.querySelectorAll(`[data-photo="${key}"]`).forEach(n => {
      if (n.dataset.mob) return;
      n.style.setProperty("--img", `url('${file}')`); n.classList.add("is-loaded");
      n.dataset.file = stem;
      placeHot(n);
    });
    vkPreviewSoon();
  };
  img.src = file;
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
/* Контур корешка: две фигуры, стык по линии отрыва. В долях высоты
   (h = 100), поэтому от zoom превью не зависит. */
function shapeStubs() {
  document.querySelectorAll(".stub").forEach(st => {
    st.querySelector(".stub__bg")?.remove();
    const b = st.getBoundingClientRect();
    if (!b.height) return;
    const h = 100, w = Math.round(100 * b.width / b.height * 10) / 10;
    const r = h * .3, n = h * .2;
    const rp = st.querySelector(".stub__r");
    const sx = rp ? Math.round(100 * (rp.getBoundingClientRect().left - b.left) / b.height * 10) / 10 : w;
    const left = rp
      ? `M${r},0H${sx - n}A${n},${n} 0 0 0 ${sx},${n}V${h - n}A${n},${n} 0 0 0 ${sx - n},${h}H${r}A${r},${r} 0 0 1 0,${h - r}V${r}A${r},${r} 0 0 1 ${r},0Z`
      : `M${r},0H${w - r}A${r},${r} 0 0 1 ${w},${r}V${h - r}A${r},${r} 0 0 1 ${w - r},${h}H${r}A${r},${r} 0 0 1 0,${h - r}V${r}A${r},${r} 0 0 1 ${r},0Z`;
    const right = rp
      ? `<path class="stub__red" d="M${sx + n},0H${w - r}A${r},${r} 0 0 1 ${w},${r}V${h - r}A${r},${r} 0 0 1 ${w - r},${h}H${sx + n}A${n},${n} 0 0 0 ${sx},${h - n}V${n}A${n},${n} 0 0 0 ${sx + n},0Z"/>`
      : "";
    st.insertAdjacentHTML("afterbegin",
      `<svg class="stub__bg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><path class="stub__white" d="${left}"/>${right}</svg>`);
  });
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
    if (a.closest(".av-mini")) return; // копии аватара уменьшены своим zoom
    const w = a.offsetWidth;
    const max = w >= 1900 ? page
      : a.classList.contains("vk-mob") || a.classList.contains("vk-mob2") ? 440
      : a.classList.contains("post") ? 560
      : a.classList.contains("ava") ? 260
      : w;
    a.style.zoom = Math.min(1, max / w);
  });
}
fit();
addEventListener("resize", () => { document.querySelectorAll(".art").forEach(a => { if (!a.closest(".av-mini")) a.style.zoom = 1; }); fit(); });

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
/* Шапка группы ВК: копии обложек и выбранного аватара в масштабе ВК */
const VKP_COVERS = [["vk-cover", "Сейчас"], ["vk-cover-people", "A. Люди"], ["vk-cover-shelf", "B. Витрина"], ["vk-cover-flat", "C. Раскладка"],
  ["vk-cover-red", "D. Красная"], ["vk-cover-phone", "E. Как это работает"], ["vk-cover-mosaic", "F. Мозаика"],
  ["vk-cover-Gcafe", "G. Кафе"], ["vk-cover-Hcouple", "H. Пара"], ["vk-cover-Istone", "I. Раскладка на камне"],
  ["vk-cover-cpn-white-cafe", "K. Купон, белый, кафе"], ["vk-cover-cpn-red-cafe", "L. Купон, красный, кафе"],
  ["vk-cover-cpn-red-couple", "M. Купон, красный, пара"], ["vk-cover-cpn-white-flat", "N. Купон, белый, раскладка"],
  ["vk-cover-cpn-red-walk", "O. Купон, красный, прогулка"],
  ["vk-cover-fr-walk", "P. Рамка, прогулка"], ["vk-cover-fr-flat", "Q. Рамка, раскладка"],
  ["vk-cover-fr-red", "R. Рамка на красном"], ["vk-cover-fr-duo", "S. Две рамки"]];
const plainCopy = (src, zoom) => {
  const c = src.cloneNode(true);
  c.removeAttribute("id"); c.removeAttribute("data-out"); c.classList.remove("art");
  c.style.cssText = "position:relative;overflow:hidden;zoom:" + zoom;
  c.querySelectorAll("[id]").forEach(n => { n.id += "-p"; });
  c.querySelectorAll("textPath").forEach(n => n.setAttribute("href", n.getAttribute("href") + "-p"));
  return c;
};
let vkpAva = "big";
/* Под каждой обложкой — как она выглядит в ВК (правка 05.10): под обложкой
   для компьютера — шапка группы на компьютере, под живой — шапка в
   приложении на телефоне. Аватар и «без шара» переключаются наверху. */
const vkDesk = (art, noLogo) => {
  const d = document.createElement("div");
  d.className = "vk-inline";
  d.innerHTML = `<div class="vk-inline__cap">Так в ВК на компьютере</div>
    <div class="vkp${noLogo ? " no-logo" : ""}">
      <div class="vkp__cover"></div>
      <div class="vkp__card">
        <div class="vkp__name">ВСЕКУПОНЫ | ${town || "Липецк"}</div>
        <div class="vkp__rate"><i>★★★★★</i> · Нет отзывов</div>
        <div class="vkp__sub">✓ Вы подписаны</div>
        <div class="vkp__btn vkp__btn--a">Сообщение</div>
        <div class="vkp__btn vkp__btn--b">Ещё ⌄</div>
      </div>
      <div class="vkp__ava"></div><div class="vkp__plus">+</div>
    </div>`;
  d.querySelector(".vkp__cover").appendChild(plainCopy(art, .466));
  d.querySelector(".vkp__ava").appendChild(plainCopy(document.getElementById("ava-" + vkpAva), 94 / 400));
  return d;
};
const vkPhone = art => {
  const d = document.createElement("div");
  d.className = "vk-inline";
  d.innerHTML = `<div class="vk-inline__cap">Так в приложении ВК</div>
    <div class="vkm">
      <div class="vkm__cover"></div><div class="vkm__shade"></div>
      <div class="vkm__time">14:45</div>
      <div class="vkm__b" style="left:15px">‹</div><div class="vkm__b" style="left:445px">⚙</div><div class="vkm__b" style="left:518px">···</div>
      <div class="vkm__ava"></div>
      <div class="vkm__name">ВСЕКУПОНЫ | ${town || "Липецк"}</div>
      <div class="vkm__btn" style="left:18px">Сообщения</div><div class="vkm__btn" style="left:302px">Продвижение</div>
      <div class="vkm__sub">Вы подписаны · 2 подписчика</div>
    </div>`;
  d.querySelector(".vkm__cover").appendChild(plainCopy(art, .7));
  d.querySelector(".vkm__ava").appendChild(plainCopy(document.getElementById("ava-" + vkpAva), 150 / 400));
  return d;
};
function vkPreview() {
  const noLogo = document.getElementById("vkp-nologo").checked;
  document.querySelectorAll(".vk-inline").forEach(n => n.remove());
  document.querySelectorAll(".art.vk-cover").forEach(art => art.closest(".fit").after(vkDesk(art, noLogo)));
  document.querySelectorAll(".art.vk-mob2, .art.vk-mob").forEach(art => art.closest(".fit").after(vkPhone(art)));
}
document.getElementById("vkp-avas").innerHTML = AVAS.map(([id, , , name], i) =>
  `<button data-a="${id}"${id === vkpAva ? ' class="is-on"' : ""}>${i + 1}. ${name}</button>`).join(" ");
document.getElementById("vkp-avas").addEventListener("click", e => {
  const b = e.target.closest("button"); if (!b) return;
  vkpAva = b.dataset.a;
  document.querySelectorAll("#vkp-avas button").forEach(x => x.classList.toggle("is-on", x === b));
  vkPreview();
});
document.getElementById("vkp-nologo").addEventListener("change", vkPreview);

loadMobPhotos();
document.fonts.ready.then(() => { shapeTickets(); shapeStubs(); fitAvatarTowns(); avatarSizes(); vkPreview(); });
