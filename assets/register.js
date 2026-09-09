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
  const sel = qs("[data-reg-city]");
  sel.innerHTML = ACTIVE_CITIES.map(c => `<option value="${c.slug}">${c.name}</option>`).join("");
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

  const notFound = /^(\d)\1+$/.test(digits);
  nameField.disabled = false;

  if (notFound) {
    reg.manual = true;
    nameField.value = "";
    nameField.placeholder = "Не нашли — впишите название сами";
    nameField.focus();
    hint.textContent = "По этому ИНН ничего не нашли. Впишите название вручную — в этом случае модерация будет усиленной.";
    hint.classList.add("is-bad");
  } else {
    reg.manual = false;
    nameField.value = "ООО «Пример»";
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

function confirmEmail() {
  qs("[data-reg-manual-note]").hidden = !reg.manual;
  showStep("done");
}

document.addEventListener("DOMContentLoaded", () => {
  fillCities();

  qsa("[data-org]").forEach(b => b.onclick = () => {
    qsa("[data-org]").forEach(x => x.classList.remove("is-on"));
    b.classList.add("is-on");
    reg.orgType = b.dataset.org;
    qs("[data-reg-inn]").placeholder = innDigitsNeeded() === 10
      ? "10 цифр — как у ООО"
      : "12 цифр — как у ИП и самозанятых";
    qs("[data-reg-inn-hint]").hidden = true;
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
