/* ==========================================================================
   Регистрация клиента — ТЗ v7.0 §4.3.1.
   Три экрана вместо трёх страниц: форма → подтверждение почты → готово.
   Как и весь остальной прототип, форма ничего не сохраняет — она
   показывает последовательность и правила, а не собирает данные.
   ========================================================================== */

const qs  = (s, r = document) => r.querySelector(s);
const qsa = (s, r = document) => Array.from(r.querySelectorAll(s));

const reg = { orgType: "ООО", manual: false };

/* Город — из общего справочника публички (ТЗ §3.2.9): те же три активных
   города, что и в остальном прототипе, без отдельного списка на страницу. */
function fillCities() {
  const box = qs("[data-reg-cities]");
  box.innerHTML = ACTIVE_CITIES.map((c, i) =>
    `<button type="button" class="reg__chip${i === 0 ? " is-on" : ""}" data-reg-city="${c.slug}">${c.name}</button>`).join("");
  qsa("[data-reg-city]", box).forEach(b => b.onclick = () => {
    /* Хотя бы один город обязателен */
    if (b.classList.contains("is-on") && qsa("[data-reg-city].is-on", box).length === 1) return;
    b.classList.toggle("is-on");
  });
}

/* Категория — из общего справочника ниш, сгруппирована по разделам.
   18+ в регистрации не предлагаем отдельно: раздел модерируется. */
function fillCategories() {
  const sel = qs("[data-reg-cat]");
  sel.innerHTML = VERTICALS.map(v => `<optgroup label="${v.name}">${
    catsOf(v.slug).filter(c => !c.adult).map(c => `<option value="${c.id}">${c.name}</option>`).join("")
  }</optgroup>`).join("");
}

/* Где обслуживаете клиентов: города и адреса нужны только тем, у кого
   есть точки. Онлайн и «вся Россия» — без адресов (созвон 14.09). */
function initGeo() {
  qsa("[data-geo]").forEach(b => b.onclick = () => {
    qsa("[data-geo]").forEach(x => x.classList.toggle("is-on", x === b));
    qsa("[data-geo-pane]").forEach(p => { p.hidden = p.dataset.geoPane !== b.dataset.geo; });
  });
  qs("[data-reg-addr-add]").onclick = () => {
    const inp = document.createElement("input");
    inp.className = "reg__i";
    inp.placeholder = "Ещё один адрес";
    qs("[data-reg-addrs]").appendChild(inp);
    inp.focus();
  };
}

