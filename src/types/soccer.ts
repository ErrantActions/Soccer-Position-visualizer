export type NormalizedPoint = {
  x: number;
  y: number;
};

export type PlayerPosition = 'LB' | 'LCB' | 'RCB' | 'RB' | 'CDM';

export type PositionBoundary = {
  position: PlayerPosition;
  points: NormalizedPoint[];
  label: string;
};

export type PositioningInput = {
  ball: NormalizedPoint;
  position: PlayerPosition;
};

export type PositioningResult = {
  idealPosition: NormalizedPoint;
  confidence: number;
  acceptableRadius: number;
  isOutsideNormalBoundary: boolean;
  shouldPressBall: boolean;
  coachingCue: string;
};

export type HeatmapCell = {
  x: number;
  y: number;
  score: number;
};

export type FieldDimensions = {
  width: number;
  height: number;
  dpr: number;
};

export type DragState = {
  isDragging: boolean;
  pointerId: number | null;
};

export type DisplaySettings = {
  showHeatmap: boolean;
  showBoundaries: boolean;
  showGuides: boolean;
  showBallLine: boolean;
};
