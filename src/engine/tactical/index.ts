import type { NormalizedPoint } from '../../types/soccer';
import { clamp } from '../../utils/clamp';
import { distance } from '../../utils/geometry';
import { createDangerMap, getDangerZoneTarget, scoreDangerCoverage } from './danger';
import { buildExplanation, pickExplanationTags } from './explanations';
import { calculateGoalSidePosition, scoreGoalSide } from './goalSide';
import { buildPassingLanes, getPassingLaneTarget } from './passing';
import { ROLE_BEHAVIOR_PROFILES, ROLE_LABELS, createDefaultPlayers } from './roles';
import { assignResponsibilities } from './responsibilities';
import { TACTICAL_STATE_PROFILES } from './state';
import { measureCompactness, getCompactnessTarget } from './compactness';
import { buildSupportTriangles, getSupportTarget, scoreSupport } from './support';
import { getTacticalZone } from './zones';
import { TacticalState, type ActivePlayer, type PlayerTacticalResult, type PositionInfluence, type TacticalContext, type TacticalRole, type TeamShapeConfig, type TeamTacticalResult } from './types';

const defaultTeamShape: TeamShapeConfig = {
  formationLabel: '4-4-1-1',
  orientation: 'leftToRight',
  activePlayers: createDefaultPlayers(),
  stylePreset: 'balanced',
};

const createAnchorPositions = (players: ActivePlayer[]): Record<string, NormalizedPoint> =>
  Object.fromEntries(players.map((player) => [player.id, ROLE_BEHAVIOR_PROFILES[player.role].anchor]));

const blendInfluences = (influences: PositionInfluence[], clampRange: { x: [number, number]; y: [number, number] }): NormalizedPoint => {
  const totalWeight = influences.reduce((sum, influence) => sum + influence.weight, 0) || 1;
  const point = influences.reduce(
    (acc, influence) => ({
      x: acc.x + influence.target.x * (influence.weight / totalWeight),
      y: acc.y + influence.target.y * (influence.weight / totalWeight),
    }),
    { x: 0, y: 0 },
  );

  return {
    x: clamp(point.x, clampRange.x[0], clampRange.x[1]),
    y: clamp(point.y, clampRange.y[0], clampRange.y[1]),
  };
};

const getStateModifier = (anchor: NormalizedPoint, context: TacticalContext) => {
  const state = TACTICAL_STATE_PROFILES[context.tacticalState];
  return {
    x: clamp(anchor.x + state.linePush, 0, 1),
    y: clamp(anchor.y + (context.ball.y - 0.5) * state.widthBias, 0, 1),
  };
};

const getWeakSideTarget = (anchor: NormalizedPoint, ball: NormalizedPoint, role: TacticalRole): NormalizedPoint => {
  const ballOnLeft = ball.y < 0.5;
  const isFarSide = (role === 'LB' || role === 'LM' || role === 'LCM') ? !ballOnLeft : (role === 'RB' || role === 'RM' || role === 'RCM') ? ballOnLeft : true;
  return {
    x: clamp(anchor.x + (isFarSide ? -0.02 : 0.015), 0, 1),
    y: clamp(anchor.y + (isFarSide ? (0.5 - anchor.y) * 0.55 : (ball.y - anchor.y) * 0.25), 0, 1),
  };
};

const getWidthDepthTarget = (anchor: NormalizedPoint, stateTarget: NormalizedPoint, context: TacticalContext): NormalizedPoint => ({
  x: clamp((anchor.x + stateTarget.x) / 2 + (context.ballCarrierTeam === 'own' ? 0.03 : -0.01), 0, 1),
  y: clamp((anchor.y + stateTarget.y) / 2, 0, 1),
});

export const createDefaultTacticalContext = (): TacticalContext => ({
  ball: { x: 0.5, y: 0.5 },
  ballCarrierTeam: 'opponent',
  tacticalState: TacticalState.Defending,
  learningMode: 'standard',
});

export const getBallCarrierTeam = (state: TacticalContext['tacticalState']): TacticalContext['ballCarrierTeam'] =>
  state === TacticalState.Attacking ||
  state === TacticalState.GoalKick ||
  state === TacticalState.CornerKick ||
  state === TacticalState.ThrowIn ||
  state === TacticalState.FreeKick ||
  state === TacticalState.TransitionToAttack
    ? 'own'
    : 'opponent';

