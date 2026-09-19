import { describe, expect, it } from 'vitest';
import { calculateGoalSidePosition, getRecommendedPosition } from './positioningEngine';
import { buildTeamTacticalModel, createDefaultPlayers, findPlayerResult, getBallCarrierTeam, TacticalState } from './tactical';

const legacyPositions = ['LB', 'LCB', 'RCB', 'RB', 'CDM'] as const;

describe('legacy positioning wrapper', () => {
  it('keeps recommended positions in normalized bounds for supported legacy roles', () => {
    for (const position of legacyPositions) {
      const result = getRecommendedPosition({ ball: { x: 0.62, y: 0.28 }, position });
      expect(result.idealPosition.x).toBeGreaterThanOrEqual(0);
      expect(result.idealPosition.x).toBeLessThanOrEqual(1);
      expect(result.idealPosition.y).toBeGreaterThanOrEqual(0);
      expect(result.idealPosition.y).toBeLessThanOrEqual(1);
    }
  });

  it('keeps defenders goal side of the ball in defensive states', () => {
    for (const position of legacyPositions) {
      const result = getRecommendedPosition({ ball: { x: 0.78, y: 0.22 }, position });
      expect(result.idealPosition.x).toBeLessThanOrEqual(0.78 + 0.001);
    }
  });

  it('mirrors outside backs around the field center', () => {
    const ball = { x: 0.58, y: 0.21 };
    const mirroredBall = { x: ball.x, y: 1 - ball.y };
    const left = getRecommendedPosition({ ball, position: 'LB' });
    const right = getRecommendedPosition({ ball: mirroredBall, position: 'RB' });
    expect(left.idealPosition.x).toBeCloseTo(right.idealPosition.x, 6);
    expect(left.idealPosition.y).toBeCloseTo(1 - right.idealPosition.y, 6);
  });

  it('exposes goal-side helper for legacy callers', () => {
    const helper = calculateGoalSidePosition({
      ball: { x: 0.74, y: 0.66 },
      goal: { x: 0, y: 0.5 },
      formation: '4-4-2',
      role: 'LCB',
      profile: {
        baseX: 0.24,
        baseY: 0.39,
        minX: 0.05,
        maxX: 0.5,
        minY: 0.2,
        maxY: 0.58,
        lateralWeight: 0.25,
        depthWeight: 0.55,
        centralWeight: 0.55,
        goalSideOffset: 0.045,
        acceptableRadius: 0.1,
        lineX: 0.24,
      },
    });

    expect(helper.x).toBeLessThan(0.74);
    expect(helper.y).toBeGreaterThanOrEqual(0.2);
    expect(helper.y).toBeLessThanOrEqual(0.58);
  });
});

describe('team tactical engine', () => {
  it('builds results only for active players', () => {
    const team = buildTeamTacticalModel(
      {
        ball: { x: 0.5, y: 0.5 },
        tacticalState: TacticalState.Defending,
        ballCarrierTeam: getBallCarrierTeam(TacticalState.Defending),
        learningMode: 'standard',
      },
      {
        formationLabel: 'Reduced side',
        orientation: 'leftToRight',
        stylePreset: 'balanced',
        activePlayers: createDefaultPlayers().map((player) => ({ ...player, active: ['GK', 'LB', 'LCB', 'RCB', 'RB'].includes(player.role) })),
      },
    );

    expect(team.players).toHaveLength(5);
    expect(team.players.every((player) => ['GK', 'LB', 'LCB', 'RCB', 'RB'].includes(player.player.role))).toBe(true);
  });

  it('returns the same selected-role answer as the direct tactical model', () => {
    const ball = { x: 0.61, y: 0.34 };
    const wrapper = getRecommendedPosition({ ball, position: 'CDM' });
    const model = buildTeamTacticalModel(
      {
        ball,
        tacticalState: TacticalState.Defending,
        ballCarrierTeam: getBallCarrierTeam(TacticalState.Defending),
        learningMode: 'standard',
        selectedRole: 'CDM',
      },
      {
        formationLabel: 'Legacy Defender View',
        orientation: 'leftToRight',
        stylePreset: 'balanced',
        activePlayers: createDefaultPlayers().filter(
          (player) =>
            player.role === 'GK' ||
            player.role === 'LB' ||
            player.role === 'LCB' ||
            player.role === 'RCB' ||
            player.role === 'RB' ||
            player.role === 'CDM',
        ),
      },
    );

    const direct = findPlayerResult(model, 'CDM');
    expect(wrapper.idealPosition.x).toBeCloseTo(direct.finalPosition.x, 6);
    expect(wrapper.idealPosition.y).toBeCloseTo(direct.finalPosition.y, 6);
  });

  it('assigns pressure, cover, and balance when enough active players exist', () => {
    const team = buildTeamTacticalModel({
      ball: { x: 0.34, y: 0.18 },
      tacticalState: TacticalState.Defending,
      ballCarrierTeam: getBallCarrierTeam(TacticalState.Defending),
      learningMode: 'standard',
    });

    const responsibilities = team.players.map((player) => player.responsibility);
    expect(responsibilities.filter((value) => value === 'pressure')).toHaveLength(1);
    expect(responsibilities.filter((value) => value === 'cover')).toHaveLength(1);
    expect(responsibilities.filter((value) => value === 'balance')).toHaveLength(1);
  });

  it('tucks the far-side wide midfielder inside when the ball is on the opposite side', () => {
    const team = buildTeamTacticalModel({
      ball: { x: 0.72, y: 0.12 },
      tacticalState: TacticalState.Defending,
      ballCarrierTeam: getBallCarrierTeam(TacticalState.Defending),
      learningMode: 'standard',
    });

    const rm = findPlayerResult(team, 'RM');
    expect(rm.finalPosition.y).toBeLessThan(rm.formationAnchor.y);
  });

  it('moves outside backs noticeably with the ball instead of leaving them near the anchor', () => {
    const nearBall = getRecommendedPosition({ ball: { x: 0.22, y: 0.16 }, position: 'LB' });
    const farBall = getRecommendedPosition({ ball: { x: 0.78, y: 0.76 }, position: 'LB' });

    expect(farBall.idealPosition.x - nearBall.idealPosition.x).toBeGreaterThan(0.12);
    expect(farBall.idealPosition.y - nearBall.idealPosition.y).toBeGreaterThan(0.08);
  });

  it('pushes the midfield line higher in attacking states for the same ball location', () => {
    const defending = buildTeamTacticalModel({
      ball: { x: 0.68, y: 0.46 },
      tacticalState: TacticalState.Defending,
      ballCarrierTeam: getBallCarrierTeam(TacticalState.Defending),
      learningMode: 'standard',
      selectedRole: 'CDM',
    });
    const attacking = buildTeamTacticalModel({
      ball: { x: 0.68, y: 0.46 },
      tacticalState: TacticalState.Attacking,
      ballCarrierTeam: getBallCarrierTeam(TacticalState.Attacking),
      learningMode: 'standard',
      selectedRole: 'CDM',
    });

    expect(findPlayerResult(attacking, 'CDM').finalPosition.x).toBeGreaterThan(findPlayerResult(defending, 'CDM').finalPosition.x + 0.04);
  });
});
