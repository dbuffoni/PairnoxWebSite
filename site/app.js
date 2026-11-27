(function () {
  'use strict';
  var REPO = 'dbuffoni/Pairnox';
  var LATEST = 'https://github.com/' + REPO + '/releases/latest';

  // Theme switch (follows the system until the visitor chooses).
  var tb = document.getElementById('theme');
  if (tb) {
    tb.hidden = false;
    tb.addEventListener('click', function () {
      var root = document.documentElement;
      var dark = root.getAttribute('data-theme') === 'dark' ||
        (!root.getAttribute('data-theme') && matchMedia('(prefers-color-scheme: dark)').matches);
      var next = dark ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
    });
  }

  function detectOS() {
    var p = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || '';
    var ua = navigator.userAgent || '';
    var s = (p + ' ' + ua).toLowerCase();
    if (s.indexOf('win') >= 0) return 'windows';
    if (s.indexOf('mac') >= 0 && s.indexOf('iphone') < 0 && s.indexOf('ipad') < 0) return 'macos';
    if (s.indexOf('linux') >= 0 && s.indexOf('android') < 0) return 'linux';
    return 'other';
  }
  var NAMES = { linux: 'Linux', windows: 'Windows', macos: 'macOS', source: 'Source', agent: 'Terminal only', other: 'Other' };

  function classify(name) {
    var n = name.toLowerCase();
    if (/\.sha256|\.sig$|\.txt$|sums/.test(n)) return null;
    if (/appimage|\.deb$|\.rpm$|\.flatpak$/.test(n)) return 'linux';
    if (/\.(msi|exe)$|windows|win64/.test(n)) return 'windows';
    if (/\.dmg$|macos|darwin/.test(n)) return 'macos';
    if (/agent|pnxr-(linux|musl)/.test(n)) return 'agent';
    if (/\.zip$/.test(n) && /win/.test(n)) return 'windows';
    return 'other';
  }
  function size(b) {
    if (b > 1048576) return (b / 1048576).toFixed(1) + ' MiB';
    return Math.max(1, Math.round(b / 1024)) + ' KiB';
  }
  function el(tag, attrs, text) {
    var e = document.createElement(tag);
    for (var k in (attrs || {})) e.setAttribute(k, attrs[k]);
    if (text) e.textContent = text;
    return e;
  }

  fetch('https://api.github.com/repos/' + REPO + '/releases/latest', { headers: { Accept: 'application/vnd.github+json' } })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (rel) {
      var version = rel.tag_name || rel.name;
      var assets = (rel.assets || []).map(function (a) {
        return { name: a.name, url: a.browser_download_url, size: a.size, sha: (a.digest || '').replace('sha256:', ''), os: classify(a.name) };
      }).filter(function (a) { return a.os; });
      var v = document.getElementById('ver'); if (v) v.textContent = version;

      var os = detectOS();
      var mine = assets.filter(function (a) { return a.os === os; })[0];
      var title = document.getElementById('dl-title'), sub = document.getElementById('dl-sub'),
          btn = document.getElementById('dl-btn'), meta = document.getElementById('dl-meta');
      if (mine) {
        title.textContent = 'Pairnox ' + version + ' for ' + NAMES[os];
        sub.textContent = mine.name;
        btn.textContent = 'Download for ' + NAMES[os]; btn.href = mine.url;
        meta.textContent = size(mine.size) + (mine.sha ? ' · SHA-256 ' + mine.sha : '');
      } else {
        title.textContent = 'Pairnox ' + version;
        sub.textContent = os === 'windows' || os === 'macos'
          ? 'No ' + NAMES[os] + ' build in this release yet. You can build from source, or use the files below.'
          : 'Choose the file for your system below.';
        btn.textContent = 'Open the latest release'; btn.href = LATEST;
      }

      if (!assets.length) {
        var box = document.getElementById('dl-all');
        box.textContent = '';
        var note = el('p', {}, 'This release has no downloadable files attached yet. Windows and macOS builds are planned; meanwhile you can build from source (see the install notes) or open ');
        note.appendChild(el('a', { href: LATEST }, 'the release page'));
        note.appendChild(document.createTextNode('.'));
        box.appendChild(note);
        return;
      }
      var rows = document.getElementById('dl-rows');
      var order = [os, 'linux', 'windows', 'macos', 'agent', 'other'];
      var seen = {};
      order.forEach(function (o) {
        if (seen[o]) return; seen[o] = 1;
        var list = assets.filter(function (a) { return a.os === o; });
        if (!list.length) {
          if (o === 'windows' || o === 'macos') {
            var tr = el('tr'); tr.appendChild(el('th', { scope: 'row' }, NAMES[o]));
            var td = el('td', { colspan: 3 }, 'Not in this release yet. See the install notes.'); tr.appendChild(td); rows.appendChild(tr);
          }
          return;
        }
        list.forEach(function (a) {
          var tr = el('tr'); tr.appendChild(el('th', { scope: 'row' }, NAMES[o]));
          var td = el('td'); td.appendChild(el('a', { href: a.url }, a.name)); tr.appendChild(td);
          tr.appendChild(el('td', {}, size(a.size)));
          var c = el('td'); c.appendChild(el('code', {}, a.sha || 'see release page')); tr.appendChild(c);
          rows.appendChild(tr);
        });
      });
      var src = el('tr'); src.appendChild(el('th', { scope: 'row' }, 'Source'));
      var sd = el('td', { colspan: 3 }); sd.appendChild(el('a', { href: rel.zipball_url ? 'https://github.com/' + REPO + '/archive/refs/tags/' + rel.tag_name + '.zip' : LATEST }, 'Source code (zip)'));
      src.appendChild(sd); rows.appendChild(src);
    })
    .catch(function () {
      var all = document.getElementById('dl-all'); if (all) all.style.display = 'none';
    });
})();
