/* Лендинг для бизнеса — дизайн: иконки, фото, живая лента и таблица.
   Цифры спроса, подписи карты и форма — в business.js (общий с Ч/Б). */
(function () {
  "use strict";

  // Значки соцсетей — те же, что в шапке витрины и в деке v4
  var SOC_IC = {
    vk: '<svg class="soc-ic" style="--soc-c:#0077FF" viewBox="0 0 32 32"><rect class="soc-ic__bg" width="32" height="32"/><path class="soc-ic__g" d="M16.8 21.615c-6.15 0-9.656-4.208-9.8-11.22h3.093c.099 5.142 2.364 7.318 4.163 7.767v-7.768h2.904v4.433c1.771-.19 3.641-2.212 4.27-4.442h2.896a8.57 8.57 0 0 1-3.938 5.602A8.87 8.87 0 0 1 25 21.615h-3.192c-.683-2.131-2.391-3.785-4.648-4.01v4.01h-.36"/></svg>',
    tg: '<svg class="soc-ic" style="--soc-c:#2AABEE" viewBox="0 0 248 248"><rect class="soc-ic__bg" width="248" height="248"/><path class="soc-ic__g" d="M129.362 93.057q-16.659 6.93-66.588 28.682-8.107 3.225-8.494 6.308c-.436 3.475 3.916 4.844 9.842 6.707l.12.038q1.155.361 2.377.756c5.83 1.895 13.672 4.113 17.749 4.201q5.547.12 12.382-4.574 46.65-31.491 48.162-31.833c.711-.162 1.696-.365 2.364.228.668.594.602 1.718.531 2.019-.431 1.838-17.512 17.718-26.351 25.936l-.074.068c-2.717 2.526-4.64 4.315-5.037 4.726-.894.93-1.807 1.81-2.684 2.655-5.415 5.221-9.477 9.136.226 15.53 4.649 3.064 8.373 5.6 12.085 8.128l.031.02c4.064 2.768 8.119 5.53 13.365 8.968 1.336.876 2.613 1.787 3.856 2.673 4.731 3.372 8.981 6.402 14.232 5.919 3.051-.281 6.202-3.149 7.803-11.706 3.782-20.221 11.218-64.035 12.936-82.09.15-1.582-.039-3.606-.191-4.495-.152-.888-.47-2.155-1.625-3.092-1.368-1.11-3.48-1.344-4.424-1.328-4.295.076-10.884 2.367-42.593 15.556"/></svg>',
    ok: '<svg class="soc-ic" style="--soc-c:#FF7700" viewBox="0 0 44 44"><rect class="soc-ic__bg" width="44" height="44"/><path class="soc-ic__g" d="M26.868 19.87a6.85 6.85 0 0 1-2.229 1.492 6.88 6.88 0 0 1-7.5-1.492 6.87 6.87 0 0 1-1.875-3.51 6.84 6.84 0 0 1 .392-3.955 6.9 6.9 0 0 1 2.527-3.08 6.96 6.96 0 0 1 3.82-1.18 6.96 6.96 0 0 1 3.83 1.177 6.9 6.9 0 0 1 2.532 3.086 6.84 6.84 0 0 1 .389 3.962 6.87 6.87 0 0 1-1.886 3.512zm-4.877-7.978a3.15 3.15 0 0 0-2.21.917 3.105 3.105 0 0 0 0 4.397c.586.584 1.38.914 2.21.918a3.15 3.15 0 0 0 2.21-.918 3.1 3.1 0 0 0 .913-2.198c0-.824-.328-1.615-.914-2.199a3.15 3.15 0 0 0-2.209-.917m7.239 10.017 2.014 2.753a.315.315 0 0 1-.05.434 14.2 14.2 0 0 1-5.725 2.79l3.889 7.495a.316.316 0 0 1-.123.43.3.3 0 0 1-.16.041h-4.17a.32.32 0 0 1-.296-.19l-2.605-6.182-2.618 6.181a.32.32 0 0 1-.295.191H14.92c-.244 0-.386-.255-.283-.471l3.902-7.494c-2.054-.484-4.03-1.402-5.724-2.791a.32.32 0 0 1-.064-.434l2.027-2.74a.334.334 0 0 1 .475-.064 10.5 10.5 0 0 0 6.75 2.677c2.503 0 4.84-1.045 6.752-2.677.128-.127.359-.102.475.051"/></svg>',
    max: '<img src="assets/brand/soc/max.svg" alt="">'
  };
  document.querySelectorAll("[data-soc]").forEach(function (a) { a.innerHTML = SOC_IC[a.dataset.soc]; });

  // Линейные значки — пути из дека v4 (kit.js)
  var PATH = {
    ticket: '<path d="M3.5 8.5a2 2 0 0 0 2-2h13a2 2 0 0 0 2 2v1.5a2 2 0 0 0 0 4v1.5a2 2 0 0 0-2 2h-13a2 2 0 0 0-2-2V14a2 2 0 0 0 0-4z"/><path d="M14 6.5v11" stroke-dasharray="1.5 2"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    site: '<rect x="3.5" y="5" width="17" height="14" rx="2"/><path d="M3.5 9h17M7 7h.01M9.5 7h.01"/>',
    chat: '<path d="M4.5 18.5 6 15a7.5 7.5 0 1 1 3 3z"/>',
    spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
    eye: '<path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.6"/>',
    phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
    pin: '<path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/>',
    check: '<circle cx="12" cy="12" r="9"/><path d="m8 12.5 2.8 2.8L16.5 9.5"/>',
    mail: '<rect x="3.5" y="5.5" width="17" height="13" rx="2"/><path d="m4 7 8 6 8-6"/>',
    bookmark: '<path d="M7 3.5h10v17l-5-3.5-5 3.5z"/>',
    users: '<circle cx="9" cy="8.5" r="3.3"/><path d="M3 19.5a6 6 0 0 1 12 0"/><circle cx="16.5" cy="9" r="2.6"/><path d="M16 14.2a5 5 0 0 1 5 5.3"/>',
    chev: '<path d="m7 10 5 5 5-5"/>',
    down: '<path d="M12 5v14M6 13l6 6 6-6"/>',
    "f-pct": '<path d="M19 5 5 19"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/>',
    "f-two": '<path d="M3 9h7v4.5a3.5 3.5 0 0 1-7 0z"/><path d="M14 9h7v4.5a3.5 3.5 0 0 1-7 0z"/><path d="M6.5 4.5v2M17.5 4.5v2M3 21h18"/>',
    "f-gift": '<rect x="3.5" y="9" width="17" height="11.5" rx="1.5"/><path d="M2.5 9h19M12 9v11.5"/><path d="M12 9c-2.5 0-5-1-5-3a2 2 0 0 1 3.5-1.3L12 7l1.5-2.3A2 2 0 0 1 17 6c0 2-2.5 3-5 3z"/>',
    "f-door": '<path d="M5 21V4.5A1.5 1.5 0 0 1 6.5 3h11A1.5 1.5 0 0 1 19 4.5V21"/><path d="M3 21h18M14.5 12.5h.01"/>',
    "f-tag": '<path d="M3.5 12.6V4.5a1 1 0 0 1 1-1h8.1l8 8a1.5 1.5 0 0 1 0 2.1l-7 7a1.5 1.5 0 0 1-2.1 0z"/><circle cx="8.5" cy="8.5" r="1.5"/>',
    "f-loyal": '<rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="6.5" cy="12" r="1.3" fill="currentColor"/><circle cx="10" cy="12" r="1.3" fill="currentColor"/><circle cx="13.5" cy="12" r="1.3" fill="currentColor"/><path d="M16 10.2h3v3.6h-3zM17.5 10.2v3.6"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M21 20H3"/>',
    play: '<circle cx="12" cy="12" r="9"/><path d="M10 8.5v7l5.5-3.5z" fill="currentColor" stroke="none"/>',
    grid: '<rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/>',
    cal: '<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>'
  };
  function icon(k) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + PATH[k] + "</svg>";
  }
  document.querySelectorAll("[data-ic]").forEach(function (el) { el.innerHTML = icon(el.dataset.ic); });

  // Фото людей: аватар-кружок; нет файла — остаётся серый кружок
  var PEOPLE = "social-kit/photos/people/";
  function photo(el, src) {
    var img = new Image();
    img.onload = function () { el.style.backgroundImage = "url('" + src + "')"; };
    img.src = src;
  }
  document.querySelectorAll("[data-img]").forEach(function (el) { photo(el, el.dataset.img); });
  document.querySelectorAll("[data-faces]").forEach(function (el) {
    el.innerHTML = el.dataset.faces.split(",").map(function () { return '<i class="ava"></i>'; }).join("");
    el.dataset.faces.split(",").forEach(function (n, k) { photo(el.children[k], PEOPLE + n + ".jpg"); });
  });

  // Живая лента с фото — те же люди и купоны, что на слайде дека
  // События — как на слайде «Сейчас в Липецке» дека v4: кто, что сделал,
  // какой купон и где. Значок на аватаре — действие.
  var EVENTS = [
    ["maria",  "took", "Мария забрала купон",    "−20% на маникюр · Студия «Пример»"],
    ["oleg",   "open", "Олег открыл купон",      "Шиномонтаж перед сезоном · Автосервис «Пример»"],
    ["anna",   "took", "Анна забрала купон",     "Каждая пятая чашка кофе в подарок · Кофейня «Пример»"],
    ["dmitry", "save", "Дмитрий сохранил купон", "Годовой абонемент −35% · Фитнес «Пример»"],
    ["olga",   "took", "Ольга забрала купон",    "Первое занятие в детской студии · Студия «Пример»"],
    ["sergey", "open", "Сергей открыл купон",    "Комбо-обед по будням · Кафе «Пример»"],
    ["marina", "took", "Марина забрала купон",   "Десерт в подарок к любому напитку · Пекарня «Пример»"],
    ["igor",   "save", "Игорь сохранил купон",   "Комплексная мойка −30% · Мойка «Пример»"]
  ];
  var ACT = { took: "ticket", open: "eye", save: "bookmark" };
  var list = document.getElementById("feedD");
  var MAX = 8, i = 0;
  function push() {
    var e = EVENTS[i++ % EVENTS.length];
    var li = document.createElement("li");
    li.className = "is-" + e[1];
    li.innerHTML = '<span class="feed__ava"><span class="ava"></span><i class="feed__act">' + icon(ACT[e[1]]) + "</i></span>" +
      '<div class="feed__t"><b>' + e[2] + "</b><span>" + e[3] + "</span></div><em>только что</em>";
    photo(li.querySelector(".ava"), PEOPLE + e[0] + ".jpg");
    list.insertBefore(li, list.firstChild);
    // Новая строка появляется красной и за несколько секунд плавно
    // становится серой (анимация в CSS). Стартовое заполнение — без подсветки.
    if (started) li.classList.add("is-new");
    for (var k = 1; k < list.children.length; k++) {
      list.children[k].querySelector("em").textContent = (k * 2) + " мин";
    }
    while (list.children.length > MAX) list.removeChild(list.lastChild);
  }
  var started = false;
  if (list) {
    for (var n = 0; n < MAX; n++) push();
    started = true;
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce) { setTimeout(push, 900); setInterval(push, 7000); }
  }

  // Таблица сравнения — слайд 11 дека v4: g выгодно, y средне, n невыгодно
  var CMP = [
    ["ВСЕКУПОНЫ", "g:Низкая g:Высокий g:Высокая g:Точная g:Лёгкое g:Максимальное", 4, "от 1 000 ₽"],
    ["Доски объявлений", "n:Высокая_↑ g:Высокий g:Высокая y:Умеренная g:Лёгкое y:Умеренное", 20, "от 10 000 ₽"],
    ["Поисковые системы", "y:Умеренная g:Высокий y:Умеренная g:Точная g:Лёгкое n:Минимальное", 60, "от 30 000 ₽"],
    ["Наружная реклама", "n:Высокая g:Высокий n:Низкая n:Низкая n:Сложное n:Минимальное", 30, "от 15 000 ₽"],
    ["Визитки и флаеры", "g:Низкая n:Низкий n:Низкая y:Умеренная n:Сложное n:Минимальное", 10, "от 5 000 ₽"],
    ["Соцсети", "y:Умеренная g:Высокий y:Умеренная y:Умеренная g:Лёгкое y:Умеренное", 20, "от 10 000 ₽"],
    ["Радио", "n:Высокая y:Умеренный y:Умеренная n:Низкая n:Сложное n:Минимальное", 40, "от 20 000 ₽"],
    ["ТВ", "n:Высокая y:Умеренный n:Низкая n:Низкая n:Сложное n:Минимальное", 100, "от 50 000 ₽"],
    ["Блогеры", "y:Умеренная y:Умеренный y:Умеренная y:Умеренная n:Сложное y:Умеренное", 20, "от 10 000 ₽"]
  ];
  var tb = document.querySelector("#cmpTable tbody");
  if (tb) {
    tb.innerHTML = CMP.map(function (r, k) {
      var name = k === 0 ? '<span class="cmp__me"><img src="assets/brand/logo-white.png" alt="">' + r[0] + "</span>" : r[0];
      var cells = r[1].split(" ").map(function (c) {
        var p = c.split(":");
        return '<td><span class="rt rt--' + p[0] + '"><i></i><i></i><i></i>' + p[1].replace("_", " ") + "</span></td>";
      }).join("");
      return "<tr" + (k === 0 ? ' class="is-me"' : "") + '><th scope="row">' + name + "</th>" + cells +
        '<td><span class="bud"><span class="bud__b"><b style="width:' + r[2] + '%"></b></span>' +
        r[3].replace(/ /g, "\u00a0") + "</span></td></tr>";
    }).join("");
  }
})();

