// Generates the 1280x640 social preview from the brand SVGs.
const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const icon = fs.readFileSync('site/assets/pairnox-logo-icon.svg', 'utf8');
  const html = `<body style="margin:0;width:1280px;height:640px;background:#0D1117;display:flex;align-items:center;justify-content:center;gap:56px;font-family:system-ui,sans-serif">
  <div style="width:260px;height:260px">${icon.replace('width="512" height="512"', 'width="260" height="260"')}</div>
  <div><div style="font-size:120px;font-weight:800;color:#fff;line-height:1">Pair<span style="color:#1E88E5">nox</span></div>
  <div style="font-size:38px;color:#9aa7b4;margin-top:18px">Twin-pane file manager<br>for desktop and terminal</div></div></body>`;
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 640 } });
  await p.setContent(html);
  await p.screenshot({ path: 'site/assets/social-preview.png' });
  await b.close();
})();
