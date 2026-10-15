/* Лендинг для селлеров маркетплейсов: демо мастера и форма заявки в два шага. */
(function () {
  "use strict";

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Демо мастера «Маркетплейс»: селлер выбирает площадку и вставляет ссылку →
  // сервис сам подтягивает карточку. Данные карточки — пример для прототипа,
  // в проде — то, что вернёт парсер площадки.
  var DEMO_URL = "https://www.wildberries.ru/catalog/184239517/detail.aspx";
  var CARD = { nm: "Набор контейнеров для хранения, 6 шт.", pr: 1290, ct: "Товары для дома", ds: "из карточки" };
  var DISCOUNT = 0.15;

  var wiz = document.querySelector("[data-wiz]");
  if (wiz) {
    var form = wiz.querySelector("[data-wiz-form]");
    var input = wiz.querySelector("[data-wiz-input]");
    var mpSel = wiz.querySelector("[data-wiz-mp]");
    var rows = wiz.querySelectorAll("[data-wiz-pull] li");
    var cpn = wiz.querySelector("[data-wiz-cpn]");
    var timers = [];
    var ran = false;

    var rub = function (n) { return n.toLocaleString("ru-RU").replace(/ | /g, " ") + " ₽"; };
    var set = function (k, v) { wiz.querySelectorAll('[data-v="' + k + '"]').forEach(function (el) { el.textContent = v; }); };
    var later = function (fn, ms) { timers.push(setTimeout(fn, reduce ? 0 : ms)); };
    var clear = function () { timers.forEach(clearTimeout); timers = []; };

    var pull = function () {
      clear();
      ran = true;
      var val = { nm: CARD.nm, pr: rub(CARD.pr), ct: CARD.ct, ds: CARD.ds };
      // Значок площадки на купоне — из выбранной селлером площадки
      set("mp", mpSel.value.split("|")[1]);
      rows.forEach(function (r) { r.classList.remove("is-ok", "is-load"); });
      cpn.classList.remove("is-on");
      ["nm", "pr", "ct", "ds"].forEach(function (k) { set(k, "—"); });
      set("pr2", "—");

      rows.forEach(function (r, i) {
        later(function () { r.classList.add("is-load"); }, 250 + i * 420);
        later(function () {
          r.classList.remove("is-load"); r.classList.add("is-ok");
          var k = r.dataset.k;
          if (val[k]) set(k, val[k]);
        }, 650 + i * 420);
      });
      later(function () {
        set("pr2", rub(Math.round(CARD.pr * (1 - DISCOUNT))));
        cpn.classList.add("is-on");
      }, 700 + rows.length * 420);
    };

    form.addEventListener("submit", function (e) { e.preventDefault(); pull(); });
    input.addEventListener("paste", function () { setTimeout(pull, 50); });
    mpSel.addEventListener("change", function () { if (input.value) pull(); });

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
