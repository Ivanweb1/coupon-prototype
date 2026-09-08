/* ==========================================================================
   Данные-заглушки для прототипа личных кабинетов.
   Все цифры и названия — рыба. Набор полей отражает решения созвонов
   04.09.2026 и 07.09.2026, а не выдуманную структуру.
   ========================================================================== */

/* Статусы купона. Коля 04.09: «статусы: черновик, опубликован, завершено —
   4-5 статусов». Модерация добавлена пятой: купон — рекламный креатив с
   ЕРИД, без проверки публиковать его нельзя. */
window.LK_STATUSES = {
  draft:      { label: "Черновик" },
  moderation: { label: "На модерации" },
  live:       { label: "Опубликован" },
  done:       { label: "Завершён" },
  rejected:   { label: "Отклонён" }
};

/* Ровно четыре показателя: Коля — «4 показателя всего, будет немного»,
   Виль — не перегружать разделы с аналитикой. Взяты те, что реально
   считаются на публичке, включая переходы на ресурсы компании: их Виль
   назвал ключевой метрикой проекта. */
window.LK_METRICS = [
  { id: "shown",  label: "Показы" },
  { id: "opened", label: "Просмотры" },
  { id: "taken",  label: "Купон забрали" },
  { id: "clicks", label: "Переходы к вам" }
];

window.LK_CITIES  = ["Липецк", "Воронеж", "Тамбов", "Елец"];
window.LK_MARKETS = ["Wildberries", "Ozon", "Яндекс Маркет", "Мегамаркет"];

window.LK_MECHANICS = [
  { id: "percent",   label: "Скидка в процентах",   sample: "−25%" },
  { id: "amount",    label: "Скидка суммой",        sample: "−500 ₽" },
  { id: "twoforone", label: "Два по цене одного",   sample: "2 = 1" },
  { id: "gift",      label: "Подарок к покупке",    sample: "0 ₽" },
  { id: "friend",    label: "Приведи друга",        sample: "−15%" }
];

/* Купоны клиента. kind: region — обычный городской купон, market — купон
   маркетплейса (у него вместо города площадка и артикул). */
window.LK_COUPONS = [
  { id: 1041, title: "Комбо-обед по будням до 16:00", value: "−30%", mech: "percent",
    kind: "region", cat: "Кафе и рестораны", city: "Липецк", status: "live",
    from: "3 сентября", to: "24 сентября", code: "LUNCH30", erid: "2Vt1NJILR",
    shown: 18420, opened: 2140, taken: 486, clicks: 173 },

  { id: 1039, title: "Каждая пятая чашка кофе в подарок", value: "0 ₽", mech: "gift",
    kind: "region", cat: "Кафе и рестораны", city: "Липецк", status: "live",
    from: "1 сентября", to: "30 сентября", code: "FIFTH", erid: "2Vt1NKPQW",
    shown: 12060, opened: 1508, taken: 361, clicks: 96 },

  { id: 1036, title: "Завтраки: два по цене одного", value: "2 = 1", mech: "twoforone",
    kind: "region", cat: "Кафе и рестораны", city: "Воронеж", status: "moderation",
    from: "10 сентября", to: "10 октября", code: "MORNING", erid: "2Vt1NLTRB",
    shown: 0, opened: 0, taken: 0, clicks: 0 },

  { id: 1034, title: "Ужин на двоих со скидкой", value: "−500 ₽", mech: "amount",
    kind: "region", cat: "Кафе и рестораны", city: "Липецк", status: "draft",
    from: "—", to: "—", code: "—", erid: "—",
    shown: 0, opened: 0, taken: 0, clicks: 0 },

  { id: 1031, title: "Набор соусов к заказу от 1 500 ₽", value: "−15%", mech: "percent",
    kind: "market", market: "Wildberries", article: "184 220 933", status: "live",
    from: "28 августа", to: "28 сентября", code: "SAUCE15", erid: "2Vt1NMXZC",
    shown: 9310, opened: 1104, taken: 298, clicks: 214 },

  { id: 1028, title: "Кофе в зёрнах: скидка на первый заказ", value: "−20%", mech: "percent",
    kind: "market", market: "Ozon", article: "902 118 447", status: "rejected",
    from: "—", to: "—", code: "—", erid: "—",
    reject: "На изображении не читается величина скидки",
    shown: 0, opened: 0, taken: 0, clicks: 0 },

  { id: 1019, title: "Бизнес-ланч в августе", value: "−25%", mech: "percent",
    kind: "region", cat: "Кафе и рестораны", city: "Липецк", status: "done",
    from: "1 августа", to: "31 августа", code: "AUG25", erid: "2Vt1NGHJK",
    shown: 24180, opened: 3016, taken: 702, clicks: 241 },

  { id: 1012, title: "Кофе с собой дешевле по утрам", value: "−100 ₽", mech: "amount",
    kind: "region", cat: "Кафе и рестораны", city: "Липецк", status: "done",
    from: "15 июля", to: "15 августа", code: "TOGO", erid: "2Vt1NFDSA",
    shown: 16740, opened: 1962, taken: 415, clicks: 118 }
];

/* Клиенты партнёра — юрлица, которых он привёл. Публиковать купоны партнёр
   не может (решение 04.09), поэтому здесь только их показатели. */
