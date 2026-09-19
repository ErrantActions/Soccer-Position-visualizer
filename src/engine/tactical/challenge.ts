import { clamp } from '../../utils/clamp';
import { distance } from '../../utils/geometry';
import { scoreDangerCoverage } from './danger';
import { scoreGoalSide } from './goalSide';
import { scoreSupport } from './support';
import type { NormalizedPoint } from '../../types/soccer';
import type { ChallengeEvaluationResult, ChallengeScenario, PlayerTacticalResult, TeamTacticalResult } from './types';

const FIELD_LENGTH_YARDS = 120;
const FIELD_WIDTH_YARDS = 80;

export const distanceInYards = (a: NormalizedPoint, b: NormalizedPoint): number => {
  const dx = (a.x - b.x) * FIELD_LENGTH_YARDS;
  const dy = (a.y - b.y) * FIELD_WIDTH_YARDS;
  return Math.hypot(dx, dy);
};

export const createChallengeScenario = (team: TeamTacticalResult, role: PlayerTacticalResult['player']['role']): ChallengeScenario => {
  const target = team.players.find((player) => player.player.role === role) ?? team.players[0];
  const supportMate = team.players.find((player) => player.player.id !== target.player.id && player.player.line === target.player.line);
  const ballKey = `${Math.round(team.ball.x * 100)}-${Math.round(team.ball.y * 100)}`;
  const roleKey = team.activeRoleIds.join('-');

  return {
    id: `${team.tacticalState}-${role}-${ballKey}-${roleKey}`,
    title: `${role} positioning challenge`,
    prompt: `Where should the ${role} stand in ${team.tacticalState}?`,
    role,
    expectedPosition: target.finalPosition,
    supportTeammateId: supportMate?.player.id,
  };
};

export const evaluateChallengePlacement = (
  placement: NormalizedPoint,
  expected: PlayerTacticalResult,
): ChallengeEvaluationResult => {
  const distanceYards = distanceInYards(placement, expected.finalPosition);
  const supportTarget = expected.influences.find((influence) => influence.id === 'supportPosition')?.target ?? expected.finalPosition;
  const shapeScore = clamp(100 - distance(placement, expected.formationAnchor) * 190, 0, 100);
  const goalSideScore = scoreGoalSide(placement, expected.contextBall);
  const supportScore = scoreSupport(placement, supportTarget);
  const dangerCoverageScore = scoreDangerCoverage(placement);
  const baseScore = goalSideScore * 0.35 + shapeScore * 0.25 + supportScore * 0.2 + dangerCoverageScore * 0.2;
  const distanceBonus = clamp(10 - distanceYards * 2, 0, 10);
  const positioningScore = clamp(Math.round(baseScore + distanceBonus), 0, 100);

  let feedback = 'Good shape.';
  if (goalSideScore < 65) {
    feedback = 'Stay more goal side first.';
  } else if (shapeScore < 65) {
    feedback = 'Stay more connected to your team shape.';
  } else if (supportScore < 65) {
    feedback = 'Improve your support angle for teammates.';
  } else if (dangerCoverageScore < 65) {
    feedback = 'Protect the dangerous central space better.';
  }

  return {
    goalSideScore: Math.round(goalSideScore),
    shapeScore: Math.round(shapeScore),
    supportScore: Math.round(supportScore),
    dangerCoverageScore: Math.round(dangerCoverageScore),
    positioningScore,
    feedback,
    distanceYards,
  };
};
