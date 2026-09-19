import { POSITION_BOUNDARIES } from './positionBoundaries';
import { POSITION_PROFILES, type PositionProfile } from './positionProfiles';
import type { NormalizedPoint, PlayerPosition, PositioningInput, PositioningResult } from '../types/soccer';
import { clamp } from '../utils/clamp';
import { distance, isPointInPolygon } from '../utils/geometry';
import { buildTeamTacticalModel, createDefaultPlayers, findPlayerResult, getBallCarrierTeam } from './tactical';
import { calculateGoalSidePosition as calculateTeamGoalSidePosition } from './tactical/goalSide';
import { ROLE_BEHAVIOR_PROFILES } from './tactical/roles';
import { TacticalState } from './tactical/types';

type GoalSideInput = {
  ball: NormalizedPoint;
  goal: NormalizedPoint;
  formation: '4-4-2';
  role: PlayerPosition;
  profile: PositionProfile;
};

export const calculateGoalSidePosition = ({ ball, role }: GoalSideInput): NormalizedPoint => {
  const profile = ROLE_BEHAVIOR_PROFILES[role];
  return calculateTeamGoalSidePosition(profile, {
    ball,
    ballCarrierTeam: 'opponent',
    tacticalState: TacticalState.Defending,
    learningMode: 'standard',
  });
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
  const shouldPressBall =
    selected.responsibility === 'pressure' &&
    ballInsideBoundary &&
    ballIsInFront &&
    ballDistance <= acceptableRadius * 1.7;
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
