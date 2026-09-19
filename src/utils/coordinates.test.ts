import { describe, expect, it } from 'vitest';
import { toNormalizedPoint } from './coordinates';

describe('coordinates utility', () => {
  it('converts pixel coordinates to normalized coordinates', () => {
    const rect = new DOMRect(100, 50, 400, 200);
    const point = toNormalizedPoint(300, 150, rect);

    expect(point.x).toBeCloseTo(0.5);
    expect(point.y).toBeCloseTo(0.5);
  });

  it('clamps coordinates to [0,1]', () => {
    const rect = new DOMRect(100, 50, 400, 200);
    const point = toNormalizedPoint(20, 280, rect);

    expect(point.x).toBe(0);
    expect(point.y).toBe(1);
  });
});
