# Daywell

**A little more room for life.** A free, account-free personal planning app for everyday people. Warm paper tones, forest green, a friendly flower, and a calmer approach to getting things done.

Live app: https://vthilakraj.github.io/daywell/

You can also deploy your own copy with GitHub Pages, Vercel, or Netlify.

Source: https://github.com/Vthilakraj/daywell

```bash
git clone https://github.com/Vthilakraj/daywell.git
cd daywell
npm ci
npm run dev
```

## What works

- **My day:** create, edit, complete, delete, prioritize, categorize, and date tasks; search and filter the selected day's tasks.
- **My week:** Monday–Sunday calendar, previous/next weeks, task totals, and day selection.
- **Routines:** custom habits with daily check-ins and week-by-week history.
- **Focus room:** 25- or 45-minute focus sessions, a 5-minute break, pause/resume/reset, and completed focus-minute totals.
- **Reflections:** date-based mood check-ins, small wins, and tomorrow's intentions, saved while typing.
- **Starting points:** four editable, three-step templates for mornings, study, work, and a weekly reset.
- **Your data:** local storage, optional first name, validated JSON import/export, and a confirmed fresh start.
- **Responsive and accessible:** mobile navigation, visible keyboard focus, labeled controls, reduced-motion support, modal focus trapping, Escape to close, and a skip link.

No API keys, database, paid service, or login are required. There are no simulated AI responses or placeholder actions.

## Run locally

Install **Node.js 22.12+** (Node 24 also works), then run:

```bash
npm ci
npm run dev
```

Open the URL Vite prints, normally `http://localhost:5173`.

```bash
npm test          # Automated interaction and data tests
npm run build    # TypeScript check + optimized production bundle
npm run preview  # Preview the production build
```

The production files are in `dist/`.

## Put this project on your GitHub

### Easiest: upload the source ZIP

1. Download and extract `daywell-source.zip`.
2. On GitHub, create a new repository named `daywell`. Choose Public if everyone should be able to clone the code.
3. Select **uploading an existing file**, upload the contents of the extracted `daywell` folder, and commit them. Include dotfiles and the `.github` folder for the workflows; using Git below reliably includes them.

### Using Git

Create an empty GitHub repository first, then run these commands in the extracted project folder. Replace `YOUR_USERNAME` with your own username.

```bash
git init -b main
git add .
git commit -m "Build Daywell personal planning app"
git remote add origin https://github.com/YOUR_USERNAME/daywell.git
git push -u origin main
```

Once the repository exists, anyone can clone and run it:

```bash
git clone https://github.com/YOUR_USERNAME/daywell.git
cd daywell
npm ci
npm run dev
```

Do not commit API tokens, backups with personal data, `.env` files, `node_modules`, or `dist`. The included `.gitignore` covers local build and environment files. GitHub authentication happens through your normal Git credential manager or `gh auth login`; never paste tokens into the code.

## Deploy for everyone

### GitHub Pages (free for public repositories)

This repository is published at `https://vthilakraj.github.io/daywell/`. For a fork, enable Pages in your own repository settings before running the deployment workflow.

1. Push this project, including `.github/workflows/pages.yml`, to GitHub.
2. Open **Settings → Pages → Build and deployment → Source → GitHub Actions**.
3. In **Actions → Deploy to GitHub Pages**, choose **Run workflow**. Run this workflow again whenever you want to publish an update. CI still tests and builds every push automatically.
4. GitHub shows the published URL on the deployment and Pages settings screens.

Vite uses relative asset paths, so it supports repository URLs such as `https://YOUR_USERNAME.github.io/daywell/` without changing the base path. The app uses internal views rather than server routes, so no rewrite is needed.

### Vercel

Import the GitHub repository. Framework: **Vite**. Build command: `npm run build`. Output directory: `dist`. No environment variables needed. A `vercel.json` is included.

### Netlify

Import the GitHub repository. The included `netlify.toml` specifies the build and publish directory. No environment variables needed. Alternatively, drag the contents of the built `dist` folder into Netlify's manual deploy screen.

### Any static host

Run `npm ci && npm run build`, then serve the `dist` directory over HTTP(S). Opening `dist/index.html` directly through a `file://` URL is not supported by browser module rules.

## Data and privacy

Data is stored under `daywell:v1` in this browser's local storage. Each visitor has separate plans. There is **no server database or cross-device account sync**. Clearing site data, private browsing, a new device, a different browser, or a new deployment domain may make previous data unavailable. Export a backup from **Settings & backup** before changing domains or devices, then restore it on the new one. Treat backup files as personal information.

Restore validates the entire file and asks before replacing existing plans. Restoring does not merge records and always resets a running timer. The app limits backups to 2 MB, 10,000 tasks, and 100 routines.

Timer time is calculated from a wall-clock deadline. Switching sections or putting the tab in the background does not stop it. A completed session is credited once, to the date it started. Closing the browser cannot generate a notification; the finished session is reconciled on reopening. An unfinished reset session does not count toward focus minutes. Changing the system clock can affect the timer.

Other open tabs receive local-storage updates. Simultaneous edits can overwrite each other; use one editing tab for predictable results. This is a personal browser-local tool, not a shared team workspace.

The app loads DM Sans and DM Serif Display from Google Fonts, with local font fallbacks if the network is unavailable. Lucide icons ship inside the app bundle. It contains no analytics. It is not an installable PWA and does not promise offline reloads.

## Project map

```text
src/
  App.tsx           Main interface and app interactions
  model.ts          Data model, calendar helpers, timers, backup validation
  Flower.tsx        Original SVG flower illustration
  styles.css        Responsive visual system
  main.tsx          React entry point
public/
  favicon.svg       Original app mark
tests/
  model.test.ts     Date, timer, persistence, and backup tests
  app.test.tsx      App workflow tests
.github/workflows/
  ci.yml            Tests and build on pushes / pull requests
  pages.yml         GitHub Pages deployment
```

## Customize

- Brand and interface copy: `src/App.tsx` and `index.html`.
- Colors, spacing, and typography: `src/styles.css`.
- Categories and template tasks: `src/model.ts`.
- Icon and flower: `public/favicon.svg` and `src/Flower.tsx`.
- To add AI, accounts, or cloud sync later, add a secure backend. Keep secret keys on that backend rather than embedding them in client code. Add a versioned migration before changing the persisted data shape.

## Verification

The included automated tests exercise real app workflows in jsdom and data logic. `npm run build` runs TypeScript and produces the production bundle. Interactive visual/browser QA was not available in the creation environment; perform a quick check on your target phones and browsers before a broad release.

## License

MIT — free to use, modify, and share. See `LICENSE`. Third-party dependencies retain their own licenses.
