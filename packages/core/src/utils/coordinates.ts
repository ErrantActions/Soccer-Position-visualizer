import type { NormalizedPoint } from '../types/soccer';
import { clamp01 } from './clamp';

export const toNormalizedPoint = (
  clientX: number,
  clientY: number,
  rect: DOMRect,
): NormalizedPoint => {
  const x = clamp01((clientX - rect.left) / rect.width);
  const y = clamp01((clientY - rect.top) / rect.height);
  return { x, y };
};

export const toPercent = (point: NormalizedPoint): { left: string; top: string } => ({
  left: `${point.x * 100}%`,
  top: `${point.y * 100}%`,
});