window.LK_CLIENTS = [
  { id: 1, name: "Кофейня «Пример»",   city: "Липецк",  since: "12 июля",    coupons: 6, status: "active", paid: 22000, fee: 4400 },
  { id: 2, name: "Сервис «Компания»",  city: "Липецк",  since: "24 июля",    coupons: 3, status: "active", paid: 14000, fee: 2800 },
  { id: 3, name: "Студия «Название»",  city: "Воронеж", since: "2 августа",  coupons: 4, status: "active", paid: 18000, fee: 3600 },
  { id: 4, name: "Клиника «Бренд»",    city: "Липецк",  since: "9 августа",  coupons: 2, status: "trial",  paid: 0,     fee: 0 },
  { id: 5, name: "Автомойка «Рыба»",   city: "Елец",    since: "21 августа", coupons: 1, status: "trial",  paid: 0,     fee: 0 },
  { id: 6, name: "Магазин «Пример-2»", city: "Липецк",  since: "3 июня",     coupons: 0, status: "paused", paid: 8000,  fee: 1600 }
];

window.LK_CLIENT_STATUSES = {
  active: "Работает",
  trial:  "Пробный период",
  paused: "Приостановлен"
};

/* Коды партнёра на маркетплейсах: «привязаны маркетплейсы, работа по кодам» */
window.LK_CODES = [
  { code: "PRTN-LIP-01", market: "Wildberries",   seller: "Кофейня «Пример»",   used: 148, income: 7400, status: "active" },
  { code: "PRTN-LIP-02", market: "Ozon",          seller: "Магазин «Пример-2»", used: 63,  income: 3150, status: "active" },
  { code: "PRTN-VRN-01", market: "Яндекс Маркет", seller: "Студия «Название»",  used: 27,  income: 1350, status: "active" },
  { code: "PRTN-LIP-03", market: "Мегамаркет",    seller: "—",                  used: 0,   income: 0,    status: "free" }
];

/* Бонусы, которые партнёр раздаёт своим клиентам. На созвоне 04.09 это
   названо «раздача бонусов и их отправка своим клиентам»; рабочее имя
   механики в структуре — «От души брат». Набор видов бонуса — рыба,
   на созвонах его не проговаривали. */
window.LK_BONUS_KINDS = [
  "Неделя публикаций в подарок",
  "Скидка 20% на пакет купонов",
  "Продление пробного периода"
];

window.LK_BONUSES = [
  { id: "B-114", to: "Кофейня «Пример»",   kind: "Неделя публикаций в подарок", sent: "2 сентября",  status: "used" },
  { id: "B-112", to: "Студия «Название»",  kind: "Скидка 20% на пакет купонов", sent: "29 августа",  status: "sent" },
  { id: "B-109", to: "Клиника «Бренд»",    kind: "Продление пробного периода",  sent: "22 августа",  status: "used" },
  { id: "B-104", to: "Автомойка «Рыба»",   kind: "Неделя публикаций в подарок", sent: "15 августа",  status: "expired" }
];

window.LK_BONUS_STATUSES = { sent: "Отправлен", used: "Использован", expired: "Истёк" };

/* Отчёты и выплаты партнёра — «со статьями по расходам и приходу» */
window.LK_PAYOUTS = [
  { period: "Сентябрь 2026", income: 5200,  bonusCost: 500,  total: 4700,  status: "pending", date: "к выплате 5 октября" },
  { period: "Август 2026",   income: 12400, bonusCost: 2000, total: 10400, status: "paid",    date: "выплачено 5 сентября" },
  { period: "Июль 2026",     income: 9800,  bonusCost: 1500, total: 8300,  status: "paid",    date: "выплачено 5 августа" },
  { period: "Июнь 2026",     income: 4600,  bonusCost: 0,    total: 4600,  status: "paid",    date: "выплачено 5 июля" }
];

/* Биллинг клиента */
window.LK_BILLING = [
  { date: "1 сентября", doc: "Счёт № 2209", sum: 6000, what: "Пакет публикаций, сентябрь", status: "paid" },
  { date: "1 августа",  doc: "Счёт № 2141", sum: 6000, what: "Пакет публикаций, август",   status: "paid" },
  { date: "18 июля",    doc: "Счёт № 2098", sum: 2000, what: "Дополнительные публикации",  status: "paid" },
  { date: "1 июля",     doc: "Счёт № 2044", sum: 6000, what: "Пакет публикаций, июль",     status: "paid" }
];

window.LK_NOTIFICATIONS = {
  client: [
    { when: "сегодня, 09:14", unread: true,  text: "Купон «Комбо-обед по будням до 16:00» прошёл модерацию и опубликован." },
    { when: "вчера, 18:02",   unread: true,  text: "Купон «Кофе в зёрнах» отклонён: на изображении не читается величина скидки." },
    { when: "6 сентября",     unread: false, text: "Купон «Бизнес-ланч в августе» завершён — срок действия закончился." },
    { when: "1 сентября",     unread: false, text: "Счёт № 2209 оплачен, пакет публикаций продлён до 1 октября." }
  ],
  partner: [
    { when: "сегодня, 11:40", unread: true,  text: "Новый клиент по вашей ссылке: Автомойка «Рыба», Елец." },
    { when: "5 сентября",     unread: false, text: "Выплата за август — 10 400 ₽ — отправлена на реквизиты." },
    { when: "2 сентября",     unread: false, text: "Бонус «Неделя публикаций в подарок» использован Кофейней «Пример»." },
    { when: "29 августа",     unread: false, text: "Код PRTN-VRN-01 привязан к Студии «Название»." }
  ]
};
