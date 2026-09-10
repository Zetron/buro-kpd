(function () {
  "use strict";

  var items = Array.prototype.slice.call(
    document.querySelectorAll(".faq__item")
  );
  if (!items.length) return;

  var DURATION = 340;
  var EASING = "cubic-bezier(0.22, 1, 0.36, 1)";
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  // Без JS эксклюзивность даёт атрибут name; с JS ведём её сами,
  // иначе браузер закрывает соседа мгновенно и рвёт анимацию.
  items.forEach(function (item) {
    item.removeAttribute("name");
  });

  function bodyOf(item) {
    return item.querySelector(".faq__body");
  }

  function stopRunning(el) {
    if (el.getAnimations) {
      el.getAnimations().forEach(function (anim) {
        anim.cancel();
      });
    }
  }

  /* Возвращает промис: он отклоняется, если анимацию прервали новым кликом.
     Через onfinish это не отследить — cancel() вызывает oncancel, и состояние
     осталось бы висеть на полпути. */
  function slide(item, opening) {
    var el = bodyOf(item);
    if (!el) return Promise.resolve();

    stopRunning(el);
    el.style.overflow = "hidden";

    // padding-top анимируем вместе с высотой: при box-sizing: border-box
    // height: 0 упирается в падинг, и схлопывание застревает на нём
    var full = el.scrollHeight;
    var pad = getComputedStyle(el).paddingTop;

    var collapsed = { height: "0px", paddingTop: "0px", opacity: 0 };
    var expanded = { height: full + "px", paddingTop: pad, opacity: 1 };

    var anim = el.animate(opening ? [collapsed, expanded] : [expanded, collapsed], {
      duration: DURATION,
      easing: EASING,
      // при закрытии удерживаем нулевую высоту до снятия open,
      // иначе в последнем кадре блок успевает мигнуть на полную высоту
      fill: opening ? "none" : "forwards"
    });

    return anim.finished.then(function () {
      if (opening) el.style.overflow = "";
      return anim;
    });
  }

  function open(item) {
    item.classList.remove("is-closing");
    item.open = true;

    if (reduced.matches) return;
    slide(item, true).catch(function () {
      /* анимацию прервали новым кликом */
    });
  }

  function close(item) {
    if (reduced.matches) {
      item.open = false;
      return;
    }

    // класс переключает иконку сразу, не дожидаясь конца анимации
    item.classList.add("is-closing");
    slide(item, false).then(
      function (anim) {
        item.open = false;
        item.classList.remove("is-closing");

        // снимаем удержание уже после того, как контент скрыт
        anim.cancel();
        var el = bodyOf(item);
        if (el) el.style.overflow = "";
      },
      function () {
        /* анимацию прервали — состояние выставит новое действие */
      }
    );
  }

  items.forEach(function (item) {
    var summary = item.querySelector("summary");
    if (!summary) return;

    summary.addEventListener("click", function (event) {
      event.preventDefault();

      if (item.open && !item.classList.contains("is-closing")) {
        close(item);
        return;
      }

      items.forEach(function (other) {
        if (other !== item && other.open) close(other);
      });

      open(item);
    });
  });
})();
