import type { NormalizedPoint } from '../../types/soccer';
import { clamp } from '../../utils/clamp';
import { distance } from '../../utils/geometry';
import type { ActivePlayer, DangerCell, RoleBehaviorProfile, TacticalContext } from './types';

export const getDangerScoreAt = (point: NormalizedPoint): number => {
  const goalWeight = clamp(1 - point.x / 0.85, 0, 1);
  const centralWeight = clamp(1 - Math.abs(point.y - 0.5) / 0.5, 0, 1);
  const boxBonus = point.x <= 0.18 && point.y >= 0.3 && point.y <= 0.7 ? 0.25 : 0;
  const halfSpaceBonus = point.x >= 0.36 && point.x <= 0.82 && (Math.abs(point.y - 0.28) <= 0.08 || Math.abs(point.y - 0.72) <= 0.08) ? 0.12 : 0;
  return clamp(goalWeight * 0.6 + centralWeight * 0.3 + boxBonus + halfSpaceBonus, 0, 1);
};

export const createDangerMap = (cols = 18, rows = 12): DangerCell[] => {
  const cells: DangerCell[] = [];
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const x = (col + 0.5) / cols;
      const y = (row + 0.5) / rows;
      cells.push({ x, y, score: getDangerScoreAt({ x, y }) });
    }
  }
  return cells;
};

export const getDangerZoneTarget = (
  player: ActivePlayer,
  profile: RoleBehaviorProfile,
  context: TacticalContext,
): NormalizedPoint => {
  const ballBias = player.line === 'back' || player.role === 'CDM' ? 0.35 : 0.18;
  const protectY = 0.5 + (context.ball.y - 0.5) * ballBias;
  const protectX = player.line === 'back' ? Math.min(profile.anchor.x + 0.04, context.ball.x - 0.04) : profile.anchor.x + 0.03;

  return {
    x: clamp(protectX, profile.depthRange[0], profile.depthRange[1]),
    y: clamp(protectY, profile.widthRange[0], profile.widthRange[1]),
  };
};

export const scoreDangerCoverage = (position: NormalizedPoint): number => {
  const targetDanger = getDangerScoreAt(position);
  const bestProtectiveSpot = { x: clamp(position.x, 0.08, 0.32), y: clamp(position.y, 0.3, 0.7) };
  const protectionDistance = distance(position, bestProtectiveSpot);
  return clamp((targetDanger * 100) - protectionDistance * 160 + 30, 0, 100);
};
