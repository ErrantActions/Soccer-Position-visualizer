import type { NormalizedPoint } from '../../types/soccer';
import { clamp } from '../../utils/clamp';
import { distance } from '../../utils/geometry';
import type { ActivePlayer, PassingLane, RoleBehaviorProfile, TacticalContext } from './types';

const laneTargets = [
  { x: 0.2, y: 0.5 },
  { x: 0.38, y: 0.3 },
  { x: 0.38, y: 0.7 },
  { x: 0.7, y: 0.3 },
  { x: 0.7, y: 0.7 },
];

export const buildPassingLanes = (context: TacticalContext): PassingLane[] =>
  laneTargets.map((target) => ({
    from: context.ball,
    to: target,
    danger: 1 - Math.min(1, distance(context.ball, target)),
  }));

const projectPointToSegment = (point: NormalizedPoint, start: NormalizedPoint, end: NormalizedPoint): NormalizedPoint => {
  const vx = end.x - start.x;
  const vy = end.y - start.y;
  const lengthSq = vx * vx + vy * vy || 1;
  const t = clamp(((point.x - start.x) * vx + (point.y - start.y) * vy) / lengthSq, 0, 1);
  return { x: start.x + vx * t, y: start.y + vy * t };
};

export const getPassingLaneTarget = (
  player: ActivePlayer,
  profile: RoleBehaviorProfile,
  lanes: PassingLane[],
): NormalizedPoint => {
  const preferredLane = lanes
    .map((lane) => ({ lane, projection: projectPointToSegment(profile.anchor, lane.from, lane.to) }))
    .sort((a, b) => distance(a.projection, profile.anchor) - distance(b.projection, profile.anchor))[0];

  if (!preferredLane) {
    return profile.anchor;
  }

  return {
    x: clamp(preferredLane.projection.x, profile.depthRange[0], profile.depthRange[1]),
    y: clamp(preferredLane.projection.y, profile.widthRange[0], profile.widthRange[1]),
  };
};
