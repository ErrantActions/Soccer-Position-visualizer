import type { ChallengeScore } from './types';
import type { NormalizedPoint } from '../types/soccer';

const FIELD_LENGTH_YARDS = 120;
const FIELD_WIDTH_YARDS = 80;

export const distanceInYards = (a: NormalizedPoint, b: NormalizedPoint): number => {
  const dx = (a.x - b.x) * FIELD_LENGTH_YARDS;
  const dy = (a.y - b.y) * FIELD_WIDTH_YARDS;
  return Math.hypot(dx, dy);
};

export const scoreChallenge = (playerPosition: NormalizedPoint, expectedPosition: NormalizedPoint): ChallengeScore => {
  const distanceYards = distanceInYards(playerPosition, expectedPosition);

  if (distanceYards <= 5) {
    return {
      points: 100,
      message: '✅ Excellent Positioning',
      colorClass: 'text-emerald-200 bg-emerald-500/20 border-emerald-300/55',
      band: 'excellent',
      distanceYards,
    };
  }

  if (distanceYards <= 10) {
    return {
      points: 80,
      message: '🟢 Great Job',
      colorClass: 'text-lime-100 bg-lime-500/20 border-lime-300/55',
      band: 'great',
      distanceYards,
    };
  }

  if (distanceYards <= 20) {
    return {
      points: 60,
      message: '🟡 Close',
      colorClass: 'text-amber-100 bg-amber-500/20 border-amber-300/55',
      band: 'close',
      distanceYards,
    };
  }

  return {
    points: 25,
    message: '🔴 Try Again',
    colorClass: 'text-rose-100 bg-rose-500/20 border-rose-300/55',
    band: 'try-again',
    distanceYards,
  };
};