/* Шапка при прокрутке не сворачивается — закреплена целиком (sticky в CSS) */

/* Купон Вордстата: на узком экране вырезы — ровно на линии отрыва корешка */
(function () {
  var c = document.querySelector(".wcp"); if (!c) return;
  var m = c.querySelector(".wcp__main");
  function set() { c.style.setProperty("--main-h", m.offsetHeight + "px"); }
  set(); window.addEventListener("resize", set);
  if (document.fonts) document.fonts.ready.then(set);
})();

/* AI-помощник: вкладки слева переключают пример в окне справа.
   Сами — каждые 4,5 с; клик — выбрать вручную (автосмена продолжится). */
(function () {
  var box = document.querySelector("[data-aix]"); if (!box) return;
  var tabs = box.querySelectorAll(".aix__tabs button");
  var panes = box.querySelectorAll(".aix__p");
  var cur = 0, timer = null, DUR = 4500;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function show(k) {
    cur = k;
    tabs.forEach(function (t, i) { t.setAttribute("aria-selected", i === k ? "true" : "false"); });
    panes.forEach(function (p, i) { p.classList.toggle("is-on", i === k); });
    box.style.setProperty("--aix-dur", DUR + "ms");
    var bar = tabs[k].querySelector(".aix__bar");
    bar.style.animation = "none"; void bar.offsetWidth; bar.style.animation = "";
  }
  // На телефоне пункты — «сторис» в окне: сверху бегущие полоски по числу пунктов,
  // под ними текст активного пункта; переключаются сами, по касанию полоски и свайпом
  var win = box.querySelector(".aix__win");
  var mq = window.matchMedia("(max-width:720px)");
  var story = document.createElement("div");
  story.className = "aix__story";
  story.innerHTML = '<div class="aix__segs">' + Array.prototype.map.call(tabs, function (t, i) {
    return '<button type="button" aria-label="Пункт ' + (i + 1) + '"><i></i></button>'; }).join("") +
    '</div><p class="aix__cap"><em></em><span></span></p>';
  win.querySelector(".aix__top").insertAdjacentElement("afterend", story);
  var segs = story.querySelectorAll(".aix__segs button"), cap = story.querySelector(".aix__cap");
  var _show = show;
  show = function (k) {
    _show(k);
    segs.forEach(function (sg, i) {
      sg.className = i < k ? "is-done" : i === k ? "is-on" : "";
      var bar = sg.querySelector("i"); bar.style.animation = "none"; void bar.offsetWidth; bar.style.animation = "";
    });
    cap.querySelector("em").textContent = k + 1;
    cap.querySelector("span").textContent = tabs[k].querySelector("span").textContent;
  };
  // автосмена — только пока блок на экране
  var seen = true;
  if ("IntersectionObserver" in window) {
    seen = false;
    new IntersectionObserver(function (es) { seen = es[0].isIntersecting; start(); }, { threshold: 0.25 }).observe(box);
  }
  function next() { show((cur + 1) % tabs.length); }
  function prev() { show((cur - 1 + tabs.length) % tabs.length); }
  function start() { clearInterval(timer); if (reduce || !seen) return; timer = setInterval(next, DUR); }
  tabs.forEach(function (t, i) { t.addEventListener("click", function () { show(i); start(); }); });
  segs.forEach(function (sg, i) { sg.addEventListener("click", function () { show(i); start(); }); });
  // свайп по окну влево/вправо
  var x0 = null, y0 = null;
  win.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
  win.addEventListener("touchend", function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0; x0 = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) { (dx < 0 ? next : prev)(); start(); }
  }, { passive: true });
  // подпись под полосками — высотой с самый длинный пункт, чтобы окно не прыгало
  function capH() {
    if (!mq.matches) { cap.style.minHeight = ""; return; }
    var span = cap.querySelector("span"), keep = span.textContent, h = 0;
    cap.style.minHeight = "0";
    tabs.forEach(function (t) { span.textContent = t.querySelector("span").textContent; h = Math.max(h, cap.offsetHeight); });
    span.textContent = keep; cap.style.minHeight = h + "px";
  }
  window.addEventListener("resize", capH);
  show(0); start(); capH();
})();

