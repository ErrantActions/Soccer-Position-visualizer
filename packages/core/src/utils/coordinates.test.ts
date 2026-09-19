import { describe, expect, it } from 'vitest';
import { toNormalizedPoint, toPercent } from './coordinates';

describe('coordinates utility', () => {
  it('converts pixel coordinates to normalized coordinates', () => {
    const rect = { left: 100, top: 50, width: 400, height: 200 };
    const point = toNormalizedPoint(300, 150, rect);

    expect(point.x).toBeCloseTo(0.5);
    expect(point.y).toBeCloseTo(0.5);
  });

  it('clamps coordinates to [0,1]', () => {
    const rect = { left: 100, top: 50, width: 400, height: 200 };
    const point = toNormalizedPoint(20, 280, rect);

    expect(point.x).toBe(0);
    expect(point.y).toBe(1);
  });

  it('converts normalized points into percentage values', () => {
    expect(toPercent({ x: 0.25, y: 0.75 })).toEqual({ left: '25%', top: '75%' });
  });
});
