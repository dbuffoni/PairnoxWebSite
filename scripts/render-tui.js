// Renders the text captures of the Pairnox terminal UI to PNG images.
// Usage: node scripts/render-tui.js <capture.txt> <out.png> [--light]
const { chromium } = require('playwright');
const fs = require('fs');
const [, , input, output, theme] = process.argv;
(async () => {
  let text = fs.readFileSync(input, 'utf8').replace(/\s+$/, '');
  // Replace the temporary folder names of the capture with friendly ones.
  text = text.replace(/\/tmp\/\.tmp\w+\/left\s*/g, (m) => '~/Projects'.padEnd(m.length))
             .replace(/\/tmp\/\.tmp\w+\/right\s*/g, (m) => '~/Pictures'.padEnd(m.length));
  const light = theme === '--light';
  const esc = text.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const html = `<body style="margin:0;background:${light ? '#f6f8fa' : '#0d1117'}">
  <pre style="margin:0;padding:20px 24px;display:inline-block;font:15px/1.25 'DejaVu Sans Mono',monospace;color:${light ? '#111418' : '#e6edf3'}">${esc}</pre></body>`;
  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 2 });
  await page.setContent(html);
  const el = await page.$('pre');
  await el.screenshot({ path: output });
  await browser.close();
})();