/* Таблица «Выгоды»: подсказка «листайте вправо» — стрелка у правого края,
   по касанию прокручивает; прячется, когда долистали до конца */
(function () {
  var sc = document.querySelector(".cmp__scroll"); if (!sc) return;
  var btn = document.createElement("button");
  btn.type = "button"; btn.className = "cmp__more"; btn.setAttribute("aria-label", "Листать таблицу вправо");
  btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  sc.parentNode.classList.add("cmp--hint"); sc.parentNode.appendChild(btn);
  function upd() {
    var can = sc.scrollWidth - sc.clientWidth > 4, end = sc.scrollLeft + sc.clientWidth >= sc.scrollWidth - 4;
    sc.parentNode.classList.toggle("is-end", !can || end);
    if (sc.scrollLeft > 10) sc.parentNode.classList.add("is-moved");
  }
  btn.addEventListener("click", function () { sc.scrollBy({ left: sc.clientWidth * 0.7, behavior: "smooth" }); });
  sc.addEventListener("scroll", upd, { passive: true }); window.addEventListener("resize", upd); upd();
})();

/* FAQ: сначала восемь вопросов, остальные — по кнопке */
(function () {
  var list = document.querySelector("[data-faq]"), btn = document.querySelector("[data-faq-more]");
  if (!list || !btn) return;
  btn.addEventListener("click", function () { list.classList.add("is-all"); btn.remove(); });
})();

