import type { KeyboardEvent, PointerEvent } from 'react';
import type { DragState, NormalizedPoint } from '../types/soccer';
import { toPercent } from '../utils/coordinates';

type DraggableBallProps = {
  ball: NormalizedPoint;
  dragState: DragState;
  onPointerDown: (event: PointerEvent<HTMLButtonElement>) => void;
  onPointerMove: (event: PointerEvent<HTMLButtonElement>) => void;
  onPointerUp: (event: PointerEvent<HTMLButtonElement>) => void;
  onPointerCancel: (event: PointerEvent<HTMLButtonElement>) => void;
  onLostPointerCapture: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
};

const DraggableBall = ({
  ball,
  dragState,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onLostPointerCapture,
  onKeyDown,
}: DraggableBallProps) => {
  const pos = toPercent(ball);

  return (
    <button
      type="button"
      aria-label="Soccer ball. Drag to move position or use arrow keys."
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onLostPointerCapture={onLostPointerCapture}
      onKeyDown={onKeyDown}
      className="absolute z-20 -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full border-0 bg-transparent p-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 active:cursor-grabbing"
      style={{ left: pos.left, top: pos.top, width: 44, height: 44, touchAction: 'none' }}
    >
      <span
        aria-hidden="true"
        className={`absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-slate-900 bg-white shadow-md ${
          dragState.isDragging ? 'ring-4 ring-cyan-300/50' : ''
        }`}
      />
    </button>
  );
};

export default DraggableBall;
