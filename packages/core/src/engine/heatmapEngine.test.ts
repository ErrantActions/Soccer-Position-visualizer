import { describe, expect, it } from 'vitest';
import { getHeatmapCells, scorePosition } from './heatmapEngine';
import { getRecommendedPosition } from './positioningEngine';

describe('heatmap engine', () => {
  it('keeps every score between 0 and 100', () => {
    const cells = getHeatmapCells({ x: 0.35, y: 0.55 }, 'CDM', 12, 8);
    for (const cell of cells) {
      expect(cell.score).toBeGreaterThanOrEqual(0);
      expect(cell.score).toBeLessThanOrEqual(100);
    }
  });

  it('scores ideal position better than poor position', () => {
    const ball = { x: 0.18, y: 0.18 };
    const recommendation = getRecommendedPosition({ ball, position: 'LB' });

    const idealScore = scorePosition(recommendation.idealPosition, ball, 'LB');
    const poorScore = scorePosition({ x: 0.95, y: 0.95 }, ball, 'LB');

    expect(idealScore).toBeGreaterThan(poorScore);
  });
});
