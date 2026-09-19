import { POSITION_BOUNDARIES } from './positionBoundaries';
import { POSITION_PROFILES, type PositionProfile } from './positionProfiles';
import type { NormalizedPoint, PlayerPosition, PositioningInput, PositioningResult } from '../types/soccer';
import { clamp } from '../utils/clamp';
import { distance, isPointInPolygon } from '../utils/geometry';
import { lerp, smoothstep } from '../utils/interpolation';

const CENTRAL_Y = 0.5;

type GoalSideInput = {
  ball: NormalizedPoint;
  goal: NormalizedPoint;
  formation: '4-4-2';
  role: PlayerPosition;
  profile: PositionProfile;
};

const ROLE_DEPTH_RATIO: Record<PlayerPosition, number> = {
  LB: 0.34,
  LCB: 0.28,
  RCB: 0.28,
  RB: 0.34,
  CDM: 0.42,
};

const ROLE_LATERAL_RATIO: Record<PlayerPosition, number> = {
  LB: 0.6,
  LCB: 0.42,
  RCB: 0.42,
  RB: 0.6,
  CDM: 0.52,
};

type PressTuning = {
  baseWindow: number;
  xPadding: number;
  yPadding: number;
  forwardAllowance: number;
};

const PRESS_TUNING: Record<PlayerPosition, PressTuning> = {
  LB: { baseWindow: 1.7, xPadding: 0.08, yPadding: 0.07, forwardAllowance: 0.1 },
  LCB: { baseWindow: 1.7, xPadding: 0.08, yPadding: 0.07, forwardAllowance: 0.1 },
  RCB: { baseWindow: 1.7, xPadding: 0.08, yPadding: 0.07, forwardAllowance: 0.1 },
  RB: { baseWindow: 1.7, xPadding: 0.08, yPadding: 0.07, forwardAllowance: 0.1 },
  CDM: { baseWindow: 1.55, xPadding: 0.06, yPadding: 0.05, forwardAllowance: 0.1 },
};

const DEFAULT_PRESS_TUNING: PressTuning = { baseWindow: 1.7, xPadding: 0.08, yPadding: 0.07, forwardAllowance: 0.1 };

export const calculateGoalSidePosition = ({ ball, goal, formation, role, profile }: GoalSideInput): NormalizedPoint => {
  const depthRatio = ROLE_DEPTH_RATIO[role] + (formation === '4-4-2' ? 0 : 0);
  const lateralRatio = ROLE_LATERAL_RATIO[role];

  let x = lerp(goal.x, ball.x, depthRatio);
  x = Math.min(x, ball.x - profile.goalSideOffset);

  const yFromBall = lerp(profile.baseY, ball.y, lateralRatio);
  const centralSqueeze = smoothstep(0.35, 0.9, ball.x);
  const tuckInside = (CENTRAL_Y - profile.baseY) * profile.centralWeight * centralSqueeze;
  let y = yFromBall + tuckInside;

  const wideBallBias = Math.abs(ball.y - CENTRAL_Y);
  if (wideBallBias > 0.2) {
    const farSideTuck = smoothstep(0.2, 0.45, wideBallBias) * profile.centralWeight;
    y = lerp(y, CENTRAL_Y, farSideTuck * 0.4);
  }

  const lineDepthCeiling = lerp(profile.lineX + 0.02, profile.maxX - 0.03, smoothstep(0.45, 1, ball.x));
  x = clamp(x, profile.minX, Math.min(profile.maxX, lineDepthCeiling));
  y = clamp(y, profile.minY, profile.maxY);

  return { x, y };
};

export const getRecommendedPosition = ({ ball, position }: PositioningInput): PositioningResult => {
  const profile = POSITION_PROFILES[position];

  const ballNearGoal = 1 - ball.x;
  const dangerBoost = smoothstep(0, 0.42, ballNearGoal);

  const goalSide = calculateGoalSidePosition({
    ball,
    goal: { x: 0, y: CENTRAL_Y },
    formation: '4-4-2',
    role: position,
    profile,
  });

  const depthBallInfluence = profile.depthWeight * (ball.x - profile.lineX) * 0.34;
  const safetyRetreat = dangerBoost * (position === 'CDM' ? 0.08 : 0.06);

  let targetX = goalSide.x + depthBallInfluence - safetyRetreat;
  targetX = Math.min(targetX, ball.x - profile.goalSideOffset);
  targetX = clamp(targetX, profile.minX, profile.maxX);

  const sideShift = (ball.y - CENTRAL_Y) * profile.lateralWeight;
  const centralChannelProtection = (CENTRAL_Y - profile.baseY) * profile.centralWeight * (1 - Math.abs(ball.y - CENTRAL_Y) * 1.2);

  let targetY = goalSide.y + sideShift * 0.45 + centralChannelProtection * 0.4;

  if (position === 'CDM') {
    targetY = goalSide.y;
  }

  targetY = lerp(targetY, CENTRAL_Y, dangerBoost * profile.centralWeight * 0.35);
  targetY = clamp(targetY, profile.minY, profile.maxY);

  const confidencePenalty =
    Math.abs(targetX - ball.x) * 75 +
    Math.abs(targetY - ball.y) * 28 +
    (targetX > ball.x ? 30 : 0) +
    Math.abs(targetY - CENTRAL_Y) * 15 * dangerBoost;

  const confidence = clamp(100 - confidencePenalty, 0, 100);
  const idealPosition = { x: clamp(targetX, 0, 1), y: clamp(targetY, 0, 1) };
  const boundary = POSITION_BOUNDARIES[position];
  const isOutsideNormalBoundary = !isPointInPolygon(idealPosition, boundary.points);
  const ballInsideBoundary = isPointInPolygon(ball, boundary.points);
  const ballDistance = distance(idealPosition, ball);
  const pressTuning = PRESS_TUNING[position] ?? DEFAULT_PRESS_TUNING;
  const pressureWindow = pressTuning.baseWindow;
  const dangerPressureWindow = 1.2 + dangerBoost * 1.4;
  const pressureDistanceLimit = profile.acceptableRadius * Math.max(pressureWindow, dangerPressureWindow);
  const isPressDistance = ballDistance <= pressureDistanceLimit;
  const ballInEngagementChannel =
    ball.x >= profile.minX - pressTuning.xPadding &&
    ball.x <= profile.maxX + pressTuning.forwardAllowance &&
    ball.y >= profile.minY - pressTuning.yPadding &&
    ball.y <= profile.maxY + pressTuning.yPadding;
  const ballIsInFront = ball.x >= idealPosition.x - 0.015;
  const shouldPressBall =
    ballInsideBoundary && !isOutsideNormalBoundary && ballInEngagementChannel && ballIsInFront && isPressDistance;
  const coachingCue = shouldPressBall
    ? 'Go win the ball'
    : ballInsideBoundary
      ? isOutsideNormalBoundary
        ? 'Recover inside your boundary'
        : 'Close space and stay goal side'
      : 'Hold shape and protect the middle';

  return {
    idealPosition,
    confidence,
    acceptableRadius: profile.acceptableRadius,
    isOutsideNormalBoundary,
    shouldPressBall,
    coachingCue,
  };
};