/* Поп-ап «Задать вопрос» */
(function () {
  var dlg = document.getElementById("ask"); if (!dlg || !dlg.showModal) return;
  var form = dlg.querySelector("[data-ask-form]"), done = dlg.querySelector(".qd__done");
  function open(e) {
    if (e) e.preventDefault();
    form.reset(); done.hidden = true; form.classList.remove("is-done");
    form.querySelectorAll(".is-error").forEach(function (f) { f.classList.remove("is-error"); });
    dlg.showModal(); document.documentElement.classList.add("is-modal");
  }
  function close() { dlg.close(); }
  dlg.addEventListener("close", function () { document.documentElement.classList.remove("is-modal"); });
  document.querySelectorAll("[data-ask-open]").forEach(function (a) { a.addEventListener("click", open); });
  dlg.querySelectorAll("[data-ask-close]").forEach(function (b) { b.addEventListener("click", close); });
  dlg.addEventListener("click", function (e) { if (e.target === dlg) close(); });
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var bad = false;
    form.querySelectorAll("[required]").forEach(function (f) {
      var err = !f.value.trim(); f.classList.toggle("is-error", err); if (err && !bad) { bad = true; f.focus(); }
    });
    var agree = form.querySelector("[data-agree]");
    if (agree && !agree.checked) { agree.closest(".form__agree").classList.add("is-error"); if (!bad) { bad = true; agree.focus(); } }
    if (bad) return;
    done.hidden = false; form.classList.add("is-done");
  });
})();

