/* Собирает icons.html — все значки прототипа на одной странице для
   выгрузки в Figma. Значки берутся прямо из кода (assets/app.js,
   lk/assets/lk.js, lk/assets/lk-design.js), поэтому страница не
   расходится с сайтом. Запуск из корня репозитория:
     node tools/icons/build.js */
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "../..");
const read = p => fs.readFileSync(path.join(root, p), "utf8");

const app = read("assets/app.js");
const lk = read("lk/assets/lk.js");
const lkd = read("lk/assets/lk-design.js");
const data = read("assets/data.js");

/* Тело значка без обёртки <svg>: path/rect/circle внутри viewBox 24×24 */
const inner = svg => svg.replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "");
const attr = (svg, name, def) => {
  const m = svg.match(new RegExp(" " + name + '="([^"]*)"'));
  return m ? m[1] : def;
};

/* Пары «ключ: '...'» внутри объекта const NAME = { ... }; */
function block(src, name) {
  const start = src.indexOf("const " + name + " = {");
  if (start < 0) throw new Error("нет объекта " + name);
  const end = src.indexOf("\n};", start);
  return src.slice(start, end);
}
function pairs(src) {
  const out = [];
  const re = /^\s*("?[\w-]+"?)\s*:\s*(nav\()?'([^']*)'\)?/gm;
  let m;
  while ((m = re.exec(src))) out.push({ key: m[1].replace(/"/g, ""), nav: !!m[2], body: m[3] });
  return out;
}

/* Обводка значка: толщина и скругления, как на сайте */
function lineIcon(key, svgOrBody, defaults) {
  const isSvg = svgOrBody.startsWith("<svg");
  const svg = isSvg ? svgOrBody : null;
  return {
    key,
    body: isSvg ? inner(svg) : svgOrBody,
    sw: svg ? attr(svg, "stroke-width", defaults.sw) : defaults.sw,
    cap: svg ? attr(svg, "stroke-linecap", "") : defaults.cap,
    join: svg ? attr(svg, "stroke-linejoin", "") : defaults.join,
    fill: svg ? attr(svg, "fill", "none") : "none",
    stroke: svg ? attr(svg, "stroke", "") : "currentColor"
  };
}

/* --- Названия ниш из data.js --- */
const names = {};
const reCat = /slug:\s*"([\w-]+)",\s*name:\s*"([^"]+)"/g;
let mc;
while ((mc = reCat.exec(data))) {
  if (!names[mc[1]]) names[mc[1]] = mc[2];
  else if (!names[mc[1]].split(" / ").includes(mc[2])) names[mc[1]] += " / " + mc[2];
}

const LABELS = {
  /* сайт */
  search: "Поиск", mic: "Голосовой ввод", pin: "Рядом со мной / гео", chev: "Стрелка вниз",
  share: "Поделиться", close: "Закрыть", eye: "Просмотры", copy: "Скопировать код",
  used: "Использован / галочка", pinFill: "Метка на карте", burger: "Меню", user: "Профиль",
  grid: "Все категории", plus: "Добавить", link: "Ссылка", bag: "Маркетплейсы",
  case: "Для бизнеса", phone: "Телефон", mail: "Почта",
  /* кабинет */
  bell: "Уведомления", tag: "Купоны", archive: "Архив", chart: "Статистика", card: "Оплата",
  store: "Компания", users: "Партнёры", code: "Промокоды", gift: "Бонусы", wallet: "Баланс",
  exit: "Выйти", doc: "Документы", book: "База знаний", coins: "Тариф / монеты",
  clock: "Время", q: "Подсказка «?»", lock: "Заблокировано", eye18: "Показать",
  eyeOff: "Скрыть", ticket: "Билет", cal: "Календарь", cart: "Корзина",
  /* соцсети */
  vk: "ВКонтакте", tg: "Telegram", max: "MAX", instagram: "Instagram", dzen: "Дзен",
  rutube: "RuTube", site: "Сайт", ok: "Одноклассники"
};

