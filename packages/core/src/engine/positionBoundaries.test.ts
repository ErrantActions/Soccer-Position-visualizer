import { describe, expect, it } from 'vitest';
import { POSITION_BOUNDARIES } from './positionBoundaries';

const positions = ['LB', 'LCB', 'RCB', 'RB', 'CDM'] as const;

describe('position boundaries', () => {
  it('defines boundaries for every supported position', () => {
    for (const position of positions) {
      expect(POSITION_BOUNDARIES[position]).toBeDefined();
      expect(POSITION_BOUNDARIES[position].points.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('keeps every boundary point normalized', () => {
    for (const position of positions) {
      for (const point of POSITION_BOUNDARIES[position].points) {
        expect(point.x).toBeGreaterThanOrEqual(0);
        expect(point.x).toBeLessThanOrEqual(1);
        expect(point.y).toBeGreaterThanOrEqual(0);
        expect(point.y).toBeLessThanOrEqual(1);
      }
    }
  });
});
