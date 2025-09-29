# Development notes

This file contains developer documentation moved from the root README to keep the profile repository clean.

## Project structure

```
.
├─ src/
│  ├─ main.ts
│  ├─ styles.css
│  ├─ config.ts          # Motion config with strong typing
│  └─ modules/
│     ├─ typing.ts       # Typewriter + caret positioning
│     ├─ motion.ts       # Dot animation physics/curves
│     └─ ui.ts           # Info panel interactions
├─ fonts/
│  └─ Baskerville.ttf
├─ index.html
├─ vite.config.ts
├─ tsconfig.json
└─ .github/workflows/deploy.yml
```

## Scripts

- dev: start the dev server
- build: production build
- preview: preview the production build locally
- typecheck: run TypeScript in noEmit mode

## Run locally

```sh
npm install
npm run dev
```

## Build

```sh
npm run build
npm run preview
```

## Deploy to GitHub Pages

1. Push to main.
2. Enable Pages with Source = GitHub Actions.
3. Workflow builds with `BASE_PATH` and deploys via `actions/deploy-pages`.

Local Pages-like base:

```sh
BASE_PATH=/ npm run build
```
