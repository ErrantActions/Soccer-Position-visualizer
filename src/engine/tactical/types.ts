import type { NormalizedPoint } from '../../types/soccer';

export const TacticalState = {
  Defending: 'Defending',
  Attacking: 'Attacking',
  TransitionToAttack: 'TransitionToAttack',
  TransitionToDefense: 'TransitionToDefense',
  GoalKick: 'GoalKick',
  CornerKick: 'CornerKick',
  ThrowIn: 'ThrowIn',
  FreeKick: 'FreeKick',
} as const;

export type TacticalState = (typeof TacticalState)[keyof typeof TacticalState];
export type LearningMode = 'child' | 'standard' | 'advanced';
export type SideAffinity = 'left' | 'center' | 'right';
export type UnitLine = 'goalkeeper' | 'back' | 'midfield' | 'forward';
export type BallCarrierTeam = 'own' | 'opponent';
export type TacticalRoleFamily =
  | 'Goalkeeper'
  | 'OutsideBack'
  | 'CenterBack'
  | 'DefensiveMidfielder'
  | 'CentralMidfielder'
  | 'WideMidfielder'
  | 'Striker';

export type TacticalRole =
  | 'GK'
  | 'LB'
  | 'LCB'
  | 'RCB'
  | 'RB'
  | 'CDM'
  | 'LCM'
  | 'RCM'
  | 'LM'
  | 'RM'
  | 'ST';

export type TacticalThird = 'defensive' | 'middle' | 'attacking';
export type TacticalChannel = 'leftWing' | 'leftHalfSpace' | 'centralChannel' | 'rightHalfSpace' | 'rightWing';

export type TacticalZone = {
  third: TacticalThird;
  channel: TacticalChannel;
  inPenaltyBox: boolean;
  inFrontOfGoal: boolean;
  inWeakSideCorridor: boolean;
  inCrossingLane: boolean;
  inHalfSpaceEntryLane: boolean;
};

export type TeamShapeConfig = {
  formationLabel: string;
  orientation: 'leftToRight';
  activePlayers: ActivePlayer[];
  stylePreset: 'balanced';
  lineHeights?: Partial<Record<UnitLine, number>>;
};

export type ActivePlayer = {
  id: string;
  role: TacticalRole;
  family: TacticalRoleFamily;
  line: UnitLine;
  side: SideAffinity;
  active: boolean;
};

export type TacticalContext = {
  ball: NormalizedPoint;
  ballCarrierTeam: BallCarrierTeam;
  tacticalState: TacticalState;
  learningMode: LearningMode;
  restartSide?: SideAffinity | 'center';
  selectedRole?: TacticalRole;
};

export type RoleBehaviorProfile = {
  role: TacticalRole;
  family: TacticalRoleFamily;
  line: UnitLine;
  side: SideAffinity;
  anchor: NormalizedPoint;
  widthRange: [number, number];
  depthRange: [number, number];
  pressureBias: number;
  goalSideInfluence: number;
  dangerInfluence: number;
  supportInfluence: number;
  compactnessInfluence: number;
  widthInfluence: number;
  explanationPriorities: ExplanationTag[];
};

export type ExplanationTag =
  | 'protect-goal'
  | 'stay-goal-side'
  | 'protect-central-area'
  | 'maintain-shape'
  | 'support-teammate'
  | 'create-triangle'
  | 'cover-danger-space'
  | 'pressure-ball'
  | 'maintain-width'
  | 'maintain-depth'
  | 'weak-side-tuck'
  | 'passing-lane-denial';

export type PositionInfluence = {
  id:
    | 'formationAnchor'
    | 'stateModifier'
    | 'goalSidePosition'
    | 'dangerZoneCoverage'
    | 'passingLaneCoverage'
    | 'responsibility'
    | 'weakSideAwareness'
    | 'supportPosition'
    | 'teamCompactness'
    | 'widthDepthCorrection';
  label: string;
  target: NormalizedPoint;
  weight: number;
  reasonTags: ExplanationTag[];
};

export type ExplanationReason = {
  primary: string;
  secondary: string;
  suppressed: string[];
  childFriendly: string;
  tags: ExplanationTag[];
};

export type ResponsibilityRole = 'pressure' | 'cover' | 'balance' | 'shape';

export type PassingLane = {
  from: NormalizedPoint;
  to: NormalizedPoint;
  danger: number;
};

export type SupportTriangle = {
  playerIds: [string, string, string];
};

export type DefensiveCone = {
  apex: NormalizedPoint;
  left: NormalizedPoint;
  right: NormalizedPoint;
};

export type VisualizationOverlayModel = {
  goalSideSegment: { from: NormalizedPoint; to: NormalizedPoint };
  defensiveCone: DefensiveCone;
  weakSideShade: { x: number; y: number; width: number; height: number } | null;
};

export type LineSpacingDiagnostics = {
  verticalCompactness: number;
  horizontalCompactness: number;
  lineDepths: Record<UnitLine, number>;
};

export type DangerCell = {
  x: number;
  y: number;
  score: number;
};

export type PlayerTacticalResult = {
  player: ActivePlayer;
  roleProfile: RoleBehaviorProfile;
  zone: TacticalZone;
  formationAnchor: NormalizedPoint;
  finalPosition: NormalizedPoint;
  influences: PositionInfluence[];
  responsibility: ResponsibilityRole;
  goalSideScore: number;
  shapeScore: number;
  supportScore: number;
  dangerCoverageScore: number;
  positioningScore: number;
  explanation: ExplanationReason;
  overlays: VisualizationOverlayModel;
};

export type TeamTacticalResult = {
  players: PlayerTacticalResult[];
  compactness: LineSpacingDiagnostics;
  supportTriangles: SupportTriangle[];
  passingLanes: PassingLane[];
  dangerMap: DangerCell[];
  selectedRole?: TacticalRole;
  tacticalState: TacticalState;
  learningMode: LearningMode;
};

export type ChallengeScenario = {
  id: string;
  title: string;
  prompt: string;
  role: TacticalRole;
  expectedPosition: NormalizedPoint;
  supportTeammateId?: string;
};

export type ChallengeEvaluationResult = {
  goalSideScore: number;
  shapeScore: number;
  supportScore: number;
  dangerCoverageScore: number;
  positioningScore: number;
  feedback: string;
  distanceYards: number;
};
