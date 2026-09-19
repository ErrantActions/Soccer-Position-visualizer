import { useId } from 'react';
import type { NormalizedPoint, PositioningResult } from '../types/soccer';

type TacticalGuidesProps = {
  ball: NormalizedPoint;
  positioning: PositioningResult;
};

const DEFENDED_DANGER_ZONE = { x: 8, y: 28, width: 26, height: 24 };
const CENTRAL_PROTECTION_CHANNEL = { x: 0, y: 30, width: 60, height: 20 };

const TacticalGuides = ({ ball, positioning }: TacticalGuidesProps) => {
  const player = positioning.idealPosition;
  const markerId = useId();

  return (
    <g aria-label="Tactical guides" pointerEvents="none">
      <rect
        x={DEFENDED_DANGER_ZONE.x}
        y={DEFENDED_DANGER_ZONE.y}
        width={DEFENDED_DANGER_ZONE.width}
        height={DEFENDED_DANGER_ZONE.height}
        fill="rgba(248, 113, 113, 0.14)"
        stroke="rgba(248, 113, 113, 0.65)"
        strokeDasharray="2 2"
      />
      <rect
        x={CENTRAL_PROTECTION_CHANNEL.x}
        y={CENTRAL_PROTECTION_CHANNEL.y}
        width={CENTRAL_PROTECTION_CHANNEL.width}
        height={CENTRAL_PROTECTION_CHANNEL.height}
        fill="rgba(148, 163, 184, 0.12)"
        stroke="rgba(148, 163, 184, 0.45)"
        strokeDasharray="4 3"
      />
      <line
        x1={60}
        y1={40}
        x2={ball.x * 120}
        y2={ball.y * 80}
        stroke="rgba(14, 165, 233, 0.8)"
        strokeWidth="1"
        markerEnd={`url(#${markerId})`}
      />
      <line
        x1={ball.x * 120}
        y1={ball.y * 80}
        x2={player.x * 120}
        y2={player.y * 80}
        stroke={positioning.shouldPressBall ? 'rgba(251, 113, 133, 0.95)' : 'rgba(96, 165, 250, 0.95)'}
        strokeDasharray={positioning.shouldPressBall ? '1.5 1.5' : undefined}
        strokeWidth={positioning.shouldPressBall ? '1.3' : '1'}
        markerEnd={`url(#${markerId})`}
      />
      {positioning.shouldPressBall ? (
        <g>
          <circle cx={ball.x * 120} cy={ball.y * 80} r="3.2" fill="rgba(251, 113, 133, 0.16)" />
          <circle cx={ball.x * 120} cy={ball.y * 80} r="1.6" fill="rgba(251, 113, 133, 0.9)" />
        </g>
      ) : null}
      <defs>
        <marker id={markerId} markerWidth="6" markerHeight="6" refX="4" refY="2" orient="auto">
          <polygon points="0 0, 4 2, 0 4" fill="rgba(125, 211, 252, 0.95)" />
        </marker>
      </defs>
    </g>
  );
};

export default TacticalGuides;
