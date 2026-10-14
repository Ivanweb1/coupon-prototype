/* Лендинг для селлеров маркетплейсов: демо мастера и форма заявки в два шага. */
(function () {
  "use strict";

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Демо мастера «Маркетплейс»: ссылка → сервис сам подтягивает карточку.
  // Площадка определяется по адресу; остальное — пример для прототипа,
  // в проде — данные карточки, которые вернёт парсер площадки.
  var DEMO_URL = "https://www.wildberries.ru/catalog/184239517/detail.aspx";
  var SHOPS = [
    { re: /wildberries|wb\.ru/i, mp: "Wildberries", short: "WB" },
    { re: /ozon/i, mp: "Ozon", short: "Ozon" },
    { re: /market\.yandex|ya\.cc/i, mp: "Яндекс Маркет", short: "ЯМ" },
    { re: /mvideo/i, mp: "М.Видео", short: "М.Видео" },
    { re: /megamarket/i, mp: "Мегамаркет", short: "ММ" }
  ];
  var CARD = { nm: "Набор контейнеров для хранения, 6 шт.", pr: 1290, ct: "Товары для дома" };
  var DISCOUNT = 0.15;

  var wiz = document.querySelector("[data-wiz]");
  if (wiz) {
    var form = wiz.querySelector("[data-wiz-form]");
    var input = wiz.querySelector("[data-wiz-input]");
    var rows = wiz.querySelectorAll("[data-wiz-pull] li");
    var cpn = wiz.querySelector("[data-wiz-cpn]");
    var timers = [];
    var ran = false;

    var rub = function (n) { return n.toLocaleString("ru-RU").replace(/ | /g, " ") + " ₽"; };
    var set = function (k, v) { wiz.querySelectorAll('[data-v="' + k + '"]').forEach(function (el) { el.textContent = v; }); };
    var later = function (fn, ms) { timers.push(setTimeout(fn, reduce ? 0 : ms)); };
    var clear = function () { timers.forEach(clearTimeout); timers = []; };

    var detect = function (url) {
      for (var i = 0; i < SHOPS.length; i++) if (SHOPS[i].re.test(url)) return SHOPS[i];
      // Голый артикул — в мастере площадку выбирают из списка; в демо — WB
      if (/^\s*\d{5,}\s*$/.test(url)) return { mp: "Wildberries · по артикулу", short: "WB" };
      return { mp: "определится по ссылке", short: "МП" };
    };

    var pull = function () {
      clear();
      ran = true;
      var shop = detect(input.value);
      var val = {
        mp: shop.mp, nm: CARD.nm, pr: rub(CARD.pr), ct: CARD.ct
      };
      rows.forEach(function (r) { r.classList.remove("is-ok", "is-load"); });
      cpn.classList.remove("is-on");
      ["mp", "nm", "pr", "ct"].forEach(function (k) { set(k, "—"); });
      set("pr2", "—");

      rows.forEach(function (r, i) {
        later(function () { r.classList.add("is-load"); }, 250 + i * 420);
        later(function () {
          r.classList.remove("is-load"); r.classList.add("is-ok");
          var k = r.dataset.k;
          if (val[k]) set(k, val[k]);
          if (k === "mp") wiz.querySelectorAll('.mp-cpn [data-v="mp"]').forEach(function (el) { el.textContent = shop.short; });
        }, 650 + i * 420);
      });
      later(function () {
        set("pr2", rub(Math.round(CARD.pr * (1 - DISCOUNT))));
        cpn.classList.add("is-on");
      }, 700 + rows.length * 420);
    };

    form.addEventListener("submit", function (e) { e.preventDefault(); pull(); });
    input.addEventListener("paste", function () { setTimeout(pull, 50); });

    // Автопроигрывание: ссылка «впечатывается», когда блок попадает в экран
    var typeDemo = function () {
      if (ran) return;
      ran = true;
      if (reduce) { input.value = DEMO_URL; pull(); return; }
      var i = 0;
      (function step() {
        if (document.activeElement === input) return; // человек начал вводить сам
        input.value = DEMO_URL.slice(0, ++i);
        if (i < DEMO_URL.length) timers.push(setTimeout(step, 22));
        else timers.push(setTimeout(pull, 300));
      })();
    };
    input.addEventListener("focus", function () { if (!input.value) ran = true; });

    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (es) {
        if (es[0].isIntersecting) { io.disconnect(); typeDemo(); }
      }, { threshold: 0.45 });
      io.observe(wiz);
    } else {
      typeDemo();
    }
  }

  // Форма заявки: шаг 1 — контакты, шаг 2 — площадка и карточка
  var lead = document.getElementById("mpForm");
  if (lead) {
    var steps = lead.querySelectorAll("[data-form-step]");
    var num = lead.querySelector("[data-form-n]");
    var check = function (box) {
      var ok = true;
      box.querySelectorAll("[required]").forEach(function (f) {
        var bad = !f.value.trim();
        f.classList.toggle("is-error", bad);
        if (bad && ok) { f.focus(); ok = false; }
      });
      return ok;
    };
    var go = function (n) {
      steps.forEach(function (s) { s.hidden = s.dataset.formStep !== String(n); });
      num.textContent = n;
    };
    lead.querySelector("[data-form-next]").addEventListener("click", function () { if (check(steps[0])) go(2); });
    lead.querySelector("[data-form-back]").addEventListener("click", function () { go(1); });
    lead.addEventListener("submit", function (e) {
      e.preventDefault();
      if (check(steps[1])) lead.querySelector(".bz-form__done").hidden = false;
    });
  }
})();
