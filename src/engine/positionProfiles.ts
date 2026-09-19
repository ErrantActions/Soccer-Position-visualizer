import type { PlayerPosition } from '../types/soccer';

export type PositionProfile = {
  baseX: number;
  baseY: number;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  lateralWeight: number;
  depthWeight: number;
  centralWeight: number;
  goalSideOffset: number;
  acceptableRadius: number;
  lineX: number;
};

export const POSITION_PROFILES: Record<PlayerPosition, PositionProfile> = {
  LB: {
    baseX: 0.31,
    baseY: 0.21,
    minX: 0.08,
    maxX: 0.55,
    minY: 0.05,
    maxY: 0.46,
    lateralWeight: 0.5,
    depthWeight: 0.5,
    centralWeight: 0.3,
    goalSideOffset: 0.06,
    acceptableRadius: 0.11,
    lineX: 0.3,
  },
  LCB: {
    baseX: 0.24,
    baseY: 0.39,
    minX: 0.05,
    maxX: 0.5,
    minY: 0.2,
    maxY: 0.58,
    lateralWeight: 0.25,
    depthWeight: 0.55,
    centralWeight: 0.55,
    goalSideOffset: 0.045,
    acceptableRadius: 0.1,
    lineX: 0.24,
  },
  RCB: {
    baseX: 0.24,
    baseY: 0.61,
    minX: 0.05,
    maxX: 0.5,
    minY: 0.42,
    maxY: 0.8,
    lateralWeight: 0.25,
    depthWeight: 0.55,
    centralWeight: 0.55,
    goalSideOffset: 0.045,
    acceptableRadius: 0.1,
    lineX: 0.24,
  },
  RB: {
    baseX: 0.31,
    baseY: 0.79,
    minX: 0.08,
    maxX: 0.55,
    minY: 0.54,
    maxY: 0.95,
    lateralWeight: 0.5,
    depthWeight: 0.5,
    centralWeight: 0.3,
    goalSideOffset: 0.06,
    acceptableRadius: 0.11,
    lineX: 0.3,
  },
  CDM: {
    baseX: 0.4,
    baseY: 0.5,
    minX: 0.2,
    maxX: 0.7,
    minY: 0.3,
    maxY: 0.7,
    lateralWeight: 0.28,
    depthWeight: 0.48,
    centralWeight: 0.75,
    goalSideOffset: 0.08,
    acceptableRadius: 0.13,
    lineX: 0.42,
  },
};
