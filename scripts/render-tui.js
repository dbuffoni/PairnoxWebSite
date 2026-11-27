// Renders the text captures of the Pairnox terminal UI to PNG images.
// Usage: node scripts/render-tui.js <capture.txt> <out.png> [--logo icon.png]
// With --logo, the block of half-block characters (the logo drawn in text) is
// replaced by the real logo image, because the capture has no colours.
const { chromium } = require('playwright');
const fs = require('fs');
const args = process.argv.slice(2);
const [input, output] = args;
const logo = args.includes('--logo') ? args[args.indexOf('--logo') + 1] : null;
(async () => {
  let text = fs.readFileSync(input, 'utf8').replace(/\s+$/, '');
  text = text.replace(/\/tmp\/\.tmp\w+\/left\s*/g, (m) => '~/Projects'.padEnd(m.length))
             .replace(/\/tmp\/\.tmp\w+\/right\s*/g, (m) => '~/Pictures'.padEnd(m.length));
  const lines = text.split('\n');
  let box = null;
  if (logo) {
    const idx = lines.map((l, i) => (/▀{6,}/.test(l) ? i : -1)).filter((i) => i >= 0);
    const col = lines[idx[0]].indexOf('▀');
    const len = (lines[idx[0]].match(/▀+/) || [''])[0].length;
    box = { row: idx[0], rows: idx.length, col, len };
    idx.forEach((i) => { lines[i] = lines[i].replace(/▀+/, ' '.repeat(len)); });
  }
  const esc = lines.join('\n').replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const html = `<body style="margin:0;background:#0d1117"><div id="w" style="position:relative;display:inline-block;padding:20px 24px">
  <pre id="p" style="margin:0;font:15px/1.25 'DejaVu Sans Mono',monospace;color:#e6edf3">${esc}</pre></div></body>`;
  const b = await chromium.launch();
  const page = await b.newPage({ deviceScaleFactor: 2 });
  await page.setContent(html);
  if (box) {
    const dataUrl = 'data:image/png;base64,' + fs.readFileSync(logo).toString('base64');
    await page.evaluate(({ box, dataUrl }) => {
      const p = document.getElementById('p');
      const m = document.createElement('span'); m.textContent = 'MMMMMMMMMM'; m.style.cssText = 'position:absolute;visibility:hidden;font:15px/1.25 "DejaVu Sans Mono",monospace';
      document.body.appendChild(m); const cw = m.getBoundingClientRect().width / 10; const ch = 15 * 1.25;
      const img = document.createElement('img'); img.src = dataUrl;
      const h = box.rows * ch; img.style.cssText = `position:absolute;height:${h}px;width:${h}px;left:${24 + (box.col + box.len / 2) * cw - h / 2}px;top:${20 + box.row * ch}px`;
      p.parentElement.appendChild(img);
    }, { box, dataUrl });
    await page.waitForTimeout(300);
  }
  await (await page.$('#w')).screenshot({ path: output });
  await b.close();
})();
