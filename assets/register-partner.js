/* ==========================================================================
   Регистрация партнёра — дополнение от 25.09.2026.

   Отличие от регистрации рекламодателя ровно в двух вещах: физлицо в
   формах регистрации отсутствует, и роль, которую открывает эта форма,
   всегда одна — партнёр по маркетплейсам. Региональное партнёрство здесь
   не выдаётся ни при каком наборе полей, на него уходит отдельный запрос.

   Форма, как и весь прототип, ничего не сохраняет.
   ========================================================================== */

const qs  = (s, r = document) => r.querySelector(s);
const qsa = (s, r = document) => Array.from(r.querySelectorAll(s));

const reg = { orgType: "ООО", manual: false };

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

/* ИНН юрлица — 10 цифр, ИП и самозанятого — 12. Та же проверка, что на
   регистрации рекламодателя: она отсекает ввод до обращения к базе. */
function innDigitsNeeded() {
  return reg.orgType === "ООО" ? 10 : 12;
}

function applyOrgType() {
  const name = qs("[data-reg-name]");
  qs("[data-reg-inn]").placeholder = innDigitsNeeded() === 10
    ? "10 цифр — как у ООО"
    : "12 цифр — как у ИП и самозанятых";
  qs("[data-reg-name-l]").textContent = reg.orgType === "ООО" ? "Название компании" : "Название и ФИО";
  name.value = "";
  name.disabled = true;
  name.placeholder = "Появится после поиска по ИНН — или впишите вручную";
  qs("[data-reg-inn-hint]").hidden = true;
}

/* Демо-триггер отказа тот же, что на регистрации рекламодателя: ИНН из
   одинаковых цифр не находится, дальше ввод ручной и модерация усиленная. */
function checkInn() {
  const input = qs("[data-reg-inn]");
  const hint = qs("[data-reg-inn-hint]");
  const nameField = qs("[data-reg-name]");
  const digits = input.value.replace(/\D/g, "");
  const need = innDigitsNeeded();

  hint.hidden = false;
  hint.classList.remove("is-bad");

  if (digits.length !== need) {
    hint.textContent = `Для «${reg.orgType}» нужно ${need} цифр ИНН — сейчас введено ${digits.length}.`;
    hint.classList.add("is-bad");
    return;
  }

  nameField.disabled = false;

  if (/^(\d)\1+$/.test(digits)) {
    reg.manual = true;
    nameField.value = "";
    nameField.placeholder = "Не нашли — впишите название сами";
    nameField.focus();
    hint.textContent = "По этому ИНН ничего не нашли. Впишите название вручную — реквизиты проверит модератор.";
    hint.classList.add("is-bad");
  } else {
    reg.manual = false;
    nameField.value = reg.orgType === "ООО" ? "ООО «Пример»" : reg.orgType + " Петров И. И.";
    hint.textContent = "Нашли по базе — при желании название можно поправить.";
  }
}

function submitForm() {
  /* Согласий может быть несколько — оферта и обработка персональных
     данных отдельными галочками (решение 30.09). Проверяем каждое. */
  const boxes = Array.from(document.querySelectorAll("[data-reg-consent]"));
  boxes.forEach(cb => cb.closest(".reg__consent").classList.toggle("is-bad", !cb.checked));
  const miss = boxes.find(cb => !cb.checked);
  if (miss) {
    miss.focus();
    return;
  }
  /* Пароль дважды (созвон 30.09); в Ч/Б форме второго поля нет */
  const p1 = qs("[data-reg-pass]"), p2 = qs("[data-reg-pass2]"), perr = qs("[data-reg-pass-err]");
  if (p2) {
    const msg = p1.value.length < 8 ? "Пароль — не короче 8 символов."
      : p1.value !== p2.value ? "Пароли не совпадают — введите ещё раз." : "";
    if (perr) { perr.textContent = msg; perr.hidden = !msg; }
    if (msg) { (p1.value.length < 8 ? p1 : p2).focus(); return; }
  }
  const email = qs("[data-reg-email]").value.trim();
  qs("[data-reg-email-out]").textContent = email || "почту, которую вы указали";
  showStep("email");
}

/* Две вкладки сверху — дизайн-версия, созвон 30.09. Региональный партнёр
   работает только как ООО или ИП: самозанятому с организациями не
   рассчитаться, поэтому эта форма у него пропадает. Заявка регионального
   уходит на проверку, маркетплейсы открываются сразу. В Ч/Б форме вкладок
   нет — функция ничего не делает. */
