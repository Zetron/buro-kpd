(function () {
  "use strict";

  // класс ставит инлайн-скрипт в <head> — он же решает, нужна ли анимация
  if (!document.documentElement.classList.contains("js-reveal")) return;

  var targets = document.querySelectorAll("[data-reveal]");
  if (!targets.length) return;

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("is-revealed");
        // появление одноразовое: при обратном скролле блок не мигает заново
        observer.unobserve(entry.target);
      });
    },
    // блок трогается, когда его верх поднялся на 12% выше нижней кромки экрана
    { rootMargin: "0px 0px -12% 0px", threshold: 0 }
  );

  targets.forEach(function (el) {
    observer.observe(el);
  });
})();
