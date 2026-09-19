import { useRef } from 'react';
import { useBallDrag } from '../hooks/useBallDrag';
import { useFieldDimensions } from '../hooks/useFieldDimensions';
import type { DisplaySettings, NormalizedPoint, PlayerPosition, PositioningResult } from '../types/soccer';
import DraggableBall from './DraggableBall';
import HeatmapCanvas from './HeatmapCanvas';
import PositionBoundaryOverlay from './PositionBoundaryOverlay';
import RecommendedPlayer from './RecommendedPlayer';
import TacticalGuides from './TacticalGuides';

type SoccerFieldProps = {
  ball: NormalizedPoint;
  onBallChange: (point: NormalizedPoint) => void;
  selectedPosition: PlayerPosition;
  positioning: PositioningResult;
  settings: DisplaySettings;
};

const SoccerField = ({ ball, onBallChange, selectedPosition, positioning, settings }: SoccerFieldProps) => {
  const fieldRef = useRef<HTMLDivElement>(null);
  const dimensions = useFieldDimensions(fieldRef);
  const drag = useBallDrag({ fieldRef, ball, onBallChange });

  return (
    <section className="h-full w-full">
      <div className="flex h-full w-full items-center justify-center">
        <div
          ref={fieldRef}
          className="relative h-auto w-full max-h-full max-w-full touch-none select-none overflow-hidden bg-[#0c4a2d] [aspect-ratio:3/2]"
        >
          <svg viewBox="0 0 120 80" className="absolute inset-0 h-full w-full" aria-label="Soccer field">
            <defs>
              <linearGradient id="fieldSurface" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#166534" />
                <stop offset="100%" stopColor="#15803d" />
              </linearGradient>
              <linearGradient id="stripeFill" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="rgba(255,255,255,0.02)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.08)" />
              </linearGradient>
              <radialGradient id="fieldGlow" cx="50%" cy="50%" r="65%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.12)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </radialGradient>
            </defs>
            <rect x="0" y="0" width="120" height="80" fill="#0f172a" />
            <rect x="1" y="1" width="118" height="78" fill="url(#fieldSurface)" stroke="#dcfce7" strokeWidth="0.8" rx="1.5" />
            {Array.from({ length: 6 }, (_, index) => (
              <rect
                key={index}
                x="1"
                y={1 + index * 13}
                width="118"
                height="6.5"
                fill={index % 2 === 0 ? 'rgba(255,255,255,0.04)' : 'url(#stripeFill)'}
              />
            ))}
            <rect x="1" y="1" width="118" height="78" fill="url(#fieldGlow)" />
            <line x1="60" y1="1" x2="60" y2="79" stroke="#dcfce7" strokeWidth="0.7" />
            <circle cx="60" cy="40" r="9" fill="none" stroke="#dcfce7" strokeWidth="0.7" />
            <circle cx="60" cy="40" r="0.7" fill="#dcfce7" />

            <rect x="1" y="22" width="18" height="36" fill="none" stroke="#dcfce7" strokeWidth="0.7" />
            <rect x="1" y="30" width="7" height="20" fill="none" stroke="#dcfce7" strokeWidth="0.7" />
            <circle cx="13" cy="40" r="0.7" fill="#dcfce7" />
            <path d="M 19 34 A 6 6 0 0 1 19 46" fill="none" stroke="#dcfce7" strokeWidth="0.7" />
            <rect x="0" y="34" width="1" height="12" fill="none" stroke="#dcfce7" strokeWidth="0.7" />

            <rect x="101" y="22" width="18" height="36" fill="none" stroke="#dcfce7" strokeWidth="0.7" />
            <rect x="112" y="30" width="7" height="20" fill="none" stroke="#dcfce7" strokeWidth="0.7" />
            <circle cx="107" cy="40" r="0.7" fill="#dcfce7" />
            <path d="M 101 34 A 6 6 0 0 0 101 46" fill="none" stroke="#dcfce7" strokeWidth="0.7" />
            <rect x="119" y="34" width="1" height="12" fill="none" stroke="#dcfce7" strokeWidth="0.7" />

            <path d="M 1 1 A 3 3 0 0 1 4 4" fill="none" stroke="#dcfce7" strokeWidth="0.7" />
            <path d="M 1 79 A 3 3 0 0 0 4 76" fill="none" stroke="#dcfce7" strokeWidth="0.7" />
            <path d="M 119 1 A 3 3 0 0 0 116 4" fill="none" stroke="#dcfce7" strokeWidth="0.7" />
            <path d="M 119 79 A 3 3 0 0 1 116 76" fill="none" stroke="#dcfce7" strokeWidth="0.7" />
            <rect x="-1.5" y="32" width="2.5" height="16" fill="rgba(226, 232, 240, 0.2)" stroke="#e2e8f0" strokeWidth="0.5" />
            <rect x="119" y="32" width="2.5" height="16" fill="rgba(226, 232, 240, 0.2)" stroke="#e2e8f0" strokeWidth="0.5" />

            {settings.showBoundaries ? <PositionBoundaryOverlay position={selectedPosition} /> : null}
            {settings.showGuides ? <TacticalGuides ball={ball} positioning={positioning} /> : null}
            {settings.showBallLine ? (
              <line
                x1={ball.x * 120}
                y1={ball.y * 80}
                x2={positioning.idealPosition.x * 120}
                y2={positioning.idealPosition.y * 80}
                stroke={positioning.shouldPressBall ? 'rgba(251, 113, 133, 0.9)' : 'rgba(226, 232, 240, 0.8)'}
                strokeDasharray={positioning.shouldPressBall ? '1.5 1.5' : '2 2'}
                strokeWidth="0.9"
              />
            ) : null}
          </svg>

          <HeatmapCanvas ball={ball} position={selectedPosition} dimensions={dimensions} visible={settings.showHeatmap} />
          <RecommendedPlayer position={selectedPosition} result={positioning} />
          <DraggableBall
            ball={ball}
            dragState={drag.dragState}
            onPointerDown={drag.handlePointerDown}
            onPointerMove={drag.handlePointerMove}
            onPointerUp={drag.handlePointerUp}
            onPointerCancel={drag.handlePointerCancel}
            onLostPointerCapture={drag.handleLostPointerCapture}
            onKeyDown={drag.handleKeyDown}
          />
        </div>
      </div>
    </section>
  );
};

export default SoccerField;
