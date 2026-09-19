import { clamp } from '../../utils/clamp';
import { distance } from '../../utils/geometry';
import type { ActivePlayer, SupportTriangle, TacticalContext } from './types';
import type { NormalizedPoint } from '../../types/soccer';

export const buildSupportTriangles = (anchors: Record<string, NormalizedPoint>, players: ActivePlayer[]): SupportTriangle[] => {
  if (players.length < 3) {
    return [];
  }

  const ordered = [...players].sort((a, b) => anchors[a.id].x - anchors[b.id].x);
  const triangles: SupportTriangle[] = [];
  for (let index = 0; index <= ordered.length - 3; index += 1) {
    triangles.push({ playerIds: [ordered[index].id, ordered[index + 1].id, ordered[index + 2].id] });
  }
  return triangles;
};

export const getSupportTarget = (
  player: ActivePlayer,
  anchors: Record<string, NormalizedPoint>,
  context: TacticalContext,
): NormalizedPoint => {
  const teammates = Object.entries(anchors)
    .filter(([id]) => id !== player.id)
    .sort((a, b) => distance(a[1], anchors[player.id]) - distance(b[1], anchors[player.id]))
    .slice(0, 2)
    .map(([, point]) => point);

  if (teammates.length === 0) {
    return anchors[player.id];
  }

  const average = teammates.reduce(
    (acc, point) => ({ x: acc.x + point.x / teammates.length, y: acc.y + point.y / teammates.length }),
    { x: 0, y: 0 },
  );
  const depthOffset = player.line === 'forward' ? 0.05 : context.ballCarrierTeam === 'own' ? 0.03 : -0.02;

  return {
    x: clamp((average.x + anchors[player.id].x) / 2 + depthOffset, 0, 1),
    y: clamp((average.y + anchors[player.id].y) / 2, 0, 1),
  };
};

export const scoreSupport = (position: NormalizedPoint, supportTarget: NormalizedPoint): number =>
  clamp(100 - distance(position, supportTarget) * 220, 0, 100);
