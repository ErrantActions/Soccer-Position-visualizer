import { describe, expect, it } from 'vitest';
import { calculateGoalSidePosition, getRecommendedPosition } from './positioningEngine';
import type { NormalizedPoint, PlayerPosition } from '../types/soccer';
import { POSITION_PROFILES } from './positionProfiles';

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

const POSITION_BASELINES = {
  LB: POSITION_PROFILES.LB.baseY,
  RB: POSITION_PROFILES.RB.baseY,
};

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



  it('keeps defenders goal side of the ball in wide scenarios', () => {
    const result = getRecommendedPosition({ ball: { x: 0.84, y: 0.15 }, position: 'LB' });
    expect(result.idealPosition.x).toBeLessThanOrEqual(0.84 - 0.06 + 0.001);
  });

  it('tucks far-side defenders toward the middle when ball is wide', () => {
    const result = getRecommendedPosition({ ball: { x: 0.82, y: 0.1 }, position: 'RB' });
    expect(result.idealPosition.y).toBeLessThan(POSITION_BASELINES.RB);
  });

  it('creates a reusable goal-side base position helper', () => {
    const helper = calculateGoalSidePosition({
      ball: { x: 0.72, y: 0.65 },
      goal: { x: 0, y: 0.5 },
      formation: '4-4-2',
      role: 'LCB',
      profile: POSITION_PROFILES.LCB,
    });

    expect(helper.x).toBeLessThan(0.72);
    expect(helper.y).toBeGreaterThanOrEqual(POSITION_PROFILES.LCB.minY);
    expect(helper.y).toBeLessThanOrEqual(POSITION_PROFILES.LCB.maxY);
  });

  it('prefers shape over over-committing when engagement is risky', () => {
    const ball = { x: 0.28, y: 0.24 };
    const result = getRecommendedPosition({ ball, position: 'LB' });

    expect(result.shouldPressBall).toBe(false);
    expect(result.coachingCue).toBe('Recover inside your boundary');
  });

  it('keeps shape when the ball is outside the defender zone', () => {
    const ball = { x: 0.82, y: 0.85 };
    const result = getRecommendedPosition({ ball, position: 'LCB' });

    expect(result.shouldPressBall).toBe(false);
    expect(result.coachingCue).toBe('Hold shape and protect the middle');
  });

  it('triggers pressure when the ball enters a defender engagement lane', () => {
    const ball = { x: 0.18, y: 0.32 };
    const result = getRecommendedPosition({ ball, position: 'LCB' });

    expect(result.shouldPressBall).toBe(true);
    expect(result.coachingCue).toBe('Go win the ball');
  });
});
