import { describe, expect, it } from 'vitest';
import { getTacticalZone } from './zones';

describe('tactical zones', () => {
  it('classifies thirds and channels', () => {
    const zone = getTacticalZone({ x: 0.12, y: 0.1 }, { x: 0.8, y: 0.1 });
    expect(zone.third).toBe('defensive');
    expect(zone.channel).toBe('leftWing');
    expect(zone.inPenaltyBox).toBe(false);
  });

  it('marks central danger in front of goal', () => {
    const zone = getTacticalZone({ x: 0.14, y: 0.5 }, { x: 0.82, y: 0.82 });
    expect(zone.inPenaltyBox).toBe(true);
    expect(zone.inFrontOfGoal).toBe(true);
    expect(zone.inWeakSideCorridor).toBe(false);
  });

  it('detects weak-side corridors away from the ball side', () => {
    const zone = getTacticalZone({ x: 0.48, y: 0.62 }, { x: 0.7, y: 0.2 });
    expect(zone.inWeakSideCorridor).toBe(true);
  });
});
