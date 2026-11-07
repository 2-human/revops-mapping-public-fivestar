/* Personal sign-in gate for the hub (library/features/auth-gate/key-gated-bundle.md and email-link-sign-in.md,
 * feature_version 1.2.1).
 *
 * gate.config.json holds the one ordered file list (data, then views.js) and every public word. Locally gate-mode.js says
 * HUB_GATED = false: the plaintext files sit beside the page, so they load and the hub starts with no sign-in. On the
 * public mirror (tools/fivestar-hub/publish.sh sets it true) only data/bundle.enc is published: the visitor signs in by
 * email link, the page reads the hub's keys from Firestore (only accounts with a role may), tries them newest first
 * (AES-256-GCM, then gunzip), runs the files in order and the last one starts the hub. Nothing that opens the hub is kept
 * in the browser, so a removed account stops opening it. Fires `auth-granted` and `auth-denied` on window. */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var b64 = function (s) { return Uint8Array.from(atob(s), function (c) { return c.charCodeAt(0); }); };
  var emit = function (name, detail) { try { window.dispatchEvent(new CustomEvent(name, { detail: detail })); } catch (e) {} };
  var L = {}, FILES = [];

  function load(src) {
    return new Promise(function (ok, no) { var s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = function () { no(new Error('could not load ' + src)); }; document.head.appendChild(s); });
  }
  /* an inline script's own error goes to window, not to the caller */
  function run(text, name) {
    var failed = null, watch = function (e) { failed = e.error || new Error(e.message); };
    window.addEventListener('error', watch);
    var s = document.createElement('script'); s.textContent = text + '\n//# sourceURL=' + encodeURI(name); document.head.appendChild(s);
    window.removeEventListener('error', watch);
    if (failed) throw failed;
  }
  function unlock(raw, bundle) {
    return crypto.subtle.importKey('raw', b64(raw), 'AES-GCM', false, ['decrypt'])
      .then(function (key) { return crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64(bundle.iv) }, key, b64(bundle.ct)); })
      .then(function (gz) { return new Response(new Blob([gz]).stream().pipeThrough(new DecompressionStream('gzip'))).text(); })
      .then(JSON.parse);
  }
  /* the newest key first; an older one still opens a bundle published moments before */
  function tryKeys(keys, bundle) { return keys.reduce(function (p, k) { return p.catch(function () { return unlock(k, bundle); }); }, Promise.reject(new Error('no key'))); }
  function start(files) {
    FILES.forEach(function (f) { if (files[f] == null) throw new Error('bundle has no ' + f); });
    FILES.forEach(function (f) { run(files[f], f); });
  }

  function gate() {
    var g = $('gate'), form = $('gate-form'), input = $('gate-email'), msg = $('gate-msg'), out = $('gate-out'), btn = $('gate-send'), A = window.HubAnswers;
    $('gate-title').textContent = L.gateTitle || ''; $('gate-prompt').textContent = L.gatePrompt || ''; $('gate-label').textContent = L.gateEmail || '';
    btn.textContent = L.gateSend || ''; out.textContent = L.gateSignOut || '';
    var show = function (text, signedIn) {
      g.hidden = false; form.hidden = false; msg.textContent = text || '';
      [$('gate-prompt'), $('gate-label'), input, btn].forEach(function (e) { e.hidden = !!signedIn; });
      out.hidden = !signedIn; btn.disabled = false;
      if (!signedIn) input.focus();
    };
    out.onclick = function () { A.signOut(); };
    form.onsubmit = function (e) {
      e.preventDefault(); var v = input.value.trim(); if (!v) return;
      btn.disabled = true; msg.textContent = L.gateSending || '';
      A.signIn(v).then(function () { msg.textContent = L.gateSent || ''; }, function (x) {
        btn.disabled = false; msg.textContent = x && x.code === 'auth/admin-restricted-operation' ? L.gateNotListed : L.gateSendFailed;
      });
    };
    return fetch('data/bundle.enc', { cache: 'no-store' }).then(function (r) { if (!r.ok) throw new Error('no bundle'); return r.json(); }).then(function (bundle) {
      return A.init().then(function () {
        if (A.signInError) { emit('auth-denied', { reason: 'sign-in-failed' }); return show(L.gateLinkFailed); }
        if (!A.user) return show('');
        if (!A.canAnswer()) { emit('auth-denied', { reason: 'not-allowlisted', email: A.user.email }); return show(String(L.gateNoAccess || '').replace('{email}', A.user.email), true); }
        g.hidden = true;
        return A.gateKeys().then(function (keys) { return tryKeys(keys, bundle); }).then(start).then(function () {
          emit('auth-granted', { email: A.user.email, surface: 'fivestar' });
        }, function (e) { console.error('[gate]', e); show(L.gateOpenFailed, true); });
      });
    }).catch(function (e) {
      console.error('[gate]', e); g.hidden = false; form.hidden = false;
      [$('gate-prompt'), $('gate-label'), input, btn, out].forEach(function (x) { x.hidden = true; });
      $('gate-title').textContent = L.gateTitle || ''; msg.textContent = L.gateUnavailable || '';
    });
  }

  /* the file list and words, the mode flag, the public web config, the store (sign-in, keys, answers, comments), the
   * chassis and the account and answer layer; then the files, from the network locally or from the bundle */
  fetch('gate.config.json', { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (c) {
    FILES = c.files || []; L = window.HUB_LABELS = c.labels || {};
    return ['gate-mode.js?v=f45846317d', 'firebase-config.js?v=2d9c421767', 'answers.js?v=8ebc6b9fce', 'hub-core.js?v=8036067eb6', 'feedback.js?v=8a843fc493'].reduce(function (p, f) { return p.then(function () { return load(f); }); }, Promise.resolve());
  }).then(function () {
    if (window.HUB_GATED) return gate();
    return FILES.reduce(function (p, f) { return p.then(function () { return load(f); }); }, Promise.resolve());
  }).catch(function (e) { console.error('[gate]', e); });
})();
