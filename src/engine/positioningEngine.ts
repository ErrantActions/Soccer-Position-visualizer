import { POSITION_BOUNDARIES } from './positionBoundaries';
import type { PositionProfile } from './positionProfiles';
import type { NormalizedPoint, PlayerPosition, PositioningInput, PositioningResult } from '../types/soccer';
import { clamp } from '../utils/clamp';
import { distance, isPointInPolygon } from '../utils/geometry';
import { buildTeamTacticalModel, createDefaultPlayers, findPlayerResult, getBallCarrierTeam } from './tactical';
import { calculateGoalSidePosition as calculateTeamGoalSidePosition } from './tactical/goalSide';
import { ROLE_BEHAVIOR_PROFILES } from './tactical/roles';
import { TacticalState, type ActivePlayer } from './tactical/types';

const legacyPlayerLookup: Record<PlayerPosition, ActivePlayer> = Object.fromEntries(
  createDefaultPlayers()
    .filter((player) => player.role === 'LB' || player.role === 'LCB' || player.role === 'RCB' || player.role === 'RB' || player.role === 'CDM')
    .map((player) => [player.role, player]),
) as Record<PlayerPosition, ActivePlayer>;

type GoalSideInput = {
  ball: NormalizedPoint;
  goal: NormalizedPoint;
  formation: '4-4-2';
  role: PlayerPosition;
  profile: PositionProfile;
};

export const calculateGoalSidePosition = ({ ball, role }: GoalSideInput): NormalizedPoint => {
  const player = legacyPlayerLookup[role];
  const profile = ROLE_BEHAVIOR_PROFILES[role];
  return calculateTeamGoalSidePosition(player, profile, {
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
  const acceptableRadius = 0.12;
  const confidence = clamp(Math.round(selected.positioningScore), 0, 100);
  const isOutsideNormalBoundary = !isPointInPolygon(idealPosition, boundary.points);
  const shouldPressBall = selected.responsibility === 'pressure';
  const ballDistance = distance(ball, idealPosition);
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
