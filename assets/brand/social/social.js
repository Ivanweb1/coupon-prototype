/* ==========================================================================
   Все купоны — общий скрипт макетов для соцсетей
   ==========================================================================
   Макеты статические, скрипт нужен только чтобы один файл работал как
   шаблон, а не как разовая картинка:
     ?city=Воронежа   — город в родительном падеже (обложки);
     ?cityNom=Воронеж — город в именительном падеже (аватары);
     ?guides=1        — показать безопасные зоны площадки;
     ?bare=1          — убрать обвязку страницы, оставить голые артборды;
     ?variant=light   — вариант макета, если он у формата есть (аватар).

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

  var variant = q.get('variant');
  if (variant) body.classList.add('is-' + variant.replace(/[^a-z0-9-]/gi, ''));
})();
