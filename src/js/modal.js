(function () {
  "use strict";

  var modal = document.querySelector(".modal");
  if (!modal) return;

  var inner = modal.querySelector(".modal__inner");
  var card = modal.querySelector(".modal__card");
  var closeBtn = modal.querySelector(".modal__close");
  var form = modal.querySelector(".form");
  var success = modal.querySelector(".modal__card--success");
  var body = document.body;

  var SUCCESS_TIMEOUT = 5000;
  var successTimer = null;

  // Форму открывают все кнопки-призывы: у них общий якорь #contact.
  // Без JS ссылка просто прокрутит к блоку записи.
  var triggers = document.querySelectorAll('a[href="#contact"]');

  var lastFocused = null;
  var isOpen = false;

  var FOCUSABLE =
    'a[href], button:not(:disabled), input:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';

  function open(trigger) {
    if (isOpen) return;
    isOpen = true;
    lastFocused = trigger || document.activeElement;

    modal.hidden = false;
    body.classList.add("is-locked");

    // форсируем reflow, чтобы отработал transition появления
    void modal.offsetWidth;
    modal.classList.add("is-open");

    var first = card.querySelector("input, textarea");
    if (first) first.focus({ preventScroll: true });
  }

  // после отправки форма возвращается в исходное состояние,
  // чтобы следующее открытие начиналось с чистого листа
  function reset() {
    if (successTimer) {
      window.clearTimeout(successTimer);
      successTimer = null;
    }

    modal.classList.remove("is-sent");

    if (success) success.hidden = true;
    if (card) card.hidden = false;

    if (form) {
      form.reset();
      form.querySelectorAll(".field").forEach(function (field) {
        field.classList.remove("is-invalid");
        var error = field.querySelector(".field__error");
        if (error) error.hidden = true;
      });
    }
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;

    modal.classList.remove("is-open");
    body.classList.remove("is-locked");

    window.setTimeout(function () {
      if (!isOpen) {
        modal.hidden = true;
        reset();
      }
    }, 350);

    if (lastFocused && lastFocused.focus) lastFocused.focus({ preventScroll: true });
  }

  triggers.forEach(function (trigger) {
    trigger.addEventListener("click", function (event) {
      event.preventDefault();
      open(trigger);
    });
  });

  modal.querySelectorAll("[data-modal-close]").forEach(function (el) {
    el.addEventListener("click", close);
  });

  document.addEventListener("keydown", function (event) {
    if (!isOpen) return;

    if (event.key === "Escape") {
      close();
      return;
    }

    // фокус не должен уходить за пределы окна
    if (event.key === "Tab") {
      var items = Array.prototype.filter.call(
        inner.querySelectorAll(FOCUSABLE),
        function (el) {
          return el.offsetParent !== null;
        }
      );
      if (!items.length) return;

      var first = items[0];
      var last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  /* ---------- Телефон ----------
     Жёсткой маски нет: код страны может быть любым, а любая
     переподстановка формата ломает удаление символов — символ стирается
     и тут же возвращается маской. Поэтому только отсекаем лишние символы. */
  var phone = form && form.querySelector('input[type="tel"]');

  function sanitizePhone(value) {
    // разрешены цифры, пробелы, скобки и дефисы; плюс — только первым символом
    var cleaned = value.replace(/[^\d+()\-\s]/g, "");
    var hasPlus = /^\s*\+/.test(cleaned);

    cleaned = cleaned.replace(/\+/g, "");
    return (hasPlus ? "+" : "") + cleaned;
  }

  if (phone) {
    phone.addEventListener("input", function () {
      var before = phone.value;
      var cleaned = sanitizePhone(before);
      if (cleaned === before) return;

      // курсор не должен прыгать в конец при правке середины строки
      var caret = phone.selectionStart;
      var removed = before.length - cleaned.length;

      phone.value = cleaned;
      var next = Math.max(0, (caret || 0) - removed);
      phone.setSelectionRange(next, next);
    });
  }

  /* ---------- Валидация ---------- */
  function fieldOf(control) {
    return control.closest(".field");
  }

  function setError(control, message) {
    var field = fieldOf(control);
    if (!field) return;

    field.classList.add("is-invalid");

    var error = field.querySelector(".field__error");
    if (error) {
      if (message) error.textContent = message;
      error.hidden = false;
    }
  }

  function clearError(control) {
    var field = fieldOf(control);
    if (!field) return;

    field.classList.remove("is-invalid");
    var error = field.querySelector(".field__error");
    if (error) error.hidden = true;
  }

  function validate() {
    if (!form) return [];

    var invalid = [];
    var name = form.elements.name;
    var consent = form.elements.consent;

    if (!name.value.trim()) {
      setError(name, "Обязательное поле");
      invalid.push(name);
    } else {
      clearError(name);
    }

    // E.164: от 8 до 15 цифр вместе с кодом страны
    var digits = phone ? phone.value.replace(/\D/g, "") : "";
    if (!digits) {
      setError(phone, "Обязательное поле");
      invalid.push(phone);
    } else if (digits.length < 8 || digits.length > 15) {
      setError(phone, "Проверьте номер телефона");
      invalid.push(phone);
    } else {
      clearError(phone);
    }

    if (!consent.checked) {
      setError(consent);
      invalid.push(consent);
    } else {
      clearError(consent);
    }

    return invalid;
  }

  if (form) {
    // ошибка снимается, как только человек начал исправлять
    form.addEventListener("input", function (event) {
      if (fieldOf(event.target)) clearError(event.target);
    });

    form.addEventListener("change", function (event) {
      if (event.target.type === "checkbox") clearError(event.target);
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var invalid = validate();
      if (invalid.length) {
        invalid[0].focus({ preventScroll: true });
        return;
      }

      // TODO: отправка на бэкенд — пока показываем подтверждение
      if (card) card.hidden = true;
      if (success) success.hidden = false;
      modal.classList.add("is-sent");

      // фокус уходит с уже скрытой кнопки отправки
      if (closeBtn) closeBtn.focus({ preventScroll: true });

      // закроется само, но кнопку «Закрыть» и Esc никто не отменял
      successTimer = window.setTimeout(close, SUCCESS_TIMEOUT);
    });
  }
})();
