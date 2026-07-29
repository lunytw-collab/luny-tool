/*
 * LUNY 首頁輪播功能
 * 更新日期：2026-07-29
 */

(function () {
  var root = document.getElementById('luny-homepage');
  if (!root || root.dataset.carouselReady === 'true') return;
  root.dataset.carouselReady = 'true';

  var hero = root.querySelector('.luny-home-hero');
  var slides = Array.prototype.slice.call(root.querySelectorAll('.luny-home-hero-slide'));
  var dots = Array.prototype.slice.call(root.querySelectorAll('.luny-home-hero-dots button'));
  var prev = root.querySelector('.luny-home-hero-arrow.is-prev');
  var next = root.querySelector('.luny-home-hero-arrow.is-next');
  var current = 0;
  var timer = null;
  var startX = 0;
  var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function show(index, userInitiated) {
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      var active = i === current;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', active ? 'false' : 'true');
    });
    dots.forEach(function (dot, i) {
      var active = i === current;
      dot.classList.toggle('is-active', active);
      if (active) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
    if (userInitiated) restart();
  }

  function stop() { if (timer) window.clearInterval(timer); timer = null; }
  function start() { if (!reducedMotion) timer = window.setInterval(function () { show(current + 1, false); }, 6000); }
  function restart() { stop(); start(); }

  prev.addEventListener('click', function () { show(current - 1, true); });
  next.addEventListener('click', function () { show(current + 1, true); });
  dots.forEach(function (dot) { dot.addEventListener('click', function () { show(Number(dot.dataset.go), true); }); });
  hero.addEventListener('mouseenter', stop);
  hero.addEventListener('mouseleave', start);
  hero.addEventListener('focusin', stop);
  hero.addEventListener('focusout', start);
  hero.addEventListener('touchstart', function (event) { startX = event.changedTouches[0].clientX; }, { passive: true });
  hero.addEventListener('touchend', function (event) {
    var distance = event.changedTouches[0].clientX - startX;
    if (Math.abs(distance) > 48) show(current + (distance < 0 ? 1 : -1), true);
  }, { passive: true });
  start();
}());
