/* review-mode.js — light cut, localStorage adapter.
   JS-isolation contract (js-isolation.md): whole body wrapped in one IIFE; the
   only global is window.__reviewFivestar.
   TDZ contract (FEATURE.md §"Lessons baked into composition"): every module-level
   const is declared first; the cfg guard and init() are the FINAL statements. */
(function () {
  'use strict';

  var cfg = window.FIVESTAR_CONTACT_CONFIG;

  var L = (cfg && cfg.REVIEW_LABELS) || {};
  var ANCHOR_TAGS = ['h1','h2','h3','h4','h5','h6','p','li','td','th','caption','dt','dd','summary','a','code'];
  var NEVER_ANCHOR = new Set([
    'input','select','textarea','option','optgroup','datalist','fieldset','legend',
    'script','style','template','noscript','meta','link','title','head','html','body',
    'svg','path','circle','rect','ellipse','polygon','polyline','line','g','use','defs','symbol','marker',
    'iframe','embed','object','param',
    'br','hr','img','video','audio','source','track','picture','col','colgroup'
  ]);

  var state = {
    cfg: cfg, comments: {}, counters: Object.create(null),
    pageSlug: 'hub', who: '', editing: null, sidebarOpen: true
  };

  /* ---------- tiny helpers ---------- */
  function el(tag, cls, txt) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (txt != null) n.textContent = txt;
    return n;
  }
  function plural(n) {
    var t = n === 1 ? (L.countOne || '{n} comment') : (L.countMany || '{n} comments');
    return t.replace('{n}', n);
  }
  function toast(msg) {
    var t = el('div', 'review-toast', msg);
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 1900);
  }
  function uid() {
    return 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  /* ---------- storage adapter ---------- */
  var KEY = (cfg && cfg.STORAGE_KEY) || 'review_comments';
  function load() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { return {}; }
  }
  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(state.comments)); }
    catch (e) { toast('Could not save locally'); }
  }

  /* ---------- anchoring ---------- */
  function hasDirectText(node) {
    for (var i = 0; i < node.childNodes.length; i++) {
      var c = node.childNodes[i];
      if (c.nodeType === Node.TEXT_NODE && c.textContent.trim().length >= 2) return true;
    }
    return false;
  }
  function isInSiteChrome(node) { return !!node.closest('nav, header[role="banner"], footer'); }
  function isInWidget(node) { return !!node.closest('.review-banner,.review-sidebar,.review-modal,.review-toast,.review-pill,.review-toggle'); }

  function effectiveTags() {
    return ANCHOR_TAGS.concat((cfg && cfg.ANCHOR_TAGS_EXTRA) || []);
  }

  function tryAnchor(node) {
    if (!node || node.nodeType !== Node.ELEMENT_NODE) return false;
    if (isInWidget(node)) return false;
    if (node.hasAttribute('data-comment-id')) return false;
    if (node.hasAttribute('data-review-skip')) return false;

    var tag = node.tagName.toLowerCase();
    if (NEVER_ANCHOR.has(tag)) return false;

    var anchorEmpty = (cfg && cfg.anchorEmpty) || [];
    var emptyOK = anchorEmpty.indexOf(tag) !== -1 && (node.textContent || '').trim().length <= 1;

    var tags = effectiveTags();
    var matches = tags.indexOf(tag) !== -1;
    var optedIn = node.hasAttribute('data-comment-target');
    if (!matches && !optedIn) return false;
    if ((node.textContent || '').trim().length < 2 && !emptyOK) return false;
    if (!hasDirectText(node) && !emptyOK && !optedIn) return false;

    if (isInSiteChrome(node) && !(cfg && cfg.chromeAnchored)) return false;

    state.counters[tag] = (state.counters[tag] || 0) + 1;
    node.setAttribute('data-comment-id', state.pageSlug + '-' + tag + '-' + state.counters[tag]);
    return true;
  }

  function anchorAll(root) {
    var scope = root || document.querySelector('main') || document.body;
    var all = scope.querySelectorAll('*');
    for (var i = 0; i < all.length; i++) tryAnchor(all[i]);
  }

  /* ---------- pill (single shared element, hover deepest) ---------- */
  var pill = null, pillTarget = null;
  function ensurePill() {
    if (pill) return pill;
    pill = el('button', 'review-pill', '+ comment');
    pill.type = 'button';
    pill.addEventListener('click', function (e) {
      e.preventDefault(); e.stopPropagation();
      if (pillTarget) openComposer(pillTarget);
    });
    document.body.appendChild(pill);
    return pill;
  }
  function showPillFor(node) {
    ensurePill();
    if (pillTarget && pillTarget !== node) pillTarget.classList.remove('rv-hover');
    pillTarget = node;
    node.classList.add('rv-hover');
    var r = node.getBoundingClientRect();
    pill.style.top = (window.scrollY + r.top - 12) + 'px';
    pill.style.left = (window.scrollX + r.left) + 'px';
    pill.classList.add('show');
  }
  function hidePill() {
    if (pillTarget) pillTarget.classList.remove('rv-hover');
    pillTarget = null;
    if (pill) pill.classList.remove('show');
  }

  /* ---------- status indicators ---------- */
  function paint() {
    document.querySelectorAll('[data-comment-id]').forEach(function (node) {
      node.classList.remove('has-comment', 'has-applied-comment');
      var d = node.querySelector(':scope > .rv-dots');
      if (d) d.remove();

      var id = node.getAttribute('data-comment-id');
      var mine = Object.keys(state.comments)
        .map(function (k) { return state.comments[k]; })
        .filter(function (c) { return c.anchor === id && c.status !== 'archived'; });
      if (!mine.length) return;

      var open = mine.filter(function (c) { return c.status === 'pending'; }).length;
      node.classList.add(open ? 'has-comment' : 'has-applied-comment');

      var dots = el('span', 'rv-dots');
      mine.forEach(function (c) { dots.appendChild(el('i', c.status === 'pending' ? 'open' : 'done')); });
      node.appendChild(dots);
    });
  }

  /* ---------- composer modal ---------- */
  function openComposer(node, existing) {
    var anchorId = existing ? existing.anchor : node.getAttribute('data-comment-id');
    var overlay = el('div', 'review-modal');
    var box = el('div', 'box');

    box.appendChild(el('h4', null, existing ? (L.edit || 'Edit') : (L.add || 'Add comment')));
    var sel = el('p', 'sel', (L.selected || 'Selected element') + ': ' +
      (node ? (node.textContent || '').trim().slice(0, 120) : anchorId));
    box.appendChild(sel);

    box.appendChild(el('label', null, L.placeholder || 'Comment'));
    var ta = el('textarea'); ta.rows = 4; ta.value = existing ? existing.comment : '';
    box.appendChild(ta);

    box.appendChild(el('label', null, L.replacement || 'Suggested replacement (optional)'));
    var rp = el('textarea'); rp.rows = 2; rp.value = existing ? (existing.replacement || '') : '';
    box.appendChild(rp);

    var foot = el('div', 'foot');
    var cancel = el('button', 'review-btn', L.cancel || 'Cancel');
    cancel.type = 'button';
    cancel.addEventListener('click', function () { overlay.remove(); });
    var save = el('button', 'review-btn primary', L.save || 'Save');
    save.type = 'button';
    save.addEventListener('click', function () {
      var text = ta.value.trim();
      if (!text) { ta.focus(); return; }
      if (!state.who) {
        var n = window.prompt(L.namePrompt || 'Your name');
        state.who = (n && n.trim()) || 'Reviewer';
        try { localStorage.setItem(KEY + '_who', state.who); } catch (e) {}
        var w = document.querySelector('.review-banner .who');
        if (w) w.textContent = state.who;
      }
      if (existing) {
        existing.comment = text;
        existing.replacement = rp.value.trim();
        existing.editedAt = new Date().toISOString();
      } else {
        var id = uid();
        state.comments[id] = {
          id: id, anchor: anchorId, page: state.pageSlug,
          comment: text, replacement: rp.value.trim(),
          status: 'pending', author: state.who,
          createdAt: new Date().toISOString()
        };
      }
      persist(); render(); paint();
      overlay.remove();
      toast(existing ? 'Comment updated' : 'Comment saved');
    });
    foot.appendChild(cancel); foot.appendChild(save);
    box.appendChild(foot);

    overlay.appendChild(box);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) overlay.remove(); });
    document.body.appendChild(overlay);
    ta.focus();
  }

  /* ---------- sidebar ---------- */
  var sidebar = null;
  function render() {
    if (!sidebar) return;
    var list = sidebar.querySelector('.list');
    var countEl = sidebar.querySelector('.count');
    list.innerHTML = '';

    var rows = Object.keys(state.comments).map(function (k) { return state.comments[k]; })
      .filter(function (c) { return c.page === state.pageSlug; })
      .sort(function (a, b) { return (a.createdAt || '').localeCompare(b.createdAt || ''); });

    countEl.textContent = plural(rows.filter(function (c) { return c.status !== 'archived'; }).length);

    if (!rows.length) {
      list.appendChild(el('div', 'empty', L.empty || 'No comments yet.'));
      return;
    }

    rows.forEach(function (c) {
      var row = el('div', 'review-row ' + (c.status === 'applied' ? 'applied' : c.status === 'archived' ? 'archived' : ''));
      var meta = el('div', 'meta');
      var statusLabel = c.status === 'applied' ? (L.statusApplied || 'Applied')
        : c.status === 'archived' ? (L.statusArchived || 'Archived')
        : (L.statusPending || 'Open');
      meta.appendChild(el('span', null, (c.author || 'Reviewer') + ' · ' + statusLabel));
      var a = el('span', 'anchor', c.anchor);
      a.addEventListener('click', function () { spotlight(c.anchor); });
      meta.appendChild(a);
      row.appendChild(meta);
      row.appendChild(el('p', 'text', c.comment));
      if (c.replacement) row.appendChild(el('p', 'repl', '→ ' + c.replacement));

      var acts = el('div', 'actions');
      function btn(cls, label, fn) {
        var b = el('button', 'review-btn ' + cls, label);
        b.type = 'button';
        b.addEventListener('click', fn);
        acts.appendChild(b);
      }
      if (c.status === 'pending') {
        btn('apply-btn', L.apply || 'Apply', function () { c.status = 'applied'; persist(); render(); paint(); });
        btn('edit-btn', L.edit || 'Edit', function () {
          openComposer(document.querySelector('[data-comment-id="' + c.anchor + '"]'), c);
        });
        btn('archive-btn', L.archive || 'Archive', function () { c.status = 'archived'; persist(); render(); paint(); });
      } else {
        btn('restore-btn', L.restore || 'Restore', function () { c.status = 'pending'; persist(); render(); paint(); });
      }
      btn('del-btn', L.del || 'Delete', function () {
        delete state.comments[c.id]; persist(); render(); paint();
      });
      row.appendChild(acts);
      list.appendChild(row);
    });
  }

  function spotlight(anchorId) {
    var node = document.querySelector('[data-comment-id="' + anchorId + '"]');
    if (!node) { toast('That element is on another view'); return; }
    var view = node.closest('.view');
    if (view && !view.classList.contains('active')) {
      var key = view.id.replace('v-', '');
      var link = document.querySelector('#nav a[href="#' + key + '"]');
      if (link) link.click();
    }
    node.scrollIntoView({ behavior: 'smooth', block: 'center' });
    node.classList.add('rv-spotlight');
    setTimeout(function () { node.classList.remove('rv-spotlight'); }, 2400);
  }

  /* ---------- chrome ---------- */
  function buildChrome() {
    var banner = el('div', 'review-banner');
    banner.appendChild(el('span', 'title', L.bannerTitle || 'Review mode'));
    banner.appendChild(el('span', 'hint', L.bannerHint || ''));
    banner.appendChild(el('span', 'spacer'));
    banner.appendChild(el('span', 'who', state.who || ''));
    var exit = el('button', 'review-btn', L.exit || 'Exit review');
    exit.type = 'button';
    exit.addEventListener('click', function () {
      var u = new URL(location.href);
      u.searchParams.delete('review');
      location.href = u.toString();
    });
    banner.appendChild(exit);
    document.body.appendChild(banner);

    sidebar = el('aside', 'review-sidebar');
    var head = el('div', 'head');
    head.appendChild(el('h4', null, L.sidebarTitle || 'Comments'));
    head.appendChild(el('span', 'count', ''));
    sidebar.appendChild(head);
    sidebar.appendChild(el('div', 'list'));
    document.body.appendChild(sidebar);

    var toggle = el('button', 'review-toggle', L.sidebarTitle || 'Comments');
    toggle.type = 'button';
    toggle.addEventListener('click', function () {
      state.sidebarOpen = !state.sidebarOpen;
      sidebar.classList.toggle('hidden', !state.sidebarOpen);
    });
    document.body.appendChild(toggle);

    /* One source of truth for the breakpoint. The CSS hides .review-toggle at
       >=1280px, so if JS ever hid the sidebar at a different threshold there
       would be a width at which the sidebar is closed and nothing can reopen
       it. Binding both to the same media query makes that impossible. */
    var wide = window.matchMedia('(min-width: 1280px)');
    var applyWidth = function (m) {
      state.sidebarOpen = m.matches;
      sidebar.classList.toggle('hidden', !m.matches);
    };
    applyWidth(wide);
    if (wide.addEventListener) wide.addEventListener('change', applyWidth);
    else wide.addListener(applyWidth);
  }

  /* ---------- init ---------- */
  function init() {
    try { state.who = localStorage.getItem(KEY + '_who') || ''; } catch (e) {}
    state.comments = load();

    buildChrome();
    anchorAll();
    render();
    paint();

    document.addEventListener('mouseover', function (e) {
      var node = e.target.closest ? e.target.closest('[data-comment-id]') : null;
      if (node && !isInWidget(node)) showPillFor(node);
    });
    document.addEventListener('mouseout', function (e) {
      if (!e.relatedTarget || (!e.relatedTarget.closest('[data-comment-id]') && !e.relatedTarget.closest('.review-pill'))) hidePill();
    });
    document.addEventListener('click', function (e) {
      if (isInWidget(e.target)) return;
      /* Interactive controls keep working. Hijacking every click on an anchored
         element breaks the page in review mode: accordions won't open and links
         won't follow. For a control, the hover pill is the comment affordance;
         for everything else, a click is a comment. */
      var control = e.target.closest ? e.target.closest('a[href], button, summary, [role="button"]') : null;
      if (control && !isInWidget(control)) return;
      var node = e.target.closest ? e.target.closest('[data-comment-id]') : null;
      if (node) { e.preventDefault(); openComposer(node); }
    });

    /* Re-anchor + repaint when the SPA switches view or a panel expands.
       paint() itself mutates the DOM (it writes .rv-dots), so an unguarded
       observer re-triggers itself on its own output and spins forever the
       moment a single comment exists. Disconnect around the work and discard
       the records it generated. */
    var target = document.querySelector('main') || document.body;
    var opts = { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'hidden'] };
    var obs = new MutationObserver(function () {
      obs.disconnect();
      anchorAll();
      paint();
      obs.takeRecords();
      obs.observe(target, opts);
    });
    obs.observe(target, opts);

    window.__reviewFivestar = { state: state, render: render, paint: paint, anchorAll: anchorAll };
  }

  /* cfg guard + init LAST — every const above has executed by this point. */
  if (!cfg) {
    console.warn('[review] FIVESTAR_CONTACT_CONFIG missing — widget not started.');
    return;
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
