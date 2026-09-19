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

## Run with Docker

Build the image:

```bash
docker build -t soccer-position-visualizer .
```

Run it:

```bash
docker run --rm -p 8080:80 soccer-position-visualizer
```

Then open `http://<your-unraid-host>:8080`.

The container builds the Vite app and serves the static files with nginx, so it is suitable for an Unraid deployment.
