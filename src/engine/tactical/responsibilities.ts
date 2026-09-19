import { distance } from '../../utils/geometry';
import type { ActivePlayer, ResponsibilityRole, TacticalContext } from './types';

export const assignResponsibilities = (
  players: ActivePlayer[],
  anchors: Record<string, { x: number; y: number }>,
  context: TacticalContext,
): Record<string, ResponsibilityRole> => {
  const sortable = players
    .filter((player) => player.role !== 'GK')
    .map((player) => ({
      player,
      distance: distance(anchors[player.id], context.ball),
      centralBias: Math.abs(anchors[player.id].y - 0.5),
    }))
    .sort((a, b) => a.distance - b.distance || a.centralBias - b.centralBias);

  const assignments: Record<string, ResponsibilityRole> = {};
  if (sortable[0]) assignments[sortable[0].player.id] = 'pressure';
  if (sortable[1]) assignments[sortable[1].player.id] = 'cover';
  if (sortable[2]) assignments[sortable[2].player.id] = 'balance';

  for (const player of players) {
    assignments[player.id] ??= 'shape';
  }

  return assignments;
};
