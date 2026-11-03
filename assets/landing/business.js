/* Лендинг для бизнеса: цифры спроса, подписи карты и форма заявки.
   Живая лента — в business-design.js. */
(function () {
  "use strict";

  // Спрос по области (правки 13.10.2026): запросы «скидки», «промокоды»,
  // «акции» по Липецкой области в Яндекс Вордстате за месяц, сумма × 1,6 —
  // «покупателей уже выбирают»; за неделю — эта цифра / 4. Пока все три
  // запроса не вписаны, на странице остаются прежние 9 800 / 2 300.
  // Сентябрь 2026, Липецкая область, все устройства — сняты с графиков
  // «Динамика» по месяцам (присланы 13.10.2026), точность ±1 тыс.
  var WORDSTAT_LIPETSK = { skidki: 35500, promokody: 78000, akcii: 46000 };
  var ws = WORDSTAT_LIPETSK;
  if (ws.skidki != null && ws.promokody != null && ws.akcii != null) {
    var month = Math.round((ws.skidki + ws.promokody + ws.akcii) * 1.6 / 100) * 100;
    var fmt = function (n) { return n.toLocaleString("ru-RU").replace(/\u00a0|\u202f/g, "\u00a0"); };
    var val = { month: month, week: Math.round(month / 4 / 100) * 100 };
    document.querySelectorAll("[data-demand]").forEach(function (el) {
      el.textContent = fmt(val[el.dataset.demand]);
    });
  }

  // Подписи на карте — координаты из social-kit/build-map.py (холст 1180×600),
  // те же, что на слайде 8 дека v4: [подпись, x, y, вид, подпись слева].
  var MAP = [
    ["Липецк · старт", 568, 224, "home"], ["Москва", 520, 80, "ref", "l"],
    ["Нижний Новгород", 681, 55], ["Воронеж", 556, 266, "", "l"], ["Ростов-на-Дону", 567, 467],
    ["Краснодар", 541, 566], ["Рязань", 573, 133], ["Волгоград", 711, 398], ["Тула", 517, 151, "", "l"]
  ];
  document.querySelectorAll("[data-map]").forEach(function (m) {
    m.insertAdjacentHTML("beforeend", MAP.map(function (c) {
      return '<i class="map__c' + (c[3] ? " map__c--" + c[3] : "") + (c[4] ? " map__c--l" : "") +
        '" style="left:' + (c[1] / 11.8).toFixed(2) + "%;top:" + (c[2] / 6).toFixed(2) + '%"><span>' + c[0] + "</span></i>";
    }).join(""));
  });

})();
