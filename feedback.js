/* The Feedback Drawer's host side for this hub (review-widget 1.5.0: qna-mode.md, host-answers-store.md, hash-route-screens.md)
 * and the account line (auth-gate email-link-sign-in.md §"Where sign-in appears"). Public page code: layout only. Every word
 * comes from gate.config.json `labels` (window.HUB_LABELS); the questions come from views.js.
 *
 *   window.HubFeedback.tab(n)   the Answer tab of question:<n>: the saved answer, its files, and the form, or why it is locked
 *   account:me                  who is signed in and their access, or the sign-in form
 *   #acct-line                  the menu foot: "Signed in as … · Sign out", or "Sign in"
 * Answers are stored under the id q<n> through window.HubAnswers. The chassis' render and drawer hooks call the widget's
 * __rwRefresh, so the widget does not poll. */
(function () {
  var H = window.Hub, esc = H.esc, A = window.HubAnswers, MAXFILE = 50 * 1024 * 1024;
  var t = function (k, o) { var s = (window.HUB_LABELS || {})[k] || ''; Object.keys(o || {}).forEach(function (x) { s = s.split('{' + x + '}').join(o[x]); }); return s; };
  var size = function (n) { return n < 1048576 ? Math.max(1, Math.round(n / 1024)) + ' KB' : (n / 1048576).toFixed(1) + ' MB'; };
  var when = function (ts) { return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); };
  var lock = function (text) { return '<div class="qa-lock" role="status">' + esc(text) + '</div>'; };
  var busy = {};

  /* ─── sign-in and the account ─── */
  function signInForm() {
    return '<form class="qa-form" data-signin data-review-skip><label for="si-email">' + esc(t('gateEmail')) + '</label><input id="si-email" type="email" required autocomplete="email">' +
      '<div class="qa-acts"><button type="submit" class="btn">' + esc(t('siSend')) + '</button><span class="qa-note" data-si-msg role="status">' + esc(t('siNote')) + '</span></div></form>';
  }
  function roleWord() { var r = A.user && A.user.role; return r === 'admin' ? t('roleAdmin') : r === 'team' ? t('roleTeam') : r === 'client' ? t('roleClient') : t('acctNone'); }
  function drawAccount() {
    var box = document.getElementById('acct-line'); if (!box) return;
    if (!A.backend) { box.innerHTML = ''; return; }
    box.innerHTML = A.user ? '<span>' + esc(t('acctSignedIn', { email: A.user.email })) + '</span> <button type="button" class="linkbtn" data-signout>' + esc(t('acctSignOut')) + '</button>'
      : '<button type="button" class="linkbtn" data-d="account:me">' + esc(t('acctSignIn')) + '</button>';
  }
  H.drawer('account', function () {
    if (!A.backend) return { title: t('acctTitle'), tabs: [['a', '', '<p>' + esc(t('acctLocal')) + '</p>']] };
    if (!A.user) return { title: t('acctSignIn'), tabs: [['a', '', signInForm()]] };
    return { title: t('acctTitle'), tabs: [['a', '', '<dl class="kv"><dt>' + esc(t('acctEmail')) + '</dt><dd>' + esc(A.user.email) + '</dd><dt>' + esc(t('acctRole')) + '</dt><dd>' + esc(roleWord()) + '</dd></dl>' +
      '<p><button type="button" class="btn" data-signout>' + esc(t('acctSignOut')) + '</button></p>']] };
  });

  /* ─── the Answer tab of a question ─── */
  function tab(n) {
    var id = 'q' + n, rec = A.get(id);
    if (A.backend && !A.user) return lock(t('qaSignIn')) + signInForm();
    if (A.backend && !A.canAnswer()) return lock(t('qaNoRole'));
    if (A.error) return lock(t('qaSaveFailed'));
    var files = (rec && rec.files) || [], text = rec && rec.values ? rec.values.answer || '' : '';
    return '<div class="qa-box" data-qa="' + id + '">' + (A.backend ? '' : '<p class="note">' + esc(t('qaLocal')) + '</p>') +
      '<label for="qa-' + id + '">' + esc(t('qaLabel')) + '</label><textarea id="qa-' + id + '" rows="7" data-qa-text>' + esc(text) + '</textarea>' +
      '<h3>' + esc(t('qaFiles')) + '</h3>' + (files.length ? '<ul class="qa-files">' + files.map(function (f) {
        return '<li><button type="button" class="linkbtn" data-qa-get="' + esc(f.id) + '">' + esc(f.name) + '</button> <span class="qa-note">' + esc(size(f.size)) + '</span> <button type="button" class="linkbtn" data-qa-rm="' + esc(f.id) + '">' + esc(t('qaRemove')) + '</button></li>';
      }).join('') + '</ul>' : '') +
      '<label class="qa-add">' + esc(t('qaAddFiles')) + '<input type="file" multiple data-qa-file></label>' +
      '<div class="qa-acts"><button type="button" class="btn" data-qa-save>' + esc(t('qaSave')) + '</button><span class="qa-note" data-qa-msg role="status">' +
      esc(busy[id] || (rec ? t('qaBy', { name: rec.author || '', date: when(rec.timestamp) }) : t('qaNone'))) + '</span></div></div>';
  }
  function record(id, text, files) {
    return { values: { answer: text }, files: files, summary: text.slice(0, 20000), author: A.user ? A.user.name : t('acctTitle'), timestamp: Date.now() };
  }
  function boxOf(el) { var b = el.closest('[data-qa]'); return b && { box: b, id: b.getAttribute('data-qa'), msg: b.querySelector('[data-qa-msg]'), text: b.querySelector('[data-qa-text]') }; }
  function save(q, files) {
    var rec = A.get(q.id), list = files || (rec && rec.files) || [];
    A.save(q.id, record(q.id, q.text.value, list));
    q.msg.textContent = A.error ? t('qaSaveFailed') : t('qaSaved');
  }

  document.addEventListener('click', function (e) {
    var b;
    if ((b = e.target.closest('[data-signout]'))) { A.signOut(); return; }
    if ((b = e.target.closest('[data-qa-save]'))) { save(boxOf(b)); return; }
    if ((b = e.target.closest('[data-qa-get]'))) {
      var q = boxOf(b), meta = ((A.get(q.id) || {}).files || []).filter(function (f) { return f.id === b.getAttribute('data-qa-get'); })[0];
      if (meta) A.getFile(meta).then(function (blob) { var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = meta.name; a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000); });
      return;
    }
    if ((b = e.target.closest('[data-qa-rm]'))) {
      var r = boxOf(b), fid = b.getAttribute('data-qa-rm'), all = (A.get(r.id) || {}).files || [], gone = all.filter(function (f) { return f.id === fid; })[0];
      if (gone) A.dropFile(gone.id, gone.path);
      save(r, all.filter(function (f) { return f.id !== fid; }));
    }
  });
  document.addEventListener('change', function (e) {
    var input = e.target.closest && e.target.closest('[data-qa-file]'); if (!input) return;
    var q = boxOf(input), picked = Array.prototype.slice.call(input.files || []), ok = picked.filter(function (f) { return f.size <= MAXFILE; });
    picked.filter(function (f) { return f.size > MAXFILE; }).forEach(function (f) { q.msg.textContent = t('qaTooBig', { name: f.name }); });
    if (!ok.length) return;
    busy[q.id] = t('qaSaving'); q.msg.textContent = busy[q.id];
    Promise.all(ok.map(function (f) { return A.putFile(f, q.id); })).then(function (metas) {
      delete busy[q.id]; save(q, ((A.get(q.id) || {}).files || []).concat(metas));
    }, function () { delete busy[q.id]; q.msg.textContent = t('qaSaveFailed'); });
  });
  document.addEventListener('submit', function (e) {
    var f = e.target.closest && e.target.closest('[data-signin]'); if (!f) return; e.preventDefault();
    var email = f.querySelector('input[type=email]').value.trim(), msg = f.querySelector('[data-si-msg]'), btn = f.querySelector('button'); if (!email) return;
    btn.disabled = true; msg.textContent = t('gateSending');
    A.signIn(email).then(function () { msg.textContent = t('gateSent'); }, function (x) { btn.disabled = false; msg.textContent = x && x.code === 'auth/admin-restricted-operation' ? t('gateNotListed') : t('gateSendFailed'); });
  });

  /* ─── refresh: the widget on every screen and drawer; the screen when answers change, unless someone is typing ─── */
  var refresh = function () { try { if (window.__rwRefresh) window.__rwRefresh(); } catch (x) {} }, started = false;
  /* the widget loads once the hub is up, so it finds the store and the signed-in account */
  var widget = function () { ['review.config.js?v=68cf208fa0', 'review-bootstrap.js?v=8671c11eff'].reduce(function (p, f) { return p.then(function () { return new Promise(function (ok) { var s = document.createElement('script'); s.src = f; s.onload = s.onerror = ok; document.head.appendChild(s); }); }); }, Promise.resolve()); };
  H.onRender(function () { if (!started) widget(); started = true; drawAccount(); refresh(); });
  H.onDrawer(refresh);
  A.onChange(function () { var a = document.activeElement; if (started && !(a && a.closest && a.closest('[data-qa]'))) H.render(); });
  A.start();
  window.HubFeedback = { tab: tab, answered: function (n) { return !!A.get('q' + n); } };
})();