const PTAB = {
  market: {
    sub: "Регистрация открывает партнёрство по маркетплейсам: вы получаете свои промокоды, раздаёте их и видите начисления. Регистрируются ООО, ИП и самозанятые.",
    note: "Партнёру мы перечисляем вознаграждение, поэтому физлицу регистрация партнёра недоступна.",
    sphere: "mp", submit: "Зарегистрироваться",
    doneH: "Кабинет партнёра открыт",
    doneP: "Вам доступно партнёрство по маркетплейсам: промокоды, начисления и выплаты.",
    linkL: "Где будете раздавать промокоды",
    list: ["Свои промокоды маркетплейсов — раздавать можно сразу после регистрации.",
           "Начисления по переходам и покупкам по вашему коду — в кабинете, по дням.",
           "Выплаты на расчётный счёт ООО, ИП или самозанятого."]
  },
  regional: {
    sub: "Региональный партнёр ведёт свой город: приводит местный бизнес на витрину и получает долю с размещений. Регистрируются ООО и ИП, заявку проверяем вручную.",
    note: "Региональный партнёр работает с организациями, поэтому регистрируются только ООО и ИП.",
    sphere: "Рекламное агентство полного цикла", submit: "Отправить заявку",
    doneH: "Заявка отправлена",
    doneP: "Кабинет уже открыт: пока идёт проверка, в нём доступно партнёрство по маркетплейсам. Когда откроем ваш город, пришлём письмо и инструкции.",
    linkL: "Сайт или соцсети вашей компании",
    list: ["Клиенты вашего города закрепляются за вами — постоянно.",
           "Доля с каждого размещения ваших клиентов, выплата раз в месяц.",
           "Бонусы, которыми можно поощрять клиентов, и материалы для встреч."]
  }
};
function setPartnerTab(id) {
  const t = PTAB[id];
  if (!t || !qs("[data-ptab]")) return;
  qsa("[data-ptab]").forEach(b => {
    const on = b.dataset.ptab === id;
    b.classList.toggle("is-on", on);
    b.setAttribute("aria-selected", on);
  });
  const text = (sel, v) => { const el = qs(sel); if (el) el.textContent = v; };
  text("[data-ptab-sub]", t.sub);
  text("[data-ptab-note]", t.note);
  text("[data-ptab-submit]", t.submit);
  text("[data-ptab-done-h]", t.doneH);
  text("[data-ptab-done-p]", t.doneP);
  text("[data-ptab-link-l]", t.linkL);
  const list = qs("[data-ptab-list]");
  if (list) list.innerHTML = t.list.map(x => "<li>" + x + "</li>").join("");
  const sphere = qs("[data-reg-sphere]");
  if (sphere) sphere.value = t.sphere;
  /* Самозанятый — только у маркетплейсов; выбран был он — переключаем на ООО */
  qsa("[data-ptab-only]").forEach(el => { el.hidden = el.dataset.ptabOnly !== id; });
  const cur = qs("[data-org].is-on");
  if (cur && cur.hidden) qs('[data-org="ООО"]').click();
  const ask = qs("[data-ptab-ask]");
  if (ask) ask.hidden = id === "regional";
}

document.addEventListener("DOMContentLoaded", () => {
  applyOrgType();
  qsa("[data-ptab]").forEach(b => b.onclick = () => setPartnerTab(b.dataset.ptab));
  setPartnerTab(new URLSearchParams(location.search).get("tab") === "regional" ? "regional" : "market");

  qsa("[data-org]").forEach(b => b.onclick = () => {
    qsa("[data-org]").forEach(x => x.classList.remove("is-on"));
    b.classList.add("is-on");
    reg.orgType = b.dataset.org;
    reg.manual = false;
    applyOrgType();
  });

  qs("[data-reg-inn-check]").onclick = checkInn;
  qs("[data-reg-submit]").onclick = submitForm;
  qs("[data-reg-confirm]").onclick = () => {
    qs("[data-reg-manual-note]").hidden = !reg.manual;
    showStep("done");
  };

  const resend = qs("[data-reg-resend]");
  const resendOk = qs("[data-reg-resend-ok]");
  resend.onclick = () => {
    resendOk.hidden = false;
    clearTimeout(resend._t);
    resend._t = setTimeout(() => { resendOk.hidden = true; }, 2400);
  };

  /* Запрос на региональное партнёрство: кнопка уходит, на её месте
     остаётся строка «свяжемся» — повторно отправлять запрос незачем. */
  qs("[data-ask-send]").onclick = () => {
    qs("[data-ask-row]").hidden = true;
    qs("[data-ask-ok]").hidden = false;
  };
});
