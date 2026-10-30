/* Hub screens. All text and numbers come from data/*.js (behind the gate); this file holds only layout, generic labels and the joins
 * between entities, so it is safe on the public mirror. Every entity exists once and opens in the drawer. */
(function () {
  var F = window.FS, H = window.Hub, C = H.chart, esc = H.esc, V = F.views, D = F.design;
  var strip = function (h) { return String(h == null ? '' : h).replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&mdash;/g, '—').replace(/\s+/g, ' ').trim(); };
  var slug = function (s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); };
  var host = function (s) { return String(s).replace(/^www\./, ''); };
  var BRANDS = [['all', 'All'], ['fsi', 'FSI'], ['amaa', 'AM&AA']], BNAME = { fsi: 'FSI', amaa: 'AM&AA', '': 'Shared' };
  var CHANNELS = [['membership', 'Membership'], ['events', 'Events'], ['media', 'Media'], ['education', 'Education']], CNAME = { '': 'Unassigned' };
  CHANNELS.forEach(function (c) { CNAME[c[0]] = c[1]; });
  var STATUS = { live: ['Live', 'ok'], changing: ['Changing', 'warn'], retired: ['Retired', ''], confirm: ['To confirm', 'warn'] };
  var FILTERED = { '/programmes': 1, '/products': 1 };
  var OUT = '<span class="chip out">Outside view</span>', PORTAL = '<span class="chip portal">Portal read</span>', CALL = '<span class="chip call">Call, 6 Oct</span>', STALE = '<span class="chip stale">Changed since</span>';
  var chip = function (t, c) { return '<span class="chip ' + (c || '') + '">' + esc(t) + '</span>'; };
  var ts = function (t) { return t ? '<span class="ts">' + esc(t) + '</span>' : ''; };

  /* ─── page parts ─── */
  var head = function (v, chips) { return '<div class="pagehead">' + (v.eyebrow ? '<p class="eyebrow">' + v.eyebrow + '</p>' : '') + '<h1>' + v.title + '</h1>' + (chips || '') + '</div>' + (v.lede ? '<p class="lead">' + v.lede + '</p>' : ''); };
  var page = function (key, chips) { var c = D.pageCopy[key]; return '<div class="pagehead"><h1>' + esc(c[0]) + '</h1>' + (chips || '') + '</div><p class="lead">' + esc(c[1]) + '</p>'; };
  var tabs = function (base, list, cur) {
    return '<nav class="mtabs" aria-label="Views">' + list.map(function (t, i) {
      var on = cur ? cur === t[0] : i === 0;
      return '<a href="#' + base + (i ? '?tab=' + t[0] : '') + '"' + (on ? ' aria-current="page"' : '') + '>' + t[1] + (t[2] != null ? ' <span class="cnt">' + esc(t[2]) + '</span>' : '') + '</a>';
    }).join('') + '</nav>';
  };
  var search = function (scope, label) { return '<input class="search" type="search" data-search="' + scope + '" placeholder="' + esc(label) + '" aria-label="' + esc(label) + '">'; };
  var kv = function (rows) { return '<dl class="kv">' + rows.filter(function (r) { return r[1] != null && r[1] !== ''; }).map(function (r) { return '<dt>' + r[0] + '</dt><dd>' + r[1] + '</dd>'; }).join('') + '</dl>'; };
  var rowAttrs = function (ref) { return ref ? ' data-d="' + esc(ref) + '" tabindex="0"' : ''; };
  var note = function (t) { return '<div class="stalebar">' + STALE + '<span>' + esc(t) + '</span></div>'; };
  var plain = function (heads, rows, scope) { return '<div class="tablewrap"' + (scope ? ' data-scope="' + scope + '"' : '') + '><table><thead><tr>' + heads.map(function (h) { return '<th>' + esc(h) + '</th>'; }).join('') + '</tr></thead><tbody>' + rows.join('') + '</tbody></table></div>'; };
  var cells = function (r, ref) { return '<tr' + rowAttrs(ref) + '>' + r.map(function (c) { return '<td>' + c + '</td>'; }).join('') + '</tr>'; };
  var ol = function (items) { return '<ol class="steps2">' + items.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ol>'; };
  var ul = function (items) { return '<ul class="clean">' + items.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>'; };
  function tableHtml(b, o) {
    o = o || {};
    var n = b.head.length;
    return '<div class="tablewrap"' + (o.scope ? ' data-scope="' + o.scope + '"' : '') + '><table><thead><tr>' + b.head.map(function (h) { return '<th>' + h + '</th>'; }).join('') + '</tr></thead><tbody>' +
      b.rows.map(function (r, i) {
        if (r.sep) return '<tr><td colspan="' + n + '" class="sep">' + r.sep + '</td></tr>';
        if (o.show && !o.show(r, i)) return '';
        return '<tr' + (r.dark ? ' class="dark-row"' : '') + rowAttrs(o.ref && o.ref(r, i)) + '>' + r.cells.map(function (c, ci) { return '<td' + (c.c ? ' class="' + c.c + '"' : '') + '>' + c.h + (ci === 0 && o.mark ? o.mark(r) : '') + '</td>'; }).join('') + '</tr>';
      }).join('') + '</tbody></table></div>';
  }
  function fix(h) { return h.replace(/href="#\/instrumentation"/g, 'href="#/estate?tab=instrumentation"').replace(/href="#\/funnel"/g, 'href="#/estate?tab=funnel"').replace(/href="#\/social"/g, 'href="#/estate?tab=social"').replace(/href="#\/people"/g, 'href="#/overview"').replace(/href="#\/model"/g, 'href="#/objects"').replace(/href="#\/limits"/g, 'href="#/hubspot?tab=limits"'); }
  function blockHtml(b, o) {
    o = o || {};
    if (b.k === 'h3') return '<h3>' + b.h + '</h3>';
    if (b.k === 'h4') return '<h4 class="subhead">' + b.h + '</h4>';
    if (b.k === 'table') return tableHtml(b, o.table ? o.table(b) : null);
    if (b.k === 'slot') return o.slots && o.slots[b.slot] ? o.slots[b.slot]() : '';
    return fix(b.h);
  }
  function range(v, a, b, o) { return v.blocks.slice(a, b == null ? undefined : b).map(function (x) { return blockHtml(x, o); }).join(''); }
  function tablesOf(v) { return v.blocks.filter(function (b) { return b.k === 'table'; }); }
  function kvRow(tb, row) { return kv(tb.head.map(function (h, i) { return [h, row.cells[i] ? row.cells[i].h : '']; })); }
  function linkList(items) { return '<ul class="linklist">' + items.map(function (x) { return '<li><button type="button" data-d="' + esc(x[0]) + '">' + esc(x[1]) + '</button>' + (x[2] ? '<small>' + x[2] + '</small>' : '') + '</li>'; }).join('') + '</ul>'; }
  function classList(items, type) {
    return '<div class="classlist">' + items.map(function (c) {
      return '<div class="classrow"><button class="classhead" type="button" data-d="' + type + ':' + esc(c.id) + '"><span class="cname">' + c.name + '</span><span class="cnum">' + esc(c.num.replace(/^(\d+)\s*/, '$1 ')) + '</span><span class="cchange">' + c.change + '</span><span class="chev">›</span></button></div>';
    }).join('') + '</div>';
  }

  /* ─── evidence joins: estate, instrumentation, SEO, forms and social on the domain ─── */
  var PROP = {}, PROPS = [];
  function prop(key) { if (!PROP[key]) { PROP[key] = { key: key, social: [], seoPages: [], forms: [] }; PROPS.push(PROP[key]); } return PROP[key]; }
  var EST = tablesOf(V.estate);
  EST.slice(0, 4).forEach(function (tb) { tb.rows.forEach(function (r) { var p = prop(host(strip(r.cells[0].h))); p.estate = { tb: tb, row: r }; r.key = p.key; }); });
  var MATRIX = tablesOf(V.matrix)[0];
  MATRIX.rows.forEach(function (r) { var k = host(strip(r.cells[0].h)); if (PROP[k]) { PROP[k].matrix = r; r.key = k; } });
  var SEO_SITES = EST[4], SEO_PAGES = EST[5], SEO_LABEL = {};
  SEO_SITES.rows.forEach(function (r) {
    var txt = strip(r.cells[0].h), hit = PROPS.filter(function (p) { return txt.indexOf(p.key) >= 0; })[0] || (/wildapricot/.test(txt) ? PROP['fivestarmemberships.wildapricot.org'] : null);
    if (!hit) hit = PROPS.filter(function (p) { return p.key.indexOf(txt.split(' ').pop().replace(/…$/, '')) === 0; })[0];
    if (hit) { hit.seo = r; r.key = hit.key; SEO_LABEL[txt.split(/\s(?=\S+$)/)[0]] = hit.key; }
  });
  SEO_PAGES.rows.forEach(function (r) { var k = SEO_LABEL[strip(r.cells[0].h).split(' · ')[0]]; if (k) { PROP[k].seoPages.push(r); r.key = k; } });
  var FORM = {}, CLUSTER = {};
  F.forms.forEach(function (f) { FORM[f.id] = f; });
  F.clusters.forEach(function (c) { CLUSTER[c.id] = c; c.forms.forEach(function (id) { if (FORM[id]) FORM[id].cluster = c.id; }); });
  F.sites.forEach(function (s) { var p = prop(host(s.site)); p.site = s; p.forms = s.forms; s.key = p.key; });
  var OWNER = { MortgagePoint: 'themortgagepoint.com', MP: 'themortgagepoint.com', 'Five Star Institute': 'thefivestar.com', FSI: 'thefivestar.com', 'Legal League': 'legalleague100.com', FORCE: 'fivestarforce.com', NMSA: 'nationalmortgageservicingassociation.com', 'MP Access Show': 'podcast.mpaccessshow.com' };
  var SOC = tablesOf(V.social)[0];
  SOC.rows.forEach(function (r, i) { r.id = 's' + (i + 1); r.keys = strip(r.cells[2].h).split(' / ').map(function (n) { return OWNER[n]; }).filter(Boolean); r.keys.forEach(function (k) { if (PROP[k]) PROP[k].social.push(r); }); });
  var PLAT_RE = [/HubSpot/, /Wild Apricot/, /Swoogo/, /Buzzsprout/, /Uberflip/, /WordPress|MemberPress/, /GTM|Tag Manager/, /GA4|Universal Analytics|\bUA-|Google Analytics/, /AdSense|\bAW-|Google Ads/, /Apollo/, /Simpli\.fi/, /Hotjar/, /Naylor/, /Meta pixel|Meta Pixel|LinkedIn Insight/];
  var PLAT = tablesOf(V.platforms)[0], PLATBY = {};
  PLAT.rows.forEach(function (r, i) { r.id = slug(strip(r.cells[0].h).split(/\s[0-9]/)[0]); r.re = PLAT_RE[i]; PLATBY[r.id] = r; });
  var DEF = tablesOf(V.defects)[0], DEFS = [], DEFBY = {}, section = '';
  DEF.rows.forEach(function (r) { if (r.sep) { section = r.sep; return; } r.id = 'd' + (DEFS.length + 1); r.section = section; DEFS.push(r); DEFBY[r.id] = r; });
  var defName = function (r) { return strip((/<strong>(.*?)<\/strong>/.exec(r.cells[0].h) || [])[1] || r.cells[0].h); };
  var ROWS = {}, ROWLIST = []; F.bands.forEach(function (b) { b.rows.forEach(function (r) { r.band = b; ROWS[r.id] = r; ROWLIST.push(r); }); });
  var propsIn = function (html) { var t = strip(html); return PROPS.filter(function (p) { return p.key && t.indexOf(p.key) >= 0; }); };
  var platsIn = function (html) { var t = strip(html); return PLAT.rows.filter(function (r) { return r.re.test(t); }); };
  function linkedTab(html) {
    var ps = propsIn(html), pl = platsIn(html), out = '';
    if (ps.length) out += '<h3>Properties</h3>' + linkList(ps.map(function (p) { return ['property:' + p.key, p.key]; }));
    if (pl.length) out += '<h3>Platforms</h3>' + linkList(pl.map(function (r) { return ['platform:' + r.id, strip(r.cells[0].h)]; }));
    return out;
  }

  /* ─── design joins ─── */
  var PROG = {}, PRODBY = {}, OBJ = {}, ROWBY = {}, QBY = {}, DEC = {}, COR = {};
  F.programmes.forEach(function (p) { PROG[p.id] = p; });
  F.products.forEach(function (p) { PRODBY[p.sku] = p; });
  D.objects.forEach(function (o) { OBJ[o.id] = o; });
  F.boardRows.forEach(function (r) { ROWBY[r.id] = r; });
  F.questions = F.questions.concat(D.extraQuestions);
  F.questions.sort(function (a, b) { return a.n - b.n; });
  F.questions.forEach(function (q) { q.ans = D.answers[q.n] || { s: 'open' }; QBY[q.n] = q; });
  D.decisions.forEach(function (d) { DEC[d.n] = d; });
  D.corrections.forEach(function (c) { COR[c.id] = c; });
  var inBrand = function (b) { return H.inGroup(b); };
  var QSTATUS = { answered: ['Answered', 'ok'], partly: ['Partly', 'warn'], overtaken: ['Overtaken', ''], open: ['Open', 'bad'] };
  var DSTATUS = { decided: ['Decided', 'ok'], recommended: ['Recommended', 'rec'], open: ['Open', 'bad'], overtaken: ['Overtaken', ''] };
  var COUNTS = {
    corrections: D.corrections.length, programmes: F.programmes.length, products: F.products.length, objects: D.objects.length,
    openDecisions: D.decisions.filter(function (d) { return d.status === 'open'; }).length,
    openQuestions: F.questions.filter(function (q) { return q.ans.s === 'open' || q.ans.s === 'partly'; }).length,
    requests: D.requests.filter(function (r) { return r.status !== 'Agreed'; }).length
  };
  function qFor(p) {
    var keys = p.name.split(/ · | \(/).map(function (k) { return k.replace(/\)$/, '').replace(/^AM&AA /, '').trim(); }).filter(function (k) { return k.length > 3 && k !== 'membership'; });
    return F.questions.filter(function (q) { var t = strip(q.text); return keys.some(function (k) { return t.indexOf(k) >= 0; }); });
  }
  var qLine = function (q) { return ['question:' + q.n, 'Q' + q.n + ' · ' + strip(q.text).slice(0, 96) + (strip(q.text).length > 96 ? '…' : ''), QSTATUS[q.ans.s][0]]; };

  /* ─── menu ─── */
  H.nav = D.nav.map(function (s) { return { sec: s.sec, items: s.items.map(function (it) { var c = it.cnt; return { label: it.label, route: it.route, cnt: !c ? null : /^menu:/.test(c) ? F.menu[c.slice(5)] : COUNTS[c] }; }) }; });
  H.legacy = { overview: '/overview', corr: '/correspondence', portal: '/hubspot', forms: '/forms', estate: '/estate', matrix: '/estate?tab=instrumentation', funnel: '/estate?tab=funnel', platforms: '/platforms', social: '/estate?tab=social', members: '/overview', topics: '/topics', model: '/objects', defects: '/defects', gaps: '/hubspot?tab=limits', seo: '/estate?tab=seo' };
  H.alias = { '/instrumentation': '/estate?tab=instrumentation', '/funnel': '/estate?tab=funnel', '/social': '/estate?tab=social', '/people': '/overview', '/model': '/objects', '/limits': '/hubspot?tab=limits', '/method': '/hubspot?tab=method' };

  /* ─── overview ─── */
  H.route('/overview', function () {
    var dec = D.decisions.filter(function (d) { return d.status === 'decided'; }).length, ans = F.questions.filter(function (q) { return q.ans.s === 'answered'; }).length, part = F.questions.filter(function (q) { return q.ans.s === 'partly' || q.ans.s === 'overtaken'; }).length;
    var stat = function (k, v, r, href) { return '<a class="tile" href="#' + href + '"><div class="k">' + esc(k) + '</div><div class="v">' + esc(v) + '</div><div class="r">' + esc(r) + '</div></a>'; };
    var next = D.phases.slice(0, 3).map(function (p) { return cells([esc(p.name), esc(p.when), esc(p.exit)]); });
    return '<section class="hero"><div class="hero-eye">' + esc(D.asOf) + ' · working draft</div><h1>' + esc(D.brief.title) + '</h1><p>' + esc(D.brief.lede) + '</p></section>' +
      '<div class="tiles">' + stat('Decisions settled', dec + ' of ' + D.decisions.length, COUNTS.openDecisions + ' still open', '/decisions') + stat('Questions answered', String(ans), part + ' partly or overtaken, ' + F.questions.filter(function (q) { return q.ans.s === 'open'; }).length + ' open', '/questions') + stat('Programmes placed', String(F.programmes.length), 'by brand and channel', '/org') + stat('Requests outstanding', String(COUNTS.requests), 'from the call', '/requests') + '</div>' +
      '<h2>The design rules</h2><div class="rules">' + D.brief.rules.map(function (r, i) { return '<div class="rule"><b>' + (i + 1) + '</b><div><h3>' + esc(r[0]) + '</h3><p>' + esc(r[1]) + '</p></div></div>'; }).join('') + '</div>' +
      '<h2>What happens next</h2>' + plain(['Phase', 'When', 'Exit test'], next) +
      '<h2>Find your way</h2><div class="tiles">' + H.nav.slice(1).map(function (s) { return '<a class="tile" href="#' + s.items[0].route + '"><div class="k">' + esc(s.sec) + '</div><p>' + s.items.map(function (i) { return esc(i.label); }).join(' · ') + '</p></a>'; }).join('') + '</div>';
  });

  /* ─── what we heard ─── */
  H.route('/heard', function () {
    var areas = []; D.corrections.forEach(function (c) { if (areas.indexOf(c.area) < 0) areas.push(c.area); });
    return page('heard', CALL) + areas.map(function (a) {
      return '<h3>' + esc(a) + '</h3>' + plain(['Topic', 'We assumed', 'The client said', 'Design consequence'], D.corrections.filter(function (c) { return c.area === a; }).map(function (c) { return cells(['<b>' + esc(c.title) + '</b>', esc(c.was), esc(c.said) + ts(c.ts), esc(c.then)], 'correction:' + c.id); }));
    }).join('');
  });
  H.drawer('correction', function (id) {
    var c = COR[id]; if (!c) return null;
    return { title: c.title, sub: chip(c.area) + CALL, tabs: [['c', 'Correction', kv([['We assumed', esc(c.was)], ['The client said', esc(c.said)], ['Recording', esc(c.ts)], ['Consequence', esc(c.then)]]) + '<p><a href="#' + esc(c.link) + '">Open the related screen</a></p>']] };
  });

  /* ─── brand × channel ─── */
  function pchip(p) { var s = STATUS[p.status]; return '<button type="button" class="pchip ' + s[1] + (p.status === 'retired' ? ' gone' : '') + '" data-d="programme:' + p.id + '" title="' + s[0] + '">' + esc(p.name) + '</button>'; }
  H.route('/org', function () {
    var lines = CHANNELS.map(function (c) { return '<div class="col-h">' + c[1] + '</div>'; }).join('');
    var row = function (b) {
      return '<div class="brand-h"><b>' + esc(BNAME[b]) + '</b></div>' + CHANNELS.map(function (c) {
        var ps = F.programmes.filter(function (p) { return p.brand === b && p.channel === c[0]; }), prods = F.products.filter(function (p) { return p.brand === b && p.channel === c[0]; }).length;
        return '<div class="cellc"><div class="cell-t">' + c[1] + ' · ' + ps.length + '</div>' + ps.map(pchip).join('') + (prods ? '<a class="prodlink" href="#/products?ch=' + c[0] + '">' + prods + ' SKU' + (prods === 1 ? '' : 's') + '</a>' : '') + '</div>';
      }).join('');
    };
    return page('org', CALL) + '<div class="legal"><b>' + esc(D.legal[0]) + '</b><span>' + esc(D.legal[1]) + '</span></div>' +
      '<div class="orggrid"><div></div>' + lines + row('fsi') + row('amaa') + '</div>' +
      '<div class="keyline"><span class="pchip ok">Live</span><span class="pchip warn">Changing or to confirm</span><span class="pchip gone">Retired</span></div>' +
      '<h3>What the portfolio showed</h3><div class="tiles wide">' + F.orgFindings.map(function (f) { return '<div class="tile"><h3>' + esc(f.lines[0]) + '</h3><p>' + esc(f.lines.slice(1).join(' ')) + '</p></div>'; }).join('') + '</div>' +
      '<h3>In HubSpot today</h3>' + linkList(F.brandDocs.map(function (b, i) { return ['branddoc:' + i, b.name]; }));
  });
  H.drawer('branddoc', function (i) { var b = F.brandDocs[+i]; return b ? { title: b.name, wide: 1, tabs: [['t', 'In HubSpot today', b.doc]] } : null; });

  /* ─── programmes ─── */
  var chTabs = function (base, cur) { return '<nav class="pills" aria-label="Filter by channel">' + [['', 'All channels']].concat(CHANNELS).map(function (c) { return '<a href="#' + base + (c[0] ? '?ch=' + c[0] : '') + '"' + ((cur || '') === c[0] ? ' aria-current="true"' : '') + '>' + c[1] + '</a>'; }).join('') + '</nav>'; };
  H.route('/programmes', function (rest, q) {
    var rows = F.programmes.filter(function (p) { return inBrand(p.brand) && (!q.ch || p.channel === q.ch); });
    return page('programmes') + chTabs('/programmes', q.ch) + search('prog', 'Search the programmes') +
      plain(['Programme', 'Brand', 'Channel', 'Status', 'From the call'], rows.map(function (p) { var s = STATUS[p.status]; return cells(['<b>' + esc(p.name) + '</b>', esc(BNAME[p.brand]), esc(CNAME[p.channel]), chip(s[0], s[1]), esc(p.note)], 'programme:' + p.id); }), 'prog');
  });
  H.drawer('programme', function (id) {
    var p = PROG[id]; if (!p) return null;
    var s = STATUS[p.status], rec = p.record || {}, qs = qFor(p);
    var nums = kv([['Events', rec.events], ['Registration deals', rec.registration_deals], ['Sponsorship deals', rec.sponsorship_deals], ['Deals', rec.deals], ['Products', rec.products]].map(function (r) { return [r[0], r[1] ? esc(r[1]) : '']; }));
    var t = [['about', 'About', (p.note ? '<p class="cmap-text">' + esc(p.note) + '</p>' : '') + kv([['Brand', esc(BNAME[p.brand])], ['Channel', esc(CNAME[p.channel])], ['Status', esc(s[0])]]) + (p.desc ? '<h3>From the audit</h3><p>' + p.desc + '</p>' : '') + (p.card ? '<h3>On the Org Map</h3>' + ul(p.card) : '') + (p.record ? '<h3>In the record map</h3>' + nums : '')],
      ['design', 'CRM design', ul(D.channelDesign[p.channel] || [])]];
    if (p.doc) t.splice(1, 0, ['hubspot', 'In HubSpot today', p.doc]);
    if (qs.length) t.push(['q', 'Questions', linkList(qs.map(qLine))]);
    return { title: p.name, sub: chip(BNAME[p.brand]) + chip(CNAME[p.channel]) + chip(s[0], s[1]), wide: !!p.doc, tabs: t };
  });

  /* ─── personas ─── */
  H.route('/personas', function () {
    var P = D.personas, cell = function (r, c) { return P.cells.filter(function (x) { return x[0] === r && x[1] === c; }).map(function (x) { return esc(x[2]) + ts(x[3]); }).join('<br>'); };
    return page('personas', CALL) + plain(['Profession'].concat(P.cols), P.rows.map(function (r) { return cells(['<b>' + esc(r) + '</b>'].concat(P.cols.map(function (c) { return cell(r, c) || '<span class="unk">Not seen</span>'; }))); })) + ul(P.notes) + '<p><a href="#/requests">Access to the full matrix is on Requests</a></p>';
  });

  /* ─── products ─── */
  H.route('/products', function (rest, q) {
    var rows = F.products.filter(function (p) { return (!p.brand || inBrand(p.brand)) && (!q.ch || p.channel === q.ch); }), fams = [];
    rows.forEach(function (p) { if (fams.indexOf(p.family) < 0) fams.push(p.family); });
    return page('products', CALL) + '<div class="tiles wide">' + D.productRules.map(function (r) { return '<div class="tile"><h3>' + esc(r[0]) + '</h3><p>' + esc(r[1]) + '</p></div>'; }).join('') + '</div>' + chTabs('/products', q.ch) + search('prod', 'Search the products') +
      '<div data-scope="prod">' + fams.map(function (f) {
        var ps = rows.filter(function (p) { return p.family === f; });
        return '<h3>' + esc(f) + ' · ' + esc(ps[0].familyName) + ' <span class="cnt">' + ps.length + '</span></h3>' + plain(['SKU', 'Product', 'Brand', 'Channel', 'List price'], ps.map(function (p) { return cells(['<code>' + esc(p.sku) + '</code>', esc(p.name), esc(BNAME[p.brand]), esc(CNAME[p.channel]), esc(p.price)], 'product:' + p.sku); }));
      }).join('') + '</div>';
  });
  H.drawer('product', function (id) {
    var p = PRODBY[id]; if (!p) return null;
    return { title: p.name || p.sku, sub: chip(BNAME[p.brand]) + chip(CNAME[p.channel]), wide: !!p.doc, tabs: [['about', 'About', kv([['SKU', '<code>' + esc(p.sku) + '</code>'], ['Family', esc(p.familyName)], ['List price', esc(p.price)]]) + (p.note.length ? ul(p.note) : '')]].concat(p.doc ? [['hubspot', 'In HubSpot today', p.doc]] : []) };
  });

  /* ─── systems of record ─── */
  H.route('/systems', function () {
    var M = D.sysmap;
    function wrap(t, w) { var out = [], cur = ''; t.split(' ').forEach(function (x) { if ((cur + ' ' + x).length * 6.3 > w && cur) { out.push(cur); cur = x; } else cur = cur ? cur + ' ' + x : x; }); out.push(cur); return out; }
    var box = function (b) { return '<g class="sb ' + b[6] + '"><rect x="' + b[0] + '" y="' + b[1] + '" width="' + b[2] + '" height="' + b[3] + '" rx="8"/><text class="t" x="' + (b[0] + 12) + '" y="' + (b[1] + 24) + '">' + esc(b[4]) + '</text>' + wrap(b[5], b[2] - 24).map(function (l, i) { return '<text class="s" x="' + (b[0] + 12) + '" y="' + (b[1] + 44 + i * 16) + '">' + esc(l) + '</text>'; }).join('') + '</g>'; };
    var svg = '<div class="diagram sys"><svg viewBox="0 0 1200 460" role="img" aria-label="How the systems connect"><defs><marker id="ar" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 z" fill="#7d8c9b"/></marker></defs>' +
      M.links.map(function (l) { return '<line x1="' + l[0] + '" y1="' + l[1] + '" x2="' + l[2] + '" y2="' + l[3] + '" class="fl' + (l[5] ? ' ' + l[5] : '') + '" marker-end="url(#ar)"/>' + (l[4] ? '<text class="s" x="' + (l[6] != null ? l[6] : (l[0] + l[2]) / 2) + '" y="' + (l[7] != null ? l[7] : l[1] - 8) + '"' + (l[6] != null ? '' : ' text-anchor="middle"') + '>' + esc(l[4]) + '</text>' : ''); }).join('') + M.boxes.map(box).join('') + '</svg></div>';
    return page('systems', CALL) + svg + plain(['Kind of data', 'Record of truth', 'Role of HubSpot', 'Today', 'Note'], D.systems.map(function (s) { return cells(['<b>' + esc(s.data) + '</b>', esc(s.owner), esc(s.hubspot), esc(s.today), esc(s.note)]); }));
  });

  /* ─── sync ─── */
  H.route('/sync', function (rest, q) {
    var st = function (s) { return chip(s, s === 'Client' ? 'ok' : s === 'Open' ? 'bad' : 'rec'); }, cur = q.tab || D.syncTabs[0][0], top = page('sync', CALL) + tabs('/sync', D.syncTabs, cur);
    var fields = function (list) { return plain(['Field', 'Direction', 'Rule', 'Source'], list.map(function (r) { return cells(['<b>' + esc(r.field) + '</b>', esc(r.dir), esc(r.rule), st(r.state)]); })); };
    if (cur === D.syncTabs[1][0]) {
      var Q = D.quickbooks;
      return top + '<p>' + esc(Q.intro) + '</p><h3>Field by field</h3>' + fields(Q.fields) + '<h3>Rules</h3>' + plain(['Rule', 'Design'], Q.rules.map(function (r) { return cells(['<b>' + esc(r[0]) + '</b>', esc(r[1])]); })) + '<h3>Still to find out</h3><p>' + esc(Q.open) + '</p>' + linkList(F.questions.filter(function (x) { return x.n >= 84; }).map(qLine)) + linkList([['decision:26', 'Decision 26: ' + DEC[26].title]]);
    }
    return top + '<h3>Keys and rules</h3>' + plain(['Rule', 'Design', 'Source'], D.syncRules.map(function (r) { return cells(['<b>' + esc(r[0]) + '</b>', esc(r[1]), st(r[2])]); })) +
      '<h3>Field by field</h3>' + fields(D.syncFields) +
      '<h3>The flows to test in the sandbox</h3>' + plain(['Flow', 'What should happen'], D.syncFlows.map(function (r) { return cells(['<b>' + esc(r[0]) + '</b>', esc(r[1])]); })) +
      '<h3>Questions for the vendor</h3>' + ol(D.vendorQuestions);
  });

  /* ─── object model ─── */
  var ON = 575, OH = 173, OC = { Standard: ['#eef1f4', '#9aa7b3', '#0f1720'], Custom: ['#e7e3ff', '#8f7fee', '#3b1d8f'] };
  H.route('/objects', function () {
    var center = function (o) { return [o.x + ON / 2, o.y + OH / 2]; };
    var nodes = D.objects.map(function (o) {
      var c = o.state === 'New' ? ['#d7f0d2', '#3f9a2c', '#1f5a14'] : OC[o.kind], parked = o.state === 'Parked';
      return '<g class="onode' + (parked ? ' parked' : '') + '" data-d="object:' + o.id + '" tabindex="0" role="button" aria-label="' + esc(o.name) + '"><rect x="' + o.x + '" y="' + o.y + '" width="' + ON + '" height="' + OH + '" rx="16" fill="' + (parked ? '#fff' : c[0]) + '" stroke="' + c[1] + '" stroke-width="4"' + (parked ? ' stroke-dasharray="16 12"' : '') + '/><text x="' + (o.x + ON / 2) + '" y="' + (o.y + 80) + '" text-anchor="middle" fill="' + c[2] + '" class="ot">' + esc(o.name) + '</text><text x="' + (o.x + ON / 2) + '" y="' + (o.y + 130) + '" text-anchor="middle" fill="' + c[2] + '" class="os">' + esc(o.state) + '</text></g>';
    }).join('');
    var lines = D.edges.map(function (e) {
      var a = center(OBJ[e[0]]), b = center(OBJ[e[1]]), tip = esc('<b>' + esc(OBJ[e[0]].name) + '</b> ' + esc(e[2]) + ' <b>' + esc(OBJ[e[1]].name) + '</b>');
      return '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '" class="oe' + (e[3] ? ' parked' : '') + '"/><line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '" class="oh" data-tip="' + tip + '"/>';
    }).join('');
    return page('objects', CALL) + '<div class="diagram obj"><svg viewBox="60 390 4360 2240" role="img" aria-label="HubSpot objects and how they connect">' + lines + nodes + '</svg></div>' +
      '<p class="note">Hover a line for the connection. Dashed objects are parked.</p>' +
      plain(['Object', 'Kind', 'State', 'What changed'], D.objects.map(function (o) { return cells(['<b>' + esc(o.name) + '</b>', esc(o.kind), chip(o.state, o.state === 'New' ? 'ok' : o.state === 'Mirror' ? 'rec' : o.state === 'Changed' ? 'warn' : ''), esc(o.change)], 'object:' + o.id); }));
  });
  H.drawer('object', function (id) {
    var o = OBJ[id]; if (!o) return null;
    var ed = D.edges.filter(function (e) { return e[0] === id || e[1] === id; });
    return { title: o.name, sub: chip(o.kind) + chip(o.state), tabs: [['a', 'What it is', '<p class="cmap-text">' + esc(o.desc) + '</p>' + (o.change ? '<h3>What changed</h3><p>' + esc(o.change) + '</p>' : '')], ['b', 'Connections', linkList(ed.map(function (e) { var other = e[0] === id ? e[1] : e[0]; return ['object:' + other, OBJ[other].name, esc(e[2])]; }))]] };
  });

  /* ─── units, pipelines ─── */
  H.route('/units', function () {
    return page('units', CALL) + '<div class="tiles wide">' + D.units.map(function (u) { return '<div class="tile"><h3>' + esc(u.name) + '</h3><p>' + esc(u.detail) + '</p><p>' + esc(u.holds) + '</p></div>'; }).join('') + '</div>' + ul(D.unitNotes) + '<h3>Teams</h3>' + plain(['Team', 'Does'], D.teams.map(function (t) { return cells(['<b>' + esc(t[0]) + '</b>', esc(t[1])]); }));
  });
  H.route('/pipelines', function () {
    var v = V.portal;
    return page('pipelines', CALL) + plain(['Pipeline', 'Brand', 'Entry', 'Stages'], D.pipelines.map(function (p) { return cells(['<b>' + esc(p.name) + '</b>', esc(p.brand), esc(p.entry), esc(p.stages)]); })) + ul(D.pipelineNotes) + '<h3>The pipelines at the portal read</h3>' + note(D.stale.hubspot) + blockHtml(v.blocks[9]) + blockHtml(v.blocks[10]);
  });

  /* ─── segments, sites, migration, licence ─── */
  H.route('/segments', function () {
    var S = D.segments;
    return page('segments', CALL) + '<h3>Sends</h3>' + plain(['', 'Volume'], S.sends.map(function (r) { return cells(['<b>' + esc(r[0]) + '</b>', esc(r[1])]); })) + '<h3>Rules</h3>' + ul(S.rules) +
      '<h3>Properties</h3>' + plain(['Property', 'On', 'Meaning'], S.properties.map(function (r) { return cells(['<code>' + esc(r[0]) + '</code>', esc(r[1]), esc(r[2])]); })) + '<h3>To retire</h3><p>' + esc(S.retire) + '</p>';
  });
  H.route('/sites', function () {
    var S = D.sites;
    return page('sites') + '<div class="tiles wide">' + S.points.map(function (r) { return '<div class="tile"><h3>' + esc(r[0]) + '</h3><p>' + esc(r[1]) + '</p></div>'; }).join('') + '</div><h3>Page templates</h3>' + plain(['Template', 'Serves', 'Fed by', 'Action'], S.templates.map(function (r) { return cells(['<b>' + esc(r[0]) + '</b>', esc(r[1]), esc(r[2]), esc(r[3])]); })) + '<h3>The CMS question</h3><p>' + esc(S.cms) + '</p><p><a href="#/forms">Form evidence</a> · <a href="#/estate">Estate evidence</a></p>';
  });
  H.route('/migration', function () {
    return page('migration') + plain(['Phase', 'When', 'Scope', 'Exit test'], D.phases.map(function (p) { return cells(['<b>' + esc(p.name) + '</b>', esc(p.when), esc(p.scope), esc(p.exit)]); })) + '<h3>Order of the data work</h3>' + ol(D.migrationOrder);
  });
  H.route('/licence', function () {
    var L = D.licence;
    return page('licence') + note(L.note) + plain(['Module', 'September list price a month', 'After the call', 'Why'], L.rows.map(function (r) { return cells(['<b>' + esc(r[0]) + '</b>', r[1] ? H.usd(r[1]) : '–', chip(r[2], r[2] === 'Stays' ? 'ok' : r[2] === 'Falls' ? 'rec' : r[2] === 'Not needed' ? '' : 'warn'), esc(r[3])]); })) + '<p class="note">' + esc(L.onboarding) + '</p>';
  });

  /* ─── decisions, questions, requests ─── */
  H.route('/decisions', function (rest, q) {
    var groups = ['open', 'recommended', 'decided', 'overtaken'];
    return page('decisions', CALL) + '<nav class="pills">' + [['', 'All']].concat(groups.map(function (g) { return [g, DSTATUS[g][0]]; })).map(function (g) { return '<a href="#/decisions' + (g[0] ? '?s=' + g[0] : '') + '"' + ((q.s || '') === g[0] ? ' aria-current="true"' : '') + '>' + g[1] + ' <span class="cnt">' + (g[0] ? D.decisions.filter(function (d) { return d.status === g[0]; }).length : D.decisions.length) + '</span></a>'; }).join('') + '</nav>' +
      plain(['#', 'Decision', 'Status', 'Where it stands'], D.decisions.filter(function (d) { return !q.s || d.status === q.s; }).map(function (d) { var s = DSTATUS[d.status]; return cells([String(d.n), '<b>' + esc(d.title) + '</b>', chip(s[0], s[1]), esc(d.now) + ts(d.ts)], 'decision:' + d.n); }));
  });
  H.drawer('decision', function (n) {
    var d = DEC[n]; if (!d) return null;
    var s = DSTATUS[d.status], qs = (d.qs || []).map(function (x) { return QBY[x]; });
    return { title: d.title, sub: chip('Decision ' + d.n) + chip(s[0], s[1]), tabs: [['a', 'Where it stands', '<p class="cmap-text">' + esc(d.now) + '</p>' + (d.ts ? '<p class="note">Recording: ' + esc(d.ts) + '</p>' : '') + (qs.length ? '<h3>Questions</h3>' + linkList(qs.map(qLine)) : '')]] };
  });
  H.route('/questions', function (rest, q) {
    var cur = q.tab || 'questions';
    var top = page('questions', CALL) + tabs('/questions', [['questions', 'Questions', F.questions.length], ['rows', 'Board rows', F.boardRows.length]], cur);
    if (cur === 'rows') return top + search('rows', 'Search the board rows') + '<div data-scope="rows">' + plain(['Row', 'Kind', 'Owner', 'Summary'], F.boardRows.map(function (r) { return cells(['<b>' + r.title + '</b>', esc(r.kind), esc(r.owner), r.summary], 'row:' + r.id); })) + '</div>';
    var list = F.questions.filter(function (x) { return (!q.s || x.ans.s === q.s) && (!q.p || x.pri === q.p); }), secs = [];
    list.forEach(function (x) { if (secs.indexOf(x.sec) < 0) secs.push(x.sec); });
    var qp = function (s, p) { var u = []; if (s) u.push('s=' + s); if (p) u.push('p=' + p); return '#/questions' + (u.length ? '?' + u.join('&') : ''); };
    return top + '<nav class="pills">' + [['', 'All']].concat(Object.keys(QSTATUS).map(function (k) { return [k, QSTATUS[k][0]]; })).map(function (s) { return '<a href="' + qp(s[0], q.p) + '"' + ((q.s || '') === s[0] ? ' aria-current="true"' : '') + '>' + s[1] + ' <span class="cnt">' + (s[0] ? F.questions.filter(function (x) { return x.ans.s === s[0]; }).length : F.questions.length) + '</span></a>'; }).join('') + '<span class="pilldiv"></span>' + [['', 'Any priority'], ['A', 'A'], ['B', 'B'], ['C', 'C']].map(function (p) { return '<a href="' + qp(q.s, p[0]) + '"' + ((q.p || '') === p[0] ? ' aria-current="true"' : '') + '>' + p[1] + '</a>'; }).join('') + '</nav>' + search('qs', 'Search the questions') +
      '<div data-scope="qs">' + secs.map(function (s) {
        return '<h3>' + esc(s) + '</h3>' + plain(['#', 'Pri', 'Question', 'Status', 'From the call'], list.filter(function (x) { return x.sec === s; }).map(function (x) { var st = QSTATUS[x.ans.s]; return cells(['Q' + x.n, esc(x.pri), x.text, chip(st[0], st[1]), esc(x.ans.a || '') + ts(x.ans.ts)], 'question:' + x.n); }));
      }).join('') + '</div>';
  });
  H.drawer('question', function (n) {
    var x = QBY[n]; if (!x) return null;
    var st = QSTATUS[x.ans.s], rows = x.rows.map(function (id) { return ROWBY[id]; }).filter(Boolean), decs = D.decisions.filter(function (d) { return (d.qs || []).indexOf(+n) >= 0; });
    var t = [['q', 'Question', '<p class="cmap-text">' + x.text + '</p>' + (x.ans.a ? '<h3>From the call</h3><p>' + esc(x.ans.a) + '</p><p class="note">Recording: ' + esc(x.ans.ts) + '</p>' : '') + kv([['Priority', esc(x.pri)], ['Topic', esc(x.sec)], ['Source', esc(x.src)]]) + (decs.length ? '<h3>Decisions</h3>' + linkList(decs.map(function (d) { return ['decision:' + d.n, d.title]; })) : '')]];
    if (rows.length) t.push(['ev', 'Board evidence', linkList(rows.map(function (r) { return ['row:' + r.id, strip(r.title), esc(r.kind)]; }))]);
    return { title: 'Question ' + n, sub: chip(st[0], st[1]) + chip('Priority ' + x.pri), tabs: t };
  });
  H.drawer('row', function (id) {
    var r = ROWBY[id]; if (!r) return null;
    var qs = F.questions.filter(function (q) { return q.rows.indexOf(id) >= 0; });
    return { title: strip(r.title), sub: chip(r.kind) + chip(r.owner), wide: 1, tabs: [['a', 'Board row', '<p class="cmap-text">' + r.summary + '</p>' + r.body + (qs.length ? '<h3>Questions</h3>' + linkList(qs.map(qLine)) : '')]] };
  });
  H.route('/requests', function () {
    var c = function (s) { return s === 'Agreed' ? 'ok' : s === 'Promised' ? 'rec' : s === 'Open' ? 'bad' : 'warn'; };
    return page('requests', CALL) + ['Client', 'Us'].map(function (w) { return '<h3>' + (w === 'Us' ? 'From us' : 'From the client') + '</h3>' + plain(['Request', 'Status', 'Note', 'Recording'], D.requests.filter(function (r) { return r.from === w; }).map(function (r) { return cells(['<b>' + esc(r.title) + '</b>', chip(r.status, c(r.status)), esc(r.note), esc(r.ts)]); })); }).join('') +
      '<h3>The earlier access list</h3><p class="note">From the interview document. Items not covered on the call still stand.</p>' + ul(F.accessList.map(function (a) { return a.replace(/&amp;/g, '&'); }));
  });

  /* ─── evidence: inside HubSpot ─── */
  H.route('/hubspot', function (rest, q) {
    var v = V.portal, o = V.overview, g = V.gaps, cur = q.tab || 'headline', parts = { boundary: [1, 4], findings: [4, 8], pipelines: [8, 11], health: [11, 14], closed: [14, 18] }, p = parts[cur], extra = '', body;
    if (cur === 'pipelines') extra = C.bars('Recorded value by pipeline', '', v.blocks[9].rows.map(function (r) { return { label: strip(r.cells[0].h), value: +strip(r.cells[3].h).replace(/[$,]/g, '') }; }), H.usd);
    if (cur === 'health') extra = C.bars(v.blocks[12].head[2], '', v.blocks[12].rows.map(function (r) { return { label: strip(r.cells[0].h), value: parseFloat(strip(r.cells[2].h)) / 100, sub: strip(r.cells[1].h) }; }), function (x) { return H.pct(x); });
    if (cur === 'headline') body = '<p class="lead">' + fix(o.lede) + '</p>' + range(o, 0, 6);
    else if (cur === 'limits') body = '<p class="lead">' + g.lede + '</p>' + range(g, 0, 8);
    else if (cur === 'method') body = '<div class="standing">' + F.standing + '</div>' + blockHtml(g.blocks[8]);
    else body = range(v, p[0], p[0] + 1) + extra + range(v, p[0] + 1, p[1]);
    return head(v, PORTAL + STALE) + note(D.stale.hubspot) + blockHtml(v.blocks[0]) +
      tabs('/hubspot', [['headline', 'Headline'], ['boundary', 'Boundary questions'], ['findings', 'Findings'], ['pipelines', 'Pipelines'], ['health', 'Data health'], ['closed', 'What could not be read'], ['limits', 'Limitations'], ['method', 'How this was made']], cur) + body;
  });

  /* ─── evidence: correspondence, defects ─── */
  H.route('/correspondence', function (rest, q) {
    var v = V.corr, cur = q.tab || F.bands[0].id, band = F.bands.filter(function (b) { return b.id === cur; })[0] || F.bands[0];
    return head(v, PORTAL) + blockHtml(v.blocks[0]) + tabs('/correspondence', F.bands.map(function (b) { return [b.id, b.title, b.rows.length]; }), band.id) + blockHtml(v.blocks[1]) + '<p class="muted">' + band.sub + '</p>' +
      band.rows.map(function (r) { return '<div class="cmap-row ' + r.state + '"' + rowAttrs('corr:' + r.id) + '><div class="a">' + r.name + '<small>' + r.small + '</small></div><div class="b">' + r.b + '</div><div class="c">' + r.c + (D.stale.corr[r.id] ? '<br>' + STALE : '') + '</div></div>'; }).join('') + '<div style="height:14px"></div>' + blockHtml(v.blocks[5]);
  });
  H.drawer('corr', function (id) {
    var r = ROWS[id]; if (!r) return null;
    var linked = linkedTab(r.b), t = [['finding', 'Finding', (D.stale.corr[id] ? note(D.stale.corr[id]) : '') + '<p class="cmap-text">' + r.b + '</p>' + kv([['Band', r.band.title], ['Note', r.small]])]];
    if (linked) t.push(['linked', 'Linked', linked]);
    return { title: strip(r.name), sub: r.c, tabs: t };
  });
  H.route('/defects', function () {
    var v = V.defects;
    return head(v, OUT + PORTAL) + blockHtml(v.blocks[0]) + search('defects', 'Search the defects') + tableHtml(DEF, { scope: 'defects', ref: function (r) { return 'defect:' + r.id; }, mark: function (r) { return D.stale.defects[defName(r)] ? '<br>' + STALE : ''; } }) + blockHtml(v.blocks[2]);
  });
  H.drawer('defect', function (id) {
    var r = DEFBY[id]; if (!r) return null;
    var linked = linkedTab(r.cells[1].h), sn = D.stale.defects[defName(r)], t = [['inst', DEF.head[1], (sn ? note(sn) : '') + '<p class="cmap-text">' + r.cells[0].h + '</p><p class="cmap-text">' + r.cells[1].h + '</p>' + (r.section ? '<p class="note">' + r.section + '</p>' : '')]];
    if (linked) t.push(['linked', 'Linked', linked]);
    return { title: defName(r), tabs: t };
  });

  /* ─── evidence: forms ─── */
  H.route('/forms', function (rest, q) {
    var v = V.forms, cur = q.tab || 'clusters', lede = v.lede.replace('Click a site to open its pages.', 'Click a form to open it.');
    var top = head({ eyebrow: v.eyebrow, title: v.title, lede: lede }, OUT) + blockHtml(v.blocks[0]) + tabs('/forms', [['clusters', 'By cluster', F.clusters.length], ['sites', 'By site', F.sites.length], ['unreachable', 'Not reachable']], cur);
    if (cur === 'sites') {
      return top + blockHtml(v.blocks[13]) + C.bars('Forms by site', '', F.sites.filter(function (s) { return s.n; }).map(function (s) { return { label: s.key, value: s.n }; }), H.n0) + search('forms', 'Search the forms') +
        '<div data-scope="forms">' + F.sites.map(function (s) {
          var rows = s.forms.map(function (id) { var f = FORM[id]; return '<tr class="fr' + (f.hs ? '' : ' dark-row') + '"' + rowAttrs('form:' + id) + '><td>' + f.path + (f.title ? '<span class="ttl">' + f.title + '</span>' : '') + '</td><td>' + f.type + '</td><td>' + (f.fields != null ? f.fields : '') + '</td></tr>'; }).join('');
          return '<div class="site-h"><button type="button" data-d="property:' + esc(s.key) + '">' + s.name + '</button><span class="muted">' + esc(s.num.replace(/^(\d+)\s*/, '$1 ')) + ' · ' + s.change + '</span></div>' + s.note + (rows ? '<div class="tablewrap"><table><thead><tr><th>Page</th><th>System</th><th>Fields</th></tr></thead><tbody>' + rows + '</tbody></table></div>' : '');
        }).join('') + '</div>';
    }
    if (cur === 'unreachable') return top + range(v, 15, 19);
    return top + blockHtml(v.blocks[1]) + range(v, 2, 12, { slots: { 'fm-clusters': function () { return classList(F.clusters, 'cluster'); } } });
  });
  H.drawer('cluster', function (id) {
    var c = CLUSTER[id]; if (!c) return null;
    return { title: c.title, sub: '<span class="chip">' + esc(c.num.replace(/^(\d+)\s*/, '$1 ')) + '</span><span class="chip">' + c.change + '</span>', wide: 1, tabs: [['forms', 'Forms', c.body + (c.forms.length ? '<h3>Open a form</h3>' + linkList(c.forms.map(function (fid) { return ['form:' + fid, strip(FORM[fid].path)]; })) : '')]] };
  });
  H.drawer('form', function (id) {
    var f = FORM[id]; if (!f) return null;
    var p = PROP[host(f.site)], t = [
      ['fields', 'Fields', '<div class="fm' + (f.hs ? '' : ' nohs') + '"><div class="fm-h"><span class="fm-t">' + f.type + '</span></div>' + f.body + '</div>'],
      ['where', 'Where it sits', kv([['Page', '<a href="' + esc(f.url) + '" target="_blank" rel="noopener">' + f.path + '</a>'], ['Page title', f.title], ['Site', p ? linkList([['property:' + p.key, p.key]]) : esc(f.site)], ['In HubSpot', f.edit ? '<a href="' + esc(f.edit) + '" target="_blank" rel="noopener">' + f.editLabel + '</a>' : '']])]];
    if (f.cluster) t.push(['cluster', 'Cluster', linkList([['cluster:' + f.cluster, CLUSTER[f.cluster].title]])]);
    return { title: strip(f.path), sub: '<span class="chip ' + (f.hs ? 'ok' : 'bad') + '">' + f.type + '</span>', wide: 1, tabs: t };
  });

  /* ─── evidence: estate ─── */
  H.route('/estate', function (rest, q) {
    var v = V.estate, cur = q.tab || 'properties', ref = function (r) { return r.key ? 'property:' + r.key : ''; };
    var top = head(v, OUT + STALE) + note(D.stale.estate) + tabs('/estate', [['properties', 'Properties', F.menu.estate], ['instrumentation', 'Instrumentation', F.menu.matrix], ['seo', 'On-page SEO'], ['funnel', 'Inbound funnel'], ['social', 'Social', F.menu.social]], cur);
    if (cur === 'seo') return top + range(v, 11, 26, { table: function () { return { ref: function (r) { return r.key ? 'property:' + r.key + '&seo' : ''; } }; } });
    if (cur === 'instrumentation') {
      var yes = MATRIX.rows.filter(function (r) { return /yes/.test(strip(r.cells[2].h)); }).length;
      return top + '<p class="lead">' + V.matrix.lede + '</p><div class="tile" style="margin-bottom:14px;max-width:420px"><div class="k">' + MATRIX.head[2] + '</div>' + C.meter(yes, MATRIX.rows.length) + '</div>' + tableHtml(MATRIX, { ref: ref }) + range(V.matrix, 1);
    }
    if (cur === 'funnel') return top + '<p class="lead">' + V.funnel.lede + '</p>' + range(V.funnel, 0);
    if (cur === 'social') {
      var li = SOC.rows.filter(function (r) { return /^[\d,]+$/.test(strip(r.cells[3].h)); }).map(function (r) { return { label: strip(r.cells[1].h), value: +strip(r.cells[3].h).replace(/,/g, ''), sub: strip(r.cells[2].h) }; });
      return top + '<p class="lead">' + V.social.lede + '</p>' + C.bars(SOC.head[3], '', li, H.n0) + tableHtml(SOC, { ref: function (r) { return 'social:' + r.id; } }) + range(V.social, 1);
    }
    return top + search('props', 'Search the properties') + range(v, 0, 10, { table: function () { return { scope: 'props', ref: ref }; } });
  });
  H.drawer('property', function (ref) {
    var seoFirst = /&seo$/.test(ref), key = ref.replace(/&seo$/, ''), p = PROP[key]; if (!p) return null;
    var t = [];
    if (p.estate) t.push(['basic', 'Basic info', kvRow(p.estate.tb, p.estate.row)]);
    if (p.matrix) t.push(['inst', 'Instrumentation', kvRow(MATRIX, p.matrix)]);
    if (p.seo) t.push(['seo', 'SEO', kvRow(SEO_SITES, p.seo) + (p.seoPages.length ? '<h3>Pages</h3>' + tableHtml({ head: SEO_PAGES.head, rows: p.seoPages }) : '')]);
    if (p.site) t.push(['forms', 'Forms', '<p class="note">' + esc(p.site.num.replace(/^(\d+)\s*/, '$1 ')) + ' · ' + p.site.change + '</p>' + p.site.note + (p.site.forms.length ? linkList(p.site.forms.map(function (id) { return ['form:' + id, strip(FORM[id].path), FORM[id].type]; })) : '')]);
    if (p.social.length) t.push(['social', 'Social', linkList(p.social.map(function (r) { return ['social:' + r.id, strip(r.cells[0].h), esc(strip(r.cells[1].h))]; }))]);
    if (seoFirst) t.sort(function (a) { return a[0] === 'seo' ? -1 : 0; });
    return { title: p.key, wide: !!p.seo, tabs: t };
  });
  H.drawer('social', function (id) {
    var r = SOC.rows.filter(function (x) { return x.id === id; })[0]; if (!r) return null;
    var t = [['basic', 'Basic info', kvRow(SOC, r)]];
    if (r.keys.length) t.push(['props', 'Properties', linkList(r.keys.map(function (k) { return ['property:' + k, k]; }))]);
    return { title: strip(r.cells[0].h), tabs: t };
  });

  /* ─── evidence: platforms ─── */
  H.route('/platforms', function () { var v = V.platforms; return head(v, OUT + STALE) + note(D.stale.platforms) + tableHtml(PLAT, { ref: function (r) { return 'platform:' + r.id; } }) + range(v, 1); });
  H.drawer('platform', function (id) {
    var r = PLATBY[id]; if (!r) return null;
    var inProps = PROPS.filter(function (p) { return (p.estate && r.re.test(strip(p.estate.row.cells.map(function (c) { return c.h; }).join(' ')))) || (p.site && p.site.forms.some(function (f) { return r.re.test(strip(FORM[f].type)); })); });
    var defs = DEFS.filter(function (d) { return r.re.test(strip(d.cells[1].h)); }), rows = ROWLIST.filter(function (x) { return r.re.test(strip(x.b)); });
    var t = [['basic', 'Basic info', kvRow(PLAT, r)]];
    if (inProps.length) t.push(['props', 'Properties', linkList(inProps.map(function (p) { return ['property:' + p.key, p.key]; }))]);
    if (defs.length || rows.length) t.push(['findings', 'Findings', (defs.length ? '<h3>Defects</h3>' + linkList(defs.map(function (d) { return ['defect:' + d.id, defName(d)]; })) : '') + (rows.length ? '<h3>Correspondence map</h3>' + linkList(rows.map(function (x) { return ['corr:' + x.id, strip(x.name)]; })) : '')]);
    return { title: strip(r.cells[0].h), tabs: t };
  });

  /* ─── evidence: topical map, chips stay multi-select and the selection is the drawer's id ─── */
  var META = F.topicMeta, CATS = F.topicCats, EV = null, loading = null, CHUNK = 40;
  var selected = function () { var d = H.state.d; return d && d.indexOf('topics:') === 0 ? d.slice(7).split(',').filter(function (s) { return META[s]; }) : []; };
  function loadEv() { if (!loading) loading = fetch('topics-evidence.json').then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }).then(function (j) { EV = j; return j; }); return loading; }
  function selbar() {
    var bar = document.getElementById('tm-selbar'), sel = selected(); if (!bar) return;
    bar.classList.toggle('on', sel.length > 0);
    bar.querySelector('.tm-sel').innerHTML = sel.map(function (s) { return '<span class="tm-pill">' + esc(META[s].l) + '<button type="button" data-rm="' + s + '" aria-label="Remove ' + esc(META[s].l) + '">&times;</button></span>'; }).join('') + (sel.length ? '<button class="tm-clear" data-clear type="button">Clear all</button>' : '');
    document.querySelectorAll('.tm-chip').forEach(function (b) { b.setAttribute('aria-pressed', sel.indexOf(b.getAttribute('data-topic')) >= 0 ? 'true' : 'false'); });
  }
  function pageHtml(pid, sel) {
    var p = EV.pages[pid];
    var hows = sel.map(function (s) { var e = (EV.topics[s] || []).filter(function (r) { return r.p === pid; })[0]; if (!e) return ''; return '<p class="howlab">' + esc(META[s].l) + '</p><p class="how">' + esc(e.s) + '</p><p class="terms">' + e.tm.map(function (t) { return '<span class="tm-term">' + esc(t) + '</span>'; }).join('') + '</p>'; }).join('');
    var all = p.t.map(function (s) { return '<span class="tm-tt' + (sel.indexOf(s) > -1 ? ' sel' : '') + '">' + esc(META[s] ? META[s].l : s) + '</span>'; }).join('');
    return '<article class="tm-item"><h5><a href="' + esc(p.u) + '" target="_blank" rel="noopener">' + esc(p.ti || p.u) + '</a></h5><p class="src">' + esc(p.h) + ' · ' + p.w + ' words · ' + p.t.length + ' subtopics</p>' + (p.d ? '<p class="desc">' + esc(p.d) + '</p>' : '') + hows + '<div class="alltopics">' + all + '</div></article>';
  }
  function fillTopics(sel) {
    var L = document.getElementById('tm-list'), N = document.getElementById('tm-count'); if (!L) return;
    var sets = sel.map(function (s) { var m = {}; (EV.topics[s] || []).forEach(function (r) { m[r.p] = 1; }); return m; });
    var matches = Object.keys(sets[0]).filter(function (pid) { return sets.every(function (m) { return m[pid]; }); }).sort(function (a, b) { return EV.pages[b].w - EV.pages[a].w; });
    N.innerHTML = sel.length === 1 ? '<strong>' + matches.length + '</strong> page' + (matches.length === 1 ? '' : 's') + ' · ' + META[sel[0]].s + ' site' + (META[sel[0]].s === 1 ? '' : 's') + ' · all listed' : '<strong>' + matches.length + '</strong> page' + (matches.length === 1 ? '' : 's') + ' contain <strong>all ' + sel.length + '</strong> selected subtopics';
    if (!matches.length) { L.innerHTML = '<p class="muted">No page in the crawled corpus carries all ' + sel.length + ' of these subtopics together. Remove one to widen the result.</p>'; return; }
    var shown = 0;
    function more() {
      var old = document.getElementById('tm-more'); if (old) old.remove();
      var box = document.createElement('div'); box.innerHTML = matches.slice(shown, shown + CHUNK).map(function (pid) { return pageHtml(pid, sel); }).join('');
      while (box.firstChild) L.appendChild(box.firstChild);
      shown = Math.min(matches.length, shown + CHUNK);
      if (shown < matches.length) { var b = document.createElement('button'); b.className = 'tm-more'; b.id = 'tm-more'; b.type = 'button'; b.textContent = 'Show ' + Math.min(CHUNK, matches.length - shown) + ' more of ' + (matches.length - shown) + ' remaining'; b.addEventListener('click', more); L.appendChild(b); }
    }
    L.innerHTML = ''; more();
  }
  H.route('/topics', function () { return head(V.topics, OUT) + range(V.topics, 0, 1) + '<div class="tm-selbar" id="tm-selbar"><p class="t">Selected — pages must contain all of these</p><div class="tm-sel"></div></div>' + range(V.topics, 2); });
  H.drawer('topics', function (id) {
    var sel = id.split(',').filter(function (s) { return META[s]; }); if (!sel.length) return null;
    var d0 = META[sel[0]], cats = [];
    sel.forEach(function (s) { META[s].c.forEach(function (c) { if (cats.indexOf(c) < 0) cats.push(c); }); });
    return { title: sel.length === 1 ? d0.l : sel.length + ' subtopics combined', wide: 1,
      sub: cats.map(function (c) { return '<span class="tm-badge ' + c + '">' + esc(CATS[c]) + '</span>'; }).join('') + (sel.length > 1 ? sel.map(function (s) { return '<span class="tm-tt sel">' + esc(META[s].l) + '</span>'; }).join('') : ''),
      tabs: [['pages', 'Pages', (sel.length === 1 && d0.w ? '<p class="topic-why"><strong>Cannot sit in one category.</strong> ' + esc(d0.w) + '</p>' : '') + '<p class="topic-cnt" id="tm-count"></p><div id="tm-list"><p class="muted">Loading evidence…</p></div>']],
      after: function () { loadEv().then(function () { fillTopics(sel); }).catch(function () { var L = document.getElementById('tm-list'); if (L) L.innerHTML = '<p class="muted">Evidence could not be loaded.</p>'; }); } };
  });

  /* ─── shell ─── */
  document.getElementById('group-seg').innerHTML = BRANDS.map(function (g) { return '<button type="button" data-group="' + g[0] + '">' + esc(g[1]) + '</button>'; }).join('');
  function paintSeg() {
    var seg = document.getElementById('group-seg'), on = FILTERED[H.state.path];
    seg.setAttribute('aria-disabled', on ? 'false' : 'true');
    seg.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-group') === H.state.group ? 'true' : 'false'); if (!on) b.tabIndex = -1; else b.removeAttribute('tabindex'); });
  }
  H.onRender(paintSeg); H.onRender(selbar); H.onDrawer(selbar);
  document.addEventListener('click', function (e) {
    var g = e.target.closest('[data-group]');
    if (g && g.tagName === 'BUTTON') { H.setGroup(g.getAttribute('data-group')); return; }
    var chipEl = e.target.closest('.tm-chip');
    if (chipEl) { var s = chipEl.getAttribute('data-topic'), sel = selected(), i = sel.indexOf(s); if (i > -1) sel.splice(i, 1); else sel.push(s); if (sel.length) H.open('topics:' + sel.join(',')); else H.close(); return; }
    var rm = e.target.closest('[data-rm]');
    if (rm) { var left = selected().filter(function (x) { return x !== rm.getAttribute('data-rm'); }); if (left.length) H.open('topics:' + left.join(',')); else H.close(); return; }
    if (e.target.closest('[data-clear]')) H.close();
  });
  document.addEventListener('input', function (e) {
    var s = e.target.getAttribute && e.target.getAttribute('data-search'); if (!s) return;
    var t = e.target.value.toLowerCase();
    document.querySelectorAll('[data-scope="' + s + '"] tbody tr').forEach(function (tr) { if (tr.querySelector('td.sep')) return; tr.hidden = !!t && tr.textContent.toLowerCase().indexOf(t) < 0; });
    if (s === 'forms' || s === 'prod' || s === 'qs') document.querySelectorAll('[data-scope="' + s + '"] .tablewrap').forEach(function (w) { var any = w.querySelector('tbody tr:not([hidden])'); w.hidden = !any; if (w.previousElementSibling) w.previousElementSibling.hidden = !any; });
  });
  H.start();
})();
