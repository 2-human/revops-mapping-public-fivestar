/* review-bootstrap.js — inert-by-default loader.
   Per review-widget FEATURE.md: no ?review=1 → no CSS, no widget module, no
   storage connection. The single allowed artefact on the inert path is the
   floating entry button (inert-entry-button.md), which carries its own inline
   style so no widget CSS loads.
   Asset paths resolve against THIS script's src, not the page URL. */
(function () {
  'use strict';

  var here = (function () {
    var s = document.currentScript;
    if (s && s.src) return s.src.replace(/[^/]*$/, '');
    return '';
  })();

  var on = new URLSearchParams(location.search).get('review') === '1';

  if (!on) {
    var mount = function () {
      if (document.querySelector('.review-toggle-btn')) return;
      var st = document.createElement('style');
      st.textContent =
        '.review-toggle-btn{position:fixed;right:18px;bottom:18px;z-index:2147483000;' +
        'font:600 13px/1 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;' +
        'padding:11px 16px;border-radius:999px;border:1px solid #12263a;background:#12263a;' +
        'color:#fff;cursor:pointer;box-shadow:0 4px 14px rgba(15,23,32,.22);letter-spacing:.01em}' +
        '.review-toggle-btn:hover{background:#1b3550;border-color:#1b3550}';
      document.head.appendChild(st);
      var b = document.createElement('button');
      b.className = 'review-toggle-btn';
      b.type = 'button';
      b.textContent = 'Review this page';
      b.addEventListener('click', function () {
        var u = new URL(location.href);
        u.searchParams.set('review', '1');
        location.href = u.toString();
      });
      document.body.appendChild(b);
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
    else mount();
    return;
  }

  document.documentElement.setAttribute('data-review-mode', 'on');

  /* Version marker on the widget URLs. Without it the dynamically-injected
     CSS/JS sit in the browser's memory cache across reloads — including hard
     reloads — so an edited widget silently keeps running the old code. Bump
     this whenever review-mode.css or review-mode.js changes. */
  var V = '?v=1.0.3';

  var css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = here + 'review-mode.css' + V;
  document.head.appendChild(css);

  var js = document.createElement('script');
  js.src = here + 'review-mode.js' + V;
  js.defer = true;
  document.head.appendChild(js);
})();