/* Форма заявки: без согласия на обработку данных не отправляем
   (проверка до общего обработчика из business.js) */
(function () {
  var form = document.getElementById("leadForm"); if (!form) return;
  var box = form.querySelector("[data-agree]"); if (!box) return;
  var lbl = box.closest(".form__agree");
  box.addEventListener("change", function () { lbl.classList.remove("is-error"); });
  form.addEventListener("submit", function (e) {
    if (box.checked) return;
    e.preventDefault(); e.stopImmediatePropagation();
    lbl.classList.add("is-error"); box.focus();
  }, true);
})();

/* Поп-ап: снять подсветку согласия при отметке */
(function () {
  var box = document.querySelector("#ask [data-agree]"); if (!box) return;
  box.addEventListener("change", function () { box.closest(".form__agree").classList.remove("is-error"); });
})();

/* Плашка cookie: показываем через секунду, «Хорошо» — запоминаем */
(function () {
  var ck = document.querySelector("[data-cookie]"); if (!ck) return;
  var KEY = "vk-cookie-ok", seen = false;
  try { seen = localStorage.getItem(KEY) === "1"; } catch (e) {}
  if (seen) return;
  setTimeout(function () { ck.hidden = false; requestAnimationFrame(function () { ck.classList.add("is-on"); }); }, 1000);
  ck.querySelector("[data-cookie-ok]").addEventListener("click", function () {
    try { localStorage.setItem(KEY, "1"); } catch (e) {}
    ck.classList.remove("is-on"); setTimeout(function () { ck.hidden = true; }, 300);
  });
})();

