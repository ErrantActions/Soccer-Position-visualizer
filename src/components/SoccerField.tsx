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
    <section className="rounded-xl bg-slate-900/85 p-2 shadow-lg ring-1 ring-white/10">
      <div
        ref={fieldRef}
        className="relative mx-auto w-full max-w-5xl touch-none select-none overflow-hidden rounded-lg bg-emerald-700/90"
        style={{ aspectRatio: '3 / 2' }}
      >
        <svg viewBox="0 0 120 80" className="absolute inset-0 h-full w-full" aria-label="Soccer field">
          <rect x="1" y="1" width="118" height="78" fill="#15803d" stroke="#dcfce7" strokeWidth="0.8" />
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

          {settings.showBoundaries ? <PositionBoundaryOverlay position={selectedPosition} /> : null}
          {settings.showGuides ? <TacticalGuides ball={ball} positioning={positioning} /> : null}
          {settings.showBallLine ? (
            <line
              x1={ball.x * 120}
              y1={ball.y * 80}
              x2={positioning.idealPosition.x * 120}
              y2={positioning.idealPosition.y * 80}
              stroke="rgba(226, 232, 240, 0.8)"
              strokeDasharray="2 2"
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
    </section>
  );
};

export default SoccerField;
