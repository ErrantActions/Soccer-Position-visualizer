import { POSITION_BOUNDARIES } from './positionBoundaries';
import { POSITION_PROFILES } from './positionProfiles';
import type { PositioningInput, PositioningResult } from '../types/soccer';
import { clamp } from '../utils/clamp';
import { distance, isPointInPolygon } from '../utils/geometry';
import { lerp, smoothstep } from '../utils/interpolation';

const CENTRAL_Y = 0.5;

export const getRecommendedPosition = ({ ball, position }: PositioningInput): PositioningResult => {
  const profile = POSITION_PROFILES[position];

  const ballNearGoal = 1 - ball.x;
  const dangerBoost = smoothstep(0, 0.42, ballNearGoal);

  const depthBase = lerp(profile.maxX - 0.03, profile.minX + 0.05, ballNearGoal);
  const depthBallInfluence = profile.depthWeight * (ball.x - profile.lineX) * 0.42;
  const centralDangerProtection = position === 'CDM' ? dangerBoost * 0.08 : dangerBoost * 0.05;

  let targetX = depthBase + depthBallInfluence - centralDangerProtection;
  targetX = Math.min(targetX, ball.x - profile.goalSideOffset);
  targetX = clamp(targetX, profile.minX, profile.maxX);

  const widthToCenter = CENTRAL_Y - profile.baseY;
  const sideShift = (ball.y - CENTRAL_Y) * profile.lateralWeight;
  const tuckToCenter = widthToCenter * profile.centralWeight * (1 - Math.abs(ball.y - CENTRAL_Y) * 1.3);

  let targetY = profile.baseY + sideShift + tuckToCenter;

  if (position === 'CDM') {
    targetY = profile.baseY + (ball.y - CENTRAL_Y) * profile.lateralWeight;
  }

  targetY = lerp(targetY, CENTRAL_Y, dangerBoost * profile.centralWeight * 0.35);
  targetY = clamp(targetY, profile.minY, profile.maxY);

  const confidencePenalty =
    Math.abs(targetX - ball.x) * 70 +
    Math.abs(targetY - ball.y) * 30 +
    (targetX > ball.x ? 25 : 0) +
    Math.abs(targetY - CENTRAL_Y) * 15 * dangerBoost;

  const confidence = clamp(100 - confidencePenalty, 0, 100);
  const idealPosition = { x: clamp(targetX, 0, 1), y: clamp(targetY, 0, 1) };
  const boundary = POSITION_BOUNDARIES[position];
  const isOutsideNormalBoundary = !isPointInPolygon(idealPosition, boundary.points);
  const ballInsideBoundary = isPointInPolygon(ball, boundary.points);
  const ballDistance = distance(idealPosition, ball);
  const pressureWindow = position === 'CDM' ? 1.15 : 0.95;
  const isPressDistance = ballDistance <= profile.acceptableRadius * pressureWindow;
  const ballIsInFront = ball.x >= idealPosition.x - 0.015;
  const shouldPressBall = ballInsideBoundary && ballIsInFront && isPressDistance;
  const coachingCue = shouldPressBall
    ? 'Go win the ball'
    : isOutsideNormalBoundary
      ? 'Recover inside your boundary'
      : ballInsideBoundary
        ? 'Close space and stay goal side'
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
