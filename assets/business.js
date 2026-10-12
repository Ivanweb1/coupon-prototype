/* Лендинг для бизнеса: живая лента спроса и форма заявки. */
(function () {
  "use strict";

  // Живая лента: кто смотрит и кто только что забрал предложение.
  // События — пример для прототипа, в проде — поток платформы.
  var EVENTS = [
    { took: true,  text: "забрал(а) −20% на маникюр" },
    { took: false, text: "смотрит кофейни рядом" },
    { took: true,  text: "забрал(а) 1+1 на капучино" },
    { took: false, text: "смотрит детские секции" },
    { took: true,  text: "забрал(а) первый визит в фитнес за 0 ₽" },
    { took: false, text: "смотрит кафе и рестораны" },
    { took: true,  text: "забрал(а) подарок к покупке в магазине одежды" },
    { took: false, text: "смотрит маникюр" },
    { took: true,  text: "забрал(а) 349 ₽ комбо в кафе" },
    { took: false, text: "смотрит фитнес" },
    { took: true,  text: "забрал(а) 5=4 на стрижку" }
  ];
  var list = document.getElementById("feed");
  var MAX = 6;
  var i = 0;

  function push() {
    var e = EVENTS[i++ % EVENTS.length];
    var li = document.createElement("li");
    if (e.took) li.className = "is-took";
    li.innerHTML = '<span class="bz-ava"></span><span>Покупатель из Липецка ' + e.text +
      '</span><em>только что</em>';
    list.insertBefore(li, list.firstChild);
    var items = list.children;
    for (var k = 1; k < items.length; k++) {
      var m = items[k].querySelector("em");
      if (m) m.textContent = (k < 2 ? "1 мин" : k + " мин") + " назад";
    }
    while (list.children.length > MAX) list.removeChild(list.lastChild);
  }

  if (list) {
    for (var n = 0; n < MAX; n++) push();
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce) setInterval(push, 2600);
  }

  // Форма заявки: проверка обязательных полей и экран «отправлено».
  var form = document.getElementById("leadForm");
  if (form) {
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var ok = true;
      form.querySelectorAll("input[required]").forEach(function (inp) {
        var bad = !inp.value.trim();
        inp.classList.toggle("is-error", bad);
        if (bad && ok) { inp.focus(); ok = false; }
      });
      if (ok) form.querySelector(".bz-form__done").hidden = false;
    });
  }
})();
