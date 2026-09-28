/* ==========================================================================
   Табы инфостраниц
   ==========================================================================
   Полоса разделов на «Сервисе», «Вопросах и ответах» и «Соцсетях» была
   якорями: клик пролистывал страницу вниз, и человек терял из виду, что
   разделов вообще три. Теперь это табы — открыт один раздел, остальные
   скрыты.

   Сделано поверх обычных ссылок, а не кнопок: без скрипта полоса
   продолжает работать якорями, и ни одна ссылка подвала не ломается.
   Адрес раздела остаётся прежним — service.html#pricing открывает вкладку
   «Тарифы», а не прокручивает к ней.

   Скрываются только те секции, на которые ссылается сама полоса. Хвост
   страницы (карточка «Не нашли ответ?», блок для бизнеса на соцсетях)
   виден всегда — он общий для всех разделов.
   ========================================================================== */
(function () {
  var rows = document.querySelectorAll("[data-tabs]");

  Array.prototype.forEach.call(rows, function (row, rowIndex) {
    var tabs = Array.prototype.slice.call(row.querySelectorAll('a[href^="#"]'));
    var panels = tabs.map(function (tab) {
      return document.getElementById(tab.getAttribute("href").slice(1));
    });

    /* Если хоть одной секции нет — оставляем полосу обычными якорями:
       половина табов, ведущих в пустоту, хуже отсутствия табов */
    if (!tabs.length || panels.indexOf(null) !== -1) return;

    row.setAttribute("role", "tablist");
    tabs.forEach(function (tab, i) {
      var id = panels[i].id;
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-controls", id);
      tab.id = "tab-" + rowIndex + "-" + id;
      panels[i].setAttribute("role", "tabpanel");
      panels[i].setAttribute("aria-labelledby", tab.id);
      panels[i].setAttribute("tabindex", "0");
    });

    function open(index, focus) {
      tabs.forEach(function (tab, i) {
        var on = i === index;
        tab.setAttribute("aria-selected", on ? "true" : "false");
        /* Из табуляции выпадают невыбранные табы: по стрелкам ходят
           внутри полосы, табулятором — сразу в содержимое раздела */
        tab.setAttribute("tabindex", on ? "0" : "-1");
        panels[i].hidden = !on;
      });
      if (focus) tabs[index].focus();
    }

    function indexOfHash() {
      var hash = location.hash.slice(1);
      if (!hash) return -1;
      return panels.findIndex(function (p) { return p.id === hash; });
    }

    row.addEventListener("click", function (e) {
      var tab = e.target.closest('a[href^="#"]');
      var i = tabs.indexOf(tab);
      if (i === -1) return;
      e.preventDefault();
      open(i);
      /* Адрес раздела остаётся в строке браузера — ссылкой на вкладку
         можно поделиться, — но страница при этом никуда не прыгает */
      history.replaceState(null, "", tabs[i].getAttribute("href"));
    });

    row.addEventListener("keydown", function (e) {
      var i = tabs.indexOf(document.activeElement);
      if (i === -1) return;
      var next = null;
      if (e.key === "ArrowRight") next = (i + 1) % tabs.length;
      else if (e.key === "ArrowLeft") next = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = tabs.length - 1;
      if (next === null) return;
      e.preventDefault();
      open(next, true);
    });

    /* Приход по ссылке из подвала: открываем нужную вкладку и подводим к
       полосе, а не к середине раздела — иначе непонятно, что это вкладки */
    var fromHash = indexOfHash();
    open(fromHash === -1 ? 0 : fromHash);
    if (fromHash !== -1) {
      row.scrollIntoView({ block: "center" });
    }

    /* Ссылка подвала на этой же странице меняет только хеш */
    window.addEventListener("hashchange", function () {
      var i = indexOfHash();
      if (i !== -1) { open(i); row.scrollIntoView({ block: "center" }); }
    });
  });
})();
