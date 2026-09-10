import "../styles/main.scss";
import "./carousel.js";
import "./faq.js";
import "./modal.js";

(function () {
  "use strict";

  var burger = document.querySelector(".burger");
  var nav = document.querySelector(".nav");
  var backdrop = document.querySelector(".nav-backdrop");
  var header = document.querySelector(".header");
  var body = document.body;

  if (!burger || !nav || !backdrop) return;

  var isOpen = false;

  function openMenu() {
    isOpen = true;
    backdrop.hidden = false;
    // форсируем reflow, чтобы отработал transition подложки
    void backdrop.offsetWidth;

    header.classList.add("is-menu-open");
    nav.classList.add("is-open");
    backdrop.classList.add("is-visible");
    burger.classList.add("is-active");
    burger.setAttribute("aria-expanded", "true");
    burger.setAttribute("aria-label", "Закрыть меню");
    body.classList.add("is-locked");
  }

  function closeMenu() {
    if (!isOpen) return;
    isOpen = false;

    nav.classList.remove("is-open");
    backdrop.classList.remove("is-visible");
    burger.classList.remove("is-active");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Открыть меню");
    body.classList.remove("is-locked");

    // прячем подложку после затухания
    window.setTimeout(function () {
      if (!isOpen) {
        backdrop.hidden = true;
        header.classList.remove("is-menu-open");
      }
    }, 500);
  }

  burger.addEventListener("click", function () {
    isOpen ? closeMenu() : openMenu();
  });

  backdrop.addEventListener("click", closeMenu);

  nav.addEventListener("click", function (event) {
    if (event.target.closest("a")) closeMenu();
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeMenu();
  });

  // при переходе на десктоп меню должно закрываться
  var desktop = window.matchMedia("(min-width: 1025px)");
  var onChange = function (event) {
    if (event.matches) closeMenu();
  };

  if (desktop.addEventListener) {
    desktop.addEventListener("change", onChange);
  } else {
    desktop.addListener(onChange);
  }
})();
