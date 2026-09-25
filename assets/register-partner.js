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

document.addEventListener("DOMContentLoaded", () => {
  applyOrgType();

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
