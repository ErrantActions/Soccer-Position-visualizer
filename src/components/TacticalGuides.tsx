import type { NormalizedPoint, PositioningResult } from '../types/soccer';

type TacticalGuidesProps = {
  ball: NormalizedPoint;
  positioning: PositioningResult;
};

const TacticalGuides = ({ ball, positioning }: TacticalGuidesProps) => {
  const player = positioning.idealPosition;

  return (
    <g aria-label="Tactical guides" pointerEvents="none">
      <rect x={8} y={28} width={26} height={24} fill="rgba(248, 113, 113, 0.14)" stroke="rgba(248, 113, 113, 0.65)" strokeDasharray="2 2" />
      <rect x={0} y={30} width={60} height={20} fill="rgba(148, 163, 184, 0.12)" stroke="rgba(148, 163, 184, 0.45)" strokeDasharray="4 3" />
      <line
        x1={60}
        y1={40}
        x2={ball.x * 120}
        y2={ball.y * 80}
        stroke="rgba(14, 165, 233, 0.8)"
        strokeWidth="1"
        markerEnd="url(#arrowhead)"
      />
      <line
        x1={ball.x * 120}
        y1={ball.y * 80}
        x2={player.x * 120}
        y2={player.y * 80}
        stroke="rgba(96, 165, 250, 0.95)"
        strokeWidth="1"
        markerEnd="url(#arrowhead)"
      />
      <defs>
        <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="4" refY="2" orient="auto">
          <polygon points="0 0, 4 2, 0 4" fill="rgba(125, 211, 252, 0.95)" />
        </marker>
      </defs>
    </g>
  );
};

export default TacticalGuides;
