# Soccer Positioning Visualizer

A coaching tool for youth soccer defenders. Select a defensive position, move the ball anywhere on the field, and watch positioning guidance update in real time.

## Workspace structure

- `/home/runner/work/Soccer-Position-visualizer/Soccer-Position-visualizer/src` — existing Vite web app
- `/home/runner/work/Soccer-Position-visualizer/Soccer-Position-visualizer/packages/core` — shared TypeScript positioning engine, utilities, and types
- `/home/runner/work/Soccer-Position-visualizer/Soccer-Position-visualizer/apps/native` — React Native shell for iPhone, Android, tablets, and Windows

## Features

- Supported positions: **LB, LCB, RCB, RB, CDM**
- Shared TypeScript positioning engine across web and native shells
- Native-ready field rendering with `react-native-svg`
- Native-ready heatmap rendering with Skia
- Responsive field behavior for phone, tablet, and desktop-class layouts
- Optional overlays:
  - Position boundaries
  - Tactical guides
  - Ball-to-player line
- Keyboard fallback for moving the ball with arrow keys in the web app

## Run the web app locally

```bash
npm install
npm run dev
```

## Validate the web app

```bash
npm test
npm run build
```

## Native app setup

The native shell lives in `/home/runner/work/Soccer-Position-visualizer/Soccer-Position-visualizer/apps/native` and reuses the shared core module from `/home/runner/work/Soccer-Position-visualizer/Soccer-Position-visualizer/packages/core`.

Install native dependencies inside the native app folder, then run the target you need:

```bash
cd /home/runner/work/Soccer-Position-visualizer/Soccer-Position-visualizer/apps/native
npm install
npm run start
npm run ios
npm run android
npm run windows
```

To finish platform packaging, generate or attach the platform projects that React Native and `react-native-windows` expect in your local development environment.