export const buildTeamTacticalModel = (
  context: TacticalContext,
  teamShape: TeamShapeConfig = defaultTeamShape,
): TeamTacticalResult => {
  const players = teamShape.activePlayers.filter((player) => player.active);
  const activePlayers = players.length > 0 ? players : [createDefaultPlayers().find((player) => player.role === 'GK')!];
  const anchors = createAnchorPositions(activePlayers);
  const responsibilities = assignResponsibilities(activePlayers, anchors, context);
  const lanes = buildPassingLanes(context);
  const supportTriangles = buildSupportTriangles(anchors, activePlayers);
  const dangerMap = createDangerMap();

  const provisionalPositions = Object.fromEntries(
    activePlayers.map((player) => {
      const profile = ROLE_BEHAVIOR_PROFILES[player.role];
      return [player.id, getStateModifier(profile.anchor, context)];
    }),
  ) as Record<string, NormalizedPoint>;

  const results: PlayerTacticalResult[] = activePlayers.map((player) => {
    const profile = ROLE_BEHAVIOR_PROFILES[player.role];
    const stateProfile = TACTICAL_STATE_PROFILES[context.tacticalState];
    const formationAnchor = profile.anchor;
    const stateTarget = getStateModifier(formationAnchor, context);
    const goalSideTarget = calculateGoalSidePosition(profile, context);
    const dangerTarget = getDangerZoneTarget(player, profile, context);
    const passingLaneTarget = getPassingLaneTarget(profile, lanes);
    const responsibility = responsibilities[player.id];
    const responsibilityTarget =
      responsibility === 'pressure'
        ? {
            x: clamp(Math.min(context.ball.x - 0.01, stateTarget.x + 0.07), 0, 1),
            y: stateTarget.y + (context.ball.y - stateTarget.y) * 0.72,
          }
        : responsibility === 'cover'
          ? {
              x: clamp(Math.min(context.ball.x - 0.03, goalSideTarget.x), 0, 1),
              y: (goalSideTarget.y + context.ball.y) / 2,
            }
          : responsibility === 'balance'
            ? { x: formationAnchor.x, y: formationAnchor.y + (0.5 - formationAnchor.y) * 0.45 }
            : stateTarget;
    const weakSideTarget = getWeakSideTarget(formationAnchor, context.ball, player.role);
    const supportTarget = getSupportTarget(player, provisionalPositions, context);
    const compactnessTarget = getCompactnessTarget(player, provisionalPositions, context);
    const widthDepthTarget = getWidthDepthTarget(formationAnchor, stateTarget, context);

    const influences: PositionInfluence[] = [
      { id: 'formationAnchor', label: 'Formation anchor', target: formationAnchor, weight: 0.16, reasonTags: ['maintain-shape'] },
      { id: 'stateModifier', label: 'Tactical state', target: stateTarget, weight: 0.08 + stateProfile.compactness * 0.08, reasonTags: ['maintain-depth'] },
      { id: 'goalSidePosition', label: 'Goal side', target: goalSideTarget, weight: profile.goalSideInfluence, reasonTags: ['protect-goal', 'stay-goal-side'] },
      { id: 'dangerZoneCoverage', label: 'Danger coverage', target: dangerTarget, weight: profile.dangerInfluence, reasonTags: ['protect-central-area', 'cover-danger-space'] },
      { id: 'passingLaneCoverage', label: 'Passing lane', target: passingLaneTarget, weight: player.role === 'CDM' || player.line === 'back' ? 0.12 : 0.06, reasonTags: ['passing-lane-denial'] },
      { id: 'responsibility', label: 'Pressure-cover-balance', target: responsibilityTarget, weight: responsibility === 'pressure' ? 0.18 + profile.pressureBias * 0.08 : 0.12, reasonTags: responsibility === 'pressure' ? ['pressure-ball', 'support-teammate'] : responsibility === 'cover' ? ['support-teammate', 'stay-goal-side'] : ['maintain-shape'] },
      { id: 'weakSideAwareness', label: 'Weak side awareness', target: weakSideTarget, weight: 0.08, reasonTags: ['weak-side-tuck', 'protect-central-area'] },
      { id: 'supportPosition', label: 'Support triangle', target: supportTarget, weight: profile.supportInfluence, reasonTags: ['support-teammate', 'create-triangle'] },
      { id: 'teamCompactness', label: 'Team compactness', target: compactnessTarget, weight: profile.compactnessInfluence, reasonTags: ['maintain-shape'] },
      { id: 'widthDepthCorrection', label: 'Width & depth', target: widthDepthTarget, weight: profile.widthInfluence, reasonTags: ['maintain-width', 'maintain-depth'] },
    ];

    const finalPosition = blendInfluences(influences, {
      x: profile.depthRange,
      y: profile.widthRange,
    });
    const zone = getTacticalZone(finalPosition, context.ball);
    const goalSideScore = scoreGoalSide(finalPosition, context.ball);
    const shapeScore = clamp(100 - distance(finalPosition, formationAnchor) * 165, 0, 100);
    const supportScore = scoreSupport(finalPosition, supportTarget);
    const dangerCoverageScore = scoreDangerCoverage(finalPosition);
    const positioningScore = Math.round(goalSideScore * 0.32 + shapeScore * 0.24 + supportScore * 0.22 + dangerCoverageScore * 0.22);
    const explanationTags = pickExplanationTags({
      player,
      roleProfile: profile,
      contextBall: context.ball,
      zone,
      formationAnchor,
      finalPosition,
      influences,
      responsibility,
      goalSideScore,
      shapeScore,
      supportScore,
      dangerCoverageScore,
      positioningScore,
      explanation: { primary: '', secondary: '', suppressed: [], childFriendly: '', tags: [] },
      overlays: { goalSideSegment: { from: context.ball, to: goalSideTarget }, defensiveCone: { apex: finalPosition, left: finalPosition, right: finalPosition }, weakSideShade: null },
    });
    const explanation = buildExplanation(explanationTags, responsibility, context.learningMode);
    const coneDepth = player.line === 'back' || player.role === 'CDM' ? 0.08 : 0.05;
    const coneWidth = player.side === 'center' ? 0.07 : 0.09;

    return {
      player,
      roleProfile: profile,
      contextBall: context.ball,
      zone,
      formationAnchor,
      finalPosition,
      influences,
      responsibility,
      goalSideScore,
      shapeScore,
      supportScore,
      dangerCoverageScore,
      positioningScore,
      explanation,
      overlays: {
        goalSideSegment: { from: finalPosition, to: goalSideTarget },
        defensiveCone: {
          apex: finalPosition,
          left: { x: Math.max(0, finalPosition.x - coneDepth), y: clamp(finalPosition.y - coneWidth, 0, 1) },
          right: { x: Math.max(0, finalPosition.x - coneDepth), y: clamp(finalPosition.y + coneWidth, 0, 1) },
        },
        weakSideShade:
          zone.inWeakSideCorridor
            ? {
                x: clamp(finalPosition.x - 0.05, 0, 0.9),
                y: clamp(finalPosition.y - 0.07, 0, 0.86),
                width: Math.min(0.1, 1 - clamp(finalPosition.x - 0.05, 0, 0.9)),
                height: Math.min(0.14, 1 - clamp(finalPosition.y - 0.07, 0, 0.86)),
              }
            : null,
      },
    };
  });

  const finalPositions = Object.fromEntries(results.map((result) => [result.player.id, result.finalPosition])) as Record<string, NormalizedPoint>;
  const compactness = measureCompactness(activePlayers, finalPositions);

  return {
    players: results,
    compactness,
    supportTriangles,
    passingLanes: lanes,
    dangerMap,
    ball: context.ball,
    activeRoleIds: activePlayers.map((player) => player.role),
    selectedRole: context.selectedRole,
    tacticalState: context.tacticalState,
    learningMode: context.learningMode,
  };
};

export const findPlayerResult = (team: TeamTacticalResult, role: TacticalRole) =>
  team.players.find((player) => player.player.role === role) ?? team.players[0];

export { ROLE_LABELS, createDefaultPlayers, defaultTeamShape };