/* Первый экран: лента купонов прокручивается сама (копия ленты — для
   бесшовного круга); две плашки с действиями покупателей сменяются
   по очереди, купон подсвечивается, его счётчик растёт */
(function () {
  var feed = document.querySelector("[data-hx-feed]"); if (!feed) return;
  var track = feed.querySelector(".hx__track"), grid = track.querySelector(".hx__grid");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduce) { var copy = grid.cloneNode(true); copy.setAttribute("aria-hidden", "true"); track.appendChild(copy); feed.classList.add("is-run"); }

  var P = "social-kit/photos/people/";
  // купоны ленты (индекс = data-hx-card) и покупатели; пара собирается на лету,
  // поэтому один и тот же человек не «забирает» один и тот же купон подряд
  var CARD = ["1+1 на капучино", "маникюр −20%", "первая тренировка за 0 ₽", "−30% на шиномонтаж",
              "завтрак за 349 ₽", "помада в подарок", "час боулинга в подарок", "груминг −15%"];
  var WHO = [["anna", "Анна", 1], ["dmitry", "Дмитрий", 0], ["olga", "Ольга", 1], ["igor", "Игорь", 0],
             ["marina", "Марина", 1], ["sergey", "Сергей", 0], ["maria", "Мария", 1], ["oleg", "Олег", 0]];
  var evs = [document.querySelector('[data-hx-ev="0"]'), document.querySelector('[data-hx-ev="1"]')];
  if (reduce || !evs[0] || !evs[1]) return;
  var slot = 0, lastCards = [0, 3], lastWho = [0, 1], w0 = 2;
  function shown(el) { return el.offsetParent !== null; }
  function inView(i) {
    var f = feed.getBoundingClientRect();
    return Array.prototype.some.call(feed.querySelectorAll('[data-hx-card="' + i + '"]'), function (c) {
      var r = c.getBoundingClientRect(); return r.top >= f.top - 10 && r.bottom <= f.bottom - 20;
    });
  }
  function pickCard() {
    var all = CARD.map(function (_, i) { return i; });
    var fresh = all.filter(function (i) { return lastCards.indexOf(i) < 0; });
    var vis = fresh.filter(inView);
    if (!vis.length) vis = all.filter(function (i) { return i !== lastCards[0] && inView(i); });
    var pool = vis.length ? vis : fresh;
    return pool[Math.floor(Math.random() * pool.length)];
  }
  function pickWho() {
    for (var t = 0; t < WHO.length; t++) { w0 = (w0 + 1) % WHO.length; if (lastWho.indexOf(w0) < 0) break; }
    return w0;
  }
  setInterval(function () {
    var vis = evs.filter(shown); if (!vis.length) return;
    slot = (slot + 1) % vis.length;
    var ci = pickCard(), wi = pickWho(), who = WHO[wi], ev = vis[slot];
    lastCards = [ci].concat(lastCards).slice(0, 3);
    lastWho = [wi].concat(lastWho).slice(0, 3);
    ev.classList.add("is-out");
    setTimeout(function () {
      ev.querySelector(".ava").style.backgroundImage = "url('" + P + who[0] + ".jpg')";
      ev.querySelector("b").textContent = who[1] + (who[2] ? " забрала код" : " забрал код");
      ev.querySelector(":scope > div > span").textContent = CARD[ci] + " · только что";
      feed.querySelectorAll("[data-hx-card]").forEach(function (c) { c.classList.toggle("is-hot", +c.dataset.hxCard === ci); });
      feed.querySelectorAll('[data-hx-count="' + ci + '"]').forEach(function (u) {
        u.textContent = String(+u.textContent + 1); u.classList.add("is-up");
        setTimeout(function () { u.classList.remove("is-up"); }, 1200);
      });
      ev.classList.remove("is-out");
    }, 350);
  }, 2600);
})();

