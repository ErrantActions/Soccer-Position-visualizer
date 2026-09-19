# Soccer Positioning Visualizer

A mobile-friendly coaching tool for youth soccer defenders. Select a defensive position, drag the ball anywhere on the field, and watch positioning guidance update in real time.

## Features

- Supported positions: **LB, LCB, RCB, RB, CDM**
- Unrestricted drag interaction using Pointer Events + pointer capture
- Live heatmap rendered with canvas
- Live recommended player marker
- Optional overlays:
  - Position boundaries
  - Tactical guides
  - Ball-to-player line
- Keyboard fallback for moving the ball with arrow keys
- Responsive field for phone, tablet, and desktop

## Run locally

```bash
npm install
npm run dev
```

To expose the Vite dev server on your network:

```bash
npm run dev -- --host 0.0.0.0
```

## Quality checks

```bash
npm test
npm run build
```

## Deploy with GitHub Pages

This repository can be deployed as a static site with GitHub Pages.

1. Push to the branch configured to run the Pages workflow.
2. In GitHub repository settings, set **Pages** to deploy from **GitHub Actions**.
3. The workflow will build the Vite app and publish the `dist` output.

The Vite config automatically uses the `/Soccer-Position-visualizer/` base path during GitHub Actions builds so assets resolve correctly on GitHub Pages.

## Preview a production build locally

```bash
npm run build
npm run preview
```
