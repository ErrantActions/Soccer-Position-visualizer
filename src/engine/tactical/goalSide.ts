import type { NormalizedPoint } from '../../types/soccer';
import { clamp } from '../../utils/clamp';
import { lerp, smoothstep } from '../../utils/interpolation';
import type { ActivePlayer, RoleBehaviorProfile, TacticalContext } from './types';

const GOAL = { x: 0, y: 0.5 };

export const calculateGoalSidePosition = (
  player: ActivePlayer,
  profile: RoleBehaviorProfile,
  context: TacticalContext,
): NormalizedPoint => {
  const roleDepth = profile.family === 'CenterBack' ? 0.38 : profile.family === 'OutsideBack' ? 0.46 : profile.role === 'CDM' ? 0.54 : 0.7;
  const lateralRatio = profile.side === 'center' ? 0.55 : 0.68;
  const xFromGoal = lerp(GOAL.x, context.ball.x, roleDepth);
  const cappedX = context.tacticalState === 'GoalKick' ? xFromGoal : Math.min(xFromGoal, context.ball.x - 0.025);
  const wideBall = Math.abs(context.ball.y - 0.5);
  const centralTuck = smoothstep(0.18, 0.42, wideBall) * (profile.side === 'center' ? 0.05 : 0.08);
  const targetYBase = lerp(profile.anchor.y, context.ball.y, lateralRatio);
  const targetY = context.ball.y < 0.5 ? targetYBase + centralTuck : targetYBase - centralTuck;

  return {
    x: clamp(cappedX, profile.depthRange[0], profile.depthRange[1]),
    y: clamp(targetY, profile.widthRange[0], profile.widthRange[1]),
  };
};

export const scoreGoalSide = (position: NormalizedPoint, ball: NormalizedPoint): number => {
  const behindBall = position.x <= ball.x + 0.001 ? 1 : 0;
  const centralProtection = 1 - Math.min(1, Math.abs(position.y - 0.5) / 0.5);
  return clamp(behindBall * 65 + centralProtection * 35, 0, 100);
};
