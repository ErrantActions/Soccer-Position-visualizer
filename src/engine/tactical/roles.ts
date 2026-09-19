import type { ActivePlayer, RoleBehaviorProfile, TacticalRole } from './types';

export const ROLE_ORDER: TacticalRole[] = ['GK', 'LB', 'LCB', 'RCB', 'RB', 'LM', 'CDM', 'LCM', 'RCM', 'RM', 'ST'];

export const ROLE_LABELS: Record<TacticalRole, string> = {
  GK: 'Goalkeeper',
  LB: 'Left Outside Back',
  LCB: 'Left Center Back',
  RCB: 'Right Center Back',
  RB: 'Right Outside Back',
  CDM: 'Defensive Midfielder',
  LCM: 'Left Central Midfielder',
  RCM: 'Right Central Midfielder',
  LM: 'Left Wide Midfielder',
  RM: 'Right Wide Midfielder',
  ST: 'Striker',
};

export const ROLE_BEHAVIOR_PROFILES: Record<TacticalRole, RoleBehaviorProfile> = {
  GK: {
    role: 'GK', family: 'Goalkeeper', line: 'goalkeeper', side: 'center', anchor: { x: 0.08, y: 0.5 }, widthRange: [0.38, 0.62], depthRange: [0.03, 0.18],
    pressureBias: 0.05, goalSideInfluence: 0.16, dangerInfluence: 0.42, supportInfluence: 0.25, compactnessInfluence: 0.22, widthInfluence: 0.08,
    explanationPriorities: ['protect-goal', 'maintain-shape', 'support-teammate'],
  },
  LB: {
    role: 'LB', family: 'OutsideBack', line: 'back', side: 'left', anchor: { x: 0.28, y: 0.14 }, widthRange: [0.05, 0.32], depthRange: [0.1, 0.62],
    pressureBias: 0.72, goalSideInfluence: 0.35, dangerInfluence: 0.18, supportInfluence: 0.13, compactnessInfluence: 0.19, widthInfluence: 0.15,
    explanationPriorities: ['stay-goal-side', 'maintain-width', 'cover-danger-space', 'support-teammate'],
  },
  LCB: {
    role: 'LCB', family: 'CenterBack', line: 'back', side: 'left', anchor: { x: 0.24, y: 0.4 }, widthRange: [0.2, 0.5], depthRange: [0.06, 0.56],
    pressureBias: 0.64, goalSideInfluence: 0.4, dangerInfluence: 0.22, supportInfluence: 0.08, compactnessInfluence: 0.2, widthInfluence: 0.1,
    explanationPriorities: ['protect-goal', 'stay-goal-side', 'protect-central-area', 'support-teammate'],
  },
  RCB: {
    role: 'RCB', family: 'CenterBack', line: 'back', side: 'right', anchor: { x: 0.24, y: 0.6 }, widthRange: [0.5, 0.8], depthRange: [0.06, 0.56],
    pressureBias: 0.64, goalSideInfluence: 0.4, dangerInfluence: 0.22, supportInfluence: 0.08, compactnessInfluence: 0.2, widthInfluence: 0.1,
    explanationPriorities: ['protect-goal', 'stay-goal-side', 'protect-central-area', 'support-teammate'],
  },
  RB: {
    role: 'RB', family: 'OutsideBack', line: 'back', side: 'right', anchor: { x: 0.28, y: 0.86 }, widthRange: [0.68, 0.95], depthRange: [0.1, 0.62],
    pressureBias: 0.72, goalSideInfluence: 0.35, dangerInfluence: 0.18, supportInfluence: 0.13, compactnessInfluence: 0.19, widthInfluence: 0.15,
    explanationPriorities: ['stay-goal-side', 'maintain-width', 'cover-danger-space', 'support-teammate'],
  },
  CDM: {
    role: 'CDM', family: 'DefensiveMidfielder', line: 'midfield', side: 'center', anchor: { x: 0.42, y: 0.5 }, widthRange: [0.3, 0.7], depthRange: [0.2, 0.72],
    pressureBias: 0.58, goalSideInfluence: 0.3, dangerInfluence: 0.24, supportInfluence: 0.14, compactnessInfluence: 0.18, widthInfluence: 0.08,
    explanationPriorities: ['protect-central-area', 'passing-lane-denial', 'support-teammate', 'maintain-shape'],
  },
  LCM: {
    role: 'LCM', family: 'CentralMidfielder', line: 'midfield', side: 'left', anchor: { x: 0.5, y: 0.42 }, widthRange: [0.28, 0.58], depthRange: [0.24, 0.82],
    pressureBias: 0.52, goalSideInfluence: 0.18, dangerInfluence: 0.14, supportInfluence: 0.24, compactnessInfluence: 0.16, widthInfluence: 0.12,
    explanationPriorities: ['support-teammate', 'create-triangle', 'maintain-shape', 'protect-central-area'],
  },
  RCM: {
    role: 'RCM', family: 'CentralMidfielder', line: 'midfield', side: 'right', anchor: { x: 0.5, y: 0.58 }, widthRange: [0.42, 0.72], depthRange: [0.24, 0.82],
    pressureBias: 0.52, goalSideInfluence: 0.18, dangerInfluence: 0.14, supportInfluence: 0.24, compactnessInfluence: 0.16, widthInfluence: 0.12,
    explanationPriorities: ['support-teammate', 'create-triangle', 'maintain-shape', 'protect-central-area'],
  },
  LM: {
    role: 'LM', family: 'WideMidfielder', line: 'midfield', side: 'left', anchor: { x: 0.54, y: 0.14 }, widthRange: [0.03, 0.32], depthRange: [0.28, 0.88],
    pressureBias: 0.5, goalSideInfluence: 0.12, dangerInfluence: 0.1, supportInfluence: 0.22, compactnessInfluence: 0.12, widthInfluence: 0.22,
    explanationPriorities: ['maintain-width', 'support-teammate', 'create-triangle', 'weak-side-tuck'],
  },
  RM: {
    role: 'RM', family: 'WideMidfielder', line: 'midfield', side: 'right', anchor: { x: 0.54, y: 0.86 }, widthRange: [0.68, 0.97], depthRange: [0.28, 0.88],
    pressureBias: 0.5, goalSideInfluence: 0.12, dangerInfluence: 0.1, supportInfluence: 0.22, compactnessInfluence: 0.12, widthInfluence: 0.22,
    explanationPriorities: ['maintain-width', 'support-teammate', 'create-triangle', 'weak-side-tuck'],
  },
  ST: {
    role: 'ST', family: 'Striker', line: 'forward', side: 'center', anchor: { x: 0.76, y: 0.5 }, widthRange: [0.33, 0.67], depthRange: [0.46, 0.96],
    pressureBias: 0.44, goalSideInfluence: 0.06, dangerInfluence: 0.12, supportInfluence: 0.28, compactnessInfluence: 0.08, widthInfluence: 0.08,
    explanationPriorities: ['maintain-depth', 'support-teammate', 'create-triangle', 'pressure-ball'],
  },
};

export const createDefaultPlayers = (): ActivePlayer[] =>
  ROLE_ORDER.map((role) => {
    const profile = ROLE_BEHAVIOR_PROFILES[role];
    return {
      id: role,
      role,
      family: profile.family,
      line: profile.line,
      side: profile.side,
      active: true,
    };
  });
