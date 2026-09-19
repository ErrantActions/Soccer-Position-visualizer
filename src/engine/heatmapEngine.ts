import { POSITION_BOUNDARIES } from './positionBoundaries';
import { getRecommendedPosition } from './positioningEngine';
import type { HeatmapCell, NormalizedPoint, PlayerPosition } from '../types/soccer';
import { clamp } from '../utils/clamp';
import { distance, isPointInPolygon } from '../utils/geometry';
import { smoothstep } from '../utils/interpolation';

const CENTRAL_Y = 0.5;

export const scorePosition = (
  candidate: NormalizedPoint,
  ball: NormalizedPoint,
  position: PlayerPosition,
): number => {
  const recommendation = getRecommendedPosition({ ball, position });
  const ideal = recommendation.idealPosition;

  const distPenalty = Math.min(1, distance(candidate, ideal) / recommendation.acceptableRadius) * 58;
  const goalSidePenalty = candidate.x > ball.x ? 25 : 0;
  const centralPenalty = Math.abs(candidate.y - CENTRAL_Y) * smoothstep(0.45, 1, 1 - ball.x) * 28;
  const depthPenalty = Math.abs(candidate.x - ideal.x) * 40;
  const lineConnectionPenalty = Math.abs((candidate.x + 0.05) - ideal.x) * 15;
  const dangerSpacePenalty = smoothstep(0, 0.3, candidate.x) * Math.abs(candidate.y - CENTRAL_Y) * 22;

  const score =
    100 - distPenalty - goalSidePenalty - centralPenalty - depthPenalty - lineConnectionPenalty - dangerSpacePenalty;

  return clamp(score, 0, 100);
};

export const isPointInsidePositionBoundary = (point: NormalizedPoint, position: PlayerPosition): boolean =>
  isPointInPolygon(point, POSITION_BOUNDARIES[position].points);

export const getHeatmapCells = (
  ball: NormalizedPoint,
  position: PlayerPosition,
  cols = 68,
  rows = 44,
): HeatmapCell[] => {
  const cells: HeatmapCell[] = [];

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const x = (col + 0.5) / cols;
      const y = (row + 0.5) / rows;

      if (!isPointInsidePositionBoundary({ x, y }, position)) {
        continue;
      }

      cells.push({ x, y, score: scorePosition({ x, y }, ball, position) });
    }
  }

  return cells;
};

export const heatmapColorForScore = (score: number): string => {
  if (score >= 90) return 'rgba(34, 197, 94, 0.68)';
  if (score >= 75) return 'rgba(132, 204, 22, 0.62)';
  if (score >= 60) return 'rgba(250, 204, 21, 0.56)';
  if (score >= 45) return 'rgba(251, 146, 60, 0.5)';
  if (score >= 25) return 'rgba(239, 68, 68, 0.46)';
  return 'rgba(185, 28, 28, 0.44)';
};
