# Pairnox website

Static site for [Pairnox](https://github.com/dbuffoni/Pairnox), published with GitHub Pages from `site/`.

- Plain HTML and CSS; a little JavaScript for the theme switch and the download block (reads the latest release from the GitHub API, so links never need editing). Works without JavaScript.
- Brand colours are CSS variables in `site/style.css`; the logo files come from the Pairnox branding set.
- `scripts/render-tui.js` turns terminal captures into screenshots; `scripts/social-preview.js` makes the 1280x640 social image; `scripts/check-links.py` checks local links (CI also checks external ones).
- `.github/workflows/pages.yml` checks and deploys on every push to `main`. In the repository settings, set Pages source to **GitHub Actions**.

Licence: MIT, see `LICENSE`.