/* Плавное появление снизу вверх: по блокам, внутри сеток — по очереди.
   Классы ставит скрипт, поэтому без JS всё видно сразу. */
(function () {
  if (!("IntersectionObserver" in window)) return;
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var GRIDS = ".path,.tix,.chs,.fmts,.team,.hero__nums,.faq__list,.pilot__steps,.stats,.pers";
  var items = [];
  function add(el, d) { el.classList.add("rv"); el.style.setProperty("--rv-d", d + "ms"); items.push(el); }
  function walk(box) {
    Array.prototype.forEach.call(box.children, function (el) {
      if (el.matches("script,style,[hidden],.is-more")) return;
      if (el.matches(".hero__text,.hrow,.faq__aside")) { walk(el); return; }
      if (el.matches(GRIDS)) {
        Array.prototype.forEach.call(el.children, function (c, i) { if (!c.matches(".is-more,[hidden],button")) add(c, Math.min(i, 6) * 80); });
        return;
      }
      if (getComputedStyle(el).display === "contents") { walk(el); return; }
      add(el, 0);
    });
  }
  document.querySelectorAll("main > section").forEach(function (sec) {
    var w = sec.querySelector(":scope > .wrap"); if (w) walk(w);
  });
  // в шапке блока: текст справа чуть позже заголовка
  document.querySelectorAll(".hrow > .rv:not(.head)").forEach(function (el) { el.style.setProperty("--rv-d", "120ms"); });
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
  items.forEach(function (el) { io.observe(el); });
  document.documentElement.classList.add("rv-on");
})();

/* Мобильное меню (бургер): открыть/закрыть, закрыть по ссылке, Esc и при расширении экрана */
(function () {
  var btn = document.querySelector("[data-burger]"), nav = document.querySelector("[data-mnav]");
  if (!btn || !nav) return;
  function set(open) {
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    document.documentElement.classList.toggle("is-mnav", open);
    if (open) { nav.hidden = false; requestAnimationFrame(function () { nav.classList.add("is-open"); }); }
    else { nav.classList.remove("is-open"); setTimeout(function () { if (!nav.classList.contains("is-open")) nav.hidden = true; }, 250); }
  }
  btn.addEventListener("click", function () { set(btn.getAttribute("aria-expanded") !== "true"); });
  nav.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { set(false); }); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && btn.getAttribute("aria-expanded") === "true") { set(false); btn.focus(); } });
  window.addEventListener("resize", function () { if (window.innerWidth > 720 && btn.getAttribute("aria-expanded") === "true") set(false); });
})();

/* Карта: всё содержимое — в общий слой, чтобы на телефоне его можно было приблизить */
(function () {
  document.querySelectorAll("[data-map]").forEach(function (m) {
    var z = document.createElement("div"); z.className = "map__z";
    Array.prototype.slice.call(m.children).forEach(function (c) { if (!c.classList.contains("map__ins")) z.appendChild(c); });
    m.insertBefore(z, m.firstChild);
  });
})();
