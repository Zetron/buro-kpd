(function () {
  "use strict";

  var track = document.querySelector(".frameworks__track");
  if (!track) return;

  var prev = document.querySelector('[data-carousel="prev"]');
  var next = document.querySelector('[data-carousel="next"]');
  if (!prev || !next) return;

  // ширина шага = слайд + gap
  function step() {
    var slide = track.querySelector(".slide");
    if (!slide) return track.clientWidth;
    var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return slide.getBoundingClientRect().width + gap;
  }

  function sync() {
    var max = track.scrollWidth - track.clientWidth;
    prev.disabled = track.scrollLeft <= 1;
    next.disabled = track.scrollLeft >= max - 1;
  }

  prev.addEventListener("click", function () {
    track.scrollBy({ left: -step(), behavior: "smooth" });
  });

  next.addEventListener("click", function () {
    track.scrollBy({ left: step(), behavior: "smooth" });
  });

  track.addEventListener("scroll", sync, { passive: true });
  window.addEventListener("resize", sync);

  /* ---------- Перетаскивание мышью ----------
     Тач не трогаем: там нативная прокрутка с инерцией работает лучше. */
  var dragging = false;
  var startX = 0;
  var startScroll = 0;
  var moved = 0;

  track.addEventListener("pointerdown", function (event) {
    if (event.pointerType === "touch" || event.button !== 0) return;

    dragging = true;
    startX = event.clientX;
    startScroll = track.scrollLeft;
    moved = 0;

    track.classList.add("is-dragging");
    try {
      track.setPointerCapture(event.pointerId);
    } catch (e) {
      /* указатель мог стать неактивным — перетаскивание работает и без захвата */
    }
    event.preventDefault();
  });

  track.addEventListener("pointermove", function (event) {
    if (!dragging) return;

    var delta = event.clientX - startX;
    moved = Math.abs(delta);
    track.scrollLeft = startScroll - delta;
  });

  function endDrag(event) {
    if (!dragging) return;
    dragging = false;

    track.classList.remove("is-dragging");
    try {
      if (track.hasPointerCapture(event.pointerId)) {
        track.releasePointerCapture(event.pointerId);
      }
    } catch (e) {
      /* захвата не было */
    }

    // доводим до ближайшего слайда, если действительно тащили
    if (moved > 4) {
      var size = step();
      track.scrollTo({
        left: Math.round(track.scrollLeft / size) * size,
        behavior: "smooth"
      });
    }

    sync();
  }

  track.addEventListener("pointerup", endDrag);
  track.addEventListener("pointercancel", endDrag);

  // браузер иначе начинает своё перетаскивание картинки
  track.addEventListener("dragstart", function (event) {
    event.preventDefault();
  });

  sync();
})();
