import { describe, expect, it } from 'vitest';
import { getRecommendedPosition } from './positioningEngine';
import type { NormalizedPoint, PlayerPosition } from '../types/soccer';

const testBallLocations: Record<string, NormalizedPoint> = {
  defendedGoal: { x: 0.06, y: 0.5 },
  oppositeGoal: { x: 0.95, y: 0.5 },
  upperTouchline: { x: 0.5, y: 0.03 },
  lowerTouchline: { x: 0.5, y: 0.97 },
  centerCircle: { x: 0.5, y: 0.5 },
  leftPenaltyArea: { x: 0.15, y: 0.44 },
  oppositeCorner: { x: 0.96, y: 0.96 },
};

const positions: PlayerPosition[] = ['LB', 'LCB', 'RCB', 'RB', 'CDM'];

describe('positioning engine', () => {
  it('keeps all recommended positions in normalized bounds', () => {
    for (const position of positions) {
      for (const ball of Object.values(testBallLocations)) {
        const result = getRecommendedPosition({ ball, position });
        expect(result.idealPosition.x).toBeGreaterThanOrEqual(0);
        expect(result.idealPosition.x).toBeLessThanOrEqual(1);
        expect(result.idealPosition.y).toBeGreaterThanOrEqual(0);
        expect(result.idealPosition.y).toBeLessThanOrEqual(1);
      }
    }
  });

  it('mirrors left and right fullbacks around field center', () => {
    const ball = { x: 0.54, y: 0.23 };
    const mirroredBall = { x: ball.x, y: 1 - ball.y };

    const lb = getRecommendedPosition({ ball, position: 'LB' });
    const rb = getRecommendedPosition({ ball: mirroredBall, position: 'RB' });

    expect(Math.abs(lb.idealPosition.x - rb.idealPosition.x)).toBeLessThan(0.001);
    expect(Math.abs(lb.idealPosition.y - (1 - rb.idealPosition.y))).toBeLessThan(0.001);
  });

  it('mirrors left and right center backs around field center', () => {
    const ball = { x: 0.42, y: 0.31 };
    const mirroredBall = { x: ball.x, y: 1 - ball.y };

    const lcb = getRecommendedPosition({ ball, position: 'LCB' });
    const rcb = getRecommendedPosition({ ball: mirroredBall, position: 'RCB' });

    expect(Math.abs(lcb.idealPosition.x - rcb.idealPosition.x)).toBeLessThan(0.001);
    expect(Math.abs(lcb.idealPosition.y - (1 - rcb.idealPosition.y))).toBeLessThan(0.001);
  });

  it('returns distinct center back and cdm recommendations', () => {
    const ball = testBallLocations.centerCircle;
    const lcb = getRecommendedPosition({ ball, position: 'LCB' });
    const cdm = getRecommendedPosition({ ball, position: 'CDM' });

    expect(Math.abs(lcb.idealPosition.x - cdm.idealPosition.x) + Math.abs(lcb.idealPosition.y - cdm.idealPosition.y)).toBeGreaterThan(
      0.05,
    );
  });
});