function showStep(name) {
  const order = ["form", "email", "done"];
  const idx = order.indexOf(name);
  qsa("[data-reg-step]").forEach((li, i) => {
    li.classList.toggle("is-on", i === idx);
    li.classList.toggle("is-done", i < idx);
  });
  qsa("[data-reg-screen]").forEach(s => s.classList.toggle("is-on", s.dataset.regScreen === name));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ИНН физлица (ИП, самозанятый) — 12 цифр, юрлица (ООО) — 10: это не
   декоративная проверка, а то же самое, что делает реальный СБИС до
   любого поиска по базе. */
function innDigitsNeeded() {
  return reg.orgType === "ООО" ? 10 : 12;
}

/* Автозаполнение по ИНН и его отказ — ТЗ §4.3.1 п.3 и открытый вопрос
   REG-01: при ошибке API ввод остаётся ручным, но модерация усиливается.
   Демо-триггер отказа — ИНН из одинаковых цифр (000000000 и т.п.):
   такой ИНН и в реальной проверке не пройдёт, а для показа это простой и
   предсказуемый способ переключиться на второй сценарий. */
/* Что возвращает база по ИНН. В проде это СБИС или ДаДата; здесь —
   правдоподобная заглушка, зависящая от типа организации: у ООО есть КПП,
   у ИП и самозанятого его нет вовсе, и поле остаётся пустым не по ошибке,
   а потому что такого реквизита у них не существует. */
function lookupInn(digits) {
  const ooo = reg.orgType === "ООО";
  return ooo
    ? [{
        name: "ООО «Пример»",
        kpp: "482601001",
        legal: "398050, Липецкая обл, г Липецк, ул. Первомайская, д. 12",
        post: "398050, Липецкая обл, г Липецк, ул. Первомайская, д. 12"
      }, {
        name: "ООО «Пример» — обособленное подразделение",
        kpp: "482643001",
        legal: "399050, Липецкая обл, г Грязи, ул. Советская, д. 4",
        post: "399050, Липецкая обл, г Грязи, ул. Советская, д. 4"
      }]
    : [{
        name: reg.orgType === "ИП" ? "ИП Москвичёв Антон Юрьевич" : "Москвичёв Антон Юрьевич",
        kpp: "",
        legal: "399050, Липецкая обл, г Грязи",
        post: "399050, Липецкая обл, г Грязи"
      }];
}

/* Подставляем выбранную организацию в реквизиты и раскрываем блок. */
function applyOrg(org) {
  qs("[data-reg-req]").hidden = false;
  qs("[data-reg-name]").value = org.name;
  qs("[data-reg-kpp]").value = org.kpp;
  qs("[data-reg-addr-legal]").value = org.legal;
  qs("[data-reg-addr-post]").value = org.post;
  /* КПП есть только у юрлица: у ИП и самозанятого поле не пустое, а
     неприменимое — блокируем, чтобы его не пытались заполнить. */
  const kpp = qs("[data-reg-kpp]");
  kpp.disabled = !org.kpp;
  kpp.placeholder = org.kpp ? "482601001" : "у ИП и самозанятых КПП нет";
  qs("[data-reg-fio]").focus();
}

/* Автозаполнение по ИНН и его отказ — ТЗ §4.3.1 п.3 и открытый вопрос
   REG-01: при ошибке API ввод остаётся ручным, но модерация усиливается.
   Демо-триггер отказа — ИНН из одинаковых цифр. */
function checkInn() {
  const input = qs("[data-reg-inn]");
  const hint = qs("[data-reg-inn-hint]");
  const foundBox = qs("[data-reg-found]");
  const digits = input.value.replace(/\D/g, "");
  const need = innDigitsNeeded();

  hint.hidden = false;
  hint.classList.remove("is-bad");
  foundBox.hidden = true;

  if (digits.length !== need) {
    hint.textContent = `Для «${reg.orgType}» нужно ${need} цифр ИНН — сейчас введено ${digits.length}.`;
    hint.classList.add("is-bad");
    return;
  }

  if (/^(\d)\1+$/.test(digits)) {
    /* База не ответила: реквизиты всё равно открываем, но пустыми —
       иначе регистрация упирается в чужой сбой. */
    reg.manual = true;
    applyOrg({ name: "", kpp: "", legal: "", post: "" });
    qs("[data-reg-name]").focus();
    hint.textContent = "По этому ИНН ничего не нашли. Заполните реквизиты вручную — в этом случае модерация будет усиленной.";
    hint.classList.add("is-bad");
    return;
  }

  reg.manual = false;
  const list = lookupInn(digits);
  hint.textContent = list.length > 1
    ? "Нашли несколько организаций с этим ИНН — выберите свою."
    : "Нашли по базе. Реквизиты подставили, их можно поправить.";

  qs(".reg__found", foundBox).innerHTML = list.map((o, i) => `
    <button type="button" class="reg__found-i" data-reg-pick="${i}">
      <b>${o.name}</b><span>${o.kpp ? "КПП " + o.kpp + " · " : ""}${o.legal}</span>
    </button>`).join("");
  qsa("[data-reg-pick]", foundBox).forEach(b => b.onclick = () => {
    qsa("[data-reg-pick]", foundBox).forEach(x => x.classList.toggle("is-on", x === b));
    applyOrg(list[Number(b.dataset.regPick)]);
  });
  foundBox.hidden = false;

  /* Одна организация — выбирать не из чего, подставляем сразу, но
     карточку показываем: человек должен видеть, что именно взяли. */
  if (list.length === 1) {
    qs("[data-reg-pick]", foundBox).classList.add("is-on");
    applyOrg(list[0]);
  }
}

function submitForm() {
  const consent = qs("[data-reg-consent]");
  const consentLbl = qs(".reg__consent");
  if (!consent.checked) {
    consentLbl.classList.add("is-bad");
    consent.focus();
    return;
  }
  consentLbl.classList.remove("is-bad");
  const email = qs("[data-reg-email]").value.trim();
  qs("[data-reg-email-out]").textContent = email || "почту, которую вы указали";
  showStep("email");
}

function confirmEmail() {
  qs("[data-reg-manual-note]").hidden = !reg.manual;
  showStep("done");
}

document.addEventListener("DOMContentLoaded", () => {
  fillCities();
  fillCategories();
  initGeo();

  qsa("[data-org]").forEach(b => b.onclick = () => {
    qsa("[data-org]").forEach(x => x.classList.remove("is-on"));
    b.classList.add("is-on");
    reg.orgType = b.dataset.org;
    qs("[data-reg-inn]").placeholder = innDigitsNeeded() === 10
      ? "10 цифр — как у ООО"
      : "12 цифр — как у ИП и самозанятых";
    qs("[data-reg-inn-hint]").hidden = true;
    /* Сменили тип — прежняя находка больше не про эту организацию:
       и число цифр ИНН другое, и КПП то появляется, то исчезает. */
    qs("[data-reg-found]").hidden = true;
    qs("[data-reg-req]").hidden = true;
  });

  qs("[data-reg-inn-check]").onclick = checkInn;
  qs("[data-reg-submit]").onclick = submitForm;
  qs("[data-reg-confirm]").onclick = confirmEmail;

  const resend = qs("[data-reg-resend]");
  const resendOk = qs("[data-reg-resend-ok]");
  resend.onclick = () => {
    resendOk.hidden = false;
    clearTimeout(resend._t);
    resend._t = setTimeout(() => { resendOk.hidden = true; }, 2400);
  };
});
