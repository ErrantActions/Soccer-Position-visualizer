import type { PlayerPosition, PositionBoundary } from '../types/soccer';

export const POSITION_BOUNDARIES: Record<PlayerPosition, PositionBoundary> = {
  LB: {
    position: 'LB',
    label: 'LB Area',
    points: [
      { x: 0.07, y: 0.03 },
      { x: 0.56, y: 0.08 },
      { x: 0.56, y: 0.46 },
      { x: 0.12, y: 0.5 },
    ],
  },
  LCB: {
    position: 'LCB',
    label: 'LCB Area',
    points: [
      { x: 0.05, y: 0.2 },
      { x: 0.53, y: 0.24 },
      { x: 0.49, y: 0.58 },
      { x: 0.04, y: 0.62 },
    ],
  },
  RCB: {
    position: 'RCB',
    label: 'RCB Area',
    points: [
      { x: 0.05, y: 0.38 },
      { x: 0.49, y: 0.42 },
      { x: 0.53, y: 0.76 },
      { x: 0.04, y: 0.8 },
    ],
  },
  RB: {
    position: 'RB',
    label: 'RB Area',
    points: [
      { x: 0.12, y: 0.5 },
      { x: 0.56, y: 0.54 },
      { x: 0.56, y: 0.92 },
      { x: 0.07, y: 0.97 },
    ],
  },
  CDM: {
    position: 'CDM',
    label: 'CDM Area',
    points: [
      { x: 0.2, y: 0.3 },
      { x: 0.7, y: 0.33 },
      { x: 0.74, y: 0.67 },
      { x: 0.2, y: 0.7 },
    ],
  },
};
