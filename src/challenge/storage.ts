import type { Badge, BadgeId, ChallengeProgress, PlayerProfile } from './types';
import type { PlayerPosition } from '../types/soccer';

const PROFILE_KEY = 'soccer-positioning.profile.v1';
const PROGRESS_KEY = 'soccer-positioning.progress.v1';

export const BADGES: Badge[] = [
  {
    id: 'first-challenge-complete',
    icon: '🏆',
    label: 'First Challenge Complete',
    description: 'Complete your first challenge.',
  },
  {
    id: 'defensive-wall',
    icon: '🏆',
    label: 'Defensive Wall',
    description: 'Score at least 80 points in 3 different challenges.',
  },
  {
    id: 'goal-side-master',
    icon: '🏆',
    label: 'Goal Side Master',
    description: 'Get 100 points while staying goal side in 3 challenges.',
  },
  {
    id: 'positioning-pro',
    icon: '🏆',
    label: 'Positioning Pro',
    description: 'Reach a total score of 400 points.',
  },
];

export const createDefaultProfile = (): PlayerProfile => ({
  name: '',
  favoritePosition: 'LB',
  age: '',
});

export const createDefaultProgress = (): ChallengeProgress => ({
  totalScore: 0,
  completedChallengeIds: [],
  bestScores: {},
  goalSidePerfectChallengeIds: [],
  badges: [],
});

const isPlayerPosition = (value: unknown): value is PlayerPosition =>
  value === 'LB' || value === 'LCB' || value === 'RCB' || value === 'RB' || value === 'CDM';

export const loadProfile = (): PlayerProfile => {
  let raw: string | null = null;

  try {
    raw = localStorage.getItem(PROFILE_KEY);
  } catch {
    return createDefaultProfile();
  }

  if (!raw) {
    return createDefaultProfile();
  }

  try {
    const parsed = JSON.parse(raw) as Partial<PlayerProfile>;
    return {
      name: typeof parsed.name === 'string' ? parsed.name : '',
      favoritePosition: isPlayerPosition(parsed.favoritePosition) ? parsed.favoritePosition : 'LB',
      age: typeof parsed.age === 'number' || parsed.age === '' ? parsed.age : '',
    };
  } catch {
    return createDefaultProfile();
  }
};

export const saveProfile = (profile: PlayerProfile): void => {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // ignore storage failures so gameplay continues
  }
};

export const loadProgress = (): ChallengeProgress => {
  let raw: string | null = null;

  try {
    raw = localStorage.getItem(PROGRESS_KEY);
  } catch {
    return createDefaultProgress();
  }

  if (!raw) {
    return createDefaultProgress();
  }

  try {
    const parsed = JSON.parse(raw) as Partial<ChallengeProgress>;
    return {
      totalScore: typeof parsed.totalScore === 'number' ? parsed.totalScore : 0,
      completedChallengeIds: Array.isArray(parsed.completedChallengeIds)
        ? parsed.completedChallengeIds.filter((id): id is string => typeof id === 'string')
        : [],
      bestScores:
        parsed.bestScores && typeof parsed.bestScores === 'object'
          ? (Object.fromEntries(
              Object.entries(parsed.bestScores as Record<string, unknown>).filter(
                ([challengeId, score]) => typeof challengeId === 'string' && typeof score === 'number',
              ),
            ) as Record<string, number>)
          : {},
      goalSidePerfectChallengeIds: Array.isArray(parsed.goalSidePerfectChallengeIds)
        ? parsed.goalSidePerfectChallengeIds.filter((id): id is string => typeof id === 'string')
        : [],
      badges: Array.isArray(parsed.badges)
        ? parsed.badges.filter(
            (badge): badge is BadgeId =>
              badge === 'first-challenge-complete' ||
              badge === 'defensive-wall' ||
              badge === 'goal-side-master' ||
              badge === 'positioning-pro',
          )
        : [],
    };
  } catch {
    return createDefaultProgress();
  }
};

export const saveProgress = (progress: ChallengeProgress): void => {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    // ignore storage failures so gameplay continues
  }
};
