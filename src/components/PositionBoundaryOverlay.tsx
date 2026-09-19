import { POSITION_BOUNDARIES } from '../engine/positionBoundaries';
import type { PlayerPosition } from '../types/soccer';

type PositionBoundaryOverlayProps = {
  position: PlayerPosition;
};

const PositionBoundaryOverlay = ({ position }: PositionBoundaryOverlayProps) => {
  const boundary = POSITION_BOUNDARIES[position];
  const points = boundary.points.map((point) => `${point.x * 120},${point.y * 80}`).join(' ');
  const center = boundary.points.reduce(
    (acc, point) => ({ x: acc.x + point.x / boundary.points.length, y: acc.y + point.y / boundary.points.length }),
    { x: 0, y: 0 },
  );

  return (
    <g aria-label={`${position} boundary`}>
      <polygon
        points={points}
        fill="rgba(56, 189, 248, 0.14)"
        stroke="rgba(125, 211, 252, 0.95)"
        strokeWidth="1"
        strokeDasharray="3 2"
        strokeLinejoin="round"
      />
      <text
        x={center.x * 120}
        y={center.y * 80}
        fill="white"
        fontSize="3"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {boundary.label}
      </text>
    </g>
  );
};

export default PositionBoundaryOverlay;
