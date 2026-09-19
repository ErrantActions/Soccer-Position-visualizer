import type { TacticalState } from './types';

export type TacticalStateProfile = {
  linePush: number;
  compactness: number;
  widthBias: number;
  supportDepth: number;
  aggression: number;
  label: string;
};

export const TACTICAL_STATE_PROFILES: Record<TacticalState, TacticalStateProfile> = {
  Defending: { linePush: -0.03, compactness: 0.82, widthBias: -0.05, supportDepth: -0.04, aggression: 0.72, label: 'Defending' },
  Attacking: { linePush: 0.08, compactness: 0.62, widthBias: 0.07, supportDepth: 0.05, aggression: 0.35, label: 'Attacking' },
  TransitionToAttack: { linePush: 0.04, compactness: 0.68, widthBias: 0.04, supportDepth: 0.02, aggression: 0.45, label: 'Transition to Attack' },
  TransitionToDefense: { linePush: -0.02, compactness: 0.78, widthBias: -0.03, supportDepth: -0.02, aggression: 0.76, label: 'Transition to Defense' },
  GoalKick: { linePush: 0.01, compactness: 0.58, widthBias: 0.06, supportDepth: 0.03, aggression: 0.2, label: 'Goal Kick' },
  CornerKick: { linePush: 0.05, compactness: 0.64, widthBias: 0.05, supportDepth: 0.04, aggression: 0.5, label: 'Corner Kick' },
  ThrowIn: { linePush: 0.02, compactness: 0.66, widthBias: 0.04, supportDepth: 0.02, aggression: 0.42, label: 'Throw In' },
  FreeKick: { linePush: 0.03, compactness: 0.67, widthBias: 0.03, supportDepth: 0.01, aggression: 0.38, label: 'Free Kick' },
};
