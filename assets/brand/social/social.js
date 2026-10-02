/* ==========================================================================
   Все купоны — общий скрипт макетов для соцсетей
   ==========================================================================
   Макеты статические, скрипт нужен только чтобы один файл работал как
   шаблон, а не как разовая картинка:
     ?city=Воронежа   — город в родительном падеже (обложки);
     ?cityNom=Воронеж — город в именительном падеже (аватары);
     ?guides=1        — показать безопасные зоны площадки;
     ?bare=1          — убрать обвязку страницы, оставить голые артборды;
     ?variant=light   — вариант макета, если он у формата есть (аватар);
     ?v=2             — второй вариант оформления по всем форматам сразу.

   Подгонки кегля здесь нет намеренно. Заголовок повторяет витрину:
   мера 20ch и перенос по словам, как в .dzl__h1 — длинный город уходит
   на вторую строку, а не ужимает набор.
   ========================================================================== */
(function () {
  var q = new URLSearchParams(location.search);
  var body = document.body;

  var city = q.get('city');
  if (city) {
    document.querySelectorAll('[data-city]').forEach(function (el) {
      el.textContent = city;
    });
  }

  var cityNom = q.get('cityNom');
  if (cityNom) {
    document.querySelectorAll('[data-city-nom]').forEach(function (el) {
      el.textContent = cityNom;
    });
  }

  // Город на аватаре набран в одну строку прописными и у длинных названий
  // вылезает за круг. Кегль ужимается до ширины хорды — переносить нечего,
  // это одно слово.
  document.querySelectorAll('.ava__city').forEach(function (el) {
    var size = 118;
    el.style.fontSize = size + 'px';
    while (size > 44 && el.scrollWidth > 780) {
      size -= 2;
      el.style.fontSize = size + 'px';
    }
  });

  if (q.get('guides')) body.classList.add('is-guides');
  if (q.get('bare')) body.classList.add('is-bare');

  if (q.get('v') === '2') body.classList.add('is-v2');

  var variant = q.get('variant');
  if (variant) body.classList.add('is-' + variant.replace(/[^a-z0-9-]/gi, ''));

  // Подгонка артбордов под окно — только для просмотра.
  // Обложка ВК шире 1900 px и в окно не влезает, из-за чего кажется, что и
  // выгрузить её нельзя. Это не так: плагин рендерит страницу сам, в своей
  // ширине, и размер окна ему безразличен. Но смотреть на макет через
  // горизонтальную прокрутку невозможно, поэтому на странице артборды
  // ужимаются до ширины окна.
  // В ?bare=1 подгонки нет: там артборды нужны в натуральную величину —
  // и плагину, и скрипту рендера, который снимает их по id.
  if (q.get('bare')) return;

  function fit() {
    var room = document.documentElement.clientWidth - 120;
    document.querySelectorAll('.art').forEach(function (el) {
      el.style.zoom = '';
      var w = el.getBoundingClientRect().width;
      if (w > room) el.style.zoom = room / w;
    });
  }
  fit();
  window.addEventListener('resize', fit);
})();
