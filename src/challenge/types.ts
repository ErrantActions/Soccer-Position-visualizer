import type { NormalizedPoint, PlayerPosition } from '../types/soccer';
import type { TacticalRole } from '../engine/tactical';

export type ChallengeCategory =
  | 'Defending'
  | 'Attacking'
  | 'Midfield Support'
  | 'Goal Kicks'
  | 'Corner Kicks'
  | 'Throw Ins';

export type Formation = '4-4-2';

export type Challenge = {
  id: string;
  category: ChallengeCategory;
  formation: Formation;
  playerRole: PlayerPosition;
  playerRoleLabel: string;
  ballPosition: NormalizedPoint;
  expectedPosition: NormalizedPoint;
  explanation: string;
  supportTeammate: PlayerPosition;
  supportPosition: NormalizedPoint;
};

export type ChallengeScoreBand = 'excellent' | 'great' | 'close' | 'try-again';

export type ChallengeScore = {
  points: number;
  message: string;
  colorClass: string;
  band: ChallengeScoreBand;
  distanceYards: number;
};

export type PlayerProfile = {
  name: string;
  favoritePosition: TacticalRole;
  age: number | '';
};

export type BadgeId = 'first-challenge-complete' | 'defensive-wall' | 'goal-side-master' | 'positioning-pro';

export type Badge = {
  id: BadgeId;
  label: string;
  icon: string;
  description: string;
};

export type ChallengeProgress = {
  totalScore: number;
  completedChallengeIds: string[];
  bestScores: Record<string, number>;
  goalSidePerfectChallengeIds: string[];
  badges: BadgeId[];
};
