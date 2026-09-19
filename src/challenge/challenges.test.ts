import { describe, expect, it } from 'vitest';
import { CHALLENGES } from './challenges';
import { getRecommendedPosition } from '../engine/positioningEngine';

describe('challenge seed data', () => {
  it('derives expected positions from the positioning engine for seeded scenarios', () => {
    for (const challenge of CHALLENGES) {
      const expected = getRecommendedPosition({
        ball: challenge.ballPosition,
        position: challenge.playerRole,
      }).idealPosition;

      expect(challenge.expectedPosition.x).toBeCloseTo(expected.x, 6);
      expect(challenge.expectedPosition.y).toBeCloseTo(expected.y, 6);

      const supportExpected = getRecommendedPosition({
        ball: challenge.ballPosition,
        position: challenge.supportTeammate,
      }).idealPosition;

      expect(challenge.supportPosition.x).toBeCloseTo(supportExpected.x, 6);
      expect(challenge.supportPosition.y).toBeCloseTo(supportExpected.y, 6);
    }
  });
});
