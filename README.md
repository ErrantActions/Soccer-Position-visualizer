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

## Quality checks

```bash
npm test
npm run build
```
