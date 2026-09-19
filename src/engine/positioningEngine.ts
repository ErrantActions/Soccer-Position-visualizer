import { POSITION_BOUNDARIES } from './positionBoundaries';
import { POSITION_PROFILES, type PositionProfile } from './positionProfiles';
import type { NormalizedPoint, PlayerPosition, PositioningInput, PositioningResult } from '../types/soccer';
import { clamp } from '../utils/clamp';
import { distance, isPointInPolygon } from '../utils/geometry';
import { buildTeamTacticalModel, createDefaultPlayers, findPlayerResult, getBallCarrierTeam } from './tactical';
import { ROLE_BEHAVIOR_PROFILES } from './tactical/roles';
import { TacticalState } from './tactical/types';

type GoalSideInput = {
  ball: NormalizedPoint;
  goal: NormalizedPoint;
  formation: '4-4-2';
  role: PlayerPosition;
  profile: PositionProfile;
};

export const calculateGoalSidePosition = ({ ball, goal, formation, role, profile }: GoalSideInput): NormalizedPoint => {
  const behavior = ROLE_BEHAVIOR_PROFILES[role];
  const depthRatio = behavior.family === 'CenterBack' ? 0.38 : behavior.family === 'OutsideBack' ? 0.46 : 0.54;
  const lateralRatio = behavior.side === 'center' ? 0.55 : 0.68;
  const formationDepthBias = formation === '4-4-2' ? 0 : 0;
  const x = clamp(Math.min(goal.x + (ball.x - goal.x) * (depthRatio + formationDepthBias), ball.x - profile.goalSideOffset), profile.minX, profile.maxX);
  const wideBias = Math.abs(ball.y - 0.5);
  const yFromBall = profile.baseY + (ball.y - profile.baseY) * lateralRatio;
  const centralTuck = wideBias > 0.2 ? (0.5 - profile.baseY) * Math.min(0.45, wideBias) * 0.65 : 0;
  const y = clamp(ball.y < 0.5 ? yFromBall + centralTuck : yFromBall - centralTuck, profile.minY, profile.maxY);

  return { x, y };
};

export const getRecommendedPosition = ({ ball, position }: PositioningInput): PositioningResult => {
  const team = buildTeamTacticalModel(
    {
      ball,
      ballCarrierTeam: getBallCarrierTeam(TacticalState.Defending),
      tacticalState: TacticalState.Defending,
      learningMode: 'standard',
      selectedRole: position,
    },
    {
      formationLabel: 'Legacy Defender View',
      orientation: 'leftToRight',
      stylePreset: 'balanced',
      activePlayers: createDefaultPlayers().filter(
        (player) => player.role === 'GK' || player.role === 'LB' || player.role === 'LCB' || player.role === 'RCB' || player.role === 'RB' || player.role === 'CDM',
      ),
    },
  );

  const selected = findPlayerResult(team, position);
  const boundary = POSITION_BOUNDARIES[position];
  const idealPosition = selected.finalPosition;
  const acceptableRadius = POSITION_PROFILES[position].acceptableRadius;
  const confidence = clamp(Math.round(selected.positioningScore), 0, 100);
  const isOutsideNormalBoundary = !isPointInPolygon(idealPosition, boundary.points);
  const ballInsideBoundary = isPointInPolygon(ball, boundary.points);
  const ballDistance = distance(ball, idealPosition);
  const ballIsInFront = ball.x >= idealPosition.x - 0.015;
  const shouldPressBall = ballInsideBoundary && ballIsInFront && ballDistance <= acceptableRadius * 1.7;
  const coachingCue = shouldPressBall
    ? 'Go win the ball'
    : selected.explanation.primary || (ballDistance < acceptableRadius ? 'Support the ball side' : 'Hold shape and protect the middle');

  return {
    idealPosition,
    confidence,
    acceptableRadius,
    isOutsideNormalBoundary,
    shouldPressBall,
    coachingCue,
  };
};
