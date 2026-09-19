import type { NormalizedPoint } from '../../types/soccer';
import type { TacticalChannel, TacticalZone } from './types';

const channels: Array<{ max: number; channel: TacticalChannel }> = [
  { max: 0.16, channel: 'leftWing' },
  { max: 0.35, channel: 'leftHalfSpace' },
  { max: 0.65, channel: 'centralChannel' },
  { max: 0.84, channel: 'rightHalfSpace' },
  { max: 1, channel: 'rightWing' },
];

export const getTacticalZone = (point: NormalizedPoint, ball?: NormalizedPoint): TacticalZone => {
  const third = point.x < 1 / 3 ? 'defensive' : point.x < 2 / 3 ? 'middle' : 'attacking';
  const channel = channels.find((entry) => point.y <= entry.max)?.channel ?? 'centralChannel';
  const ballSide = ball ? (ball.y < 0.5 ? 'left' : 'right') : null;
  const pointSide = point.y < 0.5 ? 'left' : 'right';

  return {
    third,
    channel,
    inPenaltyBox: point.x <= 0.16 && point.y >= 0.31 && point.y <= 0.69,
    inFrontOfGoal: point.x <= 0.28 && point.y >= 0.36 && point.y <= 0.64,
    inWeakSideCorridor: ballSide !== null && ballSide !== pointSide && Math.abs(point.y - 0.5) <= 0.22,
    inCrossingLane: point.x >= 0.72 && (channel === 'leftWing' || channel === 'rightWing'),
    inHalfSpaceEntryLane:
      point.x >= 0.48 && point.x <= 0.85 && (channel === 'leftHalfSpace' || channel === 'rightHalfSpace'),
  };
};