/* --- 1. Категории --- */
const catDefaults = { sw: "1.7", cap: "round", join: "round" };
const cats = pairs(block(app, "CAT_PATH")).map(p => {
  const ic = lineIcon(p.key, p.body, catDefaults);
  ic.name = p.key === "18plus" ? "18+" : (names[p.key] || p.key);
  return ic;
});
cats.unshift(Object.assign(lineIcon("grid", '<rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/>', catDefaults), { name: "Без значка (запасной)" }));
cats.push(cats.shift());

/* --- 2. Интерфейс сайта --- */
const appIcons = pairs(block(app, "ICON"));
const ui = appIcons
  .filter(p => p.body.startsWith("<svg") && !p.body.includes("soc-ic"))
  .map(p => Object.assign(lineIcon(p.key, p.body, {}), { name: LABELS[p.key] || p.key }));

/* --- 3. Кабинет: только то, чего нет среди значков сайта --- */
const seen = new Set(ui.map(i => i.body).concat(cats.map(i => i.body)));
const navDefaults = { sw: "1.7", cap: "round", join: "round" };
const lkRaw = pairs(block(lk, "ICON"));
const reAdd = /^ICON\.(\w+)\s*=\s*(nav\()?'([^']*)'/gm;
let ma;
while ((ma = reAdd.exec(lkd))) lkRaw.push({ key: ma[1], nav: !!ma[2], body: ma[3] });
pairs(block(lkd, "POST_PATH")).forEach(p => lkRaw.push({ key: p.key, nav: true, body: p.body, post: true }));
const cabinet = [];
lkRaw.forEach(p => {
  const ic = lineIcon(p.key, p.body, p.post ? { sw: "1.8", cap: "round", join: "round" } : navDefaults);
  if (seen.has(ic.body)) return;
  seen.add(ic.body);
  ic.name = LABELS[p.key] || p.key;
  cabinet.push(ic);
});

/* --- 4. Соцсети: знак на цветном квадрате бренда --- */
const social = [];
appIcons.forEach(p => {
  if (p.body.includes("soc-ic") && p.body.startsWith("<svg")) {
    const color = (p.body.match(/--soc-c:(#[0-9A-Fa-f]+)/) || [])[1];
    const vb = attr(p.body, "viewBox", "0 0 24 24");
    const svg = p.body
      .replace(/ class="soc-ic"/, "")
      .replace(/ style="[^"]*"/, "")
      .replace(/ aria-hidden="true"/, "")
      .replace(/ width="\d+" height="\d+"/, ' width="48" height="48"')
      .replace(/<rect class="soc-ic__bg"/, '<rect fill="' + color + '" rx="' + (vb.split(" ")[2] * 0.28).toFixed(1) + '"')
      .replace(/ class="soc-ic__g"/g, ' fill="#fff"')
      .replace(/ class="soc-ic__s"/g, ' stroke="#fff"');
    social.push({ key: p.key, name: LABELS[p.key] || p.key, raw: svg });
  } else if (p.body.includes("soc-ic--img")) {
    const file = (p.body.match(/src="([^"]+)"/) || [])[1];
    const svg = read(file).trim()
      .replace(/<\?xml[^>]*>\s*/, "")
      .replace(/<svg([^>]*?)\swidth="[^"]*"/, "<svg$1")
      .replace(/<svg([^>]*?)\sheight="[^"]*"/, "<svg$1")
      .replace(/<svg/, '<svg width="48" height="48"');
    social.push({ key: p.key, name: LABELS[p.key] || p.key, raw: svg });
  }
});

const groups = [
  { id: "cats", title: "Категории", note: "Значки ниш из строки категорий: региональные, маркетплейсы и «Для бизнеса».", items: cats },
  { id: "ui", title: "Интерфейс сайта", note: "Шапка, поиск, плашки разделов, карточка купона, контакты компании.", items: ui },
  { id: "lk", title: "Личный кабинет", note: "Меню кабинета, поля форм, пост для соцсетей. Повторы значков сайта убраны.", items: cabinet },
  { id: "soc", title: "Соцсети", note: "Фирменные знаки в цвете бренда.", items: social, brand: true }
];

const tpl = read("tools/icons/template.html");
const out = tpl.replace("/*ICONS*/null", JSON.stringify(groups));
fs.writeFileSync(path.join(root, "icons.html"), out);
console.log("icons.html:", groups.map(g => g.title + " " + g.items.length).join(", "));
