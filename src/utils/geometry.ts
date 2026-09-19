import type { NormalizedPoint } from '../types/soccer';

export const distance = (a: NormalizedPoint, b: NormalizedPoint): number => {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
};

export const isPointInPolygon = (point: NormalizedPoint, polygon: NormalizedPoint[]): boolean => {
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const pi = polygon[i];
    const pj = polygon[j];

    const intersects =
      pi.y > point.y !== pj.y > point.y &&
      point.x < ((pj.x - pi.x) * (point.y - pi.y)) / (pj.y - pi.y + Number.EPSILON) + pi.x;

    if (intersects) {
      inside = !inside;
    }
  }

  return inside;
};
