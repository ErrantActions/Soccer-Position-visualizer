import { describe, expect, it } from 'vitest';
import { buildTeamTacticalModel, createChallengeScenario, evaluateChallengePlacement, findPlayerResult, getBallCarrierTeam, TacticalState } from '../tactical';

describe('tactical challenge scoring', () => {
  it('creates scenarios from the live tactical engine', () => {
    const model = buildTeamTacticalModel({
      ball: { x: 0.46, y: 0.32 },
      tacticalState: TacticalState.Defending,
      ballCarrierTeam: getBallCarrierTeam(TacticalState.Defending),
      learningMode: 'standard',
      selectedRole: 'LB',
    });

    const scenario = createChallengeScenario(model, 'LB');
    const player = findPlayerResult(model, 'LB');
    expect(scenario.expectedPosition.x).toBeCloseTo(player.finalPosition.x, 6);
    expect(scenario.expectedPosition.y).toBeCloseTo(player.finalPosition.y, 6);
  });

  it('rewards placements near the tactical answer', () => {
    const model = buildTeamTacticalModel({
      ball: { x: 0.6, y: 0.38 },
      tacticalState: TacticalState.TransitionToDefense,
      ballCarrierTeam: getBallCarrierTeam(TacticalState.TransitionToDefense),
      learningMode: 'standard',
      selectedRole: 'CDM',
    });
    const player = findPlayerResult(model, 'CDM');
    const result = evaluateChallengePlacement(player.finalPosition, player);
    expect(result.positioningScore).toBeGreaterThanOrEqual(95);
    expect(result.goalSideScore).toBeGreaterThanOrEqual(85);
  });
});
